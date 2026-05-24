# 🚀 Quick Fix Guide - Avoid Docker Rebuild

## Current Situation
- Docker rebuild takes **2-3 minutes** every fix
- Slowing down bug fixing iteration
- Not efficient for development

## ✅ RECOMMENDED SOLUTION: Switch to Local Dev

### Step 1: Stop Docker & Setup Local Dev
```bash
# Stop Docker containers
docker compose down

# Install dependencies (if not done)
npm install

# Setup local database
# Option A: Install PostgreSQL locally
brew install postgresql@15
brew services start postgresql@15
createdb booqoo_dev

# Option B: Use Supabase (easier, free tier)
# 1. Go to https://supabase.com
# 2. Create new project
# 3. Get DATABASE_URL from Settings → Database
```

### Step 2: Create Local Environment File
```bash
# Create .env.local for local development
cat > .env.local << 'EOF'
# Database - Local PostgreSQL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/booqoo_dev

# Or Database - Supabase (recommended for quick start)
# DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# NextAuth
NEXTAUTH_SECRET=v8JbkF6DN6iuRZ7Y6n9vDiLKiAJQG69g
NEXTAUTH_URL=http://localhost:3000

# Application
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000
EOF
```

### Step 3: Run Database Migrations
```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database
npx prisma db push

# Optional: Seed with test data
npx prisma db seed
```

### Step 4: Start Development Server
```bash
# Start Next.js dev server
npm run dev

# Server akan start di http://localhost:3000
# Hot reload enabled - perubahan code langsung terlihat!
```

### Step 5: Fix Bugs & Test
```bash
# Edit code di VS Code/editor
# Save file → browser auto-refresh (< 1 second!)
# No rebuild needed!

# Example workflow:
1. Edit src/app/api/products/route.ts
2. Save (Cmd+S)
3. Browser auto-reload
4. Test immediately
5. Repeat untuk bug lain
```

---

## 🎯 Benefits of Local Dev

| Aspect | Docker (Current) | Local Dev (Recommended) |
|--------|------------------|-------------------------|
| **Build Time** | 2-3 minutes | Instant |
| **Hot Reload** | ❌ No | ✅ Yes (< 1s) |
| **Error Messages** | Hard to read | Clear & detailed |
| **Debugging** | Limited | Full debugger support |
| **Database Access** | Via container | Direct access |
| **Testing Speed** | Slow iteration | Fast iteration |

### Comparison Example:
**Fix 5 bugs with Docker:**
- Fix bug 1 → rebuild (3 min) → test (1 min)
- Fix bug 2 → rebuild (3 min) → test (1 min)  
- Fix bug 3 → rebuild (3 min) → test (1 min)
- Fix bug 4 → rebuild (3 min) → test (1 min)
- Fix bug 5 → rebuild (3 min) → test (1 min)
- **Total: 20 minutes**

**Fix 5 bugs with Local Dev:**
- Fix bug 1 → save → test (10s)
- Fix bug 2 → save → test (10s)
- Fix bug 3 → save → test (10s)
- Fix bug 4 → save → test (10s)
- Fix bug 5 → save → test (10s)
- **Total: 50 seconds**

**Time saved: 19 minutes untuk 5 bugs!**

---

## 🐛 Current Bug Fixes (After Switching to Local Dev)

### Fix 1: Checkout - `product.price` undefined ✅
**File:** `src/app/api/products/route.ts` (already fixed)

**Change:**
```typescript
// Transform products to include 'price' field
const products = productsRaw.map((product) => ({
  ...product,
  price: Number(product.priceSell),
  variants: product.variants?.map((variant) => ({
    ...variant,
    price: Number(product.priceSell) + Number(variant.priceModifier || 0),
  })),
}));
```

**Test:** 
```bash
npm run dev
# Open http://localhost:3000/checkout
# Should see products with prices
```

