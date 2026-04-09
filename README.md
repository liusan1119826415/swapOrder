# NFT Market - Decentralized NFT Marketplace

## 🎯 Project Overview

This is a comprehensive decentralized NFT marketplace built with a three-layer architecture:
- **On-chain Order Book**: Smart contracts for trustless trading
- **Off-chain API & Sync**: Backend services for data aggregation and real-time updates  
- **Modern Frontend**: Next.js application with seamless Web3 integration

## 📚 Documentation

### Getting Started
- **[Project Overview](./PROJECT_OVERVIEW.md)** - Architecture, features, and technical details (English)
- **[项目概述](./PROJECT_OVERVIEW_CN.md)** - 架构、功能和技术详情（中文）
- **[Quick Start & Deployment](./QUICKSTART_DEPLOYMENT.md)** - Step-by-step deployment guide (English)
- **[快速开始与部署](./QUICKSTART_DEPLOYMENT_CN.md)** - 逐步部署指南（中文）
- **[Documentation Index](./DOCUMENTATION_INDEX.md)** - Complete documentation navigation

### Development Resources
- [Business Logic Flow](./BUSINESS_LOGIC_FLOW.md) - System workflows
- [Development Tasks](./DEVELOPMENT_TASKS.md) - Implementation checklist
- [Integration Summary](./INTEGRATION_SUMMARY.md) - Module integration details

## 🏗️ Project Structure

```
ProjectBreakdown-NFTMarket/
├── EasySwapBackend/          # Go backend API service
├── EasySwapBase/             # Common base library  
├── EasySwapSync/             # Blockchain event sync service
├── EasySwapContract/         # Smart contracts
├── nft-market-next/          # Next.js frontend application
└── Documentation
```

## ✨ Key Features

### For Users
- 🎨 **Mint NFTs** - Create NFTs with customizable metadata
- 🛒 **Buy/Sell NFTs** - Trade through fixed-price listings or auctions
- 💼 **Portfolio Management** - Track owned NFTs, listings, and bids
- 🔍 **Collections Discovery** - Explore trending collections and floor prices
- 📊 **Activity Tracking** - View real-time market activities
- ⭐ **Favorites** - Bookmark preferred NFTs and collections

### For Developers
- 🔌 **RESTful APIs** - Well-documented endpoints
- ⚡ **Real-time Sync** - Event-driven architecture
- 🔗 **Multi-chain Support** - Easy to add new blockchains
- 🧱 **Modular Design** - Clean separation of concerns
- 🛡️ **Type Safety** - Complete TypeScript coverage

## 🚀 Quick Start

### Prerequisites
- Go 1.21+, MySQL 8.0+, Redis 6.0+
- Node.js 18+, pnpm 8+
- Docker (optional, for database setup)

### Backend Setup
```bash
cd EasySwapBackend
go mod download
cp config/config.toml.example config/config.toml
# Edit config.toml
cd src && go run main.go
```

### Sync Service Setup
```bash
cd EasySwapSync
go mod download
cp config/config.toml.example config/config.toml
# Edit config.toml
go run main.go daemon
```

### Frontend Setup
```bash
cd nft-market-next
pnpm install
cp .env.local.example .env.local
# Edit .env.local
pnpm dev
```

For detailed instructions, see [Quick Start & Deployment Guide](./QUICKSTART_DEPLOYMENT.md)

## 🌐 Supported Blockchains

- ✅ **Ethereum** (Mainnet & Sepolia testnet)
- ✅ **Polygon**
- 🔜 **Arbitrum** (Coming Soon)
- 🔜 **Optimism** (Coming Soon)
- 🔜 **Cross-chain Bridge** (Coming Soon)

## 📊 System Architecture

```
User Interface (Next.js)
        ↓
   REST API / WebSocket
        ↓
Backend Services (Go + MySQL + Redis)
        ↓
   Event Synchronization
        ↓
Smart Contracts (Solidity on EVM chains)
```

## 🛠️ Technology Stack

**Backend**: Go, Gin, MySQL, Redis  
**Frontend**: Next.js 14, TypeScript, Tailwind CSS, Wagmi, RainbowKit  
**Smart Contracts**: Solidity, Hardhat, ERC721A  
**Infrastructure**: Docker, Infura/Alchemy RPC  

## 📝 License

MIT License - See LICENSE file for details

## 🔗 Links

- **GitHub**: https://github.com/ProjectsTask
- **Demo**: http://47.115.60.212:8901/
- **Documentation**: See links above

---

## 🌍 Live Demo

> Try it out: **http://47.115.60.212:8901/**
>
> Currently deployed on Ethereum Sepolia testnet. Cross-chain support (Polygon, Arbitrum, Optimism) and cross-chain bridge functionality are planned for future releases.

---

**Last Updated**: April 2026