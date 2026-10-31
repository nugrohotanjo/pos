# Dokumentasi Sistem Enterprise POS & Storefront — Ritel Serba Rp35.000

Dokumen komprehensif ini merangkum seluruh arsitektur teknis, arsitektur container Docker, skema database, backend API, logika bisnis kasir, dan inventarisasi fitur yang telah diimplementasikan pada ekosistem full-stack Point of Sale (POS) ritel.

---

## 1. Ikhtisar Sistem (System Overview)
Sistem POS ini dirancang untuk operasional ritel multi-channel dengan konsep harga paten seragam (serba Rp35.000). Ekosistem mengintegrasikan:
1. **Terminal Kasir & Admin Dashboard** (*Scanner & Keyboard-first*, RBAC, HPP FIFO, laporan settlement).
2. **Katalog Online Pembeli (Storefront)** untuk self-order atau penjelajahan produk offline.
3. **Backend REST API Go (Gin)** yang ringan, efisien, dan siap melayani traffic tinggi.
4. **PostgreSQL Database** dengan persistensi data volume Docker dan migrasi otomatis.

---

## 2. Topologi Jaringan & Port Container

Seluruh layanan berjalan terisolasi di dalam Docker Compose dengan alokasi port host sebagai berikut:

| Service Container | Nama Container | Port Host | Teknologi & Peran |
| :--- | :--- | :--- | :--- |
| **`pos-db`** | `serba-35k-pos-db` | `5432` | **PostgreSQL 16 Alpine** (Penyimpanan database relasional) |
| **`pos-backend`** | `serba-35k-pos-backend` | `8000` | **Go (Gin) + GORM** (REST API & Dokumentasi `/docs`) |
| **`pos-dashboard`** | `serba-35k-pos-dashboard` | `8001` | **React 19 + Nginx** (Admin Panel & Terminal Kasir) |
| **`pos-store`** | `serba-35k-pos-store` | `8002` | **React + Vite** (Katalog Pembeli & Checkout) |

---

## 3. Arsitektur Tumpukan Teknologi (Tech Stack)

### A. Backend & Database
* **Bahasa & Framework:** Go (Golang) v1.23+ dengan Gin Web Framework (`github.com/gin-gonic/gin`).
* **Object-Relational Mapping (ORM):** GORM (`gorm.io/gorm`) dengan driver PostgreSQL (`gorm.io/driver/postgres`).
* **Hot-Reloading Development:** Air (`github.com/air-verse/air`).
* **Dokumentasi API:** Zero-dependency HTML Template interaktif di endpoint `/docs`.
* **Database Persisten:** PostgreSQL 16 Alpine dengan persistent named volume `pgdata`.

### B. Frontend (Dashboard & Storefront)
* **Frontend Framework:** React 19 (TypeScript dengan konfigurasi ketat).
* **Routing Dashboard:** React Router DOM v7 (`BrowserRouter`) disinkronkan dengan state active menu dan didukung fallback SPA Nginx (`try_files $uri /index.html;`).
* **Styling & Desain:** Tailwind CSS v4.
* **Ikonografi:** Lucide React.
* **Web Server Production:** Nginx Alpine (Reverse routing statis dan caching ringan).

---

## 4. Persistensi Data & Skema Database (PostgreSQL)

Volume database disimpan di direktori host melalui Docker Named Volume `pgdata:/var/lib/postgresql/data`. Data transaksi dan katalog produk tetap aman saat container dihentikan atau di-restart.

### Model Data Utama:
* **`products`**:
  * `id` (Serial/Primary Key)
  * `name` (Varchar, Not Null)
  * `category` (Varchar)
  * `price` (Int, Fixed Rp35.000)
  * `original_price` (Int)
  * `tag` (Varchar)
  * `stock_note` (Varchar)
  * `created_at`, `updated_at` (Timestamp with Time Zone)
* **`orders`**:
  * `id` (Serial/Primary Key)
  * `order_code` (Varchar, Unique, e.g., `TRX-YYYYMMDDHHMMSS`)
  * `customer_name` (Varchar)
  * `phone` (Varchar)
  * `order_method` (Varchar: Ambil di Toko / Kurir)
  * `total_amount` (Int)
  * `created_at` (Timestamp with Time Zone)

