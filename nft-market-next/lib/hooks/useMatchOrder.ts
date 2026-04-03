/**
 * useMatchOrder Hook
 * Match orders on EasySwapOrderBook contract
 * 
 * This hook handles:
 * - Buy NFT (accept listing / match sell order with buy order)
 * - Sell NFT (accept bid / match buy order with sell order)
 */

import { useWriteContract, useWaitForTransactionReceipt, useAccount, useWalletClient } from 'wagmi';
import { useCallback } from 'react';
import { EasySwapOrderBookABI } from '@/lib/contracts/abis';
import { getOrderBookAddress } from '@/lib/contracts/addresses';
import { OrderSide, SaleKind, Order, generateSalt } from '@/lib/contracts/types';
import { createPublicClient, http, getContract, type PublicClient } from 'viem';
import { publicActions } from 'viem';
import { type Chain as ViemChain } from 'viem';
import { sepolia } from 'viem/chains';

interface UseMatchOrderOptions {
  chainId: number;
}

interface UseMatchOrderReturn {
  matchOrder: (sellOrder: Order, buyOrder: Order, value?: bigint) => Promise<string>;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
  txHash: string | null;
  reset: () => void;
}

/**
 * Hook to match orders (buy/sell NFTs)
 * 
 * @param chainId - The chain ID for the transaction
 * @returns Object with match function and state
 */
export function useMatchOrder({ chainId }: UseMatchOrderOptions): UseMatchOrderReturn {
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

  const matchOrder = useCallback(async (
    sellOrder: Order,
    buyOrder: Order,
    value?: bigint
  ): Promise<string> => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    if (!orderBookAddress || orderBookAddress === '0x0000000000000000000000000000000000000000') {
      throw new Error(`OrderBook not configured for chain ${chainId}`);
    }

    // Calculate ETH value needed
    // For accept offer (seller calls): value should be 0 (buyer already locked ETH)
    // For buy NFT (buyer calls): value should be the purchase price
    const ethValue = value !== undefined ? value : BigInt(buyOrder.price);

    console.log('ETH value for match:', ethValue.toString());
    console.log('value param:', value?.toString(), 'buyOrder.price:', buyOrder.price);

    // Build formatted orders with proper types
    const formattedSellOrder = {
      side: sellOrder.side,
      saleKind: sellOrder.saleKind,
      maker: sellOrder.maker,
      nft: {
        tokenId: BigInt(sellOrder.nft.tokenId),
        collection: sellOrder.nft.collection,
        amount: BigInt(sellOrder.nft.amount),
      },
      price: BigInt(sellOrder.price),
      expiry: BigInt(sellOrder.expiry),
      salt: BigInt(sellOrder.salt),
    };

    const formattedBuyOrder = {
      side: buyOrder.side,
      saleKind: buyOrder.saleKind,
      maker: buyOrder.maker,
      nft: {
        tokenId: BigInt(buyOrder.nft.tokenId),
        collection: buyOrder.nft.collection,
        amount: BigInt(buyOrder.nft.amount),
      },
      price: BigInt(buyOrder.price),
      expiry: BigInt(buyOrder.expiry),
      salt: BigInt(buyOrder.salt),
    };
    console.log("====formattedSellOrder====",formattedSellOrder)
    console.log("====formattedBuyOrder====",formattedBuyOrder)


    // Execute the contract write - call matchOrder (singular) for single order matching
    writeContract({
      address: orderBookAddress as `0x${string}`,
      abi: EasySwapOrderBookABI,
      functionName: 'matchOrder',
      args: [formattedSellOrder as never, formattedBuyOrder as never],
      value: ethValue, // ✅ Add ETH value for purchase (contract will refund excess)
      gas: BigInt(500_000), // Set reasonable gas limit for single match
    });

    return hash || '';
  }, [userAddress, orderBookAddress, chainId, writeContract, hash]);

  return {
    matchOrder,
    isPending,
    isConfirming,
    isConfirmed,
    error: error as Error | null,
    txHash: hash || null,
    reset,
  };
}

/**
 * Hook to buy NFT (accept a listing)
 * 
 * @param chainId - The chain ID for the transaction
 * @returns Object with buy function and state
 * 
 * @example
 * // Buy using order key (recommended)
 * const { buyNFTByOrderKey } = useBuyNFT({ chainId: 11155111 });
 * await buyNFTByOrderKey('0x6db99803a403de7c5857ae995f06828b4be562c1e65bf3fb10c1a562a54c34f6');
 * 
 * @example
 * // Buy using existing order object
 * const { buyNFT } = useBuyNFT({ chainId: 11155111 });
 * await buyNFT(listingOrder, priceInWei);
 */
