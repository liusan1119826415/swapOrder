# nft-market-next Docker 部署完整指南

## 📋 目录

1. [部署方案概览](#部署方案概览)
2. [方案 1：基础 Docker 部署](#方案-1基础-docker-部署)
3. [方案 2：Docker Compose 部署（推荐）](#方案-2docker-compose-部署推荐)
4. [方案 3：使用 Nginx 反向代理](#方案-3使用-nginx-反向代理)
5. [环境变量配置](#环境变量配置)
6. [生产环境优化](#生产环境优化)
7. [常见问题排查](#常见问题排查)

---

## 🎯 部署方案概览

本项目提供三种 Docker 部署方式：

| 方案 | 适用场景 | 复杂度 | 推荐指数 |
|------|----------|--------|----------|
| **基础 Docker** | 快速测试、开发环境 | ⭐ | ⭐⭐⭐ |
| **Docker Compose** | 生产环境、完整服务 | ⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Nginx 反向代理** | 生产环境、HTTPS、负载均衡 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 方案 1：基础 Docker 部署

### 适用场景
- 快速测试
- 开发环境
- 简单部署

### 部署步骤

#### 1. 构建 Docker 镜像

```bash
# 进入项目目录
cd nft-market-next

# 构建镜像
docker build -t nft-market-frontend:latest .

# 查看镜像
docker images | grep nft-market
```

#### 2. 运行容器

```bash
# 基础运行
docker run -d \
  --name nft-market-frontend \
  -p 3000:3000 \
  --restart unless-stopped \
  nft-market-frontend:latest

# 带环境变量运行
docker run -d \
  --name nft-market-frontend \
  -p 3000:3000 \
  -e NEXT_PUBLIC_API_URL=http://your-backend:8080 \
  -e NEXT_PUBLIC_CHAIN_ID=11155111 \
  --restart unless-stopped \
  nft-market-frontend:latest
```

#### 3. 验证部署

```bash
# 查看容器状态
docker ps | grep nft-market

# 查看日志
docker logs -f nft-market-frontend

# 测试访问
curl http://localhost:3000
```

#### 4. 管理命令

```bash
# 停止容器
docker stop nft-market-frontend

# 启动容器
docker start nft-market-frontend

# 重启容器
docker restart nft-market-frontend

# 删除容器
docker rm -f nft-market-frontend

# 查看资源使用
docker stats nft-market-frontend
```

---

## 方案 2：Docker Compose 部署（推荐）

### 适用场景
- 生产环境部署
- 需要管理多个服务
- 需要环境变量管理

### 部署步骤

#### 1. 准备环境文件

创建 `.env.production` 文件：

```bash
# 后端 API 配置
NEXT_PUBLIC_API_URL=http://your-backend-server:8080

# 区块链配置
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_CHAIN_NAME=Sepolia

# 应用配置
NEXT_PUBLIC_APP_NAME="NFT Market"
NEXT_PUBLIC_APP_DESCRIPTION="Decentralized NFT Marketplace"

# 钱包配置
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=your_project_id

# IPFS 配置
NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io/ipfs/
```

#### 2. 修改 docker-compose.yml

编辑 `docker-compose.yml`，更新环境变量：

```yaml
services:
  nft-market-frontend:
    environment:
      - NEXT_PUBLIC_API_URL=http://your-backend-server:8080
      - NEXT_PUBLIC_CHAIN_ID=11155111
      # ... 其他配置
```

#### 3. 启动服务

```bash
# 构建并启动（前台运行，查看日志）
docker-compose up

# 后台运行
docker-compose up -d

# 仅构建不启动
docker-compose build

# 使用指定环境文件
docker-compose --env-file .env.production up -d
```

#### 4. 管理命令

```bash
# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f nft-market-frontend

# 停止服务
docker-compose stop

# 启动服务
docker-compose start

# 重启服务
docker-compose restart

# 停止并删除容器
docker-compose down

# 停止并删除容器、网络、镜像
docker-compose down --rmi all
```

---

## 方案 3：使用 Nginx 反向代理

### 适用场景
- 需要 HTTPS
- 需要域名访问
- 需要负载均衡
- 生产环境最佳实践

### 部署步骤

#### 1. 准备 SSL 证书

```bash
# 创建 SSL 目录
mkdir -p ssl

# 方式 1：使用 Let's Encrypt（免费）
# 在服务器上运行
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com

# 复制证书到项目目录
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/

# 方式 2：使用自己的证书
# 将证书文件放入 ssl/ 目录
# - fullchain.pem
# - privkey.pem
```

#### 2. 修改 Nginx 配置

编辑 `nginx-proxy.conf`，更新域名：

```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    # ...
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    # ...
}
```

#### 3. 启动服务（包含 Nginx）

```bash
# 启动完整服务栈（包括 Nginx）
docker-compose --profile with-nginx up -d

# 或单独启动
docker-compose up -d
docker-compose --profile with-nginx up -d nginx-proxy
```

#### 4. 验证 HTTPS

```bash
# 测试 HTTP 重定向
curl -I http://yourdomain.com

# 测试 HTTPS
curl -I https://yourdomain.com

# 检查 SSL 证书
echo | openssl s_client -connect yourdomain.com:443 2>/dev/null | openssl x509 -noout -dates
```

---

## 🔧 环境变量配置

### 必需环境变量

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `NEXT_PUBLIC_API_URL` | 后端 API 地址 | `http://backend:8080` |
| `NEXT_PUBLIC_CHAIN_ID` | 区块链 ID | `11155111` |
| `NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID` | WalletConnect 项目 ID | `your_project_id` |

### 可选环境变量

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `NEXT_PUBLIC_CHAIN_NAME` | 链名称 | `Sepolia` |
| `NEXT_PUBLIC_APP_NAME` | 应用名称 | `NFT Market` |
| `NEXT_PUBLIC_IPFS_GATEWAY` | IPFS 网关 | `https://ipfs.io/ipfs/` |
| `PORT` | 应用端口 | `3000` |
| `NODE_ENV` | 运行环境 | `production` |

### 环境变量优先级

```
docker-compose.yml environment > .env 文件 > Dockerfile ENV > 代码默认值
```

---

## 🚀 生产环境优化

### 1. 资源配置

在 `docker-compose.yml` 中已配置资源限制：

```yaml
deploy:
  resources:
    limits:
      cpus: '2'
      memory: 2G
    reservations:
      cpus: '0.5'
      memory: 512M
```

### 2. 健康检查

已配置健康检查，自动重启失败容器：

```yaml
healthcheck:
  test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/"]
  interval: 30s
  timeout: 10s
  retries: 3
  start_period: 40s
```

### 3. 日志管理

```bash
# 限制日志大小
docker run --log-opt max-size=10m --log-opt max-file=3 ...

# 或在 docker-compose.yml 中配置
logging:
  driver: json-file
  options:
    max-size: "10m"
    max-file: "3"
```

### 4. 自动重启

```yaml
restart: unless-stopped  # 除非手动停止，否则总是重启
```

---

## 🔍 常见问题排查

### 问题 1：容器启动失败

```bash
# 查看详细日志
docker logs nft-market-frontend

# 检查镜像是否正确构建
docker images | grep nft-market

# 重新构建
docker-compose build --no-cache
```

### 问题 2：无法访问应用

```bash
# 检查容器状态
docker ps | grep nft-market

# 检查端口映射
docker port nft-market-frontend

# 检查防火墙
sudo ufw status
sudo ufw allow 3000/tcp

# 测试内部访问
docker exec -it nft-market-frontend wget -qO- http://localhost:3000/
```

### 问题 3：环境变量未生效

```bash
# 检查环境变量
docker exec nft-market-frontend env | grep NEXT_PUBLIC

# 重新创建容器
docker-compose down
docker-compose up -d
```

### 问题 4：性能问题

```bash
# 查看资源使用
docker stats nft-market-frontend

# 查看日志大小
du -sh /var/lib/docker/containers/*/

# 清理无用资源
docker system prune -a
```

### 问题 5：SSL 证书问题

```bash
# 检查证书文件
ls -la ssl/

# 测试证书
openssl s_client -connect localhost:443 -servername yourdomain.com

# 更新 Let's Encrypt 证书
sudo certbot renew
docker-compose restart nginx-proxy
```

---

## 📊 监控和维护

### 1. 查看日志

```bash
# 实时日志
docker-compose logs -f nft-market-frontend

# 最近 100 行
docker-compose logs --tail=100 nft-market-frontend

# 导出日志
docker-compose logs nft-market-frontend > app.log
```

### 2. 进入容器

```bash
# 进入容器 shell
docker exec -it nft-market-frontend sh

# 查看文件
docker exec nft-market-frontend ls -la /app

# 检查进程
docker exec nft-market-frontend ps aux
```

### 3. 更新部署

```bash
# 拉取最新代码
git pull

# 重新构建和部署
docker-compose down
docker-compose build
docker-compose up -d

# 查看新版本
docker-compose ps
```

### 4. 备份和恢复

```bash
# 备份数据卷
docker run --rm \
  -v nft-market-next_data:/data \
  -v $(pwd):/backup \
  alpine tar czf /backup/data-backup.tar.gz -C /data .

# 恢复数据
docker run --rm \
  -v nft-market-next_data:/data \
  -v $(pwd):/backup \
  alpine tar xzf /backup/data-backup.tar.gz -C /data
```

---

## 🎯 快速参考命令

```bash
# === 开发环境 ===
docker-compose up                    # 启动服务
docker-compose logs -f               # 查看日志
docker-compose down                  # 停止服务

# === 生产环境 ===
docker-compose --env-file .env.production up -d  # 生产环境启动
docker-compose ps                     # 查看状态
docker-compose restart                # 重启服务

# === 带 Nginx ===
docker-compose --profile with-nginx up -d  # 启动完整服务栈

# === 维护 ===
docker-compose build --no-cache      # 强制重新构建
docker-compose down --rmi all        # 清理所有
docker system prune -a               # 清理 Docker 资源
```

---

## 📝 总结

### 推荐部署流程

1. **开发测试**：使用方案 1（基础 Docker）
2. **生产部署**：使用方案 2（Docker Compose）
3. **正式上线**：使用方案 3（Nginx + HTTPS）

### 安全检查清单

- [ ] 更新所有环境变量
- [ ] 配置 SSL 证书
- [ ] 设置资源限制
- [ ] 配置健康检查
- [ ] 设置日志轮转
- [ ] 定期更新镜像
- [ ] 备份重要数据

### 性能优化建议

- 使用多阶段构建减小镜像体积
- 配置合适的资源限制
- 启用 Gzip 压缩
- 使用 CDN 加速静态资源
- 配置合理的缓存策略

---

**最后更新**: 2026 年 4 月
