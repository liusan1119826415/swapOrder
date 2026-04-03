/**
 * EasySwap Order Types
 * TypeScript type definitions matching Solidity structs from LibOrder.sol
 */

// Order Side - List (sell) or Bid (buy)
export enum OrderSide {
  List = 0, // Sell NFT
  Bid = 1,  // Buy NFT (make offer)
}

// Sale Kind - Fixed price for collection or item
export enum SaleKind {
  FixedPriceForCollection = 0,
  FixedPriceForItem = 1,
}

// NFT Asset structure
export interface OrderAsset {
  tokenId: string;
  collection: string;
  amount: number; // uint96
}

// Order structure (matches LibOrder.Order in Solidity)
export interface Order {
  side: OrderSide;
  saleKind: SaleKind;
  maker: string;
  nft: OrderAsset;
  price: string; // uint128 - unit price in wei
  expiry: number; // uint64 - expiration timestamp
  salt: number; // uint64 - random number for uniqueness
}

// Edit detail for order modification
export interface EditDetail {
  oldOrderKey: string; // bytes32
  newOrder: Order;
}

// Match detail for order matching
export interface MatchDetail {
  sellOrder: Order;
  buyOrder: Order;
}

// Order status enumeration
export enum OrderStatus {
  Active = 0,
  Inactive = 1,
  Expired = 2,
  Cancelled = 3,
  Filled = 4,
  NeedSign = 5,
}

// Order type enumeration
export enum OrderType {
  Listing = 1,      // Sell order
  Offer = 2,        // Bid for specific item
  CollectionBid = 3, // Bid for any item in collection
  ItemBid = 4,      // Bid for specific item
}

// Order info returned from API
export interface OrderInfo {
  orderId: string;
  orderStatus: OrderStatus;
  orderType: OrderType;
  collectionAddress: string;
  tokenId: string;
  price: string;
  maker: string;
  taker?: string;
  expiry: number;
  eventTime: number;
  currencyAddress: string;
  chainId: number;
}

// Create order parameters
export interface CreateOrderParams {
  side: OrderSide;
  saleKind: SaleKind;
  collectionAddress: string;
  tokenId: string;
  price: string; // in wei
  expiry: number; // timestamp
  salt?: number; // optional, will be generated if not provided
  amount?: number; // default 1
}

// Edit order parameters
export interface EditOrderParams {
  oldOrderKey: string;
  newPrice: string; // new price in wei
  newExpiry?: number; // new expiration timestamp
  newSalt?: number; // optional new salt
}

// Match order parameters for buying/selling
export interface MatchOrderParams {
  sellOrder: Order;
  buyOrder: Order;
}

/**
 * Generate a random salt for order uniqueness
 */
export function generateSalt(): number {
  return Math.floor(Math.random() * Number.MAX_SAFE_INTEGER);
}

/**
 * Calculate order expiry timestamp
 * @param hours number of hours from now
 */
export function calculateExpiry(hours: number): number {
  return Math.floor(Date.now() / 1000) + hours * 3600;
}

/**
 * Convert ETH to Wei for price
 */
export function ethToWei(eth: string): string {
  const ethValue = parseFloat(eth);
  // Use BigInt for precise calculation to avoid scientific notation
  const wei = BigInt(Math.floor(ethValue * 1e18));
  return wei.toString();
}

/**
 * Convert Wei to ETH for display
 */
export function weiToEth(wei: string): string {
  const weiValue = BigInt(wei);
  return (Number(weiValue) / 1e18).toFixed(6);
}

export default {
  OrderSide,
  SaleKind,
  OrderStatus,
  OrderType,
};