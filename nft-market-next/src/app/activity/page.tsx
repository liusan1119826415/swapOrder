'use client';

import { useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import ActivityTable from '@/components/ui/ActivityTable';
import { useQuery } from '@tanstack/react-query';
import { getActivities } from '@/lib/api/activities';
import type { ActivityFilterParams } from '@/types';

// 模拟活动数据
const mockActivities = [
  {
    id: '1',
    event: 'sale' as const,
    itemName: 'Cybernetic Void #042',
    itemImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop',
    price: '14.85 ETH',
    priceUsd: '$42,210.50',
    from: '0x742d...8f3a',
    to: '0x8f2d...4e9a',
    time: '2 mins ago',
  },
  {
    id: '2',
    event: 'list' as const,
    itemName: 'Ethereal Form III',
    itemImage: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=100&h=100&fit=crop',
    price: '0.95 ETH',
    priceUsd: '$2,700.00',
    from: '0x3a12...99c2',
    time: '5 mins ago',
  },
  {
    id: '3',
    event: 'bid' as const,
    itemName: 'Void Citadel X',
    itemImage: 'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=100&h=100&fit=crop',
    price: '4.20 ETH',
    priceUsd: '$11,900.00',
    from: '0x9b4e...2d1f',
    time: '12 mins ago',
  },
  {
    id: '4',
    event: 'transfer' as const,
    itemName: 'Bio-Mechanical v1',
    itemImage: 'https://images.unsplash.com/photo-1614726365723-49cfae927846?w=100&h=100&fit=crop',
    from: '0x1c3d...5e7a',
    to: '0x7f2a...9b3c',
    time: '1 hour ago',
  },
  {
    id: '5',
    event: 'sale' as const,
    itemName: 'Liquid Reality #042',
    itemImage: 'https://images.unsplash.com/photo-1614728853913-1e221a65777a?w=100&h=100&fit=crop',
    price: '1.28 ETH',
    priceUsd: '$3,630.00',
    from: '0x5d8e...1f4b',
    to: '0x2a9c...6d8e',
    time: '2 hours ago',
  },
];

const eventTypes = ['All Events', 'Sales', 'Listings', 'Bids', 'Transfers'];
const chains = ['All Chains', 'Ethereum', 'Polygon', 'Arbitrum', 'Optimism'];

// 事件类型映射
const eventTypesMap: Record<string, string> = {
  'All Events': '',
  'Sales': 'sale',
  'Listings': 'list',
  'Bids': 'bid',
  'Transfers': 'transfer',
};

// 链映射
const chainsMap: Record<string, number> = {
  'All Chains': 0,
  'Ethereum': 1,
  'Polygon': 137,
  'Arbitrum': 42161,
  'Optimism': 10,
};

export default function ActivityPage() {
  const [selectedEvent, setSelectedEvent] = useState('All Events');
  const [selectedChain, setSelectedChain] = useState('All Chains');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // 构建过滤参数
  const filters: ActivityFilterParams = {
    page,
    pageSize,
  };

  // 添加事件类型过滤
  if (selectedEvent !== 'All Events') {
    filters.eventTypes = [eventTypesMap[selectedEvent]];
  }

  // 添加链过滤
  if (selectedChain !== 'All Chains') {
    filters.chainId = [chainsMap[selectedChain]];
  }

  // 使用 React Query 获取活动数据
  const { data, isLoading, error } = useQuery({
    queryKey: ['activities', filters],
    queryFn: () => getActivities(filters),
  });

  // 数据转换函数
  const transformActivities = (items: any[]) => {
    return items.map((item) => ({
      id: item.id,
      event: item.event as 'sale' | 'list' | 'transfer' | 'bid',
      itemName: item.item?.name || 'Unknown Item',
      itemImage: item.item?.image || '',
      price: item.price,
      priceUsd: item.priceUsd,
      from: item.from,
      to: item.to,
      time: new Date(item.timestamp).toLocaleString(),
    }));
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-headline font-bold tracking-tight mb-2">Activity</h1>
          <p className="text-slate-400">Track all marketplace activity in real-time</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <div className="flex items-center gap-2 px-4 py-2 bg-surface-container-low border border-outline-variant/20 rounded-xl">
            <Filter className="w-4 h-4 text-outline" />
            <span className="text-sm text-outline">Filter by:</span>
          </div>

          {/* Event Type Filter */}
          <div className="relative">
            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="appearance-none bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2 pr-10 text-sm focus:ring-0 cursor-pointer hover:bg-surface-container-high transition-colors"
            >
              {eventTypes.map((type: string) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
          </div>

          {/* Chain Filter */}
          <div className="relative">
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
              className="appearance-none bg-surface-container-low border border-outline-variant/20 rounded-xl px-4 py-2 pr-10 text-sm focus:ring-0 cursor-pointer hover:bg-surface-container-high transition-colors"
            >
              {chains.map((chain: string) => (
                <option key={chain} value={chain}>
                  {chain}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-outline pointer-events-none" />
          </div>

          {/* Time Range */}
          <div className="flex bg-surface-container-low p-1 rounded-full border border-outline-variant/10 ml-auto">
            <button className="px-4 py-1.5 rounded-full text-xs font-headline font-bold bg-surface-container-high text-on-surface">
              1H
            </button>
            <button className="px-4 py-1.5 rounded-full text-xs font-headline font-bold text-outline hover:text-on-surface transition-colors">
              1D
            </button>
            <button className="px-4 py-1.5 rounded-full text-xs font-headline font-bold text-outline hover:text-on-surface transition-colors">
              7D
            </button>
            <button className="px-4 py-1.5 rounded-full text-xs font-headline font-bold text-outline hover:text-on-surface transition-colors">
              30D
            </button>
            <button className="px-4 py-1.5 rounded-full text-xs font-headline font-bold text-outline hover:text-on-surface transition-colors">
              ALL
            </button>
          </div>
        </div>

        {/* Activity Table */}
        <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/5">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-20 bg-surface-container-high rounded-xl animate-pulse" />
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-400">
              Failed to load activities. Please try again later.
            </div>
          ) : (
            <ActivityTable activities={transformActivities(data?.items || [])} />
          )}
        </div>

        {/* Load More */}
        <div className="mt-8 flex justify-center">
          <button className="px-8 py-3 bg-surface-container-high hover:bg-surface-bright text-on-surface font-bold transition-all border border-outline-variant/20 hover:border-primary/50 rounded-full">
            Load More
          </button>
        </div>
      </div>
    </MainLayout>
  );
}
