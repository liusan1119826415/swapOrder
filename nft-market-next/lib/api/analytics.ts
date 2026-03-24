import { get } from './client';
import type { AnalyticsStats, TopCollection, AnalyticsFilterParams } from '@/types';

/**
 * 获取市场分析数据
 * @param filters 过滤参数
 * @returns 分析数据
 */
export const getAnalytics = async (filters?: AnalyticsFilterParams) => {
  const params = new URLSearchParams();
  
  if (filters) {
    if (filters.chainIds) {
      params.append('chain_ids', filters.chainIds.join(','));
    }
    if (filters.period) {
      params.append('period', filters.period);
    }
    if (filters.categories) {
      params.append('categories', filters.categories.join(','));
    }
    if (filters.limit) {
      params.append('limit', filters.limit.toString());
    }
  }
  
  const queryString = params.toString();
  return get(`/analytics${queryString ? `?${queryString}` : ''}`);
};

/**
 * 获取统计数据
 * @param period 时间范围
 * @returns 统计数据
 */
export const getAnalyticsStats = async (period: string = '1d') => {
  return get<{ stats: AnalyticsStats }>(`/analytics/stats?period=${period}`);
};

/**
 * 获取顶级集合
 * @param limit 数量限制
 * @param period 时间范围
 * @returns 顶级集合列表
 */
export const getTopCollections = async (limit: number = 10, period: string = '1d') => {
  return get<{ top_collections: TopCollection[] }>(
    `/analytics/top-collections?limit=${limit}&period=${period}`
  );
};
