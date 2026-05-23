# Architecture Design: BooQoo POS & Stock Management

## 1. Overview Arsitektur

BooQoo mengadopsi **Progressive Web App (PWA) Architecture** dengan offline-first principles dan multi-tenant support. Sistem dirancang untuk berjalan optimal di mobile environment dengan konektivitas terbatas.

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT LAYER (Mobile/Web)                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │     Next.js Frontend + React Components              │  │
│  │     (UI, State Management, Offline Logic)            │  │
│  ├───────────────────────────────────────────────────────┤  │
│  │     IndexedDB / LocalStorage (Local Cache)           │  │
│  │     Service Worker (Offline Detection & Sync)        │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕️ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                    API LAYER (Backend)                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │     Next.js API Routes / Node.js Express             │  │
│  │     (Auth, Business Logic, Sync Coordinator)         │  │
│  │     Multi-tenant middleware                          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↕️ SQL / ORM
┌─────────────────────────────────────────────────────────────┐
│                   DATABASE LAYER                             │
│  ┌───────────────────────────────────────────────────────┐  │
│  │     PostgreSQL / MySQL (Multi-tenant)                │  │
│  │     Schema dengan tenant_id isolation                │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Frontend
| Komponen | Teknologi | Alasan |
|----------|-----------|--------|
| **Framework** | Next.js 14+ | SSR + SSG, built-in API routes, optimized untuk mobile |
| **UI Library** | React 18+ | Component-based, widespread ecosystem |
| **Styling** | Tailwind CSS 3+ | Utility-first, mobile-responsive, lightweight |
| **State Management** | Zustand + React Query | Lightweight, offline-first friendly |
| **Offline Storage** | IndexedDB + LocalStorage | Sync-friendly, lebih besar dari localStorage |
| **Service Worker** | Workbox | Auto-gen, cache strategy, sync management |
| **Language** | TypeScript 5+ | Type safety, developer experience |
| **HTTP Client** | Axios + Custom Interceptor | Retry logic, offline queue handling |
| **Mobile Optimization** | PWA manifest + viewport config | Install-able, full-screen mode |

### Backend
| Komponen | Teknologi | Alasan |
|----------|-----------|--------|
| **Server** | Node.js + Next.js API Routes | Single-language fullstack, ease of deployment |
| **ORM** | Prisma | Type-safe, migration tools, multi-tenant support |
| **Auth** | NextAuth.js v5 / JWT | Session + token-based auth, secure, easy integrate |
| **Validation** | Zod / Joi | Schema validation, type inference |
| **Caching** | Redis (optional, fase 2) | Session store, rate limiting |
| **Logging** | Winston / Pino | Structured logging untuk debugging |

### Database
| Komponen | Teknologi | Alasan |
|----------|-----------|--------|
| **Database** | PostgreSQL 14+ atau MySQL 8+ | Relational, ACID compliant, multi-tenant scalable |
| **Connection Pool** | PgBouncer (pg) / MySQL Pool | Handle concurrent connections |
| **Backup** | Automated (managed service) | Disaster recovery |
| **Monitoring** | Query logs + APM (optional) | Performance tuning |

### Deployment & Infrastructure
| Komponen | Teknologi | Alasan |
|----------|-----------|--------|
| **Hosting** | Vercel (Frontend) + Railway/Supabase (Backend/DB) | Budget-friendly, auto-scale, good for UMKM |
| **Alternative** | Docker + VPS (DigitalOcean/Linode) | Lebih kontrol, untuk scale-up nanti |
| **CDN** | Vercel Edge Network / Cloudflare | Fast delivery, global distribution |
| **Storage** | Local (fase 1) + Cloud Storage (fase 2) | Untuk struk digital, backup |

---

## 3. Offline-First Strategy

### 3.1 Data Sync Flow

#### Scenario A: Online User
```
User Action → Frontend Validation → API Request → Backend Process → DB Update → Response → UI Update
    (Check stok)    (UI layer)         (HTTP)       (Business Logic)   (Commit)     (Cache)   (Render)
```

