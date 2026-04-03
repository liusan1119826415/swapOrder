# NFT 市场系统 - 开发任务清单与实现指南

## 📊 当前系统状态分析

### ✅ 已完成的功能

#### 前端 (Next.js)
- ✅ Mint Page - NFT 铸造页面 (`/mint`)
- ✅ Portfolio Page - 投资组合页面 (`/portfolio`) - UI 完成，使用模拟数据
- ✅ 智能合约 Hooks:
  - ✅ `useMintNFT` - 铸造 NFT
  - ✅ `useMakeOrder` - 创建订单（含 `useCreateListing`, `useMakeBid`）
  - ✅ `useCancelOrder` - 取消订单（含 `useCancelListing`）
  - ✅ `useMatchOrder` - 匹配订单（含 `useBuyNFT`）
  - ✅ `useEditOrder` - 编辑订单（含 `useEditOrderPrice`）
- ✅ API Client - HTTP 客户端和错误处理
- ✅ 类型定义 - 完整的 TypeScript 类型系统

#### 后端 (Go)
- ✅ Portfolio API - 用户资产查询
  - ✅ `/api/v1/portfolio/collections` - 用户拥有的合集
  - ✅ `/api/v1/portfolio/items` - 用户拥有的 NFT
  - ✅ `/api/v1/portfolio/listings` - 用户的挂单
  - ✅ `/api/v1/portfolio/bids` - 用户的出价
- ✅ Collections API - 合集信息
- ✅ Activity API - 活动历史
- ✅ Analytics API - 数据统计

#### 智能合约 (Solidity)
- ✅ EasySwapOrderBook - 订单簿核心合约
- ✅ EasySwapVault - 资产托管金库
- ✅ OrderStorage - 订单存储
- ✅ OrderValidator - 订单验证

---

### ❌ 待完成的功能

#### 🔴 高优先级（核心交易流程）

##### 1. 后端订单操作 API ⚠️ **关键缺失**
- ❌ **POST /api/v1/order/make** - 创建订单（List/Bid）
- ❌ **POST /api/v1/order/cancel** - 取消订单
- ❌ **POST /api/v1/order/edit** - 编辑订单
- ❌ **POST /api/v1/order/match** - 匹配订单（购买/接受出价）
- ❌ **GET /api/v1/order/listings** - 市场挂单列表（用于 Explore）
- ❌ **GET /api/v1/order/bids** - 市场出价列表

##### 2. 前端功能集成
- ⚠️ **Portfolio 页面真实数据集成** - UI 完成，需用真实 API 替换模拟数据
- ⚠️ **List for Sale 完整流程** - Hook 存在，需集成授权 + 创建订单
- ⚠️ **Cancel Listing 功能** - Hook 存在，需集成后端 API
- ⚠️ **Edit Price 功能** - Hook 存在，需集成后端 API
- ❌ **Explore/Collections 页面** - 完全未实现
- ❌ **Buy Now 功能** - Hook 存在，需集成后端 API
- ❌ **Place Bid 功能** - Hook 存在，需集成后端 API

##### 3. 合约配置
- ⚠️ **部署合约到 Sepolia** - 需要实际部署并更新地址
- ⚠️ **配置合约地址** - 更新 `nft-market-next/lib/contracts/addresses.ts`

---

## 🎯 开发路线图

### Phase 1: 后端订单操作 API（1-2 天）

#### Task 1.1: 创建订单 API
```go
// POST /api/v1/order/make
type MakeOrderRequest struct {
    ChainID         int64   `json:"chain_id"`
    UserAddress     string  `json:"user_address"`
    Side            uint8   `json:"side"` // 1=List, 2=Bid
    SaleKind        uint8   `json:"sale_kind"`
    CollectionAddr  string  `json:"collection_addr"`
    TokenID         string  `json:"token_id"`
    Price           string  `json:"price"` // wei为单位
    Expiry          int64   `json:"expiry"` // 时间戳
    Salt            uint64  `json:"salt"`
}

type MakeOrderResponse struct {
    OrderKey    string  `json:"order_key"`
    TxHash      string  `json:"tx_hash"`
    Status      string  `json:"status"`
}
```

**实现步骤**:
1. 在 `EasySwapBackend/src/service/v1/order.go` 添加 `MakeOrder` 函数
2. 调用智能合约 `makeOrders()` 方法
3. 监听 `LogMake` 事件并写入数据库
4. 推送到 Redis 队列供 OrderManager 处理

---

#### Task 1.2: 取消订单 API
```go
// POST /api/v1/order/cancel
type CancelOrderRequest struct {
    ChainID     int64   `json:"chain_id"`
    UserAddress string  `json:"user_address"`
    OrderKeys   []string `json:"order_keys"`
}
```

**实现步骤**:
1. 调用智能合约 `cancelOrders()` 方法
2. 监听 `LogCancel` 事件
3. 更新数据库中订单状态为 `cancelled`
4. 触发 floorPrice 更新

---

