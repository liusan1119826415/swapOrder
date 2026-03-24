'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { BadgeCheck, Zap, Users, Clock, History } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import StatsCard from '@/components/ui/StatsCard';
import ActivityTable from '@/components/ui/ActivityTable';

// 模拟 NFT Item 数据
const mockItem = {
  id: '042',
  name: 'Cybernetic Void #042',
  collection: 'Cyber-Realism Collection',
  image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&h=800&fit=crop',
  price: '14.85 ETH',
  priceUsd: '$42,210.50',
  creator: 'VoidCurator',
  creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
  owner: 'VoidLabs',
  rarityRank: 142,
  totalSupply: 10000,
  mintNumber: 42,
  network: 'ETH',
  description:
    'Part of the original Void sequence, #042 represents the intersection of sentient data and recursive architecture. Each bloom represents a localized server collapse within the Cyber-Realism simulation.',
  endingIn: '08h : 24m : 11s',
  gasFee: '~0.002 ETH',
  activeBidders: 24,
  traits: [
    { type: 'Background', value: 'Obsidian Void', rarity: '8%' },
    { type: 'Core Pulse', value: 'Neon Ultraviolet', rarity: '3%' },
  ],
};

// 模拟 Listings
const mockListings = [
  { price: '14.85 ETH', priceUsd: '$42,210', floorDiff: 'At Floor', expiration: 'In 2 days' },
  { price: '15.40 ETH', priceUsd: '$43,780', floorDiff: '+3.7%', expiration: 'In 5 days' },
  { price: '16.00 ETH', priceUsd: '$45,440', floorDiff: '+7.2%', expiration: 'In 8 days' },
];

// 模拟 Activities
const mockActivities = [
  {
    id: '1',
    event: 'sale' as const,
    itemName: 'Cybernetic Void #042',
    itemImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
    price: '13.20 ETH',
    from: '0x889...2f1',
    to: 'VoidLabs',
    time: '2 days ago',
  },
  {
    id: '2',
    event: 'list' as const,
    itemName: 'Cybernetic Void #042',
    itemImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
    price: '14.85 ETH',
    from: 'VoidLabs',
    time: '1 hour ago',
  },
  {
    id: '3',
    event: 'transfer' as const,
    itemName: 'Cybernetic Void #042',
    itemImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
    from: 'GenesisMinter',
    to: '0x889...2f1',
    time: '5 months ago',
  },
];

