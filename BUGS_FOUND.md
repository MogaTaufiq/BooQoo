# 🐛 BUGS FOUND - Manual Testing Session
**Date:** 2026-05-24  
**Environment:** Docker Local (Phase 2 Testing)

---

## 🔴 CRITICAL BUGS (Blocking)

### 1. Checkout Page Crash - `product.price` undefined
**Status:** 🔴 CRITICAL  
**Location:** `/checkout` page  
**Error:**
```
TypeError: Cannot read properties of undefined (reading 'toLocaleString')
at line 215: Rp {product.price.toLocaleString('id-ID')}
```

**Root Cause:**
- API `/api/products` returns `priceSell` (from database schema)
- Frontend expects `price` field
- Mismatch between backend schema and frontend interface

**Impact:** Kasir (POS) tidak bisa digunakan sama sekali

**Fix Required:**
- Option A: Transform API response to include `price: priceSell`
- Option B: Update all frontend code to use `priceSell`
- **Recommended: Option A** (less breaking changes)

**Files to fix:**
- `src/app/api/products/route.ts` - Transform response
- Or: `src/app/(dashboard)/checkout/page.tsx` - Update all references

---

### 2. Stock In - `performedBy` undefined ✅ FIXED
**Status:** ✅ RESOLVED  
**Error:** `Argument store is missing` - caused by `performedBy: undefined`

**Fix Applied:**
- Changed `token.id` → `token.userId` in:
  - `/api/inventory/in/route.ts`
  - `/api/inventory/adjustment/route.ts`

---

### 3. Stock In - Validation Error ✅ FIXED
**Status:** ✅ RESOLVED  
**Error:** "Data tidak valid" when submitting stock in form

**Root Cause:**
- `expiryDate` schema expected `z.date()`, frontend sent ISO string
- Empty strings not handled properly

**Fix Applied:**
- Updated `stockInSchema` to accept `z.string().datetime().or(z.literal(''))`
- Added null handling for optional fields

---

## 🟡 HIGH PRIORITY BUGS

### 4. Product Detail Page - 404 Not Found
**Status:** 🟡 HIGH  
**Location:** Click "Detail" button on any product  
**Error:** 404 Page Not Found

**Root Cause:**
- Missing file: `src/app/(dashboard)/products/[id]/page.tsx`
- Only exists: `src/app/(dashboard)/products/[id]/edit/page.tsx`

**Expected Behavior:**
- Should show product details (read-only view)
- Display: name, SKU, price, category, variants, current stock, image

**Fix Required:**
- Create `src/app/(dashboard)/products/[id]/page.tsx`
- Implement product detail view with:
  - Product information display
  - Variants list (if any)
  - Current stock levels per variant
  - Stock movement history
  - Edit button → navigate to `/products/[id]/edit`

---

### 5. Settings Page - Incomplete Implementation
**Status:** 🟡 HIGH  
**Location:** `/settings` page  
**Current State:** Basic form, missing key features

**Missing Features:**
1. **User Profile Management**
   - Edit name, email, phone
   - Change password
   - Update profile picture

2. **Store Settings**
   - Store name, description
   - Store address, phone
   - Business hours
   - Tax settings
   - Currency settings

3. **Application Preferences**
   - Font size adjustment
   - Dark mode toggle
   - Language selection
   - Receipt printer settings
   - Low stock alerts threshold

4. **Security Settings**
   - Change password
   - Two-factor authentication
   - Active sessions list

**Fix Required:**
- Expand settings page with tabs/sections:
  - Profile
  - Store
  - Preferences
  - Security
- Implement corresponding API endpoints if missing

---

## 🟢 MINOR ISSUES

### 6. Product Variants Price Display
**Status:** 🟢 MINOR  
**Issue:** Variant price modifier not clearly displayed

**Expected:**
- Show base price + modifier
- Example: "Rp 10.000 (+Rp 2.000)" for variant

---

## 📋 INCOMPLETE FEATURES

### 7. Reports Page
**Check Status:** ⏳ PENDING MANUAL TEST
- Sales report
- Inventory report
- Low stock alerts
- Expiry date tracking

### 8. Transaction History
**Check Status:** ⏳ PENDING MANUAL TEST
- List all transactions
- Filter by date, payment method
- Transaction detail view
- Print receipt

---

## 💡 SDLC INSIGHT - Docker vs Local Dev

### Current Problem:
**Setiap fix bug → rebuild Docker → tunggu 2-3 menit**

### Proper SDLC Workflow Should Be:

#### ✅ RECOMMENDED: Local Development First
```bash
# Phase 1: Local Dev (NO DOCKER)
npm install
npm run dev  # Start Next.js dev server at localhost:3000

# Database: Use local PostgreSQL or Supabase free tier
DATABASE_URL=postgresql://user:pass@localhost:5432/booqoo_dev

# Benefits:
✅ Hot reload - perubahan langsung terlihat (< 1 detik)
✅ Better error messages dan debugging
✅ Fast iteration - fix bug langsung test
✅ No build time
```

#### Phase 2: Docker Testing (After local works)
```bash
# Only after semua fitur tested locally
docker compose up --build -d

# Test:
- Container orchestration
- Production-like environment
- Database migrations
- Health checks
```

#### Phase 3: CI/CD Pipeline
```bash
# Auto-triggered on git push
- unit-test
- build Docker image
- deploy to staging/beta
```

### What Went Wrong This Time:
❌ Skipped local dev (`npm run dev`)  
❌ Jumped straight to Docker  
❌ Testing + debugging in Docker = slow iteration  

### For Next Project / Next Version:
1. **Always develop with `npm run dev` first**
2. Use Docker **only** for:
   - Production simulation
   - CI/CD pipeline
   - Final integration testing
3. Keep database connection flexible:
   ```typescript
   // .env.local (for npm run dev)
   DATABASE_URL=postgresql://localhost:5432/booqoo_dev
   
   // .env (for Docker)
   DATABASE_URL=postgresql://db:5432/booqoo_local
   ```

---

## 🎯 IMMEDIATE ACTION ITEMS

### Priority 1: Fix Checkout (BLOCKING)
- [ ] Fix `product.price` undefined error
- [ ] Test kasir flow end-to-end
- [ ] Verify payment calculation

### Priority 2: Create Product Detail Page
- [ ] Create `/products/[id]/page.tsx`
- [ ] Implement read-only product view
- [ ] Add navigation from products list

### Priority 3: Enhance Settings Page
- [ ] Design settings page structure (tabs)
- [ ] Implement profile edit
- [ ] Implement store settings
- [ ] Add preferences (font size, dark mode)

### Priority 4: Complete Manual Testing
- [ ] Test all products CRUD
- [ ] Test inventory (stock in, adjustment)
- [ ] Test checkout flow
- [ ] Test reports
- [ ] Test transactions history

---

## 📝 NOTES FOR NEXT DEPLOYMENT

1. **Local Dev Environment Setup:**
   ```bash
   # Add to README.md
   
   ## Local Development (Recommended)
   npm install
   npm run dev
   
   ## Docker Testing (After local works)
   docker compose up --build -d
   ```

2. **Environment Variables:**
   - `.env.local` - for local dev (git ignored)
   - `.env` - for Docker (git ignored)
   - `.env.example` - template (committed to git)

3. **Database Strategy:**
   - Local dev: PostgreSQL di Mac atau Supabase free tier
   - Docker: PostgreSQL container
   - Beta: Supabase
   - Production: AWS RDS / DigitalOcean Managed DB

---

**Evaluated By:** Manual Testing + User Feedback  
**Next Steps:** Fix critical bugs → Complete testing → Push to Beta