#### Task 1.3: 编辑订单 API
```go
// POST /api/v1/order/edit
type EditOrderRequest struct {
    ChainID     int64   `json:"chain_id"`
    UserAddress string  `json:"user_address"`
    OldOrderKey string  `json:"old_order_key"`
    NewPrice    string  `json:"new_price"`
    NewExpiry   int64   `json:"new_expiry,omitempty"`
}
```

**实现步骤**:
1. 调用智能合约 `editOrders()` 方法
2. 监听新的 `LogMake` 事件
3. 更新订单价格/过期时间

---

#### Task 1.4: 匹配订单 API
```go
// POST /api/v1/order/match
type MatchOrderRequest struct {
    ChainID     int64   `json:"chain_id"`
    UserAddress string  `json:"user_address"`
    SellOrder   Order   `json:"sell_order"`
    BuyOrder    Order   `json:"buy_order"`
}
```

**实现步骤**:
1. 调用智能合约 `matchOrder()` 或 `matchOrders()` 方法
2. 监听 `LogMatch` 事件
3. 更新订单状态为 `filled`
4. 插入 activities 记录

---

### Phase 2: 前端功能集成（2-3 天）

#### Task 2.1: Portfolio 页面真实数据集成
**文件**: `nft-market-next/src/app/portfolio/page.tsx`

```typescript
// 替换模拟数据为真实 API 调用
const { address } = useAccount();

// 获取用户拥有的 NFT
const { data: ownedItems, isLoading } = useUserItems({
  userAddresses: [address],
  chainId: CHAIN_ID,
});

// 获取用户的挂单
const { data: listings } = useUserListings({
  userAddresses: [address],
  chainId: CHAIN_ID,
});

// 获取用户的出价
const { data: bids } = useUserBids({
  userAddresses: [address],
  chainId: CHAIN_ID,
});
```

---

#### Task 2.2: List for Sale 完整流程
**文件**: `nft-market-next/components/ui/TradingModal.tsx`

```typescript
const handleListForSale = async () => {
  try {
    // 1. 检查授权
    const isApproved = await checkNFTApproval(
      collectionAddress, 
      tokenId, 
      ORDERBOOK_ADDRESS
    );
    
    if (!isApproved) {
      // 2. 发起授权交易
      await approveNFT(collectionAddress, ORDERBOOK_ADDRESS);
      // 等待授权确认
    }
    
    // 3. 创建订单
    const txHash = await createListing(
      collectionAddress,
      tokenId,
      parseEther(price).toString(),
      7 * 24 // 7 天
    );
    
    // 4. 等待后端索引
    await waitForIndexing(txHash);
    
    // 5. 刷新页面
    router.refresh();
  } catch (error) {
    console.error('List failed:', error);
  }
};
```

---

#### Task 2.3: Cancel Listing 功能
```typescript
const handleCancel = async (orderKey: string) => {
  try {
    // 调用后端 API
    const response = await fetch('/api/v1/order/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chain_id: CHAIN_ID,
        user_address: address,
        order_keys: [orderKey],
      }),
    });
    
    const result = await response.json();
    
    // 等待交易确认
    await waitForTransaction(result.tx_hash);
    
    // 刷新列表
    mutate();
  } catch (error) {
    console.error('Cancel failed:', error);
  }
};
```

---

#### Task 2.4: Edit Price 功能
```typescript
const handleEditPrice = async (orderKey: string, newPrice: string) => {
  try {
    const response = await fetch('/api/v1/order/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chain_id: CHAIN_ID,
        user_address: address,
        old_order_key: orderKey,
        new_price: parseEther(newPrice).toString(),
      }),
    });
    
    const result = await response.json();
    await waitForTransaction(result.tx_hash);
    mutate();
  } catch (error) {
    console.error('Edit failed:', error);
  }
};
```

---

#### Task 2.5: Explore/Collections 页面
**新建文件**: `nft-market-next/src/app/explore/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useCollectionsRanking } from '@/lib/hooks';

export default function ExplorePage() {
  const [filters, setFilters] = useState({
    sortBy: 'volume',
    timeRange: '24h',
  });
  
  const { data: collections, isLoading } = useCollectionsRanking(filters);
  
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-headline font-bold mb-8">
          Explore NFTs
        </h1>
        
        {/* Filters */}
        <div className="flex gap-4 mb-8">
          <select onChange={(e) => setFilters({...filters, sortBy: e.target.value})}>
            <option value="volume">Volume</option>
            <option value="floor_price">Floor Price</option>
          </select>
        </div>
        
        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections?.map((collection) => (
            <CollectionCard key={collection.address} {...collection} />
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
```

---

#### Task 2.6: Buy Now 功能
```typescript
const handleBuyNow = async (listing: Listing) => {
  try {
    // 构造买单
    const buyOrder = {
      side: OrderSide.Bid,
      saleKind: SaleKind.FixedPriceForItem,
      maker: address,
      nft: {
        tokenId: listing.tokenId,
        collection: listing.collectionAddress,
        amount: 1,
      },
      price: listing.price, // 匹配卖价
      expiry: Math.floor(Date.now()/1000) + 3600,
    };
    
    // 调用匹配
    const txHash = await matchOrders([{
      sellOrder: listing,
      buyOrder: buyOrder,
    }], {
      value: listing.price, // 支付 ETH
    });
    
    await waitForTransaction(txHash);
    router.push('/portfolio');
  } catch (error) {
    console.error('Buy failed:', error);
  }
};
```

