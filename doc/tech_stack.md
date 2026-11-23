# Dokumentasi Tumpukan Teknologi (Tech Stack)

Dokumen ini menginventarisasi seluruh tumpukan teknologi (*technology stack*), pustaka dependensi (*libraries*), dan perkakas (*tooling*) yang diimplementasikan pada aplikasi **pos-backend** dan **pos-frontend**.

---

## 1. Tumpukan Teknologi Backend (`pos-backend`)

Layanan backend dirancang dengan fokus pada performa tinggi, konkurensi efisien, dan konsumsi memori (*memory footprint*) yang sangat rendah.

### A. Komponen Inti (Core Stack)
| Komponen | Nama Teknologi | Versi | Peran & Alasan Penggunaan |
| :--- | :--- | :--- | :--- |
| **Bahasa Pemrograman** | Go (Golang) | `1.26.10` / `1.23+` | Performa kompilasi tinggi, konkurensi native (*goroutine*), konsumsi memori hemat (~15-30 MB) |
| **HTTP Framework** | Gin Web Framework | `v1.12.0` | Routing berbasis Radix Tree berkecepatan tinggi, middleware ekstensif, dan penanganan REST API yang ekspresif |
| **ORM Layer** | GORM | `v1.31.2` | Pemetaan objek relasional, auto-migrasi skema tabel, dukungan relasi multi-level, serta lifecycle hook callback |
| **Database Driver** | PostgreSQL Driver | `v1.6.3` | Driver resmi GORM untuk PostgreSQL berbasis driver berkinerja tinggi `pgx/v5` (`v5.10.0`) |
| **Basis Data** | PostgreSQL | `16-Alpine` | Database relasional tangguh dengan dukungan tipe data modern seperti `JSONB` untuk RBAC permissions |

### B. Keamanan & Utilitas Backend
| Paket / Library | Repositori | Fungsi Teknis |
| :--- | :--- | :--- |
| **JWT (JSON Web Token)** | `github.com/golang-jwt/jwt/v5` (v5.3.1) | Pembangkitan dan validasi token sesi kasir (dual-mode HttpOnly Cookie & Authorization Bearer) |
| **Device Fingerprinting** | `crypto/sha256` (Standard Lib) | Pembuatan hash sidik jari perangkat dari string `User-Agent` untuk mencegah *session hijacking* |
| **JSON Serializer** | `github.com/bytedance/sonic` (v1.15.2) | Pustaka serialisasi/deserialisasi JSON berkinerja ekstrim berbasis instruksi JIT assembly |
| **Validasi Input** | `github.com/go-playground/validator/v10` (v10.30.3) | Validasi otomatis anotasi binding struct request payload |
| **Audit Hook Plugin** | Internal GORM Plugin (`config/audit_plugin.go`) | Pelacakan otomatis mutasi data (CREATE, UPDATE, DELETE) lengkap dengan Old/New Values |

### C. Lingkungan Pengembangan & Containerization Backend
- **Hot-Reloading Development:** Air (`github.com/air-verse/air`) via `.air.toml` untuk kompilasi ulang instan saat file `.go` berubah.
- **Docker Image Dev:** `golang:alpine` dilengkapi perkakas git dan air.

---

## 2. Tumpukan Teknologi Frontend (`pos-frontend`)

Aplikasi frontend beroperasi sebagai antarmuka kasir (POS Terminal) serta dashboard administrasi toko ritel.

### A. Komponen Inti (Core Stack)
| Komponen | Nama Teknologi | Versi | Peran & Alasan Penggunaan |
| :--- | :--- | :--- | :--- |
| **Framework UI** | React | `v19.2.8` | Rendering antarmuka modern dengan arsitektur komponen modular |
| **Virtual DOM Renderer** | React DOM | `v19.2.8` | Engine rendering komponen React ke DOM browser |
| **Bahasa Pemrograman** | TypeScript | `~6.0.2` | Tipe data statis ketat (*strict typing*) untuk meminimalkan *runtime error* pada kalkulasi kasir |
| **Bundler & Dev Server** | Vite | `v8.3.0` | Server lokal berkecepatan tinggi berbasis native ES Modules dan Hot Module Replacement (HMR) cepat |
| **Plugin Vite** | `@vitejs/plugin-react` | `v6.1.1` | Dukungan kompilasi JSX/TSX React dan Fast Refresh |