---

## 5. Ringkasan Endpoint Backend REST API (`:8000`)

| Metode | Endpoint | Deskripsi |
| :--- | :--- | :--- |
| `GET` | `/` atau `/docs` | Dokumentasi visual antarmuka pengujian API |
| `GET` | `/api/health` | Health check status server dan timestamp ISO8601 |
| `GET` | `/api/v1/products` | Mendapatkan seluruh daftar katalog produk dari PostgreSQL |
| `POST` | `/api/v1/orders` | Membuat transaksi pesanan baru dan menyimpannya ke tabel `orders` |

---

## 6. Rincian Fitur Frontend Dashboard Admin (`:8001`)

### A. Autentikasi, Sesi & Kontrol Akses (RBAC)
* **Layar Login PIN Virtual:** Masuk shift menggunakan 4-digit PIN (Virtual keypad maupun keyboard fisik).
* **Akun Pengujian:**
  * **Fadhil (Owner):** PIN `9999` (Akses penuh ke semua modul).
  * **Agus Supervisor (Supervisor):** PIN `1234` (Otorisasi void, koreksi stok, laporan).
  * **Budi Santoso (Kasir):** PIN `1111` (Khusus transaksi POS kasir & kas kecil).
* **Browser URL Synchronization:** Routing URL tersinkron otomatis (`/`, `/pos`, `/products`, `/stock-ledger`, `/reports`, `/audit-trail`, `/users`, `/settings`) tanpa menghilangkan state sesi kasir aktif.

### B. Terminal Kasir (POS) Keyboard-First
* `F1`: Pembayaran Tunai (*Cash*).
* `F2`: Pembayaran Non-Tunai (*QRIS / EDC*).
* `F4`: Parkir Transaksi (*Hold / Park Order*).
* `F6`: Akses Kas Laci (*Petty Cash In/Out*).
* `F7`: Mode Tukar / Retur Barang (*Exchange Mode* dengan kalkulasi selisih otomatis).
* `F8`: Void Transaksi (Wajib otorisasi PIN Supervisor).
* `F9`: Tutup Shift Kasir (*Blind Cash-Drawer Closing* untuk mencegah manipulasi fisik laci).
* **Struk Thermal:** Cetak langsung struk belanja format 58mm/80mm (`window.print()`).

### C. Inventaris & HPP FIFO
* **First-In, First-Out (FIFO) Engine:** Perhitungan batch modal masuk (`StockBatch`) untuk mengkalkulasi HPP (*COGS*) dan Laba Kotor secara riil.
* **Toleransi Stok Minus:** Kasir tetap bisa menjual barang saat stok fisik ada namun sistem 0, dengan log audit otomatis untuk stok opname.
* **Arsip SKU (Soft Delete):** Produk dinonaktifkan tanpa menghapus riwayat laporan finansial masa lalu.

### D. Finansial & Analisis
* **PPN 11% Item-Level Rounding:**
  $$\text{DPP} = \text{round}\left(\frac{\text{Subtotal}}{1 + 0.11}\right)$$
  $$\text{PPN Item} = \text{Subtotal} - \text{DPP}$$
* **Pemisahan Fee MDR:** Perhitungan otomatis potongan biaya transaksi QRIS (0.7%) dan EDC (1.5%) menuju saldo *Net Settlement*.
* **Visual Dashboard KPI:** Omzet kotor, laba kotor FIFO, grafik transaksi 7 hari, monitoring shrinkage gudang, dan widget produk terlaris.
* **Ekspor CSV:** Unduh laporan keuangan dan audit trail dalam format `.csv` secara langsung.

---

## 7. Panduan Menjalankan & Perintah Operasional

### A. Menjalankan Seluruh Sistem
```bash
cd ~/pos
docker compose up -d --build
```

### B. Memeriksa Konsumsi Memori (Resource Footprint)
```bash
docker stats --no-stream
```
*Total konsumsi memori seluruh stack di server production hanya berkisar antara **~70 – 125 MB**.*

### C. Akses CLI Database PostgreSQL
```bash
docker exec -it serba-35k-pos-db psql -U postgres -d pos_db
```
Query cepat melihat pesanan masuk:
```sql
SELECT id, order_code, customer_name, total_amount, created_at FROM orders;
```