#### Scenario B: Offline User
```
User Action → Frontend Validation → Store to IndexedDB (Pending Queue) → UI Update (optimistic)
    (Checkout)    (UI layer)           (Mark as syncing=false)                    (Show local data)
     ↓
[User goes online]
     ↓
Service Worker detects connectivity → Sync Engine starts:
    - Retrieve pending transactions from IndexedDB
    - Retry logic: exponential backoff (1s, 2s, 4s, 8s, max 1 min)
    - Validate on server (check if stok masih cukup, user auth valid)
    - If success: Mark syncing=true, remove from pending
    - If fail (conflict): Mark syncing=false + conflict flag, show notification
     ↓
User resolves conflict manually or app auto-resolve (depends on type)
     ↓
Data consistency achieved
```

### 3.2 Local Storage Schema (IndexedDB)

**Database Name:** `booqoo_store`

**Stores (Collections):**

```
Store: users
├─ Key: userId (primary)
├─ Fields: id, email, name, storeId, role, lastSyncTime, authToken
└─ Index: by email

Store: stores
├─ Key: storeId (primary)
├─ Fields: id, name, owner_id, timezone, currency, settings
└─ Index: by owner_id

Store: products
├─ Key: productId (primary)
├─ Fields: id, storeId, name, sku, description, price_sell, price_cost, unit, image_url, category, active, created_at, updated_at
├─ Index: by storeId
├─ Index: by sku

Store: variants
├─ Key: variantId (primary)
├─ Fields: id, productId, name, sku_suffix, price_modifier
├─ Index: by productId

Store: inventory_items
├─ Key: itemId (primary)
├─ Fields: id, storeId, productId, variantId, quantity, batch_code, expiry_date, cost_price, created_at, last_counted_at
├─ Index: by storeId + productId + variantId
├─ Index: by batch_code

Store: transactions
├─ Key: transactionId (primary)
├─ Fields: id, storeId, transaction_date, total_amount, payment_method, payment_reference, created_by, notes, syncStatus, created_at_local, created_at_server, conflict_flag
├─ Index: by storeId + transaction_date
├─ Index: by syncStatus

Store: transaction_details
├─ Key: detailId (primary)
├─ Fields: id, transactionId, productId, variantId, quantity, price_unit, subtotal, batch_code_used
├─ Index: by transactionId

Store: sync_metadata
├─ Key: "sync_state" (single record)
├─ Fields: lastSyncTime, lastSyncStatus, pendingCount, serverVersion
```

### 3.3 Sync Conflict Resolution

| Conflict Type | Trigger | Resolution Strategy |
|---------------|---------|-------------------|
| **Stok mismatch** | Offline checkout, stok kurang saat sync | Notify user, cancel transaction, refund to cart |
| **Duplicate transaction** | Same ID synced 2x | Server dedup check (idempotency key) |
| **Concurrent edit** | User offline, admin update toko settings | Last-write-win dengan timestamp comparison |
| **Auth token expired** | Offline long time, token refresh needed | Re-login prompt saat sync attempt |
| **Price changed** | Product price update saat user offline | Use price at transaction time (locked) |

---

## 4. Multi-Tenant Architecture

### 4.1 Tenant Isolation Strategy

**Database Level:**
```sql
-- Setiap tabel punya kolom tenant_id
CREATE TABLE products (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,  -- Foreign key ke stores table
    name VARCHAR(255),
    ...
    CONSTRAINT fk_tenant FOREIGN KEY (tenant_id) REFERENCES stores(id)
);

-- Index untuk performa query tenant-specific
CREATE INDEX idx_products_tenant ON products(tenant_id);
```

**Application Level:**
```typescript
// Middleware: Auto-inject tenant_id dari request context
const withTenant = async (req, res, next) => {
    const userId = req.user.id;
    const user = await db.user.findUnique({ where: { id: userId } });
    const storeId = user.storeId;
    
    req.context = {
        userId,
        storeId,
        // Semua query harus filter: WHERE store_id = storeId
    };
    next();
};

// Query harus selalu include storeId
const products = await db.product.findMany({
    where: {
        storeId: req.context.storeId,  // Mandatory filter
        active: true,
    },
});
```

