/**
 * useNFTContract Hook
 * Read NFT data directly from ERC721 contracts
 * 
 * This hook provides:
 * - Get NFT metadata (name, description, image)
 * - Get owner of specific NFT
 * - Get token URI
 * - Get balance of user
 * - Get tokens owned by user
 */

import { useEffect, useState, useCallback } from 'react';
import { usePublicClient, useWalletClient, useAccount } from 'wagmi';
import { getContract } from 'viem';

// Minimal ERC721 ABI for reading NFT data
const ERC721_ABI = [
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'owner', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'ownerOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ type: 'address' }],
  },
  {
    name: 'tokenURI',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ type: 'string' }],
  },
  {
    name: 'tokenByIndex',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'index', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'totalSupply',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'Transfer',
    type: 'event',
    inputs: [
      { indexed: true, name: 'from', type: 'address' },
      { indexed: true, name: 'to', type: 'address' },
      { indexed: true, name: 'tokenId', type: 'uint256' },
    ],
  },
] as const;

interface NFTMetadata {
  name: string;
  description?: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

interface UseNFTContractOptions {
  collectionAddress: string;
  chainId: number;
}

interface UseNFTContractReturn {
  // Basic info
  getBalance: (owner: string) => Promise<bigint>;
  getOwner: (tokenId: bigint) => Promise<string>;
  getTokenURI: (tokenId: bigint) => Promise<string>;
  
  // Metadata
  getMetadata: (tokenId: bigint) => Promise<NFTMetadata>;
  fetchAllTokens: (owner: string, limit?: number) => Promise<Array<{
    tokenId: bigint;
    metadata: NFTMetadata;
  }>>;
  
  // State
  isLoading: boolean;
  error: Error | null;
}

/**
 * Parse metadata from tokenURI
 */
async function parseMetadata(tokenURI: string): Promise<NFTMetadata> {
  try {
    // Handle IPFS URIs
    let uri = tokenURI;
    if (tokenURI.startsWith('ipfs://')) {
      uri = `https://gateway.pinata.cloud/ipfs/${tokenURI.replace('ipfs://', '')}`;
    }
    
    // Fetch metadata JSON
    const response = await fetch(uri);
    if (!response.ok) throw new Error('Failed to fetch metadata');
    
    return await response.json();
  } catch (error) {
    console.error('Error parsing metadata:', error);
    // Return basic metadata if parsing fails
    return {
      name: `Token #${tokenURI}`,
      image: '',
    };
  }
}

/**
 * Hook to interact with ERC721 NFT contracts
 */
export function useNFTContract({
  collectionAddress,
  chainId,
}: UseNFTContractOptions): UseNFTContractReturn {
  const publicClient = usePublicClient({ chainId });
  const { data: walletClient } = useWalletClient();
  const { address } = useAccount();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Create contract instance
  const createContract = useCallback(() => {
    if (!publicClient) return null;
    
    return getContract({
      address: collectionAddress as `0x${string}`,
      abi: ERC721_ABI,
      client: publicClient,
    });
  }, [publicClient, collectionAddress]);

  /**
   * Get balance of an address
   */
  const getBalance = useCallback(async (owner: string): Promise<bigint> => {
    if (!publicClient) throw new Error('Public client not available');
    
    const contract = createContract();
    if (!contract) throw new Error('Contract not initialized');
    
    const balance = await contract.read.balanceOf([owner as `0x${string}`]);
    return balance;
  }, [publicClient, createContract]);

  /**
   * Get owner of a specific token
   */
  const getOwner = useCallback(async (tokenId: bigint): Promise<string> => {
    if (!publicClient) throw new Error('Public client not available');
    
    const contract = createContract();
    if (!contract) throw new Error('Contract not initialized');
    
    const owner = await contract.read.ownerOf([tokenId]);
    return owner;
  }, [publicClient, createContract]);

  /**
   * Get token URI
   */
  const getTokenURI = useCallback(async (tokenId: bigint): Promise<string> => {
    if (!publicClient) throw new Error('Public client not available');
    
    const contract = createContract();
    if (!contract) throw new Error('Contract not initialized');
    
    const uri = await contract.read.tokenURI([tokenId]);
    return uri;
  }, [publicClient, createContract]);

  /**
   * Get full metadata for a token
   */
  const getMetadata = useCallback(async (tokenId: bigint): Promise<NFTMetadata> => {
    const tokenURI = await getTokenURI(tokenId);
    const metadata = await parseMetadata(tokenURI);
    return metadata;
  }, [getTokenURI]);

  /**
   * Fetch all tokens owned by an address
   * Note: This requires the contract to support tokenByIndex (ERC721Enumerable)
   */
  const fetchAllTokens = useCallback(async (
    owner: string,
    limit: number = 50
  ): Promise<Array<{ tokenId: bigint; metadata: NFTMetadata }>> => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (!publicClient) throw new Error('Public client not available');
      
      const contract = createContract();
      if (!contract) throw new Error('Contract not initialized');
      
      // Get balance first
      const balance = await getBalance(owner);
      const tokenCount = Number(balance);
      
      const tokens: Array<{ tokenId: bigint; metadata: NFTMetadata }> = [];
      
      // Try method 1: Using tokenByIndex (ERC721Enumerable)
      try {
        for (let i = 0; i < Math.min(tokenCount, limit); i++) {
          try {
            const tokenId = await contract.read.tokenByIndex([BigInt(i)]);
            const metadata = await getMetadata(tokenId);
            
            tokens.push({ tokenId, metadata });
          } catch (err) {
            console.warn(`Failed to fetch token ${i}:`, err);
            continue;
          }
        }
      } catch (err) {
        // Method 2: If tokenByIndex not supported, use Transfer events
        console.log('tokenByIndex not supported, using event scanning...');
        
        const transferEvents = await publicClient.getLogs({
          address: collectionAddress as `0x${string}`,
          event: ERC721_ABI[5], // Transfer event
          fromBlock: BigInt(0),
          toBlock: 'latest',
        });
        
        // Filter transfers TO the owner and track current ownership
        const ownedTokens = new Set<bigint>();
        
        transferEvents.forEach((event: any) => {
          const { from, to, tokenId } = event.args;
          if (to?.toLowerCase() === owner.toLowerCase()) {
            ownedTokens.add(tokenId);
          } else if (from?.toLowerCase() === owner.toLowerCase()) {
            ownedTokens.delete(tokenId);
          }
        });
        
        // Fetch metadata for owned tokens
        const tokenArray = Array.from(ownedTokens).slice(0, limit);
        
        for (const tokenId of tokenArray) {
          try {
            const metadata = await getMetadata(tokenId);
            tokens.push({ tokenId, metadata });
          } catch (err) {
            console.warn(`Failed to fetch metadata for token ${tokenId}:`, err);
          }
        }
      }
      
      setIsLoading(false);
      return tokens;
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tokens'));
      setIsLoading(false);
      return [];
    }
  }, [publicClient, createContract, getBalance, getMetadata, collectionAddress]);

  return {
    getBalance,
    getOwner,
    getTokenURI,
    getMetadata,
    fetchAllTokens,
    isLoading,
    error,
  };
}

export default useNFTContract;
