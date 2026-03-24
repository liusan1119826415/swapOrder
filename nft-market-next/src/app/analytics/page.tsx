'use client';

import { useState } from 'react';
import { BarChart3, TrendingUp, TrendingDown, Users, Package, DollarSign } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useAnalyticsStats, useTopCollections } from '@/lib/hooks/useAnalytics';

const periodMap: Record<string, string> = {
  '1H': '1h',
  '1D': '1d',
  '7D': '7d',
  '30D': '30d',
};

export default function AnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('1D');
  
  // 使用 API 数据
  const { data: statsData, isLoading: isStatsLoading } = useAnalyticsStats(periodMap[selectedPeriod]);
  const { data: topCollectionsData, isLoading: isRankingLoading } = useTopCollections(10, periodMap[selectedPeriod]);

  const stats = [
    { 
      label: 'Total Volume', 
      value: statsData?.stats?.totalVolume || '--', 
      change: '+12.5%', 
      isPositive: true, 
      icon: DollarSign 
    },
    { 
      label: 'Total Sales', 
      value: statsData?.stats?.totalSales?.toLocaleString() || '--', 
      change: '+8.3%', 
      isPositive: true, 
      icon: Package 
    },
    { 
      label: 'Active Users', 
      value: statsData?.stats?.activeUsers?.toLocaleString() || '--', 
      change: '+15.2%', 
      isPositive: true, 
      icon: Users 
    },
    { 
      label: 'Avg Price', 
      value: `${statsData?.stats?.averagePrice || '--'} ETH`, 
      change: '-2.1%', 
      isPositive: false, 
      icon: BarChart3 
    },
  ];

  const topCollections = topCollectionsData?.top_collections?.slice(0, 5) || [];
  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-headline font-bold tracking-tight mb-2 flex items-center gap-3">
            <BarChart3 className="w-10 h-10 text-primary" />
            Analytics
          </h1>
          <p className="text-slate-400">Market insights and statistics</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-surface-container-low rounded-3xl p-6 border border-outline-variant/10"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-surface-container rounded-xl">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div
                    className={`flex items-center gap-1 text-sm font-bold ${
                      stat.isPositive ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {stat.isPositive ? (
                      <TrendingUp className="w-4 h-4" />
                    ) : (
                      <TrendingDown className="w-4 h-4" />
                    )}
                    {stat.change}
                  </div>
                </div>
                <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                <p className="text-2xl font-headline font-bold">{stat.value}</p>
              </div>
            );
          })}
        </div>

        {/* Top Collections Table */}
        <div className="bg-surface-container-low rounded-3xl border border-outline-variant/10 overflow-hidden">
          <div className="p-6 border-b border-outline-variant/10">
            <h2 className="text-2xl font-headline font-bold">Top Collections (24h)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-slate-400 text-sm border-b border-outline-variant/10">
                  <th className="p-6 font-medium">#</th>
                  <th className="p-6 font-medium">Collection</th>
                  <th className="p-6 font-medium text-right">Volume</th>
                  <th className="p-6 font-medium text-right">Change</th>
                  <th className="p-6 font-medium text-right">Sales</th>
                </tr>
              </thead>
              <tbody>
                {topCollections.map((collection, index) => (
                  <tr
                    key={collection.name}
                    className="border-b border-outline-variant/10 last:border-0 hover:bg-white/5 transition-colors"
                  >
                    <td className="p-6 font-headline font-bold text-slate-400">{index + 1}</td>
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center font-headline font-bold text-primary">
                          {collection.name.charAt(0)}
                        </div>
                        <span className="font-headline font-bold">{collection.name}</span>
                      </div>
                    </td>
                    <td className="p-6 text-right font-headline font-bold text-secondary">
                      {collection.volume}
                    </td>
                    <td className="p-6 text-right">
                      <span
                        className={`font-bold ${
                          collection.volumeChange >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {collection.volumeChange >= 0 ? '+' : ''}{collection.volumeChange}%
                      </span>
                    </td>
                    <td className="p-6 text-right text-slate-400">{collection.sales}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
