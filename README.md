# Dokumentasi Sistem Enterprise POS — Ritel Serba Rp35.000

Dokumen komprehensif ini merangkum seluruh arsitektur teknis, logika bisnis, keamanan, dan inventarisasi fitur yang telah selesai diimplementasikan pada sistem Point of Sale (POS) ritel.

---

## 1. Ikhtisar Sistem (System Overview)
Sistem POS ini dirancang khusus untuk operasional ritel dengan konsep harga paten seragam (serba Rp35.000). Aplikasi mengintegrasikan terminal kasir cepat (*scanner & keyboard-first*), kalkulasi HPP otomatis berbasis metode **FIFO**, kepatuhan pajak PPN 11% (*item-level rounding*), akuntabilitas laci kasir (*anti-fraud*), rekonsiliasi non-tunai (MDR fee), kendali hak akses dinamis (*Role-Based Access Control*), serta audit trail terpusat untuk setiap mutasi data[cite: 2].

---

## 2. Arsitektur & Tumpukan Teknologi (Tech Stack)
* **Frontend Framework:** React 18/19 (TypeScript dengan penegakan ketat `verbatimModuleSyntax`)[cite: 1].
* **Styling & Desain:** Tailwind CSS v4.
* **Ikonografi:** Lucide React.
* **Penyimpanan State:** Client-side in-memory state engine dengan riwayat snapshot independen[cite: 2].
* **Struktur Folder Modular (*Domain-Driven Design*):**
  * `src/features/auth/`: Layar otorisasi login shift dan virtual keypad PIN.
  * `src/features/pos/`: Terminal kasir ritel, shortcut keyboard, modal bayar, dan cetak struk thermal.
  * `src/features/dashboard/`: Analisis tren grafik penjualan, kerugian susut gudang, dan widget produk terlaris.
  * `src/features/products/`: Master katalog barang, edit SKU manual, riwayat audit per-produk, dan kartu stok FIFO.
  * `src/features/reports/`: Settlement finansial, rekonsiliasi MDR, petty cash, dan ekspor CSV.
  * `src/features/audit/`: Audit trail global terintegrasi lintas modul.
  * `src/features/users/`: Manajemen karyawan, peran kustom, dan matriks hak akses.
  * `src/features/settings/`: Konfigurasi gerbang jalur pembayaran toko.
  * `src/components/ui/`: Komponen reusable (*Pagination*, *DateRangeFilter*).
  * `src/utils/`: Utilitas ekspor data CSV (*client-side download*).
  * `src/types/`: Kontrak antarmuka data global (`src/types/index.ts`).

---

## 3. Rincian Fitur yang Telah Diimplementasikan

### A. Autentikasi, Sesi & Kontrol Akses (RBAC)
* **Layar Login PIN Virtual:** Kasir/staf masuk shift menggunakan nomor PIN 4-digit dengan dukungan keypad virtual maupun keyboard fisik.
* **Default Akun Pengujian:**
  * **Fadhil (Owner):** PIN `9999` (Akses penuh tanpa batas).
  * **Agus Supervisor (Supervisor):** PIN `1234` (Otorisasi void, edit barang, mutasi stok, laporan).
  * **Budi Santoso (Kasir):** PIN `1111` (Khusus transaksi POS dan petty cash laci).
* **Sidebar Dinamis & Route Guard:** Navigasi sidebar hanya merender menu yang diizinkan untuk peran yang sedang aktif. Akses ilegal via manipulasi state diblokir dengan tampilan peringatan **Akses Ditolak (*Access Denied*)**.
* **Simulasi Ganti Akun & Tombol Logout:** Fitur alih akun instan (*switch user*) pada bilah samping serta tombol logout di header dan sidebar yang langsung merekam jejak aktivitas ke audit log.
* **Matriks Hak Akses Granular:** Pemilik toko dapat membuat role kustom baru dan mengatur izin akses spesifik (seperti izin `edit_products`, `void_transaction`, `manage_stock`, dll.) menggunakan antarmuka kotak centang.

---

### B. Terminal Kasir (POS Terminal) & Operasional Meja Kasir
* **Barcode Scanner-First:** Pemindaian instan dengan kalkulasi otomatis kelipatan harga paten Rp35.000 per barang.
* **Keyboard-First Navigation (Operasional Tanpa Mouse):**[cite: 2]
  * `F1`: Pembayaran Tunai (*Cash*).
  * `F2`: Pembayaran Non-Tunai (*QRIS / EDC*).
  * `F4`: Parkir Transaksi (*Hold / Park Order*)[cite: 2].
  * `F6`: Akses Kas Laci Operasional (*Petty Cash*).
  * `F7`: Mode Tukar / Retur Barang (*Exchange Mode*).
  * `F8`: Pembatalan Transaksi Keranjang (*Void* dengan PIN Supervisor)[cite: 2].
  * `F9`: Tutup Shift Kasir (*Blind Cash-Drawer Closing*)[cite: 2].
  * `Esc`: Menutup modal aktif / membatalkan mode retur.
