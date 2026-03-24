'use client';

import { useQuery } from '@tanstack/react-query';
import { getDrops, getLiveDrops, getUpcomingDrops } from '@/lib/api/drops';
import type { DropsFilterParams } from '@/types';

/**
 * 获取新品发布列表
 */
export function useDrops(filters?: DropsFilterParams) {
  return useQuery({
    queryKey: ['drops', filters],
    queryFn: () => getDrops(filters),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 获取正在进行的 drops
 */
export function useLiveDrops(limit: number = 20) {
  return useQuery({
    queryKey: ['live-drops', limit],
    queryFn: () => getLiveDrops(limit),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 获取即将开始的 drops
 */
export function useUpcomingDrops(limit: number = 20) {
  return useQuery({
    queryKey: ['upcoming-drops', limit],
    queryFn: () => getUpcomingDrops(limit),
    staleTime: 5 * 60 * 1000,
  });
}
