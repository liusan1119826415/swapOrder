import { get } from './client';
import type { Activity, ActivityFilterParams, ActivityApiResponse } from '@/types';

/**
 * 获取市场活动记录
 * @param filters 过滤参数
 * @returns 活动列表
 */
export const getActivities = async (
  filters: ActivityFilterParams
): Promise<ActivityApiResponse<Activity>> => {
  const params = new URLSearchParams();
  params.append('filters', JSON.stringify(filters));
  return get(`/activities?${params.toString()}`);
};

/**
 * 获取指定 Collection 的活动记录
 * @param collectionAddress Collection 地址
 * @param chainId 链 ID
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 活动列表
 */
export const getCollectionActivities = async (
  collectionAddress: string,
  chainId: number,
  page: number = 1,
  pageSize: number = 20
): Promise<ActivityApiResponse<Activity>> => {
  return getActivities({
    chainId: [chainId],
    collectionAddresses: [collectionAddress],
    page,
    pageSize,
  });
};

/**
 * 获取指定用户的活动记录
 * @param userAddress 用户地址
 * @param chainId 链 ID
 * @param page 页码
 * @param pageSize 每页数量
 * @returns 活动列表
 */
export const getUserActivities = async (
  userAddress: string,
  chainId?: number,
  page: number = 1,
  pageSize: number = 20
): Promise<ActivityApiResponse<Activity>> => {
  return getActivities({
    chainId: chainId ? [chainId] : undefined,
    userAddresses: [userAddress],
    page,
    pageSize,
  });
};
