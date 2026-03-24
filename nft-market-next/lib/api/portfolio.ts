import { get } from './client';
import type {
  PortfolioCollection,
  PortfolioItem,
  PortfolioListing,
  PortfolioBid,
  PortfolioFilterParams,
  PaginatedResponse,
} from '@/types';

/**
 * 获取用户拥有的 Collections
 * @param userAddresses 用户地址列表
 * @returns Collections 列表
 */
export const getUserCollections = async (
  userAddresses: string[]
): Promise<{ result: PortfolioCollection[] }> => {
  const filters = { user_addresses: userAddresses };
  const params = new URLSearchParams();
  params.append('filters', JSON.stringify(filters));
  return get(`/portfolio/collections?${params.toString()}`);
};

/**
 * 获取用户拥有的 NFT Items
 * @param filters 过滤参数
 * @returns NFT Items 列表
 */
export const getUserItems = async (
  filters: PortfolioFilterParams
): Promise<PaginatedResponse<PortfolioItem>> => {
  const params = new URLSearchParams();
  params.append('filters', JSON.stringify(filters));
  return get(`/portfolio/items?${params.toString()}`);
};

/**
 * 获取用户的挂单列表
 * @param filters 过滤参数
 * @returns 挂单列表
 */
export const getUserListings = async (
  filters: PortfolioFilterParams
): Promise<PaginatedResponse<PortfolioListing>> => {
  const params = new URLSearchParams();
  params.append('filters', JSON.stringify(filters));
  return get(`/portfolio/listings?${params.toString()}`);
};

/**
 * 获取用户的出价列表
 * @param filters 过滤参数
 * @returns 出价列表
 */
export const getUserBids = async (
  filters: PortfolioFilterParams
): Promise<PaginatedResponse<PortfolioBid>> => {
  const params = new URLSearchParams();
  params.append('filters', JSON.stringify(filters));
  return get(`/portfolio/bids?${params.toString()}`);
};

/**
 * 获取用户 Portfolio 概览
 * @param userAddress 用户地址
 * @returns Portfolio 概览数据
 */
export const getPortfolioOverview = async (userAddress: string) => {
  const [collectionsResult, itemsResult] = await Promise.all([
    getUserCollections([userAddress]),
    getUserItems({
      userAddresses: [userAddress],
      page: 1,
      pageSize: 1,
    }),
  ]);

  const totalValue = collectionsResult.result.reduce(
    (sum, item) => sum + parseFloat(item.totalValue || '0'),
    0
  );

  return {
    collections: collectionsResult.result,
    totalItems: itemsResult.total,
    totalValue: totalValue.toString(),
  };
};
