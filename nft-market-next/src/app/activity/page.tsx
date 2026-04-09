'use client';

import { useState } from 'react';
import { Filter, ChevronDown } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import ActivityTable from '@/components/ui/ActivityTable';
import { useQuery } from '@tanstack/react-query';
import { getActivities } from '@/lib/api/activities';
import type { ActivityFilterParams } from '@/types';
import { clsx } from 'clsx';
import { ipfsToHttpUrl } from '@/lib/ipfs';


const eventTypes = ['All Events', 'Sales', 'Listings', 'Bids', 'Transfers'];
const chains = ['All Chains', 'Ethereum', 'Polygon', 'Sepolia', 'Optimism'];

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
  'Sepolia': 11155111,
  'Optimism': 10,
};

export default function ActivityPage() {
  const [selectedEvent, setSelectedEvent] = useState('All Events');
  const [selectedChain, setSelectedChain] = useState('All Chains');
  const [timeRange, setTimeRange] = useState('ALL');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // 构建过滤参数
  const filters: ActivityFilterParams = {
    page,
    pageSize,
  };

  // 添加事件类型过滤
  if (selectedEvent !== 'All Events') {
    filters.event_types = [eventTypesMap[selectedEvent]];
  }

  // 添加链过滤
  if (selectedChain !== 'All Chains') {
    filters.chain_id = [chainsMap[selectedChain]];
  }

  // 添加时间范围过滤
  if (timeRange !== 'ALL') {
    const now = Math.floor(Date.now() / 1000);
    let timeRangeSeconds = 0;
    
    switch (timeRange) {
      case '1H':
        timeRangeSeconds = 3600;
        break;
      case '1D':
        timeRangeSeconds = 86400;
        break;
      case '7D':
        timeRangeSeconds = 604800;
        break;
      case '30D':
        timeRangeSeconds = 2592000;
        break;
    }
    
    if (timeRangeSeconds > 0) {
      filters.start_time = now - timeRangeSeconds;
    }
  }

  // 使用 React Query 获取活动数据
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['activities', filters],
    queryFn: () => getActivities(filters),
  });

  console.log('Activity data:', data);

  const actdata = data?.data;


  // 计算总页数
  const totalPages = Math.ceil((data?.data?.count || 0) / pageSize);
  const hasMore = page < totalPages;

  // 处理分页变化
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // 处理时间范围切换
  const handleTimeRangeChange = (range: string) => {
    setTimeRange(range);
    setPage(1); // 重置到第一页
  };

  // 数据转换函数
  const transformActivities = (items: any[]) => {
    console.log('Transform input:', items);
    const itemdata =  items.map((item) => ({
      id: `${item.collection_address}-${item.token_id}-${item.event_time}`,
      event: item.event_type as 'sale' | 'list' | 'transfer' | 'bid',
      itemName: item.item_name || 'Unknown Item',
      itemImage: item.image_url ? ipfsToHttpUrl(item.image_url) : '',
      price: item.price,
      priceUsd: '', // 需要根据汇率计算
      from: item.maker,
      to: item.taker,
      time: new Date(item.event_time * 1000).toLocaleString(),
    }));
    console.log('Transform output:', itemdata);
    return itemdata;
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
            {['1H', '1D', '7D', '30D', 'ALL'].map((range) => (
              <button
                key={range}
                onClick={() => handleTimeRangeChange(range)}
                className={clsx(
                  'px-4 py-1.5 rounded-full text-xs font-headline font-bold transition-all',
                  timeRange === range
                    ? 'bg-surface-container-high text-on-surface'
                    : 'text-outline hover:text-on-surface'
                )}
              >
                {range}
              </button>
            ))}
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
            <ActivityTable activities={transformActivities(actdata?.result || [])} />
          )}
        </div>

        {/* Load More */}
        {totalPages > 1 && (
          <div className="mt-16 flex justify-center items-center gap-4">
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-6 py-2 bg-surface-container-high hover:bg-surface-bright text-on-surface font-bold transition-all border border-outline-variant/20 hover:border-primary/50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-surface-container-high disabled:hover:border-outline-variant/20"
            >
              ← Previous
            </button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={clsx(
                      'w-10 h-10 rounded-full font-bold text-sm transition-all',
                      page === pageNum
                        ? 'bg-primary text-on-primary shadow-lg shadow-primary/20'
                        : 'bg-surface-container-high hover:bg-surface-bright text-on-surface'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-6 py-2 bg-surface-container-high hover:bg-surface-bright text-on-surface font-bold transition-all border border-outline-variant/20 hover:border-primary/50 rounded-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-surface-container-high disabled:hover:border-outline-variant/20"
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
