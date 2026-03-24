import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import {
  getUserCollections,
  getUserItems,
  getUserListings,
  getUserBids,
  getPortfolioOverview,
} from '@/lib/api/portfolio';
import type { PortfolioFilterParams } from '@/types';

// Query Keys
export const portfolioKeys = {
  all: ['portfolio'] as const,
  overview: (userAddress: string) => [...portfolioKeys.all, 'overview', userAddress] as const,
  collections: (userAddress: string) =>
    [...portfolioKeys.all, 'collections', userAddress] as const,
  items: (filters: PortfolioFilterParams) =>
    [...portfolioKeys.all, 'items', filters] as const,
  listings: (filters: PortfolioFilterParams) =>
    [...portfolioKeys.all, 'listings', filters] as const,
  bids: (filters: PortfolioFilterParams) =>
    [...portfolioKeys.all, 'bids', filters] as const,
};

/**
 * 获取 Portfolio 概览
 */
export const usePortfolioOverview = (userAddress: string) => {
  return useQuery({
    queryKey: portfolioKeys.overview(userAddress),
    queryFn: () => getPortfolioOverview(userAddress),
    enabled: !!userAddress,
  });
};

/**
 * 获取用户 Collections
 */
export const useUserCollections = (userAddress: string) => {
  return useQuery({
    queryKey: portfolioKeys.collections(userAddress),
    queryFn: () => getUserCollections([userAddress]),
    enabled: !!userAddress,
  });
};

/**
 * 获取用户 Items
 */
export const useUserItems = (filters: PortfolioFilterParams) => {
  return useInfiniteQuery({
    queryKey: portfolioKeys.items(filters),
    queryFn: ({ pageParam = 1 }) =>
      getUserItems({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: filters.userAddresses.length > 0,
  });
};

/**
 * 获取用户 Listings
 */
export const useUserListings = (filters: PortfolioFilterParams) => {
  return useInfiniteQuery({
    queryKey: portfolioKeys.listings(filters),
    queryFn: ({ pageParam = 1 }) =>
      getUserListings({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: filters.userAddresses.length > 0,
  });
};

/**
 * 获取用户 Bids
 */
export const useUserBids = (filters: PortfolioFilterParams) => {
  return useInfiniteQuery({
    queryKey: portfolioKeys.bids(filters),
    queryFn: ({ pageParam = 1 }) =>
      getUserBids({ ...filters, page: pageParam }),
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.page + 1;
      }
      return undefined;
    },
    initialPageParam: 1,
    enabled: filters.userAddresses.length > 0,
  });
};
