'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Filter, ChevronDown } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import CollectionCard from '@/components/ui/CollectionCard';
import NFTCard from '@/components/ui/NFTCard';
import { useCollectionsRanking } from '@/lib/hooks/useCollections';

// 模拟 NFT 数据
const featuredNFTs = [
  {
    id: '1',
    name: 'Liquid Reality #042',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
    price: '1.28 ETH',
    creatorName: 'Digital_Aura',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    status: 'buy_now' as const,
  },
  {
    id: '2',
    name: 'Ethereal Form III',
    image: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&h=400&fit=crop',
    price: '0.95 ETH',
    creatorName: 'Neo_Sculpt',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    status: 'auction' as const,
  },
  {
    id: '3',
    name: 'Void Citadel X',
    image: 'https://images.unsplash.com/photo-1614728853913-1e221a65777a?w=400&h=400&fit=crop',
    price: '4.50 ETH',
    creatorName: 'Galactic_Arch',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    status: 'buy_now' as const,
  },
  {
    id: '4',
    name: 'Bio-Mechanical v1',
    image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=400&h=400&fit=crop',
    price: '2.11 ETH',
    creatorName: 'Synth_Nexus',
    creatorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    status: 'buy_now' as const,
  },
];

const categories = ['All Assets', 'Digital Art', 'Gaming', 'Metaverse', 'Music'];

export default function HomePage() {
  const { data: rankingData, isLoading: isRankingLoading } = useCollectionsRanking(3, '1d');

  const trendingCollections = rankingData?.result?.map((item) => ({
    id: item.address,
    name: item.name,
    image: item.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
    creator: item.name.split(' ')[0] || 'Unknown',
    isVerified: true,
    floorPrice: item.floorPrice || '0.5 ETH',
    volume: item.volume || '100 ETH',
    change24h: parseFloat(item.change24h?.toString() || '0'),
  })) || [];

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="relative h-[500px] w-full rounded-3xl overflow-hidden mb-16 group">
          <div
            className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&h=600&fit=crop')`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
          <div className="relative h-full flex flex-col justify-end p-12 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/30 backdrop-blur-md">
                Featured Drop
              </span>
              <span className="text-secondary text-xs font-headline uppercase tracking-widest">
                Ends in 04:22:15
              </span>
            </div>
            <h1 className="text-6xl font-headline font-bold mb-6 leading-tight tracking-tighter">
              NEON ETHER <br />
              COLLECTIVE
            </h1>
            <p className="text-on-surface-variant text-lg mb-8 leading-relaxed max-w-lg">
              A limited collection of 1,111 generative artifacts exploring the intersection of
              biological forms and silicon logic.
            </p>
            <div className="flex gap-4">
              <button className="bg-primary text-on-primary px-8 py-4 rounded-full font-headline font-bold flex items-center gap-2 hover:shadow-glow transition-all">
                View Collection <ArrowRight className="w-5 h-5" />
              </button>
              <button className="bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-full font-headline font-bold border border-white/10 hover:bg-white/20 transition-all">
                Place Bid
              </button>
            </div>
          </div>
        </section>

        {/* Trending Collections */}
        <section className="mb-16">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-headline font-bold tracking-tight">
                Trending Collections
              </h2>
              <p className="text-outline-variant mt-1">
                Real-time market momentum across the ecosystem
              </p>
            </div>
            <div className="flex bg-surface-container-low p-1 rounded-full border border-outline-variant/10">
              <button className="px-6 py-2 rounded-full text-xs font-headline font-bold bg-surface-container-high text-on-surface">
                24h
              </button>
              <button className="px-6 py-2 rounded-full text-xs font-headline font-bold text-outline hover:text-on-surface transition-colors">
                7d
              </button>
              <button className="px-6 py-2 rounded-full text-xs font-headline font-bold text-outline hover:text-on-surface transition-colors">
                30d
              </button>
            </div>
          </div>

          {isRankingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-surface-container-low p-6 rounded-3xl h-48 animate-pulse"
                />
              ))}
            </div>
          ) : (
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
          )}
        </section>

        {/* Main Marketplace */}
        <section>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex flex-wrap gap-2">
              {categories.map((category, index) => (
                <button
                  key={category}
                  className={`px-5 py-2 rounded-full font-headline text-sm font-bold transition-all ${
                    index === 0
                      ? 'bg-primary text-on-primary'
                      : 'bg-surface-container-high text-on-surface hover:bg-surface-bright border border-outline-variant/10'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm hover:bg-surface-container-high transition-all">
                <Filter className="w-4 h-4" /> Filters
              </button>
              <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm hover:bg-surface-container-high transition-all">
                Sort by: Price High to Low <ChevronDown className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* NFT Grid */}
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

          {/* Load More */}
          <div className="mt-16 flex justify-center">
            <button className="flex items-center gap-3 px-10 py-4 bg-surface-container-high border border-outline-variant/15 rounded-full font-headline font-bold hover:bg-surface-bright transition-all group">
              Explore All Collections
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
