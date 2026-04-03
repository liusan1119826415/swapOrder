# NFT 管理指南 - 铸造成功后做什么

## 📍 目录
- [铸造成功后去哪里查看](#铸造成功后去哪里查看)
- [如何挂单出售 NFT](#如何挂单出售-nft)
- [如何参与拍卖](#如何参与拍卖)
- [管理你的 NFT 资产](#管理你的-nft-资产)

---

## 🎯 铸造成功后去哪里查看

### 方法 1: Portfolio 页面（推荐）

铸造成功后会自动跳转到 **Portfolio** 页面：

```
/mint (铸造成功) → /portfolio (查看我的 NFT)
```

**访问方式**:
1. 直接访问：`http://localhost:3000/portfolio`
2. 点击侧边栏 "Create NFT" 下方的提示按钮

**Portfolio 页面功能**:
- ✅ 查看所有已拥有的 NFT
- ✅ 快速挂单出售
- ✅ 查看挂单状态
- ✅ 查看出价信息
- ✅ 一键跳转到个人资料页

### 方法 2: Profile 页面

查看特定用户的完整资料：

```
/profile/[address]
```

**示例**:
- 自己的资料：`/profile/0xYourAddress...`
- 他人的资料：`/profile/0xTheirAddress...`

**Profile 页面标签页**:
1. **Owned** - 拥有的所有 NFT
2. **Listings** - 正在出售的 NFT
3. **Bids** - 已放置的出价
4. **Created** - 自己创作的 NFT

---

## 💰 如何挂单出售 NFT

### 方式 1: 从 Portfolio 页面快速挂单

**步骤**:

1. **访问 Portfolio**
   ```
   http://localhost:3000/portfolio
   ```

2. **找到要挂单的 NFT**
   - 浏览你拥有的 NFT 列表
   - 未挂单的 NFT 会显示 "List for Sale" 按钮

3. **点击 "List for Sale"**
   - 打开交易弹窗
   - 自动填充 NFT 信息

4. **设置价格**
   ```
   - 输入价格 (ETH)
   - 选择货币类型 (ETH/WETH)
   - 选择挂单时长 (默认 7 天)
   ```

5. **确认交易**
   - 点击 "Create Listing"
   - 钱包弹出确认
   - 等待区块确认

6. **挂单成功**
   - NFT 状态变为 "LISTED"
   - 可以在 "Listings" 标签查看

### 方式 2: 从 NFT 详情页挂单

**步骤**:

1. **访问 NFT 详情页**
   ```
   /collections/{collectionAddress}/{tokenId}
   ```

2. **点击 "List for Sale" 或 "Create Listing"**

3. **填写价格信息**

4. **确认交易**

### 方式 3: 使用 TradingModal 组件

如果你在自己的页面中集成：

```typescript
import { useTradingModal } from '@/lib/hooks';

export default function MyNFTPage() {
  const { modalState, openBidModal, closeModal } = useTradingModal();

  return (
    <>
      <button
        onClick={() => openBidModal(
          collectionAddress,
          tokenId,
          floorPrice // 可选的参考价格
        )}
      >
        List for Sale
      </button>

      <TradingModal
        isOpen={modalState.isOpen}
        mode="listing" // listing | bid | buy
        collectionAddress={modalState.collectionAddress}
        tokenId={modalState.tokenId}
        price={modalState.price}
        onClose={closeModal}
        chainId={11155111}
      />
    </>
  );
}
```

---

## 🔥 如何参与拍卖

### 创建拍卖（作为卖家）

目前合约支持的是**固定价格挂单**和**竞价挂单**。

#### 创建竞价订单（Bid）

1. **访问 NFT 详情页**

2. **点击 "Make Bid"**

3. **输入你的出价**
   ```
   - 价格 (ETH)
   - 有效期（小时）
   ```

4. **支付出价金额**
   - 竞价需要锁定相应的 ETH
   - 钱包确认时会自动计算

5. **等待确认**

#### 接受竞价（作为卖家）

1. **访问 Portfolio → Bids 标签**

2. **查看收到的出价**

3. **点击 "Accept"**

4. **确认交易**
   - NFT 转移给买家
   - ETH 转入你的钱包

---

## 📊 管理你的 NFT 资产

### Portfolio 页面功能详解

#### 1. **Owned 标签**
显示你拥有的所有 NFT

**操作**:
- 点击 NFT 查看详情
- 点击 "List for Sale" 快速挂单
- 查看获取时间和地板价

#### 2. **Listings 标签**
显示你正在出售的 NFT

**信息**:
- 售价（ETH 和 USD）
- 到期时间
- 订单状态

**操作**:
- 取消挂单
- 编辑价格
- 查看浏览历史

#### 3. **Bids 标签**
显示你发出的出价

**信息**:
- 出价金额
- 目标 NFT
- 到期时间

**操作**:
- 取消出价
- 增加出价
- 查看竞争情况

#### 4. **Created 标签**
显示你创作的 NFT

**信息**:
- 铸造时间
- 总供应量
- 销售统计

---

## 🎨 实际使用流程示例

### 场景 1: 铸造后立即出售

```
1. 访问 /mint
2. 上传作品，填写信息
3. 点击 "Mint NFT"
4. 等待铸造成功
5. 点击 "View My NFTs" → 跳转到 Portfolio
6. 找到刚铸造的 NFT
7. 点击 "List for Sale"
8. 设置价格：0.5 ETH
9. 选择时长：7 天
10. 确认交易
11. ✅ NFT 上架出售
```

### 场景 2: 购买后转售

```
1. 访问 /explore 发现 NFT
2. 点击喜欢的 NFT 查看详情
3. 点击 "Buy Now" 购买
4. 等待交易确认
5. NFT 出现在 /portfolio
6. 等待升值后...
7. 访问 Portfolio
8. 找到该 NFT
9. 点击 "List for Sale"
10. 设置更高的价格
11. 确认挂单
12. ✅ 等待售出获利
```

### 场景 3: 参与竞拍战

```
1. 访问 /auctions 查看拍卖
2. 找到感兴趣的拍卖 NFT
3. 点击 "Place Bid"
4. 输入出价：1 ETH
5. 确认交易（锁定 ETH）
6. 等待拍卖结束
7. 如果获胜：
   - NFT 转入钱包
   - 可在 Portfolio 查看
   - 可持有或再次挂单
8. 如果失败：
   - ETH 自动退回
   - 可在 Bids 标签查看退款
```

---

## 🔗 关键页面链接

| 页面 | 路径 | 说明 |
|------|------|------|
| **铸造 NFT** | `/mint` | 创作新 NFT |
| **我的资产** | `/portfolio` | 查看所有 NFT |
| **个人资料** | `/profile/[address]` | 用户主页 |
| **市场探索** | `/explore` | 发现 NFT |
| **拍卖页面** | `/auctions` | 参与竞拍 |
| **活动记录** | `/activity` | 交易历史 |

---

## 💡 小贴士

### 定价策略
- 📊 参考地板价定价
- 🔍 查看同类 NFT 成交价
- ⏰ 考虑市场需求时机

### 挂单技巧
- ⚡ 合理设置挂单时长（7-30 天）
- 💎 优质作品可设置更高价格
- 🎯 使用整数价格更易传播

### 安全提醒
- 🔐 仔细检查合约地址
- ✅ 确认 Gas 费用合理
- ⚠️ 警惕钓鱼网站
- 📝 保留交易记录

---

## 🛠️ 常见问题

### Q: 铸造后为什么看不到我的 NFT？
1. 等待区块确认（通常 15-30 秒）
2. 刷新 Portfolio 页面
3. 检查是否使用了正确的钱包地址
4. 确认链是否正确（Sepolia）

### Q: 如何取消挂单？
1. 访问 Portfolio → Listings
2. 找到要取消的 NFT
3. 点击 "Cancel Listing"
4. 确认交易（需要支付 Gas）

### Q: 挂单后能修改价格吗？
可以！有两种方式：
1. **取消后重新挂单**（推荐）
2. **使用 Edit 功能**（如果合约支持）

### Q: 别人如何看到我的 NFT？
- 在 Portfolio 页面公开显示
- 在市场页面可能被搜索到
- 通过个人资料页访问
- 社交媒体分享链接

### Q: 如何分享我的 NFT？
1. 访问 NFT 详情页
2. 点击分享按钮
3. 复制链接或分享到社交媒体
4. 或直接分享 URL：
   ```
   /collections/0xContractAddress/tokenId
   ```

---

## 📈 进阶功能

### 批量管理
未来将支持：
- 批量挂单
- 批量转移
- 批量授权

### 数据分析
- 销售统计图表
- 价格趋势分析
- 收藏价值评估

### 社交功能
- 关注其他收藏家
- 点赞和评论
- 创建合集展示

---

## 🎉 总结

铸造成功后，你有以下选择：

1. **持有收藏** 
   - 在 Portfolio 中查看
   - 等待升值

2. **立即出售**
   - 点击 "List for Sale"
   - 设置合理价格

3. **参与拍卖**
   - 接受他人出价
   - 主动发起拍卖

4. **展示分享**
   - 更新个人资料
   - 分享到社交媒体

无论选择哪种方式，都可以在 **Portfolio** 和 **Profile** 页面完全掌控你的 NFT 资产！🚀
