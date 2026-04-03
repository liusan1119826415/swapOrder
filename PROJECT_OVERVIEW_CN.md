# NFT Market - 项目概述

## 📖 引言

本项目是一个面向 NFT 市场的去中心化交易基础设施，旨在通过"链上订单簿 + 链下 API 与同步"的三层架构，提供稳定、可扩展且高性能的 NFT 交易体验。项目覆盖从智能合约的订单簿与资金托管、到后端 API 服务的数据聚合与对外接口、再到前端应用的交互与钱包集成，形成完整的端到端解决方案。

### 核心价值主张

- **数字资产交易**：支持挂单、出价、撮合、取消与修改订单，覆盖固定价格与限量 NFT 的交易场景
- **收藏夹管理**：围绕集合维度提供排名、地板价、成交量等指标，便于收藏与投资决策
- **订单簿系统**：基于链上订单簿的去中心化 DEX 模式，保障交易透明与抗篡改
- **实时数据同步**：通过区块链事件同步服务，将链上活动实时落库并供 API 查询
- **多链支持**：通过配置化链参数，适配不同链的 RPC 与合约地址，具备良好的扩展性
- **钱包与前端集成**：前端采用 Next.js 与 RainbowKit/Wagmi，提供便捷的钱包连接与交互

---

## 🏗️ 项目架构

项目采用多仓库协作的组织方式，分为五个主要部分：

### 1. EasySwapBackend - 后端 API 服务
**技术栈**: Go, Gin Framework, MySQL, Redis

**职责**:
- 为前端提供 RESTful API 接口
- 业务逻辑编排和数据聚合
- 用户认证与授权
- 数据缓存和性能优化
- 活动追踪和分析

**目录结构**:
```
EasySwapBackend/
├── src/
│   ├── api/v1/          # API 处理函数
│   ├── service/v1/      # 业务逻辑层
│   ├── types/v1/        # 数据类型定义
│   ├── dao/             # 数据访问层
│   └── models/          # 数据库模型
├── config/              # 配置文件
└── logs/                # 应用日志
```

### 2. EasySwapBase - 通用基础库
**技术栈**: Go, Ethereum (go-ethereum)

**职责**:
- 链客户端抽象
- 工具函数和辅助功能
- 订单管理工具
- 数据访问公共组件
- 日志和错误处理

**目录结构**:
```
EasySwapBase/
├── chain/               # 链客户端和服务
├── evm/                 # EVM 工具（ERC721、ERC1155）
├── kit/                 # 工具包
├── logger/              # 日志基础设施
├── ordermanager/        # 订单管理逻辑
├── stores/              # 存储抽象（GORM、KV）
└── xhttp/               # HTTP 客户端工具
```

### 3. EasySwapSync - 区块链事件同步服务
**技术栈**: Go, Ethereum, MySQL

**职责**:
- 监听链上合约事件
- 解析和解码事件日志
- 将事件同步到数据库
- NFT 元数据索引
- 合集和物品数据更新

**目录结构**:
```
EasySwapSync/
├── service/
│   ├── nftindexer/      # NFT 元数据索引器
│   ├── orderbookindexer/# 订单簿事件索引器
│   └── comm/            # 公共工具
├── model/               # 数据模型
├── db/migrations/       # 数据库迁移脚本
└── config/              # 服务配置
```

### 4. EasySwapContract - 智能合约
**技术栈**: Solidity, Hardhat

**职责**:
- 订单簿合约实现
- 资产托管金库合约
- 订单存储和验证
- 协议管理和升级

**目录结构**:
```
EasySwapContract/
├── contracts/
│   ├── EasySwapOrderBook.sol  # 核心订单簿逻辑
│   ├── EasySwapVault.sol      # 资产托管金库
│   ├── OrderStorage.sol       # 订单数据存储
│   ├── OrderValidator.sol     # 订单验证逻辑
│   └── ProtocolManager.sol    # 协议管理
├── scripts/             # 部署脚本
├── test/                # 合约测试
└── artifacts/           # 编译产物
```

### 5. nft-market-next - 前端应用
**技术栈**: Next.js 14, TypeScript, Tailwind CSS, Wagmi, RainbowKit

**职责**:
- 用户界面和交互
- 钱包连接和 Web3 集成
- NFT 浏览和发现
- 投资组合管理
- 交易界面

**目录结构**:
```
nft-market-next/
├── src/app/             # 页面路由
├── lib/
│   ├── api/            # API 客户端
│   ├── hooks/          # React hooks 和 wagmi hooks
│   └── contracts/      # 合约 ABI
├── components/          # UI 组件
├── types/               # TypeScript 类型
└── config/              # 应用配置
```

---

## 🔑 核心功能

### 用户功能
- **铸造 NFT**: 创建具有自定义元数据的新 NFT
- **买卖 NFT**: 通过固定价格挂单或拍卖交易 NFT
- **投资管理**: 跟踪拥有的 NFT、挂单和出价
- **合集发现**: 探索热门合集和地板价
- **活动追踪**: 查看实时市场活动和历史记录
- **收藏夹**: 书签首选的 NFT 和合集

### 开发者功能
- **RESTful APIs**: 完善的 API 端点文档
- **事件驱动架构**: 实时数据同步
- **多链支持**: 易于添加新的区块链网络
- **模块化设计**: 清晰的关注点分离
- **类型安全**: 完整的 TypeScript 类型定义

---

## 💎 技术亮点

### 智能合约系统
- **Gas 优化**: 使用 ERC721A 的高效存储模式
- **安全性**: 经过审计的合约模式和访问控制
- **可升级性**: 代理模式支持未来升级
- **事件发射**: 全面的事件日志用于链下追踪

### 后端架构
- **分层设计**: API、服务和 DAO 层之间清晰分离
- **缓存策略**: Redis 集成用于频繁访问的数据
- **数据库设计**: 优化的模式和适当的索引
- **错误处理**: 集中化的错误管理和日志记录

### 前端体验
- **现代 UX**: 使用 Tailwind CSS 的响应式设计
- **Web3 集成**: 通过 RainbowKit 无缝钱包连接
- **状态管理**: React Query 用于高效数据获取
- **类型安全**: 完整的 TypeScript 覆盖

---

## 📊 数据流

### 创建订单（出售 NFT）
```
用户 → 前端 → 钱包签名 → 合约事件 → 同步服务 → 数据库 → API → 前端
```

### 购买 NFT
```
用户 → 前端 → 匹配订单交易 → 合约执行 → 金库转账 → 事件发射 → 同步 → 数据库更新 → API 响应
```

### 查看投资组合
```
前端请求 → API → 数据库查询 + 链上数据 → 聚合 → 响应 → UI 显示
```

---

## 🚀 快速链接

- [快速开始指南](./QUICK_START.md) - 开始开发
- [业务逻辑流程](./BUSINESS_LOGIC_FLOW.md) - 理解系统工作流
- [开发任务清单](./DEVELOPMENT_TASKS.md) - 功能实现检查列表
- [集成总结](./INTEGRATION_SUMMARY.md) - 模块集成详情

---

## 🌐 支持的区块链

目前支持 EVM 兼容链：
- **Ethereum**（主网，Sepolia 测试网）
- **Polygon**
- **Arbitrum**
- **Optimism**

链配置通过每个服务中的 `config.toml` 文件管理。

---

## 📝 许可证

本项目是开源的，根据 MIT 许可证提供。

---

**最后更新**: 2026 年 4 月
