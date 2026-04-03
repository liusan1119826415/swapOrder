# NFT 市场系统 - 完整业务逻辑流程图

## 🎯 核心业务流

### 流程 1: NFT 铸造 → 上架出售（创作者路径）

```
┌─────────────────────────────────────────────────────────────┐
│ 第 1 步：铸造 NFT (Mint Page)                                │
│ 位置：/mint                                                  │
│ 文件：nft-market-next/src/app/mint/page.tsx                 │
├─────────────────────────────────────────────────────────────┤
│ 1.1 用户上传作品图片                                         │
│    └─> 调用 uploadFileToIPFS()                              │
│    └─> 返回 imageIpfsUrl                                    │
│                                                              │
│ 1.2 创建 NFT 元数据                                          │
│    └─> name, description, image, attributes                 │
│    └─> 调用 uploadMetadataToIPFS()                          │
│    └─> 返回 metadataIpfsUrl                                 │
│                                                              │
│ 1.3 调用智能合约铸造                                         │
│    └─> useMintNFT.mintNFT()                                 │
│    └─> 调用 ERC721 合约的 mint() 函数                        │
│    └─> 支付 Gas 费                                           │
│    └─> 等待区块链确认                                        │
│    └─> NFT 所有权归属：recipientAddress                     │
│                                                              │
│ 1.4 铸造成功后                                               │
│    └─> 显示成功页面 ✅                                       │
│    └─> 跳转到 /portfolio                                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 第 2 步：查看投资组合 (Portfolio Page)                       │
│ 位置：/portfolio                                             │
│ 功能：展示用户所有的 NFT                                      │
├─────────────────────────────────────────────────────────────┤
│ 2.1 获取用户 NFT 列表                                         │
│    └─> 调用后端 API：GET /api/v1/portfolio                  │
│    └─> 或查询链上数据：balanceOf(userAddress)               │
│    └─> 显示：Owned / Created / Listings / Bids              │
│                                                              │
│ 2.2 找到刚铸造的 NFT                                         │
│    └─> 显示缩略图、名称、稀有度等                            │
│    └─> 操作按钮："List for Sale"                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 第 3 步：授权 NFT 给订单簿合约                               │
│ 目的：允许订单簿合约管理你的 NFT（用于挂单）                 │
├─────────────────────────────────────────────────────────────┤
│ 3.1 检查授权状态                                             │
│    └─> getApproved(tokenId)                                  │
│    └─> isApprovedForAll(operator)                           │
│                                                              │
│ 3.2 如果未授权，发起授权交易                                 │
│    └─> approve(orderBookAddress, tokenId)                   │
│    └─> 或 setApprovalForAll(orderBookAddress, true)         │
│    └─> 等待确认                                              │
│    └─> ✅ 授权成功                                            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 第 4 步：创建卖单 (List for Sale)                            │
│ 文件：lib/hooks/useMakeOrder.ts                              │
├─────────────────────────────────────────────────────────────┤
│ 4.1 用户设置价格                                             │
│    └─> 输入：0.5 ETH                                        │
│    └─> 选择有效期：7 天                                      │
│                                                              │
│ 4.2 调用 useCreateListing()                                  │
│    └─> collectionAddress: NFT 合约地址                       │
│    └─> tokenId: NFT ID                                       │
│    └─> priceInWei: 价格 (转换为 wei)                         │
│    └─> expiry: 过期时间戳                                    │
│                                                              │
│ 4.3 智能合约执行 makeOrders()                                │
│    ├─> 验证订单参数                                          │
│    ├─> 调用 Vault.depositNFT()                               │
│    │   └─> NFT 从用户钱包 → 金库合约                         │
│    ├─> OrderStorage._addOrder()                             │
│    │   └─> 订单写入链上存储                                  │
│    └─> 发送 LogMake 事件                                     │
│                                                              │
│ 4.4 后端监听事件                                             │
│    └─> EasySwapSync 服务监听 LogMake                         │
│    └─> 解析订单信息                                          │
│    └─> 写入数据库 orders 表                                   │
│    └─> 推送到 Redis 队列：cache:es:orders:{chain}            │
│                                                              │
│ 4.5 OrderManager 处理                                        │
│    ├─> ListenNewListingLoop() 监听 Redis                     │
│    ├─> 更新 collection 的 floorPrice                          │
│    ├─> 添加到时间轮（过期管理）                              │
│    └─> 更新 listedCount 统计                                  │
│                                                              │
│ 4.6 前端刷新                                                 │
│    └─> 调用 GET /api/v1/orders/listings                     │
│    └─> 显示在 Portfolio -> Listings 标签                    │
│    └─> ✅ NFT 上架成功                                         │
└─────────────────────────────────────────────────────────────┘
```

