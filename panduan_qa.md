# Panduan Skenario Quality Assurance (QA) & Pengujian Sistem POS

Dokumen ini memuat skenario pengujian fungsional dan integritas data untuk memastikan seluruh alur operasional, keamanan, dan kalkulasi sistem ritel berjalan sesuai spesifikasi bisnis[cite: 2].

---

## Informasi Akun Uji (Default Test Credentials)

| Nama Akun | Peran (Role) | Default PIN | Hak Akses Utama |
| :--- | :--- | :--- | :--- |
| **Fadhil** | Pemilik Toko (Owner) | `9999` | Akses penuh (Dashboard, Master, Stok, Laporan, Audit, User, Settings) |
| **Agus Supervisor** | Supervisor Toko | `1234` | Otorisasi void kasir, edit barang, retur, mutasi stok, laporan omzet |
| **Budi Santoso** | Kasir Frontline | `1111` | Khusus operasional POS dan petty cash laci kasir |

---

## 1. Skenario Uji: Transaksi Normal & Kalkulasi Finansial (PPN + MDR)
**Tujuan:** Memverifikasi pemotongan stok otomatis, pemisahan Dasar Pengenaan Pajak (DPP), pembulatan PPN 11%, dan potongan MDR bank secara presisi[cite: 2].

* **Langkah Pengujian:**
  1. Pada halaman Login, pilih akun **Budi Santoso**, masukkan PIN `1111`, lalu klik **Masuk ke Sistem**.
  2. Sistem otomatis mengarahkan ke Terminal Kasir (POS).
  3. Masukkan barcode produk (contoh: `8991001`) lalu tekan `Enter`.
  4. Tekan tombol pintas `F1` untuk metode Tunai[cite: 2].
  5. Masukkan nominal uang diterima melebihi tagihan belanja, lalu konfirmasi pembayaran[cite: 2].
  6. Setelah struk thermal selesai, tambahkan item baru ke keranjang, tekan `F2` (Digital), pilih metode **QRIS**, dan selesaikan transaksi[cite: 2].
* **Kriteria Keberhasilan (Expected Result):**
  * Struk thermal menampilkan pemisahan DPP dan nominal PPN 11% secara benar (*tax-inclusive*)[cite: 2].
  * Uang kembalian terhitung akurat pada struk pembayaran tunai[cite: 2].
  * Pada menu *Laporan Penjualan* (login sebagai Owner), transaksi QRIS memotong biaya MDR 0,7% dan nilai *Net Settlement* tercatat tepat[cite: 2].

---

## 2. Skenario Uji: Operasional Kasir Lanjutan (Hold, Return & Supervisor Void)
**Tujuan:** Menguji fungsi antrean belanja, penanganan retur tukar guling, dan proteksi pembatalan transaksi[cite: 2].

* **Langkah Pengujian:**
  1. **Parkir Pesanan (Hold Bill):** Masukkan 2 barang ke keranjang, tekan tombol pintas `F4`[cite: 2]. Keranjang harus dikosongkan dan muncul indikator antrean parkir di bagian atas[cite: 2]. Klik tombol parkir tersebut untuk memulihkan isi keranjang[cite: 2].
  2. **Mode Tukar / Retur Barang (Exchange):** Tekan `F7` untuk mengaktifkan mode retur[cite: 2]. Pindai barang yang dikembalikan pelanggan (qty bernilai `-1`, subtotal `-Rp 35.000`)[cite: 2]. Pindai barang baru pengganti (qty `+1`, subtotal `+Rp 35.000`)[cite: 2]. Total akhir tagihan bernilai `Rp 0` (tukar pas)[cite: 2]. Selesaikan transaksi.
  3. **Void dengan Proteksi PIN:** Tambahkan item ke keranjang belanja, tekan tombol pintas `F8` (Void)[cite: 2]. Masukkan PIN acak (contoh: `0000`). Sistem harus menolak aksi. Masukkan PIN Supervisor yang valid (`1234`)[cite: 2].
* **Kriteria Keberhasilan (Expected Result):**
  * Transaksi parkir dapat dipulihkan tanpa kehilangan data barang belanjaan[cite: 2].
  * Mode retur mengakomodasi nilai negatif dan menghitung selisih pembayaran belanja dengan benar[cite: 2].
  * Keranjang hanya dapat dibatalkan melalui validasi PIN Supervisor, dan aksi pembatalan otomatis terekam pada Audit Trail[cite: 2].

---

## 3. Skenario Uji: HPP Metode FIFO & Mutasi Inventaris
**Tujuan:** Memastikan pengeluaran stok mengambil biaya modal (*cost price*) dari batch terlama terlebih dahulu[cite: 2].

