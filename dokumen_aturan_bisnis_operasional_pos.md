# Dokumen Aturan Bisnis & Operasional (Business Rules) - Sistem Enterprise POS

Dokumen ini merangkum aturan-aturan fundamental operasional bisnis yang wajib diimplementasikan pada sistem Point of Sales (POS) untuk memastikan keandalan, keamanan dari kecurangan, kelancaran operasional di kasir, dan akurasi laporan keuangan.

## 1. Manajemen Transaksi & Kecepatan Kasir (UI/UX)
*   **Keyboard-First Navigation:** Antarmuka kasir harus mendukung operasional tanpa *mouse* (menggunakan *shortcut* keyboard) untuk mempercepat proses di jam sibuk (*rush hour*).
*   **Tender Shortcuts (Tombol Uang Pas):** Layar pembayaran wajib menampilkan saran pembulatan uang tunai (misal: Tagihan Rp63.500 menampilkan tombol Rp63.500, Rp65.000, Rp70.000, Rp100.000) untuk memangkas waktu kalkulasi manual.
*   **Park / Hold Order:** Sistem harus memiliki kemampuan memarkir keranjang belanja pelanggan yang belum siap membayar, sehingga kasir dapat melayani pelanggan di antrean berikutnya tanpa menghapus data pesanan.

## 2. Integritas Data & Manajemen Harga
*   **Historical Price Snapshot:** Harga, diskon, dan pajak barang yang terjual harus disimpan sebagai salinan (*snapshot*) pada baris transaksi keranjang. Perubahan harga pada master data produk tidak boleh mengubah nominal pada histori transaksi masa lalu.
*   **Soft Delete:** Data produk, kategori, dan kasir tidak boleh dihapus permanen dari database (`DELETE`). Sistem harus menggunakan metode *soft delete* (flag `is_active = false`) agar relasi data untuk pelaporan historis tidak rusak.

## 3. Manajemen Kas, Shift & Keamanan Anti-Fraud
*   **Blind Close (Tutup Kasir Buta):** Saat menutup shift, kasir hanya menginput nominal uang fisik yang dihitung secara manual. Sistem tidak boleh menampilkan "Total Uang yang Seharusnya Ada" kepada kasir sebelum input selesai, guna mencegah manipulasi selisih kas.
*   **Supervisor Approval (Otorisasi PIN):** Segala bentuk pembatalan transaksi (*void*), diskon manual, dan pengubahan harga manual wajib divalidasi dengan PIN dari Supervisor atau Store Manager. Alasan pembatalan wajib terekam pada *Audit Log*.
*   **Drawer Float & Petty Cash:** Sistem wajib mencatat uang modal awal kasir (*Opening Float*) serta pengeluaran/pemasukan kas kecil selama shift (*Cash In / Cash Out*).
    *   *Rumus Rekonsiliasi:* 
        $$ \text{Expected Cash} = \text{Opening Float} + \text{Total Cash Sales} + \text{Cash In} - \text{Cash Out} $$

## 4. Manajemen Stok & HPP (Harga Pokok Penjualan)
*   **Stock Ledger (Mutasi Stok):** Perubahan inventaris tidak boleh ditimpa begitu saja. Semua perubahan (Penjualan, Retur, *Waste*, *Receiving*) harus dicatat sebagai baris mutasi stok lengkap dengan tipe referensi dan tanggal.
*   **Allow Negative Stock (Toleransi Stok Minus):** Kasir tidak boleh diblokir saat melakukan penjualan meskipun stok di sistem 0 atau minus. Transaksi harus tetap diizinkan demi melayani pelanggan fisik, namun sistem memberikan peringatan otomatis kepada gudang untuk *Stock Opname*.
*   **FIFO untuk HPP:** Margin laba kotor dihitung menggunakan metode inventaris *First-In, First-Out* (FIFO) untuk mengakomodasi fluktuasi harga beli produk dari vendor.

## 5. Pajak, Diskon & Rekonsiliasi Pembayaran Digital
*   **Kalkulasi Item-Level:** Diskon dan perhitungan pajak (seperti PPN) harus dihitung dan dibulatkan per baris item, bukan dari total akhir. Kalkulasi wajib menggunakan tipe data *Decimal/Numeric* untuk mencegah galat pembulatan.
*   **MDR (Merchant Discount Rate):** Pada pembayaran non-tunai (QRIS/EDC), sistem wajib memisahkan pencatatan *Gross Amount* (Total Penjualan), *MDR Fee* (Potongan Bank), dan *Net Settlement* (Uang masuk bersih ke rekening bank perusahaan).
*   **Mode Exchange (Tukar Barang):** Transaksi *Refund* harus mengakomodir pengembalian barang (*minus amount*) dan pembelian barang baru (*positive amount*) dalam satu struk untuk perhitungan selisih bayar.

## 6. Keamanan Perangkat (*Device Lockdown*)
*   **Kiosk Mode:** Jika diakses melalui peramban kasir, mode antarmuka berjalan dalam *fullscreen*, mematikan menu klik kanan (*context menu*), dan mendisfungsikan tombol navigasi dev (seperti `F12` atau `Ctrl+R`), sehingga kasir fokus murni pada aplikasi POS.