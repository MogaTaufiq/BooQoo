# 🐳 Docker Cheat Sheet - BooQoo

Quick reference untuk semua Docker commands yang sering digunakan.

---

## 🏗️ Build Commands

```bash
# Build production image (PENTING: jangan lupa titik!)
docker build -f Dockerfile.production -t booqoo:test .

# Build tanpa cache
docker build --no-cache -f Dockerfile.production -t booqoo:test .

# Build dan tag untuk registry
docker build -f Dockerfile.production -t username/booqoo-pos:latest .

# Check image size
docker images booqoo:test
```

---

## 🚀 Run Commands

```bash
# Run simple test (tanpa database)
docker run -d --name booqoo-test \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://test:test@localhost:5432/test" \
  -e NEXTAUTH_SECRET="test-secret" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  booqoo:test

# Run dengan docker-compose (dengan database)
docker compose -f docker-compose.prod.yml up -d

# Stop container
docker stop booqoo-test

# Remove container
docker rm booqoo-test

# Stop and remove sekaligus
docker rm -f booqoo-test
```

---

## 🔍 Inspection Commands

```bash
# List running containers
docker ps

# List all containers (including stopped)
docker ps -a

# View logs (real-time)
docker logs -f booqoo-test

# View last 50 lines
docker logs --tail 50 booqoo-test

# Check container stats
docker stats booqoo-test

# Inspect container details
docker inspect booqoo-test
```

---

## 🐚 Shell Access

```bash
# Access running container shell
docker exec -it booqoo-test sh

# Run one-off command
docker exec booqoo-test npx prisma migrate deploy

# Access container with docker-compose
docker compose -f docker-compose.prod.yml exec app sh
```

---

## 🧪 Testing Commands

```bash
# Test health endpoint
curl http://localhost:3000/api/health

# Test with formatted JSON
curl -s http://localhost:3000/api/health | jq .

# Test homepage
curl -I http://localhost:3000

# Run migrations
docker exec booqoo-test npx prisma migrate deploy
```

---

## 🧹 Cleanup Commands

```bash
# Remove stopped containers
docker container prune -f

# Remove unused images
docker image prune -af

# Remove everything (careful!)
docker system prune -af --volumes

# Remove specific test containers
docker rm -f $(docker ps -aq --filter name=booqoo-test)

# Remove specific images
docker rmi booqoo:test
```

---

## 🐘 PostgreSQL Commands

```bash
# Start PostgreSQL container
docker run -d --name test-postgres \
  -e POSTGRES_USER=booqoo \
  -e POSTGRES_PASSWORD=testpass \
  -e POSTGRES_DB=booqoo_test \
  -p 5432:5432 \
  postgres:15-alpine

# Connect to PostgreSQL
docker exec -it test-postgres psql -U booqoo -d booqoo_test

# Check PostgreSQL logs
docker logs test-postgres

# Backup database
docker exec test-postgres pg_dump -U booqoo booqoo_test > backup.sql

# Restore database
docker exec -i test-postgres psql -U booqoo -d booqoo_test < backup.sql
```

---

## 📦 Docker Compose Commands

```bash
# Start all services
docker compose -f docker-compose.prod.yml up -d

# Stop all services
docker compose -f docker-compose.prod.yml down

# View logs (all services)
docker compose -f docker-compose.prod.yml logs -f

# View logs (specific service)
docker compose -f docker-compose.prod.yml logs -f app

# Restart service
docker compose -f docker-compose.prod.yml restart app

# Check status
docker compose -f docker-compose.prod.yml ps

# Pull latest images
docker compose -f docker-compose.prod.yml pull

# Rebuild and restart
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 🔐 Registry Commands

```bash
# Login to Docker Hub
docker login

# Login to GitHub Container Registry
docker login ghcr.io -u USERNAME

# Tag image for registry
docker tag booqoo:test username/booqoo-pos:latest

# Push to registry
docker push username/booqoo-pos:latest

# Pull from registry
docker pull username/booqoo-pos:latest
```

---

## 🛠️ Debug Commands

```bash
# Check why container stopped
docker logs booqoo-test

