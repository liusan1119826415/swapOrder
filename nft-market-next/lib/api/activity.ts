import { get } from './client';

export interface ActivityEvent {
  event_type: string;      // 'sale', 'listing', 'bid', 'transfer'
  event_time: number;
  image_url?: string;
  collection_address: string;
  collection_name?: string;
  collection_image_uri?: string;
  token_id: string;
  item_name?: string;
  currency?: string;
  price?: string;
  maker?: string;
  taker?: string;
  tx_hash?: string;
  marketplace_id?: number;
  chain_id?: number;
}

interface PaginatedResponse<T = any> {
  result: T[];
  count: number;
}

interface ActivityMultiChainFilterParams {
  chainId?: number[];
  collectionAddresses?: string[];
  tokenId?: string;
  userAddresses?: string[];
  eventTypes?: string[];
  page?: number;
  pageSize?: number;
}

/**
 * 获取 NFT 活动历史（多链）
 * @param chainId - 链 ID 数组
 * @param collectionAddr - Collection 地址
 * @param tokenId - Token ID
 * @param eventTypes - 事件类型数组：['sale', 'listing', 'bid', 'transfer']
 * @param page - 页码
 * @param pageSize - 每页数量
 */
export const getActivity = async (
  chainId: number | number[],
  collectionAddr: string,
  tokenId: string,
  eventTypes: string[] = [],
  page: number = 1,
  pageSize: number = 20,
): Promise<PaginatedResponse<ActivityEvent>> => {
  // 构建 filters 参数（JSON 格式）
  const filters: ActivityMultiChainFilterParams = {
    chainId: Array.isArray(chainId) ? chainId : [chainId],
    collectionAddresses: collectionAddr ? [collectionAddr] : [],
    tokenId: tokenId,
    eventTypes: eventTypes,
    page: page,
    pageSize: pageSize,
  };

  const params = new URLSearchParams();
  params.append('filters', JSON.stringify(filters));

  return get(`/activities?${params.toString()}`);
};
