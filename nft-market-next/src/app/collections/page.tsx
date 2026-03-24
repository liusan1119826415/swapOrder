'use client';

import { ArrowRight, Filter, ChevronDown } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import CollectionCard from '@/components/ui/CollectionCard';
import { useCollectionsRanking } from '@/lib/hooks/useCollections';

// 模拟 Collection 数据
const mockCollections = [
  {
    id: '0x1234567890abcdef1',
    name: 'CyberGlow Enclave',
    image: 'https://images.unsplash.com/photo-1614728853913-1e221a65777a?w=200&h=200&fit=crop',
    creator: 'V0ID_WALKER',
    isVerified: true,
    floorPrice: '2.45 ETH',
    volume: '842.1 ETH',
    change24h: 24.5,
  },
  {
    id: '0x1234567890abcdef2',
    name: 'Abstract Geometric',
    image: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=200&h=200&fit=crop',
    creator: 'FORM_STUDIO',
    isVerified: true,
    floorPrice: '0.89 ETH',
    volume: '320.4 ETH',
    change24h: -2.1,
  },
  {
    id: '0x1234567890abcdef3',
    name: 'Voxel Verse Labs',
    image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=200&h=200&fit=crop',
    creator: 'VOXEL_KING',
    isVerified: true,
    floorPrice: '5.12 ETH',
    volume: '1.2K ETH',
    change24h: 118.9,
  },
  {
    id: '0x1234567890abcdef4',
    name: 'Neon Ether Collective',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&h=200&fit=crop',
    creator: 'NEON_ARTIST',
    isVerified: true,
    floorPrice: '3.21 ETH',
    volume: '2.5K ETH',
    change24h: 15.3,
  },
  {
    id: '0x1234567890abcdef5',
    name: 'Digital Dreams',
    image: 'https://images.unsplash.com/photo-1614726365723-49cfae927846?w=200&h=200&fit=crop',
    creator: 'DREAM_MAKER',
    isVerified: false,
    floorPrice: '1.15 ETH',
    volume: '456.8 ETH',
    change24h: 8.7,
  },
  {
    id: '0x1234567890abcdef6',
    name: 'Crypto Punks V2',
    image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=200&h=200&fit=crop',
    creator: 'PUNK_CREATOR',
    isVerified: true,
    floorPrice: '12.50 ETH',
    volume: '15.2K ETH',
    change24h: -5.2,
  },
];

const categories = ['All', 'Art', 'Gaming', 'Metaverse', 'Music', 'Photography'];

export default function CollectionsPage() {
  const { data: rankingData, isLoading: isRankingLoading } = useCollectionsRanking(10, '1d');
  
  // 使用 API 数据而不是 mock 数据
  const collections = rankingData || mockCollections;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-headline font-bold tracking-tight mb-2">Collections</h1>
          <p className="text-slate-400">Discover and explore top NFT collections</p>
        </div>

        {/* Filters */}
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
            <div className="flex bg-surface-container-low p-1 rounded-full border border-outline-variant/10">
              <button className="px-4 py-1.5 rounded-full text-xs font-headline font-bold bg-surface-container-high text-on-surface">
                24h
              </button>
              <button className="px-4 py-1.5 rounded-full text-xs font-headline font-bold text-outline hover:text-on-surface transition-colors">
                7d
              </button>
              <button className="px-4 py-1.5 rounded-full text-xs font-headline font-bold text-outline hover:text-on-surface transition-colors">
                30d
              </button>
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm hover:bg-surface-container-high transition-all">
              <Filter className="w-4 h-4" /> Filters
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm hover:bg-surface-container-high transition-all">
              Sort by: Volume <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Collections Grid */}
        {isRankingLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="bg-surface-container-low p-6 rounded-3xl h-48 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {mockCollections.map((collection) => (
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

        {/* Load More */}
        <div className="mt-16 flex justify-center">
          <button className="flex items-center gap-3 px-10 py-4 bg-surface-container-high border border-outline-variant/15 rounded-full font-headline font-bold hover:bg-surface-bright transition-all group">
            Load More Collections
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