# Check container process list
docker top booqoo-test

# Check resource usage
docker stats booqoo-test --no-stream

# Check network
docker network ls
docker network inspect bridge

# Check volumes
docker volume ls
docker volume inspect postgres_data
```

---

## 📊 Useful Filters

```bash
# List containers by name
docker ps --filter name=booqoo

# List containers by status
docker ps --filter status=exited

# List images by label
docker images --filter label=maintainer=booqoo

# Remove containers matching pattern
docker rm -f $(docker ps -aq --filter name=test)
```

---

## 🚦 Port Management

```bash
# Check what's using port 3000
lsof -ti:3000

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Map to different port
docker run -p 3001:3000 booqoo:test

# Check port mapping
docker port booqoo-test
```

---

## 💾 Volume Management

```bash
# Create volume
docker volume create booqoo-data

# List volumes
docker volume ls

# Inspect volume
docker volume inspect booqoo-data

# Remove volume
docker volume rm booqoo-data

# Remove unused volumes
docker volume prune -f
```

---

## 🔄 Update Workflow

```bash
# 1. Pull latest code
git pull origin main

# 2. Rebuild image
docker build -f Dockerfile.production -t username/booqoo-pos:latest .

# 3. Stop old containers
docker compose -f docker-compose.prod.yml down

# 4. Start new containers
docker compose -f docker-compose.prod.yml up -d

# 5. Run migrations
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# 6. Check health
curl http://localhost:3000/api/health
```

---

## 📝 Environment Variables

```bash
# Set env var on run
docker run -e VAR_NAME=value booqoo:test

# Set multiple env vars
docker run \
  -e DATABASE_URL="..." \
  -e NEXTAUTH_SECRET="..." \
  booqoo:test

# Load from file
docker run --env-file .env.production booqoo:test

# Check env vars in container
docker exec booqoo-test env

# Check specific env var
docker exec booqoo-test env | grep DATABASE
```

---

## 🎯 Common Scenarios

### Scenario 1: First Time Setup
```bash
cp .env.production.example .env.production
nano .env.production
docker build -f Dockerfile.production -t booqoo:test .
docker compose -f docker-compose.prod.yml up -d
```

### Scenario 2: Update Application
```bash
git pull
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d
```

### Scenario 3: Debug Issues
```bash
docker logs -f booqoo-test
docker exec -it booqoo-test sh
docker stats booqoo-test
```

### Scenario 4: Database Migration
```bash
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy
docker compose -f docker-compose.prod.yml exec app npx prisma db push
```

### Scenario 5: Cleanup Everything
```bash
docker compose -f docker-compose.prod.yml down -v
docker system prune -af --volumes
```

---

## ⚠️ Important Notes

1. **SELALU tambahkan titik (.) di akhir docker build**
   ```bash
   # ❌ SALAH
   docker build -f Dockerfile.production -t booqoo:test
   
   # ✅ BENAR
   docker build -f Dockerfile.production -t booqoo:test .
   ```

2. **Check port conflicts sebelum run**
   ```bash
   lsof -ti:3000 | xargs kill -9
   ```

3. **Gunakan -d untuk detached mode**
   ```bash
   docker run -d ...  # Run di background
   docker run -it ... # Run interactive (untuk debug)
   ```

4. **Always check logs after deploy**
   ```bash
   docker logs -f container-name
   ```

---

## 🔗 Related Documentation

- 📖 [DOCKER_DEPLOYMENT.md](./DOCKER_DEPLOYMENT.md) - Complete guide
- 🧪 [DOCKER_TESTING_GUIDE.md](./DOCKER_TESTING_GUIDE.md) - Testing guide
- 🚀 [DOCKER_QUICKSTART.md](./DOCKER_QUICKSTART.md) - Quick reference

---

**Quick Help:**
```bash
docker --help              # Docker help
docker build --help        # Build help
docker run --help          # Run help
docker compose --help      # Compose help
```

---

**Last Updated:** 2026-05-23
