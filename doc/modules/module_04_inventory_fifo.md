# Modul 4: Inventaris, Buku Besar Stok & HPP FIFO

Dokumen ini menjelaskan arsitektur teknis, logika valuasi First-In First-Out (FIFO), pelacakan mutasi inventaris (*Stock Ledger*), dan mekanisme toleransi stok pada sistem POS Enterprise.

---

## 1. Ikhtisar & Tujuan Bisnis (Overview)

Manajemen inventaris pada ritel modern memerlukan pelacakan modal yang presisi untuk menghitung margin laba kotor riil. Fluktuasi harga beli dari supplier menyebabkan barang dengan barcode yang sama dapat memiliki harga modal (*Cost of Goods Sold / COGS*) yang berbeda-beda antar periode penerimaan.

Modul ini mengimplementasikan:
- **Engine Valuasi HPP FIFO:** Barang yang masuk lebih awal diasumsikan terjual lebih awal sehingga pembebanan modal transaksi kasir selalu akurat sesuai harga batch penerimaan historis.
- **Buku Besar Mutasi Stok (*Stock Ledger*):** Pencatatan riwayat audit setiap perubahan stok (Restok, Retur, Rusak, Kehilangan, dan Penyesuaian Opname).
- **Toleransi Stok Minus:** Memungkinkan kasir frontline tetap melayani penjualan fisik meski stok sistem belum sempat di-update oleh tim gudang.
- **Audit Batch Masuk:** Setiap penerimaan barang baru secara otomatis membentuk entitas batch (`StockBatch`) tersendiri dengan kuantitas awal, sisa kuantitas, dan tanggal kedatangan.

---

## 2. Diagram Alur Valuasi HPP FIFO (FIFO Stock Lifecycle)

```mermaid
flowchart TD
    Supplier["Penerimaan Barang Supplier\n(Restok Manual / Surat Jalan)"] --> IngestBatch["Catat Batch Baru (StockBatch)\n- purchaseCost\n- initialQty = remainingQty\n- receivedAt"]
    IngestBatch --> StockPool[("Pool Batch FIFO Produk")]

    CashierSale["Transaksi Penjualan Kasir\n(Scan Barcode: Qty N)"] --> DeductAlgo{"Algoritma FIFO\n(deductFifoStock)"}

    StockPool -->|Batch Tertua remainingQty > 0| DeductAlgo
    DeductAlgo -->|Ambil take = min(remainingQty, remainingToDeduct)| DeductAlgo
    DeductAlgo -->|Jika remainingQty habis, lanjut ke Batch Berikutnya| DeductAlgo
    DeductAlgo -->|Jika Batch Habis & Masih Kurang (Stok Minus)| FallbackCost["Pakai Fallback Cost\n(product.costPrice)"]

    DeductAlgo --> CalcCOGS["Hitung Total COGS\ntotalItemCost += take * batch.purchaseCost"]
    FallbackCost --> CalcCOGS
    CalcCOGS --> ProfitCalc["Hitung Laba Kotor Riil\nGross Profit = Gross Amount - Total COGS"]
    ProfitCalc --> TxRecord["Simpan TransactionRecord & Update Sisa Batch"]
```

---

## 3. Tipe-Tipe Mutasi Stok (*StockMovementType*)

Setiap mutasi stok diidentifikasi oleh tipe pergerakan baku dalam antarmuka `StockLedgerView.tsx`:

| Tipe Mutasi | Kode Enum | Dampak Stok | Keterangan & Kasus Penggunaan |
| :--- | :--- | :--- | :--- |
| **Barang Masuk** | `IN` | Bertambah ($+$) | Penerimaan barang dari supplier. **Wajib mencatat `purchaseCost`** untuk membentuk `StockBatch` baru. |
| **Barang Keluar** | `OUT` | Berkurang ($-$) | Pengeluaran barang manual di luar penjualan kasir (misal: konsinyasi atau transfer cabang). |
| **Penyesuaian Opname** | `ADJUSTMENT` | Koreksi | Penyesuaian angka stok sistem agar sesuai dengan hasil hitungan fisik (*stock opname*). |
| **Retur Konsumen** | `RETURN` | Bertambah ($+$) | Konsumen menukar atau mengembalikan barang layak jual ke toko melalui mode retur kasir (`F7`). |
| **Barang Rusak** | `OUT_DAMAGED`| Berkurang ($-$) | Pemusnahan produk cacat produksi, kemasan rusak, atau kedaluwarsa. |
| **Penyusutan / Hilang**| `OUT_LOST` | Berkurang ($-$) | Pencatatan barang hilang (*shrinkage*) akibat *shoplifting* atau selisih tak terlacak. |

---

## 4. Algoritma Pemotongan Stok FIFO (`deductFifoStock`)

Logika pemotongan stok beroperasi secara rekursif/iteratif menelusuri tumpukan batch tertua:

