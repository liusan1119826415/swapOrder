# NFT Market - Project Overview

## 📖 Introduction

This project is a decentralized trading infrastructure for the NFT market, designed to provide a stable, scalable, and high-performance NFT trading experience through a three-layer architecture of "On-chain Order Book + Off-chain API & Synchronization". The project covers everything from smart contracts for order books and fund custody, to backend API services for data aggregation and external interfaces, to frontend application interactions and wallet integration, forming a complete end-to-end solution.

### Core Value Propositions

- **Digital Asset Trading**: Supports listing, bidding, matching, order cancellation and modification, covering fixed-price and limited edition NFT trading scenarios
- **Collection Management**: Provides collection-level metrics such as rankings, floor price, and trading volume for collecting and investment decisions
- **Order Book System**: On-chain order book-based decentralized DEX model ensuring transaction transparency and resistance to tampering
- **Real-time Data Synchronization**: Blockchain event synchronization service that records on-chain activities to the database in real-time for API queries
- **Multi-chain Support**: Configurable chain parameters adapting to different RPC endpoints and contract addresses across multiple chains
- **Wallet & Frontend Integration**: Next.js with RainbowKit/Wagmi for seamless wallet connection and user interaction

---

## 🏗️ Project Architecture

The project uses a multi-repository organization divided into four main components:

### 1. EasySwapBackend - Backend API Service
**Technology Stack**: Go, Gin Framework, MySQL, Redis

**Responsibilities**:
- RESTful API endpoints for frontend consumption
- Business logic orchestration and data aggregation
- User authentication and authorization
- Data caching and performance optimization
- Activity tracking and analytics

**Directory Structure**:
```
EasySwapBackend/
├── src/
│   ├── api/v1/          # API handlers
│   ├── service/v1/      # Business logic layer
│   ├── types/v1/        # Data type definitions
│   ├── dao/             # Data access layer
│   └── models/          # Database models
├── config/              # Configuration files
└── logs/                # Application logs
```

### 2. EasySwapBase - Common Base Library
**Technology Stack**: Go, Ethereum (go-ethereum)

**Responsibilities**:
- Chain client abstraction
- Utility functions and helpers
- Order management utilities
- Data access common components
- Logger and error handling

**Directory Structure**:
```
EasySwapBase/
├── chain/               # Chain clients and services
├── evm/                 # EVM utilities (ERC721, ERC1155)
├── kit/                 # Utility toolkits
├── logger/              # Logging infrastructure
├── ordermanager/        # Order management logic
├── stores/              # Storage abstraction (GORM, KV)
└── xhttp/               # HTTP client utilities
```

### 3. EasySwapSync - Blockchain Event Synchronization
**Technology Stack**: Go, Ethereum, MySQL

**Responsibilities**:
- Listening to on-chain contract events
- Parsing and decoding event logs
- Synchronizing events to database
- NFT metadata indexing
- Collection and item data updates

**Directory Structure**:
```
EasySwapSync/
├── service/
│   ├── nftindexer/      # NFT metadata indexer
│   ├── orderbookindexer/# Order book event indexer
│   └── comm/            # Common utilities
├── model/               # Data models
├── db/migrations/       # Database migration scripts
└── config/              # Service configuration
```

### 4. EasySwapContract - Smart Contracts
**Technology Stack**: Solidity, Hardhat

**Responsibilities**:
- Order book contract implementation
- Vault contract for asset custody
- Order storage and validation
- Protocol management and upgrades

**Directory Structure**:
```
EasySwapContract/
├── contracts/
│   ├── EasySwapOrderBook.sol  # Core order book logic
│   ├── EasySwapVault.sol      # Asset custody vault
│   ├── OrderStorage.sol       # Order data storage
│   ├── OrderValidator.sol     # Order validation logic
│   └── ProtocolManager.sol    # Protocol management
├── scripts/             # Deployment scripts
├── test/                # Contract tests
└── artifacts/           # Compiled artifacts
```

### 5. nft-market-next - Frontend Application
**Technology Stack**: Next.js 14, TypeScript, Tailwind CSS, Wagmi, RainbowKit

**Responsibilities**:
- User interface and interactions
- Wallet connection and Web3 integration
- NFT browsing and discovery
- Portfolio management
- Trading interface

**Directory Structure**:
```
nft-market-next/
├── src/app/             # Page routes
├── lib/
│   ├── api/            # API client
│   ├── hooks/          # React hooks & wagmi hooks
│   └── contracts/      # Contract ABIs
├── components/          # UI components
├── types/               # TypeScript types
└── config/              # App configuration
```

---

## 🔑 Key Features

### For Users
- **Mint NFTs**: Create new NFTs with customizable metadata
- **Buy/Sell NFTs**: Trade NFTs through fixed-price listings or auctions
- **Portfolio Management**: Track owned NFTs, listings, and bids
- **Collections Discovery**: Explore trending collections and floor prices
- **Activity Tracking**: View real-time market activities and history
- **Favorites**: Bookmark preferred NFTs and collections

### For Developers
- **RESTful APIs**: Well-documented API endpoints
- **Event-driven Architecture**: Real-time data synchronization
- **Multi-chain Support**: Easy to add new blockchain networks
- **Modular Design**: Clean separation of concerns
- **Type Safety**: Complete TypeScript type definitions

---

## 💎 Technical Highlights

### Smart Contract System
- **Gas Optimization**: Efficient storage patterns using ERC721A
- **Security**: Audited contract patterns with access control
- **Upgradeability**: Proxy pattern for future upgrades
- **Event Emission**: Comprehensive event logging for off-chain tracking

### Backend Architecture
- **Layered Design**: Clear separation between API, service, and DAO layers
- **Caching Strategy**: Redis integration for frequently accessed data
- **Database Design**: Optimized schema with proper indexing
- **Error Handling**: Centralized error management and logging

### Frontend Experience
- **Modern UX**: Responsive design with Tailwind CSS
- **Web3 Integration**: Seamless wallet connections via RainbowKit
- **State Management**: React Query for efficient data fetching
- **Type Safety**: Full TypeScript coverage

---

## 📊 Data Flow

### Creating an Order (Sell NFT)
```
User → Frontend → Wallet Sign → Contract Event → Sync Service → Database → API → Frontend
```

### Buying an NFT
```
User → Frontend → Match Order Tx → Contract Execution → Vault Transfer → Event Emission → Sync → DB Update → API Response
```

### Viewing Portfolio
```
Frontend Request → API → Database Query + Chain Data → Aggregation → Response → UI Display
```

---

## 🚀 Quick Links

- [Quick Start Guide](./QUICK_START.md) - Get started with development
- [Business Logic Flow](./BUSINESS_LOGIC_FLOW.md) - Understand system workflows
- [Development Tasks](./DEVELOPMENT_TASKS.md) - Feature implementation checklist
- [Integration Summary](./INTEGRATION_SUMMARY.md) - Module integration details

---

## 🌐 Supported Blockchains

Currently supports EVM-compatible chains:
- **Ethereum** (Mainnet, Sepolia testnet)
- **Polygon**
- **Arbitrum**
- **Optimism**

Chain configuration is managed through `config.toml` files in each service.

---

## 📝 License

This project is open-source and available under the MIT License.

---

**Last Updated**: April 2026