---

### 流程 2: 购买 NFT（买家路径）

```
┌─────────────────────────────────────────────────────────────┐
│ 第 1 步：浏览市场 (Explore/Collections)                      │
│ 位置：/explore, /collections/[address]                       │
├─────────────────────────────────────────────────────────────┤
│ 1.1 查看可购买的 NFT                                         │
│    └─> 调用 GET /api/v1/orders/listings                     │
│    └─> 筛选：collection, priceRange, sortBy                 │
│    └─> 显示：图片、价格、剩余时间                           │
│                                                              │
│ 1.2 点击 NFT 查看详情                                        │
│    └─> /collections/[address]/[tokenId]                     │
│    └─> 显示详细信息、历史交易、属性等                        │
│    └─> 操作按钮："Buy Now" / "Place Bid"                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 第 2 步：立即购买 (Buy Now)                                  │
│ 文件：lib/hooks/useMatchOrder.ts                             │
├─────────────────────────────────────────────────────────────┤
│ 2.1 用户点击 "Buy Now"                                       │
│    └─> 弹出确认窗口                                          │
│    └─> 显示价格 breakdown:                                  │
│        - NFT 价格：0.5 ETH                                   │
│        - Gas 费：~0.01 ETH                                   │
│        - 总计：~0.51 ETH                                     │
│                                                              │
│ 2.2 调用 useBuyNFT()                                         │
│    └─> sellOrder: 卖单信息（从 API 获取）                     │
│    └─> buyOrder: 构造买单                                    │
│        - side: Bid                                           │
│        - price: 卖单价格                                     │
│        - maker: 用户地址                                     │
│        - expiry: 未来时间                                    │
│                                                              │
│ 2.3 智能合约执行 matchOrder()                                │
│    ├─> 验证买卖订单匹配                                      │
│    ├─> 调用 Vault.withdrawETH()                              │
│    │   └─> ETH 从金库 → 卖家（扣除手续费）                   │
│    ├─> 调用 Vault.withdrawNFT()                              │
│    │   └─> NFT 从金库 → 买家                                 │
│    ├─> 计算协议手续费：protocolFee = price * share           │
│    ├─> 更新 filledAmount                                     │
│    └─> 发送 LogMatch 事件                                    │
│                                                              │
│ 2.4 后端处理                                                 │
│    └─> 监听 LogMatch 事件                                    │
│    └─> 更新 orders 表状态：filled                            │
│    └─> 插入 activities 记录（交易历史）                       │
│    └─> 触发 floorPrice 更新                                   │
│                                                              │
│ 2.5 前端刷新                                                 │
│    └─> 调用 GET /api/v1/portfolio                           │
│    └─> 显示新获得的 NFT                                      │
│    └─> ✅ 购买成功                                            │
└─────────────────────────────────────────────────────────────┘
```

---

### 流程 3: 出价竞拍（Bid 路径）

```
┌─────────────────────────────────────────────────────────────┐
│ 第 1 步：放置出价 (Place Bid)                                │
├─────────────────────────────────────────────────────────────┤
│ 1.1 用户输入出价金额                                         │
│    └─> 例如：0.3 ETH（低于售价）                            │
│                                                              │
│ 1.2 调用 useMakeBid()                                        │
│    └─> side: Bid                                            │
│    └─> collectionAddress, tokenId                           │
│    └─> price: 0.3 ETH                                       │
│    └─> expiry: 7 天后                                        │
│                                                              │
│ 1.3 智能合约执行 makeOrders()                                │
│    ├─> 验证订单参数                                          │
│    ├─> 调用 Vault.depositETH()                               │
│    │   └─> ETH 从用户 → 金库（锁定）                         │
│    ├─> OrderStorage._addOrder()                             │
│    └─> 发送 LogMake 事件                                     │
│                                                              │
│ 1.4 订单状态                                                 │
│    └─> 显示在 Portfolio -> Bids 标签                         │
│    └─> 可操作：Cancel / Edit                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 第 2 步：卖家接受出价（自动匹配）                            │
├─────────────────────────────────────────────────────────────┤
│ 2.1 卖家点击 "Accept Offer"                                  │
│                                                              │
│ 2.2 调用 useMatchOrder()                                     │
│    └─> sellOrder: 构造卖单                                  │
│    └─> buyOrder: 用户的买单                                  │
│                                                              │
│ 2.3 合约执行 matchOrder()                                    │
│    └─> ETH 从金库 → 卖家                                     │
│    └─> NFT 从卖家 → 金库 → 买家                              │
│    └─> 扣除 protocolFee                                      │
│    └─> ✅ 交易完成                                            │
└─────────────────────────────────────────────────────────────┘
```

