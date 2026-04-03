# NFT 元数据定时更新指南

## 📋 概述

本指南介绍如何定时更新 `item_sepolia` 表中的 `image_url` 和 `name` 字段。

### 问题背景

从合约调用获取的 `tokenURI` 可能为空或指向 IPFS 资源，需要：
1. 从合约获取 `tokenURI`
2. 从 `tokenURI` 解析 metadata JSON
3. 提取 `name` 和 `image` 字段
4. 更新到数据库

---

## 🚀 使用方法

### 方法一：手动更新特定 NFT

#### 更新单个 Token

```bash
cd EasySwapSync

# 设置环境变量
export COLLECTION_ADDRESS=0xbD82f9fdB3C78c276007bAa0396Cb3A3E48Eb2fF
export TOKEN_ID=16
export DATABASE_URL="root:password@tcp(localhost:3306)/easyswap?charset=utf8mb4&parseTime=True&loc=Local"

# 运行更新脚本
go run cmd/update_metadata.go
```

**输出示例：**
```
[INFO] Connected to database
[INFO] Updating specific NFT metadata
  collection: 0xbD82f9fdB3C78c276007bAa0396Cb3A3E48Eb2fF
  token_id: 16
[INFO] Successfully updated NFT metadata
  collection: 0xbD82f9fdB3C78c276007bAa0396Cb3A3E48Eb2fF
  token_id: 16
  name: Troll #16
  image_url: https://ipfs.io/ipfs/QmXYZ...
[INFO] Update completed
```

#### 更新整个 Collection

```bash
export COLLECTION_ADDRESS=0xbD82f9fdB3C78c276007bAa0396Cb3A3E48Eb2fF
export DATABASE_URL="root:password@tcp(localhost:3306)/easyswap?charset=utf8mb4&parseTime=True&loc=Local"

go run cmd/update_metadata.go
```

#### 批量更新所有缺失元数据的 NFT

```bash
export UPDATE_ALL=true
export DATABASE_URL="root:password@tcp(localhost:3306)/easyswap?charset=utf8mb4&parseTime=True&loc=Local"

go run cmd/update_metadata.go
```

---

### 方法二：在代码中集成定时任务

在 `main.go` 或启动脚本中添加：

```go
package main

import (
	"context"
	"time"

	"github.com/ProjectsTask/EasySwapSync/service/nftindexer"
)

func main() {
	// ... 其他初始化代码 ...

	// 创建 MetadataUpdater
	updater := nftindexer.NewMetadataUpdater(db, chainClient, 11155111, "sepolia")
	
	// 配置参数
	updater.SetBatchSize(50)              // 每批处理 50 个
	updater.SetParallelism(5)             // 5 个并发
	updater.SetTimeout(30 * time.Second)  // 单个超时 30 秒
	updater.SetInterval(1 * time.Hour)    // 每小时执行一次

	// 启动定时任务（后台 goroutine）
	ctx := context.Background()
	go updater.Start(ctx)

	// ... 其他业务逻辑 ...
}
```

---

### 方法三：使用 Cron Job（推荐用于生产环境）

创建系统 cron 任务：

```bash
# 编辑 crontab
crontab -e

# 添加以下行（每小时执行一次）
0 * * * * cd /path/to/EasySwapSync && \
    COLLECTION_ADDRESS=0xbD82f9fdB3C78c276007bAa0396Cb3A3E48Eb2fF \
    DATABASE_URL="root:password@tcp(localhost:3306)/easyswap" \
    go run cmd/update_metadata.go >> /var/log/nft_metadata_update.log 2>&1
```

或者使用 systemd timer：

```ini
# /etc/systemd/system/nft-metadata-update.service
[Unit]
Description=NFT Metadata Updater
After=network.target mysql.service

[Service]
Type=oneshot
User=www-data
WorkingDirectory=/path/to/EasySwapSync
Environment="COLLECTION_ADDRESS=0xbD82f9fdB3C78c276007bAa0396Cb3A3E48Eb2fF"
Environment="DATABASE_URL=root:password@tcp(localhost:3306)/easyswap"
ExecStart=/usr/local/go/bin/go run cmd/update_metadata.go
```

```ini
# /etc/systemd/system/nft-metadata-update.timer
[Unit]
Description=Run NFT metadata update hourly

[Timer]
OnCalendar=hourly
Persistent=true

[Install]
WantedBy=timers.target
```

启用定时任务：

```bash
sudo systemctl daemon-reload
sudo systemctl enable nft-metadata-update.timer
sudo systemctl start nft-metadata-update.timer
sudo systemctl list-timers --all
```

---

## ⚙️ 配置选项

### MetadataUpdater 配置

```go
updater := nftindexer.NewMetadataUpdater(db, chainClient, chainId, chain)

// 可选配置
updater.SetBatchSize(50)           // 批次大小（默认 50）
updater.SetParallelism(5)          // 并发数（默认 5）
updater.SetTimeout(30 * time.Second) // 单个 NFT 超时（默认 30 秒）
updater.SetInterval(1 * time.Hour)   // 执行间隔（默认 1 小时）
```

