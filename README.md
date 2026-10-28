# Azatech Online Shop — Order Management System

Aplikasi Fullstack Web Developer untuk sistem pengelolaan katalog produk, manajemen pelanggan, dan transaksi penjualan online shop dengan validasi stok atomik dan kalkulasi harga server-side.

Proyek ini dibangun untuk memenuhi **Technical Test — Medior Fullstack Developer** di **PT Laksmada Aza Simetri (Azatech)**.

---

## 1. Pilihan Tech Stack & Alasan

| Komponen | Pilihan | Alasan Pemilihan |
| :--- | :--- | :--- |
| **Backend Runtime & Bahasa** | Node.js 24 LTS + TypeScript (`strict: true`) | Menghadirkan *type-safety* menyeluruh dari skema validasi hingga model data, meminimalkan *runtime error*. |
| **Backend Framework** | Express.js 4.x | Kerangka kerja HTTP standar industri yang sangat transparan, mudah diuji, dan memisahkan *concerns* secara jelas (*Routes*, *Controllers*, *Services*, *Middlewares*). |
| **ORM & Migrasi** | Prisma ORM 5.x | Skema deklaratif yang presisi, auto-generated type-safe client, migrasi SQL otomatis, dan dukungan transaksi atomik (`prisma.$transaction`). |
| **Validasi Input** | Zod 3.x | Skema validasi terpusat yang aman, menghasilkan format error granular per *field* sesuai standar respons API Azatech. |
| **Autentikasi** | JWT (Access Token & Refresh Token) + Bcrypt | Standar stateless auth aman dengan hashing kata sandi tingkat tinggi (salt 10). |
| **Automated Testing** | Vitest 2.x + Supertest 7.x | Eksekusi tes super cepat, pengujian fitur *integration test* langsung pada HTTP layer dengan skenario sukses dan gagal. |
| **Database** | PostgreSQL 16 (disarankan) | Dukungan penuh transaksi ACID, enum native, foreign key constraints, dan indexing query cepat. |
| **Frontend** | React 19 + Next.js 15 (App Router) + TypeScript | Routing modern berbasis server/client components, performa tinggi, dan struktur kode modular. |
| **UI & Styling** | Tailwind CSS + Lucide React | Tampilan profesional, clean (*anti-slop*), ramah aksesibilitas (*a11y*), responsif pada perangkat mobile maupun desktop. |

---

## 2. Panduan Setup Cepat (Maksimal 6 Perintah)

### Opsi A: Menjalankan Menggunakan Docker Compose (Direkomendasikan)

Pastikan Docker Desktop aktif di komputer Anda, lalu jalankan:

