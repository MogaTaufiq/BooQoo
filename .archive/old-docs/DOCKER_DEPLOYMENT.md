# 🐳 Docker Deployment Guide - BooQoo

Panduan lengkap untuk deploy BooQoo menggunakan Docker dan CI/CD Pipeline.

---

## 📋 Daftar Isi

1. [Arsitektur Deployment](#arsitektur-deployment)
2. [Prerequisites](#prerequisites)
3. [Setup GitHub Secrets](#setup-github-secrets)
4. [Local Testing](#local-testing)
5. [Production Deployment](#production-deployment)
6. [Monitoring & Maintenance](#monitoring--maintenance)
7. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arsitektur Deployment

```
┌─────────────────────────────────────────────────────────────┐
│                     GitHub Repository                        │
│  (Push to main/develop branch triggers workflow)            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              GitHub Actions Workflow                         │
│                                                              │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │ Job 1: Quality   │  │ Job 2: Migration │                │
│  │ & Security Check │  │ Check            │                │
│  └──────────────────┘  └──────────────────┘                │
│                │                 │                           │
│                └────────┬────────┘                           │
│                         ▼                                    │
│  ┌─────────────────────────────────────┐                    │
│  │ Job 3: Build & Push Docker Image    │                    │
│  │ → Docker Hub / GHCR                 │                    │
│  └─────────────────────────────────────┘                    │
│                         │                                    │
│                         ▼                                    │
│  ┌─────────────────────────────────────┐                    │
│  │ Job 4: Deploy to Production         │                    │
│  │ → SSH to server                     │                    │
│  │ → Pull latest image                 │                    │
│  │ → Restart containers                │                    │
│  └─────────────────────────────────────┘                    │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                  Production Server                           │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Nginx      │  │  BooQoo App  │  │  PostgreSQL  │      │
│  │ (Reverse     │→ │  (Docker)    │→ │  (Docker)    │      │
│  │  Proxy)      │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│       :80/:443           :3000            :5432             │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ Prerequisites

### 1. Server Requirements

**Minimum:**
- CPU: 2 cores
- RAM: 4GB
- Storage: 20GB SSD
- OS: Ubuntu 20.04+ / Debian 11+

**Recommended:**
- CPU: 4 cores
- RAM: 8GB
- Storage: 50GB SSD

### 2. Software yang Diperlukan di Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version

# Add current user to docker group (optional)
sudo usermod -aG docker $USER
newgrp docker
```

### 3. Domain & DNS Setup

- Domain sudah diarahkan ke IP server (A Record)
- Subdomain untuk staging (optional): staging.yourdomain.com

---

## 🔐 Setup GitHub Secrets

Buka repository di GitHub → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

### Required Secrets:

| Secret Name | Description | Example / How to Generate |
|------------|-------------|---------------------------|
| `DOCKER_USERNAME` | Docker Hub username | `your-dockerhub-username` |
| `DOCKER_PASSWORD` | Docker Hub password/token | Generate di Docker Hub → Account Settings → Security → New Access Token |
| `PRODUCTION_HOST` | Production server IP | `123.456.78.90` |
| `PRODUCTION_USER` | SSH username | `ubuntu` atau `root` |
| `PRODUCTION_SSH_KEY` | Private SSH key | `cat ~/.ssh/id_rsa` (paste semua isinya) |
| `PRODUCTION_PORT` | SSH port (optional) | `22` (default) |
| `NEXTAUTH_SECRET` | NextAuth encryption key | `openssl rand -base64 32` |
| `POSTGRES_PASSWORD` | Database password | `openssl rand -base64 24` |

### Optional Secrets (Staging):

| Secret Name | Description |
|------------|-------------|
| `STAGING_HOST` | Staging server IP |
| `STAGING_USER` | Staging SSH username |
| `STAGING_SSH_KEY` | Staging private SSH key |
| `STAGING_PORT` | Staging SSH port |

### Generate SSH Key (jika belum punya):

```bash
# Di local machine
ssh-keygen -t ed25519 -C "github-actions@booqoo"

# Copy public key ke server
ssh-copy-id -i ~/.ssh/id_ed25519.pub user@your-server-ip

# Copy private key untuk GitHub Secret
cat ~/.ssh/id_ed25519
```

---

## 🧪 Local Testing

### 1. Test Docker Build

```bash
# Build production image
docker build -f Dockerfile.production -t booqoo-pos:local .

# Check image size
docker images booqoo-pos:local

# Run container locally
docker run -d \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db" \
  -e NEXTAUTH_SECRET="test-secret" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  --name booqoo-test \
  booqoo-pos:local

# Check logs
docker logs -f booqoo-test

# Test health endpoint
curl http://localhost:3000/api/health

# Stop and remove
docker stop booqoo-test && docker rm booqoo-test
```

### 2. Test with Docker Compose

```bash
# Copy environment file
cp .env.production.example .env.production

# Edit .env.production dengan nilai yang sesuai
nano .env.production

# Start services
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps

# Check logs
docker compose -f docker-compose.prod.yml logs -f app

# Stop services
docker compose -f docker-compose.prod.yml down
```

---

## 🚀 Production Deployment

### 1. Server Setup (One-time)

```bash
# SSH ke server
ssh user@your-server-ip

# Create app directory
sudo mkdir -p /opt/booqoo
sudo chown $USER:$USER /opt/booqoo
cd /opt/booqoo

# Clone repository (optional, untuk ambil docker-compose.prod.yml)
git clone https://github.com/YourUsername/BooQoo.git .

# Atau download manual docker-compose.prod.yml
wget https://raw.githubusercontent.com/YourUsername/BooQoo/main/docker-compose.prod.yml

# Create .env.production file
nano .env.production
# Paste environment variables dari .env.production.example
```

### 2. Initial Deployment

```bash
# Pull Docker image
docker pull your-dockerhub-username/booqoo-pos:latest

# Start services
docker compose -f docker-compose.prod.yml up -d

# Check status
docker compose -f docker-compose.prod.yml ps

# Run database migrations
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# Check logs
docker compose -f docker-compose.prod.yml logs -f
```

### 3. Setup Nginx (Optional - jika belum pakai reverse proxy)

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx config
sudo nano /etc/nginx/sites-available/booqoo

# Paste konfigurasi berikut:
```

```nginx
server {
    listen 80;
    server_name booqoo.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check endpoint
    location /api/health {
        proxy_pass http://localhost:3000;
        access_log off;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/booqoo /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Install SSL certificate (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d booqoo.yourdomain.com
```

### 4. Automatic Deployment via GitHub Actions

Setelah setup initial selesai, setiap push ke branch `main` akan:

1. ✅ Run quality checks (lint, type check, security audit)
2. ✅ Run database migration check
3. ✅ Build Docker image dan push ke registry
4. ✅ SSH ke server production
5. ✅ Pull image terbaru
6. ✅ Restart containers
7. ✅ Run database migrations
8. ✅ Health check

---

## 📊 Monitoring & Maintenance

### 1. Check Application Status

```bash
# Container status
docker compose -f docker-compose.prod.yml ps

# Application logs
docker compose -f docker-compose.prod.yml logs -f app

# Database logs
docker compose -f docker-compose.prod.yml logs -f postgres

# Check resource usage
docker stats
```

### 2. Database Backup

```bash
# Backup database
docker compose -f docker-compose.prod.yml exec postgres \
  pg_dump -U booqoo booqoo_production > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
docker compose -f docker-compose.prod.yml exec -T postgres \
  psql -U booqoo -d booqoo_production < backup.sql
```

### 3. Update Application

```bash
# Manual update (without CI/CD)
docker compose -f docker-compose.prod.yml pull app
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
```

### 4. Rollback to Previous Version

```bash
# List available images
docker images your-dockerhub-username/booqoo-pos

# Pull specific version
docker pull your-dockerhub-username/booqoo-pos:main-abc1234

# Update docker-compose.prod.yml to use specific tag
nano docker-compose.prod.yml
# Change: image: ${DOCKER_USERNAME}/booqoo-pos:main-abc1234

# Restart
docker compose -f docker-compose.prod.yml up -d
```

### 5. Clean Up Old Images

```bash
# Remove unused images (older than 24 hours)
docker image prune -af --filter "until=24h"

# Remove all unused Docker resources
docker system prune -af
```

---

## 🔧 Troubleshooting

### Problem 1: Container terus restart

```bash
# Check logs
docker compose -f docker-compose.prod.yml logs app

# Common causes:
# - DATABASE_URL salah
# - NEXTAUTH_SECRET tidak diset
# - Port 3000 sudah digunakan

# Check port
sudo lsof -i :3000
```

### Problem 2: Database connection error

```bash
# Check database container
docker compose -f docker-compose.prod.yml ps postgres

# Check database logs
docker compose -f docker-compose.prod.yml logs postgres

# Test connection
docker compose -f docker-compose.prod.yml exec postgres \
  psql -U booqoo -d booqoo_production -c "SELECT 1;"
```

### Problem 3: Health check failing

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Check if app is listening
docker compose -f docker-compose.prod.yml exec app \
  netstat -tulpn | grep :3000
```

### Problem 4: CI/CD deployment gagal

```bash
# Check SSH access dari GitHub Actions
ssh -i ~/.ssh/github_actions user@server-ip

# Check Docker registry login
docker login
```

### Problem 5: Out of disk space

```bash
# Check disk usage
df -h

# Clean up Docker
docker system prune -af --volumes

# Clean up old backups
find /opt/booqoo/backups -mtime +7 -delete
```

---

## 📚 Additional Resources

- [Next.js Docker Documentation](https://nextjs.org/docs/deployment#docker-image)
- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)

---

## 🤝 Support

Jika mengalami masalah:
1. Check logs: `docker compose logs -f`
2. Check GitHub Actions workflow logs
3. Buka issue di repository GitHub

---

**Last Updated:** 2026-05-23  
**Maintained By:** DevOps Team
