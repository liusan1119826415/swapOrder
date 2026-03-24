'use client';

import { useQuery } from '@tanstack/react-query';
import { getArtists, getArtistsRanking, getArtistDetail } from '@/lib/api/artists';
import type { ArtistsFilterParams } from '@/types';

/**
 * 获取艺术家列表
 */
export function useArtists(filters?: ArtistsFilterParams) {
  return useQuery({
    queryKey: ['artists', filters],
    queryFn: () => getArtists(filters),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 获取艺术家排名
 */
export function useArtistsRanking(period: string = '1d', limit: number = 10) {
  return useQuery({
    queryKey: ['artists-ranking', period, limit],
    queryFn: () => getArtistsRanking(period, limit),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * 获取艺术家详情
 */
export function useArtistDetail(address: string) {
  return useQuery({
    queryKey: ['artist-detail', address],
    queryFn: () => getArtistDetail(address),
    enabled: !!address,
    staleTime: 5 * 60 * 1000,
  });
}
