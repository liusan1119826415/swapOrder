'use client';

import { useQuery } from '@tanstack/react-query';
import { getAuctions, getActiveAuctions, getEndingSoonAuctions } from '@/lib/api/auctions';
import type { AuctionsFilterParams } from '@/types';

/**
 * 获取拍卖列表
 */
export function useAuctions(filters?: AuctionsFilterParams) {
  return useQuery({
    queryKey: ['auctions', filters],
    queryFn: () => getAuctions(filters),
    staleTime: 2 * 60 * 1000, // 2 minutes - auctions change frequently
  });
}

/**
 * 获取进行中的拍卖
 */
export function useActiveAuctions(limit: number = 20) {
  return useQuery({
    queryKey: ['active-auctions', limit],
    queryFn: () => getActiveAuctions(limit),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * 获取即将结束的拍卖
 */
export function useEndingSoonAuctions(limit: number = 20) {
  return useQuery({
    queryKey: ['ending-soon-auctions', limit],
    queryFn: () => getEndingSoonAuctions(limit),
    staleTime: 1 * 60 * 1000, // 1 minute - ending soon needs frequent updates
  });
}