---

### 流程 4: 管理订单（取消/编辑）

```
┌─────────────────────────────────────────────────────────────┐
│ 取消订单 (Cancel)                                            │
├─────────────────────────────────────────────────────────────┤
│ 1. 用户在 Portfolio -> Listings 点击 "Cancel"                │
│                                                              │
│ 2. 调用 useCancelListing()                                   │
│    └─> orderKey: 订单唯一标识                               │
│                                                              │
│ 3. 合约执行 cancelOrders()                                   │
│    ├─> 验证 maker == msg.sender                             │
│    ├─> OrderStorage._removeOrder()                          │
│    ├─> Vault.withdrawNFT()                                   │
│    │   └─> NFT 从金库 → 用户钱包                             │
│    └─> 发送 LogCancel 事件                                   │
│                                                              │
│ 4. 后端更新                                                  │
│    └─> orders 表状态：cancelled                              │
│    └─> 触发 floorPrice 更新                                   │
│                                                              │
│ 5. 前端刷新                                                  │
│    └─> NFT 从 Listings 移除                                   │
│    └─> 回到 Owned 列表                                       │
│    └─> ✅ 取消成功                                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ 编辑订单 (Edit)                                              │
├─────────────────────────────────────────────────────────────┤
│ 1. 用户点击 "Edit Price"                                     │
│    └─> 输入新价格：0.6 ETH                                  │
│                                                              │
│ 2. 调用 useEditOrderPrice()                                  │
│    └─> oldOrderKey: 原订单                                  │
│    └─> newOrder: { price: 新价格 }                          │
│                                                              │
│ 3. 合约执行 editOrders()                                     │
│    ├─> 取消旧订单                                            │
│    ├─> 创建新订单                                            │
│    ├─> NFT 在金库中保持不变                                   │
│    └─> 发送 LogMake 事件                                     │
│                                                              │
│ 4. 后端更新                                                  │
│    └─> 更新 orders 表价格字段                                 │
│    └─> 触发 floorPrice 更新                                   │
│                                                              │
│ 5. 前端刷新                                                  │
│    └─> 显示新价格                                            │
│    └─> ✅ 编辑成功                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ 系统架构分层

### **Layer 1: 前端应用层 (Next.js)**

```
nft-market-next/
├── src/app/              # 页面路由
│   ├── mint/            # 铸造页面 ✅
│   ├── portfolio/       # 投资组合
│   ├── explore/         # 探索市场
│   └── collections/     # 集合详情
│
├── lib/hooks/           # 智能合约交互 hooks
│   ├── useMintNFT.ts    # 铸造 hook ✅
│   ├── useMakeOrder.ts  # 创建订单
│   ├── useCancelOrder.ts # 取消订单
│   ├── useMatchOrder.ts # 匹配订单
│   └── useEditOrder.ts  # 编辑订单
│
├── lib/api/             # 后端 API 客户端
│   └── client.ts
│
└── components/          # UI 组件
    └── ui/
        └── TradingModal.tsx  # 交易弹窗
