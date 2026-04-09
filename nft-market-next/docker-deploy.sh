#!/bin/bash

# ============================================
# NFT Market 前端 Docker 快速部署脚本
# ============================================

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
SERVICE_NAME="nft-market-frontend"
IMAGE_NAME="nft-market-frontend"
CONTAINER_NAME="nft-market-frontend"

# 打印函数
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查 Docker 是否安装
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker 未安装！请先安装 Docker。"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose 未安装！请先安装 Docker Compose。"
        exit 1
    fi
    
    print_success "Docker 和 Docker Compose 已安装"
}

# 显示帮助
show_help() {
    echo -e "${BLUE}==================================${NC}"
    echo -e "${BLUE}NFT Market 前端 Docker 部署脚本${NC}"
    echo -e "${BLUE}==================================${NC}"
    echo ""
    echo "用法: $0 [选项]"
    echo ""
    echo "选项:"
    echo "  build       构建 Docker 镜像"
    echo "  start       启动服务"
    echo "  stop        停止服务"
    echo "  restart     重启服务"
    echo "  status      查看服务状态"
    echo "  logs        查看服务日志"
    echo "  clean       清理 Docker 资源"
    echo "  deploy      完整部署流程（构建+启动）"
    echo "  production  生产环境部署"
    echo "  with-nginx  使用 Nginx 反向代理部署"
    echo "  help        显示此帮助信息"
    echo ""
    echo "示例:"
    echo "  $0 build              # 仅构建镜像"
    echo "  $0 deploy             # 构建并启动"
    echo "  $0 production         # 生产环境部署"
    echo "  $0 with-nginx         # 带 Nginx 部署"
    echo ""
}

# 构建镜像
build_image() {
    print_info "开始构建 Docker 镜像..."
    
    if docker build -t ${IMAGE_NAME}:latest .; then
        print_success "Docker 镜像构建成功！"
        docker images | grep ${IMAGE_NAME}
    else
        print_error "Docker 镜像构建失败！"
        exit 1
    fi
}

# 启动服务
start_service() {
    print_info "启动服务..."
    
    if docker-compose up -d; then
        print_success "服务启动成功！"
        echo ""
        print_info "服务访问地址: http://localhost:3000"
        print_info "查看日志: docker-compose logs -f"
    else
        print_error "服务启动失败！"
        exit 1
    fi
}

# 停止服务
stop_service() {
    print_info "停止服务..."
    
    if docker-compose down; then
        print_success "服务已停止"
    else
        print_error "服务停止失败！"
        exit 1
    fi
}

# 重启服务
restart_service() {
    print_info "重启服务..."
    
    if docker-compose restart; then
        print_success "服务已重启"
    else
        print_error "服务重启失败！"
        exit 1
    fi
}

# 查看状态
show_status() {
    print_info "服务状态:"
    echo ""
    docker-compose ps
    echo ""
    
    if docker ps | grep -q ${CONTAINER_NAME}; then
        print_success "服务正在运行"
        echo ""
        print_info "资源使用情况:"
        docker stats --no-stream ${CONTAINER_NAME}
    else
        print_warning "服务未运行"
    fi
}

# 查看日志
show_logs() {
    print_info "显示服务日志 (Ctrl+C 退出)..."
    docker-compose logs -f ${SERVICE_NAME}
}

# 清理资源
clean_resources() {
    print_warning "这将删除所有 Docker 资源（镜像、容器、网络）"
    read -p "确认继续？(y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_info "清理 Docker 资源..."
        docker-compose down --rmi all --volumes --remove-orphans
        docker system prune -af
        print_success "清理完成"
    else
        print_info "操作已取消"
    fi
}

# 完整部署
deploy() {
    print_info "开始完整部署流程..."
    echo ""
    
    # 检查 Docker
    check_docker
    
    # 构建镜像
    build_image
    
    echo ""
    
    # 启动服务
    start_service
    
    echo ""
    print_success "=================================="
    print_success "部署完成！"
    print_success "=================================="
    echo ""
    print_info "访问地址: http://localhost:3000"
    print_info "查看日志: docker-compose logs -f"
    print_info "停止服务: docker-compose down"
}

# 生产环境部署
deploy_production() {
    print_info "开始生产环境部署..."
    echo ""
    
    # 检查环境文件
    if [ ! -f ".env.production" ]; then
        print_error "找不到 .env.production 文件！"
        print_info "请先创建 .env.production 文件并配置环境变量"
        exit 1
    fi
    
    # 检查 Docker
    check_docker
    
    # 构建镜像
    build_image
    
    echo ""
    
    # 使用生产环境配置启动
    print_info "使用生产环境配置启动服务..."
    if docker-compose --env-file .env.production up -d; then
        print_success "生产环境部署成功！"
        echo ""
        print_info "查看日志: docker-compose logs -f"
    else
        print_error "生产环境部署失败！"
        exit 1
    fi
}

# 使用 Nginx 部署
deploy_with_nginx() {
    print_info "开始使用 Nginx 反向代理部署..."
    echo ""
    
    # 检查 SSL 证书
    if [ ! -d "ssl" ] || [ -z "$(ls -A ssl/ 2>/dev/null)" ]; then
        print_warning "SSL 证书目录为空或未配置"
        print_info "将仅启动 HTTP 服务"
        print_info "要启用 HTTPS，请将证书文件放入 ssl/ 目录:"
        print_info "  - fullchain.pem"
        print_info "  - privkey.pem"
        echo ""
        read -p "是否继续？(y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 0
        fi
    fi
    
    # 检查 Docker
    check_docker
    
    # 构建镜像
    build_image
    
    echo ""
    
    # 启动完整服务栈
    print_info "启动完整服务栈（包括 Nginx）..."
    if docker-compose --profile with-nginx up -d; then
        print_success "Nginx 反向代理部署成功！"
        echo ""
        print_info "HTTP  访问: http://localhost:80"
        print_info "HTTPS 访问: https://localhost:443"
        print_info "查看日志: docker-compose logs -f"
    else
        print_error "Nginx 部署失败！"
        exit 1
    fi
}

# 主函数
main() {
    case "${1:-help}" in
        build)
            check_docker
            build_image
            ;;
        start)
            check_docker
            start_service
            ;;
        stop)
            stop_service
            ;;
        restart)
            restart_service
            ;;
        status)
            show_status
            ;;
        logs)
            show_logs
            ;;
        clean)
            clean_resources
            ;;
        deploy)
            deploy
            ;;
        production)
            deploy_production
            ;;
        with-nginx)
            deploy_with_nginx
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知命令: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
