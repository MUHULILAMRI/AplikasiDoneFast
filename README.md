<p align="center">
  <img src="https://img.shields.io/badge/Next.js-15.3-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-6.7-2D3748?style=for-the-badge&logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/TailwindCSS-4-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
</p>

# 🚀 DoneFast — Platform Jasa Digital #1 Indonesia

**DoneFast** adalah platform marketplace jasa digital yang menghubungkan pelanggan dengan tim profesional (Joki) untuk menyelesaikan berbagai tugas — mulai dari tugas akademik, coding, desain arsitektur, konsultasi, hingga solusi AI & teknologi.

> _"Tugas selesai lebih cepat dari yang kamu bayangkan."_

---

## 📑 Daftar Isi

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Arsitektur Aplikasi](#-arsitektur-aplikasi)
- [Fitur Lengkap](#-fitur-lengkap)
- [Struktur Proyek](#-struktur-proyek)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Instalasi & Setup](#-instalasi--setup)
- [Environment Variables](#-environment-variables)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Deployment](#-deployment)
- [Design System](#-design-system)
- [Screenshot](#-screenshot)
- [Kontribusi](#-kontribusi)
- [Lisensi](#-lisensi)

---

## 🌟 Overview

DoneFast dibangun sebagai **full-stack Next.js application** dengan arsitektur monolith modern. Seluruh frontend, backend API, dan database layer berada dalam satu codebase. Aplikasi ini memiliki **3 role utama**: Customer, Admin, dan Joki — masing-masing dengan dashboard dan fungsionalitas tersendiri.

### Highlights

- 🎨 **Dark Mode Premium** — UI gelap dengan glassmorphism, gradient glow, dan micro-animations
- 🔐 **JWT Authentication** — Sistem auth lengkap dengan route protection via middleware
- 💳 **Payment Integration** — Sistem pembayaran dengan QRIS, DANA, OVO, Bank Transfer
- 💬 **Real-time Chat** — Komunikasi langsung antara customer dan joki per order
- 🤖 **AI-Powered** — Chatbot cerdas, estimasi harga otomatis, dan rekomendasi layanan
- 📱 **Fully Responsive** — Optimized untuk desktop dan mobile devices
- 🎯 **Role-Based Access** — Dashboard terpisah untuk Admin, Joki, dan Customer

---

## 🛠 Tech Stack

### Frontend
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Next.js** | 15.3.1 | Framework React full-stack dengan App Router |
| **React** | 19.1.0 | UI Library |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.x | Utility-first CSS framework |
| **Framer Motion** | 11.18.0 | Animasi dan transisi |
| **Lucide React** | 0.475.0 | Icon library |
| **Zustand** | 5.0.4 | State management |
| **React Hot Toast** | 2.5.2 | Notifikasi toast |

### Backend
| Teknologi | Versi | Kegunaan |
|-----------|-------|----------|
| **Next.js API Routes** | 15.3.1 | RESTful API endpoints |
| **Prisma ORM** | 6.7.0 | Database ORM & migration |
| **PostgreSQL** | 16.x | Database utama |
| **Supabase** | 2.49.4 | Database hosting & storage |
| **Jose** | 5.10.0 | JWT token generation & verification |

### Fonts
- **Geist Sans** — Body text
- **Geist Mono** — Code / monospace
- **Plus Jakarta Sans** — Display headings

---

## 🏗 Arsitektur Aplikasi

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND                          │
│  ┌─────────┐  ┌──────────┐  ┌───────────────────┐  │
│  │ Landing  │  │ Customer │  │   Admin Dashboard  │  │
│  │  Page    │  │  Pages   │  │   Joki Dashboard   │  │
│  └─────────┘  └──────────┘  └───────────────────┘  │
│                      │                               │
│              ┌───────┴───────┐                       │
│              │   Middleware   │ (Route Protection)    │
│              └───────┬───────┘                       │
├──────────────────────┼──────────────────────────────┤
│                   BACKEND                            │
│              ┌───────┴───────┐                       │
│              │  API Routes   │                       │
│              │  /api/*       │                       │
│              └───────┬───────┘                       │
│              ┌───────┴───────┐                       │
│              │  Auth Layer   │ (JWT + RBAC)           │
│              └───────┬───────┘                       │
│              ┌───────┴───────┐                       │
│              │  Prisma ORM   │                       │
│              └───────┬───────┘                       │
├──────────────────────┼──────────────────────────────┤
│                  DATABASE                            │
│              ┌───────┴───────┐                       │
│              │  PostgreSQL   │ (Supabase)             │
│              └───────────────┘                       │
└─────────────────────────────────────────────────────┘
```

---

## ✨ Fitur Lengkap

### 🏠 Landing Page
- **Hero Section** — Headline animasi shimmer dengan CTA buttons
- **Services Section** — Showcase kategori layanan dengan kartu interaktif
- **How It Works** — Penjelasan alur kerja dalam 4 langkah
- **Stats Section** — Counter animasi statistik platform
- **Testimonials** — Review pelanggan dengan carousel
- **CTA Section** — Call-to-action dengan gradient background
- **Navbar** — Responsive navbar dengan dropdown menu user
- **Footer** — Informasi kontak, link, dan social media

### 👤 Customer Features
| Fitur | Deskripsi |
|-------|-----------|
| **Registrasi & Login** | Autentikasi dengan email & password, JWT token |
| **Marketplace** | Browse & search semua layanan dengan filter kategori |
| **Detail Layanan** | Lihat deskripsi, harga, rating, dan fitur layanan |
| **Checkout** | Form pemesanan dengan estimasi harga otomatis |
| **Order Tracking** | Pantau status order real-time |
| **Chat dengan Joki** | Komunikasi langsung per order |
| **Profil** | Edit profil, lihat riwayat order |
| **Voucher** | Gunakan kode voucher untuk diskon |
| **Notifikasi** | Pemberitahuan status order & update penting |

### 🛡️ Admin Dashboard
| Fitur | Deskripsi |
|-------|-----------|
| **Dashboard Overview** | Ringkasan statistik pendapatan, order, dan pelanggan |
| **Order Management** | Lihat semua order, assign joki, lihat detail, batalkan order |
| **Tim Joki** | Kelola anggota joki — tambah, edit, hapus, set availability |
| **Keuangan** | Laporan keuangan, pendapatan, dan transaksi |
| **Promo & Voucher** | Buat dan kelola voucher diskon |
| **Chat Management** | Pantau semua percakapan order |
| **Pelanggan** | Lihat daftar pelanggan terdaftar |
| **Laporan** | Laporan dan analitik bisnis |
| **Pengaturan** | Konfigurasi harga dasar per kategori, harga per halaman, pajak, dan multiplier deadline |

### 🎮 Joki Dashboard
| Fitur | Deskripsi |
|-------|-----------|
| **Dashboard Overview** | Ringkasan order aktif, komisi, dan statistik kinerja |
| **Order Saya** | Lihat order yang ditugaskan, update progress |
| **Upload Hasil** | Upload file hasil pekerjaan |
| **Chat** | Komunikasi dengan pelanggan per order |
| **Komisi** | Lihat riwayat dan jumlah komisi |
| **Review** | Lihat rating dan review dari pelanggan |
| **Pengaturan** | Kelola profil dan ketersediaan |

### 🤖 AI Features
| Fitur | Deskripsi |
|-------|-----------|
| **AI Chatbot** | Chatbot pintar yang menjawab FAQ seputar DoneFast |
| **Estimasi Harga** | Kalkulasi otomatis berdasarkan kategori, halaman, dan deadline |
| **Rekomendasi Layanan** | Saran layanan berdasarkan kebutuhan pelanggan |

### 🔒 Security
- **JWT Authentication** — Token-based auth dengan expiry 7 hari
- **Password Hashing** — PBKDF2 dengan salt via Web Crypto API
- **Role-Based Access Control (RBAC)** — 3 level: Customer, Admin, Joki
- **Route Protection** — Middleware Next.js untuk proteksi halaman
- **API Guards** — `requireRole()` dan `authenticateRequest()` helpers

---

## 📁 Struktur Proyek

```
AplikasiDoneFast/
├── README.md
├── .github/                      # GitHub configurations
└── frontend/                     # Next.js application
    ├── package.json              # Dependencies & scripts
    ├── next.config.ts            # Next.js configuration
    ├── tsconfig.json             # TypeScript configuration
    ├── postcss.config.mjs        # PostCSS + Tailwind config
    ├── prisma.config.ts          # Prisma configuration
    ├── .env.local                # Environment variables
    │
    ├── prisma/
    │   ├── schema.prisma         # Database schema (12 models)
    │   └── seed.ts               # Database seeder
    │
    ├── public/                   # Static assets
    │   ├── file.svg
    │   ├── globe.svg
    │   ├── next.svg
    │   ├── vercel.svg
    │   └── window.svg
    │
    └── src/
        ├── middleware.ts          # Route protection middleware
        │
        ├── app/
        │   ├── layout.tsx        # Root layout (fonts, metadata, providers)
        │   ├── page.tsx          # Landing page
        │   ├── globals.css       # Global styles & design system
        │   ├── loading.tsx       # Global loading state
        │   ├── error.tsx         # Global error boundary
        │   ├── not-found.tsx     # Custom 404 page
        │   │
        │   ├── login/            # Login page
        │   ├── register/         # Registration page
        │   ├── marketplace/      # Services marketplace
        │   ├── order/            # Single order detail
        │   ├── orders/           # Customer order list
        │   ├── checkout/         # Order checkout flow
        │   ├── tracking/         # Order tracking
        │   ├── chat/             # Chat per order
        │   │
        │   ├── dashboard/
        │   │   ├── admin/        # 🛡️ Admin dashboard
        │   │   │   ├── layout.tsx        # Admin sidebar layout
        │   │   │   ├── page.tsx          # Dashboard overview
        │   │   │   ├── orders/           # Order management
        │   │   │   ├── team/             # Joki team management
        │   │   │   ├── finance/          # Financial reports
        │   │   │   ├── promo/            # Voucher management
        │   │   │   ├── chat/             # Chat monitoring
        │   │   │   ├── customers/        # Customer list
        │   │   │   ├── reports/          # Analytics
        │   │   │   └── settings/         # Site settings
        │   │   │
        │   │   └── joki/         # 🎮 Joki dashboard
        │   │       ├── layout.tsx        # Joki sidebar layout
        │   │       ├── page.tsx          # Dashboard overview
        │   │       ├── orders/           # Assigned orders
        │   │       ├── upload/           # File upload
        │   │       ├── chat/             # Chat with customers
        │   │       ├── commission/       # Commission history
        │   │       ├── reviews/          # Reviews & ratings
        │   │       └── settings/         # Profile settings
        │   │
        │   └── api/              # 🔌 Backend API Routes
        │       ├── auth/
        │       │   ├── login/            # POST - Login
        │       │   ├── register/         # POST - Register
        │       │   ├── me/               # GET/PATCH - Profile
        │       │   └── change-password/  # POST - Change password
        │       │
        │       ├── orders/
        │       │   ├── route.ts          # GET (list) / POST (create)
        │       │   └── [id]/
        │       │       ├── route.ts      # GET (detail) / PATCH (update)
        │       │       └── tracking/     # GET - Order tracking
        │       │
        │       ├── admin/
        │       │   ├── dashboard/        # GET - Admin stats
        │       │   ├── finance/          # GET - Financial data
        │       │   ├── orders/[id]/
        │       │   │   ├── assign/       # POST - Assign joki
        │       │   │   └── cancel/       # POST - Cancel order
        │       │   └── team/             # CRUD - Joki team
        │       │
        │       ├── joki/
        │       │   ├── dashboard/        # GET - Joki stats
        │       │   ├── commission/       # GET - Commission data
        │       │   └── orders/           # Joki order management
        │       │
        │       ├── chat/
        │       │   ├── [orderId]/        # GET/POST - Messages
        │       │   └── unread/           # GET - Unread counts
        │       │
        │       ├── payment/
        │       │   ├── create/           # POST - Create payment
        │       │   ├── verify/           # GET - Verify payment
        │       │   └── webhook/          # POST - Payment webhook
        │       │
        │       ├── services/             # GET - List/detail services
        │       ├── vouchers/             # CRUD - Vouchers
        │       ├── notifications/        # GET/PATCH - Notifications
        │       ├── settings/             # GET/PUT - Site settings
        │       └── ai/
        │           ├── chatbot/          # POST - AI chatbot
        │           ├── estimate-price/   # POST - Price estimation
        │           └── recommend/        # POST - Recommendations
        │
        ├── components/
        │   ├── AuthProvider.tsx           # Auth context provider
        │   ├── FloatingActions.tsx        # Floating WhatsApp & chatbot
        │   ├── PageTransition.tsx         # Page transition wrapper
        │   ├── ServiceCardSkeleton.tsx    # Loading skeleton
        │   ├── landing/                   # Landing page sections
        │   │   ├── HeroSection.tsx
        │   │   ├── ServicesSection.tsx
        │   │   ├── HowItWorksSection.tsx
        │   │   ├── StatsSection.tsx
        │   │   ├── TestimonialsSection.tsx
        │   │   └── CTASection.tsx
        │   └── layout/
        │       ├── Navbar.tsx             # Main navigation bar
        │       └── Footer.tsx             # Site footer
        │
        ├── lib/
        │   ├── api.ts                     # API client (fetch wrapper)
        │   ├── auth.ts                    # Auth utilities (JWT, hash)
        │   ├── prisma.ts                  # Prisma client singleton
        │   ├── supabase.ts               # Supabase client
        │   ├── utils.ts                   # Utility functions
        │   └── data.ts                    # Static data & constants
        │
        ├── store/
        │   └── useAppStore.ts            # Zustand global store
        │
        └── types/
            └── index.ts                  # TypeScript type definitions
```

---

## 🗄 Database Schema

Aplikasi menggunakan **12 model** Prisma dengan PostgreSQL:

```prisma
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│    User      │     │    Order      │     │   Service    │
│─────────────│     │──────────────│     │─────────────│
│ id           │◄───┤ user_id       │────►│ id           │
│ name         │    │ service_id    │     │ name         │
│ email        │    │ joki_id       │     │ category     │
│ password_hash│    │ title         │     │ base_price   │
│ role (enum)  │    │ description   │     │ features[]   │
│ phone        │    │ price         │     │ rating       │
│ avatar       │    │ status (enum) │     │ is_popular   │
│ balance      │    │ deadline      │     └─────────────┘
│ is_vip       │    │ progress      │
└──────┬───────┘    │ voucher_id    │     ┌─────────────┐
       │            └──────┬───────┘     │ JokiMember   │
       │                   │             │─────────────│
       │                   ├────────────►│ id           │
       │                   │             │ user_id      │
       │            ┌──────┴───────┐     │ name         │
       │            │ ChatMessage   │     │ skills[]     │
       │            │──────────────│     │ rating       │
       ├───────────►│ sender_id     │     │ commission   │
       │            │ order_id      │     │ is_available │
       │            │ message       │     └─────────────┘
       │            │ sender_role   │
       │            └──────────────┘     ┌─────────────┐
       │                                 │ Transaction  │
       │            ┌──────────────┐     │─────────────│
       ├───────────►│ Notification  │     │ order_id     │
       │            │──────────────│     │ user_id      │
       │            │ title         │     │ amount       │
       │            │ message       │     │ method (enum)│
       │            │ type (enum)   │     │ status (enum)│
       │            │ is_read       │     │ payment_url  │
       │            └──────────────┘     └─────────────┘
       │
       │            ┌──────────────┐     ┌─────────────┐
       ├───────────►│  Referral     │     │  Voucher     │
       │            │──────────────│     │─────────────│
       │            │ referrer_id   │     │ code         │
       │            │ referred_id   │     │ discount_%   │
       │            │ reward        │     │ max_discount │
       │            └──────────────┘     │ valid_until  │
       │                                 │ max_usage    │
       │            ┌──────────────┐     └─────────────┘
       │            │ SiteSettings  │
       │            │──────────────│
       │            │ key           │
       │            │ value         │
       │            └──────────────┘
```

### Enums

| Enum | Values |
|------|--------|
| `UserRole` | `CUSTOMER`, `ADMIN`, `JOKI` |
| `ServiceCategory` | `AKADEMIK`, `ARSITEKTUR`, `CODING`, `KONSULTASI`, `AI_TEKNOLOGI` |
| `OrderStatus` | `PENDING_PAYMENT`, `PAID`, `IN_PROGRESS`, `REVISION`, `COMPLETED`, `CANCELLED` |
| `DifficultyLevel` | `EASY`, `MEDIUM`, `HARD`, `EXPERT` |
| `PaymentMethod` | `QRIS`, `DANA`, `OVO`, `BANK_TRANSFER`, `EWALLET` |
| `PaymentStatus` | `PENDING`, `PAID`, `FAILED`, `REFUNDED` |
| `NotificationType` | `ORDER_UPDATE`, `FILE_READY`, `REVISION`, `DEADLINE`, `PAYMENT`, `PROMO` |

---

## 🔌 API Endpoints

### Authentication
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `POST` | `/api/auth/register` | Registrasi user baru | ❌ |
| `POST` | `/api/auth/login` | Login & dapatkan JWT token | ❌ |
| `GET` | `/api/auth/me` | Profil user yang login | ✅ |
| `PATCH` | `/api/auth/me` | Update profil | ✅ |
| `POST` | `/api/auth/change-password` | Ganti password | ✅ |

### Services
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `GET` | `/api/services` | List semua layanan (filter: category, search, sort) | ❌ |
| `GET` | `/api/services/[id]` | Detail layanan | ❌ |

### Orders
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `GET` | `/api/orders` | List orders (role-aware) | ✅ |
| `POST` | `/api/orders` | Buat order baru | ✅ |
| `GET` | `/api/orders/[id]` | Detail order | ✅ |
| `PATCH` | `/api/orders/[id]` | Update order (status, files, dll) | ✅ |
| `GET` | `/api/orders/[id]/tracking` | Tracking status order | ✅ |

### Admin
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `GET` | `/api/admin/dashboard` | Statistik dashboard admin | 🛡️ Admin |
| `GET` | `/api/admin/finance` | Data keuangan | 🛡️ Admin |
| `POST` | `/api/admin/orders/[id]/assign` | Assign joki ke order | 🛡️ Admin |
| `POST` | `/api/admin/orders/[id]/cancel` | Batalkan order | 🛡️ Admin |
| `GET` | `/api/admin/team` | List anggota joki | 🛡️ Admin |
| `POST` | `/api/admin/team` | Tambah anggota joki | 🛡️ Admin |
| `PATCH` | `/api/admin/team/[id]` | Update anggota joki | 🛡️ Admin |
| `DELETE` | `/api/admin/team/[id]` | Hapus anggota joki | 🛡️ Admin |

### Joki
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `GET` | `/api/joki/dashboard` | Statistik dashboard joki | 🎮 Joki |
| `GET` | `/api/joki/commission` | Data komisi | 🎮 Joki |
| `POST` | `/api/joki/orders/[id]/upload` | Upload hasil kerja | 🎮 Joki |

### Chat
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `GET` | `/api/chat/[orderId]` | Get messages per order | ✅ |
| `POST` | `/api/chat/[orderId]` | Kirim message | ✅ |
| `GET` | `/api/chat/unread` | Jumlah pesan belum dibaca | ✅ |

### Payment
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `POST` | `/api/payment/create` | Buat pembayaran | ✅ |
| `GET` | `/api/payment/verify/[id]` | Verifikasi pembayaran | ✅ |
| `POST` | `/api/payment/webhook` | Webhook dari payment gateway | ❌ |

### Vouchers
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `GET` | `/api/vouchers` | List vouchers | ✅ |
| `POST` | `/api/vouchers` | Buat voucher baru | 🛡️ Admin |
| `PATCH` | `/api/vouchers/[id]` | Update voucher | 🛡️ Admin |
| `DELETE` | `/api/vouchers/[id]` | Hapus voucher | 🛡️ Admin |
| `POST` | `/api/vouchers/validate` | Validasi kode voucher | ✅ |

### AI
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `POST` | `/api/ai/chatbot` | AI chatbot (FAQ DoneFast) | ✅ |
| `POST` | `/api/ai/estimate-price` | Estimasi harga berbasis AI | ✅ |
| `POST` | `/api/ai/recommend` | Rekomendasi layanan | ✅ |

### Settings
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `GET` | `/api/settings` | Get site settings | ✅ |
| `PUT` | `/api/settings` | Update site settings | 🛡️ Admin |

### Notifications
| Method | Endpoint | Deskripsi | Auth |
|--------|----------|-----------|------|
| `GET` | `/api/notifications` | List notifikasi | ✅ |
| `PATCH` | `/api/notifications` | Tandai notifikasi sudah dibaca | ✅ |

---

## 📦 Instalasi & Setup

### Prerequisites

Pastikan sudah terinstall:
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **PostgreSQL** 14+ (atau akun [Supabase](https://supabase.com))
- **Git**

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/AplikasiDoneFast.git
cd AplikasiDoneFast/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Salin file `.env.example` dan sesuaikan:

```bash
cp .env.local.example .env.local
```

Lihat bagian [Environment Variables](#-environment-variables) untuk detail.

### 4. Setup Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema ke database
npx prisma db push

# (Optional) Seed database dengan data demo
npx prisma db seed
```

### 5. Jalankan Development Server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser.

---

## 🔐 Environment Variables

Buat file `.env.local` di folder `/frontend`:

```env
# ============================================
# Database
# ============================================
DATABASE_URL="postgresql://user:password@host:5432/donefast?schema=public"

# ============================================
# Supabase (Optional - for storage)
# ============================================
NEXT_PUBLIC_SUPABASE_URL="https://yourproject.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# ============================================
# Authentication
# ============================================
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# ============================================
# AI / Gemini (untuk chatbot)
# ============================================
GEMINI_API_KEY="your-google-gemini-api-key"

# ============================================
# Payment Gateway (Optional)
# ============================================
PAYMENT_SECRET_KEY="your-payment-gateway-secret-key"
PAYMENT_WEBHOOK_SECRET="your-webhook-secret"
```

| Variable | Required | Deskripsi |
|----------|----------|-----------|
| `DATABASE_URL` | ✅ | Connection string PostgreSQL |
| `JWT_SECRET` | ✅ | Secret key untuk JWT tokens |
| `NEXT_PUBLIC_SUPABASE_URL` | ⬜ | URL project Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ⬜ | Anon key Supabase |
| `GEMINI_API_KEY` | ⬜ | API key Google Gemini AI |
| `PAYMENT_SECRET_KEY` | ⬜ | Secret key payment gateway |

---

## 🚀 Menjalankan Aplikasi

### Development

```bash
cd frontend
npm run dev
```

Server berjalan di `http://localhost:3000`.

### Production Build

```bash
npm run build
npm start
```

### Prisma Studio (Database GUI)

```bash
npx prisma studio
```

Membuka GUI database di `http://localhost:5555`.

### Linting

```bash
npm run lint
```

---

## 🚢 Deployment

### Vercel (Recommended)

1. **Push ke GitHub**
2. **Import project** di [vercel.com](https://vercel.com)
3. Set **Root Directory** ke `frontend`
4. Tambahkan semua **Environment Variables**
5. Deploy! 🎉

### Build Settings untuk Vercel

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Root Directory | `frontend` |
| Build Command | `npx prisma generate && next build` |
| Output Directory | `.next` |
| Install Command | `npm install` |

---

## 🎨 Design System

### Color Palette

| Token | Hex | Kegunaan |
|-------|-----|----------|
| `--background` | `#0a0a0f` | Background utama |
| `--foreground` | `#f0f0f5` | Text utama |
| `--primary` | `#6366f1` | Indigo — brand color |
| `--primary-light` | `#818cf8` | Indigo light — hover states |
| `--accent` | `#22d3ee` | Cyan — accent / highlight |
| `--accent-green` | `#10b981` | Emerald — success / positive |
| `--surface` | `#12121a` | Card / sidebar background |
| `--surface-2` | `#1a1a2e` | Elevated surface |
| `--border` | `#2a2a3e` | Border color |
| `--muted` | `#71717a` | Text sekunder |

### CSS Utilities

| Class | Deskripsi |
|-------|-----------|
| `.gradient-text` | Gradient text (indigo → cyan → emerald) |
| `.glass` | Glassmorphism effect dengan backdrop-blur |
| `.glow-primary` | Glow shadow indigo |
| `.glow-accent` | Glow shadow cyan |
| `.border-gradient` | Animated gradient border |
| `.text-shimmer` | Shimmer text animation |
| `.card-hover` | Card hover lift effect |
| `.bg-grid` | Grid background pattern |
| `.bg-noise` | Subtle noise texture overlay |
| `.animate-pulse-glow` | Pulsing glow animation |
| `.animate-float-1` | Floating orb animation 1 |
| `.animate-float-2` | Floating orb animation 2 |
| `.animate-fadeInUp` | Fade in from bottom |
| `.animate-fadeInLeft` | Fade in from left |
| `.animate-scaleIn` | Scale in animation |
| `.stagger-children` | Staggered children animation |

---

## 📸 Screenshot

### Landing Page
> Dark premium design dengan glassmorphism, animated gradients, dan hero section yang striking.

### Admin Dashboard
> Dashboard overview dengan statistik real-time, chart, dan ringkasan order.

### Admin — Order Management
> Kelola order: filter status, lihat detail lengkap, assign joki, dan batalkan order.

### Joki Dashboard
> Dashboard joki dengan order aktif, progress tracking, dan komisi.

### Marketplace
> Browse layanan dengan search, filter kategori, dan kartu layanan interaktif.

### Chat
> Real-time chat antara customer dan joki per order.

---

## 🤝 Kontribusi

Kontribusi sangat diterima! Silakan:

1. **Fork** repository ini
2. Buat **branch** baru: `git checkout -b feature/fitur-baru`
3. **Commit** perubahan: `git commit -m 'feat: tambah fitur baru'`
4. **Push** ke branch: `git push origin feature/fitur-baru`
5. Buat **Pull Request**

### Commit Convention

| Prefix | Deskripsi |
|--------|-----------|
| `feat:` | Fitur baru |
| `fix:` | Bug fix |
| `docs:` | Dokumentasi |
| `style:` | Formatting, tidak ada perubahan logic |
| `refactor:` | Refactoring kode |
| `test:` | Menambah/memperbaiki test |
| `chore:` | Maintenance, dependencies |

---

## 📄 Lisensi

Proyek ini bersifat **proprietary** dan dikembangkan untuk penggunaan internal. Semua hak cipta dilindungi.

---

## 👥 Pembuat

| Role | Nama |
|------|------|
| **Full-stack Developer** | MUH. ULIL AMRI, S.Kom |
| **UI/UX Designer** | MUH. ULIL AMRI, S.Kom |
| **AI Integration** | Google Gemini API |

---

<p align="center">
  <b>🚀 DoneFast</b> — Tugas Selesai Lebih Cepat dari yang Kamu Bayangkan
  <br />
  <sub>Built with ❤️ using Next.js, React, Prisma, and PostgreSQL</sub>
</p>