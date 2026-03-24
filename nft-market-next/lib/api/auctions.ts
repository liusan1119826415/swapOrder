import { get } from './client';
import type { AuctionsFilterParams, AuctionsResponse } from '@/types';

/**
 * 获取拍卖列表
 * @param filters 过滤参数
 * @returns 拍卖列表
 */
export const getAuctions = async (filters?: AuctionsFilterParams): Promise<AuctionsResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.chainIds) {
      params.append('chain_ids', filters.chainIds.join(','));
    }
    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.collectionAddrs) {
      params.append('collection_addrs', filters.collectionAddrs.join(','));
    }
    if (filters.userAddress) {
      params.append('user_address', filters.userAddress);
    }
    if (filters.priceMin) {
      params.append('price_min', filters.priceMin);
    }
    if (filters.priceMax) {
      params.append('price_max', filters.priceMax);
    }
    if (filters.page) {
      params.append('page', filters.page.toString());
    }
    if (filters.pageSize) {
      params.append('page_size', filters.pageSize.toString());
    }
  }
  
  const queryString = params.toString();
  return get(`/auctions${queryString ? `?${queryString}` : ''}`);
};

/**
 * 获取进行中的拍卖
 * @param limit 数量限制
 * @returns 进行中的拍卖列表
 */
export const getActiveAuctions = async (limit: number = 20) => {
  return get<AuctionsResponse>(`/auctions/active?limit=${limit}`);
};

/**
 * 获取即将结束的拍卖
 * @param limit 数量限制
 * @returns 即将结束的拍卖列表
 */
export const getEndingSoonAuctions = async (limit: number = 20) => {
  return get<AuctionsResponse>(`/auctions/ending-soon?limit=${limit}`);
};
