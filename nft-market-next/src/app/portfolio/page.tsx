'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import {
  Copy, Share2, BadgeCheck, Loader2, ExternalLink, AlertCircle, Tag, ShoppingCart, Clock, X
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import ActivityTable from '@/components/ui/ActivityTable';
import TradingModal from '@/components/ui/TradingModal';
import EditListingModal from '@/components/ui/EditListingModal';
import { useTradingModal, useUserItems, useUserListings, useUserBids, useCancelListing } from '@/lib/hooks';
import { useEditOrderPrice } from '@/lib/hooks';
import { useAccount, useBalance } from 'wagmi';
import { clsx } from 'clsx';
import { getUserCollections, getPortfolioOverview } from '@/lib/api/portfolio';
import { usePortfolioOverview } from '@/lib/hooks/usePortfolio';
import type { PortfolioOverview } from '@/types';
import { parseEther, formatEther } from 'viem';
import { useActivities } from '@/lib/hooks';
import { ipfsToHttpUrl } from '@/lib/ipfs';

const CHAIN_ID = 11155111; // Sepolia

// 取消挂单确认弹窗
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

export default function PortfolioPage() {
  const [activeTab, setActiveTab] = useState('Owned');
  const [cancelTarget, setCancelTarget] = useState<{ orderKey: string; name: string; image: string; collection: string; price: string } | null>(null);
  const [editTarget, setEditTarget] = useState<{ orderKey: string; name: string; image: string; collection: string; price: string; collectionAddress: string; tokenId: string } | null>(null);
  const { address: walletAddress } = useAccount();
  const { data: balanceData } = useBalance({ address: walletAddress });

  // Trading modal
  const {
    modalState,
    openListingModal,
    openBidModal,
    closeModal,
  } = useTradingModal();

  // Edit order hook
  const {
    editPrice,
    isPending: isEditPending,
    isConfirming: isEditConfirming,
    isConfirmed: isEditConfirmed,
    error: editError,
    txHash: editTxHash,
    reset: resetEdit,
  } = useEditOrderPrice({ chainId: CHAIN_ID });

  // Cancel listing hook
  const { 
    cancelListing, 
    isPending: isCancelPending, 
    isConfirming: isCancelConfirming,
    isConfirmed: isCancelConfirmed,
    reset: resetCancel,
  } = useCancelListing({ chainId: CHAIN_ID });

  // Handle edit confirmation
  const handleEditConfirm = async (newPrice: string) => {
    if (!editTarget) return;
    console.log('Editing order with new price:', editTarget)

    try {
      // Convert ETH price to wei
      const priceInWei = parseEther(newPrice).toString();
      await editPrice(editTarget?.full_item?.list_order_id, {
        side: 0, // Listing
        saleKind: 0, // Fixed price
        maker: walletAddress || '0x0000000000000000000000000000000000000000',
        nft: {
          collection: editTarget.collectionAddress,
          tokenId: editTarget.tokenId,
          amount: 1,
        },
        price: priceInWei,
        expiry: editTarget?.full_item?.list_expire_time, // 7 days
        salt: editTarget?.full_item?.list_salt,
      }, newPrice);
    } catch (err) {
      console.error('Failed to edit order:', err);
    }
  };

  // Reset edit state after success
  useEffect(() => {
    if (isEditConfirmed && editTxHash) {
      setEditTarget(null);
      refetchItems();
      refetchListings();
      resetEdit();
    }
  }, [isEditConfirmed, editTxHash, resetEdit]);

  // Fetch user data with React Query
  const { 
    data: ownedItemsData, 
    isLoading: isLoadingItems,
    error: itemsError,
    refetch: refetchItems,
  } = useUserItems({
    user_addresses: walletAddress ? [walletAddress] : [],
    chain_id: [CHAIN_ID],
    pageSize: 20,
  });

  console.log("ownedItemsData",ownedItemsData)

  const {
    data: listingsData,
    isLoading: isLoadingListings,
    refetch: refetchListings,
  } = useUserListings({
    user_addresses: walletAddress ? [walletAddress] : [],
    chain_id: [CHAIN_ID],
    pageSize: 20,
  });

  const {
    data: bidsData,
    isLoading: isLoadingBids,
  } = useUserBids({
    user_addresses: walletAddress ? [walletAddress] : [],
    chain_id: [CHAIN_ID],
    pageSize: 20,
  });

  // Get portfolio overview
  const { data: portfolioOverview } = usePortfolioOverview(walletAddress || '') as { data: PortfolioOverview | undefined };
   
  console.log('Portfolio Overview:', portfolioOverview);
  // Fetch activities
  const { data: activitiesData } = useActivities({
    user_addresses: walletAddress ? [walletAddress] : [],
    chain_id: [CHAIN_ID],
    pageSize: 10,
  });


  console.log('Activities Data:', activitiesData);

  // Get user collections
  const [collectionsCount, setCollectionsCount] = useState(0);
  useEffect(() => {
    if (walletAddress) {
      getUserCollections([walletAddress]).then(res => {
        console.log("================res======",res)
        setCollectionsCount(res?.data?.result?.collection_info.length || 0);
      }).catch(console.error);
    }
  }, [walletAddress]);

  // Handle cancel confirmed
  useEffect(() => {
    if (isCancelConfirmed) {
      setCancelTarget(null);
      refetchListings();
      resetCancel();
    }
  }, [isCancelConfirmed, refetchListings, resetCancel]);

  // Handle cancel listing
  const handleCancelConfirm = async (orderKey: string) => {
    console.log('Canceling order with order key:', orderKey);

    try {
      await cancelListing(orderKey);
    } catch (error) {
      console.error('Cancel failed:', error);
    }
  };

  // User info from wallet
  const user = {
    address: walletAddress ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}` : 'Not Connected',
    fullAddress: walletAddress || '',
    username: 'Digital Curator',
    bio: 'Digital Curator & Sovereign Collector',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
    banner: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&h=400&fit=crop',
    totalWorth: portfolioOverview?.data?.result?.total_value ? `${formatEther(BigInt(portfolioOverview.data.result.total_value))} ETH` : '-- ETH',
    walletBalance: balanceData ? `${Number(formatEther(balanceData.value)).toFixed(4)} ${balanceData.symbol}` : '0 ETH',
    nftCount: portfolioOverview?.data?.result?.total_items || ownedItemsData?.pages?.[0]?.data?.total || 0,
    isVerified: false,
  };

  // Flatten data from infinite queries
  const ownedItems = ownedItemsData?.pages.flatMap(page => page?.data?.result) || [];
  const myListings = listingsData?.pages?.flatMap(page => 
    (page as any).data?.result?.map((l: any) => ({
      id: l.id,
      name: l.name || `#${l?.tokenId}`,
      image: l.image_url ? ipfsToHttpUrl(l.image_url): "",
      collection: l.collection_name || '',
      collectionAddress: l.collection_address || '',
      tokenId: l.token_id,
      price: l.list_price ? `${Number(formatEther(BigInt(l.list_price))).toFixed(6)} ETH` : '-- ETH',
      priceUsd: l.priceUsd || '',
      expiry: l.list_expire_time ? `Expires ${new Date(l.list_expire_time).toLocaleDateString()}` : '',
      orderKey: l.list_order_id,
      status: 'active',
      full_item: l,

    })) || []
  ) || [];
  const myBids = bidsData?.pages?.flatMap(page => 
    (page as any).items?.map((b: any) => ({
      id: b.id,
      name: b.item?.name || `#${b.item?.tokenId}`,
      image: b.item?.image || '',
      collection: b.item?.collection?.name || '',
      offerPrice: b.bidPrice ? `${Number(formatEther(BigInt(b.bidPrice))).toFixed(6)} ETH` : '-- ETH',
      offerPriceUsd: b.bidPriceUsd || '',
      expiry: b.expiresAt ? `Expires ${new Date(b.expiresAt).toLocaleDateString()}` : '',
      orderKey: b.id,
    })) || []
  ) || [];
  const activities = activitiesData?.pages?.flatMap(page => page?.data?.result || []) || [];

  const tabCounts: Record<string, number> = {
    Owned: ownedItems.length,
    Listed: myListings.length,
    Offers: myBids.length,
    Activity: activities.length,
  };

  // Not connected state
  if (!walletAddress) {
    return (
      <MainLayout>
        <div className="max-w-7xl mx-auto px-10 py-12">
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <AlertCircle className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-headline">Wallet Not Connected</p>
            <p className="text-sm mt-2">Please connect your wallet to view your portfolio</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-10 py-12">
        {/* Profile Header */}
        <div className="relative mb-16">
          <div className="h-48 w-full rounded-2xl bg-gradient-to-br from-primary/20 via-surface-container-high to-secondary/10 overflow-hidden relative">
            <div
              className="absolute inset-0 opacity-30 mix-blend-overlay"
              style={{ backgroundImage: `url('${user.banner}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
            />
          </div>

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
                <h1 className="text-4xl font-headline font-bold text-on-surface tracking-tight">{user.address}</h1>
                <button className="text-slate-500 hover:text-primary transition-colors">
                  <Copy className="w-5 h-5" />
                </button>
              </div>
              <p className="text-slate-400 font-body mb-4">{user.bio}</p>
              <div className="flex gap-10">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Total Worth</p>
                  <p className="text-2xl font-headline font-bold text-secondary">{user.totalWorth}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Wallet Balance</p>
                  <p className="text-2xl font-headline font-bold text-on-surface">{user.walletBalance}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">NFTs Owned</p>
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
        <div className="flex gap-2 mb-10 border-b border-outline-variant/10">
          {['Owned', 'Listed', 'Offers', 'Activity'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-6 pb-4 font-headline font-bold tracking-tight transition-colors flex items-center gap-2',
                activeTab === tab
                  ? 'text-primary border-b-2 border-primary'
                  : 'text-slate-500 hover:text-on-surface'
              )}
            >
              {tab}
              <span className={clsx(
                'text-[10px] px-2 py-0.5 rounded-full font-bold',
                activeTab === tab ? 'bg-primary/20 text-primary' : 'bg-surface-container-high text-slate-500'
              )}>
                {tabCounts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Loading State */}
        {(isLoadingItems || isLoadingListings) && activeTab !== 'Activity' && (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}

        {/* ─── Tab: Owned ─── */}
        {activeTab === 'Owned' && !isLoadingItems && (
          <div className="grid grid-cols-12 gap-8 mb-20">
            {/* Featured Card - First NFT */}
            {ownedItems.length > 0 && ownedItems[0] && (
              <div className="col-span-12 lg:col-span-8 group relative rounded-2xl overflow-hidden bg-surface-container-low p-1">
                <div className="aspect-[21/9] w-full rounded-xl overflow-hidden relative">
                  <Image
                    src={ownedItems[0].image_url?ipfsToHttpUrl(ownedItems[0].image_url):""}
                    alt={ownedItems[0].name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low via-transparent to-transparent opacity-90" />
                  <div className="absolute bottom-6 left-8">
                    <span className="px-3 py-1 rounded-full bg-secondary/20 text-secondary text-[10px] uppercase tracking-widest font-bold backdrop-blur-md mb-3 inline-block">
                      {ownedItems[0].collection?.name}
                    </span>
                    <h3 className="text-3xl font-headline font-bold text-on-surface mb-1">{ownedItems[0].name}</h3>
                    <p className="text-slate-400 font-body">
                      Token #{ownedItems[0].tokenId}
                    </p>
                  </div>
                  {/* Featured actions */}
                  <div className="absolute bottom-6 right-6">
                    <button
                      onClick={() => openListingModal(ownedItems[0].collection_address || '', ownedItems[0].token_id || '')}
                      className="px-5 py-2.5 bg-primary text-on-primary rounded-xl font-headline font-bold text-sm hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2"
                    >
                      <Tag className="w-4 h-4" /> List for Sale
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Portfolio Insights */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-6">
              <div className="flex-grow rounded-2xl bg-surface-container-low p-8 border border-outline-variant/5">
                <h4 className="font-headline font-bold text-slate-500 text-xs uppercase tracking-widest mb-6">
                  Portfolio Insights
                </h4>
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Collections</span>
                    <span className="text-on-surface font-bold">{collectionsCount}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Listed Items</span>
                    <span className="text-primary font-bold">{myListings.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300">Active Bids</span>
                    <span className="text-on-surface font-bold">{myBids.length}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* NFT Grid */}
            {ownedItems.slice(1).map((item) => (
              <div
                key={item.id}
                className="col-span-12 sm:col-span-6 lg:col-span-4 group bg-surface-container-low rounded-2xl overflow-hidden border border-outline-variant/5 hover:border-primary/20 transition-all duration-300"
              >
                <div className="relative aspect-square overflow-hidden">
                  <Image
                    src={item.image_url ? ipfsToHttpUrl(item.image_url) : ''}
                    alt={item.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {item.status === 'listed' && (
                    <div className="absolute top-3 left-3">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-500/20 text-green-400 border border-green-500/30 backdrop-blur-md">
                        Listed
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-headline font-bold text-on-surface group-hover:text-primary transition-colors">
                        {item.name}
                      </h4>
                      <p className="text-xs text-slate-500">{item.collection?.name}</p>
                    </div>
                    {item.price && (
                      <span className="text-secondary font-headline font-bold text-sm">{item.price}</span>
                    )}
                  </div>
                  <button
                    onClick={() => openListingModal(item.collection_address || '', item.token_id || '')}
                    className="w-full py-3 rounded-xl bg-surface-container-high text-on-surface font-headline font-bold text-sm hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2"
                  >
                    <Tag className="w-4 h-4" /> List for Sale
                  </button>
                </div>
              </div>
            ))}

            {/* Empty State */}
            {ownedItems.length === 0 && (
              <div className="col-span-12 flex flex-col items-center justify-center py-24 text-slate-500">
                <Tag className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-headline">No NFTs found</p>
                <p className="text-sm mt-2">Mint or purchase NFTs to see them here</p>
              </div>
            )}
          </div>
        )}

        {/* ─── Tab: Listed ─── */}
        {activeTab === 'Listed' && (
          <div className="mb-20">
            {myListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                <Tag className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-headline">No active listings</p>
                <p className="text-sm mt-2">Go to Owned tab to list your NFTs</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-6 text-[10px] text-slate-500 uppercase tracking-widest font-label px-4 pb-2 border-b border-outline-variant/10">
                  <span className="col-span-2">Item</span>
                  <span className="text-right">Price</span>
                  <span className="text-center">Expiry</span>
                  <span className="text-center">Status</span>
                  <span className="text-right">Actions</span>
                </div>
                {myListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="grid grid-cols-6 items-center px-4 py-4 bg-surface-container-low rounded-xl border border-outline-variant/5 hover:border-primary/10 transition-colors"
                  >
                    {/* Item */}
                    <div className="col-span-2 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
                        <Image src={listing.image} alt={listing.name} width={56} height={56} className="object-cover" />
                      </div>
                      <div>
                        <p className="font-headline font-bold text-sm">{listing.name}</p>
                        <p className="text-xs text-slate-500">{listing.collection}</p>
                        <a
                          href={`https://sepolia.etherscan.io/token/${listing.collectionAddress}?a=${listing.tokenId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                        >
                          #{listing.tokenId} <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      </div>
                    </div>
                    {/* Price */}
                    <div className="text-right">
                      <p className="font-bold text-secondary">{listing.price}</p>
                      <p className="text-[10px] text-slate-500">{listing.priceUsd}</p>
                    </div>
                    {/* Expiry */}
                    <div className="flex justify-center">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {listing.expiry}
                      </span>
                    </div>
                    {/* Status */}
                    <div className="flex justify-center">
                      <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                        Active
                      </span>
                    </div>
                    {/* Actions */}
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setEditTarget(listing)}
                        className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-on-primary text-xs font-headline font-bold transition-all"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => setCancelTarget(listing)}
                        className="px-3 py-1.5 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 border border-red-400/20 text-xs font-headline font-bold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Tab: Offers ─── */}
        {activeTab === 'Offers' && (
          <div className="mb-20">
            {myBids.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                <ShoppingCart className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-headline">No offers made</p>
                <p className="text-sm mt-2">Browse NFTs to make offers</p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-5 text-[10px] text-slate-500 uppercase tracking-widest font-label px-4 pb-2 border-b border-outline-variant/10">
                  <span className="col-span-2">Item</span>
                  <span className="text-right">Offer Price</span>
                  <span className="text-center">Expires</span>
                  <span className="text-right">Action</span>
                </div>
                {myBids.map((bid) => (
                  <div
                    key={bid.id}
                    className="grid grid-cols-5 items-center px-4 py-4 bg-surface-container-low rounded-xl border border-outline-variant/5 hover:border-secondary/20 transition-colors"
                  >
                    <div className="col-span-2 flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-surface-container flex-shrink-0">
                        <Image src={bid.image} alt={bid.name} width={56} height={56} className="object-cover" />
                      </div>
                      <div>
                        <p className="font-headline font-bold text-sm">{bid.name}</p>
                        <p className="text-xs text-slate-500">{bid.collection}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-secondary">{bid.offerPrice}</p>
                      <p className="text-[10px] text-slate-500">{bid.offerPriceUsd}</p>
                    </div>
                    <div className="flex justify-center">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {bid.expiry}
                      </span>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button className="px-3 py-1.5 rounded-lg bg-red-400/10 text-red-400 hover:bg-red-400/20 border border-red-400/20 text-xs font-headline font-bold transition-all">
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── Tab: Activity ─── */}
        {activeTab === 'Activity' && (
          <section className="mb-20">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-headline font-bold text-on-surface">Recent Activity</h2>
              <button className="text-sm font-headline font-bold text-secondary hover:underline">
                View All History
              </button>
            </div>
            {activities.length > 0 ? (
              <div className="overflow-x-auto">
                <ActivityTable activities={activities.map((a: any) => ({
                  id: a.id,
                  event: a.event_type,
                  itemName: a.item_name || `#${a.item?.token_id}`,
                  itemImage: a.image_url ? ipfsToHttpUrl(a.image_url) : '',
                  price: a.price,
                  priceUsd: a.price,
                  from: a.maker,
                  to: a.taker,
                  time: new Date(a.event_time * 1000).toLocaleString(),
                }))} />
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                <Clock className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-headline">No activity yet</p>
                <p className="text-sm mt-2">Your trading history will appear here</p>
              </div>
            )}
          </section>
        )}
      </div>

      {/* Cancel Listing Modal */}
      <CancelListingModal
        listing={cancelTarget}
        onConfirm={handleCancelConfirm}
        onClose={() => setCancelTarget(null)}
        isPending={isCancelPending || isCancelConfirming}
      />

      {/* Trading Modal (List for Sale / Edit Price) */}
      <TradingModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        collectionAddress={modalState.collectionAddress}
        tokenId={modalState.tokenId}
        price={modalState.price}
        onClose={closeModal}
        chainId={CHAIN_ID}
        onSuccess={() => {
          refetchItems();
          refetchListings();
        }}
      />
      
      <EditListingModal
        isOpen={!!editTarget}
        listing={editTarget}
        isPending={isEditPending}
        isConfirming={isEditConfirming}
        isConfirmed={isEditConfirmed}
        error={editError}
        onConfirm={handleEditConfirm}
        onClose={() => setEditTarget(null)}
      />
    </MainLayout>
  );
}
