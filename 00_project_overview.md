# Project Overview: BooQoo POS & Stock Management System

## Executive Summary

**BooQoo** adalah aplikasi POS (Point of Sale) dan Manajemen Stok yang dirancang khusus untuk UMKM rumahan, dengan fokus awal pada bisnis frozen food. Aplikasi ini memungkinkan pelaku usaha kecil dan menengah (terutama yang dijalankan oleh orang tua/ibu rumah tangga) untuk mengelola inventory produk, mencatat transaksi penjualan, dan melacak kas dengan interface yang ramah, intuitif, dan mudah diakses dari perangkat mobile.

---

## Product Definition

### Product Statement
**Untuk:** Orang tua, ibu rumah tangga, dan pelaku UMKM rumahan dengan pengetahuan teknologi minimal
**Keinginan:** Sistem manajemen penjualan dan stok yang mudah digunakan
**Keuntungan:** Dapat mengelola bisnis frozen food (atau produk serupa) tanpa perlu memahami sistem kasir kompleks atau membayar subscription mahal

### Core Value Propositions
1. **Kemudahan Penggunaan:** Interface ramah, tidak menggunakan jargon teknis, bahasa Indonesia yang mudah dipahami
2. **Offline-First:** Tetap bisa mencatat transaksi bahkan saat internet mati; data tersinkronisasi otomatis
3. **Mobile-Responsive:** Dirancang khusus untuk HP, tidak perlu beli hardware kasir tambahan
4. **Manajemen Stok Real-time:** Otomatis kurangi stok saat checkout, pantau batch dan kedaluwarsa produk (opsional)
5. **Laporan Kas Sederhana:** Dashboard harian untuk cek total penjualan dan kondisi stok dengan grafik yang mudah dipahami
6. **Multi-tenant Ready:** Setiap pengguna bisa membuat toko sendiri, mempersiapkan skalabilitas di masa depan

---

## Target User Personas

### Persona 1: Ibu Rumah Tangga Pengusaha Frozen Food
- **Nama:** Ibu Siti
- **Usia:** 45-55 tahun
- **Profil:** Membuat dan menjual frozen food (pempek, bakso, nugget) dari rumah. Jumlah SKU: 5-15 produk dengan varian.
- **Pain Points:**
  - Kesulitan mencatat stok secara manual (sering lupa atau salah hitung)
  - Tidak tahu berapa total penjualan dalam sehari
  - Khawatir produk kedaluwarsa tidak tercatat
  - Transaksi dicatat di buku tulis, rawan hilang atau rusak
- **Tech Literacy:** Bisa menggunakan WhatsApp dan browsing, tapi tidak familiar dengan sistem POS
- **Device Preference:** HP Android atau iPhone (lebih sering gunakan HP daripada laptop)

### Persona 2: Anak Muda Pemilik Starter Pack UMKM
- **Nama:** Adi
- **Usia:** 25-35 tahun
- **Profil:** Baru memulai bisnis frozen food, ingin sistem yang scalable tapi tidak mahal. Jumlah SKU: 3-10 produk.
- **Pain Points:**
  - Ingin track stok real-time tapi budget terbatas
  - Memerlukan laporan transaksi untuk catatan keuangan/pajak
  - Sering berjualan dari lokasi berbeda (sekolah, pasar, rumah)
  - Perlu sistem yang bisa diakses dari mana saja
- **Tech Literacy:** Familiar dengan aplikasi mobile, bisa setup akun, mengerti konsep sinkronisasi
- **Device Preference:** Smartphone dengan akses internet tidak stabil (perlu offline-first)

### Persona 3: Istri Pendamping (Co-operator)
- **Nama:** Eka
- **Usia:** 30-40 tahun
- **Profil:** Membantu suami/istri dalam operasional harian bisnis frozen food. Menangani penjualan dan stok.
- **Pain Points:**
  - Perlu laporan cepat tentang stok tersedia untuk menjawab pertanyaan pelanggan
  - Tidak perlu fitur yang terlalu kompleks
  - Ingin bisa lihat riwayat transaksi untuk laporan ke pemilik bisnis
- **Tech Literacy:** Intermediate (bisa handle mobile app dengan interface yang jelas)
- **Device Preference:** Smartphone yang selalu dibawa saat berjualan

---

## Core User Flows

### Flow 1: Setup Awal & Onboarding (First Time User)
```
User membuka app
    ↓
Lihat layar sambutan ramah (gambar produk frozen food)
    ↓
Klik "Mulai Sekarang"
    ↓
Buat Akun (Email/No HP + Password sederhana)
    ↓
Setup Profil Toko (Nama Toko, Daftar Produk Awal)
    ↓
Dashboard ditampilkan dengan tutorial interaktif
    ↓
Siap mulai input transaksi
```

**Durasi Target:** < 5 menit
**Output:** Toko aktif, produk siap dijual

---