### 4.2 Tenant Data Boundaries
- **User** dapat hanya access own store
- **Products** isolated per store
- **Transactions** isolated per store
- **Inventory** isolated per store
- **Settings** isolated per store (timezone, currency, etc)

---

## 5. Entity Relationship Diagram (ERD)

```
┌──────────────────────────┐
│         users            │
├──────────────────────────┤
│ id (UUID) PK             │
│ email (VARCHAR) UNIQUE   │
│ password_hash (VARCHAR)  │
│ name (VARCHAR)           │
│ phone (VARCHAR)          │
│ store_id (FK → stores)   │ ◄─────┐
│ role (ENUM: owner,       │       │
│       cashier, viewer)   │       │
│ created_at               │       │
│ updated_at               │       │
│ last_login               │       │
└──────────────────────────┘       │
                                   │
┌──────────────────────────┐       │
│        stores            │       │
├──────────────────────────┤       │
│ id (UUID) PK             │ ◄─────┤
│ name (VARCHAR)           │       │
│ owner_id (FK → users)    │       │
│ description (TEXT)       │       │
│ phone (VARCHAR)          │       │
│ address (TEXT)           │       │
│ timezone (VARCHAR)       │       │
│ currency (VARCHAR,ENUM)  │       │
│ settings (JSONB)         │       │
│ created_at               │       │
│ updated_at               │       │
└──────────────────────────┘       │
         │                          │
         │ (one-to-many)           │
         ├──────────────────────────┘
         │
         ├─────────────────────────────────┐
         │                                 │
         ▼                                 ▼
┌──────────────────────┐   ┌──────────────────────┐
│     products         │   │    transactions      │
├──────────────────────┤   ├──────────────────────┤
│ id (UUID) PK         │   │ id (UUID) PK         │
│ store_id (FK)        │   │ store_id (FK)        │
│ name (VARCHAR)       │   │ transaction_date     │
│ sku (VARCHAR) UNIQUE │   │ total_amount (DECIMAL)
│ description (TEXT)   │   │ payment_method (ENUM)│
│ category (VARCHAR)   │   │ payment_reference    │
│ unit (ENUM)          │   │ notes (TEXT)         │
│ price_sell (DECIMAL) │   │ created_by (FK→users)│
│ price_cost (DECIMAL) │   │ created_at           │
│ image_url (VARCHAR)  │   │ updated_at           │
│ active (BOOLEAN)     │   │ sync_status (ENUM)   │
│ created_at           │   └──────────────────────┘
│ updated_at           │         │
└──────────────────────┘         │
         │ (one-to-many)         │
         ▼                        │
┌──────────────────────┐        │
│     variants         │        │
├──────────────────────┤        │
│ id (UUID) PK         │        │
│ product_id (FK)      │        │
│ name (VARCHAR)       │        │ (one-to-many)
│ sku_suffix (VARCHAR) │        │
│ price_modifier       │        │
│ created_at           │        │
└──────────────────────┘        │
         │                      │
         │ (one-to-many)       │
         ▼                      │
┌──────────────────────┐        │
│ inventory_items      │        │
├──────────────────────┤        │
│ id (UUID) PK         │        │
│ store_id (FK)        │        │
│ product_id (FK)      │        │
│ variant_id (FK)      │        │
│ quantity (INTEGER)   │        │
│ batch_code (VARCHAR) │        │
│ expiry_date (DATE)   │        │
│ cost_price (DECIMAL) │        │
│ created_at           │        │
│ last_counted_at      │        │
└──────────────────────┘        │
                                 │
    ┌────────────────────────────┘
    │
    ▼
┌──────────────────────────────────┐
│   transaction_details            │
├──────────────────────────────────┤
│ id (UUID) PK                     │
│ transaction_id (FK)              │
│ product_id (FK)                  │
│ variant_id (FK, nullable)        │
│ quantity (INTEGER)               │
│ price_unit (DECIMAL)             │
│ subtotal (DECIMAL)               │
│ batch_code_used (VARCHAR)        │
│ created_at                       │
└──────────────────────────────────┘
```

