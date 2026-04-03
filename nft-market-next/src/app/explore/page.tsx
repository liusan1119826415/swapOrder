'use client';

import { useState, useMemo } from 'react';
import { Compass, TrendingUp, Sparkles, Clock, Loader2 } from 'lucide-react';
import { formatEther } from 'viem';
import MainLayout from '@/components/layout/MainLayout';
import NFTCard from '@/components/ui/NFTCard';
import CollectionCard from '@/components/ui/CollectionCard';
import { useTopCollections, useAnalyticsStats, useCollectionItems } from '@/lib/hooks';
import { ipfsToHttpUrl } from '@/lib/ipfs';

const CHAIN_ID = 11155111; // Sepolia

const categories = [
  { name: 'Trending', icon: TrendingUp, color: 'text-secondary' },
  { name: 'New Drops', icon: Sparkles, color: 'text-primary' },
  { name: 'Ending Soon', icon: Clock, color: 'text-tertiary' },
];

export default function ExplorePage() {
  const [selectedCategory, setSelectedCategory] = useState('Trending');
  const [timeRange, setTimeRange] = useState('1d');

  // Fetch top collections from API
  const { 
    data: topCollectionsData, 
    isLoading: isLoadingCollections,
    error: collectionsError,
  } = useTopCollections(12, timeRange);

  // Fetch analytics stats
  const { data: statsData } = useAnalyticsStats(timeRange);

  // Get collections from API response (handles both snake_case and camelCase)
  const collections = topCollectionsData?.top_collections || [];

  // Use the first collection address for Featured NFTs, fallback to empty string
  const featuredCollectionAddress = collections[0]?.address || '';

  // Fetch real NFT items from the first top collection
  const {
    data: featuredItemsData,
    isLoading: isLoadingFeatured,
  } = useCollectionItems(featuredCollectionAddress, {
    chainId: CHAIN_ID,
    page: 1,
    pageSize: 8,
  });

  // Flatten featured items from pages
  const featuredNFTs = useMemo(() => {
    const items = featuredItemsData?.pages?.flatMap((page: any) => page?.data?.result || []) || [];
    return items.slice(0, 8).map((item: any) => ({
      id: item.token_id || item.tokenId || '',
      name: item.name || `#${item.token_id}`,
      image: item.image_url ? ipfsToHttpUrl(item.image_url) : (item.image_uri ? ipfsToHttpUrl(item.image_uri) : ''),
      price: item.list_price && item.list_price !== '0'
        ? `${Number(formatEther(BigInt(item.list_price))).toFixed(4)} ETH`
        : item.last_sell_price && item.last_sell_price !== '0'
          ? `${Number(formatEther(BigInt(item.last_sell_price))).toFixed(4)} ETH`
          : '-- ETH',
      collectionName: item.collection_name || '',
      status: (item.list_order_id ? 'buy_now' : 'buy_now') as 'buy_now' | 'auction',
      collectionAddress: item.collection_address || featuredCollectionAddress,
    }));
  }, [featuredItemsData, featuredCollectionAddress]);

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

        {/* Stats Bar */}
        {statsData?.stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Total Volume</p>
              <p className="text-xl font-headline font-bold text-secondary">{statsData.stats.totalVolume} ETH</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Total Sales</p>
              <p className="text-xl font-headline font-bold text-on-surface">{statsData.stats.totalSales}</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Active Users</p>
              <p className="text-xl font-headline font-bold text-on-surface">{statsData.stats.activeUsers}</p>
            </div>
            <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/10">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Collections</p>
              <p className="text-xl font-headline font-bold text-on-surface">{statsData.stats.totalCollections}</p>
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-4 mb-8">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all ${
                  selectedCategory === category.name
                    ? 'bg-primary/10 border-primary/30 text-primary'
                    : 'bg-surface-container-low border-outline-variant/10 hover:border-primary/30'
                }`}
              >
                <Icon className={`w-5 h-5 ${category.color}`} />
                <span className="font-headline font-bold">{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* Time Range Selector */}
        <div className="flex gap-2 mb-8">
          {['1d', '7d', '30d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                timeRange === range
                  ? 'bg-secondary text-on-secondary'
                  : 'bg-surface-container-high text-slate-400 hover:text-on-surface'
              }`}
            >
              {range === '1d' ? '24h' : range === '7d' ? '7 Days' : '30 Days'}
            </button>
          ))}
        </div>

        {/* Trending Collections */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-headline font-bold">Trending Collections</h2>
          </div>
          
          {isLoadingCollections ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : collectionsError ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500">
              <p className="text-lg font-headline">Failed to load collections</p>
              <p className="text-sm mt-2">Please try again later</p>
            </div>
          ) : collections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-500">
              <p className="text-lg font-headline">No collections found</p>
              <p className="text-sm mt-2">Check back later for trending collections</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {collections.map((collection: any, index: number) => (
                <CollectionCard
                  key={collection.address || index}
                  id={collection.address || index.toString()}
                  name={collection.name}
                  image={collection.logo}
                  creator={collection.name}
                  isVerified={collection.isVerified}
                  floorPrice={`${collection.floorPrice} ETH`}
                  volume={`${collection.volume} ETH`}
                  change24h={collection.volumeChange}
                  href={`/collections/${collection.address}`}
                />
              ))}
            </div>
          )}
        </section>

        {/* Featured NFTs */}
        <section>
          <h2 className="text-2xl font-headline font-bold mb-6">Featured NFTs</h2>
          {isLoadingFeatured ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : featuredNFTs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-500">
              <p className="text-lg font-headline">No NFTs found</p>
              <p className="text-sm mt-2">Check back later</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {featuredNFTs.map((nft) => (
                <NFTCard
                  key={`${nft.collectionAddress}-${nft.id}`}
                  id={nft.id}
                  name={nft.name}
                  image={nft.image}
                  price={nft.price}
                  collectionName={nft.collectionName}
                  status={nft.status}
                  href={`/collections/${nft.collectionAddress}/${nft.id}`}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </MainLayout>
  );
}
