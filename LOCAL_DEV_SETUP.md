# 🚀 Local Development Setup - Stop Using Docker for Dev!

## Why You're Seeing This File

You've been developing with Docker and hitting these issues:
- ❌ 2-3 minute rebuild for every single fix
- ❌ Hard to debug errors
- ❌ Can't see clear error messages
- ❌ Slow iteration = frustration

**This is NOT how modern web development should work!**

---

## ✅ The Right Way: Local Development

### Step 1: Stop Docker
```bash
# Stop all Docker containers
cd /Users/mogataufiq/Active/Projects/BooQoo
docker compose down
```

### Step 2: Setup Database

**Option A: Use Supabase (Recommended - Easiest)**
```bash
# 1. Go to https://supabase.com
# 2. Sign up / Login
# 3. Click "New Project"
#    - Name: booqoo-dev
#    - Database Password: (choose strong password)
#    - Region: Southeast Asia (Singapore)
# 4. Wait ~2 minutes for setup
# 5. Go to Settings → Database
# 6. Copy "Connection string" under "Connection pooling"
#    Example: postgresql://postgres.[PROJECT]:[PASSWORD]@[HOST]:5432/postgres
```

**Option B: Local PostgreSQL (Advanced)**
```bash
# Only if you want full control
brew install postgresql@15
brew services start postgresql@15
createdb booqoo_dev
# DATABASE_URL: postgresql://postgres:postgres@localhost:5432/booqoo_dev
```

### Step 3: Create Environment File
```bash
# Create .env.local file
cat > .env.local << 'EOF'
# Database - Paste your Supabase connection string here
DATABASE_URL=postgresql://postgres.[PROJECT]:[PASSWORD]@[HOST]:5432/postgres

# NextAuth
NEXTAUTH_SECRET=v8JbkF6DN6iuRZ7Y6n9vDiLKiAJQG69g
NEXTAUTH_URL=http://localhost:3000

# Application
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000
EOF

# Edit the file and paste your actual DATABASE_URL
code .env.local
# or
nano .env.local
```

### Step 4: Install & Setup
```bash
# Install dependencies (if not done)
npm install

# Generate Prisma Client
npx prisma generate

# Push database schema (creates all tables)
npx prisma db push

# You should see:
# ✔ Generated Prisma Client
# Your database is now in sync with your Prisma schema.
```

### Step 5: Start Development Server
```bash
# Start Next.js development server
npm run dev

# You'll see:
# ▲ Next.js 14.2.35
# - Local:        http://localhost:3000
# - Network:      http://192.168.x.x:3000
# ✓ Ready in 2.5s
```

### Step 6: Open Browser & Test
```bash
# Open http://localhost:3000

# You should see the login page
# Register a new account
# Start using the app!

# Any code change you make will auto-reload in < 1 second!
```

---

## 🎯 How to Fix Bugs Now (Proper Way)

### Example: Fix the Checkout Price Bug

**Before (Docker - SLOW):**
```bash
# 1. Edit code
code src/app/api/products/route.ts
# (make changes)

# 2. Rebuild Docker (3 minutes!)
docker compose up --build -d app

# 3. Wait... wait... wait...

# 4. Test
open http://localhost:3000/checkout

# 5. Found another bug? Repeat steps 1-4 (another 3 minutes!)
```

**After (Local Dev - FAST):**
```bash
# 1. Edit code
code src/app/api/products/route.ts
# (make changes)

# 2. Save file (Cmd+S or Ctrl+S)
# → Browser auto-reloads in < 1 second!

# 3. Test immediately
# App already refreshed with your changes!

# 4. Found another bug? 
# → Edit → Save → Test (instant!)
```

**Time for 5 bugs:**
- Docker: 5 × 3 min = **15 minutes**
- Local Dev: 5 × 10 sec = **50 seconds**
- **Saved: 14 minutes!**

---

## 🐛 Current Bugs - Fix With Local Dev

### Bug 1: Transactions API - Wrong Field Name ✅ FIXED IN CODE
**File:** `src/app/api/transactions/route.ts`  
**Issue:** Uses `createdAt` but schema has `transactionDate`  
**Status:** Fixed, needs rebuild or local dev test

### Bug 2: Checkout Page - Price Still Undefined
**Possible Causes:**
1. No products in database yet
2. Products don't have priceSell set
3. API transformation not applied (if Docker not rebuilt)

**How to Debug (Local Dev):**
```bash
npm run dev

# Terminal will show clear errors:
# Example:
# GET /api/products 200 in 45ms
# or
# GET /api/products 500 in 12ms
# Error: Cannot read property 'map' of undefined

# Click the error → see exact line and stack trace
# Fix it → Save → Test (instant!)
```

**How to Debug (Docker - SLOW):**
```bash
docker compose logs app -f
# Minified errors, hard to read
# Need to rebuild to test fix
# Slow iteration
```

### Bug 3: Product Detail Page Missing
**File to create:** `src/app/(dashboard)/products/[id]/page.tsx`

**With Local Dev:**
```bash
# 1. Create file
code src/app/\(dashboard\)/products/\[id\]/page.tsx

# 2. Paste code (see QUICK_FIX_GUIDE.md)

# 3. Save

# 4. Test immediately
open http://localhost:3000/products
# Click "Detail" button
# → Page loads instantly with your new code!

# 5. See error? Fix → Save → Auto-reload!
```

---

## 📊 Comparison: Docker vs Local Dev

