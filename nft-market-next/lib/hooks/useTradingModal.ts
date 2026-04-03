'use client';

import { useState, useCallback } from 'react';

interface TradingModalState {
  isOpen: boolean;
  mode: 'listing' | 'bid' | 'buy' | 'acceptOffer' | null;
  collectionAddress?: string;
  tokenId?: string;
  price?: string;
  bidOrderKey?: string; // For accept offer mode
  sellOrder?: any; // For buy mode - the listing order from API/chain
}

interface UseTradingModalReturn {
  modalState: TradingModalState;
  openListingModal: (collectionAddress: string, tokenId: string, currentPrice?: string) => void;
  openBidModal: (collectionAddress: string, tokenId: string, suggestedPrice?: string) => void;
  openBuyModal: (collectionAddress: string, tokenId: string, price: string, sellOrder?: any) => void;
  openAcceptOfferModal: (collectionAddress: string, tokenId: string, bidOrderKey: string, price: string) => void;
  closeModal: () => void;
  updatePrice: (price: string) => void;
}

/**
 * Hook to manage trading modal state and actions
 */
export function useTradingModal(): UseTradingModalReturn {
  const [modalState, setModalState] = useState<TradingModalState>({
    isOpen: false,
    mode: null,
  });

  const openListingModal = useCallback((
    collectionAddress: string,
    tokenId: string,
    currentPrice?: string
  ) => {
    setModalState({
      isOpen: true,
      mode: 'listing',
      collectionAddress,
      tokenId,
      price: currentPrice || '',
    });
  }, []);

  const openBidModal = useCallback((
    collectionAddress: string,
    tokenId: string,
    suggestedPrice?: string
  ) => {
    setModalState({
      isOpen: true,
      mode: 'bid',
      collectionAddress,
      tokenId,
      price: suggestedPrice || '',
    });
  }, []);

  const openBuyModal = useCallback((
    collectionAddress: string,
    tokenId: string,
    price: string,
    sellOrder?: any // Pass the listing order
  ) => {
    setModalState({
      isOpen: true,
      mode: 'buy',
      collectionAddress,
      tokenId,
      price,
      sellOrder, // Store the sell order
    });
  }, []);

  const openAcceptOfferModal = useCallback((
    collectionAddress: string,
    tokenId: string,
    bidOrderKey: string,
    price: string
  ) => {
    setModalState({
      isOpen: true,
      mode: 'acceptOffer',
      collectionAddress,
      tokenId,
      price,
      bidOrderKey,
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState(prev => ({
      ...prev,
      isOpen: false,
    }));
  }, []);

  const updatePrice = useCallback((price: string) => {
    setModalState(prev => ({
      ...prev,
      price,
    }));
  }, []);

  return {
    modalState,
    openListingModal,
    openBidModal,
    openBuyModal,
    openAcceptOfferModal,
    closeModal,
    updatePrice,
  };
}

export default useTradingModal;