* **Park & Resume Order:** Menyimpan sementara antrean belanja pelanggan yang belum siap bayar agar kasir dapat melayani transaksi antrean berikutnya[cite: 2].
* **Mode Tukar & Retur Barang (Exchange Mode):** Mendukung pengembalian barang lama (qty bernilai `-1`) dan pembelian barang baru (qty `+1`) dalam satu struk untuk perhitungan selisih bayar secara instan[cite: 2].
* **Blind Cash-Drawer Closing:** Kasir menghitung fisik uang lembaran di laci tanpa melihat angka ekspektasi sistem untuk mencegah kecurangan manipulasi selisih kas (*anti-fraud*)[cite: 2].
* **Petty Cash Laci (Cash In & Out):** Pencatatan arus kas operasional kecil kasir yang otomatis memperbarui kalkulasi fisik saldo laci akhir shift[cite: 2].
* **Otorisasi Void Supervisor:** Pembatalan keranjang belanja mewajibkan otorisasi PIN supervisor (default: `1234`) dan terekam di audit trail[cite: 2].
* **Struk Thermal Preview:** Modal tampilan struk kertas 58mm/80mm setelah pembayaran sukses dengan rincian PPN, kembalian, dan fungsi cetak langsung (`window.print()`).

---

### C. Inventaris, HPP FIFO & Master Data Barang
* **Engine Biaya Modal FIFO (*First-In, First-Out*):** Setiap restok dicatat sebagai batch biaya beli (`StockBatch`)[cite: 2]. Saat barang terjual di POS, sistem memotong stok dari batch terlama terlebih dahulu untuk menghitung Total HPP (*COGS*) dan Laba Kotor (*Gross Profit*) secara akurat[cite: 2].
* **Edit Barang Manual & Riwayat Audit Spesifik (Bold Diff):** Staf berizin (`edit_products`) dapat mengoreksi nama, kategori, stok fisik, dan harga secara langsung dengan input alasan wajib. Perubahan tersimpan pada histori produk dan ditampilkan dengan visual perbandingan nilai sebelum vs sesudah (nilai yang berubah dicetak **tebal/bold**).
* **Toleransi Stok Minus (Allow Negative Stock):** Transaksi kasir tetap diizinkan berjalan meskipun stok sistem 0 atau minus demi melayani pembeli fisik di toko, disertai pemicu peringatan otomatis ke audit trail bagi staf gudang untuk segera melakukan *Stock Opname*[cite: 2].
* **Soft Delete (Sistem Arsip SKU):** Barang yang dinonaktifkan tidak dihapus fisik (`DELETE`), melainkan ditandai `isActive = false` agar histori laporan penjualan masa lalu tetap utuh[cite: 2]. Barang nonaktif otomatis diblokir dari pencarian scanner kasir[cite: 2].
* **Kartu Stok & Audit Mutasi:** Pencatatan riwayat barang masuk dari supplier dan pelaporan barang rusak/susut (*shrinkage*).

---

### D. Finansial, Perpajakan & Analisis Dashboard
* **Kalkulasi Pajak PPN 11% (*Item-Level Rounding*):** Perhitungan Dasar Pengenaan Pajak (DPP) dan nominal PPN dihitung dan dibulatkan per baris barang untuk mencegah selisih pembulatan pecahan desimal:
  $$\text{DPP} = \text{round}\left(\frac{\text{Subtotal}}{1 + 0.11}\right)$$
  $$\text{PPN Item} = \text{Subtotal} - \text{DPP}$$
* **Pemisahan MDR Perbankan:** Sistem otomatis menghitung potongan fee MDR (QRIS 0,7% dan EDC 1,5%) serta nominal bersih (*Net Settlement*) yang masuk ke rekening bank perusahaan[cite: 2].
* **Dashboard Visual Tren Real-Time:**
  * **KPI Cards:** Omzet Kotor, Laba Kotor FIFO, Net Rekening Bank, PPN Terkumpul.
  * **Grafik Batang Penjualan & Laba Harian:** Visualisasi tren omzet vs laba kotor 7 hari terakhir.
  * **Grafik Kerusakan Barang (Shrinkage):** Monitoring peningkatan barang cacat/rusak di gudang.
  * **Widget Produk Terlaris (*Best Selling*):** Peringkat produk paling laku (Top 5, Top 10, Semua) dihitung otomatis dari transaksi riil, lengkap dengan indikator sisa stok gudang.
  * **Distribusi Metode Tender:** Bar visual porsi transaksi Tunai vs QRIS vs EDC.

---

### E. Utilitas Data: Filter Tanggal, Pagination & Ekspor CSV
* **Filter Rentang Tanggal (*Date Range Picker*):** Komponen filter kalender *Dari Tanggal* dan *Sampai Tanggal* pada tabel Laporan Penjualan, Petty Cash, Log Otorisasi, Kartu Stok, dan Global Audit Trail.
* **Pagination Terpadu:** Kontrol penomoran halaman dengan opsi pemilihan jumlah data per halaman (10, 25, 50, 100 data) di seluruh tabel modul sistem.
* **Ekspor CSV Mandiri (*Client-Side Export*):** Tombol ekspor sekali klik untuk mengunduh laporan penjualan lengkap (termasuk DPP, PPN, HPP FIFO, MDR, Net Bank) serta rekaman log audit global ke berkas `.csv`.