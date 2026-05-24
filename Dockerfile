# ==================================================
# Production Dockerfile untuk BooQoo POS
# Multi-stage build: deps → builder → runner
# Compatible: Mac ARM + Linux AMD64
# ==================================================

# ==================== STAGE 1: Dependencies ====================
FROM node:18-alpine AS deps

# Install dependencies yang diperlukan
RUN apk add --no-cache \
    libc6-compat \
    openssl

WORKDIR /app

# Copy package files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm ci --only=production && \
    npm cache clean --force

# ==================== STAGE 2: Builder ====================
FROM node:18-alpine AS builder

# Install OpenSSL untuk Prisma
RUN apk add --no-cache \
    libc6-compat \
    openssl

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build Next.js application
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# ==================== STAGE 3: Runner ====================
FROM node:18-alpine AS runner

# Install runtime dependencies
RUN apk add --no-cache \
    openssl \
    ca-certificates \
    curl

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone server (Next.js optimization)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema and generated client
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set runtime environment
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["node", "server.js"]
