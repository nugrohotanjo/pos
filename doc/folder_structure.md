# Dokumentasi Struktur Folder (Folder Structure)

Dokumen ini menyajikan peta struktur direktori lengkap dari repositori **POS Enterprise**, dengan rincian mendalam pada direktori akar (*root*), aplikasi **pos-backend**, dan antarmuka **pos-frontend**.

---

## 1. Struktur Direktori Root Proyek

```
pos-enterprise/
├── .git/                                   # Repository version control Git
├── AI_CONTEXT/                             # Konteks persisten AI & tracker modul
│   ├── MASTER.md                           # Master context sistem dan dependensi
│   └── PROGRESS.md                         # Log checkpoint progress dan status modul
├── doc/                                    # Dokumentasi komprehensif sistem
│   ├── README.md                           # Indeks dokumentasi proyek
│   ├── architecture.md                     # Dokumentasi arsitektur sistem
│   ├── folder_structure.md                 # Peta struktur folder proyek (file ini)
│   └── tech_stack.md                       # Dokumentasi tumpukan teknologi
├── docker-compose.yml                      # Konfigurasi orkestrasi kontainer multi-service
├── dokumen_aturan_bisnis_operasional_pos.md # Aturan bisnis ritel, HPP FIFO, PPN, dan kasir
├── panduan_qa.md                           # Panduan pengujian mutu & skenario test POS
├── README.md                               # Ikhtisar teknis ekosistem proyek
├── pos-backend/                            # Layanan REST API Golang (Gin + GORM)
├── pos-frontend/                           # Web application Terminal Kasir & Dashboard Admin
└── pos-store/                              # Web application Katalog Pembeli / Storefront
```

---

## 2. Struktur Direktori `pos-backend`

Aplikasi backend menggunakan arsitektur modular Golang yang rapi dan mudah dirawat:

```
pos-backend/
├── .air.toml                  # Konfigurasi Air untuk Live Reloading saat development
├── Dockerfile.dev             # Konfigurasi container dev (Golang Alpine + Air hot reload)
├── go.mod                     # Deklarasi modul Go dan dependensi library
├── go.sum                     # Checksum checksum verifikasi dependensi Go
├── main.go                    # Entry point aplikasi, inisialisasi CORS, context audit, & rute
├── config/                    # Konfigurasi koneksi & plugin database
│   ├── database.go            # Inisialisasi pool PostgreSQL, DSN, & GORM AutoMigrate
│   └── audit_plugin.go        # GORM Audit Hook pemicu pencatatan riwayat otomatis
├── handlers/                  # Lapisan controller / handler HTTP request-response
│   ├── audit_logs.go          # Endpoint query riwayat aktivitas audit trail
│   ├── auth_middleware.go     # Middleware otentikasi JWT, device binding, & token version
│   ├── brands.go              # CRUD master data merek produk
│   ├── category.go            # CRUD kategori hirarkis bertingkat & generator slug
│   ├── docs.go                # Penyaji antarmuka pengujian visual API interaktif
│   ├── health.go              # Endpoint health check server (/api/health)
│   ├── orders.go              # Pemrosesan transaksi penjualan & checkout kasir
│   ├── products.go            # CRUD produk, filter katalog, arsip SKU, & log produk
│   ├── settings.go            # Pengambilan & pembaruan konfigurasi parameter toko
│   ├── shelves.go             # CRUD data lokasi rak display toko
│   ├── upload.go              # Handler multipart upload gambar produk ke server
│   └── users.go               # Autentikasi staf, manajemen role & RBAC permissions
├── models/                    # Definisi model entity database GORM & DTO request
│   ├── audit.go               # Struct AuditLog
│   ├── brand.go               # Struct Brand
│   ├── category.go            # Struct Category (dukungan Parent-Child tree)
│   ├── order.go               # Struct Order & OrderRequest
│   ├── product.go             # Struct Product, ProductVariant, WholesalePrice, ProductImage
│   ├── setting.go             # Struct Setting toko
│   ├── shelf.go               # Struct Shelf rak toko
│   └── user.go                # Struct Employee & Role (dengan perizinan JSONB)
├── templates/                 # Template HTML sisi server
│   └── docs.html              # Template halaman dokumentasi API interaktif (/docs)
├── utils/                     # Utility dan helper fungsional
│   ├── audit.go               # Helper ekstraksi identitas user dari context
│   ├── datatable.go           # Helper kalkulasi paging, limit, offset, & sorting tabel
│   └── jwt.go                 # Helper generate token, hash device fingerprint, & validasi JWT
└── uploads/                   # Direktori penyimpanan lokal berkas gambar yang diunggah
```

---

## 3. Struktur Direktori `pos-frontend`

Aplikasi frontend menerapkan **Feature-Driven Architecture** untuk memastikan skalabilitas kode:

