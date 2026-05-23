#!/bin/bash

# ============================================
# BooQoo Production Deployment Script
# Quick deploy script for manual deployment
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}======================================"
echo "BooQoo Production Deployment"
echo "======================================${NC}"

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo -e "${RED}Error: .env.production file not found!${NC}"
    echo "Please create .env.production from .env.production.example"
    exit 1
fi

# Load environment variables
source .env.production

echo -e "${YELLOW}[1/6] Checking Docker...${NC}"
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed!${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is available${NC}"

echo -e "${YELLOW}[2/6] Pulling latest image...${NC}"
docker pull ${DOCKER_USERNAME}/booqoo-pos:latest
echo -e "${GREEN}✓ Image pulled${NC}"

echo -e "${YELLOW}[3/6] Stopping old containers...${NC}"
docker compose -f docker-compose.prod.yml down
echo -e "${GREEN}✓ Containers stopped${NC}"

echo -e "${YELLOW}[4/6] Starting new containers...${NC}"
docker compose -f docker-compose.prod.yml up -d
echo -e "${GREEN}✓ Containers started${NC}"

echo -e "${YELLOW}[5/6] Running database migrations...${NC}"
sleep 10  # Wait for containers to be ready
docker compose -f docker-compose.prod.yml exec -T app npx prisma migrate deploy
echo -e "${GREEN}✓ Migrations completed${NC}"

echo -e "${YELLOW}[6/6] Running health check...${NC}"
sleep 5
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed!${NC}"
    echo "Check logs with: docker compose -f docker-compose.prod.yml logs -f"
    exit 1
fi

echo -e "${GREEN}======================================"
echo "✅ Deployment completed successfully!"
echo "======================================${NC}"
echo ""
echo "Application is running at: http://localhost:3000"
echo "Check logs: docker compose -f docker-compose.prod.yml logs -f"
echo "Stop services: docker compose -f docker-compose.prod.yml down"
