'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState, useEffect, useMemo } from 'react';
import { formatEther, parseEther } from 'viem';
import {
  BadgeCheck, Zap, Users, Clock, History, Heart, Share2,
  ChevronLeft, CheckCircle2, AlertCircle, Loader2, ExternalLink, Tag, X
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import StatsCard from '@/components/ui/StatsCard';
import ActivityTable from '@/components/ui/ActivityTable';
import TradingModal from '@/components/ui/TradingModal';
import EditListingModal from '@/components/ui/EditListingModal';
import { useTradingModal, useItemDetail, useItemTraits, useListings, useBids, useActivity } from '@/lib/hooks';
import { useEditOrderPrice } from '@/lib/hooks';
import { useCancelListing } from '@/lib/hooks';
import { useAccount } from 'wagmi';
import { ipfsToHttpUrl } from '@/lib/ipfs';

// Cancel listing modal component
function CancelListingModal({
  listing,
  onConfirm,
  onClose,
  isPending,
}: {
  listing: { orderKey: string; name: string; image: string; collection: string; price: string } | null;
  onConfirm: (orderKey: string) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  if (!listing) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#1a1a1a] rounded-3xl border border-outline-variant/20 shadow-2xl p-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-headline font-bold">Cancel Listing</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-on-surface transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-4 p-4 bg-surface-container rounded-xl mb-6">
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
            <Image src={listing.image} alt={listing.name} width={64} height={64} className="object-cover" />
          </div>
          <div>
            <p className="font-headline font-bold">{listing.name}</p>
            <p className="text-sm text-slate-400">{listing.collection}</p>
            <p className="text-secondary font-bold mt-1">{listing.price}</p>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-6">
          Are you sure you want to cancel this listing? This action will remove your NFT from the marketplace.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-outline-variant/20 text-slate-400 font-headline font-bold hover:bg-surface-container-high transition-colors"
          >
            Keep Listing
          </button>
          <button
            onClick={() => onConfirm(listing.orderKey)}
            disabled={isPending}
            className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-400/30 text-red-400 hover:bg-red-500/20 font-headline font-bold transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Cancelling...
              </span>
            ) : 'Cancel Listing'}
          </button>
        </div>
      </div>
    </div>
  );
}

// Accept offer modal component
function AcceptOfferModal({
  offer,
  onConfirm,
  onClose,
  isPending,
}: {
  offer: { 
    bidOrderKey: string; 
    name: string; 
    image: string; 
    collection: string; 
    price: string;
    bidder: string;
  } | null;
  onConfirm: (bidOrderKey: string) => void;
  onClose: () => void;
  isPending: boolean;
}) {
  if (!offer) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[#1a1a1a] rounded-3xl border border-outline-variant/20 shadow-2xl p-8">
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-xl font-headline font-bold">Accept Offer</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-on-surface transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center gap-4 p-4 bg-surface-container rounded-xl mb-6">
          <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
            <Image src={offer.image} alt={offer.name} width={64} height={64} className="object-cover" />
          </div>
          <div>
            <p className="font-headline font-bold">{offer.name}</p>
            <p className="text-sm text-slate-400">{offer.collection}</p>
            <p className="text-green-400 font-bold mt-1">{offer.price}</p>
          </div>
        </div>
        <div className="bg-surface-container-high rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-slate-400">Bidder</span>
            <span className="text-sm font-headline font-bold">{offer.bidder}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-400">You will receive</span>
            <span className="text-lg font-headline font-bold text-green-400">{offer.price}</span>
          </div>
        </div>
        <p className="text-sm text-slate-400 mb-6">
          By accepting this offer, your NFT will be transferred to the bidder and you will receive the ETH amount.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-outline-variant/20 text-slate-400 font-headline font-bold hover:bg-surface-container-high transition-colors"
          >
            Reject
          </button>
          <button
            onClick={() => onConfirm(offer.bidOrderKey)}
            disabled={isPending}
            className="flex-1 py-3 rounded-xl bg-green-500/10 border border-green-400/30 text-green-400 hover:bg-green-500/20 font-headline font-bold transition-colors disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Accepting...
              </span>
            ) : 'Accept Offer'}
          </button>
        </div>
      </div>
    </div>
  );
}

const CHAIN_ID = 11155111; // Sepolia

