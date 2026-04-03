/**
 * useMakeOrder Hook
 * Create listing (sell) or bid (buy) orders on EasySwapOrderBook contract
 * 
 * This hook handles:
 * - Listing (List): Sell NFT at fixed price
 * - Bid (Bid): Make offer to buy NFT
 */

import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useCallback } from 'react';
import { EasySwapOrderBookABI } from '@/lib/contracts/abis';
import { getOrderBookAddress } from '@/lib/contracts/addresses';
import { 
  OrderSide, 
  SaleKind, 
  Order,
  CreateOrderParams,
  generateSalt 
} from '@/lib/contracts/types';

interface UseMakeOrderOptions {
  chainId: number;
}

interface UseMakeOrderReturn {
  writeContract: (params: CreateOrderParams) => Promise<string>;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
  txHash: string | null;
  reset: () => void;
}

/**
 * Hook to create orders (listing or bid)
 * 
 * @param chainId - The chain ID where the order will be created
 * 
 * @returns Object with write functions and state
 * 
 * @example
 * // Create a listing (sell)
 * const { writeContract } = useMakeOrder({ chainId: 11155111 });
 * await writeContract({
 *   side: OrderSide.List,
 *   saleKind: SaleKind.FixedPriceForItem,
 *   collectionAddress: '0x...',
 *   tokenId: '1',
 *   price: '1000000000000000000', // 1 ETH in wei
 *   expiry: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
 * });
 */
export function useMakeOrder({ chainId }: UseMakeOrderOptions): UseMakeOrderReturn {
  const { address: userAddress } = useAccount();
  const orderBookAddress = getOrderBookAddress(chainId);

  const { 
    data: hash, 
    writeContract, 
    isPending,
    error,
    reset 
  } = useWriteContract();

  const { 
    isLoading: isConfirming, 
    isSuccess: isConfirmed 
  } = useWaitForTransactionReceipt({
    hash,
  });

  const createOrder = useCallback(async (params: CreateOrderParams): Promise<string> => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    if (!orderBookAddress || orderBookAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error(`OrderBook not configured for chain ${chainId}`);
    }

    // Validate required parameters
    if (!params.collectionAddress || !params.tokenId) {
      throw new Error('Collection address and token ID are required');
    }

    if (!params.price || params.price === '0') {
      throw new Error('Price must be greater than 0');
    }

    if (!params.expiry || params.expiry <= Math.floor(Date.now() / 1000)) {
      throw new Error('Expiry must be in the future');
    }

    // Generate salt if not provided
    const salt = params.salt || generateSalt();

    // Build the order object with proper types for wagmi
    const order = {
      side: params.side,
      saleKind: params.saleKind,
      maker: userAddress,
      nft: {
        tokenId: BigInt(params.tokenId),
        collection: params.collectionAddress,
        amount: BigInt(params.amount || 1),
      },
      price: BigInt(params.price),
      expiry: BigInt(params.expiry),
      salt: BigInt(salt),
    };

    // Calculate value for bid orders (price * amount)
    const value = params.side === OrderSide.Bid 
      ? BigInt(params.price) * BigInt(params.amount || 1)
      : BigInt(0);

    // Execute the contract write
    writeContract({
      address: orderBookAddress as `0x${string}`,
      abi: EasySwapOrderBookABI,
      functionName: 'makeOrders',
      args: [[order] as never],
      value,
      gas: BigInt(8_000_000), // Set reasonable gas limit (8M, below 16.7M cap)
    });

    return hash || '';
  }, [userAddress, orderBookAddress, chainId, writeContract, hash]);

  return {
    writeContract: createOrder,
    isPending,
    isConfirming,
    isConfirmed,
    error: error as Error | null,
    txHash: hash || null,
    reset,
  };
}

/**
 * Hook specifically for creating a listing (selling NFT)
 */
export function useCreateListing({ chainId }: UseMakeOrderOptions) {
  const { writeContract, isPending, isConfirming, isConfirmed, error, txHash, reset } = 
    useMakeOrder({ chainId });

  const createListing = useCallback(async (
    collectionAddress: string,
    tokenId: string,
    priceInWei: string,
    expiryHours: number = 168 // 7 days default
  ) => {
    const expiry = Math.floor(Date.now() / 1000) + expiryHours * 3600;
    
    return writeContract({
      side: OrderSide.List,
      saleKind: SaleKind.FixedPriceForItem,
      collectionAddress,
      tokenId,
      price: priceInWei,
      expiry,
    });
  }, [writeContract]);

  return {
    createListing,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    txHash,
    reset,
  };
}

/**
 * Hook specifically for creating a bid (making offer)
 */
export function useMakeBid({ chainId }: UseMakeOrderOptions) {
  const { writeContract, isPending, isConfirming, isConfirmed, error, txHash, reset } = 
    useMakeOrder({ chainId });

  const makeBid = useCallback(async (
    collectionAddress: string,
    tokenId: string,
    priceInWei: string,
    expiryHours: number = 168 // 7 days default
  ) => {
    const expiry = Math.floor(Date.now() / 1000) + expiryHours * 3600;
    
    return writeContract({
      side: OrderSide.Bid,
      saleKind: SaleKind.FixedPriceForItem,
      collectionAddress,
      tokenId,
      price: priceInWei,
      expiry,
    });
  }, [writeContract]);

  return {
    makeBid,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    txHash,
    reset,
  };
}

export default useMakeOrder;