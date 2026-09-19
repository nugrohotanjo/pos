# Dokumentasi Sistem Enterprise POS — Ritel Serba Rp35.000

Dokumen ini merangkum arsitektur, aturan bisnis, dan spesifikasi teknis dari aplikasi Point of Sale (POS) yang telah dibangun. Dokumen ini dapat digunakan sebagai referensi penuh konteks pengembangan lanjutan.

---

## 1. Ikhtisar Sistem (System Overview)
Sistem POS ini dirancang khusus untuk operasional ritel dengan model penetapan harga seragam (serba Rp35.000). Aplikasi mengutamakan kecepatan antrean kasir, integritas data keuangan (rekonsiliasi MDR perbankan), akuntabilitas laci kasir (*anti-fraud*), toleransi operasional gudang, serta pencatatan audit trail menyeluruh untuk setiap mutasi data[cite: 2].

---

## 2. Arsitektur & Tumpukan Teknologi (Tech Stack)
* **Frontend Framework:** React (TypeScript dengan konfigurasi ketat `verbatimModuleSyntax`)[cite: 1].
* **Styling & Desain:** Tailwind CSS v4.
* **Ikonografi:** Lucide React.
* **Pola Arsitektur:** *Domain-Driven Feature-Based Structure*:
  * `src/features/pos/`: Antarmuka terminal kasir fisik dan modal transaksi.
  * `src/features/products/`: Manajemen katalog produk master dan kartu stok gudang.
  * `src/features/reports/`: Rekapitulasi settlement penjualan, MDR fee, dan kas kecil.
  * `src/features/audit/`: Audit trail global lintas modul.
  * `src/features/users/`: Pengelolaan staf, peran kustom, dan matriks hak akses.
  * `src/features/settings/`: Konfigurasi gerbang jalur pembayaran toko.
  * `src/components/layout/`: Navigasi sidebar dan header terpusat.
  * `src/types/`: Kontrak tipe data global (`src/types/index.ts`).

---

## 3. Rincian Fitur yang Telah Diimplementasikan

### A. Terminal Kasir (POS Terminal)
* **Barcode Scanner-First:** Pemindaian instan dengan kalkulasi otomatis kelipatan harga paten Rp35.000 per barang.
* **Keyboard-First Navigation (Operasional Tanpa Mouse):**[cite: 2]
  * `F1`: Pembayaran Tunai (*Cash*).
  * `F2`: Pembayaran Non-Tunai (*QRIS / EDC*).
  * `F4`: Parkir Transaksi (*Hold / Park Order*)[cite: 2].
  * `F6`: Akses Kas Laci Operasional (*Petty Cash*).
  * `F7`: Mode Tukar / Retur Barang (*Exchange Mode*).
  * `F8`: Pembatalan Transaksi Keranjang (*Void* dengan PIN Supervisor)[cite: 2].
  * `F9`: Tutup Shift Kasir (*Blind Cash-Drawer Closing*)[cite: 2].
  * `Esc`: Menutup jendela pop-up/dialog yang aktif atau keluar dari mode retur.
* **Park & Resume Order:** Menyimpan sementara keranjang belanja pelanggan yang belum siap bayar agar kasir dapat memproses antrean berikutnya[cite: 2].
* **Mode Tukar & Retur Barang (Exchange Mode):** Mendukung pengembalian barang lama (kuantitas negatif) dan pembelian barang baru (kuantitas positif) dalam satu struk untuk perhitungan selisih bayar[cite: 2].
* **Tender Shortcuts:** Saran pecahan nominal uang tunai otomatis untuk mempercepat proses perhitungan uang kembalian[cite: 2].
* **Kiosk Protection:** Menonaktifkan fungsi klik kanan browser (*context menu*) untuk menjaga fokus operasional kasir[cite: 2].

---

### B. Manajemen Kas & Integritas Anti-Fraud
* **Blind Cash-Drawer Closing (Tutup Kasir Buta):** Kasir menginput hitungan fisik uang laci tanpa ditampilkan ekspektasi sistem terlebih dahulu guna mencegah manipulasi data selisih kas (*variance*)[cite: 2].
* **Petty Cash (Cash In & Cash Out):** Pencatatan mutasi kas kecil operasional laci kasir (misal: pembelian lakban/kantong plastik) yang otomatis terhubung ke perhitungan saldo akhir shift[cite: 2]:
  $$\text{Expected Cash} = \text{Modal Awal} + \text{Penjualan Tunai} + \text{Cash In} - \text{Cash Out}$$
[cite: 2]
* **Otorisasi Supervisor:** Tindakan pembatalan belanja (*void*) mewajibkan input PIN supervisor dan otomatis tercatat pada log audit[cite: 2].

---

### C. Manajemen Inventaris & Aturan Bisnis Ritel
* **Historical Price Snapshot:** Menyalin dan mengunci harga satuan serta nama produk pada setiap baris struk transaksi, sehingga perubahan master data di masa depan tidak mengubah histori data masa lalu[cite: 2].
* **Dialog Struk Belanja (Thermal Receipt Preview):** Tampilan struk kertas thermal format 58mm/80mm setelah pembayaran selesai yang siap dicetak langsung via fungsi cetak peramban.
* **Toleransi Stok Minus (Allow Negative Stock):** Transaksi kasir tetap diizinkan berjalan meskipun stok sistem menunjukkan angka 0 atau minus, disertai notifikasi otomatis bagi gudang untuk segera melakukan *Stock Opname*[cite: 2].
* **Soft Delete (Arsip Data):** Produk yang tidak lagi dijual tidak dihapus fisik dari database (`DELETE`), melainkan ditandai nonaktif (`isActive = false`) agar relasi transaksi lampau tetap utuh[cite: 2]. Produk nonaktif otomatis disembunyikan dari scanner kasir.
* **Kartu Stok & Audit Mutasi:** Log pencatatan riwayat barang masuk (restok) dan barang rusak (*shrinkage*).

---

### D. Rekonsiliasi Finansial & Pengaturan Toko
* **Pemisahan Biaya MDR Perbankan:** Sistem otomatis memisahkan nominal penjualan kotor (*Gross Amount*), potongan biaya MDR (QRIS 0,7% / EDC 1,5%), dan dana bersih yang masuk ke rekening bank (*Net Settlement*)[cite: 2].
* **Aktivasi Jalur Pembayaran Dinamis:** Admin dapat menonaktifkan jalur pembayaran tertentu (misal: saat jaringan QRIS bank sedang bermasalah). Tombol dan shortcut terkait di layar kasir otomatis terkunci dan dilabeli gangguan.

---

### E. Manajemen Hak Akses & Audit Trail Global
* **Role Dinamis & Matriks Hak Akses:** Kemampuan mendefinisikan peran kustom (seperti Kasir, Supervisor, Tim Gudang) dengan penetapan izin akses fitur (*granular permissions*) berbasis kotak centang.
* **Sistem Audit Trail Global Terpusat:** Modul monitoring seluruh aktivitas penting sistem yang dapat disaring berdasarkan sumber modul:
  * `PRODUCTS` (Perubahan master data dan arsip barang).
  * `INVENTORY` (Mutasi stok dan peringatan stok minus)[cite: 2].
  * `POS_TERMINAL` (Penjualan selesai, otorisasi void, dan tukar barang)[cite: 2].
  * `PETTY_CASH` (Arus kas masuk dan keluar laci kasir).
  * `USERS_ROLES` (Pembuatan akun staf dan pembaruan izin peran).
  * `SETTINGS` (Perubahan konfigurasi metode pembayaran).