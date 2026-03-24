'use client';

import { Sparkles, Clock, Calendar, ArrowRight } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import Image from 'next/image';

const upcomingDrops = [
  {
    id: '1',
    name: 'Neon Genesis',
    creator: 'Neon Labs',
    image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&h=400&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop',
    date: 'Mar 25, 2026',
    time: '14:00 UTC',
    items: 1111,
    price: '0.5 ETH',
  },
  {
    id: '2',
    name: 'Cyber Souls',
    creator: 'Cyber Collective',
    image: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=600&h=400&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop',
    date: 'Mar 28, 2026',
    time: '18:00 UTC',
    items: 888,
    price: '0.8 ETH',
  },
  {
    id: '3',
    name: 'Digital Dreams',
    creator: 'Dream Factory',
    image: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=600&h=400&fit=crop',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop',
    date: 'Apr 1, 2026',
    time: '12:00 UTC',
    items: 2222,
    price: '0.3 ETH',
  },
];

const featuredDrop = {
  name: 'VOID WALKERS',
  creator: 'V0ID_STUDIO',
  description: 'A collection of 2,222 unique digital entities exploring the boundaries between reality and the void.',
  image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=1200&h=600&fit=crop',
  date: 'Coming Soon',
  items: 2222,
  price: '0.75 ETH',
};

export default function DropsPage() {
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-headline font-bold tracking-tight mb-2 flex items-center gap-3">
            <Sparkles className="w-10 h-10 text-primary" />
            Drops
          </h1>
          <p className="text-slate-400">Discover upcoming NFT releases</p>
        </div>

        {/* Featured Drop */}
        <section className="relative h-[400px] w-full rounded-3xl overflow-hidden mb-12 group">
          <Image
            src={featuredDrop.image}
            alt={featuredDrop.name}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-center p-12 max-w-xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-primary/30">
                Featured Drop
              </span>
            </div>
            <h2 className="text-5xl font-headline font-bold mb-2">{featuredDrop.name}</h2>
            <p className="text-secondary font-headline mb-4">by {featuredDrop.creator}</p>
            <p className="text-slate-400 mb-6 leading-relaxed">{featuredDrop.description}</p>
            <div className="flex items-center gap-6 mb-6">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Items</p>
                <p className="text-xl font-headline font-bold">{featuredDrop.items}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Price</p>
                <p className="text-xl font-headline font-bold text-secondary">{featuredDrop.price}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-widest">Launch</p>
                <p className="text-xl font-headline font-bold">{featuredDrop.date}</p>
              </div>
            </div>
            <button className="w-fit bg-primary text-on-primary px-8 py-4 rounded-full font-headline font-bold flex items-center gap-2 hover:shadow-glow transition-all">
              Get Notified <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </section>

        {/* Upcoming Drops */}
        <section>
          <h2 className="text-2xl font-headline font-bold mb-6">Upcoming Drops</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingDrops.map((drop) => (
              <div
                key={drop.id}
                className="group bg-surface-container-low rounded-3xl overflow-hidden border border-outline-variant/10 hover:border-primary/30 transition-all"
              >
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={drop.image}
                    alt={drop.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute top-4 left-4 flex items-center gap-2 bg-background/80 backdrop-blur-md px-3 py-1 rounded-full">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold">{drop.date}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <Image
                      src={drop.avatar}
                      alt={drop.creator}
                      width={40}
                      height={40}
                      className="rounded-xl"
                    />
                    <div>
                      <h3 className="font-headline font-bold text-lg">{drop.name}</h3>
                      <p className="text-sm text-slate-400">by {drop.creator}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-4 pt-4 border-t border-outline-variant/10">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar className="w-4 h-4" />
                      {drop.time}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Price</p>
                      <p className="font-headline font-bold text-secondary">{drop.price}</p>
                    </div>
                  </div>
                  <button className="w-full mt-4 py-3 bg-surface-container-high border border-outline-variant/20 rounded-xl font-headline font-bold hover:bg-surface-bright transition-all">
                    Remind Me
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
