import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  sepolia,
  polygon,
  polygonMumbai,
  arbitrum,
  arbitrumSepolia,
  optimism,
  optimismSepolia,
  base,
  baseSepolia,
} from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'Neon Vault NFT Marketplace',
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: [
    mainnet,
    sepolia,
    polygon,
    polygonMumbai,
    arbitrum,
    arbitrumSepolia,
    optimism,
    optimismSepolia,
    base,
    baseSepolia,
  ],
  ssr: true,
});

export const supportedChains = [
  { id: 1, name: 'ethereum', label: 'Ethereum' },
  { id: 11155111, name: 'sepolia', label: 'Sepolia' },
  { id: 137, name: 'polygon', label: 'Polygon' },
  { id: 80001, name: 'mumbai', label: 'Mumbai' },
  { id: 42161, name: 'arbitrum', label: 'Arbitrum' },
  { id: 421614, name: 'arbitrum_sepolia', label: 'Arbitrum Sepolia' },
  { id: 10, name: 'optimism', label: 'Optimism' },
  { id: 11155420, name: 'optimism_sepolia', label: 'Optimism Sepolia' },
  { id: 8453, name: 'base', label: 'Base' },
  { id: 84532, name: 'base_sepolia', label: 'Base Sepolia' },
];

export const chainIdToChain: Record<number, string> = {
  1: 'ethereum',
  11155111: 'sepolia',
  137: 'polygon',
  80001: 'mumbai',
  42161: 'arbitrum',
  421614: 'arbitrum_sepolia',
  10: 'optimism',
  11155420: 'optimism_sepolia',
  8453: 'base',
  84532: 'base_sepolia',
};