* **Langkah Pengujian:**
  1. Login menggunakan akun **Fadhil** (PIN: `9999`).
  2. Masuk ke menu **Kartu Stok & Audit Batch**[cite: 2].
  3. Klik tombol **Catat Mutasi / Restok Batch**[cite: 2].
  4. Pilih produk `Kaos Polos Cotton Combed 30s`[cite: 2], masukkan jumlah Qty `10`, tentukan harga modal HPP baru sebesar `Rp 25.000`, masukkan alasan mutasi, lalu simpan data[cite: 2].
  5. Masuk ke Terminal Kasir dan lakukan transaksi penjualan untuk produk tersebut sebanyak 1 pcs.
  6. Buka menu **Laporan Penjualan** untuk meninjau rincian baris transaksi terakhir[cite: 2].
* **Kriteria Keberhasilan (Expected Result):**
  * Transaksi kasir tetap menggunakan HPP dari batch terlama yang masih tersisa (misal: `Rp 18.000`), bukan menggunakan biaya modal batch yang baru saja dimasukkan[cite: 2].
  * Laba kotor (*Gross Profit*) terhitung akurat sesuai selisih harga jual dengan HPP batch terlama tersebut[cite: 2].

---

## 4. Skenario Uji: Role-Based Access Control (RBAC) & Proteksi Halaman
**Tujuan:** Memvalidasi pembatasan wewenang antarmuka dan penolakan rute menu tanpa izin[cite: 2].

* **Langkah Pengujian:**
  1. **Pengujian Akun Kasir:**
     * Lakukan Logout, kemudian login sebagai **Budi Santoso** (PIN: `1111`).
     * Periksa bilah navigasi Sidebar.
  2. **Pengujian Akun Supervisor:**
     * Lakukan Logout, kemudian login sebagai **Agus Supervisor** (PIN: `1234`).
     * Buka menu **Data Karyawan** atau **Pengaturan Toko**.
* **Kriteria Keberhasilan (Expected Result):**
  * Akun kasir hanya dapat melihat tombol akses kasir; seluruh menu manajerial tersembunyi secara otomatis.
  * Akun supervisor yang mengakses menu di luar kewenangannya akan menampilkan antarmuka peringatan **Akses Terbatas (Akses Ditolak)**.

---

## 5. Skenario Uji: Integritas Audit Trail & Edit Data Master
**Tujuan:** Menjamin keandalan pencatatan riwayat perubahan data serta format visual perbedaan data[cite: 2].

* **Langkah Pengujian:**
  1. Login sebagai akun **Fadhil** (PIN: `9999`).
  2. Buka menu **Master Data Barang**.
  3. Klik tombol pensil (**Edit**) pada salah satu baris produk.
  4. Ubah angka stok fisik dan harga satuan barang, cantumkan alasan pengubahan pada kolom yang tersedia, lalu simpan perubahan.
  5. Klik tombol jam (**Riwayat / History**) pada baris produk yang baru saja diubah.
  6. Masuk ke menu **Audit Trail Global**[cite: 2].
* **Kriteria Keberhasilan (Expected Result):**
  * Dialog riwayat produk menampilkan identitas pengubah, waktu perubahan, dan nilai data yang berubah tercetak dengan format **tebal (bold)**.
  * Tabel *Audit Trail Global* merekam peristiwa tersebut di bawah modul `PRODUCTS` dengan status `APPROVED`[cite: 2].

---

## 6. Skenario Uji: Penyaringan Rentang Tanggal & Ekspor CSV
**Tujuan:** Memastikan data tabel dapat disaring secara dinamis berdasarkan periode waktu serta file CSV dapat diunduh utuh.

* **Langkah Pengujian:**
  1. Masuk ke menu **Laporan Penjualan** atau **Audit Trail Global**[cite: 2].
  2. Pada komponen *Date Range Filter*, tentukan tanggal pada input *Dari Tanggal* dan *Sampai Tanggal*.
  3. Periksa perubahan isi data pada tabel dan klik tombol **Reset** tanggal.
  4. Klik tombol **Export CSV**.
  5. Buka berkas `.csv` hasil unduhan menggunakan aplikasi pengolah data spreadsheet.
* **Kriteria Keberhasilan (Expected Result):**
  * Tabel hanya menampilkan baris data yang berada dalam rentang tanggal yang dipilih.
  * Berkas CSV memuat kolom numerik, waktu, nama kasir/aktor, dan data finansial secara rapi tanpa kesalahan karakter format teks.