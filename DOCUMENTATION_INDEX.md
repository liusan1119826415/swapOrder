# NFT Market Documentation Index

Welcome to the NFT Market project documentation. This index provides quick access to all documentation resources.

---

## 📚 Core Documentation

### Project Overview
- **[English Version](./PROJECT_OVERVIEW.md)** - Complete project architecture, features, and technical details
- **[中文版](./PROJECT_OVERVIEW_CN.md)** - 完整的项目架构、功能和技术详情

### Quick Start & Deployment
- **[English Version](./QUICKSTART_DEPLOYMENT.md)** - Step-by-step deployment guide for all components
- **[中文版](./QUICKSTART_DEPLOYMENT_CN.md)** - 所有组件的逐步部署指南

---

## 🚀 Getting Started

### For Developers New to the Project

1. **Start Here**: Read the [Project Overview](./PROJECT_OVERVIEW.md) to understand the architecture
2. **Setup Environment**: Follow the [Quick Start Guide](./QUICKSTART_DEPLOYMENT.md) 
3. **Run Services**: Deploy backend, sync service, and frontend
4. **Explore Features**: Test the application at http://localhost:3000

### Quick Reference

#### Backend (EasySwapBackend)
```bash
cd EasySwapBackend
go mod download
cp config/config.toml.example config/config.toml
# Edit config.toml with your settings
cd src
go run main.go
```

#### Sync Service (EasySwapSync)
```bash
cd EasySwapSync
go mod download
cp config/config.toml.example config/config.toml
# Edit config.toml with your settings
go run main.go daemon
```

#### Frontend (nft-market-next)
```bash
cd nft-market-next
pnpm install
cp .env.local.example .env.local
# Edit .env.local with your settings
pnpm dev
```

---

## 📖 Additional Documentation

### Development Guides
- [Business Logic Flow](./BUSINESS_LOGIC_FLOW.md) - System workflows and data flows
- [Development Tasks](./DEVELOPMENT_TASKS.md) - Feature implementation checklist
- [Integration Summary](./INTEGRATION_SUMMARY.md) - Module integration details

### Component Documentation
- [Backend README](./EasySwapBackend/README.md) - Backend-specific documentation
- [Sync Service README](./EasySwapSync/README.md) - Sync service documentation
- [Frontend README](./nft-market-next/README.md) - Frontend documentation
- [Contract README](./EasySwapContract/README.md) - Smart contract documentation

---

## 🔧 Deployment Checklists

### Development Environment
- [ ] MySQL and Redis running
- [ ] Backend configured and started
- [ ] Sync service configured and started
- [ ] Frontend configured and running
- [ ] Test contracts deployed (optional)

### Production Environment
- [ ] Database optimized with indexes
- [ ] Backend deployed with systemd/Docker
- [ ] Sync service running as daemon
- [ ] Frontend built and deployed (Vercel/Nginx)
- [ ] SSL certificates configured
- [ ] Monitoring tools configured
- [ ] Backups configured
- [ ] Production contracts deployed

---

## 🌐 Supported Blockchains

| Chain | Network | Chain ID | Status |
|-------|---------|----------|--------|
| Ethereum | Mainnet | 1 | ✅ Supported |
| Ethereum | Sepolia | 11155111 | ✅ Supported |
| Polygon | Mainnet | 137 | ✅ Supported |
| Arbitrum | Mainnet | 42161 | 🔜 Coming Soon |
| Optimism | Mainnet | 10 | 🔜 Coming Soon |

---

## 📊 System Architecture

```
┌─────────────────┐
│   Frontend      │  Next.js + Wagmi
│  (nft-market)   │  RainbowKit + Tailwind
└────────┬────────┘
         │ REST API / WebSocket
┌────────▼────────┐
│   Backend       │  Go + Gin
│ (EasySwapBackend)│  MySQL + Redis
└────────┬────────┘
         │ Event Synchronization
┌────────▼────────┐
│  Sync Service   │  Go + Ethereum
│ (EasySwapSync)  │  Event Indexing
└────────┬────────┘
         │ Listen Events
┌────────▼────────┐
│ Smart Contracts │  Solidity
│(OrderBook+Vault)│  EVM Compatible
└─────────────────┘
```

---

## 🎯 Key Features

### User Features
- ✅ Mint NFTs
- ✅ Buy/Sell NFTs (Fixed Price)
- ✅ Create/Edit/Cancel Listings
- ✅ Portfolio Management
- ✅ Collections Discovery
- ✅ Activity Tracking
- ✅ Favorites System

### Developer Features
- ✅ RESTful APIs
- ✅ Real-time Event Sync
- ✅ Multi-chain Support
- ✅ Comprehensive Type Definitions
- ✅ Modular Architecture

### Coming Soon
- 🔜 Auction System
- 🔜 Advanced Analytics
- 🔜 Creator Royalties
- 🔜 Cross-chain Trading
- 🔜 Mobile Application

---

## 🛠️ Technology Stack

### Backend
- **Language**: Go 1.21+
- **Framework**: Gin
- **Database**: MySQL 8.0+
- **Cache**: Redis 6.0+
- **Blockchain**: go-ethereum (web3.go)

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Web3**: Wagmi + RainbowKit
- **State**: React Query

### Smart Contracts
- **Language**: Solidity
- **Framework**: Hardhat
- **Testing**: Mocha + Chai
- **Standards**: ERC721A, ERC1155

---

## 📞 Support

### Documentation Issues
If you find any issues with the documentation or need clarification:
- Open an issue on GitHub
- Check existing documentation
- Ask in community channels

### Technical Support
- **Bug Reports**: GitHub Issues
- **Feature Requests**: GitHub Discussions
- **General Questions**: Discord/Telegram

---

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for more details.

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🙏 Acknowledgments

Built with:
- [OpenZeppelin Contracts](https://openzeppelin.com/contracts/)
- [ERC721A](https://github.com/chiru-labs/ERC721A)
- [Next.js](https://nextjs.org/)
- [Wagmi](https://wagmi.sh/)
- [RainbowKit](https://www.rainbowkit.com/)

---

**Last Updated**: April 2026

**Version**: 1.0.0

---

## 🔗 Quick Links

- [GitHub Repository](https://github.com/ProjectsTask)
- [Live Demo](#) (Coming Soon)
- [API Documentation](#) (In Development)
- [Community Discord](#) (Coming Soon)
