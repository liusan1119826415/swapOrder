'use client';

import Image from 'next/image';
import { useParams } from 'next/navigation';
import { BadgeCheck, Search, Grid3X3, List, Heart, ShoppingCart } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import NFTCard from '@/components/ui/NFTCard';
import { useCollectionDetail, useCollectionItems } from '@/lib/hooks/useCollections';
import { chainIdToChain } from '@/config/wagmi';

// 模拟 Collection 数据
const mockCollection = {
  address: '0x1234567890abcdef',
  name: 'Ethereal Voyagers',
  description: 'A collection of 8,888 unique digital voyagers exploring the infinite realms of the metaverse.',
  image: 'https://images.unsplash.com/photo-1614728853913-1e221a65777a?w=400&h=400&fit=crop',
  bannerImage: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&h=400&fit=crop',
  creator: 'Aether_Studio',
  isVerified: true,
  floorPrice: '2.45 ETH',
  totalVolume: '12.8K ETH',
  itemCount: 8888,
  ownerCount: 4210,
  change24h: 12,
};

// 模拟 NFT Items
const mockItems = [
  {
    id: '4521',
    name: 'Voyager #4521',
    image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=400&h=400&fit=crop',
    price: '3.85 ETH',
    rarity: 'Legendary',
  },
  {
    id: '1289',
    name: 'Voyager #1289',
    image: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&h=400&fit=crop',
    price: '2.92 ETH',
    rarity: 'Rare',
  },
  {
    id: '8812',
    name: 'Voyager #8812',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
    price: '2.45 ETH',
    rarity: 'Uncommon',
  },
  {
    id: '0012',
    name: 'Voyager #0012',
    image: 'https://images.unsplash.com/photo-1614726365723-49cfae927846?w=400&h=400&fit=crop',
    price: '15.0 ETH',
    rarity: 'Legendary',
  },
];

const traitFilters = [
  { name: 'Background', options: ['Void (452)', 'Nebula (120)', 'Grid (98)'] },
  { name: 'Type', options: ['Humanoid (234)', 'Android (189)', 'Energy (67)'] },
  { name: 'Headwear', options: ['Helmet (345)', 'Crown (23)', 'None (520)'] },
];

export default function CollectionPage() {
  const params = useParams();
  const address = params.address as string;

  // 使用默认链 ID (Ethereum mainnet = 1)
  const chainId = 1;

  // 实际 API 调用（暂时使用模拟数据）
  // const { data: collection, isLoading: isCollectionLoading } = useCollectionDetail(address, chainId);
  // const { data: itemsData, isLoading: isItemsLoading } = useCollectionItems(address, {
  //   chainId,
  //   page: 1,
  //   pageSize: 20,
  // });

  const collection = mockCollection;

  return (
    <MainLayout>
      {/* Hero Banner */}
      <section className="relative h-[300px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background z-10" />
        <Image
          src={collection.bannerImage}
          alt={collection.name}
          fill
          className="object-cover"
        />
        <div className="absolute bottom-8 left-12 z-20 flex items-end gap-8">
          <div className="w-40 h-40 rounded-2xl border-4 border-background overflow-hidden shadow-2xl bg-surface-container">
            <Image
              src={collection.image}
              alt={collection.name}
              width={160}
              height={160}
              className="object-cover"
            />
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
                Created by <span className="text-primary cursor-pointer hover:underline">{collection.creator}</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="px-12 py-8 grid grid-cols-4 gap-6 bg-surface-container-low/20 backdrop-blur-sm border-y border-outline-variant/10">
        <div className="flex flex-col">
          <span className="text-outline text-xs uppercase tracking-widest font-headline">Floor Price</span>
          <span className="text-2xl font-bold text-secondary flex items-center gap-2">
            {collection.floorPrice}{' '}
            <span className="text-xs text-green-400 font-normal">+{collection.change24h}%</span>
          </span>
        </div>
        <div className="flex flex-col">
          <span className="text-outline text-xs uppercase tracking-widest font-headline">Total Volume</span>
          <span className="text-2xl font-bold text-on-background">{collection.totalVolume}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-outline text-xs uppercase tracking-widest font-headline">Items</span>
          <span className="text-2xl font-bold text-on-background">{collection.itemCount.toLocaleString()}</span>
        </div>
        <div className="flex flex-col">
          <span className="text-outline text-xs uppercase tracking-widest font-headline">Owners</span>
          <span className="text-2xl font-bold text-on-background">{collection.ownerCount.toLocaleString()}</span>
        </div>
      </section>

      {/* Main Content */}
      <div className="flex gap-8 px-12 py-12">
        {/* Filters Sidebar */}
        <aside className="w-72 flex flex-col gap-8 flex-shrink-0">
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

          <div className="space-y-6">
            <h3 className="font-headline text-sm font-bold uppercase tracking-widest text-on-surface-variant">
              Traits
            </h3>
            {traitFilters.map((trait) => (
              <div key={trait.name} className="border-b border-outline-variant/15 pb-4">
                <div className="flex items-center justify-between cursor-pointer group">
                  <span className="text-sm font-medium">{trait.name}</span>
                  <span className="text-outline group-hover:text-on-surface">▼</span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
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
          <div className="flex items-center justify-between mb-8">
            <span className="font-headline font-medium text-outline">
              Showing {collection.itemCount.toLocaleString()} Results
            </span>
            <div className="flex items-center gap-4">
              <div className="flex bg-surface-container-low rounded-lg p-1">
                <button className="p-2 rounded bg-surface-container-high text-primary">
                  <Grid3X3 className="w-5 h-5" />
                </button>
                <button className="p-2 rounded text-outline hover:text-on-surface">
                  <List className="w-5 h-5" />
                </button>
              </div>
              <select className="bg-surface-container-low border-none rounded-lg text-sm px-4 py-2 focus:ring-0 cursor-pointer">
                <option>Price: Low to High</option>
                <option>Price: High to Low</option>
                <option>Recently Listed</option>
                <option>Rarity: Rare first</option>
              </select>
            </div>
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {mockItems.map((item) => (
              <div
                key={item.id}
                className="group bg-surface-container-low rounded-2xl overflow-hidden hover:-translate-y-1 transition-all duration-300 shadow-lg hover:shadow-primary/5"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className="bg-black/60 backdrop-blur-md text-[10px] font-bold text-secondary px-2 py-1 rounded uppercase tracking-wider">
                      {item.rarity}
                    </span>
                  </div>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center shadow-lg active:scale-90 transition-transform">
                      <ShoppingCart className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-headline font-bold text-lg">{item.name}</h4>
                      <p className="text-xs text-outline">{collection.name}</p>
                    </div>
                    <button className="text-outline hover:text-error transition-colors">
                      <Heart className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between pt-4 border-t border-outline-variant/10">
                    <div>
                      <p className="text-[10px] uppercase text-outline font-headline tracking-widest">Price</p>
                      <p className="font-bold text-secondary">{item.price}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase text-outline font-headline tracking-widest">Last</p>
                      <p className="text-sm font-medium">-</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More */}
          <div className="mt-16 flex justify-center">
            <button className="px-12 py-4 rounded-full bg-surface-container-high hover:bg-surface-bright text-on-surface font-bold transition-all border border-outline-variant/20 hover:border-primary/50">
              Explore More Voyagers
            </button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