---

### Phase 3: 合约部署与配置（0.5 天）

#### Task 3.1: 部署合约到 Sepolia
```bash
cd EasySwapContract
npx hardhat run scripts/deploy.js --network sepolia
```

**输出示例**:
```
OrderBook deployed to: 0x1234567890123456789012345678901234567890
Vault deployed to: 0x0987654321098765432109876543210987654321
```

---

#### Task 3.2: 更新合约地址配置
**文件**: `nft-market-next/lib/contracts/addresses.ts`

```typescript
const contractsConfig: ContractsConfig = {
  // Sepolia
  11155111: {
    orderBook: '0x1234567890123456789012345678901234567890',
    vault: '0x0987654321098765432109876543210987654321',
  },
  // ... other chains
};
```

---

## 📝 实现顺序建议

### 第 1 步：后端订单 API（必须先完成）
1. ✅ `GET /listings` - 市场挂单列表（Explore 页面需要）
2. ✅ `POST /make` - 创建订单
3. ✅ `POST /cancel` - 取消订单
4. ✅ `POST /edit` - 编辑订单
5. ✅ `POST /match` - 匹配订单

### 第 2 步：部署合约并配置
1. ✅ 部署到 Sepolia
2. ✅ 更新前端合约地址

### 第 3 步：前端功能集成
1. ✅ Portfolio 真实数据
2. ✅ List for Sale
3. ✅ Cancel/Edit
4. ✅ Explore 页面
5. ✅ Buy Now
6. ✅ Place Bid

---

## 🔧 技术要点

### 1. 后端如何调用智能合约？
使用 `ethers.js` 或 `web3.js`:
```go
import (
    "github.com/ethereum/go-ethereum/common"
    "github.com/ethereum/go-ethereum/ethclient"
)

func MakeOrder(ctx context.Context, params ...) error {
    client, _ := ethclient.Dial(rpcURL)
    contract, _ := abi.New(contractABI, client)
    
    tx, err := contract.Transact(opts, "makeOrders", orders)
    if err != nil {
        return err
    }
    
    // 等待回执
    receipt, _ := bind.WaitMined(ctx, client, tx)
    
    // 解析事件
    events, _ := ParseOrderBookLogs(receipt)
    
    // 写入数据库
    saveToDB(events)
    
    return nil
}
```

### 2. 如何监听合约事件？
```go
func WatchLogMakeEvents(ctx context.Context) {
    query := ethereum.FilterQuery{
        Addresses: []common.Address{orderBookAddr},
        Topics: [][]common.Hash{
            {LogMakeTopic},
        },
    }
    
    logs := make(chan types.Log)
    sub, _ := client.SubscribeFilterLogs(ctx, query, logs)
    
    for {
        select {
        case vLog := <-logs:
            event, _ := ParseLogMake(vLog)
            saveToDB(event)
            pushToRedis(event)
        }
    }
}
```

### 3. 前端如何处理授权？
```typescript
async function checkAndApprove(collectionAddress: string, tokenId: string) {
  const contract = getERC721Contract(collectionAddress);
  
  // 检查是否已授权
  const approved = await contract.getApproved(tokenId);
  const operator = await contract.isApprovedForAll(owner, orderBookAddress);
  
  if (approved !== orderBookAddress && !operator) {
    // 发起授权
    const tx = await contract.setApprovalForAll(orderBookAddress, true);
    await tx.wait();
  }
}
```

---

## ✅ 验收标准

### 后端 API
- [ ] 所有 API 通过 Postman 测试
- [ ] 数据库正确写入订单数据
- [ ] Redis 队列正常工作
- [ ] OrderManager 正确处理过期订单

### 前端功能
- [ ] Portfolio 显示真实数据
- [ ] 可以成功 List NFT
- [ ] 可以成功 Cancel Listing
- [ ] 可以成功 Edit Price
- [ ] Explore 页面显示市场数据
- [ ] 可以成功 Buy Now
- [ ] 可以成功 Place Bid

### 用户体验
- [ ] Loading 状态正确显示
- [ ] Error 消息友好提示
- [ ] Transaction 进度可视化
- [ ] 成功后自动刷新数据

---

## 🚀 快速启动检查清单

```bash
# 1. 后端服务
cd EasySwapBackend
go run main.go

# 2. 同步服务
cd EasySwapSync
go run main.go

# 3. 前端
cd nft-market-next
npm run dev

# 4. 检查合约部署
# 访问 https://sepolia.etherscan.io/address/<合约地址>
```

---

## 📞 需要帮助时

遇到问题时的调试步骤：
1. 检查浏览器控制台错误
2. 查看后端日志
3. 检查 Etherscan 交易状态
4. 验证合约地址配置
5. 确认 RPC 节点连接正常

祝你开发顺利！🎉
