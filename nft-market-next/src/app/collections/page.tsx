'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Filter, ChevronDown, Loader2, ShoppingCart, Tag } from 'lucide-react';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { ipfsToHttpUrl } from '@/lib/ipfs';
import MainLayout from '@/components/layout/MainLayout';
import CollectionCard from '@/components/ui/CollectionCard';
import TradingModal from '@/components/ui/TradingModal';
import { useAllItems, useBuyNFT } from '@/lib/hooks';
import { OrderSide, SaleKind, generateSalt } from '@/lib/contracts/types';

const CHAIN_ID = 11155111; // Sepolia

// Trading modal state interface
interface ModalState {
  isOpen: boolean;
  mode: 'buy' | 'bid' | 'listing' | null; // Add 'listing' mode
  collectionAddress?: string;
  tokenId?: string;
  price?: string;
  sellOrder?: any; // For buy mode - the listing order
  itemName?: string;
  itemImage?: string;
}

const categories = ['All'];

export default function CollectionsPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [timeRange, setTimeRange] = useState<'24h' | '7d' | '30d'>('24h');
  const [sortBy, setSortBy] = useState<'volume' | 'floorPrice' | 'recent'>('volume');
  
  // New trading modal state
  const [modalState, setModalState] = useState<ModalState>({
    isOpen: false,
    mode: null,
  });
  
  const { address: userAddress } = useAccount();
  
  // Hook for buying NFT - now provides both buyNFT and buyNFTByOrderKey
  const { buyNFT, buyNFTByOrderKey, isPending, isConfirming, isConfirmed, error, reset } = useBuyNFT({
    chainId: CHAIN_ID,
  });
  
  // Fetch all NFT items from API (not limited to specific user)
  const {
    data: allItemsData,
    isLoading: isLoadingItems,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAllItems({
    chain_id: [CHAIN_ID],
    pageSize: 50,
  });
  
  // Transform API data to match CollectionCard props with sorting
  const collections = useMemo(() => {
    const items = allItemsData?.pages?.flatMap((page: any) => page?.data?.result || []) || [];
    
    const mapped = items.map((item: any) => ({
      id: item.collection_address || item.collectionAddress,
      name: item.name || 'Unknown Collection',
      image: item.image_url ? ipfsToHttpUrl(item.image_url) : '',
      creator: item.owner || 'Unknown', // Use owner field from API
      isVerified: !!item.is_verified || !!item.isVerified,
      floorPrice: item.list_price && item.list_price !== '0'
        ? `${Number(formatEther(BigInt(item.list_price))).toFixed(4)} ETH`
        : '-- ETH',
      floorPriceValue: item.list_price ? parseFloat(formatEther(BigInt(item.list_price))) : 0,
      volume: item.last_sell_price && item.last_sell_price !== '0'
        ? `${Number(formatEther(BigInt(item.last_sell_price))).toFixed(2)} ETH`
        : '-- ETH',
      volumeValue: item.last_sell_price ? parseFloat(formatEther(BigInt(item.last_sell_price))) : 0,
      change24h: 0, // Will be calculated from sales data
      // Store full item data for purchase and navigation
      _fullItem: item,
      // Store collection address and tokenId for navigation
      collectionAddress: item.collection_address || item.collectionAddress,
      tokenId: item.token_id || item.tokenId,
    }));
    
    // Sort based on selected criteria
    return [...mapped].sort((a, b) => {
      if (sortBy === 'volume') {
        return b.volumeValue - a.volumeValue;
      } else if (sortBy === 'floorPrice') {
        return b.floorPriceValue - a.floorPriceValue;
      } else {
        return 0; // Default order
      }
    });
  }, [allItemsData, sortBy]);
  
  // Handle card click - navigate to item detail page
  const handleCardClick = (collection: any) => {
    const address = collection.collectionAddress || collection._fullItem?.collection_address || collection._fullItem?.collectionAddress;
    const tokenId = collection.tokenId || collection._fullItem?.token_id || collection._fullItem?.tokenId;
    
    if (address && tokenId) {
      router.push(`/collections/${address}/${tokenId}`);
    }
  };

  // Handle buy button click - opens TradingModal
  const handleBuyClick = (e: React.MouseEvent, item: any) => {

    e.stopPropagation(); // Prevent card click
    if (!userAddress) {
      alert('Please connect your wallet first');
      return;
    }
    
    const listingOrder = {
      side: OrderSide.List,
      saleKind: SaleKind.FixedPriceForItem,
      maker: item.owner || item.maker,
      nft: {
        tokenId: item.token_id || item.tokenId,
        collection: item.collection_address || item.collectionAddress,
        amount: 1,
      },
      price: item.list_price || '0',
      expiry: item.list_expire_time,
      salt: item.list_salt,
    };
    
    setModalState({
      isOpen: true,
      mode: 'buy',
      collectionAddress: item.collection_address || item.collectionAddress,
      tokenId: item.token_id || item.tokenId,
      price: item.list_price ? `${Number(formatEther(BigInt(item.list_price))).toFixed(4)}` : '',
      sellOrder: listingOrder,
      itemName: `${item.name || 'Unknown'} #${item.token_id || item.tokenId}`,
      itemImage: item.image_url ? ipfsToHttpUrl(item.image_url) : '',
    });
  };
  
  // Handle make offer button click
  const handleMakeOfferClick = (e: React.MouseEvent, item: any) => {
    e.stopPropagation(); // Prevent card click
    if (!userAddress) {
      alert('Please connect your wallet first');
      return;
    }
    console.log('Making offer for item:', item);
    
    setModalState({
      isOpen: true,
      mode: 'bid',
      collectionAddress: item.collection_address || item.collectionAddress,
      tokenId: item.token_id || item.tokenId,
      price: '', // User will input price
      itemName: `${item.name || 'Unknown'} #${item.token_id || item.tokenId}`,
      itemImage: item.image_url ? ipfsToHttpUrl(item.image_url) : '',
    });
  };
  
  // Close modal
  const closeModal = () => {
    setModalState(prev => ({ ...prev, isOpen: false }));
  };
  
  // Reset modal state when transaction completes
  useEffect(() => {
    if (isConfirmed && !modalState.isOpen) {
      // Transaction completed successfully
      console.log('Transaction confirmed');
    }
  }, [isConfirmed]);

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
            {/* Time Range Filter */}
            <div className="flex bg-surface-container-low p-1 rounded-full border border-outline-variant/10">
              <button 
                onClick={() => setTimeRange('24h')}
                className={`px-4 py-1.5 rounded-full text-xs font-headline font-bold transition-colors ${
                  timeRange === '24h'
                    ? 'bg-surface-container-high text-on-surface'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                24h
              </button>
              <button 
                onClick={() => setTimeRange('7d')}
                className={`px-4 py-1.5 rounded-full text-xs font-headline font-bold transition-colors ${
                  timeRange === '7d'
                    ? 'bg-surface-container-high text-on-surface'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                7d
              </button>
              <button 
                onClick={() => setTimeRange('30d')}
                className={`px-4 py-1.5 rounded-full text-xs font-headline font-bold transition-colors ${
                  timeRange === '30d'
                    ? 'bg-surface-container-high text-on-surface'
                    : 'text-outline hover:text-on-surface'
                }`}
              >
                30d
              </button>
            </div>
            
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'volume' | 'floorPrice' | 'recent')}
              className="px-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm font-headline font-bold text-on-surface focus:outline-none focus:border-primary cursor-pointer"
            >
              <option value="volume">Sort by: Volume</option>
              <option value="floorPrice">Sort by: Floor Price</option>
              <option value="recent">Sort by: Recent</option>
            </select>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-xl text-sm hover:bg-surface-container-high transition-all">
              <Filter className="w-4 h-4" /> Filters
            </button>
          </div>
        </div>

        {/* Collections Grid */}
        {isLoadingItems ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <p className="text-lg font-headline">No collections found</p>
            <p className="text-sm mt-2">Check back later for trending collections</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {collections.map((collection) => (
              <div 
                key={collection.id} 
                className="relative group cursor-pointer"
                onClick={() => handleCardClick(collection)}
              >
                <CollectionCard
                  id={collection.id}
                  name={collection.name}
                  image={collection.image}
                  creator={collection.creator}
                  isVerified={collection.isVerified}
                  floorPrice={collection.floorPrice}
                  volume={collection.volume}
                  change24h={collection.change24h}
                  href={`/collections/${collection.collectionAddress}/${collection.tokenId}`}
                />
                {/* Buy and Make Offer Buttons Overlay - For NON-OWNERS */}
                {/* Show Buy button only if there's a valid listing price */}
                {collection._fullItem?.list_price && collection._fullItem?.list_price !== '0' && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-center gap-3 rounded-xl">
                    <button
                      onClick={(e) => handleBuyClick(e, collection._fullItem)}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-headline font-bold hover:bg-primary/90 transition-all transform hover:scale-105"
                      disabled={isPending || isConfirming}
                    >
                      <ShoppingCart className="w-5 h-5" />
                      {isPending || isConfirming ? 'Processing...' : `Buy for ${collection.floorPrice}`}
                    </button>
                    {/* Only show Make Offer if user is NOT the owner */}
                    {userAddress && 
                     collection._fullItem?.owner && 
                     collection._fullItem.owner.toLowerCase() !== userAddress.toLowerCase() && (
                      <button
                        onClick={(e) => handleMakeOfferClick(e, collection._fullItem)}
                        className="flex items-center gap-2 px-6 py-3 bg-surface-container-high text-on-surface border border-outline-variant/20 rounded-full font-headline font-bold hover:bg-surface-bright transition-all transform hover:scale-105"
                        disabled={isPending || isConfirming}
                      >
                        <Tag className="w-5 h-5" />
                        Make Offer
                      </button>
                    )}
                  </div>
                )}
                
                {/* Show Make Offer only when there's no listing (item not for sale directly) - For NON-OWNERS */}
                {(!collection._fullItem?.list_price || collection._fullItem?.list_price === '0') && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-xl">
                    {/* Only show Make Offer if user is NOT the owner */}
                    {userAddress && 
                     collection._fullItem?.owner && 
                     collection._fullItem.owner.toLowerCase() !== userAddress.toLowerCase() && (
                      <button
                        onClick={(e) => handleMakeOfferClick(e, collection._fullItem)}
                        className="flex items-center gap-2 px-6 py-3 bg-surface-container-high text-on-surface border border-outline-variant/20 rounded-full font-headline font-bold hover:bg-surface-bright transition-all transform hover:scale-105"
                        disabled={isPending || isConfirming}
                      >
                        <Tag className="w-5 h-5" />
                        Make Offer
                      </button>
                    )}
                  </div>
                )}
                
                {/* Show List for Sale button - For OWNERS ONLY */}
                {userAddress && 
                 collection._fullItem?.owner && 
                 collection._fullItem.owner.toLowerCase() === userAddress.toLowerCase() && (
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center rounded-xl">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open listing modal for owner to list the NFT
                        setModalState({
                          isOpen: true,
                          mode: 'listing',
                          collectionAddress: collection.collectionAddress,
                          tokenId: collection.tokenId,
                          price: '', // Owner will input price
                          itemName: `${collection.name} #${collection.tokenId}`,
                          itemImage: collection.image,
                        });
                      }}
                      className="flex items-center gap-2 px-6 py-3 bg-primary text-on-primary rounded-full font-headline font-bold hover:bg-primary/90 transition-all transform hover:scale-105"
                      disabled={isPending || isConfirming}
                    >
                      <Tag className="w-5 h-5" />
                      List for Sale
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Load More */}
        <div className="mt-16 flex justify-center">
          {hasNextPage ? (
            <button 
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="flex items-center gap-3 px-10 py-4 bg-surface-container-high border border-outline-variant/15 rounded-full font-headline font-bold hover:bg-surface-bright transition-all group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetchingNextPage ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  Load More Collections
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          ) : (
            <p className="text-slate-500 text-sm">No more collections to load</p>
          )}
        </div>
      </div>
      
      {/* Trading Modal - unified modal for buy/bid operations */}
      <TradingModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        collectionAddress={modalState.collectionAddress}
        tokenId={modalState.tokenId}
        price={modalState.price}
        sellOrder={modalState.sellOrder}
        onClose={closeModal}
        chainId={CHAIN_ID}
        itemName={modalState.itemName}
        itemImage={modalState.itemImage}
      />
    </MainLayout>
  );
}