### Flow 2: Restock (Input Produk Baru)
```
User membuka Dashboard
    ↓
Klik Menu "Manajemen Produk" atau "Stock In"
    ↓
Klik "Tambah Stok" / "Restock"
    ↓
Pilih produk dari daftar (dropdown dengan ikon/gambar)
    ↓
Input jumlah, harga beli (opsional), tanggal kedaluwarsa (opsional)
    ↓
Jika ada varian (misal: 3 batch rasa ayam, 2 batch rasa sapi), user bisa:
    - Pilih varian sebelum input jumlah
    - Atau langsung input untuk varian terpisah
    ↓
Klik "Catat Stok" → Konfirmasi dialog dengan review data
    ↓
Data tersimpan local terlebih dahulu (IndexedDB)
    ↓
Saat online, auto-sync ke server
    ↓
Notifikasi: "Stok berhasil dicatat ✓"
```

**Durasi Target:** < 2 menit per stok masuk
**Output:** Stok bertambah, history tercatat

---

### Flow 3: Checkout / Penjualan (Core POS Flow)
```
User di halaman "Kasir" / "Penjualan"
    ↓
Lihat daftar produk dengan ikon/gambar besar, harga, stok tersedia
    ↓
Klik produk → otomatis ditambahkan ke keranjang
    ↓
Untuk varian produk, tampilkan dialog kecil: "Pilih varian? (Rasa Ayam, Rasa Sapi)"
    ↓
Kasir bisa:
    - Ubah kuantitas dengan tombol +/- atau input langsung
    - Lihat subtotal real-time
    - Tambah produk lain (bisa swipe/scroll atau klik produk lagi)
    ↓
Review Keranjang (tampilkan total, sudah potong stok atau belum)
    ↓
Input Pembayaran:
    - Dropdown: Tunai / Transfer (no payment gateway, murni input nominal)
    - Input jumlah yang diterima (untuk tunai, auto-hitung kembalian)
    - Untuk transfer, dropdown pilih metode (BRI, BCA, OVO, dll) + input referensi
    ↓
Klik "Selesaikan Transaksi" / "Bayar"
    ↓
Konfirmasi Final (tampilkan ringkas transaksi, nama kasir, waktu)
    ↓
Stok otomatis berkurang di sistem
    ↓
Transaksi disimpan di local storage (offline mode) atau langsung ke server (online mode)
    ↓
Notifikasi sukses + opsi:
    - Cetak/Bagikan struk (WhatsApp/Email jika online)
    - Kembali ke halaman kasir untuk transaksi berikutnya
    ↓
History transaksi update di dashboard
```

**Durasi Target:** < 3 menit per transaksi
**Output:** Stok berkurang, transaksi tercatat, laporan kas update

---

### Flow 4: Laporan Kas & Dashboard
```
User membuka "Dashboard" / "Ringkasan Hari"
    ↓
Lihat Widget:
    1. Total Penjualan Hari Ini (Rp. XXX.XXX)
    2. Jumlah Transaksi (N transaksi)
    3. Top 3 Produk Terjual (dengan miniatur chart)
    4. Stok Menipis (produk dengan stok < threshold)
    5. Produk Akan Kedaluwarsa (upcoming expiry, jika enabled)
    ↓
User bisa drill-down:
    - Klik "Total Penjualan" → lihat list transaksi hari ini
    - Klik "Stok Menipis" → lihat detail produk dan restock options
    ↓
Filter/View Options:
    - By Date: Lihat laporan per hari/minggu/bulan
    - By Produk: Lihat penjualan produk spesifik
    ↓
Export Laporan (optional, untuk catatan pajak):
    - PDF / Excel (jika online)
```

**Durasi Target:** < 1 menit untuk overview
**Output:** Insight real-time tentang performa penjualan

---

### Flow 5: Offline-First Sinkronisasi
```
Scenario 1: User offline saat checkout
    - Transaksi dicatat lokal (IndexedDB)
    - UI menampilkan badge "⚠ Offline" atau icon internet
    - Stok tetap berkurang di lokal
    ↓
Scenario 2: User kembali online
    - Aplikasi auto-detect koneksi
    - Sync engine start: kirim transaksi offline ke server
    - Server validasi (cek duplik, stok cukup, dll)
    - Sukses → hapus dari pending
    - Gagal → tetap di lokal, retry nanti (notifikasi user)
    ↓
Scenario 3: User buka app saat online
    - Auto-sync transaksi pending
    - Fetch data produk/stok terbaru dari server
    - IndexedDB update
    - Dashboard menampilkan data yang paling fresh
```

**Durasi Target:** Sync selesai < 30 detik
**Output:** Data konsisten antara lokal dan server

---

## Measurable Goals & Success Metrics

