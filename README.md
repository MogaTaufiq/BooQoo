# 🛒 BooQoo - POS & Inventory Management System

Aplikasi POS (Point of Sale) dan manajemen inventori modern untuk UMKM rumahan. Dibangun dengan Next.js 14, TypeScript, dan PostgreSQL.

![Status](https://img.shields.io/badge/status-production--ready-green)
![Version](https://img.shields.io/badge/version-1.0.0-blue)
![TypeScript](https://img.shields.io/badge/typescript-100%25-blue)

## ✨ Features

### 🔐 Authentication & Security
- JWT-based authentication with NextAuth v4
- Multi-tenant architecture (storeId isolation)
- Protected routes with middleware
- Role-based access control

### 📦 Product Management
- CRUD operations for products
- Product variants support
- SKU auto-generation
- Category management
- Soft delete (isActive flag)
- Search and pagination

### 📊 Inventory Management
- Real-time stock tracking
- Stock in (restock) functionality
- Stock adjustment with reasons
- Low stock alerts (configurable threshold)
- Expiry date tracking with warnings
- Batch code management
- FIFO stock movement audit trail

### 💰 POS / Checkout
- Complete checkout workflow
- Shopping cart management
- Real-time stock validation
- FIFO automatic stock deduction
- Multiple payment methods (Cash, Transfer, E-Wallet)
- Change calculation
- Receipt generation with print support
- Transaction history

### 📈 Reports & Analytics
- Sales report with date range filtering
- Group by day/week/month
- Payment method breakdown
- Top 10 best-selling products
- Inventory valuation report
- Low stock and expiry reports

### ⚙️ Settings
- Store information management
- Configurable low stock threshold
- Configurable expiry alert days
- System preferences

## 🚀 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** NextAuth v4
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **Form Validation:** React Hook Form + Zod
- **Deployment:** Docker-ready

## 📋 Prerequisites

- Node.js 18+ 
- Docker & Docker Compose (for PostgreSQL)
- npm or yarn

## 🔧 Installation

### 1. Clone Repository
\`\`\`bash
git clone https://github.com/mogataufiq/BooQoo.git
cd BooQoo
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Setup Environment Variables
\`\`\`bash
cp .env.example .env
\`\`\`

### 4. Start PostgreSQL (Docker)
\`\`\`bash
docker-compose -f docker-compose.dev.yml up -d
\`\`\`

### 5. Run Database Migrations
\`\`\`bash
npx prisma db push
npx prisma generate
\`\`\`

### 6. Start Development Server
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## 🎯 Usage Guide

### First Time Setup

1. **Register Account** → `/register`
2. **Add Products** → `/products/new`
3. **Stock In** → `/inventory/stock-in`
4. **Start Selling** → `/checkout`

### Daily Operations

- **Restock:** `/inventory/stock-in`
- **Check Stock:** `/inventory`
- **Sell:** `/checkout`
- **View Sales:** `/reports`
- **Settings:** `/settings`

## 📊 API Endpoints

- **Auth:** `/api/auth/*`
- **Products:** `/api/products`
- **Inventory:** `/api/inventory/*`
- **Checkout:** `/api/checkout`
- **Transactions:** `/api/transactions`
- **Reports:** `/api/reports/*`
- **Settings:** `/api/settings`

## 🚢 Deployment

\`\`\`bash
docker-compose up -d
\`\`\`

## 👨‍💻 Author

**Moga Taufiq**
- GitHub: [@mogataufiq](https://github.com/mogataufiq)

---

**Made with ❤️ for Indonesian SMEs**
