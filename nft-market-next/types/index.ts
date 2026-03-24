// Chain Types
export interface ChainInfo {
  id: number;
  name: string;
  label: string;
}

// Collection Types
export interface Collection {
  id: string;
  address: string;
  name: string;
  symbol: string;
  description?: string;
  image: string;
  bannerImage?: string;
  creator: string;
  isVerified: boolean;
  floorPrice: string;
  totalVolume: string;
  itemCount: number;
  ownerCount: number;
  change24h: number;
  change7d?: number;
  change30d?: number;
  chainId: number;
  createdAt?: string;
}

export interface CollectionRankingInfo {
  address: string;
  name: string;
  image: string;
  floorPrice: string;
  volume: string;
  change24h: number;
  chainId: number;
}

// NFT Item Types
export interface NFTItem {
  id: string;
  tokenId: string;
  name: string;
  description?: string;
  image: string;
  collection: {
    address: string;
    name: string;
  };
  owner: string;
  price?: string;
  priceUsd?: string;
  highestBid?: string;
  traits?: Trait[];
  rarityRank?: number;
  mintNumber?: number;
  chainId: number;
  status: 'listed' | 'auction' | 'sold' | 'unlisted';
  createdAt?: string;
  listedAt?: string;
}

export interface Trait {
  traitType: string;
  value: string;
  displayType?: string;
  rarity?: string;
  count?: number;
  total?: number;
}

// Activity Types
export interface Activity {
  id: string;
  event: 'sale' | 'list' | 'transfer' | 'bid' | 'cancel';
  item: {
    tokenId: string;
    name: string;
    image: string;
    collection: {
      address: string;
      name: string;
    };
  };
  price?: string;
  priceUsd?: string;
  from: string;
  to?: string;
  txHash?: string;
  chainId: number;
  timestamp: string;
}

// Portfolio Types
export interface PortfolioCollection {
  collection: Collection;
  itemCount: number;
  totalValue: string;
}

export interface PortfolioItem extends NFTItem {
  listingPrice?: string;
  listingExpiresAt?: string;
}

export interface PortfolioListing {
  id: string;
  item: PortfolioItem;
  price: string;
  priceUsd?: string;
  expiresAt: string;
  createdAt: string;
}

export interface PortfolioBid {
  id: string;
  item: PortfolioItem;
  bidPrice: string;
  bidPriceUsd?: string;
  expiresAt: string;
  createdAt: string;
}

// User Types
export interface User {
  address: string;
  username?: string;
  avatar?: string;
  bio?: string;
  totalValue: string;
  walletBalance: string;
  nftCount: number;
  createdAt?: string;
}

// API Response Types
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// Filter Types
export interface CollectionFilterParams {
  chainId: number;
  page?: number;
  pageSize?: number;
  sortBy?: 'volume' | 'floor_price' | 'items' | 'owners' | 'created_at';
  sortOrder?: 'asc' | 'desc';
}

export interface CollectionItemFilterParams {
  chainId: number;
  page?: number;
  pageSize?: number;
  sortBy?: 'price' | 'rarity' | 'listed_at' | 'created_at';
  sortOrder?: 'asc' | 'desc';
  minPrice?: string;
  maxPrice?: string;
  traits?: Record<string, string[]>;
  status?: string[];
}

export interface ActivityFilterParams {
  chainId?: number[];
  collectionAddresses?: string[];
  tokenId?: string;
  userAddresses?: string[];
  eventTypes?: string[];
  page?: number;
  pageSize?: number;
}

export interface PortfolioFilterParams {
  chainId?: number[];
  userAddresses: string[];
  collectionAddresses?: string[];
  page?: number;
  pageSize?: number;
}

// Price History
export interface PriceHistoryPoint {
  timestamp: string;
  price: string;
  volume?: string;
}

export interface PriceHistory {
  collectionAddress: string;
  duration: '24h' | '7d' | '30d' | 'all';
  data: PriceHistoryPoint[];
}

// Analytics Types
export interface AnalyticsStats {
  totalVolume: string;
  totalVolumeUsd: string;
  totalSales: number;
  activeUsers: number;
  averagePrice: string;
  averagePriceUsd: string;
  marketCap: string;
  marketCapUsd: string;
  totalCollections: number;
  totalItems: number;
}

export interface TopCollection {
  rank: number;
  name: string;
  address: string;
  volume: string;
  volumeChange: number;
  sales: number;
  salesChange: number;
  floorPrice: string;
  floorChange: number;
  owners: number;
  items: number;
  logo: string;
  isVerified: boolean;
}

export interface AnalyticsFilterParams {
  chainIds?: number[];
  period?: string;
  categories?: string[];
  limit?: number;
}

export interface AnalyticsResponse {
  stats: AnalyticsStats;
  topCollections: TopCollection[];
  trendingNow: TopCollection[];
  newCollections: TopCollection[];
}

// Artists Types
export interface ArtistInfo {
  address: string;
  username: string;
  bio?: string;
  avatar: string;
  banner?: string;
  isVerified: boolean;
  totalVolume: string;
  totalSales: number;
  totalItems: number;
  floorPrice: string;
  followers: number;
  socialLinks: {
    twitter?: string;
    discord?: string;
    instagram?: string;
    website?: string;
  };
}

export interface ArtistRanking {
  rank: number;
  address: string;
  username: string;
  avatar: string;
  isVerified: boolean;
  volume: string;
  volumeChange: number;
  sales: number;
  floorPrice: string;
}

export interface ArtistsFilterParams {
  chainIds?: number[];
  period?: string;
  category?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'volume' | 'sales' | 'floor_price';
  sortOrder?: 'asc' | 'desc';
}

export interface ArtistsResponse {
  result: ArtistRanking[];
  total: number;
}

// Auctions Types
export interface AuctionInfo {
  auctionId: string;
  itemName: string;
  imageUri: string;
  collectionName: string;
  collectionAddr: string;
  tokenId: string;
  seller: string;
  highestBidder?: string;
  currentBid: string;
  currentBidUsd?: string;
  reservePrice?: string;
  startPrice: string;
  bidCount: number;
  startTime: number;
  endTime: number;
  status: 'active' | 'ended' | 'cancelled';
  chainId: number;
}

export interface AuctionsFilterParams {
  chainIds?: number[];
  status?: 'active' | 'ending_soon' | 'new';
  collectionAddrs?: string[];
  userAddress?: string;
  priceMin?: string;
  priceMax?: string;
  page?: number;
  pageSize?: number;
}

export interface AuctionsResponse {
  result: AuctionInfo[];
  total: number;
}

// Drops Types
export interface DropInfo {
  dropId: string;
  collectionName: string;
  collectionAddr: string;
  logo: string;
  banner?: string;
  creator: string;
  creatorName: string;
  isVerified: boolean;
  description: string;
  totalSupply: number;
  itemsMinted: number;
  price: string;
  priceUsd?: string;
  mintStartTime: number;
  mintEndTime: number;
  status: 'upcoming' | 'live' | 'sold_out' | 'ended';
  chainId: number;
  categories: string[];
}

export interface DropsFilterParams {
  chainIds?: number[];
  status?: 'upcoming' | 'live' | 'ending_soon' | 'sold_out';
  categories?: string[];
  sortBy?: 'start_time' | 'minted_count';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface DropsResponse {
  result: DropInfo[];
  total: number;
}
