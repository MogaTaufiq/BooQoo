# Code Standards & Guidelines: BooQoo

Dokumen ini mendefinisikan konvensi penulisan kode, struktur proyek, dan arsitektur komponen.

---

## 1. Language & Type System

**All source files MUST be TypeScript** (`.ts`, `.tsx`). No JavaScript in src/.

### 1.1 Strict Type Safety
- Do NOT use `any` without strong justification
- Use explicit null checking and optional chaining
- All functions must have explicit return types

### 1.2 Type Organization
```
src/types/
├─ index.ts           # Re-export all types
├─ user.ts            # User, Role, Auth
├─ store.ts           # Store, Settings
├─ product.ts         # Product, Variant, Unit
├─ inventory.ts       # Inventory, Stock, Batch
├─ transaction.ts     # Transaction, Payment
├─ api.ts             # API Response/Request types
└─ sync.ts            # Offline-first sync types
```

---

## 2. Naming Conventions

### 2.1 Files & Folders
- **kebab-case** for folders: `src/components/checkout-form/`
- **kebab-case** for files: `checkout-form.tsx`, `use-auth.ts`
- **index.ts** for barrel exports in each component folder

### 2.2 Variables & Functions
- **camelCase** for all variables and functions
- **UPPER_SNAKE_CASE** for constants
- **PascalCase** for enums and classes

### 2.3 React Components
- **PascalCase** for component names
- **Props interfaces** suffix with `Props`

```typescript
interface ProductCardProps {
  product: Product;
  onSelect: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  // component body
};
```

---

## 3. Project Structure

```
src/
├─ app/                       # Next.js App Router
│  ├─ (auth)/                # Auth layout group
│  │  ├─ login/page.tsx
│  │  ├─ register/page.tsx
│  │  └─ layout.tsx
│  ├─ (dashboard)/           # Dashboard layout group
│  │  ├─ dashboard/page.tsx
│  │  ├─ checkout/page.tsx
│  │  ├─ products/page.tsx
│  │  ├─ reports/page.tsx
│  │  └─ layout.tsx
│  ├─ api/
│  │  ├─ auth/
│  │  ├─ products/
│  │  ├─ inventory/
│  │  ├─ transactions/
│  │  └─ sync/
│  ├─ layout.tsx
│  └─ page.tsx
│
├─ components/               # Reusable UI components
│  ├─ auth/                  # Login, Register forms
│  ├─ checkout/              # POS checkout components
│  ├─ product/               # Product card, list, form
│  ├─ inventory/             # Stock management
│  ├─ reports/               # Reports, charts
│  ├─ common/                # Header, Footer, Nav
│  ├─ layout/                # Layout wrappers
│  └─ index.ts              # Barrel export
│
├─ hooks/                    # Custom React hooks
│  ├─ use-auth.ts
│  ├─ use-products.ts
│  ├─ use-offline-sync.ts
│  ├─ use-local-storage.ts
│  └─ use-transactions.ts
│
├─ lib/                      # Utilities & configs
│  ├─ db.ts                  # Prisma client
│  ├─ auth.ts                # NextAuth setup
│  ├─ validators.ts          # Zod schemas
│  ├─ error-handler.ts
│  ├─ logger.ts
│  └─ sync-engine.ts        # Offline sync logic
│
├─ types/                    # TypeScript definitions
│  ├─ index.ts
│  ├─ user.ts
│  ├─ store.ts
│  ├─ product.ts
│  ├─ inventory.ts
│  ├─ transaction.ts
│  ├─ api.ts
│  └─ sync.ts
│
├─ utils/                    # Helper functions
│  ├─ format.ts              # Date, currency formatting
│  ├─ validation.ts
│  ├─ storage.ts            # LocalStorage/IndexedDB wrappers
│  ├─ api-client.ts         # Axios with interceptors
│  └─ error-messages.ts
│
├─ constants/               # App-wide constants
│  └─ index.ts
│
└─ styles/
   └─ globals.css           # Global Tailwind + custom CSS
```

---

## 4. Component Architecture

### 4.1 Functional Components with Hooks
```typescript
interface ProductCardProps {
  product: Product;
  onSelect: (id: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelect }) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleClick = async () => {
    setIsLoading(true);
    try {
      await onSelect(product.id);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg hover:shadow-lg">
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-gray-600">Rp {product.priceSell.toLocaleString('id-ID')}</p>
      <button onClick={handleClick} disabled={isLoading}>
        {isLoading ? 'Memproses...' : 'Pilih'}
      </button>
    </div>
  );
};
```

### 4.2 Custom Hooks
Extract reusable logic into custom hooks with `use` prefix.

### 4.3 State Management
- **Local state:** useState for component-level
- **Global state:** Zustand for app-wide
- **Server state:** React Query for API data

---

## 5. API Integration

### 5.1 HTTP Client Setup
```typescript
// src/lib/api-client.ts
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default apiClient;
```

### 5.2 API Endpoints Follow REST Conventions
```typescript
// POST /api/auth/login
// GET /api/products?page=1&limit=20
// POST /api/transactions
// GET /api/transactions/{id}
```

---

## 6. Error Handling

### 6.1 Custom Error Classes
```typescript
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 'VALIDATION_ERROR', 400);
  }
}
```

### 6.2 Error Boundaries for React
Wrap components with error boundaries to catch and display errors gracefully.

---

## 7. Testing Standards

### 7.1 Unit Tests
```typescript
import { describe, it, expect } from 'vitest';
import { formatCurrency } from '@utils/format';

describe('formatCurrency', () => {
  it('should format IDR correctly', () => {
    expect(formatCurrency(100000)).toBe('Rp 100.000');
  });
});
```

### 7.2 Component Tests
```typescript
import { render, screen } from '@testing-library/react';
import { ProductCard } from './product-card';

describe('ProductCard', () => {
  it('should render product name', () => {
    render(<ProductCard product={mockProduct} onSelect={vi.fn()} />);
    expect(screen.getByText('Pempek Ayam')).toBeInTheDocument();
  });
});
```

### Coverage Targets
| Type | Target |
|------|--------|
| Utility functions | 90% |
| Custom hooks | 80% |
| Components | 70% |
| API routes | 85% |

---

## 8. Code Quality & Formatting

### 8.1 ESLint
Strict TypeScript rules, no implicit any, unused variables are errors.

### 8.2 Prettier
Auto-format on save (2 spaces, single quotes, semicolons).

### 8.3 Pre-commit Hooks
Lint and format staged files before commit.

---

## 9. Commit Message Standards

Use Conventional Commits format:
```
<type>(<scope>): <subject>

<body>

Closes #<issue>
```

**Types:** feat, fix, refactor, docs, test, chore, perf

---

## 10. Code Review Checklist

- [ ] All files are TypeScript
- [ ] No `any` types
- [ ] Components have prop interfaces
- [ ] Error handling complete
- [ ] Tests written and passing
- [ ] No console.log in production
- [ ] No hardcoded URLs
- [ ] Security: no secrets in code
- [ ] Formatting: lint passes

---

## Document Version
- **Version:** 1.0
- **Created:** 2026-05-22
- **Last Updated:** 2026-05-22
- **Maintained By:** Lead Developer
