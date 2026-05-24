# 🚀 Docker Quick Start Guide

Quick reference untuk deployment Docker BooQoo.

---

## 📦 Files Overview

```
BooQoo/
├── Dockerfile.production          # Production-optimized Dockerfile
├── .dockerignore.production       # Files to exclude from build
├── docker-compose.prod.yml        # Production compose file
├── .env.production.example        # Environment template
├── .github/workflows/
│   └── docker-deploy.yml          # CI/CD workflow
└── scripts/
    └── deploy.sh                  # Quick deploy script
```

---

## ⚡ Quick Commands

### Build & Test Locally

```bash
# Build image
docker build -f Dockerfile.production -t booqoo:test .

# Run locally
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e NEXTAUTH_SECRET="your-secret" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  booqoo:test

# Test health
curl http://localhost:3000/api/health
```

### Deploy to Production

```bash
# Setup (one-time)
cp .env.production.example .env.production
nano .env.production  # Fill in values

# Deploy
./scripts/deploy.sh

# Or manually
docker compose -f docker-compose.prod.yml up -d
```

### Maintenance

```bash
# View logs
docker compose -f docker-compose.prod.yml logs -f app

# Restart
docker compose -f docker-compose.prod.yml restart app

# Stop
docker compose -f docker-compose.prod.yml down

# Update
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

---

## 🔐 Required GitHub Secrets

Untuk CI/CD automation, setup secrets berikut di GitHub:

**Docker Registry:**
- `DOCKER_USERNAME` - Docker Hub username
- `DOCKER_PASSWORD` - Docker Hub password/token

**Server Access:**
- `PRODUCTION_HOST` - Server IP
- `PRODUCTION_USER` - SSH username
- `PRODUCTION_SSH_KEY` - Private SSH key

**Environment:**
- `NEXTAUTH_SECRET` - `openssl rand -base64 32`
- `POSTGRES_PASSWORD` - Database password

---

## 🏥 Health Check

```bash
# Check if app is healthy
curl http://localhost:3000/api/health

# Expected response:
{
  "status": "ok",
  "timestamp": "2026-05-23T...",
  "database": {
    "status": "connected",
    "userCount": 5
  }
}
```

---

## 🐛 Common Issues

### Container won't start
```bash
# Check logs
docker compose logs app

# Usually: DATABASE_URL or NEXTAUTH_SECRET missing
```

### Database connection error
```bash
# Check database container
docker compose ps postgres
docker compose logs postgres
```

### Port already in use
```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill process
kill -9 <PID>
```

---

## 📚 Full Documentation

See [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) for complete guide.

---

## 🔄 Workflow Triggers

Pipeline akan berjalan otomatis saat:

- ✅ Push ke branch `main` → Deploy to **Production**
- ✅ Push ke branch `develop` → Deploy to **Staging**
- ✅ Pull Request → Run tests only (no deploy)

---

**Quick Links:**
- 📖 [Full Deployment Guide](./DOCKER_DEPLOYMENT.md)
- 🐳 [Docker Hub Registry](https://hub.docker.com)
- 🔧 [GitHub Actions Workflows](./.github/workflows/)
