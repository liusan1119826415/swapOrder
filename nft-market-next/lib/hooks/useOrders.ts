import { useQuery } from '@tanstack/react-query';
import { getListings, getBids } from '@/lib/api/orders';

// Query Keys
export const orderKeys = {
  all: ['orders'] as const,
  listings: (params: {
    chainId: number;
    collectionAddr?: string;
    tokenId?: string;
    userAddress?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
    minPrice?: string;
    maxPrice?: string;
  }) => [...orderKeys.all, 'listings', params] as const,
  bids: (params: {
    chainId: number;
    collectionAddr?: string;
    tokenId?: string;
    userAddress?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortOrder?: string;
    bidType?: string;
  }) => [...orderKeys.all, 'bids', params] as const,
};

/**
 * 获取挂单列表 (Listings)
 */
export const useListings = (params: {
  chainId: number;
  collectionAddr?: string;
  tokenId?: string;
  userAddress?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
  minPrice?: string;
  maxPrice?: string;
}) => {
  return useQuery({
    queryKey: orderKeys.listings(params),
    queryFn: () => getListings(
      params.chainId,
      params.collectionAddr,
      params.tokenId,
      params.userAddress,
      params.page,
      params.pageSize,
      params.sortBy,
      params.sortOrder,
      params.minPrice,
      params.maxPrice
    ),
    enabled: !!params.chainId,
  });
};

/**
 * 获取出价列表 (Bids)
 */
export const useBids = (params: {
  chainId: number;
  collectionAddr?: string;
  tokenId?: string;
  userAddress?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: string;
  bidType?: string;
}) => {
  return useQuery({
    queryKey: orderKeys.bids(params),
    queryFn: () => getBids(
      params.chainId,
      params.collectionAddr,
      params.tokenId,
      params.userAddress,
      params.page,
      params.pageSize,
      params.sortBy,
      params.sortOrder,
      params.bidType
    ),
    enabled: !!params.chainId,
  });
};