```

---

### **Layer 2: 智能合约层 (Solidity)**

```
EasySwapContract/contracts/
├── EasySwapOrderBook.sol    # 订单簿核心合约
│   ├── makeOrders()         # 创建订单
│   ├── cancelOrders()       # 取消订单
│   ├── editOrders()         # 编辑订单
│   └── matchOrders()        # 匹配订单
│
├── EasySwapVault.sol        # 资产托管金库
│   ├── depositNFT()         # 存入 NFT
│   ├── withdrawNFT()        # 提取 NFT
│   ├── depositETH()         # 存入 ETH
│   └── withdrawETH()        # 提取 ETH
│
├── OrderStorage.sol         # 订单存储
│   └── _addOrder/_removeOrder()
│
└── OrderValidator.sol       # 订单验证
    └── _validateOrder()
```

---

### **Layer 3: 后端服务层 (Go)**

```
EasySwapBackend/             # API 服务
├── src/api/v1/
│   ├── order_handler.go     # 订单 API
│   ├── portfolio_handler.go # 投资组合 API
│   └── activity_handler.go  # 活动历史 API
│
└── src/service/
    └── order_service.go     # 订单业务逻辑
```

```
EasySwapSync/                # 链上同步服务
├── service/orderbookindexer/
│   └── indexer.go           # 事件监听索引
│
└── ordermanager/            # 订单管理器
    ├── service.go           # 订单生命周期管理
    ├── ListenNewListingLoop()  # 监听新订单
    ├── orderExpiryProcess()    # 过期处理
    ├── floorPriceProcess()     # 地板价更新
    └── listCountProcess()      # 挂单数量统计
```

---

### **Layer 4: 数据存储层**

```
数据库 (MySQL/PostgreSQL):
├── orders 表              # 订单数据
│   ├── order_id
│   ├── collection_address
│   ├── token_id
│   ├── maker
│   ├── price
│   ├── status (active/filled/cancelled/expired)
│   └── expire_in
│
├── activities 表          # 活动历史
│   ├── activity_type (1:Buy, 2:Mint, 3:List...)
│   ├── maker, taker
│   ├── price
│   └── tx_hash
│
└── collections 表         # 合集信息
    ├── floor_price
    ├── listed_count
    └── volume_24h
```

```
Redis 缓存:
└── cache:es:orders:{chain}  # 订单队列（过期管理）
```

---

## 🔄 关键数据流

### 1. **铸造流程数据流**

```
用户钱包
  ↓ (上传图片)
IPFS (Pinata)
  ↓ (返回 IPFS hash)
前端构建 metadata
  ↓ (上传 metadata)
IPFS (返回 metadata URI)
  ↓ (调用合约 mint())
ERC721 合约
  ↓ (铸造事件)
后端索引器
  ↓ (写入数据库)
orders 表
  ↓ (API 查询)
前端展示
```

---

### 2. **挂单流程数据流**

```
用户发起 List
  ↓ (授权 NFT)
订单簿合约获得权限
  ↓ (调用 makeOrders)
EasySwapOrderBook
  ↓ (depositNFT)
Vault 合约持有 NFT
  ↓ (LogMake 事件)
EasySwapSync 监听
  ↓ (写入数据库)
orders 表 (status=active)
  ↓ (推送到 Redis)
cache:es:orders:{chain}
  ↓ (OrderManager 消费)
更新 floorPrice/listedCount
  ↓ (时间轮调度)
监控过期时间
  ↓ (到期触发)
更新 status=expired + 退回 NFT
```

---

### 3. **购买流程数据流**

```
买家点击 Buy Now
  ↓ (构造 buyOrder)
matchOrder(sellOrder, buyOrder)
  ↓ (验证匹配)
OrderValidator
  ↓ (withdrawETH from Vault)
ETH → 卖家账户（扣手续费）
  ↓ (withdrawNFT from Vault)
NFT → 买家账户
  ↓ (LogMatch 事件)
EasySwapSync 监听
  ↓ (更新数据库)
orders 表 (status=filled)
  ↓ (插入 activities)
交易历史记录
  ↓ (触发更新)
floorPrice recalculated
  ↓ (前端刷新)
Portfolio 显示新 NFT
```

---

## 📊 订单状态机

```
[Created] 
    ↓ (资产存入 Vault)
[Active] ←──────┐
    ↓ (被匹配)   │ (编辑价格)
[PartiallyFilled] ←─┘
    ↓ (完全成交)
[Filled] 
    ↓ (取消)
[Cancelled] → 资产退回
    ↓ (过期)
