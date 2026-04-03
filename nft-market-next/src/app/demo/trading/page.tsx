'use client';

import { useState } from 'react';
import TradingModal from '@/components/ui/TradingModal';
import PriceInput from '@/components/ui/PriceInput';
import OrderSummary from '@/components/ui/OrderSummary';
import { useTradingModal } from '@/lib/hooks';
import { ShoppingCart, Tag, Heart, X } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

// ============================================================================
// 演示页面：展示所有交易组件
// ============================================================================

export default function TradingDemoPage() {
  const [activeDemo, setActiveDemo] = useState<'card' | 'price' | 'summary' | 'modal'>('card');

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-4xl font-headline font-bold mb-2 gradient-text">
            Trading Components Demo
          </h1>
          <p className="text-slate-400">
            交易组件演示 - 展示如何使用 PriceInput、OrderSummary、TradingModal 组件
          </p>
        </div>

        {/* 演示选择器 */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-4">
          {[
            { id: 'card', label: 'NFT Card 示例' },
            { id: 'price', label: 'PriceInput 组件' },
            { id: 'summary', label: 'OrderSummary 组件' },
            { id: 'modal', label: 'TradingModal 演示' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveDemo(tab.id as any)}
              className={`
                px-6 py-3 rounded-xl font-headline font-bold whitespace-nowrap transition-all
                ${activeDemo === tab.id 
                  ? 'bg-primary text-on-primary shadow-lg shadow-primary/20' 
                  : 'bg-surface-container-low text-slate-400 hover:bg-surface-container-high'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 演示内容区域 */}
        <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/10">
          {activeDemo === 'card' && <NFTCardDemo />}
          {activeDemo === 'price' && <PriceInputDemo />}
          {activeDemo === 'summary' && <OrderSummaryDemo />}
          {activeDemo === 'modal' && <TradingModalDemo />}
        </div>

        {/* 代码提示 */}
        <div className="mt-8 p-6 bg-surface-container-low rounded-2xl border border-outline-variant/10">
          <h3 className="font-headline font-bold text-lg mb-4">💡 使用提示</h3>
          <div className="text-sm text-slate-400 space-y-2">
            <p>• 这些组件使用了 Neon Vault 设计系统的颜色变量</p>
            <p>• 所有组件都是响应式的，支持移动端</p>
            <p>• 组件集成到真实页面时需要提供正确的 chainId 和合约地址</p>
            <p>• 查看源代码：<code className="text-primary">examples/trading-components-example.tsx</code></p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// ============================================================================
// Demo 1: NFT Card with Trading
// ============================================================================

function NFTCardDemo() {
  const { 
    modalState, 
    openListingModal, 
    openBidModal, 
    openBuyModal, 
    closeModal 
  } = useTradingModal();

  const chainId = 11155111; // Sepolia testnet

  const mockNFTs = [
    {
      id: '1',
      name: 'Ether Drift #402',
      price: '0.0001',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
      collectionAddress: '0xbD82f9fdB3C78c276007bAa0396Cb3A3E48Eb2fF',
      tokenId: '1',
    },
    {
      id: '2',
      name: 'Neon Vision #089',
      price: '1.8',
      image: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&h=400&fit=crop',
      collectionAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
      tokenId: '89',
    },
  ];

  return (
    <>
      <h2 className="font-headline font-bold text-2xl mb-6">NFT 卡片示例</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockNFTs.map((nft) => (
          <div key={nft.id} className="bg-surface-container rounded-3xl overflow-hidden border border-outline-variant/10">
            {/* 图片 */}
            <div className="relative aspect-square">
              <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
            </div>

            {/* 操作按钮 */}
            <div className="p-5 space-y-4">
              <h3 className="font-headline font-bold text-lg">{nft.name}</h3>
              <p className="text-secondary font-bold">{nft.price} ETH</p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => openBuyModal(nft.collectionAddress, nft.tokenId, nft.price)}
                  className="flex items-center justify-center gap-2 bg-primary text-on-primary py-3 rounded-xl font-headline font-bold hover:opacity-90 transition-opacity"
                >
                  <ShoppingCart className="w-5 h-5" />
                  Buy Now
                </button>

                <button
                  onClick={() => openBidModal(nft.collectionAddress, nft.tokenId)}
                  className="flex items-center justify-center gap-2 bg-surface-variant/40 border border-secondary/30 text-secondary py-3 rounded-xl font-headline font-bold hover:bg-secondary/10 transition-colors"
                >
                  <Tag className="w-5 h-5" />
                  Make Offer
                </button>
              </div>

              <button
                onClick={() => openListingModal(nft.collectionAddress, nft.tokenId)}
                className="w-full flex items-center justify-center gap-2 bg-surface-container-high text-on-surface py-3 rounded-xl font-headline font-bold hover:bg-surface-bright transition-colors"
              >
                List for Sale
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Trading Modal */}
      <TradingModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        collectionAddress={modalState.collectionAddress}
        tokenId={modalState.tokenId}
        price={modalState.price}
        onClose={closeModal}
        chainId={chainId}
      />
    </>
  );
}

// ============================================================================
// Demo 2: PriceInput Component
// ============================================================================

function PriceInputDemo() {
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'ETH' | 'WETH'>('ETH');

  return (
    <>
      <h2 className="font-headline font-bold text-2xl mb-6">PriceInput 组件演示</h2>
      <div className="max-w-md space-y-8">
        {/* 基础价格输入 */}
        <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/10">
          <h3 className="font-headline font-bold text-lg mb-4">基础价格输入</h3>
          <PriceInput
            value={price}
            onChange={setPrice}
            label="价格"
            placeholder="0.00"
            currency={currency}
            onCurrencyChange={setCurrency}
          />
        </div>

        {/* 带余额显示 */}
        <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/10">
          <h3 className="font-headline font-bold text-lg mb-4">显示余额</h3>
          <PriceInput
            value={price}
            onChange={setPrice}
            label="出价金额"
            placeholder="0.00"
            currency={currency}
            onCurrencyChange={setCurrency}
            showBalance
            balance="12.42"
          />
        </div>

        {/* 带错误状态 */}
        <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/10">
          <h3 className="font-headline font-bold text-lg mb-4">错误状态</h3>
          <PriceInput
            value={price}
            onChange={setPrice}
            label="价格"
            placeholder="0.00"
            error="价格必须大于 0.001 ETH"
          />
        </div>

        {/* 禁用状态 */}
        <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/10">
          <h3 className="font-headline font-bold text-lg mb-4">禁用状态</h3>
          <PriceInput
            value="1.5"
            onChange={() => {}}
            label="价格"
            disabled
          />
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Demo 3: OrderSummary Component
// ============================================================================

function OrderSummaryDemo() {
  return (
    <>
      <h2 className="font-headline font-bold text-2xl mb-6">OrderSummary 组件演示</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Listing Summary */}
        <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/10">
          <h3 className="font-headline font-bold text-lg mb-4">上架摘要 (Listing)</h3>
          <OrderSummary
            type="listing"
            price="2.5"
            currency="ETH"
            duration={168}
            collectionName="Bored Ape Yacht Club"
            tokenId="1234"
            imageUrl="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop"
          />
        </div>

        {/* Bid Summary */}
        <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/10">
          <h3 className="font-headline font-bold text-lg mb-4">出价摘要 (Bid)</h3>
          <OrderSummary
            type="bid"
            price="1.8"
            currency="ETH"
            duration={72}
            collectionName="CryptoPunks"
            tokenId="7804"
            imageUrl="https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=200&h=200&fit=crop"
          />
        </div>

        {/* Buy Summary */}
        <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/10">
          <h3 className="font-headline font-bold text-lg mb-4">购买摘要 (Buy)</h3>
          <OrderSummary
            type="buy"
            price="3.2"
            currency="ETH"
            collectionName="Azuki"
            tokenId="5678"
            imageUrl="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop"
          />
        </div>

        {/* Edit Summary */}
        <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/10">
          <h3 className="font-headline font-bold text-lg mb-4">编辑摘要 (Edit)</h3>
          <OrderSummary
            type="edit"
            price="5.0"
            currency="ETH"
            duration={24}
            collectionName="Doodles"
            tokenId="9012"
            imageUrl="https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=200&h=200&fit=crop"
          />
        </div>
      </div>
    </>
  );
}

// ============================================================================
// Demo 4: TradingModal Demo
// ============================================================================

function TradingModalDemo() {
  const { modalState, openListingModal, openBidModal, openBuyModal, closeModal } = useTradingModal();
  const chainId = 11155111; // Sepolia testnet

  return (
    <>
      <h2 className="font-headline font-bold text-2xl mb-6">TradingModal 演示</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* List Modal */}
        <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/10 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 mx-auto mb-4 flex items-center justify-center">
            <Tag className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-headline font-bold text-lg mb-2">上架模式</h3>
          <p className="text-sm text-slate-400 mb-4">
            创建一个 NFT 上架列表，设置价格和持续时间
          </p>
          <button
            onClick={() => openListingModal('0x1234...5678', '123')}
            className="w-full bg-primary text-on-primary py-3 rounded-xl font-headline font-bold hover:opacity-90 transition-opacity"
          >
            打开上架弹窗
          </button>
        </div>

        {/* Bid Modal */}
        <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/10 text-center">
          <div className="w-16 h-16 rounded-full bg-secondary/10 mx-auto mb-4 flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-secondary" />
          </div>
          <h3 className="font-headline font-bold text-lg mb-2">出价模式</h3>
          <p className="text-sm text-slate-400 mb-4">
            对 NFT 进行出价（Make Offer）
          </p>
          <button
            onClick={() => openBidModal('0x1234...5678', '456', '1.5')}
            className="w-full bg-secondary text-on-secondary py-3 rounded-xl font-headline font-bold hover:opacity-90 transition-opacity"
          >
            打开出价弹窗
          </button>
        </div>

        {/* Buy Modal */}
        <div className="p-6 bg-surface-container rounded-2xl border border-outline-variant/10 text-center">
          <div className="w-16 h-16 rounded-full bg-surface-container-high mx-auto mb-4 flex items-center justify-center">
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <h3 className="font-headline font-bold text-lg mb-2">购买模式</h3>
          <p className="text-sm text-slate-400 mb-4">
            直接购买 NFT（需要先获取订单信息）
          </p>
          <button
            onClick={() => openBuyModal('0x1234...5678', '789', '2.0')}
            className="w-full bg-surface-container-high text-on-surface py-3 rounded-xl font-headline font-bold hover:bg-surface-bright transition-colors"
          >
            打开购买弹窗
          </button>
        </div>
      </div>

      {/* 说明 */}
      <div className="mt-8 p-6 bg-surface-container rounded-2xl border border-outline-variant/10">
        <h3 className="font-headline font-bold text-lg mb-4">📝 使用说明</h3>
        <div className="text-sm text-slate-400 space-y-2">
          <p>1. 点击上方任意按钮打开对应的交易弹窗</p>
          <p>2. 在弹窗中输入价格和选择持续时间</p>
          <p>3. 点击确认后会模拟交易流程</p>
          <p>4. 实际集成时需要连接钱包和配置正确的 chainId</p>
        </div>
      </div>

      {/* Trading Modal */}
      <TradingModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        collectionAddress={modalState.collectionAddress}
        tokenId={modalState.tokenId}
        price={modalState.price}
        onClose={closeModal}
        chainId={chainId}
      />
    </>
  );
}
