'use client';

import { Heart } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import NFTCard from '@/components/ui/NFTCard';

const favoriteNFTs = [
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
    image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=400&h=400&fit=crop',
    price: '4.50 ETH',
    creatorName: 'Galactic_Arch',
    creatorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    status: 'buy_now' as const,
  },
];

export default function FavoritesPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-headline font-bold tracking-tight mb-2 flex items-center gap-3">
            <Heart className="w-10 h-10 text-primary" />
            Favorites
          </h1>
          <p className="text-slate-400">Your saved NFTs and collections</p>
        </div>

        {/* Favorites Grid */}
        {favoriteNFTs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {favoriteNFTs.map((nft) => (
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
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 rounded-full bg-surface-container flex items-center justify-center mb-6">
              <Heart className="w-10 h-10 text-slate-400" />
            </div>
            <h2 className="text-2xl font-headline font-bold mb-2">No favorites yet</h2>
            <p className="text-slate-400 max-w-md">
              Start exploring and save your favorite NFTs to this list
            </p>
            <button className="mt-6 px-8 py-3 bg-primary text-on-primary font-headline font-bold rounded-full hover:shadow-glow transition-all">
              Explore NFTs
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
