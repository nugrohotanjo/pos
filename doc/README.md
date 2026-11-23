# Dokumentasi Proyek POS Enterprise

Selamat datang di direktori dokumentasi resmi sistem **POS Enterprise (Ritel Serba Rp35.000)**. Direktori ini menyajikan rincian teknis lengkap mengenai arsitektur sistem, struktur folder, dan tumpukan teknologi (*tech stack*) yang digunakan pada aplikasi **pos-backend** dan **pos-frontend**.

---

## 📑 Daftar Dokumen

1. [**Arsitektur Sistem (architecture.md)**](./architecture.md)
   - Gambaran umum ekosistem aplikasi
   - Diagram topologi infrastruktur Docker & jaringan antar-kontainer
   - Alur autentikasi (Dual-layer Cookie & Bearer JWT + Device Binding + Token Versioning)
   - Mekanisme Database & GORM Audit Plugin
   - Arsitektur Frontend (Feature-Driven Architecture & SPA Nginx Proxy)

2. [**Struktur Direktori (folder_structure.md)**](./folder_structure.md)
   - Struktur folder root proyek
   - Struktur mendalam `pos-backend` (Go / Gin)
   - Struktur mendalam `pos-frontend` (React 19 / TypeScript / Vite)
   - Penjelasan peran dan tanggung jawab setiap direktori dan file penting

3. [**Tumpukan Teknologi / Tech Stack (tech_stack.md)**](./tech_stack.md)
   - Rincian teknologi `pos-backend` (Bahasa, Framework, ORM, Database Driver, Utility)
   - Rincian teknologi `pos-frontend` (Library inti, Routing, State Management, UI/Styling, Tooling)
   - Database & Containerization
   - Matriks perbandingan lingkungan Development vs Production

---

## 📦 Dokumentasi Modul Fungsional (Deep Dive)

1. [**Modul 1: Autentikasi, Karyawan & RBAC (modules/module_01_auth_rbac.md)**](./modules/module_01_auth_rbac.md)
   - Protokol autentikasi PIN 4-digit & shift kasir
   - Keamanan kriptografis (XOR Obfuscation, bcrypt auto-migration, HttpOnly Cookie + Device Binding SHA-256)
   - Mekanisme pembatalan sesi instan (*Token Versioning*)
   - Model perizinan granular (*Granular Permissions Matrix*) berbasis PostgreSQL JSONB
   - Kontrak API & skema database tabel `employees` dan `roles`

2. [**Modul 2: Katalog Produk, Kategori, & Varian (modules/module_02_catalog_products.md)**](./modules/module_02_catalog_products.md)
   - Identifikasi cepat barcode scanner hardware-first
   - Matriks multi-varian kombinatorial bertingkat (Ukuran & Warna) dengan SKU mandiri
   - Tingkatan harga grosir (*tiered wholesale pricing*)
   - Hirarki kategori pohon (*parent-child tree*) dengan generator slug unik
   - Transaksi database atomik pembaruan produk dan soft archival (arsip SKU)

3. [**Modul 3: Terminal Kasir POS & Transaksi Order (modules/module_03_pos_terminal.md)**](./modules/module_03_pos_terminal.md)
   - Antarmuka keyboard-first (Pintasan F1-F9 & auto-refocus scanner)
   - Mode retur/tukar barang konsumen (kalkulasi selisih otomatis)
   - Otorisasi pembatalan transaksi (*Void*) via PIN Supervisor
   - Tutup shift kasir berbasis hitungan fisik buta (*Blind Shift Closing*)
   - Perhitungan otomatis PPN 11% item-level, fee MDR QRIS/EDC, dan cetak struk thermal 58mm/80mm

4. [**Modul 4: Inventaris, Buku Besar Stok & HPP FIFO (modules/module_04_inventory_fifo.md)**](./modules/module_04_inventory_fifo.md)
   - Engine valuasi First-In First-Out (FIFO) dan pembebanan modal transaksi riil
   - Kartu stok (*Stock Movement Ledger*) melacak 6 tipe pergerakan stok barang
   - Manajemen batch kedatangan (*StockBatch*) dan toleransi penjualan stok minus
   - Rekonsiliasi audit opname fisik dan penyesuaian reaktif via Zustand

---

## ⚙️ Ringkasan Cepat Menjalankan Layanan

Seluruh ekosistem dikelola menggunakan Docker Compose:

```bash
# Menjalankan seluruh kontainer secara detached
docker compose up -d --build

# Memeriksa status kontainer
docker compose ps

# Memeriksa log backend
docker compose logs -f pos-backend

# Memeriksa log frontend
docker compose logs -f pos-dashboard
```

Alokasi port lokal:
- **pos-frontend (Dashboard Kasir & Admin):** `http://localhost:8001`
- **pos-backend (REST API Gin):** `http://localhost:8000`
- **pos-store (Storefront Katalog Pelanggan):** `http://localhost:8002`
- **pos-db (PostgreSQL 16):** `localhost:5432`