[Expired] → 资产退回
```

---

## 🎯 下一步开发建议

根据你当前的进度（已完成 Mint 页面），建议按以下顺序开发：

### **Phase 1: 基础功能** ⭐
1. **Portfolio 页面** - 查看用户 NFT
   - 展示 Owned / Created / Listings / Bids
   - 集成查看器显示 IPFS 图片
   
2. **List for Sale 功能** - 上架 NFT
   - 授权流程（approve NFT）
   - 创建订单（useCreateListing）
   - 显示在 Listings 标签

3. **Explore/Collections 页面** - 浏览市场
   - 展示所有可购买的 NFT
   - 筛选和排序功能

---

### **Phase 2: 交易功能** 💰
4. **Buy Now 功能** - 立即购买
   - 调用 useBuyNFT
   - 显示交易确认弹窗
   
5. **Place Bid 功能** - 出价竞拍
   - 调用 useMakeBid
   - 显示在 Bids 标签

6. **订单管理** - 取消/编辑
   - Cancel Listing
   - Edit Price

---

### **Phase 3: 数据展示** 📈
7. **Activity Feed** - 活动动态
   - 展示最近交易
   - 个人历史记录

8. **Collection Stats** - 合集统计
   - Floor Price
   - Volume
   - Listed Count

---

### **Phase 4: 高级功能** 🚀
9. **批量操作** - Bulk listing/bidding
10. **数据分析** - Price chart, rarity tools
11. **社交功能** - Favorites, follows, notifications

---

## 🔧 你需要掌握的核心概念

### 1. **订单簿模型 (Order Book)**
- **List (Sell Order)**: 卖 NFT，换取 ETH
- **Bid (Buy Order)**: 出 ETH，买 NFT
- **Maker**: 创建订单的人
- **Taker**: 接受订单的人

### 2. **资产托管 (Vault)**
- 挂单时：NFT/ETH 锁定在金库合约
- 成交时：自动交换资产
- 取消时：资产退回用户

### 3. **订单撮合 (Matching)**
- 价格优先：高买低卖优先成交
- 时间优先：同价格先挂单优先
- 自动执行：无需第三方介入

### 4. **去中心化特性**
- 无需许可：任何人都可挂单/购买
- 抗审查：无法阻止合法交易
- 透明可查：所有订单链上可见

---

## 💡 实际开发示例

### 示例 1: 实现 List for Sale 按钮

```typescript
// 在 Portfolio 页面找到 NFT
const nft = myNFTs[0];

// 点击 "List for Sale"
const handleList = async () => {
  // 1. 检查授权
  const isApproved = await checkNFTApproval(nft.contract, nft.tokenId);
  if (!isApproved) {
    await approveNFT(nft.contract, ORDERBOOK_ADDRESS);
  }
  
  // 2. 创建订单
  await createListing(
    nft.contract,      // 合集地址
    nft.tokenId,       // Token ID
    parseEther('0.5'), // 价格 0.5 ETH
    7 * 24 * 3600      // 7 天过期
  );
  
  // 3. 等待确认
  // 4. 刷新列表
};
```

---

### 示例 2: 实现 Buy Now 按钮

```typescript
// 在 Explore 页面找到 NFT
const listing = availableNFTs[0];

// 点击 "Buy Now"
const handleBuy = async () => {
  // 1. 获取卖单信息
  const sellOrder = await fetchOrder(listing.orderId);
  
  // 2. 构造买单
  const buyOrder = {
    side: OrderSide.Bid,
    price: sellOrder.price, // 匹配卖价
    maker: userAddress,
    expiry: Math.floor(Date.now()/1000) + 3600, // 1 小时有效
  };
  
  // 3. 调用匹配
  await matchOrders([{ sellOrder, buyOrder }], {
    value: sellOrder.price, // 支付 ETH
  });
  
  // 4. NFT 到账!
};
```

---

## 📝 总结

你现在完成了**第一步：铸造 NFT**，接下来需要：

1. **Portfolio 页面** → 查看和管理 NFT
2. **List for Sale** → 上架出售（核心盈利点）
3. **Explore 市场** → 浏览和购买
4. **Buy Now/Bid** → 交易功能
5. **Activity** → 历史记录

这是一个完整的去中心化 NFT 市场，每个环节都至关重要。建议循序渐进，先完成基础功能，再逐步添加高级特性。

有任何问题随时问我！🚀
