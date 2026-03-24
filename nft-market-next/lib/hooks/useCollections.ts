import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  getCollectionsRanking,
  getCollectionDetail,
  getCollectionItems,
  getItemDetail,
  getItemTraits,
  getHistorySales,
} from '@/lib/api/collections';
import type { CollectionItemFilterParams } from '@/types';

// Query Keys
export const collectionKeys = {
  all: ['collections'] as const,
  ranking: (limit: number, range: string) =>
    [...collectionKeys.all, 'ranking', limit, range] as const,
  detail: (address: string, chainId: number) =>
    [...collectionKeys.all, 'detail', address, chainId] as const,
  items: (address: string, filters: CollectionItemFilterParams) =>
    [...collectionKeys.all, 'items', address, filters] as const,
  itemDetail: (address: string, tokenId: string, chainId: number) =>
    [...collectionKeys.all, 'item', address, tokenId, chainId] as const,
  itemTraits: (address: string, tokenId: string, chainId: number) =>
    [...collectionKeys.all, 'traits', address, tokenId, chainId] as const,
  historySales: (address: string, chainId: number, duration: string) =>
    [...collectionKeys.all, 'history', address, chainId, duration] as const,
};

/**
 * 获取 Collection 排名
 */
export const useCollectionsRanking = (limit: number = 10, range: string = '1d') => {
  return useQuery({
    queryKey: collectionKeys.ranking(limit, range),
    queryFn: () => getCollectionsRanking(limit, range),
  });
};

/**
 * 获取 Collection 详情
 */
export const useCollectionDetail = (address: string, chainId: number) => {
  return useQuery({
    queryKey: collectionKeys.detail(address, chainId),
    queryFn: () => getCollectionDetail(address, chainId),
    enabled: !!address && chainId > 0,
  });
};

/**
 * 获取 Collection Items (无限滚动)
 */
export const useCollectionItems = (address: string, filters: CollectionItemFilterParams) => {
  return useInfiniteQuery({
    queryKey: collectionKeys.items(address, filters),
    queryFn: ({ pageParam = 1 }) =>
      getCollectionItems(address, { ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: !!address && filters.chainId > 0,
  });
};

/**
 * 获取 NFT Item 详情
 */
export const useItemDetail = (address: string, tokenId: string, chainId: number) => {
  return useQuery({
    queryKey: collectionKeys.itemDetail(address, tokenId, chainId),
    queryFn: () => getItemDetail(address, tokenId, chainId),
    enabled: !!address && !!tokenId && chainId > 0,
  });
};

/**
 * 获取 NFT Item 属性
 */
export const useItemTraits = (address: string, tokenId: string, chainId: number) => {
  return useQuery({
    queryKey: collectionKeys.itemTraits(address, tokenId, chainId),
    queryFn: () => getItemTraits(address, tokenId, chainId),
    enabled: !!address && !!tokenId && chainId > 0,
  });
};

/**
 * 获取历史销售数据
 */
export const useHistorySales = (
  address: string,
  chainId: number,
  duration: '24h' | '7d' | '30d' = '7d'
) => {
  return useQuery({
    queryKey: collectionKeys.historySales(address, chainId, duration),
    queryFn: () => getHistorySales(address, chainId, duration),
    enabled: !!address && chainId > 0,
  });
};