export function useBuyNFT({ chainId }: UseMatchOrderOptions) {
  const { address: userAddress, isConnected } = useAccount();
  const { matchOrder, isPending, isConfirming, isConfirmed, error, txHash, reset } = 
    useMatchOrder({ chainId });
  
  // Get wallet client at the top level (not inside callback)
  const { data: walletClient } = useWalletClient({ chainId });

  /**
   * Buy NFT by providing an existing listing order
   */
  const buyNFT = useCallback(async (
    listingOrder: Order,      // The existing listing (sell order)
    priceInWei: string        // Price to pay
  ) => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    console.log('listingOrder:', listingOrder);

    // Construct a matching buy order
    const buyOrder: Order = {
      side: OrderSide.Bid,
      saleKind: SaleKind.FixedPriceForItem,
      maker: userAddress,
      nft: {
        tokenId: listingOrder.nft.tokenId,
        collection: listingOrder.nft.collection,
        amount: listingOrder.nft.amount,
      },
      price: priceInWei,
      expiry: Math.floor(Date.now() / 1000) + 86400 * 7, // 7 days
      salt: generateSalt(),
    };
    console.log('Constructed buyOrder:', buyOrder);


    const matchResult = await matchOrder(listingOrder, buyOrder, BigInt(priceInWei));
    return matchResult;
  }, [matchOrder, userAddress]);

  /**
   * Buy NFT by order key (fetches order from chain automatically)
   * 
   * @param orderKey - The order hash/key to purchase
   * @returns Transaction hash
   */
  const buyNFTByOrderKey = useCallback(async (
    orderKey: string  // Order key (bytes32)
  ): Promise<string> => {
    if (!isConnected || !userAddress) {
      throw new Error('Wallet not connected');
    }

    try {
      // Create public client with proper chain configuration
      const chainConfig = chainId === 11155111 ? sepolia : ({
        id: chainId,
        name: 'Unknown',
        nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
        rpcUrls: { default: { http: ['https://rpc.sepolia.org'] } },
      } as ViemChain);

      const publicClient: PublicClient = createPublicClient({
        chain: chainConfig,
        transport: http(),
      }).extend(publicActions);

      // Create contract instance
      const orderBookAddress = getOrderBookAddress(chainId);
      if (!orderBookAddress || orderBookAddress === '0x0000000000000000000000000000000000000000') {
        throw new Error(`OrderBook not configured for chain ${chainId}`);
      }

      // Fetch order directly using public client
      const orderInfo: any = await publicClient.readContract({
        address: orderBookAddress as `0x${string}`,
        abi: EasySwapOrderBookABI,
        functionName: 'orders',
        args: [orderKey as `0x${string}`],
      });
      
      console.log('Fetched order from chain:', orderInfo);

      // The fetched order is a BID ORDER (buyer's offer)
      // We need to construct a SELL ORDER to match it
      const buyOrder: Order = {
        side: Number(orderInfo[0].side), // Should be 1 (Bid)
        saleKind: Number(orderInfo[0].saleKind),
        maker: orderInfo[0].maker,
        nft: {
          tokenId: orderInfo[0].nft.tokenId.toString(),
          collection: orderInfo[0].nft.collection,
          amount: Number(orderInfo[0].nft.amount),
        },
        price: orderInfo[0].price.toString(),
        expiry: Number(orderInfo[0].expiry),
        salt: Number(orderInfo[0] .salt),
      };

      console.log('Fetched buyOrder (bid):', buyOrder);

      // Validate order
      if (buyOrder.side !== OrderSide.Bid) {
        throw new Error('Invalid order: expected a Bid Order');
      }

      if (buyOrder.nft.collection === '0x0000000000000000000000000000000000000000') {
        throw new Error('Invalid order: collection address is zero');
      }

      if (buyOrder.nft.tokenId === '0' || buyOrder.nft.tokenId === '0x0') {
        throw new Error('Invalid order: tokenId is zero');
      }

      // Construct matching sell order (the NFT owner accepts the bid)
      const sellOrder: Order = {
        side: OrderSide.List,
        saleKind: SaleKind.FixedPriceForItem,
        maker: userAddress,
        nft: {
          tokenId: buyOrder.nft.tokenId,
          collection: buyOrder.nft.collection,
          amount: buyOrder.nft.amount,
        },
        price: buyOrder.price,  // Same price as the bid
        expiry: buyOrder.expiry, // Can use same or different expiry
        salt: generateSalt(),     // NEW random salt (critical!)
      };

      console.log('Constructed sellOrder:', sellOrder);
      console.log('Constructed buyOrder:', buyOrder);
      return

      // Execute match using matchOrder (singular)
      // For accept offer: seller calls matchOrder with value=0
      // because buyer already locked ETH in the vault
      return matchOrder(sellOrder, buyOrder, BigInt(0));

    } catch (err: any) {
      console.error('buyNFTByOrderKey error:', err);
      throw new Error(`Failed to buy NFT: ${err.message}`);
    }
  }, [matchOrder, userAddress, isConnected, chainId]);

  return {
    buyNFT,
    buyNFTByOrderKey,
    isPending,
    isConfirming,
    isConfirmed,
    error,
    txHash,
    reset,
  };
}

export default useMatchOrder;