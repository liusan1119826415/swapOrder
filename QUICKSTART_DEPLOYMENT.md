# Quick Start & Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Backend Deployment (EasySwapBackend)](#backend-deployment-easyswapbackend)
4. [Sync Service Deployment (EasySwapSync)](#sync-service-deployment-easysync)
5. [Frontend Deployment (nft-market-next)](#frontend-deployment-nft-market-next)
6. [Smart Contract Deployment](#smart-contract-deployment)
7. [Production Build](#production-build)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

**Backend & Sync Services:**
- Go 1.21 or higher
- MySQL 8.0 or higher
- Redis 6.0 or higher
- Git

**Frontend:**
- Node.js 18 or higher
- pnpm 8 or higher
- npm or yarn (alternative)

**Smart Contracts:**
- Node.js 18 or higher
- Hardhat
- MetaMask or similar Web3 wallet

**Infrastructure:**
- Docker & Docker Compose (recommended for database setup)
- Infura or Alchemy account for RPC endpoints

---

## Project Structure

```
ProjectBreakdown-NFTMarket/
├── EasySwapBackend/          # Go backend API service
├── EasySwapBase/             # Common base library
├── EasySwapSync/             # Blockchain event sync service
├── EasySwapContract/         # Smart contracts
├── nft-market-next/          # Next.js frontend application
└── Documentation files
```

---

## Backend Deployment (EasySwapBackend)

### Step 1: Clone and Setup Repositories

All three repositories must be cloned to the same parent directory:

```bash
# Create project directory
mkdir -p ~/projects/nft-market
cd ~/projects/nft-market

# Clone repositories
git clone https://github.com/ProjectsTask/EasySwapBackend.git
git clone https://github.com/ProjectsTask/EasySwapBase.git
git clone https://github.com/ProjectsTask/EasySwapSync.git
```

Directory structure should look like:
```
nft-market/
├── EasySwapBackend/
├── EasySwapBase/
└── EasySwapSync/
```

### Step 2: Install Dependencies

```bash
cd EasySwapBackend
go mod download
```

### Step 3: Setup Database

#### Option A: Using Docker (Recommended)

```bash
# Start MySQL and Redis using Docker
docker run -d --name mysql-nft \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=easyswap_nft_market \
  mysql:8.0

docker run -d --name redis-nft \
  -p 6379:6379 \
  redis:7-alpine
```

#### Option B: Manual Installation

Install MySQL and Redis following official documentation for your OS.

#### Create Database Schema

```sql
-- Connect to MySQL
mysql -u root -p

-- Create database
CREATE DATABASE easyswap_nft_market CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE easyswap_nft_market;

-- Run migration scripts
source db/migrations/01_create.sql;
source db/migrations/02_extend_tables.sql;
source db/migrations/03_seed_data.sql;
source db/migrations/04_init_nft_indexer.sql;
source db/migrations/05_add_item_image_url.sql;
```

### Step 4: Configure Application

Copy and edit configuration file:

```bash
cp config/config.toml.example config/config.toml
```

Edit `config/config.toml`:

```toml
[server]
port = 8080
mode = "debug"  # Use "release" for production

[database]
host = "localhost"
port = 3306
user = "root"
password = "your_password"
database = "easyswap_nft_market"
max_open_conns = 100
max_idle_conns = 10

[redis]
host = "localhost"
port = 6379
password = ""
db = 0
pool_size = 10

[chains]
# Ethereum Mainnet
[[chainSupported]]
name = "ethereum"
chain_id = 1
rpc_url = "https://mainnet.infura.io/v3/YOUR_INFURA_KEY"
explorer_url = "https://etherscan.io"

# Sepolia Testnet
[[chainSupported]]
name = "sepolia"
chain_id = 11155111
rpc_url = "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
explorer_url = "https://sepolia.etherscan.io"

# Polygon
[[chainSupported]]
name = "polygon"
chain_id = 137
rpc_url = "https://polygon-rpc.com"
explorer_url = "https://polygonscan.com"

[easyswap_market]
# Replace with deployed contract address
contract = "0xYourDeployedContractAddress"
```

### Step 5: Update Go Module Path

In `go.mod`, ensure the replace directive points to EasySwapBase:

```go
replace github.com/ProjectsTask/EasySwapBase => ../EasySwapBase
```

Then run:
```bash
go mod tidy
```

### Step 6: Start Backend Service

#### Development Mode

```bash
cd src
go run main.go
```

Expected output:
```
[GIN-debug] [WARNING] Running in "DEBUG" mode
[GIN-debug] Listening and serving HTTP on :8080
```

#### Production Build

```bash
# Build binary
go build -o easyswap-backend src/main.go

# Run binary
./easyswap-backend
```

#### Using Systemd (Linux Production)

Create service file `/etc/systemd/system/easyswap-backend.service`:

```ini
[Unit]
Description=EasySwap Backend API
After=network.target mysql.service redis.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/EasySwapBackend
ExecStart=/path/to/EasySwapBackend/easyswap-backend
Restart=always
RestartSec=5
Environment="GIN_MODE=release"

[Install]
WantedBy=multi-user.target
```

Start service:
```bash
sudo systemctl daemon-reload
sudo systemctl enable easyswap-backend
sudo systemctl start easyswap-backend
sudo systemctl status easyswap-backend
```

### Step 7: Verify Backend APIs

Test endpoints:

```bash
# Analytics API
curl http://localhost:8080/api/v1/analytics

# Collections API
curl http://localhost:8080/api/v1/collections

# Activity API
curl http://localhost:8080/api/v1/activities

# Portfolio API (requires authentication)
curl http://localhost:8080/api/v1/portfolio/collections
```

---

## Sync Service Deployment (EasySwapSync)

### Step 1: Navigate to Directory

```bash
cd EasySwapSync
```

### Step 2: Install Dependencies

```bash
go mod download
```

### Step 3: Setup Database

The sync service uses the same MySQL and Redis instances as the backend. Ensure they are running.

### Step 4: Configure Application

Copy configuration template:

```bash
cp config/config.toml.example config/config.toml
```

Edit `config/config.toml`:

```toml
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

[chain]
# Use the chain you want to sync from
rpc_url = "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
chain_id = 11155111

[contract]
# Deployed EasySwapOrderBook contract address
address = "0xYourContractAddress"

[sync]
# Block number to start syncing from
start_block = 0
batch_size = 1000
poll_interval = 15  # seconds
```

### Step 5: Start Sync Service

```bash
go run main.go daemon
```

Expected output:
```
Starting NFT indexer...
Listening for contract events...
Synced block 12345
Indexed NFT metadata for collection 0x...
```

### Step 6: Setup Metadata Update Cron Job (Optional)

For periodic NFT metadata updates:

```bash
# Edit crontab
crontab -e

# Add job to update metadata every hour
0 * * * * cd /path/to/EasySwapSync && /usr/bin/go run scripts/update_metadata.go
```

### Step 7: Verify Sync Status

Check database tables:

```sql
-- Check synced collections
SELECT COUNT(*) FROM collections;

-- Check synced items
SELECT COUNT(*) FROM items;

-- Check activities
SELECT COUNT(*) FROM activities ORDER BY created_at DESC LIMIT 10;

-- Check order book events
SELECT COUNT(*) FROM ob_orders;
```

---

## Frontend Deployment (nft-market-next)

### Step 1: Install Dependencies

```bash
cd nft-market-next
pnpm install
```

### Step 2: Environment Configuration

Create environment file:

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080

# Chain Configuration
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CHAIN_NAME="Sepolia"

# App Configuration
NEXT_PUBLIC_APP_NAME="NFT Market"
NEXT_PUBLIC_APP_DESCRIPTION="Decentralized NFT Marketplace"

# Wallet Configuration
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="your_project_id"

# IPFS Configuration (if using IPFS)
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

### Step 3: Update Contract Addresses

Update contract addresses in `lib/contracts/` or configuration:

```typescript
// lib/contracts/contractAddresses.ts
export const CONTRACT_ADDRESSES = {
  sepolia: {
    orderBook: '0xYourDeployedContractAddress',
    vault: '0xYourVaultContractAddress',
  },
  // Add more chains as needed
};
```

### Step 4: Start Development Server

```bash
# Development mode with hot reload
pnpm dev

# Opens at http://localhost:3000
```

### Step 5: Production Build

```bash
# Build optimized production bundle
pnpm build

# Preview production build locally
pnpm start
```

### Step 6: Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
pnpm add -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

Set environment variables in Vercel dashboard matching your `.env.local`.

### Step 7: Deploy to Other Platforms

#### Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
```

Build and run:
```bash
docker build -t nft-market-frontend .
docker run -p 3000:3000 nft-market-frontend
```

#### Traditional Web Server (Nginx)

```bash
# Build static export
pnpm build

# The output will be in .next/static/
# Configure Nginx to serve the app
```

Nginx configuration example:

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8080;
    }
}
```

---

## Smart Contract Deployment

### Step 1: Setup

```bash
cd EasySwapContract
npm install
```

### Step 2: Configure Network

Copy environment file:

```bash
cp .env.example .env
```

Edit `.env`:

```env
# Private key for deployment (DO NOT commit this!)
PRIVATE_KEY=your_wallet_private_key

# RPC URLs
INFURA_API_KEY=your_infura_key
ALCHEMY_API_KEY=your_alchemy_key

# Etherscan API for verification
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### Step 3: Deploy to Testnet (Sepolia)

```bash
# Deploy OrderBook contract
npx hardhat run scripts/deploy.js --network sepolia

# Deploy ERC721A test contract
npx hardhat run scripts/deploy_721.js --network sepolia
```

Save deployed contract addresses for configuration.

### Step 4: Verify Contracts

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

### Step 5: Setup Collection Filter (Optional)

```bash
# Configure allowed collections for indexing
npx hardhat run scripts/setup_nft_metadata.js --network sepolia
```

---

## Production Build

### Complete Stack Deployment Checklist

#### Infrastructure
- [ ] MySQL database created and migrated
- [ ] Redis instance running
- [ ] SSL certificates configured (HTTPS)
- [ ] Domain names configured
- [ ] Firewall rules configured

#### Backend
- [ ] Configuration file updated for production
- [ ] Database connection pool tuned
- [ ] Redis caching enabled
- [ ] Rate limiting configured
- [ ] Logging level set to INFO or ERROR
- [ ] Systemd service running
- [ ] Health check endpoint monitored

#### Sync Service
- [ ] Contract address configured
- [ ] Starting block set correctly
- [ ] Poll interval optimized
- [ ] Database indexes created
- [ ] Monitoring alerts configured

#### Frontend
- [ ] Environment variables set for production
- [ ] API URLs point to production backend
- [ ] Contract addresses updated
- [ ] Build optimized (`pnpm build`)
- [ ] CDN configured for static assets
- [ ] Error tracking enabled (Sentry, etc.)

#### Smart Contracts
- [ ] Contracts deployed to target network
- [ ] Contract source verified on Etherscan
- [ ] Proxy contracts initialized
- [ ] Admin roles configured
- [ ] Security audit completed

### Performance Optimization

#### Backend Optimizations

1. **Database Indexing**:
```sql
CREATE INDEX idx_collection_address ON collections(address);
CREATE INDEX idx_activity_event_time ON activities(event_time);
CREATE INDEX idx_items_token_id ON items(token_id, contract_address);
CREATE INDEX idx_orders_status ON ob_orders(status, expiry);
```

2. **Redis Caching**:
```toml
[cache]
enabled = true
default_ttl = 300  # 5 minutes
collections_ranking_ttl = 60  # 1 minute
analytics_stats_ttl = 3600  # 1 hour
```

3. **Connection Pooling**:
```toml
[database]
max_open_conns = 100
max_idle_conns = 20
conn_max_lifetime = 3600
```

#### Frontend Optimizations

1. **Image Optimization**:
```typescript
// next.config.mjs
images: {
  domains: ['ipfs.io', 'gateway.pinata.cloud'],
  formats: ['image/avif', 'image/webp'],
}
```

2. **React Query Configuration**:
```typescript
// lib/api/client.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

3. **Code Splitting**:
```typescript
// Dynamic imports for heavy components
const TradingModal = dynamic(() => import('@/components/ui/TradingModal'), {
  ssr: false,
  loading: () => <Skeleton />
});
```

---

## Troubleshooting

### Backend Issues

#### Database Connection Error
```
Error: dial tcp 127.0.0.1:3306: connectex: No connection
```
**Solution**: 
- Verify MySQL is running: `docker ps | grep mysql`
- Check credentials in config.toml
- Ensure database exists

#### Redis Connection Failed
```
Error: redis: connection refused
```
**Solution**:
- Start Redis: `docker start redis-nft`
- Verify port: `netstat -an | grep 6379`

#### API Returns 404
**Solution**:
- Check route registration in `src/api/router/v1.go`
- Verify URL path is correct
- Review server logs for routing errors

### Sync Service Issues

#### Not Syncing Events
**Solution**:
- Verify contract address is correct
- Check RPC endpoint connectivity
- Ensure starting block is valid
- Review sync logs: `logs/relayer/*.log`

#### Metadata Not Updating
**Solution**:
- Check tokenURI implementation
- Verify IPFS gateway accessibility
- Run manual update: `go run scripts/update_metadata.go`

### Frontend Issues

#### Wallet Connection Fails
**Solution**:
- Install MetaMask extension
- Ensure using HTTPS (required for some wallets)
- Check WalletConnect project ID

#### API Requests Fail (CORS Error)
**Solution**:
- Verify backend CORS configuration
- Check NEXT_PUBLIC_API_URL in .env.local
- Ensure backend is running

#### TypeScript Errors
```
Error: Module has no exported member
```
**Solution**:
- Run `pnpm type-check`
- Check import paths are correct
- Restart TypeScript server in IDE

### Smart Contract Issues

#### Deployment Fails
```
Error: insufficient funds for gas * price + value
```
**Solution**:
- Ensure wallet has sufficient ETH
- Adjust gas price in hardhat config
- Use a different RPC endpoint

#### Contract Verification Fails
**Solution**:
- Match compiler version in hardhat config
- Ensure constructor arguments are correct
- Wait for block confirmations before verifying

---

## Monitoring and Maintenance

### Recommended Monitoring Tools

1. **Application Monitoring**:
   - Prometheus + Grafana for metrics
   - ELK Stack for log aggregation
   - Sentry for error tracking

2. **Database Monitoring**:
   - MySQL Enterprise Monitor
   - Percona Monitoring and Management
   - RedisInsight for Redis

3. **Uptime Monitoring**:
   - UptimeRobot
   - Pingdom
   - Better Stack

### Regular Maintenance Tasks

**Daily**:
- Check error logs
- Monitor disk space
- Verify sync service is current

**Weekly**:
- Review slow query logs
- Analyze cache hit rates
- Check contract events for anomalies

**Monthly**:
- Database backup verification
- Security updates
- Performance benchmarking

---

## Support and Resources

### Documentation
- [Project Overview](./PROJECT_OVERVIEW.md)
- [Business Logic Flow](./BUSINESS_LOGIC_FLOW.md)
- [Development Tasks](./DEVELOPMENT_TASKS.md)
- [Integration Summary](./INTEGRATION_SUMMARY.md)

### Community
- GitHub Issues for bug reports
- Discussions for feature requests
- Discord/Telegram for community support

---

**Last Updated**: April 2026
