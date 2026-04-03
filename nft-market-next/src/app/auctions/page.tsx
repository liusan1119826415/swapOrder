'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Gavel, Clock, Flame, TrendingUp, Users, Zap, ChevronRight, Tag } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import TradingModal from '@/components/ui/TradingModal';
import { useTradingModal } from '@/lib/hooks';
import { clsx } from 'clsx';
import { getAuctions, getActiveAuctions, getEndingSoonAuctions } from '@/lib/api/auctions';
import type { AuctionInfo } from '@/types';

const CHAIN_ID = 11155111; // Sepolia

// 倒计时组件
function CountdownTimer({ endsIn }: { endsIn: { h: number; m: number; s: number } }) {
  const [time, setTime] = useState(endsIn);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(prev => {
        let s = prev.s - 1;
        let m = prev.m;
        let h = prev.h;
        if (s < 0) { s = 59; m -= 1; }
        if (m < 0) { m = 59; h -= 1; }
        if (h < 0) { clearInterval(timer); return { h: 0, m: 0, s: 0 }; }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const isUrgent = time.h === 0 && time.m < 30;

  return (
    <span className={clsx('font-mono font-bold', isUrgent ? 'text-red-400' : 'text-secondary')}>
      {String(time.h).padStart(2, '0')}h {String(time.m).padStart(2, '0')}m {String(time.s).padStart(2, '0')}s
    </span>
  );
}

// 将后端拍卖数据转换为前端格式
const convertAuctionToFrontend = (auction: AuctionInfo) => {
  // 计算剩余时间
  const now = Date.now() / 1000;
  const endTime = auction.end_time || now + 86400; // 默认 24 小时后
  const diffSeconds = Math.max(0, endTime - now);
  
  const hours = Math.floor(diffSeconds / 3600);
  const minutes = Math.floor((diffSeconds % 3600) / 60);
  const seconds = Math.floor(diffSeconds % 60);

  // 判断是否热门（24 小时内结束且出价次数>3）
  const isHot = hours < 24 && auction.bid_count > 3;

  return {
    id: auction.auction_id,
    name: auction.item_name || `Token #${auction.token_id}`,
    image: auction.image_uri || '/placeholder.png',
    price: auction.current_bid.toString(),
    priceDisplay: `${auction.current_bid} ETH`,
    priceUsd: auction.current_bid_usd || `$${(parseFloat(auction.current_bid.toString()) * 3700).toFixed(2)}`,
    creatorName: auction.seller,
    creatorAvatar: "",
    collectionAddress: auction.collection_addr,
    tokenId: auction.token_id,
    endsIn: { h: hours, m: minutes, s: seconds },
    bids: auction.bid_count,
    isHot,
  };
};

export default function AuctionsPage() {
  const { modalState, openBidModal, closeModal } = useTradingModal();
  const [filter, setFilter] = useState<'all' | 'ending_soon' | 'hot'>('all');
  const [auctions, setAuctions] = useState<AuctionInfo[]>([]);
  const [featuredCollections, setFeaturedCollections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
   
  // 加载拍卖数据
  useEffect(() => {
    const loadAuctions = async () => {
      try {
        setLoading(true);
        // 获取进行中的拍卖
        const response = await getAuctions({
          chainIds: [CHAIN_ID],
          status: 'active',
          page: 1,
          pageSize: 20,
        });
        console.log('Auctions response:', response);
        setAuctions(response?.data?.result || []);
      } catch (error) {
        console.error('Failed to load auctions:', error);
        setAuctions([]);
      } finally {
        setLoading(false);
      }
    };

    loadAuctions();
  }, []);

  // 加载精选合集（从拍卖数据中提取）
  useEffect(() => {
    if (auctions.length > 0) {
      // 按集合地址分组统计
      const collectionMap = new Map<string, any>();
      auctions.forEach(auction => {
        if (!collectionMap.has(auction.collection_addr)) {
          collectionMap.set(auction.collection_addr, {
            name: auction.collection_name || 'Unknown Collection',
            items: 0,
            highestBid: 0,
          });
        }
        const col = collectionMap.get(auction.collection_addr);
        col.items += 1;
        if (parseFloat(auction.current_bid.toString()) > col.highestBid) {
          col.highestBid = parseFloat(auction.current_bid.toString());
        }
      });

      // 取前 3 个作为精选
      const featured = Array.from(collectionMap.values())
        .slice(0, 3)
        .map(col => ({
          name: col.name,
          items: col.items,
          endsIn: '24h',
          highestBid: `${col.highest_bid} ETH`,
          volume: '+25%',
        }));

      setFeaturedCollections(featured);
    }
  }, [auctions]);

  // 过滤拍卖数据
  const filteredNFTs = auctions
    .map(convertAuctionToFrontend)
    .filter(nft => {
      if (filter === 'hot') return nft.isHot;
      if (filter === 'ending_soon') return nft.endsIn.h < 3;
      return true;
    });

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-headline font-bold tracking-tight mb-2 flex items-center gap-3">
            <Gavel className="w-10 h-10 text-primary" />
            Live Auctions
          </h1>
          <p className="text-slate-400">Bid on exclusive NFTs. Place your offer before time runs out.</p>
        </div>

        {/* Featured Live Auctions Banner */}
        {featuredCollections.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {featuredCollections.map((auction, index) => (
              <div
                key={index}
                className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20 hover:border-primary/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-400" />
                    <span className="text-sm font-bold text-orange-400">LIVE</span>
                  </div>
                  <span className="text-xs text-green-400 font-bold flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> {auction.volume}
                  </span>
                </div>
                <h3 className="font-headline font-bold text-xl mb-2">{auction.name}</h3>
                <div className="flex items-center justify-between text-sm mb-4">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Users className="w-4 h-4" /> {auction.items} items
                  </span>
                  <span className="flex items-center gap-1 text-secondary">
                    <Clock className="w-4 h-4" /> {auction.endsIn}
                  </span>
                </div>
                <div className="pt-4 border-t border-white/10 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-slate-400 mb-1">Highest Bid</p>
                    <p className="text-xl font-headline font-bold text-primary">{auction.highest_bid}</p>
                  </div>
                  <Link
                    href="/collections"
                    className="text-xs text-slate-400 hover:text-primary transition-colors flex items-center gap-1"
                  >
                    View <ChevronRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* 如果没有精选合集，显示默认占位数据 */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-6 border border-primary/20 animate-pulse"
              >
                <div className="h-20 bg-white/5 rounded-lg"></div>
              </div>
            ))}
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex bg-surface-container-low p-1 rounded-xl border border-outline-variant/10">
            {[
              { id: 'all', label: 'All Auctions' },
              { id: 'ending_soon', label: '⏱ Ending Soon' },
              { id: 'hot', label: '🔥 Hot' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={clsx(
                  'px-5 py-2 rounded-lg font-headline font-bold text-sm transition-all',
                  filter === f.id
                    ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                    : 'text-slate-400 hover:text-on-surface'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="text-sm text-slate-500">{filteredNFTs.length} auctions</span>
        </div>

        {/* Auction Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/5 animate-pulse"
              >
                <div className="aspect-square bg-white/5"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-white/5 rounded"></div>
                  <div className="h-6 bg-white/5 rounded"></div>
                  <div className="h-12 bg-white/5 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNFTs.map((nft) => (
            <div
              key={nft.id}
              className="group bg-surface-container-low rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-300 border border-outline-variant/5 hover:border-primary/20 shadow-lg hover:shadow-primary/10"
            >
              {/* Image */}
              <div className="relative">
                <Link href={`/collections/${nft.collectionAddress}/${nft.tokenId}`}>
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={nft.image}
                      alt={nft.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    {/* Hot badge */}
                    {nft.isHot && (
                      <div className="absolute top-3 left-3">
                        <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-orange-400/20 text-orange-400 border border-orange-400/30 backdrop-blur-md">
                          <Flame className="w-3 h-3" /> HOT
                        </span>
                      </div>
                    )}
                    {/* Auction badge */}
                    <div className="absolute top-3 right-3">
                      <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-primary-container/80 text-on-primary-container border border-primary/20 backdrop-blur-md">
                        AUCTION
                      </span>
                    </div>
                  </div>
                </Link>

                {/* Timer overlay at bottom of image */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent px-4 pt-6 pb-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest">Ends in</span>
                    <CountdownTimer endsIn={nft.endsIn} />
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                {/* Creator */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-5 h-5 rounded-full overflow-hidden border border-primary/20 flex-shrink-0">
                    <Image src={nft.creatorAvatar} alt={nft.creatorName} width={20} height={20} className="object-cover" />
                  </div>
                  <span className="text-xs text-outline hover:text-primary cursor-pointer transition-colors">{nft.creatorName}</span>
                </div>

                <h4 className="font-headline font-bold text-lg mb-3 group-hover:text-primary transition-colors">{nft.name}</h4>

                {/* Price + Bids */}
                <div className="flex justify-between items-end mb-4 border-t border-outline-variant/10 pt-3">
                  <div>
                    <p className="text-[10px] text-outline uppercase tracking-widest mb-1">Highest Bid</p>
                    <p className="font-headline font-bold text-secondary">{nft.priceDisplay}</p>
                    <p className="text-[10px] text-slate-500">{nft.priceUsd}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-outline uppercase tracking-widest mb-1">Bids</p>
                    <p className="font-bold text-on-surface flex items-center gap-1 justify-end">
                      <Users className="w-3 h-3 text-slate-500" /> {nft.bids}
                    </p>
                  </div>
                </div>

                {/* Bid Button */}
                <button
                  onClick={() => openBidModal(nft.collectionAddress, nft.tokenId, nft.price)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-on-primary font-headline font-bold text-sm transition-all active:scale-95"
                >
                  <Gavel className="w-4 h-4" />
                  Place Bid
                </button>
              </div>
            </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {filteredNFTs.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-500">
            <Gavel className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-lg font-headline">No auctions found</p>
            <p className="text-sm mt-2">Try a different filter</p>
          </div>
        )}

        {/* Load More */}
        {filteredNFTs.length > 0 && (
          <div className="mt-16 flex justify-center">
            <button className="px-10 py-3 bg-surface-container-high hover:bg-surface-bright text-on-surface font-bold transition-all border border-outline-variant/20 hover:border-primary/50 rounded-full text-sm">
              Load More Auctions
            </button>
          </div>
        )}
      </div>

      {/* Trading Modal */}
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
