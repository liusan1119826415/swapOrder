'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Copy, Share2, BadgeCheck, Zap, ShoppingCart, Tag, ArrowRightLeft } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import ActivityTable from '@/components/ui/ActivityTable';

// 模拟用户数据
const mockUser = {
  address: '0x8f2d...4e9a',
  fullAddress: '0x8f2d3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f',
  username: 'Digital Curator',
  bio: 'Digital Curator & Sovereign Collector since 2021',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
  banner: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&h=400&fit=crop',
  totalWorth: '248.50 ETH',
  walletBalance: '12.42 ETH',
  nftCount: 142,
  isVerified: true,
};

// 模拟 NFT Items
const mockItems = [
  {
    id: '1',
    name: 'Ether Drift #402',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
    collection: 'Rare Collection',
    acquiredAt: '2 days ago',
    floorPrice: '14.5 ETH',
    isFeatured: true,
  },
  {
    id: '2',
    name: 'Neo-Visions #02',
    image: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&h=400&fit=crop',
    collection: 'SynthWave',
    price: '1.25 ETH',
  },
  {
    id: '3',
    name: 'Chrome Flow 0x',
    image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=400&h=400&fit=crop',
    collection: 'Metallics',
    price: '4.80 ETH',
  },
  {
    id: '4',
    name: 'Fragmented Mind',
    image: 'https://images.unsplash.com/photo-1614726365723-49cfae927846?w=400&h=400&fit=crop',
    collection: 'Chaos',
    price: '0.95 ETH',
  },
];

// 模拟活动数据
const mockActivities = [
  {
    id: '1',
    event: 'sale' as const,
    itemName: 'Neon Pulse #88',
    itemImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
    price: '2.45 ETH',
    priceUsd: '$6,420.21',
    from: '0x8f2d...4e9a',
    to: '0x3a12...99c2',
    time: '2h ago',
  },
  {
    id: '2',
    event: 'list' as const,
    itemName: 'Ether Drift #402',
    itemImage: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=100&h=100&fit=crop',
    price: '14.50 ETH',
    priceUsd: '$38,124.50',
    from: '0x8f2d...4e9a',
    time: '5h ago',
  },
  {
    id: '3',
    event: 'transfer' as const,
    itemName: 'Chrome Flow 0x',
    itemImage: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=100&h=100&fit=crop',
    from: 'Vault_Deployer',
    to: '0x8f2d...4e9a',
    time: '1d ago',
  },
];

