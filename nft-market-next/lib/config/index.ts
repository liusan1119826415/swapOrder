/**
 * Application Configuration
 * 
 * Centralized configuration management from environment variables
 */

export const config = {
  // API Configuration
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost',
    timeout: 30000,
    version: 'v1',
  },

  // Chain Configuration
  chains: {
    defaultChainId: parseInt(process.env.NEXT_PUBLIC_DEFAULT_CHAIN_ID || '11155111'),
    supportedChains: process.env.NEXT_PUBLIC_SUPPORTED_CHAINS
      ? process.env.NEXT_PUBLIC_SUPPORTED_CHAINS.split(',').map(id => parseInt(id.trim()))
      : [1, 10, 11155111], // Ethereum, Optimism, Sepolia
  },

  // Feature Flags
  features: {
    analytics: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS !== 'false',
    auctions: process.env.NEXT_PUBLIC_ENABLE_AUCTIONS !== 'false',
    drops: process.env.NEXT_PUBLIC_ENABLE_DROPS !== 'false',
  },

  // Helper functions
  getApiEndpoint: (path: string) => {
    return `${config.api.baseUrl}/api/${config.api.version}${path}`;
  },

  isChainSupported: (chainId: number) => {
    return config.chains.supportedChains.includes(chainId);
  },
} as const;

// Chain ID to chain name mapping
export const chainIdToName: Record<number, string> = {
  1: 'ethereum',
  10: 'optimism',
  11155111: 'sepolia',
};

// Export type for configuration
export type Config = typeof config;

export default config;