### B. Routing & State Management
| Komponen | Nama Teknologi | Versi | Peran & Alasan Penggunaan |
| :--- | :--- | :--- | :--- |
| **Routing SPA** | React Router DOM | `v7.18.5` | Sinkronisasi URL browser (`/pos`, `/products`, `/reports`) tanpa reload halaman dan menjaga state sesi |
| **Global State** | Zustand | `v5.0.16` | State manager ringkas tanpa boilerplate untuk katalog produk, pagination server, dan mutasi data |
| **Local / Context State** | React Hooks (`useState`, `useRef`) | Built-in | Pengelolaan state transaksi keranjang (*Cart*), event listener keyboard kasir, dan modal |

### C. Styling & Komponen UI
| Komponen | Nama Teknologi | Versi | Peran & Alasan Penggunaan |
| :--- | :--- | :--- | :--- |
| **CSS Framework** | Tailwind CSS v4 | `v4.3.3` | Engine styling utility-first generasi terbaru tanpa konfigurasi file kompleks (`@import "tailwindcss";`) |
| **Vite Integration** | `@tailwindcss/vite` | `v4.3.3` | Integrasi langsung Tailwind v4 dengan build pipeline Vite |
| **Utility Class Merging** | `clsx` & `tailwind-merge` | `v2.1.1` & `v3.7.0` | Penggabungan kondisional kelas CSS Tailwind tanpa konflik hierarki style |
| **Ikonografi** | Lucide React | `v1.47.0` | Kumpulan ikon modern, bersih, dan hemat bobot bundle |

### D. Keamanan, Utilitas, & Production Web Server Frontend
| Komponen | Nama Teknologi / Metode | Fungsi Teknis |
| :--- | :--- | :--- |
| **Kriptografi Payload Login** | XOR Stream + Base64 + Nonce | Mengaburkan username dan PIN sebelum transmisi jaringan ke backend |
| **Enkripsi Sesi Klien** | Internal Obfuscation (`secureSession.ts`) | Menyandikan data hak akses peran sebelum disimpan ke `sessionStorage` |
| **Kompresi Gambar** | Canvas API Client-Side (`imageCompressor.ts`) | Menurunkan resolusi & ukuran file gambar produk sebelum diunggah |
| **Ekspor Laporan** | Blob CSV Generator (`exportCsv.ts`) | Menghasilkan berkas CSV riwayat transaksi langsung di browser |
| **Production Server** | Nginx Alpine | Melayani build statis dengan SPA fallback (`try_files`) & Reverse Proxy ke API backend |

---

## 3. Matriks Lingkungan: Development vs Production

| Aspek | Lingkungan Development | Lingkungan Production |
| :--- | :--- | :--- |
| **Orkestrator** | Docker Compose (`docker-compose.yml`) | Docker Compose / Docker Swarm / Kubernetes |
| **Eksekusi Backend** | Air Live Reload (`Dockerfile.dev`) | Binary Go terkompilasi statis (`CGO_ENABLED=0`) |
| **Eksekusi Frontend** | Vite Dev Server via Node 20 (`Dockerfile.dev` port 8001) | Nginx Alpine melayani `/app/dist` (`Dockerfile` multi-stage) |
| **Komunikasi Jaringan** | Host port mapping (`8000`, `8001`, `8002`, `5432`) | Reverse Proxy Nginx / Internal Docker Network |
| **CORS** | Mengizinkan origin lokal (`localhost:8001`, `localhost:8002`) | Dibatasi hanya pada domain resmi toko/admin |
| **PostgreSQL Data** | Docker Named Volume `pgdata` | Docker Named Volume / Cloud Managed PostgreSQL |
