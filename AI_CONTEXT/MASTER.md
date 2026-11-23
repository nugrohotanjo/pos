# AI Context: Master Documentation

> **Status:** Active Master Context  
> **Terakhir Diperbarui:** 2026-11-23  
> **Tujuan:** Sumber kebenaran kontekstual (*single source of context*) untuk agen AI dalam menganalisis, mengembangkan, dan memelihara proyek POS Enterprise tanpa pembacaan ulang file yang tidak perlu.

---

## 1. Ikhtisar Proyek (Project Overview)
- **Nama Proyek:** POS Enterprise (Ritel Serba Rp35.000)
- **Model Bisnis:** Ritel terpadu dengan integrasi Terminal Kasir (Keyboard-first), Dashboard Admin, dan Katalog Pembeli (Storefront). Konsep dasar harga serba Rp35.000 dengan dukungan varian, grosir dinamis, serta HPP FIFO.
- **Topologi:** Multi-container Docker (PostgreSQL 16, Go Gin REST API, React 19 Frontend Dashboard, React Storefront).

---

## 2. Peta Arsitektur & Tumpukan Teknologi
Dokumentasi teknis lengkap tersedia di:
- [doc/architecture.md](../doc/architecture.md)
- [doc/folder_structure.md](../doc/folder_structure.md)
- [doc/tech_stack.md](../doc/tech_stack.md)

### Ringkasan Stack:
- **Backend (`pos-backend`):** Go v1.26.10, Gin v1.12.0, GORM v1.31.2, PostgreSQL Driver v1.6.3 (`pgx/v5`), JWT v5.3.1, Sonic JSON, Air live-reloading. Port `:8000`.
- **Frontend (`pos-frontend`):** React 19.2.8, TypeScript ~6.0.2, Vite 8.3.0, Tailwind CSS v4.3.3, React Router DOM v7.18.5, Zustand v5.0.16, Lucide React, Nginx Alpine. Port `:8001`.
- **Storefront (`pos-store`):** React 19.3.1, Vite, Tailwind CSS v3, React Router DOM v7. Port `:8002`.
- **Database (`pos-db`):** PostgreSQL 16 Alpine, port `:5432`, volume persisten `pgdata`.

---

## 3. Entry Points & Routing Inti

### Backend (`pos-backend/main.go`)
- **Public:**
  - `GET /api/health`
  - `POST /api/v1/auth/login`
  - `POST /api/v1/products/upload-image`
- **Protected (`RequireAuth` Middleware - Cookie + Bearer + Device Hash Binding):**
  - `GET /api/v1/auth/me`, `POST /api/v1/auth/logout`
  - `GET/POST/PUT/DELETE /api/v1/categories` (dengan dukungan struktur pohon via `?tree=true`)
  - `GET/POST/DELETE /api/v1/brands`, `GET/POST/DELETE /api/v1/shelves`
  - `GET/POST/PUT/DELETE /api/v1/products`, `PATCH /products/:barcode/archive`
  - `GET /api/v1/audit-logs`, `GET/PUT /api/v1/settings`
  - `GET/POST/PUT /api/v1/roles`, `PUT /roles/:id/permissions`
  - `GET/POST/PUT /api/v1/employees`, `PATCH /employees/:id/toggle-status`
  - `POST /api/v1/orders`

### Frontend (`pos-frontend/src/App.tsx`)
- Menu/Rute Navigasi:
  - `/` atau `/dashboard` (Dashboard metrik & KPI)
  - `/pos` (Terminal Kasir Keyboard-First F1-F9)
  - `/products` (Manajemen katalog, SKU, form varian bertingkat)
  - `/categories` (Hirarki kategori master)
  - `/stock-ledger` (Buku besar kartu stok FIFO)
  - `/reports` (Laporan omzet, laba kotor, PPN, settlement)
  - `/audit-trail` (Log jejak audit sistem)
  - `/users` (Manajemen staf kasir & hak akses peran)
  - `/settings` (Pengaturan parameter toko)

---

## 4. Skema Database Inti (PostgreSQL via GORM)
- **`products`**: ID, Barcode (unique), Name, CategoryID, BrandID, Condition, Price, CostPrice, Stock, MinStock, Unit, ShelfLocation, IsActive, HasVariant, dll.
- **`product_variants` & `product_variant_types`**: Opsi dan SKU varian spesifik (warna, ukuran, harga per varian).
- **`product_wholesale_prices`**: Aturan diskon grosir berjenjang (`min_qty`, `max_qty`, `unit_price`).
- **`categories`**: ID, Name, Slug, Description, ParentID (self-referencing tree).
- **`brands` & `shelves`**: Entitas pendukung organisasi fisik dan merk toko.
- **`orders`**: ID, OrderCode (unique), CustomerName, Phone, OrderMethod, TotalAmount, CreatedAt.
- **`employees`**: ID, Name, Username, Pin, RoleID, Phone, IsActive, TokenVersion.
- **`roles`**: ID, Name, Description, IsSystem, Permissions (JSONB).
- **`audit_logs`**: ID, Module, Action, User, Details, OldValues, NewValues, Timestamp.
- **`settings`**: ID, AppName, ReceiptHeader, ReceiptFooter, MinStockAlert, Currency, dll.

---

## 5. Daftar Modul Bisnis untuk Dokumentasi Inkremental
1. [x] [**Modul 1: Auth & Keamanan Sesi**](../doc/modules/module_01_auth_rbac.md) (JWT HttpOnly, Device Binding, Role Permissions, Token Versioning)
2. [x] [**Modul 2: Katalog Produk, Kategori, & Varian**](../doc/modules/module_02_catalog_products.md) (Hierarchical Categories, Multi-Variant Matrix, Tier Grosir, Barcode Scanner)
3. [x] [**Modul 3: Terminal Kasir POS & Transaksi Order**](../doc/modules/module_03_pos_terminal.md) (Shortcut F1-F9, Kalkulasi PPN 11% item-level, Cetak Struk 58/80mm, Void, Hold Transaksi)
4. [x] [**Modul 4: Inventaris & HPP FIFO**](../doc/modules/module_04_inventory_fifo.md) (Kartu Stok, Batch Masuk Keluar, Toleransi Minus, Opname)
5. [ ] **Modul 5: Laporan & Finansial** (Omzet, Settlement MDR QRIS/EDC, Net Margin, Ekspor CSV)
6. [ ] **Modul 6: Audit Trail & Logging** (GORM Hook Plugin, Jejak Perubahan Field)
7. [ ] **Modul 7: Storefront & Katalog Publik** (`pos-store`)
