/**
 * useMintNFT Hook
 * Mint NFT using ERC721A contract
 * 
 * This hook handles:
 * - Minting new NFTs with metadata
 * - Setting recipient address (optional, defaults to wallet address)
 */

import { useWriteContract, useWaitForTransactionReceipt, useAccount, useContractWrite } from 'wagmi';
import { useCallback, useState } from 'react';
import contractArtifact from './Troll.json';
interface UseMintNFTOptions {
  chainId: number;
}

interface MintNFTParams {
  name: string;
  description: string;
  imageUrl: string;
  recipientAddress?: string; // Optional, defaults to wallet address
}

interface UseMintNFTReturn {
  mintNFT: (params: MintNFTParams) => Promise<string>;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
  txHash: string | null;
  reset: () => void;
}

// TestERC721A (Troll) ABI
const TestERC721AABI =  contractArtifact.abi;

// Contract address for Sepolia testnet
const TEST_ERC721A_ADDRESS = '0xbD82f9fdB3C78c276007bAa0396Cb3A3E48Eb2fF';

/**
 * Hook to mint NFTs
 * 
 * @param chainId - The chain ID where the NFT will be minted
 * @returns Object with mint function and state
 * 
 * @example
 * const { mintNFT, isPending, isConfirmed } = useMintNFT({ chainId: 11155111 });
 * await mintNFT({
 *   name: 'My NFT',
 *   description: 'Description',
 *   imageUrl: 'ipfs://...',
 *   recipientAddress: '0x...' // optional
 * });
 */
export function useMintNFT({ chainId }: UseMintNFTOptions): UseMintNFTReturn {
  const { address: userAddress } = useAccount();

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

  const mintNFT = useCallback(async (params: MintNFTParams): Promise<string> => {
    if (!userAddress) {
      throw new Error('Wallet not connected');
    }

    // Validate parameters
    if (!params.name || !params.description || !params.imageUrl) {
      throw new Error('Name, description, and image URL are required');
    }

    // Determine recipient address
    const recipient = params.recipientAddress && params.recipientAddress.trim() !== ''
      ? params.recipientAddress
      : userAddress;

    console.log('Starting NFT minting process...');
    console.log('Metadata URI:', params.imageUrl);
    
    try {
      // Step 1: Mint NFT with metadata URI
      console.log('Step 1: Minting NFT with metadata URI...');
      const mintTxHash = await new Promise<string>((resolve, reject) => {
        writeContract(
          {
            address: TEST_ERC721A_ADDRESS as `0x${string}`,
            abi: TestERC721AABI,
            functionName: 'mintWithURI',  // ← Use new function
            args: [
              recipient as `0x${string}`, 
              BigInt(1),
              params.imageUrl  // ← Pass IPFS URI directly to contract
            ],
          },
          {
            onSuccess: (hash) => {
              console.log('Mint transaction sent:', hash);
              resolve(hash);
            },
            onError: (error) => {
              console.error('Mint failed:', error);
              reject(error);
            },
          }
        );
      });

      console.log('✅ NFT minted successfully!');
      console.log('   Tx Hash:', mintTxHash);
      console.log('   Token URI stored on-chain:', params.imageUrl);
      console.log('\n📝 Backend will now be able to fetch this URI via tokenURI() call');
      
      return mintTxHash;
      
    } catch (error) {
      console.error('Minting process failed:', error);
      throw error;
    }
  }, [userAddress, chainId, writeContract]);

  return {
    mintNFT,
    isPending,
    isConfirming,
    isConfirmed,
    error: error as Error | null,
    txHash: hash || null,
    reset,
  };
}

export default useMintNFT;
