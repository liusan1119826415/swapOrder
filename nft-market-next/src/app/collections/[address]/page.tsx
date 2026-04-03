'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { BadgeCheck, Search, Grid3X3, List, Heart, ShoppingCart, Tag, Filter } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import TradingModal from '@/components/ui/TradingModal';
import { useTradingModal } from '@/lib/hooks';

// 合约地址 - Sepolia 测试网
const CHAIN_ID = 11155111;

// 模拟 Collection 数据
const mockCollection = {
  address: '0xbD82f9fdB3C78c276007bAa0396Cb3A3E48Eb2fF',
  name: 'Ethereal Voyagers',
  description: 'A collection of 8,888 unique digital voyagers exploring the infinite realms of the metaverse.',
  image: 'https://images.unsplash.com/photo-1614728853913-1e221a65777a?w=400&h=400&fit=crop',
  bannerImage: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&h=400&fit=crop',
  creator: 'Aether_Studio',
  isVerified: true,
  floorPrice: '0.0001 ETH',
  totalVolume: '12.8K ETH',
  itemCount: 8888,
  ownerCount: 4210,
  change24h: 12,
};

// 模拟 NFT Items - 使用真实合约地址和 tokenId
const mockItems = [
  {
    id: '1',
    name: 'Voyager #1',
    image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=400&h=400&fit=crop',
    price: '0.0001',
    priceDisplay: '0.0001 ETH',
    rarity: 'Legendary',
    collectionAddress: '0xbD82f9fdB3C78c276007bAa0396Cb3A3E48Eb2fF',
    tokenId: '1',
    isListed: true,
  },
  {
    id: '2',
    name: 'Voyager #2',
    image: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&h=400&fit=crop',
    price: '0.0002',
    priceDisplay: '0.0002 ETH',
    rarity: 'Rare',
    collectionAddress: '0xbD82f9fdB3C78c276007bAa0396Cb3A3E48Eb2fF',
    tokenId: '2',
    isListed: true,
  },
  {
    id: '3',
    name: 'Voyager #3',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
    price: '0.0001',
    priceDisplay: '0.0001 ETH',
    rarity: 'Uncommon',
    collectionAddress: '0xbD82f9fdB3C78c276007bAa0396Cb3A3E48Eb2fF',
    tokenId: '3',
    isListed: false,
  },
  {
    id: '4',
    name: 'Voyager #4',
    image: 'https://images.unsplash.com/photo-1614726365723-49cfae927846?w=400&h=400&fit=crop',
    price: '0.0005',
    priceDisplay: '0.0005 ETH',
    rarity: 'Legendary',
    collectionAddress: '0xbD82f9fdB3C78c276007bAa0396Cb3A3E48Eb2fF',
    tokenId: '4',
    isListed: true,
  },
];

const traitFilters = [
  { name: 'Background', options: ['Void (452)', 'Nebula (120)', 'Grid (98)'] },
  { name: 'Type', options: ['Humanoid (234)', 'Android (189)', 'Energy (67)'] },
  { name: 'Headwear', options: ['Helmet (345)', 'Crown (23)', 'None (520)'] },
];

const rarityColors: Record<string, string> = {
  Legendary: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Rare: 'text-primary bg-primary/10 border-primary/20',
  Uncommon: 'text-secondary bg-secondary/10 border-secondary/20',
  Common: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
};

