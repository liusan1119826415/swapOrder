'use client';

import { Gavel, Clock, Flame } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import NFTCard from '@/components/ui/NFTCard';

const auctionNFTs = [
  {
    id: '1',
    name: 'Ethereal Form III',
    image: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&h=400&fit=crop',
    price: '0.95 ETH',
    creatorName: 'Neo_Sculpt',
    creatorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    status: 'auction' as const,
  },
  {
    id: '2',
    name: 'Digital Genesis',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
    price: '2.5 ETH',
    creatorName: 'CryptoArtist',
    creatorAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    status: 'auction' as const,
  },
  {
    id: '3',
    name: 'Cosmic Entity #7',
    image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=400&h=400&fit=crop',
    price: '5.0 ETH',
    creatorName: 'Galactic_Arch',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    status: 'auction' as const,
  },
  {
    id: '4',
    name: 'Abstract Mind',
    image: 'https://images.unsplash.com/photo-1614728853913-1e221a65777a?w=400&h=400&fit=crop',
    price: '1.2 ETH',
    creatorName: 'MindArtist',
    creatorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop',
    status: 'auction' as const,
  },
];

const liveAuctions = [
  { name: 'Cyber Collection', items: 24, endsIn: '2h 15m', highestBid: '12.5 ETH' },
  { name: 'Meta Lands', items: 18, endsIn: '4h 30m', highestBid: '8.2 ETH' },
  { name: 'Digital Souls', items: 12, endsIn: '6h 45m', highestBid: '5.8 ETH' },
];

export default function AuctionsPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-headline font-bold tracking-tight mb-2 flex items-center gap-3">
            <Gavel className="w-10 h-10 text-primary" />
            Live Auctions
          </h1>
          <p className="text-slate-400">Bid on exclusive NFTs from top creators</p>
        </div>

        {/* Live Auctions Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {liveAuctions.map((auction, index) => (
            <div
              key={auction.name}
              className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl p-6 border border-primary/20"
            >
              <div className="flex items-center gap-2 mb-3">
                <Flame className="w-5 h-5 text-orange-400" />
                <span className="text-sm font-bold text-orange-400">LIVE</span>
              </div>
              <h3 className="font-headline font-bold text-xl mb-2">{auction.name}</h3>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">{auction.items} items</span>
                <span className="flex items-center gap-1 text-secondary">
                  <Clock className="w-4 h-4" />
                  {auction.endsIn}
                </span>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-slate-400">Highest Bid</p>
                <p className="text-xl font-headline font-bold text-primary">{auction.highestBid}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Auction Grid */}
        <section>
          <h2 className="text-2xl font-headline font-bold mb-6">Trending Auctions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {auctionNFTs.map((nft) => (
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
