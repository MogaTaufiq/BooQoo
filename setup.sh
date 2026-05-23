#!/bin/bash
# BooQoo Project Setup Script
# Run this in the BooQoo project directory

set -e

echo "🚀 Setting up BooQoo POS project..."

# Navigate to BooQoo directory
cd "$(dirname "$0")"

# Initialize Next.js with TypeScript, Tailwind, ESLint
echo "📦 Creating Next.js app..."
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --yes

# Install additional dependencies
echo "📦 Installing dependencies..."
npm install @prisma/client next-auth zod zustand @tanstack/react-query axios bcryptjs date-fns uuid idb
npm install -D prisma @types/bcryptjs @types/uuid vitest @testing-library/react @testing-library/user-event

# Initialize Prisma
echo "🗄️ Initializing Prisma..."
npx prisma init

# Create folder structure
echo "📁 Creating folder structure..."
mkdir -p src/components/{common,auth,layout,checkout,products,inventory,reports}
mkdir -p src/hooks
mkdir -p src/lib
mkdir -p src/types
mkdir -p src/utils
mkdir -p src/constants
mkdir -p src/app/api/{auth,products,inventory,transactions,sync}
mkdir -p src/app/\(auth\)/{login,register}
mkdir -p src/app/\(dashboard\)/{dashboard,checkout,products,reports}
mkdir -p tests/{unit,integration}
mkdir -p prisma
mkdir -p public/icons

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Configure .env file with DATABASE_URL and NEXTAUTH_SECRET"
echo "2. Run 'npm run db:generate' to generate Prisma client"
echo "3. Run 'npm run dev' to start development server"