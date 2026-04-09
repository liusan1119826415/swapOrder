# 🚀 超简单 Nginx + Docker 部署指南

## 只需 3 步，完成部署！

---

## 📋 前提条件

确保服务器上已安装：
- ✅ Docker
- ✅ Docker Compose

---

## 🎯 部署步骤

### 步骤 1：上传代码到服务器

```bash
# 方式 1：使用 Git
git clone https://github.com/your-repo/nft-market-next.git
cd nft-market-next

# 方式 2：使用 SCP 上传
scp -r nft-market-next/ user@your-server:/opt/
```

### 步骤 2：配置环境变量

编辑 `docker-compose.yml`，更新后端 API 地址：

```bash
nano docker-compose.yml
```

找到这一行并修改：
```yaml
environment:
  - NEXT_PUBLIC_API_URL=http://你的后端服务器IP:8900
```

### 步骤 3：一键启动

```bash
# 使用简单配置文件启动
docker-compose -f docker-compose-simple.yml up -d
```

**就这么简单！** 🎉

---

## ✅ 验证部署

```bash
# 1. 查看容器状态
docker-compose -f docker-compose-simple.yml ps

# 应该看到两个容器都在运行：
# - nft-frontend (Next.js 应用)
# - nft-nginx (Nginx 反向代理)

# 2. 查看日志
docker-compose -f docker-compose-simple.yml logs -f

# 3. 访问网站
# 浏览器打开：http://你的服务器IP
curl http://localhost
```

---

## 🔧 常用命令

```bash
# 启动服务
docker-compose -f docker-compose-simple.yml up -d

# 停止服务
docker-compose -f docker-compose-simple.yml down

# 重启服务
docker-compose -f docker-compose-simple.yml restart

# 查看日志
docker-compose -f docker-compose-simple.yml logs -f

# 查看实时日志
docker-compose -f docker-compose-simple.yml logs -f --tail=100

# 重新构建并启动
docker-compose -f docker-compose-simple.yml up -d --build

# 查看容器状态
docker-compose -f docker-compose-simple.yml ps
```

---

## 🔒 启用 HTTPS（可选）

如果你有 SSL 证书：

### 1. 准备证书文件

```bash
# 创建 SSL 目录
mkdir -p ssl

# 将证书文件放入 ssl/ 目录
# - fullchain.pem (证书链)
# - privkey.pem (私钥)
```

### 2. 编辑 Nginx 配置

```bash
nano nginx-simple.conf
```

取消注释 HTTPS 部分，并修改域名：

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;  # 改成你的域名

    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    location / {
        proxy_pass http://frontend:3000;
        # ... 其他配置
    }
}
```

### 3. 重启服务

```bash
docker-compose -f docker-compose-simple.yml restart nginx
```

### 使用 Let's Encrypt 免费证书

```bash
# 安装 Certbot
sudo apt install certbot

# 获取证书（需要先停止 Nginx）
docker-compose -f docker-compose-simple.yml stop nginx
sudo certbot certonly --standalone -d yourdomain.com

# 复制证书
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ssl/

# 重启服务
docker-compose -f docker-compose-simple.yml start nginx
```

---

## 🐛 常见问题

### 问题 1：端口被占用

```bash
# 查看哪个进程占用了 80 端口
sudo lsof -i :80

# 停止占用端口的服务
sudo systemctl stop apache2  # 或其他服务
```

### 问题 2：无法访问网站

```bash
# 检查容器是否运行
docker ps | grep nft

# 检查 Nginx 配置
docker exec nft-nginx nginx -t

# 查看 Nginx 日志
docker logs nft-nginx

# 查看前端日志
docker logs nft-frontend
```

### 问题 3：后端 API 连接失败

```bash
# 检查后端服务器是否可访问
curl http://你的后端IP:8900/api/v1/analytics

# 检查防火墙
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### 问题 4：更新代码后重新部署

```bash
# 拉取最新代码
git pull

# 重新构建并启动
docker-compose -f docker-compose-simple.yml up -d --build
```

---

## 📊 目录结构

```
nft-market-next/
├── Dockerfile                  # Docker 构建文件
├── docker-compose-simple.yml   # 简单部署配置
├── nginx-simple.conf           # Nginx 配置
├── ssl/                        # SSL 证书目录（可选）
│   ├── fullchain.pem
│   └── privkey.pem
└── ...其他项目文件
```

---

## 🎯 完整示例

```bash
# === 首次部署 ===
cd /opt/nft-market-next
docker-compose -f docker-compose-simple.yml up -d

# === 日常维护 ===
# 查看状态
docker-compose -f docker-compose-simple.yml ps

# 查看日志
docker-compose -f docker-compose-simple.yml logs -f

# 重启服务
docker-compose -f docker-compose-simple.yml restart

# 更新部署
git pull
docker-compose -f docker-compose-simple.yml up -d --build

# 停止服务
docker-compose -f docker-compose-simple.yml down
```

---

## 💡 提示

1. **首次构建可能需要几分钟**，因为需要下载依赖和构建应用
2. **确保后端 API 地址配置正确**，否则前端无法获取数据
3. **建议使用 HTTPS**，特别是涉及钱包连接时
4. **定期更新**：`docker-compose -f docker-compose-simple.yml pull && docker-compose -f docker-compose-simple.yml up -d`

---

## 📞 需要帮助？

```bash
# 查看所有容器日志
docker-compose -f docker-compose-simple.yml logs

# 进入容器调试
docker exec -it nft-frontend sh
docker exec -it nft-nginx sh

# 查看资源使用
docker stats
```

---

**就这么简单！祝部署顺利！** 🚀
