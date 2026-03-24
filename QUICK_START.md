# NFT Market 快速开始指南

## 项目结构

```
ProjectBreakdown-NFTMarket/
├── EasySwapBackend/          # Go 后端 API 服务
│   ├── src/
│   │   ├── api/v1/          # API 处理函数
│   │   ├── service/v1/      # 业务逻辑层
│   │   ├── types/v1/        # 数据类型定义
│   │   └── dao/             # 数据访问层
│   └── config/              # 配置文件
├── nft-market-next/          # Next.js 前端应用
│   ├── src/app/             # 页面路由
│   ├── lib/api/             # API 客户端
│   ├── lib/hooks/           # React Query Hooks
│   ├── components/          # UI 组件
│   └── types/               # TypeScript 类型
└── INTEGRATION_SUMMARY.md   # 集成文档
```

---

## 后端启动 (EasySwapBackend)

### 1. 环境要求
- Go 1.21+
- MySQL 8.0+
- Redis 6.0+

### 2. 安装依赖
```bash
cd EasySwapBackend
go mod download
```

### 3. 配置数据库
```sql
-- 创建数据库
CREATE DATABASE easyswap_nft_market;
USE easyswap_nft_market;

-- 运行迁移脚本（如果有）
source db/migrations/*.sql
```

### 4. 配置文件
编辑 `config/config.toml`:
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
# 支持的链配置
[[chainSupported]]
name = "ethereum"
chain_id = 1
rpc_url = "https://mainnet.infura.io/v3/YOUR_KEY"

[[chainSupported]]
name = "polygon"
chain_id = 137
rpc_url = "https://polygon-rpc.com"
```

### 5. 启动服务
```bash
# 开发模式
go run src/main.go

# 或编译后运行
go build -o easyswap-backend
./easyswap-backend
```

### 6. 验证 API
```bash
# 测试 Analytics API
curl http://localhost:8080/api/v1/analytics

# 测试 Artists API
curl http://localhost:8080/api/v1/artists

# 测试 Auctions API
curl http://localhost:8080/api/v1/auctions

# 测试 Drops API
curl http://localhost:8080/api/v1/drops
```

---

## 前端启动 (nft-market-next)

### 1. 环境要求
- Node.js 18+
- pnpm 8+

### 2. 安装依赖
```bash
cd nft-market-next
pnpm install
```

### 3. 环境变量
创建 `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_CHAIN_ID=1
NEXT_PUBLIC_APP_NAME="NFT Market"
```

### 4. 启动开发服务器
```bash
# 开发模式
pnpm dev

# 构建生产版本
pnpm build

