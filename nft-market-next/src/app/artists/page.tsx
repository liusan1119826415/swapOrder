'use client';

import Image from 'next/image';
import { Palette, BadgeCheck, TrendingUp } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';

const artists = [
  {
    id: '1',
    name: 'V0ID_WALKER',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop',
    cover: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=300&fit=crop',
    isVerified: true,
    followers: '12.5K',
    volume: '2.4K ETH',
    items: 156,
  },
  {
    id: '2',
    name: 'FORM_STUDIO',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
    cover: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=600&h=300&fit=crop',
    isVerified: true,
    followers: '8.2K',
    volume: '1.8K ETH',
    items: 89,
  },
  {
    id: '3',
    name: 'VOXEL_KING',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
    cover: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=600&h=300&fit=crop',
    isVerified: true,
    followers: '25.1K',
    volume: '5.6K ETH',
    items: 234,
  },
  {
    id: '4',
    name: 'NEON_ARTIST',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
    cover: 'https://images.unsplash.com/photo-1614728853913-1e221a65777a?w=600&h=300&fit=crop',
    isVerified: false,
    followers: '5.3K',
    volume: '890 ETH',
    items: 67,
  },
  {
    id: '5',
    name: 'DREAM_MAKER',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop',
    cover: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=600&h=300&fit=crop',
    isVerified: true,
    followers: '18.7K',
    volume: '3.2K ETH',
    items: 178,
  },
  {
    id: '6',
    name: 'PUNK_CREATOR',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop',
    cover: 'https://images.unsplash.com/photo-1614726365723-49cfae927846?w=600&h=300&fit=crop',
    isVerified: true,
    followers: '45.2K',
    volume: '12.8K ETH',
    items: 456,
  },
];

export default function ArtistsPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-headline font-bold tracking-tight mb-2 flex items-center gap-3">
            <Palette className="w-10 h-10 text-primary" />
            Artists
          </h1>
          <p className="text-slate-400">Discover top creators and their collections</p>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.map((artist) => (
            <div
              key={artist.id}
              className="group bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/10 hover:border-primary/30 transition-all duration-300"
            >
              {/* Cover Image */}
              <div className="relative h-32 overflow-hidden">
                <Image
                  src={artist.cover}
                  alt={artist.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-low to-transparent" />
              </div>

              {/* Artist Info */}
              <div className="relative px-6 pb-6 -mt-12">
                <div className="flex justify-between items-end mb-4">
                  <div className="relative">
                    <Image
                      src={artist.avatar}
                      alt={artist.name}
                      width={80}
                      height={80}
                      className="rounded-2xl border-4 border-surface-container-low"
                    />
                    {artist.isVerified && (
                      <div className="absolute -bottom-1 -right-1 bg-secondary text-on-secondary p-1 rounded-lg">
                        <BadgeCheck className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                  <button className="px-4 py-2 bg-primary text-on-primary font-headline font-bold text-sm rounded-full hover:shadow-glow transition-all">
                    Follow
                  </button>
                </div>

                <h3 className="font-headline font-bold text-xl mb-1 flex items-center gap-2">
                  {artist.name}
                </h3>

                <div className="grid grid-cols-3 gap-4 mt-4 text-center">
                  <div className="bg-surface-container rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Followers</p>
                    <p className="font-headline font-bold text-on-surface">{artist.followers}</p>
                  </div>
                  <div className="bg-surface-container rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Volume</p>
                    <p className="font-headline font-bold text-secondary">{artist.volume}</p>
                  </div>
                  <div className="bg-surface-container rounded-xl p-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest">Items</p>
                    <p className="font-headline font-bold text-on-surface">{artist.items}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
