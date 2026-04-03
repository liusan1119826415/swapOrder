/**
 * EasySwap Contracts Index
 * Export ABIs, addresses, and hooks
 */

export { contractsConfig, getContracts, getOrderBookAddress, getVaultAddress } from './addresses';
export type { ChainContracts, ContractsConfig } from './addresses';

export { EasySwapOrderBookABI, EasySwapVaultABI } from './abis';

// Contract hooks
export { 
  useMakeOrder, 
  useCreateListing, 
  useMakeBid, 
  useCancelOrder, 
  useCancelListing,
  useMatchOrder,
  useBuyNFT,
  useEditOrder,
  useEditOrderPrice 
} from './hooks';