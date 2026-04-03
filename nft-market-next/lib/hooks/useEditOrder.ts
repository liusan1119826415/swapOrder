/**
 * useEditOrder Hook
 * Edit existing orders on EasySwapOrderBook contract
 * 
 * This hook handles:
 * - Modify listing price
 * - Modify bid price
 * - Extend order expiration
 */

import { useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useCallback } from 'react';
import { EasySwapOrderBookABI } from '@/lib/contracts/abis';
import { getOrderBookAddress } from '@/lib/contracts/addresses';
import { EditOrderParams, EditDetail, generateSalt, Order } from '@/lib/contracts/types';

interface UseEditOrderOptions {
  chainId: number;
}

interface UseEditOrderReturn {
  editOrders: (editDetails: EditDetail[]) => Promise<string>;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
  txHash: string | null;
  reset: () => void;
}

/**
 * Hook to edit orders (modify price/expiry)
 * 
 * @param chainId - The chain ID where the order was created
 * @returns Object with edit function and state
 */
export function useEditOrder({ chainId }: UseEditOrderOptions): UseEditOrderReturn {
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

  const editOrders = useCallback(async (editDetails: EditDetail[]): Promise<string> => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }
    
    if (!orderBookAddress || orderBookAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error(`OrderBook not configured for chain ${chainId}`);
    }

    if (!editDetails || editDetails.length === 0) {
      throw new Error('At least one edit detail is required');
    }

 

    // Build edit details with proper types
    const formattedEditDetails = editDetails.map(detail => ({
      oldOrderKey: detail.oldOrderKey,
      newOrder: {
        side: detail.newOrder.side,
        saleKind: detail.newOrder.saleKind,
        maker: detail.newOrder.maker,
        nft: {
          tokenId: BigInt(detail.newOrder.nft.tokenId),
          collection: detail.newOrder.nft.collection,
          amount: BigInt(detail.newOrder.nft.amount),
        },
        price: typeof detail.newOrder.price === 'string' ? BigInt(detail.newOrder.price) : detail.newOrder.price,
        expiry: BigInt(detail.newOrder.expiry),
        salt: BigInt(detail.newOrder.salt),
      },
    }));

    // Calculate total value for bid orders
    let totalValue = BigInt(0);
    for (const detail of editDetails) {
      if (detail.newOrder.side === 1) { // Bid
        const newPrice = typeof detail.newOrder.price === 'string' ? BigInt(detail.newOrder.price) : detail.newOrder.price;
        const amount = BigInt(detail.newOrder.nft.amount);
        totalValue += newPrice * amount;
      }
    }

    // Execute the contract write
    writeContract({
      address: orderBookAddress as `0x${string}`,
      abi: EasySwapOrderBookABI,
      functionName: 'editOrders',
      args: [formattedEditDetails as never],
      value: totalValue,
      gas: BigInt(8_000_000), // Set reasonable gas limit (8M, below 16.7M cap)
    });

    return hash || '';
  }, [userAddress, orderBookAddress, chainId, writeContract, hash]);

  return {
    editOrders,
    isPending,
    isConfirming,
    isConfirmed,
    error: error as Error | null,
    txHash: hash || null,
    reset,
  };
}

/**
 * Hook to edit a single order's price
 */
export function useEditOrderPrice({ chainId }: UseEditOrderOptions) {
  const { editOrders, isPending, isConfirming, isConfirmed, error, txHash, reset } = 
    useEditOrder({ chainId });

  const editPrice = useCallback(async (
    oldOrderKey: string,
    oldOrder: Order,
    newPriceInWei: string,
    newExpiry?: number
  ) => {
    const newSalt = generateSalt();
    const expiry = newExpiry || oldOrder.expiry;

    // Convert price string to BigInt if it's not already
    let priceBigInt: bigint;
    try {
      priceBigInt = BigInt(newPriceInWei);
    } catch {
      // If conversion fails, assume it's already a valid number string and parse it
      priceBigInt = BigInt(Math.floor(parseFloat(newPriceInWei) * 1e18));
    }

    const editDetails: EditDetail[] = [{
      oldOrderKey,
      newOrder: {
        ...oldOrder,
        price: priceBigInt.toString(),
        expiry,
        salt: newSalt,
      },
    }];

    return editOrders(editDetails);
  }, [editOrders]);

  return {
    editPrice,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    txHash,
    reset,
  };
}

export default useEditOrder;