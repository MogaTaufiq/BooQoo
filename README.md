# BooQoo - POS & Stock Management System

Aplikasi Point of Sale (POS) dan Manajemen Stok untuk UMKM rumahan Indonesia, dengan fokus pada bisnis frozen food.

## 🚀 Features

- **Offline-First Architecture**: Tetap bisa transaksi meski internet mati
- **Mobile-Responsive**: Dioptimalkan untuk penggunaan di HP
- **Multi-Tenant**: Setiap pengguna punya toko sendiri
- **Real-time Stock Management**: Stok otomatis berkurang saat checkout
- **Batch & Expiry Tracking**: Pantau tanggal kedaluwarsa produk
- **Laporan Sederhana**: Dashboard harian dengan metrik penting

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Node.js
- **Database**: PostgreSQL with Prisma ORM
- **State Management**: Zustand + React Query
- **Offline Storage**: IndexedDB
- **Authentication**: NextAuth.js
- **Containerization**: Docker & Docker Compose

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker & Docker Compose (optional)
- PostgreSQL 14+ (if not using Docker)

## 🚀 Quick Start

### Option 1: With Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd BooQoo
   ```

2. **Start services**
   ```bash
   # Development mode
   docker-compose -f docker-compose.dev.yml up

   # Or production mode
   docker-compose up
   ```

3. **Access the application**
   - App: http://localhost:3000
   - Database: localhost:5432
   - pgAdmin (if tools profile enabled): http://localhost:5050

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Set up database**
   ```bash
   # Start PostgreSQL (make sure it's running)
   # Then run migrations
   npx prisma migrate dev
   npx prisma generate
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open browser**
   ```
   http://localhost:3000
   ```

## 📁 Project Structure

```
BooQoo/
├── prisma/
│   ├── schema.prisma          # Database schema
│   ├── migrations/            # Database migrations
│   └── seed/                  # Seed data
├── public/                    # Static files
├── src/
│   ├── app/                   # Next.js 14 App Router
│   │   ├── (auth)/           # Authentication pages
│   │   ├── (dashboard)/      # Dashboard pages
│   │   └── api/              # API routes
│   ├── components/           # React components
│   │   ├── ui/              # Base UI components
│   │   ├── layout/          # Layout components
│   │   ├── auth/            # Auth components
│   │   ├── checkout/        # POS components
│   │   ├── products/        # Product management
│   │   └── inventory/       # Inventory components
│   ├── lib/                  # Core libraries
│   │   ├── db/              # Database client
│   │   ├── auth/            # Auth utilities
│   │   ├── api/             # API client
│   │   ├── sync/            # Offline sync engine
│   │   ├── storage/         # IndexedDB wrapper
│   │   └── validators/      # Zod schemas
│   ├── hooks/               # Custom React hooks
│   ├── types/               # TypeScript types
│   ├── utils/               # Utility functions
│   ├── store/               # Zustand stores
│   └── constants/           # App constants
├── tests/                   # Test files
├── Dockerfile               # Production Docker image
├── Dockerfile.dev           # Development Docker image
├── docker-compose.yml       # Production compose
└── docker-compose.dev.yml   # Development compose
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
npm run format           # Format code with Prettier

# Testing
npm run test             # Run tests
npm run test:coverage    # Run tests with coverage
npm run test:ui          # Run tests with UI

# Database
npm run db:migrate       # Run migrations
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema without migration
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database

# Type checking
npm run type-check       # TypeScript type checking
```

## 🐳 Docker Commands

```bash
# Development
docker-compose -f docker-compose.dev.yml up          # Start dev services
docker-compose -f docker-compose.dev.yml down        # Stop dev services

# Production
docker-compose up                                     # Start prod services
docker-compose down                                   # Stop prod services
docker-compose up --build                            # Rebuild and start

# With pgAdmin
docker-compose -f docker-compose.dev.yml --profile tools up

# View logs
docker-compose logs -f app                           # App logs
docker-compose logs -f postgres                      # Database logs
```

## 🗄️ Database Setup

The project uses PostgreSQL with Prisma ORM. Migrations are automatically run when using Docker.

For manual setup:

```bash
# Create database
createdb booqoo

# Run migrations
npx prisma migrate dev

# Seed data (optional)
npm run db:seed
```

## 📱 PWA Setup

The app is designed as a Progressive Web App (PWA) for mobile installation:

1. Open app in mobile browser
2. Click "Add to Home Screen"
3. Use like a native app with offline support

## 🔐 Security

- HTTPS/TLS encryption
- CSRF protection
- XSS prevention
- SQL injection protection via Prisma
- Rate limiting (coming in Phase 2)
- Secure headers configured

## 📊 Development Roadmap

### Phase 1: MVP (Current)
- ✅ Project setup & architecture
- ⏳ Authentication & user management
- ⏳ Product CRUD
- ⏳ POS checkout
- ⏳ Offline-first sync
- ⏳ Basic reports

### Phase 2: Enhancement
- Multi-user with roles
- Batch & expiry tracking (required)
- Stock reconciliation
- WhatsApp integration

### Phase 3: Expansion
- Native mobile app
- Advanced analytics
- Loyalty program
- Supplier management

## 🤝 Contributing

This is a private project. For the development team:

1. Create a feature branch
2. Make changes
3. Write tests
4. Submit PR for review

## 📝 License

Private - All rights reserved

## 📧 Support

For issues or questions, contact the development team.

---

**Built with ❤️ for Indonesian UMKM**