export default function ItemDetailPage() {
  const params = useParams();
  const { address, tokenId } = params;

  const item = mockItem;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Asset Display */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-container-low">
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <StatsCard
                label="Rarity Rank"
                value={`#${item.rarityRank}`}
                subValue={`/ ${item.totalSupply.toLocaleString()}`}
                subValueColor="neutral"
              />
              <StatsCard label="Mint Number" value={item.mintNumber.toString()} />
              <StatsCard
                label="Network"
                value={item.network}
                icon={<Zap className="w-4 h-4" />}
              />
            </div>
          </div>

          {/* Right: Trade Panel */}
          <div className="lg:col-span-5 flex flex-col gap-8">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-secondary font-label text-sm font-medium">
                <BadgeCheck className="w-4 h-4" /> {item.collection}
              </div>
              <h1 className="text-5xl font-headline font-extrabold tracking-tight text-on-background">
                {item.name}
              </h1>
              <div className="flex items-center gap-4 pt-2">
                <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant/10">
                  <Image
                    src={item.creatorAvatar}
                    alt={item.creator}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <span className="text-xs font-medium">@{item.creator}</span>
                </div>
                <span className="text-slate-500 text-xs tracking-wide">OWNED BY {item.owner}</span>
              </div>
            </div>

            {/* Price Card */}
            <div className="p-8 rounded-3xl bg-surface-container-low border border-outline-variant/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[60px]" />
              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-500 font-label uppercase tracking-widest mb-2">
                      Current Price
                    </p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-headline font-bold text-on-surface">
                        {item.price}
                      </span>
                      <span className="text-slate-400 font-body text-sm">({item.priceUsd})</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 font-label uppercase tracking-widest mb-2">
                      Ending In
                    </p>
                    <p className="font-headline font-bold text-secondary">{item.endingIn}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <button className="bg-primary text-on-primary font-headline font-bold py-4 rounded-2xl hover:brightness-110 transition-all active:scale-[0.98] shadow-lg shadow-primary/20">
                    Buy Now
                  </button>
                  <button className="bg-surface-variant/40 border border-secondary/30 text-secondary font-headline font-bold py-4 rounded-2xl hover:bg-secondary/10 transition-all active:scale-[0.98]">
                    Make Offer
                  </button>
                </div>
                <div className="pt-4 flex items-center justify-between text-xs text-slate-400 border-t border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" />
                    Gas fee: {item.gasFee}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {item.activeBidders} Active Bidders
                  </div>
                </div>
              </div>
            </div>

            {/* Description & Attributes */}
            <div className="space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-outline-variant/5">
                <h4 className="font-headline font-bold text-sm mb-3">Description</h4>
                <p className="text-sm text-slate-400 leading-relaxed font-body">{item.description}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {item.traits.map((trait, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-xl bg-surface-container-high/50 border border-outline-variant/10"
                  >
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-label">
                      {trait.type}
                    </span>
                    <p className="text-sm font-bold text-primary mt-1">{trait.value}</p>
                    <p className="text-[10px] text-slate-500">{trait.rarity} have this trait</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Price History & Listings */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-16">
          {/* Price History Chart */}
          <div className="lg:col-span-7 bg-surface-container-low rounded-3xl p-8 border border-outline-variant/5">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-headline font-bold text-xl">Price History</h3>
                <p className="text-sm text-slate-500">All-time trading volume performance</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1 rounded-lg bg-surface-container-highest text-xs font-bold text-primary">
                  7D
                </button>
                <button className="px-3 py-1 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-300">
                  30D
                </button>
                <button className="px-3 py-1 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-300">
                  ALL
                </button>
              </div>
            </div>
            {/* Chart Placeholder */}
            <div className="relative h-64 w-full">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 800 200">
                <defs>
                  <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#14d1ff" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#14d1ff" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d="M0,180 L100,160 L200,170 L300,110 L400,130 L500,80 L600,90 L700,40 L800,60 L800,200 L0,200 Z"
                  fill="url(#chartGradient)"
                />
                <path
                  d="M0,180 L100,160 L200,170 L300,110 L400,130 L500,80 L600,90 L700,40 L800,60"
                  fill="none"
                  stroke="#14d1ff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="700" cy="40" r="6" fill="#14d1ff" className="animate-pulse" />
              </svg>
              <div className="absolute top-4 left-[640px] bg-surface-bright p-2 rounded-lg border border-secondary/30 text-center shadow-xl">
                <p className="text-[10px] text-slate-400 font-label">Oct 12</p>
                <p className="text-xs font-bold text-secondary">15.2 ETH</p>
              </div>
            </div>
          </div>

          {/* Listings */}
          <div className="lg:col-span-5 bg-surface-container-low rounded-3xl p-8 border border-outline-variant/5">
            <h3 className="font-headline font-bold text-xl mb-6">Listings</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-3 text-[10px] text-slate-500 uppercase tracking-widest font-label pb-2 border-b border-outline-variant/10">
                <span>Price</span>
                <span className="text-center">Floor Diff</span>
                <span className="text-right">Expiration</span>
              </div>
              {mockListings.map((listing, index) => (
                <div
                  key={index}
                  className="group grid grid-cols-3 items-center py-3 hover:bg-white/5 rounded-xl px-2 transition-all"
                >
                  <div className="flex flex-col">
                    <span className="font-bold text-on-surface">{listing.price}</span>
                    <span className="text-[10px] text-slate-500">{listing.priceUsd}</span>
                  </div>
                  <div className="text-center">
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        listing.floorDiff === 'At Floor'
                          ? 'bg-error-container/20 text-error'
                          : 'bg-primary/10 text-primary'
                      }`}
                    >
                      {listing.floorDiff}
                    </span>
                  </div>
                  <div className="text-right text-xs font-body text-slate-400">
                    {listing.expiration}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Table */}
        <div className="mt-8 bg-surface-container-low rounded-3xl p-8 border border-outline-variant/5">
          <div className="flex items-center gap-4 mb-8">
            <History className="text-primary w-6 h-6" />
            <h3 className="font-headline font-bold text-xl">Item Activity</h3>
          </div>
          <ActivityTable activities={mockActivities} />
        </div>
      </div>
    </MainLayout>
  );
}