---

## 6. API Layer Design

### 6.1 Core API Endpoints (RESTful)

#### Authentication
```
POST   /api/auth/register          → Create account + store
POST   /api/auth/login             → JWT token + refresh
POST   /api/auth/logout            → Invalidate session
POST   /api/auth/refresh-token     → New JWT
GET    /api/auth/me                → Current user profile
```

#### Store Management
```
GET    /api/stores/me               → Fetch current store
PUT    /api/stores/me               → Update store settings
GET    /api/stores/me/settings      → Store-specific config
PUT    /api/stores/me/settings      → Save settings
```

#### Products
```
GET    /api/products                → List products (with pagination)
POST   /api/products                → Create product
GET    /api/products/{id}           → Get product detail
PUT    /api/products/{id}           → Update product
DELETE /api/products/{id}           → Soft delete product

GET    /api/products/{id}/variants  → List variants
POST   /api/products/{id}/variants  → Create variant
PUT    /api/variants/{id}           → Update variant
DELETE /api/variants/{id}           → Delete variant
```

#### Inventory & Stock
```
GET    /api/inventory               → Current stock level
POST   /api/inventory/in            → Stock in (restock)
POST   /api/inventory/adjustment    → Manual adjustment
GET    /api/inventory/history       → Stock movement history
GET    /api/inventory/expiry-soon   → Upcoming expiry alerts
```

#### Transactions (POS)
```
POST   /api/transactions            → Create transaction (checkout)
GET    /api/transactions            → List transactions (with filters)
GET    /api/transactions/{id}       → Transaction detail
POST   /api/transactions/sync       → Batch sync offline transactions
POST   /api/transactions/{id}/void  → Cancel transaction (refund stok)
```

#### Reports
```
GET    /api/reports/daily           → Daily sales report
GET    /api/reports/summary         → Period summary (week/month)
GET    /api/reports/product-sales   → Product performance
GET    /api/reports/export          → Export to CSV/PDF
```

### 6.2 Sync Endpoint (Custom for Offline-First)
```
POST   /api/sync                    → Smart diff-based sync
{
  "timestamp": "2026-05-22T10:00:00Z",
  "clientVersion": "1.0.0",
  "pendingTransactions": [
    {
      "id": "local_123",
      "storeId": "...",
      "items": [...],
      "total": 100000,
      "created_at_local": "..."
    }
  ]
}

Response:
{
  "syncStatus": "success" | "partial" | "failed",
  "syncedTransactions": [{"id": "local_123", "serverId": "..."}],
  "conflicts": [{"id": "local_456", "reason": "stok_insufficient"}],
  "serverState": {
    "products": [...],
    "inventory": [...],
    "transactionsSince": "..."
  },
  "serverTime": "2026-05-22T10:00:30Z"
}
```

---

## 7. Security & Scalability

### 7.1 Data Protection
- **HTTPS/TLS:** All connections encrypted
- **CORS:** Whitelist known domains only
- **CSRF:** Token-based CSRF protection
- **Input validation:** Zod schema validation
- **SQL Injection:** Parameterized queries (Prisma)
- **XSS Prevention:** React auto-escaping

### 7.2 Performance & Scalability
- **Database indexing:** tenant_id, transaction_date, product_id
- **Connection pooling:** Min 5, Max 20 connections
- **Caching:** Browser cache (30d), API response cache (5-10 min)
- **Pagination:** Default 20 items per page
- **Phase 1 limits:** 5-10 concurrent users per store

---

## Document Version
- **Version:** 1.0
- **Created:** 2026-05-22
- **Last Updated:** 2026-05-22
- **Maintained By:** Solutions Architect
