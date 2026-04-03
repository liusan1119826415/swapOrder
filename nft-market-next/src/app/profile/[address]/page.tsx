'use client';

import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { 
  Copy, Share2, BadgeCheck, ExternalLink, 
  Heart, ShoppingCart, Tag, Clock, TrendingUp 
} from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useAccount } from 'wagmi';
import { clsx } from 'clsx';
import { getUserItems, getUserListings, getUserBids } from '@/lib/api/portfolio';
import type { PortfolioItem, PortfolioListing, PortfolioBid } from '@/types';

const CHAIN_ID = 11155111; // Sepolia

// Tab types
type TabType = 'owned' | 'listings' | 'bids' | 'created';

export default function ProfilePage() {
  const params = useParams();
  const { address: connectedAddress } = useAccount();
  const [activeTab, setActiveTab] = useState<TabType>('owned');
  const [loading, setLoading] = useState(true);
  
  // Data state
  const [ownedItems, setOwnedItems] = useState<PortfolioItem[]>([]);
  const [listings, setListings] = useState<PortfolioListing[]>([]);
  const [bids, setBids] = useState<PortfolioBid[]>([]);
  const [createdItems, setCreatedItems] = useState<PortfolioItem[]>([]);
  
  // User address from URL or connected wallet
  const userAddress = (params?.address as string) || connectedAddress;
  
  // Check if viewing own profile
  const isOwnProfile = userAddress?.toLowerCase() === connectedAddress?.toLowerCase();

  // Load user data
  useEffect(() => {
    const loadUserData = async () => {
      if (!userAddress) return;
      
      setLoading(true);
      try {
        const filters = {
          userAddresses: [userAddress],
          chainId: [CHAIN_ID],
          page: 1,
          pageSize: 20,
        };

        const [itemsResult, listingsResult, bidsResult] = await Promise.all([
          getUserItems(filters),
          getUserListings(filters),
          getUserBids(filters),
        ]);

        setOwnedItems(itemsResult.items || []);
        setListings(listingsResult.items || []);
        setBids(bidsResult.items || []);
        
        // For created items, you would query by creator address
        // This depends on your backend implementation
        setCreatedItems([]);
      } catch (error) {
        console.error('Failed to load user data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [userAddress, activeTab]);

  // Get current items based on active tab
  const getCurrentItems = () => {
    switch (activeTab) {
      case 'owned':
        return ownedItems;
      case 'listings':
        return listings as any;
      case 'bids':
        return bids as any;
      case 'created':
        return createdItems;
      default:
        return [];
    }
  };

  const currentItems = getCurrentItems();

  if (!userAddress) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto px-6 lg:px-12 py-16 text-center">
          <h1 className="text-3xl font-headline font-bold mb-4">Connect Wallet</h1>
          <p className="text-slate-400 mb-8">
            Please connect your wallet to view profiles
          </p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Profile Header */}
        <div className="relative mb-8">
          {/* Banner */}
          <div className="h-48 md:h-64 rounded-3xl overflow-hidden bg-gradient-to-r from-primary/20 to-secondary/20">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center p-8">
                <h1 className="text-4xl md:text-6xl font-headline font-bold text-white/20 mb-2">
                  {isOwnProfile ? 'Your Profile' : 'Collector'}
                </h1>
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div className="relative -mt-16 px-6 flex flex-col md:flex-row items-start md:items-end gap-4">
            {/* Avatar */}
            <div className="relative">
              <div className="w-32 h-32 rounded-2xl border-4 border-[#1a1a1a] overflow-hidden bg-surface-container-high">
                <Image
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${userAddress}`}
                  alt="Profile"
                  width={128}
                  height={128}
                  className="object-cover w-full h-full"
                />
              </div>
              {isOwnProfile && (
                <div className="absolute bottom-2 right-2 w-8 h-8 bg-primary rounded-full border-4 border-[#1a1a1a]" />
              )}
            </div>

            {/* User Info */}
            <div className="flex-1 mt-4 md:mt-0">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-3xl font-headline font-bold">
                  {isOwnProfile ? 'You' : `${userAddress.slice(0, 6)}...${userAddress.slice(-4)}`}
                </h2>
                {isOwnProfile && <BadgeCheck className="w-6 h-6 text-primary" />}
              </div>
              
              <div className="flex items-center gap-4 text-sm text-slate-400">
                <div className="flex items-center gap-1">
                  <span>{ownedItems.length} NFTs</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{listings.length} Listed</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>{bids.length} Bids</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4 md:mt-0">
              <button className="p-2 bg-surface-container-high rounded-xl hover:bg-surface-bright transition-all">
                <Share2 className="w-5 h-5" />
              </button>
              {isOwnProfile && (
                <Link
                  href="/mint"
                  className="px-6 py-2 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-all flex items-center gap-2"
                >
                  <Tag className="w-4 h-4" />
                  Create NFT
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-8 border-b border-outline-variant/20">
          {[
            { id: 'owned', label: 'Owned', count: ownedItems.length },
            { id: 'listings', label: 'Listings', count: listings.length },
            { id: 'bids', label: 'Bids', count: bids.length },
            { id: 'created', label: 'Created', count: createdItems.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={clsx(
                'px-6 py-3 font-headline font-bold text-sm transition-all border-b-2',
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-400 hover:text-on-surface'
              )}
            >
              {tab.label}
              {tab.count > 0 && (
                <span className="ml-2 text-xs opacity-60">({tab.count})</span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-surface-container-low rounded-3xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-white/5" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-white/5 rounded" />
                  <div className="h-6 bg-white/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : currentItems.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 bg-surface-container-high rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'owned' && <ShoppingCart className="w-10 h-10 text-slate-500" />}
              {activeTab === 'listings' && <Tag className="w-10 h-10 text-slate-500" />}
              {activeTab === 'bids' && <TrendingUp className="w-10 h-10 text-slate-500" />}
              {activeTab === 'created' && <Heart className="w-10 h-10 text-slate-500" />}
            </div>
            <h3 className="text-xl font-headline font-bold mb-2">
              No {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} yet
            </h3>
            <p className="text-slate-400 mb-6">
              {activeTab === 'owned' && "You don't own any NFTs yet"}
              {activeTab === 'listings' && "You haven't listed any NFTs"}
              {activeTab === 'bids' && "You haven't made any bids"}
              {activeTab === 'created' && "You haven't created any NFTs"}
            </p>
            {isOwnProfile && (
              <Link
                href="/mint"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-all"
              >
                <Tag className="w-4 h-4" />
                Create Your First NFT
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentItems.map((item: any) => (
              <div
                key={item.id || item.tokenId}
                className="group bg-surface-container-low rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-300 border border-outline-variant/5 hover:border-primary/20 shadow-lg hover:shadow-primary/10"
              >
                {/* Image */}
                <Link href={`/collections/${item.collectionAddress}/${item.tokenId}`}>
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={item.image || '/placeholder.png'}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Status Badges */}
                    {item.isListed && (
                      <div className="absolute top-3 left-3">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 backdrop-blur-md">
                          LISTED
                        </span>
                      </div>
                    )}
                    
                    {activeTab === 'listings' && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-secondary/20 text-secondary border border-secondary/30 backdrop-blur-md">
                          FOR SALE
                        </span>
                      </div>
                    )}
                    
                    {activeTab === 'bids' && (
                      <div className="absolute top-3 right-3">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-green-400/20 text-green-400 border border-green-400/30 backdrop-blur-md">
                          BID PLACED
                        </span>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="p-4">
                  <h4 className="font-headline font-bold text-base mb-2 line-clamp-1">
                    {item.name}
                  </h4>
                  
                  <p className="text-xs text-slate-400 mb-3 line-clamp-1">
                    {item.collection?.name || item.collectionName}
                  </p>

                  {/* Price Info */}
                  {(activeTab === 'listings' || activeTab === 'bids') && (
                    <div className="pt-3 border-t border-outline-variant/10">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] text-slate-400 uppercase tracking-widest mb-1">
                            {activeTab === 'listings' ? 'Price' : 'Your Bid'}
                          </p>
                          <p className="font-headline font-bold text-secondary">
                            {item.price || item.bidPrice}
                          </p>
                        </div>
                        {item.expiry && (
                          <div className="text-right">
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                              <Clock className="w-3 h-3" />
                              Expires
                            </p>
                            <p className="text-xs font-bold">{item.expiry}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {isOwnProfile && activeTab === 'owned' && !item.isListed && (
                    <Link
                      href={`/collections/${item.collectionAddress}/${item.tokenId}?action=list`}
                      className="mt-3 w-full py-2 bg-primary/10 text-primary font-headline font-bold text-sm rounded-xl hover:bg-primary hover:text-on-primary transition-all flex items-center justify-center gap-2"
                    >
                      <Tag className="w-4 h-4" />
                      List for Sale
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
