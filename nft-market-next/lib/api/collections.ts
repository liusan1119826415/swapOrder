import { get } from './client';
import type {
  Collection,
  CollectionRankingInfo,
  NFTItem,
  Trait,
  PriceHistory,
  CollectionFilterParams,
  CollectionItemFilterParams,
  PaginatedResponse,
} from '@/types';

/**
 * 获取 NFT 集合排名
 * @param limit 返回数量限制
 * @param range 时间范围: 15m, 1h, 6h, 1d, 7d, 30d
 * @returns 排名列表
 */
export const getCollectionsRanking = async (
  limit: number = 10,
  range: string = '1d'
): Promise<{ result: CollectionRankingInfo[] }> => {
  return get(`/collections/ranking?limit=${limit}&range=${range}`);
};

/**
 * 获取指定 Collection 详情
 * @param address Collection 合约地址
 * @param chainId 链 ID
 * @returns Collection 详情
 */
export const getCollectionDetail = async (
  address: string,
  chainId: number
): Promise<Collection> => {
  return get(`/collections/${address}?chain_id=${chainId}`);
};

/**
 * 获取 Collection 的 NFT 列表
 * @param address Collection 合约地址
 * @param filters 过滤参数
 * @returns NFT 列表
 */
export const getCollectionItems = async (
  address: string,
  filters: CollectionItemFilterParams
): Promise<PaginatedResponse<NFTItem>> => {
  const params = new URLSearchParams();
  params.append('filters', JSON.stringify(filters));
  return get(`/collections/${address}/items?${params.toString()}`);
};

/**
 * 获取指定 NFT Item 详情
 * @param address Collection 合约地址
 * @param tokenId Token ID
 * @param chainId 链 ID
 * @returns NFT Item 详情
 */
export const getItemDetail = async (
  address: string,
  tokenId: string,
  chainId: number
): Promise<NFTItem> => {
  return get(`/collections/${address}/${tokenId}?chain_id=${chainId}`);
};

/**
 * 获取 NFT Item 的属性
 * @param address Collection 合约地址
 * @param tokenId Token ID
 * @param chainId 链 ID
 * @returns 属性列表
 */
export const getItemTraits = async (
  address: string,
  tokenId: string,
  chainId: number
): Promise<{ result: Trait[] }> => {
  return get(`/collections/${address}/${tokenId}/traits?chain_id=${chainId}`);
};

/**
 * 获取历史销售数据
 * @param address Collection 合约地址
 * @param chainId 链 ID
 * @param duration 时间范围: 24h, 7d, 30d
 * @returns 价格历史数据
 */
export const getHistorySales = async (
  address: string,
  chainId: number,
  duration: '24h' | '7d' | '30d' = '7d'
): Promise<{ result: PriceHistory }> => {
  return get(`/collections/${address}/history-sales?chain_id=${chainId}&duration=${duration}`);
};

/**
 * 获取 Collection 的 Bids 信息
 * @param address Collection 合约地址
 * @param chainId 链 ID
 * @param page 页码
 * @param pageSize 每页数量
 * @returns Bids 列表
 */
export const getCollectionBids = async (
  address: string,
  chainId: number,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<unknown>> => {
  const filters = { chain_id: chainId, page, page_size: pageSize };
  const params = new URLSearchParams();
  params.append('filters', JSON.stringify(filters));
  return get(`/collections/${address}/bids?${params.toString()}`);
};

/**
 * 获取指定 Item 的 Bids 信息
 * @param address Collection 合约地址
 * @param tokenId Token ID
 * @param chainId 链 ID
 * @param page 页码
 * @param pageSize 每页数量
 * @returns Bids 列表
 */
export const getItemBids = async (
  address: string,
  tokenId: string,
  chainId: number,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedResponse<unknown>> => {
  const filters = { chain_id: chainId, page, page_size: pageSize };
  const params = new URLSearchParams();
  params.append('filters', JSON.stringify(filters));
  return get(`/collections/${address}/${tokenId}/bids?${params.toString()}`);
};

/**
 * 获取 NFT Item 图片信息
 * @param address Collection 合约地址
 * @param tokenId Token ID
 * @param chainId 链 ID
 * @returns 图片信息
 */
export const getItemImage = async (
  address: string,
  tokenId: string,
  chainId: number
): Promise<{ result: { image_url: string } }> => {
  return get(`/collections/${address}/${tokenId}/image?chain_id=${chainId}`);
};

/**
 * 获取 NFT Item Owner 信息
 * @param address Collection 合约地址
 * @param tokenId Token ID
 * @param chainId 链 ID
 * @returns Owner 地址
 */
export const getItemOwner = async (
  address: string,
  tokenId: string,
  chainId: number
): Promise<{ result: { owner: string } }> => {
  return get(`/collections/${address}/${tokenId}/owner?chain_id=${chainId}`);
};
