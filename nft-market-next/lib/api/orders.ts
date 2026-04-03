import { get } from './client';
import type { PaginatedResponse } from '@/types';

/**
 * 获取挂单列表 (Listings)
 * @param chainId 链 ID
 * @param collectionAddr Collection 合约地址
 * @param tokenId Token ID
 * @param userAddress 用户地址
 * @param page 页码
 * @param pageSize 每页数量
 * @param sortBy 排序字段 (price, created_at, etc.)
 * @param sortOrder 排序方向 (asc, desc)
 * @param minPrice 最低价格
 * @param maxPrice 最高价格
 * @returns 挂单列表
 */
export const getListings = async (
  chainId: number,
  collectionAddr?: string,
  tokenId?: string,
  userAddress?: string,
  page: number = 1,
  pageSize: number = 20,
  sortBy?: string,
  sortOrder?: string,
  minPrice?: string,
  maxPrice?: string
): Promise<PaginatedResponse<any>> => {
  const params = new URLSearchParams();
  params.append('chain_id', chainId.toString());
  
  if (collectionAddr) params.append('collection_addr', collectionAddr);
  if (tokenId) params.append('token_id', tokenId);
  if (userAddress) params.append('user_address', userAddress);
  if (page) params.append('page', page.toString());
  if (pageSize) params.append('page_size', pageSize.toString());
  if (sortBy) params.append('sort_by', sortBy);
  if (sortOrder) params.append('sort_order', sortOrder);
  if (minPrice) params.append('min_price', minPrice);
  if (maxPrice) params.append('max_price', maxPrice);
  
  return get(`/order/listings?${params.toString()}`);
};

/**
 * 获取出价列表 (Bids)
 * @param chainId 链 ID
 * @param collectionAddr Collection 合约地址
 * @param tokenId Token ID
 * @param userAddress 用户地址
 * @param page 页码
 * @param pageSize 每页数量
 * @param sortBy 排序字段 (price, created_at, etc.)
 * @param sortOrder 排序方向 (asc, desc)
 * @param bidType 出价类型
 * @returns 出价列表
 */
export const getBids = async (
  chainId: number,
  collectionAddr?: string,
  tokenId?: string,
  userAddress?: string,
  page: number = 1,
  pageSize: number = 20,
  sortBy?: string,
  sortOrder?: string,
  bidType?: string
): Promise<PaginatedResponse<any>> => {
  const params = new URLSearchParams();
  params.append('chain_id', chainId.toString());
  
  if (collectionAddr) params.append('collection_addr', collectionAddr);
  if (tokenId) params.append('token_id', tokenId);
  if (userAddress) params.append('user_address', userAddress);
  if (page) params.append('page', page.toString());
  if (pageSize) params.append('page_size', pageSize.toString());
  if (sortBy) params.append('sort_by', sortBy);
  if (sortOrder) params.append('sort_order', sortOrder);
  if (bidType) params.append('bid_type', bidType);
  
  return get(`/order/bids?${params.toString()}`);
};