```
pos-frontend/
├── .dockerignore              # Berkas yang dikecualikan dari Docker build context
├── .gitignore                 # Berkas yang diabaikan oleh Git
├── Dockerfile                 # Multi-stage Docker build untuk production (Node.js -> Nginx)
├── Dockerfile.dev             # Konfigurasi Docker dev runner (Vite dev server)
├── eslint.config.js           # Konfigurasi linter ESLint
├── index.html                 # HTML template root SPA Vite
├── nginx.conf                 # Konfigurasi reverse proxy /api/ & SPA history fallback Nginx
├── package.json               # Manifest dependensi & script npm
├── package-lock.json          # Lockfile dependensi npm
├── tsconfig.json              # Konfigurasi referensi TypeScript
├── tsconfig.app.json          # Konfigurasi TypeScript untuk source code aplikasi
├── tsconfig.node.json         # Konfigurasi TypeScript untuk konfigurasi tooling node
├── vite.config.ts             # Konfigurasi bundler Vite (plugin React & Tailwind)
├── public/                    # Aset statis publik
└── src/                       # Source code utama aplikasi
    ├── main.tsx               # Entry point React DOM render & BrowserRouter wrapper
    ├── App.tsx                # Komponen utama: routing aktif, layout sidebar/header, auth gate
    ├── App.css                # Styling styling tambahan aplikasi
    ├── index.css              # Directives Tailwind CSS v4 (@import "tailwindcss";)
    ├── assets/                # Gambar, logo, dan ikon SVG statis lokal
    ├── components/            # Komponen antarmuka yang dapat digunakan ulang (Reusable UI)
    │   ├── CategoryCascadeModal.tsx     # Modal pemilihan kategori bertingkat
    │   ├── CategoryCascadeSelector.tsx  # Dropdown pemilih hirarki kategori
    │   ├── CustomSelect.tsx             # Custom select dropdown input
    │   ├── DataTable.tsx                # Komponen tabel dinamis dengan sort & styling
    │   ├── MetricCard.tsx               # Kartu metrik ringkasan data di dashboard
    │   ├── SearchableSelectWithManage.tsx # Dropdown dengan fitur pencarian & tambah opsi
    │   ├── common/                      # Komponen utilitas bersama
    │   │   └── FieldTooltip.tsx         # Tooltip petunjuk kolom input form
    │   ├── layout/                      # Komponen layout struktural
    │   │   ├── CashierWelcome.tsx       # Sambutan kasir saat membuka shift
    │   │   ├── Header.tsx               # Header atas: info kasir aktif, jam, tombol keluar
    │   │   └── Sidebar.tsx              # Navigasi menu samping dashboard
    │   └── ui/                          # Komponen kontrol UI
    │       ├── DateRangeFilter.tsx      # Filter pemilih rentang tanggal
    │       └── Pagination.tsx           # Kontrol navigasi halaman tabel data
    ├── data/                  # Data statis & mock fallback
    │   ├── initialData.ts     # Data awal batch stok, audit log, & kas kecil
    │   ├── mockData.ts        # Data dummy untuk pengujian lokal
    │   └── translations.ts    # Kamus lokalisasi multi-bahasa (ID / EN)
    ├── features/              # Modul bisnis fungsional (Domain-Driven / Feature-Driven)
    │   ├── audit/             # Modul tampilan audit jejak audit trail
    │   │   └── AuditTrailView.tsx
    │   ├── audit-logs/        # Modul integrasi API audit logs
    │   │   └── api/auditLogsApi.ts
    │   ├── auth/              # Modul login PIN & otentikasi sesi kasir
    │   │   ├── LoginView.tsx
    │   │   └── api/authApi.ts
    │   ├── categories/        # Modul manajemen kategori barang (tree view & modal)
    │   │   ├── CategoriesView.tsx
    │   │   ├── components/    # Komponen khusus kategori
    │   │   └── api/categoriesApi.ts
    │   ├── dashboard/         # Modul tampilan ringkasan metrik & KPI bisnis
    │   │   └── DashboardView.tsx
    │   ├── employees/         # Modul integrasi data staf kasir
    │   │   └── api/employeesApi.ts
    │   ├── pos/               # Terminal Kasir POS (Shortcut F1-F9, Scanner, Struk)
    │   │   ├── PosView.tsx
    │   │   └── components/    # Komponen struk, modal kas laci, dialog void, dll.
    │   ├── products/          # Modul manajemen katalog produk, varian, & stok
    │   │   ├── ProductFormPage.tsx # Form tambah/edit produk dengan varian bertingkat
    │   │   ├── ProductsView.tsx    # Tabel daftar produk, status arsip, filter
    │   │   ├── StockLedgerView.tsx # Buku besar mutasi stok barang
    │   │   ├── CategoryCombobox.tsx
    │   │   ├── api/           # Service API (productsApi, brandsApi, shelvesApi)
    │   │   └── components/    # Komponen spesifik produk (varian, modal arsip)
    │   ├── reports/           # Modul laporan omzet, settlement non-tunai, & laba rugi
    │   │   └── ReportsView.tsx
    │   ├── roles/             # Modul perizinan hak akses pengguna
    │   │   └── api/rolesApi.ts
    │   ├── settings/          # Modul konfigurasi sistem dan toko
    │   │   └── SettingsView.tsx
    │   └── users/             # Modul manajemen pengguna, kasir, dan supervisor
    │       └── UsersView.tsx
    ├── services/              # Layanan eksternal & koneksi jaringan
    │   └── api/
    │       ├── client.ts      # HTTP wrapper (`apiFetch`), enkripsi payload, header user
    │       └── types.ts       # Definisi generic response API
    ├── stores/                # Global state management
    │   └── useProductStore.ts # Zustand store: daftar produk, pagination, & sinkronisasi API
    ├── types/                 # Kontrak tipe data TypeScript
    │   └── index.ts           # Definisi interface Product, Order, Employee, Permission, dll.
    └── utils/                 # Kumpulan fungsi bantuan
        ├── api.ts             # Fungsi pemanggil endpoint REST API backend
        ├── exportCsv.ts       # Helper ekspor data tabel ke berkas format .csv
        ├── imageCompressor.ts # Kompresi otomatis gambar sebelum diunggah ke server
        └── secureSession.ts   # Helper enkripsi peran pengguna pada local/sessionStorage
```
