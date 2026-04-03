# IPFS 上传配置指南

## 📋 目录
- [Pinata 简介](#pinata-简介)
- [获取 Pinata 凭证](#获取-pinata-凭证)
- [配置环境变量](#配置环境变量)
- [使用示例](#使用示例)
- [其他 IPFS 服务商](#其他-ipfs-服务商)

---

## 🎯 Pinata 简介

**Pinata** 是最流行的 NFT IPFS 存储服务商，提供：
- ✅ 简单的 API 接口
- ✅ 可靠的数据持久性
- ✅ 快速的网关访问
- ✅ 免费和付费计划
- ✅ 开发者友好的工具

### 为什么选择 Pinata？
- OpenSea、Rarible 等主流市场都支持 Pinata 的 IPFS 链接
- 提供专门针对 NFT 的元数据标准支持
- 优秀的开发者文档和社区支持

---

## 🔑 获取 Pinata 凭证

### 步骤 1: 注册账户
1. 访问 [https://pinata.cloud](https://pinata.cloud)
2. 点击 "Get Started" 或 "Sign Up"
3. 使用邮箱注册（推荐使用 Google 或 GitHub 快捷登录）

### 步骤 2: 创建 API Key
1. 登录后进入 [Dashboard](https://app.pinata.cloud/dashboard)
2. 点击左侧菜单 **Settings** → **API Keys**
3. 点击 **"Create an API Key"** 按钮

### 步骤 3: 配置 API Key 权限
建议创建两个不同权限的 Key：

#### **上传专用 Key**（推荐）
- **Name**: `NFT Upload Key`
- **Permissions**: 
  - ✅ `pinFileToIPFS` (上传图片)
  - ✅ `pinJSONToIPFS` (上传元数据)
  - ❌ 其他权限不需要

#### **读取专用 Key**（可选）
- **Name**: `NFT Read Key`
- **Permissions**:
  - ✅ `pinList` (查看已上传文件)

### 步骤 4: 复制凭证
创建成功后，你会看到：
- **API Key** (例如：`a1b2c3d4e5f6g7h8i9j0`)
- **Secret API Key** (例如：`x9y8z7w6v5u4t3s2r1q0`)

⚠️ **重要**: Secret Key 只显示一次，请立即保存！

---

## ⚙️ 配置环境变量

### 方法 1: 使用 JWT（推荐）

JWT 更安全且性能更好。

1. 在 API Keys 页面，找到你创建的 Key
2. 点击 **"Generate Token"** 或使用在线工具生成 JWT
3. 或者使用我们的工具函数生成（见下文）

在 `.env.local` 文件中添加：
```bash
NEXT_PUBLIC_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 方法 2: 使用 API Key + Secret Key

这是传统方法，也完全可用。

在 `.env.local` 文件中添加：
```bash
NEXT_PUBLIC_PINATA_API_KEY=a1b2c3d4e5f6g7h8i9j0
NEXT_PUBLIC_PINATA_SECRET_KEY=x9y8z7w6v5u4t3s2r1q0
```

### 完整示例

创建或编辑 `nft-market-next/.env.local` 文件：

```bash
# 方式 A: 使用 JWT（推荐）
NEXT_PUBLIC_PINATA_JWT=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJhYmNkZWYxMi0zNDU2LTc4OTAtYWJjZC1lZjEyMzQ1Njc4OTAiLCJlbWFpbCI6InlvdXJA ZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWRlbnRpZmllciI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZGVudGlmaWVyIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZX0sImV4cGlyYXRpb25Qb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkZW50aWZpZXIiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWRlbnRpZmllciI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJpc0RlZGFkaWFuIjpmYWxzZX0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c

# 方式 B: 使用 API Key + Secret Key
# NEXT_PUBLIC_PINATA_API_KEY=a1b2c3d4e5f6g7h8i9j0
# NEXT_PUBLIC_PINATA_SECRET_KEY=x9y8z7w6v5u4t3s2r1q0

# 可选：自定义 IPFS 网关
# NEXT_PUBLIC_IPFS_GATEWAY=https://ipfs.io
```

---

## 💻 使用示例

### 基本用法

```typescript
import { uploadFileToIPFS, uploadMetadataToIPFS } from '@/lib/ipfs';

// 1. 上传图片
const imageFile = document.querySelector('input[type="file"]').files[0];
const imageIpfsUrl = await uploadFileToIPFS(imageFile);
console.log('Image IPFS URL:', imageIpfsUrl); // ipfs://QmHash...

// 2. 创建并上传元数据
const metadata = {
  name: 'My NFT',
  description: 'A unique digital collectible',
  image: imageIpfsUrl,
  attributes: [
    { trait_type: 'Background', value: 'Blue' },
    { trait_type: 'Rarity', value: 'Rare' }
  ]
};

const metadataIpfsUrl = await uploadMetadataToIPFS(metadata);
console.log('Metadata IPFS URL:', metadataIpfsUrl); // ipfs://QmHash...
```

### 在 Mint 页面中的完整实现

参见 [`src/app/mint/page.tsx`](../src/app/mint/page.tsx#L80-L117)：

```typescript
const uploadToIPFS = async (): Promise<string> => {
  if (!imageFile) throw new Error('No image file to upload');

  try {
    // Step 1: 上传图片
    const imageIpfsUrl = await uploadFileToIPFS(imageFile);
    
    // Step 2: 创建元数据
    const metadata = {
      name: name,
      description: description,
      image: imageIpfsUrl,
      attributes: [],
      external_url: window.location.origin,
    };
    
    // Step 3: 上传元数据
    const metadataIpfsUrl = await uploadMetadataToIPFS(metadata);
    
    return metadataIpfsUrl; // 这就是传给合约的 URI
  } catch (error) {
    throw new Error('Failed to upload to IPFS');
  }
};
```

### 将 IPFS URL 转换为 HTTP 用于显示

```typescript
import { ipfsToHttpUrl } from '@/lib/ipfs';

const ipfsUrl = 'ipfs://QmHash...';
const httpUrl = ipfsToHttpUrl(ipfsUrl);
// 结果：https://gateway.pinata.cloud/ipfs/QmHash...

// 在 <img> 标签中使用
<img src={httpUrl} alt="NFT Image" />
```

---

## 🔧 高级功能

### 生成 JWT Token（后端实现）

如果你想在后端动态生成 JWT：

```typescript
import { getPinataJWT } from '@/lib/ipfs';

const apiKey = process.env.NEXT_PUBLIC_PINATA_API_KEY!;
const secretKey = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY!;

const jwt = await getPinataJWT(apiKey, secretKey);
console.log('Generated JWT:', jwt);
```

⚠️ **安全提示**: 这应该在服务器端完成，不要在前端暴露 API Key 和 Secret Key！

### 自定义属性

NFT 元数据支持自定义属性（traits）：

```typescript
const metadata = {
  name: 'Cyber Punk #001',
  description: 'A futuristic warrior',
  image: 'ipfs://QmImageHash...',
  attributes: [
    {
      trait_type: 'Background',
      value: 'Neon City'
    },
    {
      trait_type: 'Skin',
      value: 'Cybernetic',
      display_type: 'string'
    },
    {
      trait_type: 'Level',
      value: 42,
      display_type: 'number'
    },
    {
      trait_type: 'Power',
      value: 95,
      max_value: 100
    }
  ],
  external_url: 'https://yourmarketplace.com/nft/1',
  animation_url: 'ipfs://QmAnimationHash...' // 如果是视频/动画
};
```

---

## 🌐 其他 IPFS 服务商

除了 Pinata，你还可以使用：

### 1. **Web3.Storage** (已停止新用户注册)
- 免费但已停止服务
- 不推荐新项目使用

### 2. **Fleek**
- 网址：[https://fleek.co](https://fleek.co)
- 优点：集成简单，提供免费套餐
- API 类似 Pinata

### 3. **Infura IPFS**
- 网址：[https://infura.io/product/ipfs](https://infura.io/product/ipfs)
- 优点：Infura 生态系统的一部分
- 适合已经使用 Infura RPC 的项目

### 4. **自建 IPFS 节点**
- 最去中心化但技术门槛高
- 需要运行 IPFS daemon
- 适合大型项目

---

## 📊 Pinata 免费计划限制

| 特性 | 限制 |
|------|------|
| 每月上传量 | 1 GB |
| 存储总量 | 无限制 |
| 带宽 | 无限制 |
| API 请求 | 无限制 |

💡 **提示**: 对于大多数个人项目和小型 NFT 系列，免费计划已经足够。

---

## 🐛 常见问题

### Q: 上传失败怎么办？
1. 检查网络连接
2. 验证 API 凭证是否正确
3. 查看浏览器控制台的错误信息
4. 确认文件大小不超过限制（建议 < 10MB）

### Q: IPFS URL 能在 OpenSea 显示吗？
可以！OpenSea 完全支持 `ipfs://` 格式的链接。你也可以使用 HTTP 网关链接。

### Q: 如何测试上传是否成功？
1. 上传后，你会收到一个 IPFS Hash（如 `QmHash...`）
2. 访问 `https://gateway.pinata.cloud/ipfs/QmHash...`
3. 如果能正常显示内容，说明上传成功

### Q: 元数据格式有什么要求？
遵循 [OpenSea Metadata Standards](https://docs.opensea.io/docs/metadata-standards)：
- 必须包含 `name`, `description`, `image`
- 可选添加 `attributes`, `external_url` 等

---

## 📚 相关资源

- [Pinata 官方文档](https://docs.pinata.cloud/)
- [IPFS 基础概念](https://docs.ipfs.tech/concepts/what-is-ipfs/)
- [OpenSea 元数据标准](https://docs.opensea.io/docs/metadata-standards)
- [NFT Metadata 最佳实践](https://nftschool.dev/tutorial/end-to-end-nft-dapp/)

---

## ✅ 检查清单

配置完成后，请确认：

- [ ] 已注册 Pinata 账户
- [ ] 已创建 API Key
- [ ] 已将凭证添加到 `.env.local`
- [ ] 已测试图片上传功能
- [ ] 已测试元数据上传功能
- [ ] 上传的文件可以通过网关访问
- [ ] 铸造的 NFT 能正确显示元数据

🎉 恭喜你完成 IPFS 配置！现在你的 NFT 市场已经支持真正的去中心化存储了！