```bash
# 1. Jalankan seluruh container (PostgreSQL, Backend, Frontend)
docker compose up --build
```
Aplikasi langsung berjalan:
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api](http://localhost:5000/api)
- Database otomatis dimigrasi dan diisi oleh seeder.

---

### Opsi B: Menjalankan Secara Manual (Lokal)

#### 1. Setup Backend
```bash
cd backend
npm install
cp .env.example .env
npx prisma generate
npm run dev
```

#### 2. Setup Frontend (Buka terminal baru)
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Akun Login Administrator (Seeder)
- **Email**: `admin@azatech.id`
- **Password**: `password123`
*(Tersedia tombol satu-klik **"⚡ Isi Kredensial Seeder"** di halaman login untuk kemudahan pengujian).*

---

## 3. Penjelasan Logika Aplikasi

### 3.1 Alur Pembuatan Order & Penanganan Stok
1. **Validasi Input & Autentikasi**:
   - Endpoint `POST /api/orders` diproteksi JWT middleware.
   - Input divalidasi via skema Zod (UUID customer dan array minimal 1 item).
2. **Kalkulasi Server-Side Strictly (Keamanan Harga)**:
   - Server **tidak pernah menerima harga atau subtotal** dari payload frontend.
   - Harga unit (`unit_price`) diambil langsung dari snapshot harga produk saat ini di database.
   - Subtotal per item dan `total_amount` dihitung secara eksklusif oleh server.
3. **Pemeriksaan Stok & Transaksi Atomik**:
   - Jika kuantitas produk yang diminta melebihi sisa stok (`product.stock < requested_quantity`), pesanan **langsung dibatalkan secara keseluruhan**.
   - Server mengembalikan HTTP status `422 Unprocessable Entity` dengan rincian error spesifik:
     ```json
     {
       "success": false,
       "message": "Stok tidak mencukupi",
       "errors": {
         "items.0.quantity": ["Stok Hydrococo 150ml tersisa 3, diminta 5"]
       }
     }
     ```
   - Seluruh langkah pembuatan record `orders`, `order_items`, dan pengurangan stok (`stock: { decrement: quantity }`) dieksekusi di dalam satu blok transaksi database `prisma.$transaction`. Jika terjadi kegagalan di tengah proses, seluruh perubahan dibatalkan (*rollback*) sehingga stok tidak berkurang.
4. **Format Nomor Order Unik**:
   - Format: `INV-YYYYMMDD-XXXX` (contoh: `INV-20261028-0001`).
   - Server menghitung urutan transaksi harian dan menambahkan padding 4 digit sequence.

### 3.2 Penanganan Penghapusan Produk & Pelanggan (Soft Delete)
- Produk dan pelanggan menggunakan mekanisme **Soft Delete** melalui kolom `deleted_at`.
- Ketika produk dihapus, produk tidak lagi muncul di daftar katalog aktif maupun dropdown pemesanan kasir, namun **seluruh data historis invoice order tetap valid dan utuh** beserta nama dan harga snapshot saat transaksi terjadi.

---

## 4. Cara Menjalankan Automated Test

Tes backend mencakup seluruh skenario wajib (buat order sukses, stok tidak cukup, validasi input gagal, akses tanpa token, dan operasi CRUD):

```bash
cd backend
npm test
```

### Hasil Ringkasan Pengujian (19 Tests Passing):
- `tests/order.test.ts`:
  - Akses tanpa token (HTTP 401)
  - Validasi input pesanan gagal (HTTP 422)
  - Stok tidak cukup dengan format error row index spesifik (HTTP 422)
  - Buat order sukses dengan kalkulasi server & pemotongan stok atomik (HTTP 201)
  - Riwayat order dengan filter tanggal dan pelanggan (HTTP 200)
- `tests/product.test.ts`:
  - List produk dengan pagination dan search
  - Validasi harga <= 0 dan kode kosong
  - Kode produk duplikat (HTTP 409 Conflict)
  - Soft delete produk
- `tests/customer.test.ts`:
  - Validasi gender & tanggal lahir
  - Penambahan pelanggan baru
- `tests/auth.test.ts`:
  - Validasi format email
  - Proteksi endpoint profile `/api/auth/me`

---

## 5. Dokumentasi API

Dokumentasi API lengkap tersedia dalam 2 format standar:
1. **OpenAPI / Swagger 3.0**: Berkas [`docs/openapi.yaml`](file:///C:/Users/theos/.gemini/antigravity/scratch/azatech-order-system/docs/openapi.yaml)
2. **Postman Collection v2.1**: Berkas [`docs/postman_collection.json`](file:///C:/Users/theos/.gemini/antigravity/scratch/azatech-order-system/docs/postman_collection.json)

---

## 6. Asumsi, Keterbatasan, & Rencana Peningkatan

### Asumsi
- Bisnis beroperasi dalam mata uang tunggal (IDR / Rupiah).
- Akses kasir dan manajemen dioperasikan oleh akun administrator toko terverifikasi.

### Keterbatasan Saat Ini
- Pemesanan saat ini beroperasi pada inventori single-warehouse (satu gudang terpusat).
- Penanganan concurrent checkout saat ini mengandalkan isolasi transaksi database relational.

### Rencana Peningkatan (Next Steps)
1. **Stock Reservation dengan Redis TTL**: Untuk skenario flash sale dengan ribuan transaksi per detik, implementasi lock reservasi stok sementara di memory-cache sebelum commit database.
2. **Payment Gateway Integration**: Menghubungkan alur pembayaran otomatis via Midtrans / Xendit (QRIS, VA, E-Wallet).
3. **Multi-Role RBAC**: Menambahkan pemisahan akses peran *Cashier*, *Warehouse Admin*, dan *Store Owner*.

---

## 7. Fitur Bonus yang Diimplementasikan

- **Docker Compose**: Menjalankan PostgreSQL, backend API, dan frontend Next.js hanya dengan 1 perintah `docker compose up`.
- **GitHub Actions CI**: Alur otomatis di [`.github/workflows/ci.yml`](file:///C:/Users/theos/.gemini/antigravity/scratch/azatech-order-system/.github/workflows/ci.yml) yang menjalankan *type-checking*, *linting*, dan *automated integration tests* pada setiap push/PR.
- **Grafik Penjualan Harian**: Visualisasi interaktif grafik tren omzet harian 14 hari terakhir di dashboard dengan SVG adaptif dan tooltip hover.
- **Export Riwayat Order ke CSV**: Tombol satu klik di halaman riwayat order untuk mengunduh laporan penjualan dalam format CSV / Excel.

---

## 8. AI Usage Disclosure (Transparansi Sesuai Ketentuan Hal. 6)

Sesuai ketentuan pengerjaan teknis:
- **Tools**: Google DeepMind Antigravity / Gemini CLI Assistant.
- **Bagian yang Dibantu**: Scaffolding skema DDL migrasi PostgreSQL, penyiapan dataset seeder Indonesia yang realistis, serta penulisan boilerplate Vitest mock integration test. Seluruh logika transaksi atomik, arsitektur layered service, kalkulasi server-side, dan UI Tailwind sepenuhnya dirancang mengikuti spesifikasi teknis Azatech dan standar *anti-slop*.
