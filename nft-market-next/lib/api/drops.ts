import { get } from './client';
import type { DropsFilterParams, DropsResponse } from '@/types';

/**
 * 获取新品发布列表
 * @param filters 过滤参数
 * @returns Drops 列表
 */
export const getDrops = async (filters?: DropsFilterParams): Promise<DropsResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.chainIds) {
      params.append('chain_ids', filters.chainIds.join(','));
    }
    if (filters.status) {
      params.append('status', filters.status);
    }
    if (filters.categories) {
      params.append('categories', filters.categories.join(','));
    }
    if (filters.sortBy) {
      params.append('sort_by', filters.sortBy);
    }
    if (filters.sortOrder) {
      params.append('sort_order', filters.sortOrder);
    }
    if (filters.page) {
      params.append('page', filters.page.toString());
    }
    if (filters.pageSize) {
      params.append('page_size', filters.pageSize.toString());
    }
  }
  
  const queryString = params.toString();
  return get(`/drops${queryString ? `?${queryString}` : ''}`);
};

/**
 * 获取正在进行的 drops
 * @param limit 数量限制
 * @returns 正在进行的 drops 列表
 */
export const getLiveDrops = async (limit: number = 20) => {
  return get<DropsResponse>(`/drops/live?limit=${limit}`);
};

/**
 * 获取即将开始的 drops
 * @param limit 数量限制
 * @returns 即将开始的 drops 列表
 */
export const getUpcomingDrops = async (limit: number = 20) => {
  return get<DropsResponse>(`/drops/upcoming?limit=${limit}`);
};
