# 快速开始与部署指南

## 目录

1. [前置要求](#前置要求)
2. [项目结构](#项目结构)
3. [后端部署 (EasySwapBackend)](#后端部署-easyswapbackend)
4. [同步服务部署 (EasySwapSync)](#同步服务部署-easysync)
5. [前端部署 (nft-market-next)](#前端部署-nft-market-next)
6. [智能合约部署](#智能合约部署)
7. [生产环境构建](#生产环境构建)
8. [故障排查](#故障排查)

---

## 前置要求

### 必需软件

**后端和同步服务:**
- Go 1.21 或更高版本
- MySQL 8.0 或更高版本
- Redis 6.0 或更高版本
- Git

**前端:**
- Node.js 18 或更高版本
- pnpm 8 或更高版本
- npm 或 yarn（可选）

**智能合约:**
- Node.js 18 或更高版本
- Hardhat
- MetaMask 或类似的 Web3 钱包

**基础设施:**
- Docker 和 Docker Compose（推荐用于数据库设置）
- Infura 或 Alchemy 账户用于 RPC 端点

---

## 项目结构

```
ProjectBreakdown-NFTMarket/
├── EasySwapBackend/          # Go 后端 API 服务
├── EasySwapBase/             # 通用基础库
├── EasySwapSync/             # 区块链事件同步服务
├── EasySwapContract/         # 智能合约
├── nft-market-next/          # Next.js 前端应用
└── 文档文件
```

---

## 后端部署 (EasySwapBackend)

### 步骤 1：克隆仓库

所有三个仓库必须克隆到同一个父目录下：

```bash
# 创建项目目录
mkdir -p ~/projects/nft-market
cd ~/projects/nft-market

# 克隆仓库
git clone https://github.com/ProjectsTask/EasySwapBackend.git
git clone https://github.com/ProjectsTask/EasySwapBase.git
git clone https://github.com/ProjectsTask/EasySwapSync.git
```

目录结构应该如下：
```
nft-market/
├── EasySwapBackend/
├── EasySwapBase/
└── EasySwapSync/
```

### 步骤 2：安装依赖

```bash
cd EasySwapBackend
go mod download
```

### 步骤 3：设置数据库

#### 选项 A：使用 Docker（推荐）

```bash
# 使用 Docker 启动 MySQL 和 Redis
docker run -d --name mysql-nft \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=your_password \
  -e MYSQL_DATABASE=easyswap_nft_market \
  mysql:8.0

docker run -d --name redis-nft \
  -p 6379:6379 \
  redis:7-alpine
```

#### 选项 B：手动安装

根据官方文档为您的操作系统安装 MySQL 和 Redis。

#### 创建数据库模式

```sql
-- 连接到 MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE easyswap_nft_market CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE easyswap_nft_market;

-- 运行迁移脚本
source db/migrations/01_create.sql;
source db/migrations/02_extend_tables.sql;
source db/migrations/03_seed_data.sql;
source db/migrations/04_init_nft_indexer.sql;
source db/migrations/05_add_item_image_url.sql;
```

### 步骤 4：配置应用程序

复制并编辑配置文件：

```bash
cp config/config.toml.example config/config.toml
```

编辑 `config/config.toml`：

```toml
[server]
port = 8080
mode = "debug"  # 生产环境使用 "release"

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
# Ethereum 主网
[[chainSupported]]
name = "ethereum"
chain_id = 1
rpc_url = "https://mainnet.infura.io/v3/YOUR_INFURA_KEY"
explorer_url = "https://etherscan.io"

# Sepolia 测试网
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
# 替换为已部署的合约地址
contract = "0xYourDeployedContractAddress"
```

### 步骤 5：更新 Go 模块路径

在 `go.mod` 中，确保 replace 指令指向 EasySwapBase：

```go
replace github.com/ProjectsTask/EasySwapBase => ../EasySwapBase
```

然后运行：
```bash
go mod tidy
```

### 步骤 6：启动后端服务

#### 开发模式

```bash
cd src
go run main.go
```

预期输出：
```
[GIN-debug] [WARNING] Running in "DEBUG" mode
[GIN-debug] Listening and serving HTTP on :8080
```

#### 生产构建

```bash
# 构建二进制文件
go build -o easyswap-backend src/main.go

# 运行二进制文件
./easyswap-backend
```

#### 使用 Systemd（Linux 生产环境）

创建服务文件 `/etc/systemd/system/easyswap-backend.service`：

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

启动服务：
```bash
sudo systemctl daemon-reload
sudo systemctl enable easyswap-backend
sudo systemctl start easyswap-backend
sudo systemctl status easyswap-backend
```

### 步骤 7：验证后端 API

测试端点：

```bash
# Analytics API
curl http://localhost:8080/api/v1/analytics

# Collections API
curl http://localhost:8080/api/v1/collections

# Activity API
curl http://localhost:8080/api/v1/activities

# Portfolio API（需要认证）
curl http://localhost:8080/api/v1/portfolio/collections
```

---

## 同步服务部署 (EasySwapSync)

### 步骤 1：进入目录

```bash
cd EasySwapSync
```

### 步骤 2：安装依赖

```bash
go mod download
```

### 步骤 3：设置数据库

同步服务使用与后端相同的 MySQL 和 Redis 实例。确保它们正在运行。

### 步骤 4：配置应用程序

复制配置模板：

```bash
cp config/config.toml.example config/config.toml
```

编辑 `config/config.toml`：

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
# 使用要同步的链
rpc_url = "https://sepolia.infura.io/v3/YOUR_INFURA_KEY"
chain_id = 11155111

[contract]
# 已部署的 EasySwapOrderBook 合约地址
address = "0xYourContractAddress"

[sync]
# 开始同步的区块号
start_block = 0
batch_size = 1000
poll_interval = 15  # 秒
```

### 步骤 5：启动同步服务

```bash
go run main.go daemon
```

预期输出：
```
Starting NFT indexer...
Listening for contract events...
Synced block 12345
Indexed NFT metadata for collection 0x...
```

### 步骤 6：设置元数据更新定时任务（可选）

用于定期更新 NFT 元数据：

```bash
# 编辑 crontab
crontab -e

# 添加每小时更新元数据的任务
0 * * * * cd /path/to/EasySwapSync && /usr/bin/go run scripts/update_metadata.go
```

### 步骤 7：验证同步状态

检查数据库表：

```sql
-- 检查已同步的合集
SELECT COUNT(*) FROM collections;

-- 检查已同步的物品
SELECT COUNT(*) FROM items;

-- 检查活动记录
SELECT COUNT(*) FROM activities ORDER BY created_at DESC LIMIT 10;

-- 检查订单簿事件
SELECT COUNT(*) FROM ob_orders;
```

---

## 前端部署 (nft-market-next)

### 步骤 1：安装依赖

```bash
cd nft-market-next
pnpm install
```

### 步骤 2：环境配置

创建环境文件：

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`：

```env
# 后端 API URL
NEXT_PUBLIC_API_URL=http://localhost:8080

# 链配置
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CHAIN_NAME="Sepolia"

# 应用配置
NEXT_PUBLIC_APP_NAME="NFT Market"
NEXT_PUBLIC_APP_DESCRIPTION="去中心化 NFT 市场"

# 钱包配置
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID="your_project_id"

# IPFS 配置（如果使用 IPFS）
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

### 步骤 3：更新合约地址

更新 `lib/contracts/` 或配置文件中的合约地址：

```typescript
// lib/contracts/contractAddresses.ts
export const CONTRACT_ADDRESSES = {
  sepolia: {
    orderBook: '0xYourDeployedContractAddress',
    vault: '0xYourVaultContractAddress',
  },
  // 根据需要添加更多链
};
```

### 步骤 4：启动开发服务器

```bash
# 带热重载的开发模式
pnpm dev

# 在 http://localhost:3000 打开
```

### 步骤 5：生产构建

```bash
# 构建优化的生产包
pnpm build

# 在本地预览生产构建
pnpm start
```

### 步骤 6：部署到 Vercel（推荐）

```bash
# 安装 Vercel CLI
pnpm add -g vercel

# 登录 Vercel
vercel login

# 部署
vercel --prod
```

在 Vercel 仪表板中设置与 `.env.local` 匹配的环境变量。

### 步骤 7：部署到其他平台

#### Docker 部署

创建 `Dockerfile`：

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

构建并运行：
```bash
docker build -t nft-market-frontend .
docker run -p 3000:3000 nft-market-frontend
```

#### 传统 Web 服务器（Nginx）

```bash
# 构建静态导出
pnpm build

# 输出将在 .next/static/ 中
# 配置 Nginx 来服务应用
```

Nginx 配置示例：

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

## 智能合约部署

### 步骤 1：设置

```bash
cd EasySwapContract
npm install
```

### 步骤 2：配置网络

复制环境文件：

```bash
cp .env.example .env
```

编辑 `.env`：

```env
# 部署用的私钥（不要提交！）
PRIVATE_KEY=your_wallet_private_key

# RPC URL
INFURA_API_KEY=your_infura_key
ALCHEMY_API_KEY=your_alchemy_key

# Etherscan API 用于验证
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 步骤 3：部署到测试网（Sepolia）

```bash
# 部署 OrderBook 合约
npx hardhat run scripts/deploy.js --network sepolia

# 部署 ERC721A 测试合约
npx hardhat run scripts/deploy_721.js --network sepolia
```

保存已部署的合约地址用于配置。

### 步骤 4：验证合约

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS
```

### 步骤 5：设置合集过滤器（可选）

```bash
# 配置允许索引的合集
npx hardhat run scripts/setup_nft_metadata.js --network sepolia
```

---

## 生产环境构建

### 完整堆栈部署检查清单

#### 基础设施
- [ ] MySQL 数据库已创建并迁移
- [ ] Redis 实例正在运行
- [ ] SSL 证书已配置（HTTPS）
- [ ] 域名已配置
- [ ] 防火墙规则已配置

#### 后端
- [ ] 配置文件已为生产环境更新
- [ ] 数据库连接池已调优
- [ ] Redis 缓存已启用
- [ ] 速率限制已配置
- [ ] 日志级别设置为 INFO 或 ERROR
- [ ] Systemd 服务正在运行
- [ ] 健康检查端点已监控

#### 同步服务
- [ ] 合约地址已配置
- [ ] 起始区块设置正确
- [ ] 轮询间隔已优化
- [ ] 数据库索引已创建
- [ ] 监控警报已配置

#### 前端
- [ ] 环境变量已为生产环境设置
- [ ] API URL 指向生产后端
- [ ] 合约地址已更新
- [ ] 构建已优化（`pnpm build`）
- [ ] CDN 已为静态资产配置
- [ ] 错误跟踪已启用（Sentry 等）

#### 智能合约
- [ ] 合约已部署到目标网络
- [ ] 合约源码已在 Etherscan 验证
- [ ] 代理合约已初始化
- [ ] 管理员角色已配置
- [ ] 安全审计已完成

### 性能优化

#### 后端优化

1. **数据库索引**：
```sql
CREATE INDEX idx_collection_address ON collections(address);
CREATE INDEX idx_activity_event_time ON activities(event_time);
CREATE INDEX idx_items_token_id ON items(token_id, contract_address);
CREATE INDEX idx_orders_status ON ob_orders(status, expiry);
```

2. **Redis 缓存**：
```toml
[cache]
enabled = true
default_ttl = 300  # 5 分钟
collections_ranking_ttl = 60  # 1 分钟
analytics_stats_ttl = 3600  # 1 小时
```

3. **连接池**：
```toml
[database]
max_open_conns = 100
max_idle_conns = 20
conn_max_lifetime = 3600
```

#### 前端优化

1. **图片优化**：
```typescript
// next.config.mjs
images: {
  domains: ['ipfs.io', 'gateway.pinata.cloud'],
  formats: ['image/avif', 'image/webp'],
}
```

2. **React Query 配置**：
```typescript
// lib/api/client.ts
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 分钟
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

3. **代码分割**：
```typescript
// 对重量级组件进行动态导入
const TradingModal = dynamic(() => import('@/components/ui/TradingModal'), {
  ssr: false,
  loading: () => <Skeleton />
});
```

---

## 故障排查

### 后端问题

#### 数据库连接错误
```
Error: dial tcp 127.0.0.1:3306: connectex: No connection
```
**解决方案**: 
- 验证 MySQL 是否运行：`docker ps | grep mysql`
- 检查 config.toml 中的凭据
- 确保数据库已创建

#### Redis 连接失败
```
Error: redis: connection refused
```
**解决方案**:
- 启动 Redis：`docker start redis-nft`
- 验证端口：`netstat -an | grep 6379`

#### API 返回 404
**解决方案**:
- 检查 `src/api/router/v1.go` 中的路由注册
- 验证 URL 路径是否正确
- 查看服务器日志以获取路由错误

### 同步服务问题

#### 未同步事件
**解决方案**:
- 验证合约地址是否正确
- 检查 RPC 端点连接
- 确保起始区块有效
- 查看同步日志：`logs/relayer/*.log`

#### 元数据未更新
**解决方案**:
- 检查 tokenURI 实现
- 验证 IPFS 网关可访问性
- 手动运行更新：`go run scripts/update_metadata.go`

### 前端问题

#### 钱包连接失败
**解决方案**:
- 安装 MetaMask 扩展
- 确保使用 HTTPS（某些钱包需要）
- 检查 WalletConnect 项目 ID

#### API 请求失败（CORS 错误）
**解决方案**:
- 验证后端 CORS 配置
- 检查 .env.local 中的 NEXT_PUBLIC_API_URL
- 确保后端正在运行

#### TypeScript 错误
```
Error: Module has no exported member
```
**解决方案**:
- 运行 `pnpm type-check`
- 检查导入路径是否正确
- 在 IDE 中重启 TypeScript 服务器

### 智能合约问题

#### 部署失败
```
Error: insufficient funds for gas * price + value
```
**解决方案**:
- 确保钱包有足够的 ETH
- 在 hardhat 配置中调整 gas 价格
- 使用不同的 RPC 端点

#### 合约验证失败
**解决方案**:
- 匹配 hardhat 配置中的编译器版本
- 确保构造函数参数正确
- 在验证前等待区块确认

---

## 监控和维护

### 推荐的监控工具

1. **应用监控**：
   - Prometheus + Grafana 用于指标监控
   - ELK Stack 用于日志聚合
   - Sentry 用于错误跟踪

2. **数据库监控**：
   - MySQL Enterprise Monitor
   - Percona Monitoring and Management
   - RedisInsight 用于 Redis

3. **正常运行时间监控**：
   - UptimeRobot
   - Pingdom
   - Better Stack

### 定期维护任务

**每日**：
- 检查错误日志
- 监控磁盘空间
- 验证同步服务是最新的

**每周**：
- 审查慢查询日志
- 分析缓存命中率
- 检查合约事件是否有异常

**每月**：
- 数据库备份验证
- 安全更新
- 性能基准测试

---

## 支持和资源

### 文档
- [项目概述](./PROJECT_OVERVIEW_CN.md)
- [业务逻辑流程](./BUSINESS_LOGIC_FLOW.md)
- [开发任务清单](./DEVELOPMENT_TASKS.md)
- [集成总结](./INTEGRATION_SUMMARY.md)

### 社区
- GitHub Issues 用于错误报告
- Discussions 用于功能请求
- Discord/Telegram 用于社区支持

---

**最后更新**: 2026 年 4 月
