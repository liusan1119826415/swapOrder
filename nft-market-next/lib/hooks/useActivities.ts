import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { getActivities, getCollectionActivities, getUserActivities } from '@/lib/api/activities';
import type { ActivityFilterParams } from '@/types';

// Query Keys
export const activityKeys = {
  all: ['activities'] as const,
  list: (filters: ActivityFilterParams) => [...activityKeys.all, filters] as const,
  collection: (collectionAddress: string, chainId: number) =>
    [...activityKeys.all, 'collection', collectionAddress, chainId] as const,
  user: (userAddress: string, chainId?: number) =>
    [...activityKeys.all, 'user', userAddress, chainId] as const,
};

/**
 * 获取活动列表
 */
export const useActivities = (filters: ActivityFilterParams) => {
  return useInfiniteQuery({
    queryKey: activityKeys.list(filters),
    queryFn: ({ pageParam = 1 }) =>
      getActivities({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      const totalPages = Math.ceil(lastPage.count / (filters.pageSize || 20));
      if (currentPage < totalPages) {
        return currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
  });
};

/**
 * 获取 Collection 活动
 */
export const useCollectionActivities = (
  collectionAddress: string,
  chainId: number,
  pageSize: number = 20
) => {
  return useInfiniteQuery({
    queryKey: activityKeys.collection(collectionAddress, chainId),
    queryFn: ({ pageParam = 1 }) =>
      getCollectionActivities(collectionAddress, chainId, pageParam, pageSize),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      const totalPages = Math.ceil(lastPage.count / pageSize);
      if (currentPage < totalPages) {
        return currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!collectionAddress && chainId > 0,
  });
};

/**
 * 获取用户活动
 */
export const useUserActivities = (
  userAddress: string,
  chainId?: number,
  pageSize: number = 20
) => {
  return useInfiniteQuery({
    queryKey: activityKeys.user(userAddress, chainId),
    queryFn: ({ pageParam = 1 }) =>
      getUserActivities(userAddress, chainId, pageParam, pageSize),
    getNextPageParam: (lastPage, allPages) => {
      const currentPage = allPages.length;
      const totalPages = Math.ceil(lastPage.count / pageSize);
      if (currentPage < totalPages) {
        return currentPage + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!userAddress,
  });
};