const tabs = ['Owned', 'Listed', 'Activity', 'Offers'];

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState('Owned');
  const user = mockUser;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-10 py-12">
        {/* Profile Header */}
        <div className="relative mb-16">
          {/* Banner */}
          <div className="h-48 w-full rounded-2xl bg-gradient-to-br from-primary/20 via-surface-container-high to-secondary/10 overflow-hidden relative">
            <div
              className="absolute inset-0 opacity-30 mix-blend-overlay"
              style={{
                backgroundImage: `url('${user.banner}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </div>

          {/* Profile Identity */}
          <div className="flex flex-col md:flex-row items-end gap-8 -mt-16 px-8">
            <div className="relative">
              <Image
                src={user.avatar}
                alt={user.username}
                width={160}
                height={160}
                className="w-40 h-40 rounded-2xl border-4 border-surface shadow-2xl"
              />
              {user.isVerified && (
                <div className="absolute -bottom-2 -right-2 bg-secondary text-on-secondary p-1.5 rounded-lg shadow-lg">
                  <BadgeCheck className="w-4 h-4" />
                </div>
              )}
            </div>
            <div className="flex-grow pb-2">
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-4xl font-headline font-bold text-on-surface tracking-tight">
                  {user.address}
                </h1>
                <button className="text-slate-500 hover:text-primary transition-colors">
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-400 font-body mb-4">{user.bio}</p>
              <div className="flex gap-10">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                    Total Worth
                  </p>
                  <p className="text-2xl font-headline font-bold text-secondary">{user.totalWorth}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                    Wallet Balance
                  </p>
                  <p className="text-2xl font-headline font-bold text-on-surface">
                    {user.walletBalance}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">
                    NFTs Owned
                  </p>
                  <p className="text-2xl font-headline font-bold text-on-surface">{user.nftCount}</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3 pb-4">
              <button className="p-3 rounded-xl bg-surface-container-high hover:bg-surface-bright transition-colors text-slate-300">
                <Share2 className="w-5 h-5" />
              </button>
              <button className="px-6 py-3 rounded-xl bg-primary text-on-primary font-headline font-bold hover:opacity-90 transition-opacity">
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-12 mb-10 border-b border-outline-variant/10">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-4 font-headline font-bold tracking-tight transition-colors ${
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-slate-500 hover:text-on-surface'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'Owned' && (
          <>
            {/* Featured + Grid */}
            <div className="grid grid-cols-12 gap-8 mb-20">
              {/* Featured Card */}
              <div className="col-span-8 group relative rounded-2xl overflow-hidden bg-surface-container-low p-1">
                <div className="aspect-[21/9] w-full rounded-xl overflow-hidden relative">
                  <Image
                    src={mockItems[0].image}
                    alt={mockItems[0].name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent opacity-90" />
                  <div className="absolute bottom-6 left-8">
                    <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-[10px] uppercase tracking-widest font-bold backdrop-blur-md mb-3 inline-block">
                      Rare Collection
                    </span>
                    <h3 className="text-3xl font-headline font-bold text-on-surface mb-1">
                      {mockItems[0].name}
                    </h3>
                    <p className="text-slate-400 font-body">
                      {mockItems[0].acquiredAt} • Floor: {mockItems[0].floorPrice}
                    </p>
                  </div>
                </div>
              </div>

              {/* Portfolio Insights */}
              <div className="col-span-4 flex flex-col gap-8">
                <div className="flex-grow rounded-2xl bg-surface-container-low p-8 border border-outline-variant/5">
                  <h4 className="font-headline font-bold text-slate-500 text-xs uppercase tracking-widest mb-6">
                    Portfolio Insights
                  </h4>
                  <div className="space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Floor Growth</span>
                      <span className="text-secondary font-bold">+12.4%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300">Top Collection</span>
                      <span className="text-on-surface font-medium">Bored Ape</span>
                    </div>
                    <div className="h-[1px] bg-outline-variant/10 w-full" />
                    <div className="pt-2">
                      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-3">
                        Live Gas Tracker
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="flex-grow h-2 rounded-full bg-surface-container-high overflow-hidden">
                          <div className="h-full bg-secondary w-[65%] rounded-full shadow-glow-secondary" />
                        </div>
                        <span className="text-secondary font-bold text-sm">24 Gwei</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid Items */}
              {mockItems.slice(1).map((item) => (
                <div
                  key={item.id}
                  className="col-span-4 group bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/5 hover:border-primary/20 transition-all duration-300"
                >
                  <div className="aspect-square w-full overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">
                          {item.name}
                        </h4>
                        <p className="text-xs text-slate-500">Collection: {item.collection}</p>
                      </div>
                      <span className="text-secondary font-headline font-bold">{item.price}</span>
                    </div>
                    <button className="w-full py-3 rounded-xl bg-surface-container-high text-on-surface font-headline font-bold text-sm hover:bg-primary hover:text-on-primary transition-all">
                      List for Sale
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'Activity' && (
          <section className="mb-20">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-headline font-bold text-on-surface">Recent Activity</h2>
              <button className="text-sm font-headline font-bold text-secondary hover:underline">
                View All History
              </button>
            </div>
            <div className="overflow-x-auto">
              <ActivityTable activities={mockActivities} />
            </div>
          </section>
        )}

        {(activeTab === 'Listed' || activeTab === 'Offers') && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <div className="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center mb-4">
              {activeTab === 'Listed' ? (
                <Tag className="w-8 h-8" />
              ) : (
                <ShoppingCart className="w-8 h-8" />
              )}
            </div>
            <p className="text-lg font-headline">No {activeTab.toLowerCase()} items yet</p>
            <p className="text-sm mt-2">
              {activeTab === 'Listed'
                ? 'Start listing your NFTs to sell them'
                : 'Make offers on NFTs you want to buy'}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
