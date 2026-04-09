#!/bin/bash

# NFT Market 自动化部署脚本 (Ubuntu + Nginx)

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}NFT Market 部署脚本${NC}"
echo -e "${GREEN}==================================${NC}"

# 配置变量
PROJECT_NAME="nft-market"
DEPLOY_DIR="/var/www/${PROJECT_NAME}"
NGINX_CONF="/etc/nginx/sites-available/${PROJECT_NAME}"
DOMAIN="yourdomain.com"

# 检查是否以 root 运行
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}请使用 sudo 运行此脚本${NC}"
  exit 1
fi

# 1. 创建部署目录
echo -e "${YELLOW}[1/5] 创建部署目录...${NC}"
mkdir -p ${DEPLOY_DIR}
chown -R www-data:www-data ${DEPLOY_DIR}
chmod -R 755 ${DEPLOY_DIR}

# 2. 备份旧版本（如果存在）
if [ -d "${DEPLOY_DIR}/backup" ]; then
  echo -e "${YELLOW}[2/5] 清理旧备份...${NC}"
  rm -rf ${DEPLOY_DIR}/backup
fi

if [ -f "${DEPLOY_DIR}/index.html" ]; then
  echo -e "${YELLOW}[2/5] 备份当前版本...${NC}"
  mkdir -p ${DEPLOY_DIR}/backup
  cp -r ${DEPLOY_DIR}/* ${DEPLOY_DIR}/backup/ 2>/dev/null || true
fi

# 3. 上传新文件（从 stdin 读取 tar 包）
echo -e "${YELLOW}[3/5] 解压新文件...${NC}"
tar -xzf - -C ${DEPLOY_DIR}

# 4. 测试 Nginx 配置
echo -e "${YELLOW}[4/5] 测试 Nginx 配置...${NC}"
nginx -t

if [ $? -ne 0 ]; then
  echo -e "${RED}Nginx 配置测试失败！恢复备份...${NC}"
  if [ -d "${DEPLOY_DIR}/backup" ] && [ "$(ls -A ${DEPLOY_DIR}/backup)" ]; then
    cp -r ${DEPLOY_DIR}/backup/* ${DEPLOY_DIR}/
  fi
  exit 1
fi

# 5. 重新加载 Nginx
echo -e "${YELLOW}[5/5] 重新加载 Nginx...${NC}"
systemctl reload nginx

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}✅ 部署成功！${NC}"
echo -e "${GREEN}==================================${NC}"
echo -e "网站地址：https://${DOMAIN}"
echo -e "部署目录：${DEPLOY_DIR}"
echo -e ""
echo -e "查看日志：tail -f /var/log/nginx/${PROJECT_NAME}-error.log"