```typescript
const deductFifoStock = (barcode: string, qtyToDeduct: number, fallbackCost: number): number => {
  let remainingToDeduct = qtyToDeduct;
  let totalItemCost = 0;
  const updatedBatches = [...stockBatches];

  // 1. Telusuri batch secara berurutan (Batch Masuk Terdahulu / Oldest First)
  for (let i = 0; i < updatedBatches.length; i++) {
    const batch = updatedBatches[i];
    if (batch.barcode === barcode && batch.remainingQty > 0) {
      const take = Math.min(batch.remainingQty, remainingToDeduct);
      batch.remainingQty -= take;
      totalItemCost += take * batch.purchaseCost;
      remainingToDeduct -= take;
      if (remainingToDeduct === 0) break;
    }
  }

  // 2. Toleransi Stok Minus / Fallback: Jika batch habis namun penjualan tetap terjadi
  if (remainingToDeduct > 0) {
    totalItemCost += remainingToDeduct * fallbackCost;
  }

  setStockBatches(updatedBatches);
  return totalItemCost;
};
```

---

## 5. Struktur Data & Kontrak Tipe TypeScript

### A. Entitas Batch Modal (`StockBatch`)
```typescript
export interface StockBatch {
  id: string;            // Contoh: "BATCH-01", "BATCH-1729"
  barcode: string;       // Barcode / SKU produk terkait
  purchaseCost: number;  // Harga modal beli per unit saat penerimaan (HPP)
  initialQty: number;    // Jumlah unit yang diterima saat restok
  remainingQty: number;  // Sisa unit yang belum terpotong transaksi
  receivedAt: string;    // Tanggal masuk (Format: YYYY-MM-DD atau lokal)
}
```

### B. Entitas Log Mutasi Buku Besar (`StockMovement`)
```typescript
export interface StockMovement {
  id: string;                    // ID mutasi, misal: "MOV-4821"
  timestamp: string;             // Tanggal dan waktu mutasi
  barcode: string;               // Barcode produk
  productName: string;           // Nama barang saat mutasi dicatat
  type: StockMovementType;       // IN | OUT | ADJUSTMENT | RETURN | OUT_DAMAGED | OUT_LOST
  quantity: number;              // Jumlah unit mutasi
  purchaseCost?: number;         // Harga beli satuan (khusus tipe IN)
  reason: string;                // Alasan mutasi (Supplier, Rusak, Opname, dll.)
  recordedBy: string;            // Nama staf / supervisor yang melakukan input
}
```

---

## 6. Fitur Antarmuka Buku Besar (`StockLedgerView.tsx`)

1. **Penyaringan Rentang Tanggal Cerdas (`isDateInRange`):**
   - Mendukung format tanggal ISO (`YYYY-MM-DD`) maupun format Indonesia (`DD/MM/YYYY`).
   - Memfilter ratusan baris mutasi secara instan di sisi klien.
2. **Paginasi Data:**
   - Navigasi tabel mutasi stok dengan pilihan ukuran halaman fleksibel (10, 25, 50 entri).
3. **Modal Form Restok & Mutasi Cepat:**
   - Pilihan barcode produk terintegrasi dengan katalog master.
   - Kolom dinamis: input harga modal (`purchaseCost`) hanya wajib diisi saat memilih tipe **Barang Masuk (`IN`)**.
   - Validasi batas kuantitas positif ($> 0$).
4. **Pembaruan Stok Reaktif:**
   - Memanggil `adjustStockLocal(barcode, newStock)` di store Zustand untuk menyinkronkan angka stok ke terminal kasir POS secara instan tanpa perlu memuat ulang (*refresh*) halaman browser.

---

## 7. Indeks Berkas Sumber (Source Code References)

- Frontend Kartu Stok View: [`pos-frontend/src/features/products/StockLedgerView.tsx`](file:///D:/project/pos-enterprise/pos-frontend/src/features/products/StockLedgerView.tsx)
- Frontend Algoritma FIFO & Mutasi Stok: [`pos-frontend/src/App.tsx#L250-L274`](file:///D:/project/pos-enterprise/pos-frontend/src/App.tsx#L250-L274) dan [`#L358-L395`](file:///D:/project/pos-enterprise/pos-frontend/src/App.tsx#L358-L395)
- Frontend Store Sinkronisasi Stok: [`pos-frontend/src/stores/useProductStore.ts`](file:///D:/project/pos-enterprise/pos-frontend/src/stores/useProductStore.ts)
- Definisi Tipe Inventaris: [`pos-frontend/src/types/index.ts`](file:///D:/project/pos-enterprise/pos-frontend/src/types/index.ts)
- Data Awal Batch & Mutasi: [`pos-frontend/src/data/initialData.ts`](file:///D:/project/pos-enterprise/pos-frontend/src/data/initialData.ts)
