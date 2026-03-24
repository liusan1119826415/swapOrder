import { get } from './client';
import type { ArtistsFilterParams, ArtistsResponse, ArtistInfo } from '@/types';

/**
 * 获取艺术家/创作者列表
 * @param filters 过滤参数
 * @returns 艺术家列表
 */
export const getArtists = async (filters?: ArtistsFilterParams): Promise<ArtistsResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.chainIds) {
      params.append('chain_ids', filters.chainIds.join(','));
    }
    if (filters.period) {
      params.append('period', filters.period);
    }
    if (filters.category) {
      params.append('category', filters.category);
    }
    if (filters.search) {
      params.append('search', filters.search);
    }
    if (filters.page) {
      params.append('page', filters.page.toString());
    }
    if (filters.pageSize) {
      params.append('page_size', filters.pageSize.toString());
    }
    if (filters.sortBy) {
      params.append('sort_by', filters.sortBy);
    }
    if (filters.sortOrder) {
      params.append('sort_order', filters.sortOrder);
    }
  }
  
  const queryString = params.toString();
  return get(`/artists${queryString ? `?${queryString}` : ''}`);
};

/**
 * 获取艺术家排名
 * @param period 时间范围
 * @param limit 数量限制
 * @returns 艺术家排名
 */
export const getArtistsRanking = async (period: string = '1d', limit: number = 10) => {
  return get<ArtistsResponse>(`/artists/ranking?period=${period}&limit=${limit}`);
};

/**
 * 获取指定艺术家详情
 * @param address 艺术家地址
 * @returns 艺术家详情
 */
export const getArtistDetail = async (address: string): Promise<ArtistInfo> => {
  return get(`/artists/${address}`);
};