### 环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `COLLECTION_ADDRESS` | 要更新的 Collection 地址 | 无 |
| `TOKEN_ID` | 要更新的 Token ID | 无 |
| `UPDATE_ALL` | 是否更新所有缺失元数据的 NFT | false |
| `DATABASE_URL` | 数据库连接字符串 | root:password@tcp(localhost:3306)/easyswap |

---

## 📊 监控与日志

### 查看日志

```bash
# 实时查看日志
tail -f /var/log/nft_metadata_update.log

# 查看更新统计
grep "Successfully updated" /var/log/nft_metadata_update.log | wc -l
```

### 数据库查询

```sql
-- 查看最近更新的 NFT
SELECT collection_address, token_id, name, image_url, updated_at
FROM item_sepolia
ORDER BY updated_at DESC
LIMIT 20;

-- 查看还未更新元数据的 NFT 数量
SELECT COUNT(*) 
FROM item_sepolia
WHERE image_url = '' OR image_url IS NULL;

-- 查看某个 Collection 的更新情况
SELECT 
    collection_address,
    COUNT(*) as total,
    SUM(CASE WHEN image_url != '' AND image_url IS NOT NULL THEN 1 ELSE 0 END) as with_image
FROM item_sepolia
GROUP BY collection_address;
```

---

## 🔧 故障排除

### 问题 1: tokenURI 为空

**现象：**
```
[WARN] Token URI is empty, trying fallback
```

**原因：**
- 合约的 `_tokenURIs[tokenId]` 未设置
- 合约的 `metaURI` 未设置

**解决方案：**
1. 检查合约是否调用了 `setTokenURI()` 或 `mintWithURI()`
2. 使用区块链浏览器查看合约状态
3. 考虑使用 collection name + tokenID 作为 fallback

### 问题 2: IPFS 访问失败

**现象：**
```
[WARN] Failed to fetch metadata from URI
  error: failed to fetch metadata from URI: Get "https://ipfs.io/ipfs/...": dial tcp: lookup ipfs.io: no such host
```

**解决方案：**
1. 检查网络连接
2. 配置本地 IPFS 网关
3. 使用备用 IPFS 网关（如 `https://cloudflare-ipfs.com/ipfs/`）

### 问题 3: 数据库连接失败

**现象：**
```
[FATAL] Failed to connect to database: dial tcp 127.0.0.1:3306: connect: connection refused
```

**解决方案：**
1. 检查 MySQL 服务是否运行
2. 验证数据库凭据
3. 检查防火墙设置

---

## 📝 最佳实践

### 1. 分批处理

对于大量 NFT，建议分批处理：

```bash
# 先更新前 100 个
export BATCH_SIZE=100
go run cmd/update_metadata.go

# 然后再更新下一批
```

### 2. 错误重试

实现指数退避重试机制：

```go
// 在 metadata_updater.go 中添加重试逻辑
retryCount := 0
maxRetries := 3
for retryCount < maxRetries {
    updated, err := u.updateSingleNFTMetadata(ctx, item)
    if err == nil && updated {
        break
    }
    retryCount++
    time.Sleep(time.Duration(retryCount) * time.Second)
}
```

### 3. 优先级队列

优先更新重要的 NFT：

```sql
-- 优先更新 owner 活跃的 NFT
UPDATE item_sepolia i
JOIN (
    SELECT token_id 
    FROM item_sepolia 
    WHERE owner IN (SELECT DISTINCT owner FROM active_users)
    AND (image_url = '' OR name = '')
    LIMIT 50
) priority ON i.token_id = priority.token_id
SET i.name = ..., i.image_url = ...;
```

### 4. 缓存机制

使用 Redis 缓存已获取的 metadata：

```go
// 伪代码
cacheKey := fmt.Sprintf("nft:metadata:%s:%s", collection, tokenId)
cached, _ := redis.Get(cacheKey).Result()
if cached != "" {
    return cached, nil
}

// 获取并缓存
metadata, _ := fetchMetadata(...)
redis.Set(cacheKey, metadata, 24*time.Hour)
```

---

## 🎯 总结

### 推荐方案

| 场景 | 推荐方案 |
|------|----------|
| **开发测试** | 手动运行 `update_metadata.go` |
| **小批量更新** | 使用 `UpdateSpecificNFT` 或 `UpdateByCollection` |
| **定期维护** | 使用 cron job 或 systemd timer |
| **生产环境** | 集成到主程序 + 独立定时任务备份 |

### 关键指标

- ✅ **更新成功率**: > 95%
- ✅ **单次处理时间**: < 30 秒/NFT
- ✅ **并发控制**: 5-10 个并行任务
- ✅ **重试机制**: 最多 3 次重试

---

## 📚 相关文档

- [NFT Indexing Service Enhancement Summary](./NFT_INDEXING_SUMMARY.md)
- [IPFS Integration Guide](./IPFS_GUIDE.md)
- [Database Schema](./db/migrations/)