### Fix 2: Create Product Detail Page
**File:** `src/app/(dashboard)/products/[id]/page.tsx` (need to create)

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button, Card, Alert } from '@/components/ui';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [params.id]);

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/products/${params.id}`);
      const result = await response.json();
      
      if (result.success) {
        setProduct(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <div className="space-x-2">
          <Button onClick={() => router.push(`/products/${product.id}/edit`)}>
            Edit
          </Button>
          <Button variant="outline" onClick={() => router.push('/products')}>
            Back to List
          </Button>
        </div>
      </div>

      <Card className="p-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">SKU:</label>
            <p>{product.sku}</p>
          </div>
          <div>
            <label className="font-semibold">Category:</label>
            <p>{product.category || '-'}</p>
          </div>
          <div>
            <label className="font-semibold">Unit:</label>
            <p>{product.unit}</p>
          </div>
          <div>
            <label className="font-semibold">Sell Price:</label>
            <p>Rp {Number(product.priceSell).toLocaleString('id-ID')}</p>
          </div>
          {product.priceCost && (
            <div>
              <label className="font-semibold">Cost Price:</label>
              <p>Rp {Number(product.priceCost).toLocaleString('id-ID')}</p>
            </div>
          )}
          <div>
            <label className="font-semibold">Status:</label>
            <p>{product.isActive ? 'Active' : 'Inactive'}</p>
          </div>
        </div>

        {product.description && (
          <div className="mt-4">
            <label className="font-semibold">Description:</label>
            <p>{product.description}</p>
          </div>
        )}

        {product.variants && product.variants.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold mb-2">Variants:</h3>
            <div className="space-y-2">
              {product.variants.map((variant: any) => (
                <Card key={variant.id} className="p-3">
                  <div className="flex justify-between">
                    <span>{variant.name}</span>
                    <span>
                      {variant.priceModifier >= 0 ? '+' : ''}
                      Rp {Number(variant.priceModifier).toLocaleString('id-ID')}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
```

**Test:**
```bash
npm run dev
# Open http://localhost:3000/products
# Click "Detail" button
# Should show product details
```

---

## 📝 When to Use Docker?

### ✅ Use Docker For:
1. **Final integration testing** - After all bugs fixed locally
2. **Production simulation** - Test container orchestration
3. **CI/CD pipeline** - Automated build & deploy
4. **Team consistency** - Same environment for all developers

### ❌ Don't Use Docker For:
1. **Active development** - Too slow for iteration
2. **Debugging** - Hard to access logs and errors
3. **Quick fixes** - Rebuild time kills productivity
4. **Learning/exploring** - Need fast feedback loop

---

## 🔄 Workflow Summary

### Development Phase (NOW - Bug Fixing):
```bash
# Use local development
npm run dev

# Fix bugs quickly
# Hot reload = instant feedback
# Fast iteration
```

### Testing Phase (LATER - After bugs fixed):
```bash
# Test in Docker
docker compose up --build -d

# Verify:
- Containers start
- Database migrations
- Health checks
- All features work
```

### Deployment Phase (FINAL):
```bash
# Push to GitHub
git push origin main

# CI/CD auto:
- Build Docker image
- Run tests
- Deploy to Beta (Vercel)
- Deploy to Production (AWS/DO)
```

---

## 💡 Pro Tips

### 1. Keep Both Configs Ready
```bash
# .env.local - for npm run dev
DATABASE_URL=postgresql://localhost:5432/booqoo_dev

# .env - for docker compose
DATABASE_URL=postgresql://db:5432/booqoo_local
```

### 2. Use Supabase for Quick Database
- No local PostgreSQL installation needed
- Free tier sufficient for development
- Easy to share with team
- Auto-backups

### 3. Git Ignore Pattern
```gitignore
.env.local
.env
node_modules/
.next/
```

### 4. VS Code Extensions
- **Prisma** - Syntax highlighting for schema
- **ESLint** - Code quality
- **Tailwind CSS IntelliSense** - CSS autocomplete
- **Thunder Client** - API testing

---

## ⚡ Quick Command Reference

```bash
# Local Development
npm run dev              # Start dev server
npm run build            # Build for production (test locally)
npm run start            # Start production build (test)
npm run lint             # Check code quality
npm run type-check       # TypeScript validation

# Database
npx prisma generate      # Generate Prisma Client
npx prisma db push       # Push schema changes
npx prisma studio        # Open database GUI
npx prisma migrate dev   # Create migration (for production)

# Docker (Only for final testing)
docker compose up -d                 # Start containers
docker compose down                  # Stop containers
docker compose logs app -f           # View logs
docker compose exec app sh           # Access container shell
docker compose up --build -d app     # Rebuild app only
```

---

## 📊 Summary

**Current State:** Docker rebuild for every fix = slow ❌

**Recommended:** Local development with npm run dev = fast ✅

**Next Steps:**
1. Stop Docker: `docker compose down`
2. Setup local: Create `.env.local` with database URL
3. Run migrations: `npx prisma db push`
4. Start dev: `npm run dev`
5. Fix bugs: Edit → Save → Test (instant!)
6. After all fixed: Test in Docker once
7. Push to GitHub: Let CI/CD handle production build

**Time Saved:** 95% faster iteration for bug fixes

**For Next Project:** Start with local dev from day 1, use Docker only for deployment testing.