# 预览生产构建
pnpm start
```

### 5. 访问应用
打开浏览器访问：http://localhost:3000

---

## 模块测试指南

### 1. Activity 页面 (`/activity`)
**测试内容：**
- ✅ 加载活动列表
- ✅ 按事件类型过滤（Sales, Listings, Bids, Transfers）
- ✅ 按链过滤（Ethereum, Polygon, Arbitrum, Optimism）
- ✅ 分页加载

**测试步骤：**
1. 访问 http://localhost:3000/activity
2. 检查是否显示活动列表
3. 切换不同的事件类型过滤器
4. 切换不同的链过滤器
5. 点击"Load More"测试分页

### 2. Analytics 页面 (`/analytics`)
**测试内容：**
- ✅ 显示统计数据（Total Volume, Sales, Active Users）
- ✅ 时间范围切换（1H, 1D, 7D, 30D）
- ✅ 顶级集合排名表格

**测试步骤：**
1. 访问 http://localhost:3000/analytics
2. 检查统计卡片数据是否正确显示
3. 切换不同时间范围，观察数据变化
4. 检查 Top Collections 表格

### 3. Collections 页面 (`/collections`)
**测试内容：**
- ✅ Collection 列表展示
- ✅ 按分类过滤
- ✅ 按时间范围排序
- ✅ Collection 卡片信息

**测试步骤：**
1. 访问 http://localhost:3000/collections
2. 检查 Collection 网格布局
3. 测试分类过滤器
4. 切换 24h/7d/30d 视图

### 4. Portfolio 页面 (`/portfolio`)
**测试内容：**
- ⏳ 用户拥有 NFT 展示
- ⏳ 挂单和出价信息
- ⏳ 投资组合统计

**测试步骤：**
1. 需要连接钱包
2. 访问 http://localhost:3000/portfolio
3. 检查 Owned/Listed/Activity/Offer 标签页

### 5. Favorites 页面 (`/favorites`)
**测试内容：**
- ⏳ 收藏的 NFT 列表
- ⏳ 收藏的 Collection 列表

**测试步骤：**
1. 需要登录
2. 访问 http://localhost:3000/favorites
3. 检查收藏夹内容

### 6. Explore 页面 (`/explore`)
**测试内容：**
- ⏳ Trending Collections
- ⏳ Featured NFTs

**测试步骤：**
1. 访问 http://localhost:3000/explore
2. 检查推荐内容

### 7. Artists 页面 (`/artists`)
**测试内容：**
- ⏳ 艺术家排名列表
- ⏳ 按交易量排序
- ⏳ 搜索艺术家

**测试步骤：**
1. 访问 http://localhost:3000/artists
2. 检查艺术家排名
3. 使用搜索功能

### 8. Auctions 页面 (`/auctions`)
**测试内容：**
- ⏳ 进行中的拍卖
- ⏳ 即将结束的拍卖
- ⏳ 实时出价更新

**测试步骤：**
1. 访问 http://localhost:3000/auctions
2. 检查拍卖列表
3. 观察实时更新

### 9. Drops 页面 (`/drops`)
**测试内容：**
- ⏳ 正在进行的新品发布
- ⏳ 即将开始的发布
- ⏳ 发布日期倒计时

**测试步骤：**
1. 访问 http://localhost:3000/drops
2. 检查 Drops 列表
3. 查看即将到来的发布

---

## 常见问题排查

### 后端问题

#### 1. 无法连接到数据库
```
错误：dial tcp 127.0.0.1:3306: connectex: No connection could be made
```
**解决方案：**
- 确认 MySQL 服务已启动
- 检查 config.toml 中的数据库配置
- 确认数据库已创建

#### 2. Redis 连接失败
```
错误：redis: connection refused
```
**解决方案：**
- 启动 Redis 服务：`redis-server`
- 检查 Redis 配置

#### 3. API 返回 404
**解决方案：**
- 检查路由是否正确注册
- 确认 URL 路径正确
- 查看服务器日志

### 前端问题

#### 1. API 请求失败
```
错误：Network Error
```
**解决方案：**
- 确认后端服务已启动（http://localhost:8080）
- 检查 .env.local 中的 NEXT_PUBLIC_API_URL
- 检查浏览器控制台 CORS 错误

#### 2. 数据不显示
**解决方案：**
- 打开浏览器 DevTools 查看 Network 标签
- 检查 API 响应格式
- 查看 React Query 缓存状态

#### 3. TypeScript 错误
```
错误：Module has no exported member
```
**解决方案：**
- 运行 `pnpm type-check` 检查类型
- 确保类型定义正确导出
- 重启 TypeScript 服务器

---

## API 测试示例

### 使用 Postman/cURL 测试

```bash
# 1. 获取 Analytics 数据
curl -X GET "http://localhost:8080/api/v1/analytics?period=1d"

# 2. 获取 Artists 排名
curl -X GET "http://localhost:8080/api/v1/artists/ranking?period=7d&limit=10"

# 3. 获取 Auctions 列表
curl -X GET "http://localhost:8080/api/v1/auctions?status=active&page=1&page_size=20"

# 4. 获取 Drops 列表
curl -X GET "http://localhost:8080/api/v1/drops?status=live"

# 5. 获取 Activities
curl -X GET "http://localhost:8080/api/v1/activities?filters={\"page\":1,\"page_size\":20}"

# 6. 获取 Collection 排名
curl -X GET "http://localhost:8080/api/v1/collections/ranking?limit=10&range=1d"
```

---

## 性能优化建议

### 后端优化
1. **启用 Redis 缓存**
   - Collection 排名缓存 60 秒
   - Analytics 数据缓存 5 分钟

2. **数据库索引**
   ```sql
   CREATE INDEX idx_collection_address ON collections(address);
   CREATE INDEX idx_activity_time ON activities(event_time);
   ```

3. **并发查询**
   - 使用 goroutine 并发查询多链数据
   - 使用 sync.WaitGroup 等待结果

### 前端优化
1. **React Query 配置**
   ```typescript
   defaultOptions: {
     queries: {
       staleTime: 5 * 60 * 1000, // 5 分钟
       retry: 2,
     },
   }
   ```

2. **图片优化**
   - 使用 Next/Image 组件
   - 实现懒加载

3. **代码分割**
   - 使用动态导入
   - 按需加载组件

---

## 开发者工具

### 推荐 VS Code 扩展
- Go (Go 语言支持)
- ESLint + Prettier (代码格式化)
- Tailwind CSS IntelliSense
- Thunder Client (API 测试)

### 调试工具
```bash
# 后端调试
delve debug src/main.go

# 前端调试
pnpm dev --inspect
```

---

## 联系与支持

如有问题，请查看：
- [INTEGRATION_SUMMARY.md](./INTEGRATION_SUMMARY.md) - 完整集成文档
- 项目 README.md - 项目概述
- EasySwapBackend/README.md - 后端文档
- nft-market-next/README.md - 前端文档

---

**最后更新**: 2026-03-24
