/**
 * EasySwap Contract Addresses Configuration
 * Multi-chain contract address management
 * 
 * Addresses need to be configured per chain based on deployment
 * Check EasySwapContract/scripts/deploy.js for deployment addresses
 */

export interface ChainContracts {
  orderBook: string;
  vault: string;
}

export interface ContractsConfig {
  [chainId: number]: ChainContracts;
}

// Default contract addresses (need to be updated after deployment)
export const contractsConfig: ContractsConfig = {
  // Ethereum Mainnet
  1: {
    orderBook: '0x0000000000000000000000000000000000000000',
    vault: '0x0000000000000000000000000000000000000000',
  },
  // Sepolia Testnet
  11155111: {
    orderBook: '0xB0018E6BA241B39A97721285B5dC74Fa35b73dDF', // TODO: Update with actual address
    vault: '0x6D6905398F4eBaA3571752f0D7C4CF6e02cedC39',
  },
  // Polygon
  137: {
    orderBook: '0x0000000000000000000000000000000000000000',
    vault: '0x0000000000000000000000000000000000000000',
  },
  // Polygon Mumbai (Testnet)
  80001: {
    orderBook: '0x0000000000000000000000000000000000000000',
    vault: '0x0000000000000000000000000000000000000000',
  },
  // Arbitrum
  42161: {
    orderBook: '0x0000000000000000000000000000000000000000',
    vault: '0x0000000000000000000000000000000000000000',
  },
  // Arbitrum Sepolia
  421614: {
    orderBook: '0x0000000000000000000000000000000000000000',
    vault: '0x0000000000000000000000000000000000000000',
  },
  // Optimism
  10: {
    orderBook: '0x0000000000000000000000000000000000000000',
    vault: '0x0000000000000000000000000000000000000000',
  },
  // Optimism Sepolia
  11155420: {
    orderBook: '0x0000000000000000000000000000000000000000',
    vault: '0x0000000000000000000000000000000000000000',
  },
  // Base
  8453: {
    orderBook: '0x0000000000000000000000000000000000000000',
    vault: '0x0000000000000000000000000000000000000000',
  },
  // Base Sepolia
  84532: {
    orderBook: '0x0000000000000000000000000000000000000000',
    vault: '0x0000000000000000000000000000000000000000',
  },
};

/**
 * Get contract addresses for a specific chain
 */
export function getContracts(chainId: number): ChainContracts | undefined {
  return contractsConfig[chainId];
}

/**
 * Get OrderBook contract address for a specific chain
 */
export function getOrderBookAddress(chainId: number): string | undefined {
  return contractsConfig[chainId]?.orderBook;
}

/**
 * Get Vault contract address for a specific chain
 */
export function getVaultAddress(chainId: number): string | undefined {
  return contractsConfig[chainId]?.vault;
}

export default contractsConfig;