| Task | Docker | Local Dev | Saved |
|------|--------|-----------|-------|
| Start app | 3 min (build) | 3 sec | 2m 57s |
| Fix 1 bug | 3 min (rebuild) | 1 sec (hot reload) | 2m 59s |
| See error | Minified, unclear | Clear, with line numbers | ∞ |
| Debug | Container logs | VS Code debugger | ∞ |
| Database access | Via exec | Direct (Prisma Studio) | Easy |
| Fix 10 bugs | 30 minutes | 10 seconds | **29m 50s** |

---

## 🎓 Best Practices for Next Project

### ✅ DO:
1. **Start with `npm run dev`** from day 1
2. **Use Docker only for:**
   - Final integration testing (after all features work locally)
   - CI/CD pipeline
   - Production deployment
3. **Keep both configs:**
   - `.env.local` → local development
   - `.env` → Docker/production
4. **Git ignore:**
   ```gitignore
   .env.local
   .env
   node_modules/
   .next/
   ```

### ❌ DON'T:
1. **Don't develop in Docker** (unless specific reason like testing multi-container networking)
2. **Don't rebuild Docker for every fix** (use only after features complete)
3. **Don't commit `.env` files** (use `.env.example` template)

---

## 🔧 Useful Commands (Local Dev)

### Development
```bash
npm run dev          # Start dev server (hot reload)
npm run build        # Test production build locally
npm start            # Run production build (after npm run build)
npm run lint         # Check code quality
npm run type-check   # TypeScript validation
```

### Database
```bash
npx prisma studio    # Open database GUI (best for browsing data)
npx prisma db push   # Update database schema (development)
npx prisma generate  # Regenerate Prisma Client (after schema changes)
npx prisma migrate dev --name init  # Create migration (production-ready)
```

### Debugging
```bash
# Check database connection
npx prisma db execute --stdin <<< "SELECT 1"

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database with test data
npx prisma db seed
```

---

## 🎯 Next Steps

### Option A: Continue with Docker (Not Recommended)
```bash
# You'll need to rebuild for every fix
docker compose up --build -d app

# Current fixes pending rebuild:
# - Transactions API field name
# - Checkout price display (already in code)

# Time cost: 3 minutes per rebuild
```

### Option B: Switch to Local Dev (Strongly Recommended)
```bash
# 1. Setup (5 minutes, one-time)
docker compose down
# Create .env.local with Supabase URL
npm install
npx prisma generate
npx prisma db push

# 2. Start developing (instant from now on)
npm run dev

# 3. Fix all remaining bugs quickly
# Edit → Save → Test (< 1 second per iteration)

# 4. After all bugs fixed, test in Docker once
docker compose up --build -d

# 5. Deploy to production
git push origin main
```

---

## 💡 Pro Tips

### 1. Use Multiple Terminals
```bash
# Terminal 1: Dev server
npm run dev

# Terminal 2: Database GUI
npx prisma studio

# Terminal 3: Run commands
npm run lint
npx prisma db push
```

### 2. VS Code Extensions (Highly Recommended)
- **Prisma** - Syntax highlighting, autocomplete for schema
- **ESLint** - Catch errors as you type
- **Tailwind CSS IntelliSense** - CSS class autocomplete
- **Error Lens** - Show errors inline
- **Thunder Client** - Test APIs without leaving VS Code

### 3. Browser DevTools
```bash
# Open browser console (F12 or Cmd+Option+I)
# Network tab → See all API calls
# Console tab → See all errors with line numbers
# React DevTools → Inspect components
```

### 4. Hot Reload Magic
```typescript
// You can even modify code WHILE testing!

// 1. Open app in browser
// 2. Click through to the bug
// 3. Keep browser open
// 4. Edit code in VS Code
// 5. Save
// 6. Browser auto-refreshes
// 7. Bug fixed? Great! Bug still there? Edit again!
// 8. Repeat steps 4-7 until fixed (seconds per iteration)
```

---

## 📝 Summary

**Current State:**
- Using Docker for development = slow ❌
- 3 minutes per rebuild ❌
- Hard to debug ❌
- Frustrating workflow ❌

**After Switching to Local Dev:**
- Hot reload = instant feedback ✅
- Clear error messages ✅
- Fast iteration (< 1 second) ✅
- Professional workflow ✅

**Time Investment:**
- Setup local dev: 5 minutes (one-time)
- Fix 10 bugs: 10 seconds vs 30 minutes
- **ROI: 6x productivity boost**

**For Next Project:**
Start with local dev from day 1. Use Docker only for final testing and deployment.

---

## ❓ Questions?

**Q: But I need to test Docker eventually, right?**  
A: Yes! But only AFTER all features work locally. Then do ONE Docker build to verify container works.

**Q: What if I break something locally?**  
A: Just restart: `npm run dev`. Your code is in git, database can be recreated with `npx prisma db push`.

**Q: How do I know if my setup is correct?**  
A: Run `npm run dev`. If you see "Ready in X.Xs" and can open localhost:3000, you're good!

**Q: Can I switch back to Docker later?**  
A: Yes! Just `docker compose up -d`. Your `.env` file is still there.

**Q: What about my current Docker data?**  
A: Export it first if needed:
```bash
docker compose exec db pg_dump -U booqoo booqoo_local > backup.sql
# After local dev setup:
psql $DATABASE_URL < backup.sql
```

---

**Ready to switch?** Run:
```bash
docker compose down && npm run dev
```

Your productivity will thank you! 🚀
