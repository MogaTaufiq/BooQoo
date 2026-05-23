# 🧪 Docker Testing Guide - BooQoo

Panduan lengkap untuk testing Docker build secara lokal sebelum deploy.

---

## ⚡ Quick Test Commands

### 1. Build Docker Image

```bash
# Build production image (JANGAN lupa titik di akhir!)
docker build -f Dockerfile.production -t booqoo:test .

# Check image size
docker images booqoo:test
# Expected: ~250-300MB
```

**Common Error:**
```bash
# ❌ SALAH (missing build context)
docker build -f Dockerfile.production -t booqoo:test

# ✅ BENAR (dengan titik . di akhir)
docker build -f Dockerfile.production -t booqoo:test .
```

### 2. Run Container (Simple Test)

```bash
# Stop any process using port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null

# Run container (without database)
docker run -d --name booqoo-test \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://test:test@localhost:5432/test" \
  -e NEXTAUTH_SECRET="test-secret-for-docker" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  booqoo:test

# Check logs
docker logs -f booqoo-test

# Expected output:
# ✓ Ready in 100-200ms
```

### 3. Test Application

```bash
# Test Next.js is running (should return HTML)
curl -I http://localhost:3000

# Test health endpoint (will show DB error without PostgreSQL)
curl http://localhost:3000/api/health

# Expected (without DB):
# {
#   "status": "error",
#   "database": { "status": "disconnected" },
#   ...
# }
```

### 4. Cleanup

```bash
# Stop and remove container
docker stop booqoo-test && docker rm booqoo-test

# Remove test image (optional)
docker rmi booqoo:test
```

---

## 🐳 Full Test with Database

### Option 1: Using docker-compose.prod.yml

```bash
# 1. Create .env.production file
cp .env.production.example .env.production

# 2. Edit environment variables
nano .env.production
# Set:
# - POSTGRES_PASSWORD
# - NEXTAUTH_SECRET (generate: openssl rand -base64 32)
# - DOCKER_USERNAME

# 3. Build image (if not using registry)
docker build -f Dockerfile.production -t your-dockerhub-username/booqoo-pos:latest .

# 4. Start all services (app + database)
docker compose -f docker-compose.prod.yml up -d

# 5. Check status
docker compose -f docker-compose.prod.yml ps

# 6. Check logs
docker compose -f docker-compose.prod.yml logs -f app

# 7. Run migrations
docker compose -f docker-compose.prod.yml exec app npx prisma migrate deploy

# 8. Test health endpoint
curl http://localhost:3000/api/health
# Should return: "status": "ok"

# 9. Stop services
docker compose -f docker-compose.prod.yml down
```

### Option 2: Manual PostgreSQL + App

```bash
# 1. Start PostgreSQL
docker run -d --name test-postgres \
  -e POSTGRES_USER=booqoo \
  -e POSTGRES_PASSWORD=testpass123 \
  -e POSTGRES_DB=booqoo_test \
  -p 5432:5432 \
  postgres:15-alpine

# 2. Wait for PostgreSQL to be ready
sleep 5

# 3. Run app container with database link
docker run -d --name booqoo-test \
  -p 3000:3000 \
  --link test-postgres:postgres \
  -e DATABASE_URL="postgresql://booqoo:testpass123@postgres:5432/booqoo_test?schema=public" \
  -e NEXTAUTH_SECRET="test-secret-12345678901234567890" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  booqoo:test

# 4. Run database migrations
docker exec booqoo-test npx prisma migrate deploy

# 5. Test health endpoint
curl http://localhost:3000/api/health

# 6. Cleanup
docker stop booqoo-test test-postgres
docker rm booqoo-test test-postgres
```

---

## 📊 Container Statistics

### Check Resource Usage

```bash
# Real-time stats
docker stats booqoo-test

# Expected metrics:
# CPU: < 5% (idle), 10-30% (under load)
# Memory: 50-150MB (without heavy load)
# Network: Depends on traffic
```

### Check Container Health

```bash
# Container status
docker ps -a | grep booqoo

# Inspect container
docker inspect booqoo-test

# Check health status (if healthcheck enabled)
docker inspect --format='{{.State.Health.Status}}' booqoo-test
```

---

## 🔍 Debugging

### View Logs

```bash
# Follow logs (real-time)
docker logs -f booqoo-test

# Last 50 lines
docker logs --tail 50 booqoo-test

# Logs with timestamps
docker logs --timestamps booqoo-test
```

### Access Container Shell

```bash
# Open shell in running container
docker exec -it booqoo-test sh

# Inside container:
# - Check files: ls -la
# - Check environment: env | grep DATABASE
# - Check process: ps aux
# - Test database: npx prisma db push --skip-generate
```

### Common Issues

#### Issue 1: Port already in use

```bash
# Error: bind: address already in use

# Solution: Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
docker run -p 3001:3000 ...
```

#### Issue 2: Database connection error

```bash
# Error: Can't reach database server

# Check:
1. PostgreSQL container is running
   docker ps | grep postgres

2. DATABASE_URL is correct
   docker inspect booqoo-test | grep DATABASE_URL

3. Network connectivity
   docker exec booqoo-test ping postgres
```

#### Issue 3: Container exits immediately

```bash
# Check why container stopped
docker logs booqoo-test

# Common causes:
# - Missing environment variables
# - Invalid DATABASE_URL format
# - Port conflict
```

#### Issue 4: Prisma engine error (Mac M1/M2)

```bash
# Error: libquery_engine-linux-musl-arm64-openssl

# This is expected on Mac ARM without database
# Solution: Use docker-compose with PostgreSQL
# Or: Build on Linux/CI for production
```

---

## 🧪 Build Testing Checklist

Before pushing to production:

- [ ] **Build succeeds** without errors
  ```bash
  docker build -f Dockerfile.production -t booqoo:test .
  ```

- [ ] **Image size** is reasonable (~250-300MB)
  ```bash
  docker images booqoo:test
  ```

- [ ] **Container starts** without crashing
  ```bash
  docker run -d -p 3000:3000 -e DATABASE_URL="..." booqoo:test
  docker ps | grep booqoo
  ```

- [ ] **Next.js is ready** (check logs)
  ```bash
  docker logs booqoo-test | grep "Ready"
  ```

- [ ] **Health endpoint** responds (with or without DB)
  ```bash
  curl http://localhost:3000/api/health
  ```

- [ ] **Database migrations** work (with PostgreSQL)
  ```bash
  docker exec booqoo-test npx prisma migrate deploy
  ```

- [ ] **Resource usage** is acceptable
  ```bash
  docker stats booqoo-test --no-stream
  ```

- [ ] **No critical errors** in logs
  ```bash
  docker logs booqoo-test | grep -i error
  ```

---

## 📦 Multi-Platform Build (Optional)

Untuk build image yang kompatibel dengan berbagai platform:

```bash
# Setup buildx
docker buildx create --use

# Build untuk multiple platforms
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  -f Dockerfile.production \
  -t your-dockerhub-username/booqoo-pos:latest \
  --push \
  .

# Note: Requires Docker Hub/GHCR credentials
```

---

## 🚀 Performance Testing

### Test 1: Build Time

```bash
# Clean build (no cache)
time docker build --no-cache -f Dockerfile.production -t booqoo:test .

# Expected: 3-5 minutes

# With cache
time docker build -f Dockerfile.production -t booqoo:test .

# Expected: 30-60 seconds
```

### Test 2: Startup Time

```bash
# Measure startup time
docker run -d --name booqoo-test \
  -e DATABASE_URL="postgresql://test:test@localhost:5432/test" \
  -e NEXTAUTH_SECRET="test" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  booqoo:test

sleep 3
docker logs booqoo-test | grep "Ready in"

# Expected: Ready in 100-200ms
```

### Test 3: Memory Usage

```bash
# Check memory after startup
docker stats booqoo-test --no-stream --format "{{.MemUsage}}"

# Expected: 50-150MB
```

---

## 🔄 CI/CD Simulation

Test the full CI/CD pipeline locally:

```bash
# 1. Quality checks (runs on host)
npm run lint
npm run type-check
npm audit --audit-level=critical

# 2. Build Docker image
docker build -f Dockerfile.production -t booqoo:test .

# 3. Tag image
docker tag booqoo:test your-dockerhub-username/booqoo-pos:test

# 4. Login to registry (optional)
docker login

# 5. Push image (optional)
docker push your-dockerhub-username/booqoo-pos:test

# 6. Deploy (simulate)
docker compose -f docker-compose.prod.yml pull
docker compose -f docker-compose.prod.yml up -d

# 7. Health check
curl http://localhost:3000/api/health
```

---

## 📚 Reference Commands

### Docker Build

```bash
# Standard build
docker build -f Dockerfile.production -t booqoo:test .

# No cache
docker build --no-cache -f Dockerfile.production -t booqoo:test .

# With build args
docker build \
  --build-arg BUILDTIME=$(date -u +"%Y-%m-%dT%H:%M:%SZ") \
  -f Dockerfile.production \
  -t booqoo:test .
```

### Docker Run

```bash
# Basic run
docker run -d -p 3000:3000 \
  -e DATABASE_URL="..." \
  -e NEXTAUTH_SECRET="..." \
  -e NEXTAUTH_URL="..." \
  booqoo:test

# With custom name
docker run -d --name my-booqoo \
  -p 3000:3000 \
  -e DATABASE_URL="..." \
  booqoo:test

# Interactive mode (debugging)
docker run -it --rm \
  -p 3000:3000 \
  -e DATABASE_URL="..." \
  booqoo:test sh
```

### Docker Compose

```bash
# Start services
docker compose -f docker-compose.prod.yml up -d

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Stop services
docker compose -f docker-compose.prod.yml down

# Restart specific service
docker compose -f docker-compose.prod.yml restart app

# Execute command in service
docker compose -f docker-compose.prod.yml exec app sh
```

### Cleanup

```bash
# Remove all stopped containers
docker container prune -f

# Remove unused images
docker image prune -af

# Remove everything (including volumes)
docker system prune -af --volumes

# Remove specific test resources
docker rm -f $(docker ps -aq --filter name=booqoo-test)
docker rmi booqoo:test
```

---

## ✅ Expected Test Results

### Successful Build

```
[runner 8/8] COPY --from=builder ...
✓ Ready in 100-200ms
exporting to image
naming to docker.io/library/booqoo:test
DONE
```

### Successful Run (No DB)

```
▲ Next.js 14.2.35
- Local:   http://localhost:3000
- Network: http://0.0.0.0:3000

✓ Starting...
✓ Ready in 116ms
```

### Successful Health Check (With DB)

```json
{
  "status": "ok",
  "timestamp": "2026-05-23T...",
  "uptime": 123.456,
  "database": {
    "status": "connected",
    "userCount": 1
  },
  "environment": "production"
}
```

---

## 🆘 Getting Help

If testing fails:

1. **Check logs**: `docker logs booqoo-test`
2. **Check container**: `docker inspect booqoo-test`
3. **Test database**: `docker exec booqoo-test npx prisma db push`
4. **Verify env vars**: `docker exec booqoo-test env | grep DATABASE`
5. **Check build output**: Look for errors during `docker build`

---

**Last Updated:** 2026-05-23  
**Tested On:** 
- ✅ Docker Desktop (Mac M1/M2)
- ✅ Docker Engine (Linux x86_64)
- ✅ Docker Compose v2.x