| Goal | Metrik | Target |
|------|--------|--------|
| **Ease of Use** | Onboarding completion rate | 85% pengguna selesai setup < 5 menit |
| | Feature discoverability | 80% pengguna menemukan menu utama tanpa bantuan |
| **Offline Reliability** | Sync success rate | 99% transaksi offline berhasil sync saat online |
| **Data Accuracy** | Stok consistency | 100% stok di server = stok lokal setelah sync |
| **Performance** | Page load time (mobile 4G) | < 3 detik untuk halaman utama |
| | Checkout duration | < 3 menit dari scan produk sampai konfirmasi |
| **User Retention** | Daily active users (DAU) | 80% dari registered users buka app minimal 3x/minggu |
| **Scalability** | Max concurrent users per tenant | Minimal 50 user per toko (optimasi server) |

---

## Out-of-Scope (What We're NOT Building)

### ❌ Payment Gateway Integration
- Tidak ada integrasi Stripe, Midtrans, GCash, dll
- Sistem input pembayaran murni manual (Cash/Transfer reference)
- Alasan: Kompleksitas PCI compliance, cost, dan target user belum butuh automation pembayaran

### ❌ Advanced Analytics & BI
- Tidak ada predictive analytics, forecasting, atau machine learning
- Laporan terbatas pada: daily sales, product performance, stock snapshot
- Alasan: Overkill untuk UMKM awal, menambah complexity

### ❌ Multi-Cashier Management (Fase 1)
- Fase 1: Satu akun per toko (satu kasir utama)
- Multi-user/multi-cashier tracking akan ditambah fase 2 jika ada demand

### ❌ Inventory Reconciliation / Audit Trail Kompleks
- Tidak ada fitur "stock opname" otomatis
- User harus manual reconcile via "Adjustment" screen (fase 2)

### ❌ Customer Loyalty & CRM
- Tidak ada program membership atau poin reward
- Alasan: Fokus pada core POS dulu, baru tambah fase 2

### ❌ Supply Chain & Supplier Management
- Tidak ada fitur auto-order ke supplier atau purchase order
- Alasan: Masih scope management stok internal

### ❌ Compliance & Tax Automation
- Tidak ada auto-generate laporan pajak/PPh 21
- User harus export manual laporan dan serahkan ke akuntan
- Alasan: Kompleksitas regulasi Indonesia, butuh konsultasi khusus

### ❌ WhatsApp/Telegram Integration (Fase 1)
- Tidak ada bot WA untuk cek stok atau terima order
- Akan ditambah fase 2 jika user request

### ❌ Hardware Integration (Fase 1)
- Tidak ada support barcode scanner, thermal printer, PinPad
- Semua input manual dari keyboard/touch screen
- Hardware integration akan ditambah saat move ke versi desktop/kiosk

---

## Rollout & Phase Plan

### Phase 1: MVP (Minimal Viable Product) - Target Bulan 1-2
- ✅ Onboarding & Setup Toko
- ✅ Manajemen Produk Dasar (CRUD tanpa batch/expiry)
- ✅ POS Checkout (tanpa pembayaran terintegrasi)
- ✅ Laporan Kas Sederhana
- ✅ Offline-First dengan sinkronisasi

**Target Users:** 10-20 toko pilot (closed beta)

### Phase 2: Enhancement - Target Bulan 3-4
- ✅ Batch & Expiry Date Tracking (optional per produk)
- ✅ Multi-user/Multi-cashier dengan role (Owner, Cashier, Viewer)
- ✅ Stock Adjustment & Reconciliation
- ✅ Enhanced Reports (Weekly, Monthly, Product breakdown)
- ✅ WhatsApp Integration (order notification, stok status)

**Target Users:** 50-100 toko

### Phase 3: Expansion - Target Bulan 5-6
- ✅ Native Android App (using React Native / Flutter)
- ✅ Advanced Analytics & Dashboard
- ✅ Supplier Management & Purchase Order
- ✅ Loyalty Program & CRM (basic)

**Target Users:** 500+ toko

---

## Success Criteria (End of Phase 1)

1. **Functionality:** Semua core feature dari MVP berjalan stabil (no critical bugs)
2. **Usability:** 85%+ pengguna pilot dapat melakukan checkout tanpa tutorial
3. **Performance:** Mobile load time < 3s, offline-first bekerja sempurna
4. **Data Integrity:** 0 data loss, sync konsisten 100%
5. **User Satisfaction:** NPS (Net Promoter Score) > 50 dari feedback pengguna pilot

---

## Assumptions & Dependencies

| Assumption | Risk | Mitigation |
|-----------|------|-----------|
| User punya smartphone (Android/iOS) | Rendah | Target market sudah punya HP; jika tidak, provide tablet sharing option |
| Minimal internet connection (2-3x/hari) | Rendah | Offline-first design handle ini; user diajarkan sync time |
| User bersedia input data produk awal | Rendah | Provide CSV import template (fase 2) |
| Database PostgreSQL/MySQL tersedia | Rendah | Gunakan managed service (Railway, Supabase, PlanetScale) |
| Tidak butuh payment gateway | Rendah | Manual input reference untuk transfer OK per user feedback |

---

## Document Version
- **Version:** 1.0
- **Created:** 2026-05-22
- **Last Updated:** 2026-05-22
- **Maintained By:** Solutions Architect
