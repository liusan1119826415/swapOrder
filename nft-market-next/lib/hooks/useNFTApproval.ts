/**
 * useNFTApproval Hook
 * Check and grant NFT approval for Vault contract
 * 
 * This hook handles:
 * - Check if NFT is approved for Vault (which holds NFTs during trading)
 * - Grant approval for single token or all tokens to Vault
 * - Track approval status and transaction state
 * 
 * IMPORTANT: We approve the Vault contract, not the OrderBook contract,
 * because Vault is responsible for holding NFTs during order matching.
 */

import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { useCallback, useState, useEffect } from 'react';
import { getVaultAddress } from '@/lib/contracts/addresses';

// ERC721 ABI for approval functions
const ERC721_APPROVAL_ABI = [
  {
    name: 'getApproved',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: 'operator', type: 'address' }],
  },
  {
    name: 'isApprovedForAll',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner', type: 'address' },
      { name: 'operator', type: 'address' },
    ],
    outputs: [{ name: 'approved', type: 'bool' }],
  },
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'setApprovalForAll',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'operator', type: 'address' },
      { name: 'approved', type: 'bool' },
    ],
    outputs: [],
  },
] as const;

interface UseNFTApprovalOptions {
  collectionAddress: string;
  tokenId: string;
  chainId: number;
}

interface UseNFTApprovalReturn {
  // Approval status
  isApproved: boolean;
  isApprovedForAll: boolean;
  isLoading: boolean;
  
  // Grant approval
  grantApproval: () => Promise<string>;
  grantApprovalForAll: () => Promise<string>;
  
  // Transaction state
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
  txHash: string | null;
  
  // Refresh approval status
  refetch: () => void;
}

/**
 * Hook to check and manage NFT approval status
 * 
 * @param collectionAddress - The NFT collection contract address
 * @param tokenId - The token ID to check approval for
 * @param chainId - The chain ID
 * 
 * @returns Object with approval status and functions
 * 
 * @example
 * const { isApproved, grantApproval, isPending } = useNFTApproval({
 *   collectionAddress: '0x...',
 *   tokenId: '1',
 *   chainId: 11155111,
 * });
 * 
 * if (!isApproved) {
 *   await grantApproval();
 * }
 */
export function useNFTApproval({
  collectionAddress,
  tokenId,
  chainId,
}: UseNFTApprovalOptions): UseNFTApprovalReturn {
  const { address: ownerAddress } = useAccount();
  const vaultAddress = getVaultAddress(chainId);
  
  const [isApproved, setIsApproved] = useState(false);
  
  // Check if specific token is approved
  const { data: approvedAddress, isLoading: isLoadingApproved, refetch: refetchApproved } = useReadContract({
    address: collectionAddress as `0x${string}`,
    abi: ERC721_APPROVAL_ABI,
    functionName: 'getApproved',
    args: [BigInt(tokenId)],
    query: {
      enabled: !!collectionAddress && !!tokenId,
    },
  });
  
  // Check if operator is approved for all tokens
  const { data: isApprovedForAllData, isLoading: isLoadingForAll, refetch: refetchForAll } = useReadContract({
    address: collectionAddress as `0x${string}`,
    abi: ERC721_APPROVAL_ABI,
    functionName: 'isApprovedForAll',
    args: [ownerAddress!, vaultAddress as `0x${string}`],
    query: {
      enabled: !!ownerAddress && !!vaultAddress,
    },
  });
  
  // Write contract for granting approval
  const {
    data: hash,
    writeContract,
    isPending,
    error,
    reset,
  } = useWriteContract();
  
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  });
  
  // Update approval status when data changes
  useEffect(() => {
    // Check if approved for all
    if (isApprovedForAllData === true) {
      setIsApproved(true);
      return;
    }
    
    // Check if specific token is approved
    if (approvedAddress && vaultAddress) {
      const isTokenApproved = 
        (approvedAddress as string).toLowerCase() === vaultAddress.toLowerCase();
      setIsApproved(isTokenApproved);
      return;
    }
    
    setIsApproved(false);
  }, [approvedAddress, isApprovedForAllData, vaultAddress, collectionAddress, tokenId, ownerAddress]);
  
  // Refetch approval status after confirmation
  useEffect(() => {
    if (isConfirmed) {
      refetchApproved();
      refetchForAll();
    }
  }, [isConfirmed, refetchApproved, refetchForAll]);
  
  /**
   * Grant approval for a specific token to Vault
   */
  const grantApproval = useCallback(async (): Promise<string> => {
    if (!vaultAddress) {
      throw new Error('Vault address not configured');
    }
    
    writeContract({
      address: collectionAddress as `0x${string}`,
      abi: ERC721_APPROVAL_ABI,
      functionName: 'approve',
      args: [vaultAddress as `0x${string}`, BigInt(tokenId)],
    });
    
    return hash || '';
  }, [collectionAddress, vaultAddress, tokenId, writeContract, hash]);
  
  /**
   * Grant approval for all tokens in the collection to Vault
   * This is more convenient for users with multiple NFTs
   */
  const grantApprovalForAll = useCallback(async (): Promise<string> => {
    if (!vaultAddress) {
      throw new Error('Vault address not configured');
    }
    
    writeContract({
      address: collectionAddress as `0x${string}`,
      abi: ERC721_APPROVAL_ABI,
      functionName: 'setApprovalForAll',
      args: [vaultAddress as `0x${string}`, true],
    });
    
    return hash || '';
  }, [collectionAddress, vaultAddress, writeContract, hash]);
  
  /**
   * Refresh approval status
   */
  const refetch = useCallback(() => {
    refetchApproved();
    refetchForAll();
  }, [refetchApproved, refetchForAll]);
  
  return {
    isApproved,
    isApprovedForAll: isApprovedForAllData === true,
    isLoading: isLoadingApproved || isLoadingForAll,
    grantApproval,
    grantApprovalForAll,
    isPending,
    isConfirming,
    isConfirmed,
    error: error as Error | null,
    txHash: hash || null,
    refetch,
  };
}

export default useNFTApproval;
