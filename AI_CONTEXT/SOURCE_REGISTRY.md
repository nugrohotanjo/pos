# AI Context: Source Code Registry

> **Tujuan:** Registri seluruh berkas kode sumber yang telah diinspeksi untuk mencegah pemindaian ulang (*rescan*) atau pembacaan ganda yang tidak diperlukan.

---

## 1. Tabel Registri Berkas Sumber

| Path Berkas Sumber | Modul Terkait | Status Inspeksi | Referensi Dokumentasi | Perlu Inspeksi Ulang? |
| :--- | :--- | :--- | :--- | :--- |
| `docker-compose.yml` | Infrastruktur | Selesai Penuh | `doc/architecture.md`, `doc/tech_stack.md` | **Tidak** |
| `README.md` | Gambaran Umum | Selesai Penuh | `doc/architecture.md`, `AI_CONTEXT/MASTER.md` | **Tidak** |
| `pos-backend/go.mod` | Stack Backend | Selesai Penuh | `doc/tech_stack.md` | **Tidak** |
| `pos-backend/main.go` | Entry Point Backend | Selesai Penuh | `doc/architecture.md`, `doc/folder_structure.md` | **Tidak** |
| `pos-backend/Dockerfile.dev` | Tooling Backend | Selesai Penuh | `doc/tech_stack.md` | **Tidak** |
| `pos-backend/config/database.go` | Database & ORM | Selesai Penuh | `doc/architecture.md` | **Tidak** |
| `pos-backend/config/audit_plugin.go` | Modul 6 (Audit) | Diidentifikasi | `doc/architecture.md` | Saat Modul 6 |
| `pos-backend/models/user.go` | Modul 1 (Auth/RBAC) | Selesai Penuh | `doc/modules/module_01_auth_rbac.md` | **Tidak** |
| `pos-backend/models/product.go` | Modul 2 (Katalog) | Selesai Penuh | `doc/modules/module_02_catalog_products.md` | **Tidak** |
| `pos-backend/models/category.go` | Modul 2 (Kategori) | Selesai Penuh | `doc/modules/module_02_catalog_products.md` | **Tidak** |
| `pos-backend/models/brand.go` | Modul 2 (Brand) | Selesai Penuh | `doc/modules/module_02_catalog_products.md` | **Tidak** |
| `pos-backend/models/shelf.go` | Modul 2 (Rak) | Selesai Penuh | `doc/modules/module_02_catalog_products.md` | **Tidak** |
| `pos-backend/models/order.go` | Modul 3 (Order) | Selesai Penuh | `doc/modules/module_03_pos_terminal.md` | **Tidak** |
| `pos-backend/models/audit.go` | Modul 6 (Audit) | Diidentifikasi | `doc/architecture.md` | Saat Modul 6 |
| `pos-backend/models/setting.go` | Pengaturan | Diidentifikasi | `doc/folder_structure.md` | Saat Modul Pengaturan |
| `pos-backend/handlers/auth_middleware.go` | Modul 1 (Auth) | Selesai Penuh | `doc/modules/module_01_auth_rbac.md` | **Tidak** |
| `pos-backend/handlers/users.go` | Modul 1 (Auth/RBAC) | Selesai Penuh | `doc/modules/module_01_auth_rbac.md` | **Tidak** |
| `pos-backend/handlers/products.go` | Modul 2 (Katalog) | Selesai Penuh | `doc/modules/module_02_catalog_products.md` | **Tidak** |
| `pos-backend/handlers/category.go` | Modul 2 (Kategori) | Selesai Penuh | `doc/modules/module_02_catalog_products.md` | **Tidak** |
| `pos-backend/handlers/brands.go` | Modul 2 (Brand) | Selesai Penuh | `doc/modules/module_02_catalog_products.md` | **Tidak** |
| `pos-backend/handlers/shelves.go` | Modul 2 (Rak) | Selesai Penuh | `doc/modules/module_02_catalog_products.md` | **Tidak** |
| `pos-backend/handlers/orders.go` | Modul 3 (Order) | Selesai Penuh | `doc/modules/module_03_pos_terminal.md` | **Tidak** |
| `pos-backend/handlers/audit_logs.go` | Modul 4 & 6 (Audit) | Selesai Penuh | `doc/modules/module_04_inventory_fifo.md` | **Tidak** |
| `pos-backend/utils/jwt.go` | Modul 1 (Auth) | Selesai Penuh | `doc/modules/module_01_auth_rbac.md` | **Tidak** |
| `pos-frontend/package.json` | Stack Frontend | Selesai Penuh | `doc/tech_stack.md` | **Tidak** |
| `pos-frontend/nginx.conf` | Web Server Frontend | Selesai Penuh | `doc/architecture.md` | **Tidak** |
| `pos-frontend/Dockerfile` & `dev` | Tooling Frontend | Selesai Penuh | `doc/tech_stack.md` | **Tidak** |
| `pos-frontend/src/App.tsx` | Router & Core Handlers | Selesai Penuh | `doc/architecture.md`, `doc/modules/` | **TIDAK (DILARANG BUKA KEMBALI)** |
| `pos-frontend/src/stores/useProductStore.ts` | State Produk | Selesai Penuh | `doc/architecture.md`, `doc/modules/module_02` | **Tidak** |
| `pos-frontend/src/services/api/client.ts` | API Client | Selesai Penuh | `doc/architecture.md`, `doc/modules/module_01` | **Tidak** |
| `pos-frontend/src/features/auth/api/authApi.ts` | Modul 1 (Auth) | Selesai Penuh | `doc/modules/module_01_auth_rbac.md` | **Tidak** |
| `pos-frontend/src/features/auth/LoginView.tsx` | Modul 1 (Auth) | Selesai Penuh | `doc/modules/module_01_auth_rbac.md` | **Tidak** |
| `pos-frontend/src/utils/secureSession.ts` | Modul 1 (Auth) | Selesai Penuh | `doc/modules/module_01_auth_rbac.md` | **Tidak** |
| `pos-frontend/src/features/products/ProductFormPage.tsx` | Modul 2 (Katalog) | Selesai Penuh | `doc/modules/module_02_catalog_products.md` | **Tidak** |
| `pos-frontend/src/features/pos/PosView.tsx` | Modul 3 (POS) | Selesai Penuh | `doc/modules/module_03_pos_terminal.md` | **Tidak** |
| `pos-frontend/src/features/products/StockLedgerView.tsx` | Modul 4 (Stok) | Selesai Penuh | `doc/modules/module_04_inventory_fifo.md` | **Tidak** |
| `pos-store/package.json` | Modul 7 (Storefront) | Diidentifikasi | `AI_CONTEXT/MASTER.md` | Saat Modul 7 |

---

## 2. Aturan Akses Kode Sumber untuk Sesi Berikutnya
1. **Dilarang membuka kembali berkas yang berstatus "Selesai Penuh"** tanpa izin khusus jika tujuannya hanya mencari ulang informasi yang sudah ada pada tabel di atas.
2. Informasi logika mutasi, pemotongan stok FIFO, PPN, dan otentikasi dari `App.tsx` sudah disarikan sepenuhnya ke dalam modul dokumentasi; **jangan membuka `App.tsx` lagi**.
3. Sesi berikutnya hanya diperbolehkan membuka berkas baru yang secara eksplisit terdaftar di `AI_CONTEXT/TASK_QUEUE.md`.
