# NFT Market - Quick Reference Card

## 📖 Essential Commands

### Backend (EasySwapBackend)

```bash
# Install dependencies
cd EasySwapBackend
go mod download

# Setup database
docker run -d --name mysql-nft -p 3306:3306 -e MYSQL_ROOT_PASSWORD=pass -e MYSQL_DATABASE=easyswap_nft_market mysql:8.0
docker run -d --name redis-nft -p 6379:6379 redis:7-alpine

# Configure
cp config/config.toml.example config/config.toml
# Edit config.toml with your settings

# Run (development)
cd src && go run main.go

# Build (production)
go build -o easyswap-backend src/main.go
./easyswap-backend
```

### Sync Service (EasySwapSync)

```bash
# Install dependencies
cd EasySwapSync
go mod download

# Configure
cp config/config.toml.example config/config.toml
# Edit config.toml with contract address and RPC

# Run
go run main.go daemon
```

### Frontend (nft-market-next)

```bash
# Install dependencies
cd nft-market-next
pnpm install

# Configure
cp .env.local.example .env.local
# Edit .env.local with API URL and chain settings

# Run (development)
pnpm dev

# Build (production)
pnpm build
pnpm start
```

---

## 🔧 Configuration Files

### Backend Config (config.toml)
```toml
[server]
port = 8080
mode = "debug"

[database]
host = "localhost"
port = 3306
user = "root"
password = "your_password"
database = "easyswap_nft_market"

[redis]
host = "localhost"
port = 6379
password = ""
db = 0

[chains]
[[chainSupported]]
name = "sepolia"
chain_id = 11155111
rpc_url = "https://sepolia.infura.io/v3/YOUR_KEY"

[easyswap_market]
contract = "0xYourContractAddress"
```

### Frontend Config (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_APP_NAME="NFT Market"
```

---

## 🗄️ Database Setup

```sql
-- Create database
CREATE DATABASE easyswap_nft_market CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Run migrations
source db/migrations/01_create.sql;
source db/migrations/02_extend_tables.sql;
source db/migrations/03_seed_data.sql;
source db/migrations/04_init_nft_indexer.sql;
source db/migrations/05_add_item_image_url.sql;

-- Verify tables
SHOW TABLES;
```

---

## 🌐 API Endpoints

### Public Endpoints
```bash
# Analytics
GET /api/v1/analytics?period=1d

# Collections
GET /api/v1/collections
GET /api/v1/collections/ranking?limit=10&range=1d

# Activities
GET /api/v1/activities?filters={"page":1,"page_size":20}

# Drops
GET /api/v1/drops?status=live
```

### Portfolio (Requires Auth)
```bash
GET /api/v1/portfolio/collections
GET /api/v1/portfolio/items
GET /api/v1/portfolio/listings
GET /api/v1/portfolio/bids
```

---

## 🎯 Smart Contract Deployment

```bash
cd EasySwapContract
npm install

# Configure
cp .env.example .env
# Add PRIVATE_KEY and API keys

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Verify contract
npx hardhat verify --network sepolia DEPLOYED_ADDRESS
```

---

## 🐛 Common Issues & Solutions

### Backend won't start
```bash
# Check MySQL is running
docker ps | grep mysql

# Check Redis is running  
docker ps | grep redis

# Verify config
cat config/config.toml | grep -A 5 "\[database\]"
```

### Frontend can't connect to backend
```bash
# Check backend is running
curl http://localhost:8080/api/v1/analytics

# Verify .env.local
cat .env.local | grep API_URL

# Check CORS in backend logs
```

### Sync service not syncing
```bash
# Check RPC endpoint
curl -X POST https://sepolia.infura.io/v3/YOUR_KEY \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_blockNumber","id":1}'

# Verify contract address in config
# Check sync logs
tail -f logs/relayer/debug.log
```

---

## 📊 Port Numbers

| Service | Port | Protocol |
|---------|------|----------|
| Backend API | 8080 | HTTP |
| Frontend Dev | 3000 | HTTP |
| Frontend Prod | 3000 | HTTP |
| MySQL | 3306 | TCP |
| Redis | 6379 | TCP |

---

## 🔍 Testing Commands

```bash
# Test backend API
curl http://localhost:8080/api/v1/analytics
curl http://localhost:8080/api/v1/collections

# Test frontend
open http://localhost:3000

# Check database
mysql -u root -p -e "USE easyswap_nft_market; SELECT COUNT(*) FROM collections;"

# Check Redis
redis-cli ping

# Check Docker containers
docker ps
docker logs mysql-nft
docker logs redis-nft
```

---

## 🚀 Production Checklist

- [ ] MySQL indexes created
- [ ] Redis caching enabled
- [ ] Backend running as systemd service or Docker container
- [ ] Sync service running as daemon
- [ ] Frontend built with `pnpm build`
- [ ] SSL certificates configured
- [ ] Environment variables set for production
- [ ] Monitoring tools configured
- [ ] Backups configured
- [ ] Contract addresses updated
- [ ] Rate limiting configured

---

## 📚 Documentation Links

- [Full Project Overview](./PROJECT_OVERVIEW.md)
- [项目概述 (中文)](./PROJECT_OVERVIEW_CN.md)
- [Quick Start Guide](./QUICKSTART_DEPLOYMENT.md)
- [快速开始指南 (中文)](./QUICKSTART_DEPLOYMENT_CN.md)
- [Documentation Index](./DOCUMENTATION_INDEX.md)

---

**Quick Reference Card - Last Updated**: April 2026