export default function ItemDetailPage() {
  const params = useParams();
  const { address: walletAddress } = useAccount();
  const { modalState, openBuyModal, openBidModal, openListingModal, openAcceptOfferModal, closeModal } = useTradingModal();
  
  // Edit order hooks
  const {
    editPrice,
    isPending: isEditPending,
    isConfirming: isEditConfirming,
    isConfirmed: isEditConfirmed,
    error: editError,
    txHash: editTxHash,
    reset: resetEdit,
  } = useEditOrderPrice({ chainId: CHAIN_ID });

  // Cancel listing hooks
  const { 
    cancelListing, 
    isPending: isCancelPending, 
    isConfirming: isCancelConfirming,
    isConfirmed: isCancelConfirmed,
    reset: resetCancel,
  } = useCancelListing({ chainId: CHAIN_ID });

  const [activeTab, setActiveTab] = useState<'listings' | 'offers' | 'activity'>('listings');
  const [isFavorite, setIsFavorite] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ h: '08', m: '24', s: '11' });
  const [editTarget, setEditTarget] = useState<{
    orderKey: string;
    name: string;
    image: string;
    collection: string;
    price: string;
    collectionAddress: string;
    tokenId: string;
    expireTime: number;
    salt: string;
    full_item?: any; // Add full listing data for EditListingModal
  } | null>(null);

  // Cancel listing modal state
  const [cancelTarget, setCancelTarget] = useState<{
    orderKey: string;
    name: string;
    image: string;
    collection: string;
    price: string;
  } | null>(null);

  // Accept offer modal state
  const [acceptTarget, setAcceptTarget] = useState<{
    bidOrderKey: string;
    name: string;
    image: string;
    collection: string;
    price: string;
    bidder: string;
    collectionAddress: string;
    tokenId: string;
  } | null>(null);

  // Get address and tokenId from URL params
  const collectionAddress = params?.address as string;
  const tokenId = params?.tokenId as string;

  // Fetch item detail from API
  const { data: itemData, isLoading: isLoadingItem, error: itemError } = useItemDetail(
    collectionAddress,
    tokenId,
    CHAIN_ID
  );

  // Fetch item traits from API
  const { data: traitsData, isLoading: isLoadingTraits } = useItemTraits(
    collectionAddress,
    tokenId,
    CHAIN_ID
  );

  // Fetch listings for this specific NFT
  const { data: listingsData, isLoading: isLoadingListings } = useListings({
    chainId: CHAIN_ID,
    collectionAddr: collectionAddress,
    tokenId: tokenId,
    page: 1,
    pageSize: 20,
    sortBy: 'price',
    sortOrder: 'asc',
  });

  console.log("====listingsData===",listingsData)

  // Fetch bids for this specific NFT
  const { data: bidsData, isLoading: isLoadingBids } = useBids({
    chainId: CHAIN_ID,
    collectionAddr: collectionAddress,
    tokenId: tokenId,
    page: 1,
    pageSize: 20,
    sortBy: 'price',
    sortOrder: 'desc',
  });

  // Fetch activity history for this NFT (all events)
  const { data: activityData, isLoading: isLoadingActivity } = useActivity(
    [CHAIN_ID], // chainId array
    collectionAddress,
    tokenId,
    [], // all event types
    1,
    50, // get more history items
  );

  // Transform API data to component format
  const item = useMemo(() => {
    // Handle both direct response and nested data structure
    const result = (itemData as any)?.data?.result || (itemData as any)?.result;
    if (!result) return null;
    const listPrice = result.list_price?.toString() || '0';
    const hasListPrice = listPrice !== '0' && listPrice !== '';
    
    // Convert wei to ETH for display
    let priceInEth = '0';
    let priceDisplay = '-- ETH';
    if (hasListPrice) {
      try {
        priceInEth = formatEther(BigInt(listPrice));
        priceDisplay = `${priceInEth} ETH`;
      } catch (err) {
        console.error('Failed to convert price:', err);
        priceInEth = '0';
        priceDisplay = '-- ETH';
      }
    }
    
    return {
      id: result.token_id,
      name: result.name || `${result.collection_name || 'Unknown'} #${result.token_id}`,
      collection: result.collection_name || 'Unknown Collection',
      collectionAddress: result.collection_address,
      tokenId: result.token_id,
      image: result.image_uri ? ipfsToHttpUrl(result.image_uri) : '',
      price: priceInEth, // Price in ETH (for contracts)
      priceDisplay: priceDisplay, // Formatted price for display
      priceUsd: '', // API doesn't provide USD price
      creator: result.collection_name || 'Unknown',
      creatorAvatar: result.collection_image_uri ? ipfsToHttpUrl(result.collection_image_uri) : '',
      owner: result.owner_address ? `${result.owner_address.slice(0, 6)}...${result.owner_address.slice(-4)}` : 'Unknown',
      ownerAddress: result.owner_address,
      isOwner: walletAddress?.toLowerCase() === result.owner_address?.toLowerCase(),
      isListed: hasListPrice && result.list_expire_time > Date.now() / 1000,
      rarityRank: 0, // Not provided by API
      totalSupply: 0, // Not provided by API
      mintNumber: parseInt(result.token_id) || 0,
      network: 'Sepolia',
      description: '', // Not provided by API
      gasFee: '~0.0002 ETH',
      activeBidders: result.bid_size, // Not provided by API
      listOrderId: result.list_order_id,
      listSalt: result.list_salt,
      listMaker: result.list_maker,
      listExpireTime: result.list_expire_time,
      bidPrice: result.bid_price?.toString() || '0',
      floorPrice: result.floor_price?.toString() || '0',
    };
  }, [itemData, walletAddress]);

  // Transform traits data
  const traits = useMemo(() => {
    // Handle both direct response and nested data structure
    const result = (traitsData as any)?.data?.result || (traitsData as any)?.result;
    if (!result) return [];
    return result.map((trait: any) => ({
      type: trait.trait_type || 'Attribute',
      value: trait.value || 'Unknown',
      rarity: trait.percentage ? `${(parseFloat(trait.percentage) * 100).toFixed(1)}%` : 'N/A',
    }));
  }, [traitsData]);

  // Transform listings data to component format
  const listings = useMemo(() => {
    // Backend returns { result: [] } format
    const resultArray = (listingsData as any)?.data?.listings || [];
    if (!resultArray || resultArray.length === 0) return [];
    
    console.log('Raw listings data from API:', resultArray);
    
    return resultArray.map((listing: any) => {
      let priceInEth = '0';
      let priceDisplay = '-- ETH';
      if (listing.price && listing.price !== '0') {
        try {
          priceInEth = formatEther(BigInt(listing.price));
          priceDisplay = `${priceInEth} ETH`;
        } catch (err) {
          console.error('Failed to convert listing price:', err);
        }
      }
      
      console.log('Processing listing:', listing);
      console.log('listing.order_key:', listing.order_key);
      console.log('listing.order_id:', listing.order_id);
      
      return {
        price: priceDisplay,
        priceValue: priceInEth, // Store ETH value for buy button
        priceUsd: '', // API doesn't provide USD price
        from: listing.maker ? `${listing.maker.slice(0, 6)}...${listing.maker.slice(-4)}` : 'Unknown',
        floorDiff: 'At Floor',
        expiration: listing.expire_time 
          ? new Date(listing.expire_time * 1000).toLocaleDateString() 
          : 'Unknown',
        orderKey: listing.order_key || listing.order_id, // Try order_key first (backend field name)
        maker: listing.maker,
        marketplaceId: listing.marketplace_id,
        item_data: listing
      };
    });
  }, [listingsData]);

  // Handle edit confirmation
  const handleEditConfirm = async (newPrice: string) => {
    if (!editTarget) return;
    console.log('Editing order with new price:', editTarget)

    try {
      // Convert ETH price to wei (as string)
      const priceInWei = parseEther(newPrice).toString();
      await editPrice(editTarget.orderKey, {
        side: 0, // Listing
        saleKind: 0, // Fixed price
        maker: walletAddress || '0x0000000000000000000000000000000000000000',
        nft: {
          collection: editTarget.collectionAddress,
          tokenId: editTarget.tokenId,
          amount: 1,
        },
        price: priceInWei,
        expiry: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days from now
        salt: parseInt(editTarget.salt) || Date.now(),
      }, newPrice);
    } catch (err) {
      console.error('Failed to edit order:', err);
    }
  };

  // Reset edit state after success
  useEffect(() => {
    if (isEditConfirmed && editTxHash) {
      setEditTarget(null);
      resetEdit();
    }
  }, [isEditConfirmed, editTxHash, resetEdit]);

  // Handle cancel listing
  const handleCancelConfirm = async (orderKey: string) => {
    console.log('Canceling order with order key:', orderKey);

    try {
      await cancelListing(orderKey);
    } catch (error) {
      console.error('Cancel failed:', error);
    }
  };

  // Reset cancel state after success
  useEffect(() => {
    if (isCancelConfirmed) {
      setCancelTarget(null);
      resetCancel();
    }
  }, [isCancelConfirmed, resetCancel]);

  // Handle accept offer - owner accepts a bid by creating matching sell order
  const handleAcceptOffer = async (bidOrderKey: string) => {
    console.log('=== handleAcceptOffer Called ===');
    console.log('Bid Order Key:', bidOrderKey);
    console.log('Accept Target:', acceptTarget);
 
    try {
      // Use the new accept offer modal
      console.log('Calling openAcceptOfferModal with:');
      console.log('  collectionAddress:', acceptTarget!.collectionAddress);
      console.log('  tokenId:', acceptTarget!.tokenId);
      console.log('  bidOrderKey:', bidOrderKey);
      console.log('  price:', acceptTarget!.price);
      
      openAcceptOfferModal(
        acceptTarget!.collectionAddress,
        acceptTarget!.tokenId,
        bidOrderKey,
        acceptTarget!.price  // This is the bid price
      );
      
      // Close the accept modal
      setAcceptTarget(null);
    } catch (error) {
      console.error('Accept offer failed:', error);
    }
  };

  // Build offers (bids) from API data
  const offers = useMemo(() => {
    // Backend returns { result: [] } format
    const resultArray = (bidsData as any)?.data?.bids || [];
    if (!resultArray || resultArray.length === 0) return [];
    
    return resultArray.map((bid: any) => ({
      price: bid.price ? `${formatEther(BigInt(bid.price))} ETH` : '-- ETH',
      priceValue: bid.price?.toString() || '0',
      priceUsd: '', // API doesn't provide USD price
      from: bid.maker ? `${bid.maker.slice(0, 6)}...${bid.maker.slice(-4)}` : 'Unknown',
      expiration: bid.expiry 
        ? new Date(bid.expiry * 1000).toLocaleDateString() 
        : 'Unknown',
      orderKey: bid.order_key,
      bidder: bid.maker,
      bidType: bid.bid_type,
      size: bid.bid_size,
      unfilled: bid.bid_unfilled,
    }));
  }, [bidsData]);

  // 倒计时效果
  useEffect(() => {
    if (!item?.listExpireTime) return;
    
    const updateTimeLeft = () => {
      const now = Date.now() / 1000;
      const diff = item.listExpireTime - now;
      
      if (diff <= 0) {
        setTimeLeft({ h: '00', m: '00', s: '00' });
        return;
      }
      
      const h = Math.floor(diff / 3600);
      const m = Math.floor((diff % 3600) / 60);
      const s = Math.floor(diff % 60);
      
      setTimeLeft({
        h: String(h).padStart(2, '0'),
        m: String(m).padStart(2, '0'),
        s: String(s).padStart(2, '0'),
      });
    };
    
    updateTimeLeft();
    const timer = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [item?.listExpireTime]);

  // Loading state
  if (isLoadingItem) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </MainLayout>
    );
  }

  // Error state
  if (itemError || !item) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 py-24 text-center">
          <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
          <h2 className="text-xl font-headline font-bold mb-2">Failed to load NFT</h2>
          <p className="text-slate-400">{itemError?.message || 'Item not found'}</p>
        </div>
      </MainLayout>
    );
  }

  // Determine if current user is the owner
  const isOwner = item.isOwner;

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/collections" className="hover:text-primary transition-colors">Collections</Link>
          <span>/</span>
          <Link href={`/collections?collection=${item.collectionAddress}`} className="hover:text-primary transition-colors">
            {item.collection}
          </Link>
          <span>/</span>
          <span className="text-on-surface">#{item.tokenId}</span>
        </div>

        {/* Hero Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Asset Display */}
          <div className="lg:col-span-7 space-y-6">
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-secondary/20 blur-2xl opacity-50 group-hover:opacity-100 transition duration-1000" />
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-surface-container-low">
                <Image src={item.image} alt={item.name} fill className="object-cover" />
                {/* Top actions */}
                <div className="absolute top-4 right-4 flex gap-2">
                  <button
                    onClick={() => setIsFavorite(!isFavorite)}
                    className="p-2.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/70 transition-all"
                  >
                    <Heart className={`w-5 h-5 ${isFavorite ? 'text-red-400 fill-red-400' : 'text-white'}`} />
                  </button>
                  <button className="p-2.5 rounded-xl bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/70 transition-all">
                    <Share2 className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <StatsCard label="Rarity Rank" value={`#${item.rarityRank}`} subValue={`/ ${item.totalSupply.toLocaleString()}`} subValueColor="neutral" />
              <StatsCard label="Mint Number" value={`#${item.mintNumber}`} />
              <StatsCard label="Network" value={item.network} icon={<Zap className="w-4 h-4" />} />
            </div>

            {/* Traits */}
            <div className="grid grid-cols-2 gap-3">
              {isLoadingTraits ? (
                <div className="col-span-2 flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : traits.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-slate-500 text-sm">
                  No traits available
                </div>
              ) : (
                traits.map((trait: any, index: number) => (
                  <div key={index} className="p-4 rounded-xl bg-surface-container-high/50 border border-outline-variant/10 hover:border-primary/20 transition-colors">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-label">{trait.type}</span>
                    <p className="text-sm font-bold text-primary mt-1">{trait.value}</p>
                    <p className="text-[10px] text-slate-500">{trait.rarity} have this trait</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Right: Trade Panel */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Title & Creator */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-secondary font-label text-sm font-medium">
                <BadgeCheck className="w-4 h-4" /> {item.collection}
              </div>
              <h1 className="text-4xl font-headline font-extrabold tracking-tight text-on-background">
                {item.name}
              </h1>
              <div className="flex items-center gap-4 pt-1">
                <div className="flex items-center gap-2 bg-surface-container-high px-3 py-1.5 rounded-full border border-outline-variant/10">
                  <Image src={item.creatorAvatar} alt={item.creator} width={24} height={24} className="rounded-full" />
                  <span className="text-xs font-medium">@{item.creator}</span>
                </div>
                <span className="text-slate-500 text-xs tracking-wide">OWNED BY {item.owner}</span>
              </div>
            </div>

            {/* Price + Trading Card */}
            <div className="p-6 rounded-3xl bg-surface-container-low border border-outline-variant/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/10 blur-[60px] pointer-events-none" />
              <div className="space-y-5 relative z-10">
                {/* Price row */}
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-500 font-label uppercase tracking-widest mb-1">Current Price</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-headline font-bold text-on-surface">{item.priceDisplay}</span>
                      {item.priceUsd && <span className="text-slate-400 font-body text-sm">{item.priceUsd}</span>}
                    </div>
                  </div>
                  {item.isListed && (
                    <div className="text-right">
                      <p className="text-xs text-slate-500 font-label uppercase tracking-widest mb-1">Ending In</p>
                      <p className="font-headline font-bold text-secondary font-mono">
                        {timeLeft.h}h : {timeLeft.m}m : {timeLeft.s}s
                      </p>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                {item.isOwner ? (
                  // 拥有者操作
                  <div className="space-y-3">
                    {item.isListed ? (
                      // 已挂单 - 显示取消/修改
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => {
                            // Find the listing in the listings array
                            console.log('=== Edit Button Clicked ===');
                            console.log('item.listOrderId:', item.listOrderId);
                            console.log('All listings:', listings);
                            const listing = listings.find((l: any) => l.orderKey === item.listOrderId);
                            console.log('Found listing:', listing);
                            if (listing) {
                              setEditTarget({
                                orderKey: item.listOrderId || '',
                                name: item.name,
                                image: item.image,
                                collection: item.collection,
                                price: item.priceDisplay,
                                collectionAddress: item.collectionAddress,
                                tokenId: item.tokenId,
                                expireTime: item.listExpireTime || 0,
                                salt: item.listSalt || '0',
                                full_item: listing, // Pass full listing data
                              });
                            } else {
                              console.error('Listing not found for orderKey:', item.listOrderId);
                            }
                          }}
                          className="bg-primary text-on-primary font-headline font-bold py-4 rounded-2xl hover:brightness-110 transition-all active:scale-[0.98] shadow-lg shadow-primary/20"
                        >
                          Edit Price
                        </button>
                        <button
                          onClick={() => {
                            // Find the listing in the listings array
                            console.log('=== Cancel Button Clicked ===');
                            console.log('item:', item);
                            console.log('item.listOrderId:', item.listOrderId);
                            console.log('All listings:', listings);
                            const listing = listings.find((l: any) => l.orderKey === item.listOrderId);
                            console.log('Found listing:', listing);
                            if (listing) {
                              setCancelTarget({
                                orderKey: item.listOrderId || '',
                                name: item.name,
                                image: item.image,
                                collection: item.collection,
                                price: item.priceDisplay,
                              });
                            } else {
                              console.error('Listing not found for orderKey:', item.listOrderId);
                            }
                          }}
                          className="bg-surface-variant/40 border border-red-400/30 text-red-400 font-headline font-bold py-4 rounded-2xl hover:bg-red-400/10 transition-all active:scale-[0.98]"
                        >
                          Cancel Listing
                        </button>
                      </div>
                    ) : (
                      // 未挂单 - 显示上架按钮
                      <button
                        onClick={() => openListingModal(item.collectionAddress, item.tokenId, item.price)}
                        className="w-full bg-primary text-on-primary font-headline font-bold py-4 rounded-2xl hover:brightness-110 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                      >
                        <Tag className="w-5 h-5" />
                        List for Sale
                      </button>
                    )}
                  </div>
                ) : (
                  // 非拥有者 - 买入/出价
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => openBuyModal(item.collectionAddress, item.tokenId, item.price)}
                      disabled={!item.isListed}
                      className="bg-primary text-on-primary font-headline font-bold py-4 rounded-2xl hover:brightness-110 transition-all active:scale-[0.98] shadow-lg shadow-primary/20 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Buy Now
                    </button>
                    <button
                      onClick={() => openBidModal(item.collectionAddress, item.tokenId)}
                      disabled={item.isListed && item.listMaker?.toLowerCase() === walletAddress?.toLowerCase()}
                      className="bg-surface-variant/40 border border-secondary/30 text-secondary font-headline font-bold py-4 rounded-2xl hover:bg-secondary/10 transition-all active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Make Offer
                    </button>
                  </div>
                )}

                {/* Gas + bidders info */}
                <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-outline-variant/10">
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Gas fee: {item.gasFee}
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    {item.activeBidders} Active Bidders
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="glass-panel p-6 rounded-2xl border border-outline-variant/5">
              <h4 className="font-headline font-bold text-sm mb-3 text-on-surface">Description</h4>
              <p className="text-sm text-slate-400 leading-relaxed font-body">{item.description}</p>
            </div>

            {/* Contract Info */}
            <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/10 space-y-2 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Contract Address</span>
                <a
                  href={`https://sepolia.etherscan.io/address/${item.collectionAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-primary hover:underline"
                >
                  {item.collectionAddress.slice(0, 10)}...{item.collectionAddress.slice(-8)}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Token ID</span>
                <span className="text-on-surface font-bold">#{item.tokenId}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Token Standard</span>
                <span className="text-on-surface">ERC-721</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Chain</span>
                <span className="text-on-surface">Sepolia Testnet</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Tabs: Listings / Offers / Activity */}
        <div className="mt-16 bg-surface-container-low rounded-3xl border border-outline-variant/5 overflow-hidden">
          {/* Tab Nav */}
          <div className="flex border-b border-outline-variant/10">
            {[
              { id: 'listings', label: `Listings (${listings.length})` },
              { id: 'offers', label: `Offers (${offers.length})` },
              { id: 'activity', label: 'Activity' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-8 py-4 font-headline font-bold text-sm transition-colors border-b-2 ${
                  activeTab === tab.id
                    ? 'text-primary border-primary'
                    : 'text-slate-500 border-transparent hover:text-on-surface'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Listings Tab */}
          {activeTab === 'listings' && (
            <div className="p-8">
              {isLoadingListings ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : listings.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No active listings</div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-5 text-[10px] text-slate-500 uppercase tracking-widest font-label pb-2 border-b border-outline-variant/10">
                    <span>Price</span>
                    <span>USD</span>
                    <span>From</span>
                    <span className="text-center">Floor Diff</span>
                    <span className="text-right">Action</span>
                  </div>
                  {listings.map((listing: any, i: number) => (
                    <div key={`${listing.orderKey}-${i}`} className="group grid grid-cols-5 items-center py-3 hover:bg-white/5 rounded-xl px-2 transition-all">
                      <span className="font-bold text-secondary">{listing.price}</span>
                      <span className="text-sm text-slate-400">{listing.priceUsd || '--'}</span>
                      <span className="text-xs text-slate-400">{listing.from}</span>
                      <div className="flex justify-center">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          listing.floorDiff === 'At Floor' ? 'bg-primary/10 text-primary' : 'bg-surface-container-high text-slate-400'
                        }`}>
                          {listing.floorDiff}
                        </span>
                      </div>
                      <div className="flex justify-end">
                        {!item.isOwner && (
                          <button
                            onClick={() => {
                              console.log('=== Buy Button Clicked ===');
                              console.log('Listing data:', listing);
                              console.log('Maker address:', listing.maker);
                              console.log('Price value:', listing.priceValue);
                              
                              // Validate maker address
                              if (!listing.maker || listing.maker === '0x0000000000000000000000000000000000000000') {
                                console.error('Invalid maker address in listing');
                                alert('Error: Listing does not have a valid seller address');
                                return;
                              }
                              
                              // Validate price
                              if (!listing.priceValue || listing.priceValue === '0' || isNaN(parseFloat(listing.priceValue))) {
                                console.error('Invalid price in listing');
                                alert('Error: Listing has invalid price');
                                return;
                              }
                              
                              // Construct a proper sell order from the listing data
                              const sellOrder = {
                                side: 0, // OrderSide.List
                                saleKind: 1, // SaleKind.FixedPriceForItem
                                maker: listing.item_data.maker,
                                nft: {
                                  tokenId: listing.item_data.token_id,
                                  collection: listing.item_data.collection_addr,
                                  amount: 1,
                                },
                                price: (BigInt(Math.floor(parseFloat(listing.priceValue) * 1e18))).toString(),
                                expiry: listing.item_data.expiry, // 7 days
                                salt: listing.item_data.salt,
                              };
                              
                              console.log('Constructed sellOrder:', sellOrder);
                              console.log('Opening buy modal with sellOrder...');
                              
                              // Open modal with the constructed sell order
                              openBuyModal(item.collectionAddress, item.tokenId, listing.priceValue, sellOrder);
                            }}
                            className="px-4 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-on-primary text-xs font-headline font-bold transition-all"
                          >
                            Buy
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Offers Tab */}
          {activeTab === 'offers' && (
            <div className="p-8">
              {isLoadingBids ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : offers.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No active offers</div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-5 text-[10px] text-slate-500 uppercase tracking-widest font-label pb-2 border-b border-outline-variant/10">
                    <span>Price</span>
                    <span>USD</span>
                    <span>From</span>
                    <span className="text-center">Expiration</span>
                    <span className="text-right">Action</span>
                  </div>
                  {offers.map((offer: any, i: number) => (
                    <div key={`${offer.orderKey}-${i}`} className="group grid grid-cols-5 items-center py-3 hover:bg-white/5 rounded-xl px-2 transition-all">
                      <span className="font-bold text-secondary">{offer.price}</span>
                      <span className="text-sm text-slate-400">{offer.priceUsd || '--'}</span>
                      <span className="text-xs text-slate-400">{offer.from}</span>
                      <div className="flex justify-center">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{offer.expiration}
                        </span>
                      </div>
                      <div className="flex justify-end gap-2">
                        {item.isOwner && (
                          // 拥有者可以接受出价
                          <button
                            onClick={() => {
                              const bidOrderKey = offer.orderKey;
                              console.log('=== Accept Button Clicked ===');
                              console.log('Offer data:', offer);
                              console.log('Bid Order Key:', bidOrderKey);
                              if (bidOrderKey) {
                                setAcceptTarget({
                                  bidOrderKey,
                                  name: item.name,
                                  image: item.image,
                                  collection: item.collection,
                                  price: offer.price,
                                  bidder: offer.from,
                                  collectionAddress: item.collectionAddress,
                                  tokenId: item.tokenId,
                                });
                                console.log('AcceptTarget set successfully');
                              } else {
                                console.error('No order key found for this offer');
                              }
                            }}
                            className="px-4 py-1.5 rounded-lg bg-green-500/10 text-green-400 hover:bg-green-500/20 text-xs font-headline font-bold transition-all"
                          >
                            Accept
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {/* 快速出价按钮 */}
              {!item.isOwner && (
                <div className="mt-6 pt-6 border-t border-outline-variant/10">
                  <button
                    onClick={() => openBidModal(item.collectionAddress, item.tokenId)}
                    className="px-6 py-3 rounded-xl border border-secondary/30 text-secondary font-headline font-bold hover:bg-secondary/10 transition-colors text-sm"
                  >
                    + Make an Offer
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === 'activity' && (
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <History className="text-primary w-5 h-5" />
                <h3 className="font-headline font-bold text-lg">Item Activity</h3>
              </div>
              
              {isLoadingActivity ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : !activityData || (activityData as any)?.data?.result?.length === 0 ? (
                <div className="text-center py-12 text-slate-500">No activity recorded yet</div>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-6 text-[10px] text-slate-500 uppercase tracking-widest font-label pb-2 border-b border-outline-variant/10">
                    <span>Event</span>
                    <span>Price</span>
                    <span>From</span>
                    <span>To</span>
                    <span className="text-center">Time</span>
                    <span className="text-right">Tx</span>
                  </div>
                  {(activityData as any)?.data?.result.map((event: any, i: number) => (
                    <div key={`${event.token_id}-${event.event_time}-${i}`} className="group grid grid-cols-6 items-center py-3 hover:bg-white/5 rounded-xl px-2 transition-all">
                      <div className="flex items-center gap-2">
                        <BadgeCheck className={`w-4 h-4 ${
                          event.event_type === 'sale' ? 'text-green-400' :
                          event.event_type === 'listing' ? 'text-blue-400' :
                          event.event_type === 'bid' ? 'text-purple-400' :
                          'text-gray-400'
                        }`} />
                        <span className="text-xs capitalize text-slate-300">{event.event_type}</span>
                      </div>
                      <span className="font-bold text-secondary">{event.price ? `${formatEther(BigInt(event.price))} ETH` : '--'}</span>
                      <span className="text-xs text-slate-400">{event.maker ? `${event.maker.slice(0, 6)}...${event.maker.slice(-4)}` : '--'}</span>
                      <span className="text-xs text-slate-400">{event.taker ? `${event.taker.slice(0, 6)}...${event.taker.slice(-4)}` : '--'}</span>
                      <div className="flex justify-center">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3 h-3" />{new Date(event.event_time * 1000).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-end">
                        {event.tx_hash ? (
                          <a
                            href={`https://sepolia.etherscan.io/tx/${event.tx_hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-secondary transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        ) : (
                          <span className="text-slate-600">--</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Price History Chart */}
        <div className="mt-8 bg-surface-container-low rounded-3xl p-8 border border-outline-variant/5">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="font-headline font-bold text-xl">Price History</h3>
              <p className="text-sm text-slate-500">Trading performance over time</p>
            </div>
            <div className="flex gap-2">
              {['7D', '30D', 'ALL'].map(range => (
                <button
                  key={range}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${range === '7D' ? 'bg-surface-container-highest text-primary' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  {range}
                </button>
              ))}
            </div>
          </div>
          <div className="relative h-48 w-full">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 800 160">
              <defs>
                <linearGradient id="chartGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ddb7ff" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#ddb7ff" stopOpacity="0" />
                </linearGradient>
              </defs>
              <path d="M0,140 L100,120 L200,130 L300,80 L400,100 L500,50 L600,65 L700,30 L800,45 L800,160 L0,160 Z" fill="url(#chartGradient)" />
              <path d="M0,140 L100,120 L200,130 L300,80 L400,100 L500,50 L600,65 L700,30 L800,45" fill="none" stroke="#ddb7ff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="700" cy="30" r="5" fill="#ddb7ff" className="animate-pulse" />
            </svg>
          </div>
        </div>
      </div>

      {/* Trading Modal */}
      <TradingModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        collectionAddress={modalState.collectionAddress}
        tokenId={modalState.tokenId}
        price={modalState.price}
        sellOrder={modalState.sellOrder} // Pass the sell order from hook
        bidOrderKey={modalState.bidOrderKey}
        onClose={closeModal}
        chainId={CHAIN_ID}
        itemName={item?.name} // Pass NFT name
        itemImage={item?.image} // Pass NFT image
      />

      {/* Edit Listing Modal */}
      <EditListingModal
        isOpen={!!editTarget}
        listing={editTarget ? {
          orderKey: editTarget.orderKey,
          name: editTarget.name,
          image: editTarget.image,
          collection: editTarget.collection,
          price: editTarget.price,
          collectionAddress: editTarget.collectionAddress,
          tokenId: editTarget.tokenId,
        } : null}
        isPending={isEditPending}
        isConfirming={isEditConfirming}
        isConfirmed={isEditConfirmed}
        error={editError}
        onConfirm={handleEditConfirm}
        onClose={() => setEditTarget(null)}
      />

      {/* Cancel Listing Modal */}
      <CancelListingModal
        listing={cancelTarget}
        onConfirm={handleCancelConfirm}
        onClose={() => setCancelTarget(null)}
        isPending={isCancelPending || isCancelConfirming}
      />

      {/* Accept Offer Modal */}
      <AcceptOfferModal
        offer={acceptTarget}
        onConfirm={handleAcceptOffer}
        onClose={() => setAcceptTarget(null)}
        isPending={false}
      />
    </MainLayout>
  );
}
