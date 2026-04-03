/**
 * useCancelOrder Hook
 * Cancel existing orders on EasySwapOrderBook contract
 * 
 * This hook handles:
 * - Cancel listing (sell order)
 * - Cancel bid (buy offer)
 */

import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useCallback } from 'react';
import { EasySwapOrderBookABI } from '@/lib/contracts/abis';
import { getOrderBookAddress } from '@/lib/contracts/addresses';

interface UseCancelOrderOptions {
  chainId: number;
}

interface UseCancelOrderReturn {
  cancelOrders: (orderKeys: string[]) => Promise<string>;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
  txHash: string | null;
  reset: () => void;
}

/**
 * Hook to cancel orders
 * 
 * @param chainId - The chain ID where the order was created
 * 
 * @returns Object with cancel function and state
 * 
 * @example
 * const { cancelOrders } = useCancelOrder({ chainId: 11155111 });
 * await cancelOrders(['0x...orderKey1', '0x...orderKey2']);
 */
export function useCancelOrder({ chainId }: UseCancelOrderOptions): UseCancelOrderReturn {
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

  const cancelOrders = useCallback(async (orderKeys: string[]): Promise<string> => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    if (!orderBookAddress || orderBookAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error(`OrderBook not configured for chain ${chainId}`);
    }

    if (!orderKeys || orderKeys.length === 0) {
      throw new Error('At least one order key is required');
    }

    // Filter out empty or invalid order keys
    const validOrderKeys = orderKeys.filter(
      key => key && key.startsWith('0x') && key.length === 66
    );

    if (validOrderKeys.length === 0) {
      throw new Error('No valid order keys provided');
    }

    // Execute the contract write
    writeContract({
      address: orderBookAddress as `0x${string}`,
      abi: EasySwapOrderBookABI,
      functionName: 'cancelOrders',
      args: [validOrderKeys as never],
      gas: BigInt(8_000_000), // Set reasonable gas limit (8M, below 16.7M cap)
    });

    return hash || '';
  }, [userAddress, orderBookAddress, chainId, writeContract, hash]);

  return {
    cancelOrders,
    isPending,
    isConfirming,
    isConfirmed,
    error: error as Error | null,
    txHash: hash || null,
    reset,
  };
}

/**
 * Hook to cancel a single listing
 */
export function useCancelListing({ chainId }: UseCancelOrderOptions) {
  const { cancelOrders, isPending, isConfirming, isConfirmed, error, txHash, reset } = 
    useCancelOrder({ chainId });

  const cancelListing = useCallback(async (orderKey: string) => {
    return cancelOrders([orderKey]);
  }, [cancelOrders]);

  return {
    cancelListing,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    txHash,
    reset,
  };
}

export default useCancelOrder;