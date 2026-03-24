'use client';

import { useQuery } from '@tanstack/react-query';
import { getAnalytics, getAnalyticsStats, getTopCollections } from '@/lib/api/analytics';
import type { AnalyticsFilterParams } from '@/types';

/**
 * 获取市场分析数据
 */
export function useAnalytics(filters?: AnalyticsFilterParams) {
  return useQuery({
    queryKey: ['analytics', filters],
    queryFn: () => getAnalytics(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * 获取统计数据
 */
export function useAnalyticsStats(period: string = '1d') {
  return useQuery({
    queryKey: ['analytics-stats', period],
    queryFn: () => getAnalyticsStats(period),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 获取顶级集合
 */
export function useTopCollections(limit: number = 10, period: string = '1d') {
  return useQuery({
    queryKey: ['top-collections', limit, period],
    queryFn: () => getTopCollections(limit, period),
    staleTime: 5 * 60 * 1000,
  });
}
