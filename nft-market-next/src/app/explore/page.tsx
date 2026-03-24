'use client';

import { Compass, TrendingUp, Sparkles, Clock } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import NFTCard from '@/components/ui/NFTCard';
import CollectionCard from '@/components/ui/CollectionCard';

const categories = [
  { name: 'Trending', icon: TrendingUp, color: 'text-secondary' },
  { name: 'New Drops', icon: Sparkles, color: 'text-primary' },
  { name: 'Ending Soon', icon: Clock, color: 'text-tertiary' },
];

const featuredNFTs = [
  {
    id: '1',
    name: 'Cosmic Voyager #001',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
    price: '2.5 ETH',
    creatorName: 'StarWalker',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    status: 'buy_now' as const,
  },
  {
    id: '2',
    name: 'Digital Genesis',
    image: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&h=400&fit=crop',
    price: '1.8 ETH',
    creatorName: 'CryptoArtist',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    status: 'auction' as const,
  },
  {
    id: '3',
    name: 'Neon Dreams #42',
    image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=400&h=400&fit=crop',
    price: '3.2 ETH',
    creatorName: 'NeonMaster',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    status: 'buy_now' as const,
  },
  {
    id: '4',
    name: 'Abstract Flow',
    image: 'https://images.unsplash.com/photo-1614728853913-1e221a65777a?w=400&h=400&fit=crop',
    price: '0.95 ETH',
    creatorName: 'FlowArtist',
    creatorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    status: 'buy_now' as const,
  },
];

const trendingCollections = [
  {
    id: '1',
    name: 'CyberPunk City',
    image: 'https://images.unsplash.com/photo-1614728853913-1e221a65777a?w=200&h=200&fit=crop',
    creator: 'CyberLabs',
    isVerified: true,
    floorPrice: '1.5 ETH',
    volume: '500 ETH',
    change24h: 25.5,
  },
  {
    id: '2',
    name: 'Metaverse Lands',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=200&h=200&fit=crop',
    creator: 'MetaStudio',
    isVerified: true,
    floorPrice: '3.2 ETH',
    volume: '1.2K ETH',
    change24h: 18.3,
  },
  {
    id: '3',
    name: 'Digital Souls',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
    creator: 'SoulArtist',
    isVerified: false,
    floorPrice: '0.8 ETH',
    volume: '200 ETH',
    change24h: -5.2,
  },
];

export default function ExplorePage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-headline font-bold tracking-tight mb-2 flex items-center gap-3">
            <Compass className="w-10 h-10 text-primary" />
            Explore
          </h1>
          <p className="text-slate-400">Discover the best NFTs across all categories</p>
        </div>

        {/* Category Tabs */}
        <div className="flex gap-4 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.name}
                className="flex items-center gap-2 px-6 py-3 bg-surface-container-low rounded-xl border border-outline-variant/10 hover:border-primary/30 transition-all"
              >
                <Icon className={`w-5 h-5 ${category.color}`} />
                <span className="font-headline font-bold">{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Trending Collections */}
        <section className="mb-12">
          <h2 className="text-2xl font-headline font-bold mb-6">Trending Collections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {trendingCollections.map((collection) => (
              <CollectionCard
                key={collection.id}
                id={collection.id}
                name={collection.name}
                image={collection.image}
                creator={collection.creator}
                isVerified={collection.isVerified}
                floorPrice={collection.floorPrice}
                volume={collection.volume}
                change24h={collection.change24h}
                href={`/collections/${collection.id}`}
              />
            ))}
          </div>
        </section>

        {/* Featured NFTs */}
        <section>
          <h2 className="text-2xl font-headline font-bold mb-6">Featured NFTs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {featuredNFTs.map((nft) => (
              <NFTCard
                key={nft.id}
                id={nft.id}
                name={nft.name}
                image={nft.image}
                price={nft.price}
                creatorName={nft.creatorName}
                creatorAvatar={nft.creatorAvatar}
                status={nft.status}
                href={`/collections/0x123/${nft.id}`}
              />
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