export default function CollectionPage() {
  const params = useParams();
  const address = (params.address as string) || mockCollection.address;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const {
    modalState,
    openBuyModal,
    openBidModal,
    closeModal,
  } = useTradingModal();

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const collection = mockCollection;

  return (
    <MainLayout>
      {/* Hero Banner */}
      <section className="relative h-[300px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />
        <Image src={collection.bannerImage} alt={collection.name} fill className="object-cover" />
        <div className="absolute bottom-8 left-12 z-20 flex items-end gap-8">
          <div className="w-40 h-40 rounded-2xl border-4 border-background overflow-hidden shadow-2xl bg-surface-container">
            <Image src={collection.image} alt={collection.name} width={160} height={160} className="object-cover" />
          </div>
          <div className="pb-4">
            <h1 className="font-headline text-5xl font-bold tracking-tight text-on-background mb-2">
              {collection.name}
            </h1>
            <div className="flex items-center gap-4 text-sm font-medium">
              <span className="flex items-center gap-1 text-secondary">
                <BadgeCheck className="w-4 h-4" /> Verified Collection
              </span>
              <span className="text-outline">
                Created by{' '}
                <span className="text-primary cursor-pointer hover:underline">{collection.creator}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="px-12 py-8 grid grid-cols-4 gap-6 bg-surface-container-low/20 backdrop-blur-sm border-y border-outline-variant/10">
        {[
          { label: 'Floor Price', value: collection.floorPrice, extra: `+${collection.change24h}%`, extraColor: 'text-green-400' },
          { label: 'Total Volume', value: collection.totalVolume },
          { label: 'Items', value: collection.itemCount.toLocaleString() },
          { label: 'Owners', value: collection.ownerCount.toLocaleString() },
        ].map((stat) => (
          <div key={stat.label} className="flex flex-col">
            <span className="text-outline text-xs uppercase tracking-widest font-headline">{stat.label}</span>
            <span className="text-2xl font-bold text-secondary flex items-center gap-2">
              {stat.value}
              {stat.extra && <span className={`text-xs font-normal ${stat.extraColor}`}>{stat.extra}</span>}
            </span>
          </div>
        ))}
      </section>

      {/* Main Content */}
      <div className="flex gap-8 px-12 py-12">
        {/* Filters Sidebar */}
        <aside className="w-72 flex flex-col gap-8 flex-shrink-0">
          {/* Search */}
          <div className="space-y-4">
            <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface-variant">
              Search Assets
            </h3>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5 group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="ID, Name, Trait..."
                className="w-full bg-surface-container-highest border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-1 focus:ring-primary transition-all placeholder:text-outline"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="space-y-3">
            <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface-variant">Status</h3>
            <div className="flex flex-col gap-2">
              {['All', 'Listed', 'Not Listed'].map(s => (
                <button
                  key={s}
                  className="px-4 py-2 rounded-xl text-sm text-left hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Traits */}
          <div className="space-y-6">
            <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface-variant">Traits</h3>
            {traitFilters.map((trait) => (
              <div key={trait.name} className="border-b border-outline-variant/15 pb-4">
                <div className="flex items-center justify-between cursor-pointer group mb-4">
                  <span className="text-sm font-medium">{trait.name}</span>
                  <span className="text-outline group-hover:text-on-surface">▼</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {trait.options.map((option) => (
                    <button
                      key={option}
                      className="px-3 py-1.5 rounded-full bg-surface-container text-xs hover:bg-primary/20 hover:text-primary transition-all border border-transparent hover:border-primary/30"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button className="w-full py-3 rounded-xl border border-primary/20 text-primary text-xs font-bold uppercase tracking-widest hover:bg-primary/5 transition-all">
              Clear All Filters
            </button>
          </div>
        </aside>

        {/* NFT Grid */}
        <div className="flex-grow">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-8">
            <span className="font-headline font-medium text-outline">
              Showing {mockItems.length} Results
            </span>
            <div className="flex items-center gap-4">
              <div className="flex bg-surface-container-low rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${viewMode === 'grid' ? 'bg-surface-container-high text-primary' : 'text-outline hover:text-on-surface'}`}
                >
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${viewMode === 'list' ? 'bg-surface-container-high text-primary' : 'text-outline hover:text-on-surface'}`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
              <select className="bg-surface-container-low border-none rounded-lg text-sm px-4 py-2 focus:ring-0 cursor-pointer text-on-surface">
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Recently Listed</option>
                <option>Rarity: Rare first</option>
              </select>
            </div>
          </div>

          {/* Grid View */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
              {mockItems.map((item) => (
                <div
                  key={item.id}
                  className="group bg-surface-container-low rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-primary/10 border border-outline-variant/5 hover:border-primary/20"
                >
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Rarity badge */}
                    <div className="absolute top-3 left-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full border backdrop-blur-md uppercase tracking-wider ${rarityColors[item.rarity] || rarityColors.Common}`}>
                        {item.rarity}
                      </span>
                    </div>
                    {/* Listed badge */}
                    {item.isListed && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 backdrop-blur-md">
                          Listed
                        </span>
                      </div>
                    )}
                    {/* Hover Overlay: Quick actions */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      {item.isListed && (
                        <button
                          onClick={() => openBuyModal(item.collectionAddress, item.tokenId, item.price)}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-on-primary font-headline font-bold text-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-primary/30"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          Buy
                        </button>
                      )}
                      <button
                        onClick={() => openBidModal(item.collectionAddress, item.tokenId)}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-surface-container-high/90 border border-secondary/30 text-secondary font-headline font-bold text-sm hover:bg-secondary/20 active:scale-95 transition-all"
                      >
                        <Tag className="w-4 h-4" />
                        Offer
                      </button>
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-headline font-bold text-lg group-hover:text-primary transition-colors">{item.name}</h4>
                        <p className="text-xs text-outline">{collection.name}</p>
                      </div>
                      <button
                        onClick={() => toggleFavorite(item.id)}
                        className="transition-colors mt-0.5"
                      >
                        <Heart
                          className={`w-5 h-5 transition-all ${favorites.has(item.id) ? 'text-red-400 fill-red-400' : 'text-outline hover:text-red-400'}`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-outline-variant/10">
                      <div>
                        <p className="text-[10px] uppercase text-outline font-headline tracking-widest">
                          {item.isListed ? 'Price' : 'Last Sale'}
                        </p>
                        <p className="font-bold text-secondary">{item.priceDisplay}</p>
                      </div>
                      <div className="flex gap-2">
                        {item.isListed ? (
                          <button
                            onClick={() => openBuyModal(item.collectionAddress, item.tokenId, item.price)}
                            className="px-4 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-on-primary text-xs font-headline font-bold transition-all"
                          >
                            Buy Now
                          </button>
                        ) : (
                          <button
                            onClick={() => openBidModal(item.collectionAddress, item.tokenId)}
                            className="px-4 py-2 rounded-xl bg-secondary/10 text-secondary hover:bg-secondary hover:text-on-secondary text-xs font-headline font-bold transition-all"
                          >
                            Make Offer
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === 'list' && (
            <div className="space-y-3">
              {/* Header */}
              <div className="grid grid-cols-12 items-center px-4 py-2 text-[10px] text-slate-500 uppercase tracking-widest font-label">
                <span className="col-span-5">Item</span>
                <span className="col-span-2 text-right">Price</span>
                <span className="col-span-2 text-center">Rarity</span>
                <span className="col-span-3 text-right">Actions</span>
              </div>
              {mockItems.map((item) => (
                <div
                  key={item.id}
                  className="group grid grid-cols-12 items-center px-4 py-3 bg-surface-container-low rounded-xl border border-outline-variant/5 hover:border-primary/20 transition-all"
                >
                  {/* Item info */}
                  <div className="col-span-5 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
                      <Image src={item.image} alt={item.name} width={56} height={56} className="object-cover" />
                    </div>
                    <div>
                      <p className="font-headline font-bold text-sm group-hover:text-primary transition-colors">{item.name}</p>
                      <p className="text-xs text-outline">{collection.name}</p>
                      {item.isListed && (
                        <span className="text-[10px] text-green-400">● Listed</span>
                      )}
                    </div>
                  </div>
                  {/* Price */}
                  <div className="col-span-2 text-right">
                    <p className="font-bold text-secondary text-sm">{item.priceDisplay}</p>
                  </div>
                  {/* Rarity */}
                  <div className="col-span-2 flex justify-center">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${rarityColors[item.rarity] || rarityColors.Common}`}>
                      {item.rarity}
                    </span>
                  </div>
                  {/* Actions */}
                  <div className="col-span-3 flex items-center justify-end gap-2">
                    <button
                      onClick={() => toggleFavorite(item.id)}
                      className="p-2 rounded-lg hover:bg-surface-container-high transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${favorites.has(item.id) ? 'text-red-400 fill-red-400' : 'text-outline'}`} />
                    </button>
                    {item.isListed && (
                      <button
                        onClick={() => openBuyModal(item.collectionAddress, item.tokenId, item.price)}
                        className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-headline font-bold hover:opacity-90 transition-opacity"
                      >
                        Buy
                      </button>
                    )}
                    <button
                      onClick={() => openBidModal(item.collectionAddress, item.tokenId)}
                      className="px-3 py-1.5 rounded-lg bg-secondary/10 text-secondary border border-secondary/20 text-xs font-headline font-bold hover:bg-secondary/20 transition-colors"
                    >
                      Offer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          <div className="mt-16 flex justify-center">
            <button className="px-12 py-4 rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface font-bold transition-all border border-outline-variant/20 hover:border-primary/50">
              Explore More
            </button>
          </div>
        </div>
      </div>

      {/* Trading Modal - 全局一个即可 */}
      <TradingModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        collectionAddress={modalState.collectionAddress}
        tokenId={modalState.tokenId}
        price={modalState.price}
        onClose={closeModal}
        chainId={CHAIN_ID}
      />
    </MainLayout>
  );
}
