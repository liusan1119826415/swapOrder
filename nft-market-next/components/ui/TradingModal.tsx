'use client';

import { useEffect, useState } from 'react';
import { clsx } from 'clsx';
import { X, Loader2, CheckCircle2, AlertCircle, Shield, Wallet } from 'lucide-react';
import PriceInput from './PriceInput';
import OrderSummary from './OrderSummary';
import { useCreateListing, useMakeBid, useBuyNFT, useNFTApproval } from '@/lib/hooks';
import { ethToWei, Order, OrderSide, SaleKind, generateSalt } from '@/lib/contracts/types';
import { useAccount, useBalance } from 'wagmi';

interface TradingModalProps {
  isOpen: boolean;
  mode: 'listing' | 'bid' | 'buy' | 'acceptOffer' | null;
  collectionAddress?: string;
  tokenId?: string;
  price?: string;
  onClose: () => void;
  chainId: number;
  onSuccess?: () => void; // Callback after successful transaction
  sellOrder?: Order; // For buy mode, the sell order to match (from API/chain)
  bidOrderKey?: string; // For accept offer mode, the bid order to match
  itemName?: string; // NFT name (e.g., "Collection Name #16")
  itemImage?: string; // NFT image URL
}

type ModalStep = 'input' | 'approval' | 'approving' | 'confirming' | 'success' | 'error';

export default function TradingModal({
  isOpen,
  mode,
  collectionAddress,
  tokenId,
  price: initialPrice,
  onClose,
  chainId,
  onSuccess,
  sellOrder,
  bidOrderKey,
  itemName,
  itemImage,
}: TradingModalProps) {
  const { address: userAddress } = useAccount();
  
  // Get dynamic balance based on mode
  const { data: balanceData } = useBalance({
    address: userAddress,
    query: {
      enabled: isOpen && !!userAddress,
      refetchInterval: 5000, // Refresh every 5 seconds
    },
  });
  
  // Format balance for display
  const formattedBalance = balanceData 
    ? `${Number(balanceData.formatted).toFixed(4)} ${balanceData.symbol}`
    : '0.0000';

  const [price, setPrice] = useState(initialPrice || '');
  const [currency, setCurrency] = useState<'ETH' | 'WETH'>('ETH');
  const [duration, setDuration] = useState<number>(168); // 7 days default
  const [step, setStep] = useState<ModalStep>('input');
  const [error, setError] = useState<string>('');

  // NFT Approval hook - only for listing mode
  const {
    isApproved,
    isLoading: isLoadingApproval,
    grantApprovalForAll,
    isPending: isApprovalPending,
    isConfirming: isApprovalConfirming,
    isConfirmed: isApprovalConfirmed,
    error: approvalError,
    refetch: refetchApproval,
  } = useNFTApproval({
    collectionAddress: collectionAddress || '',
    tokenId: tokenId || '0',
    chainId,
  });

  // Initialize hooks
  const { 
    createListing, 
    isPending: isListingPending, 
    isConfirming: isListingConfirming, 
    isConfirmed: isListingConfirmed,
    error: listingError,
    txHash: listingTxHash,
  } = useCreateListing({ chainId });

  const { 
    makeBid, 
    isPending: isBidPending, 
    isConfirming: isBidConfirming, 
    isConfirmed: isBidConfirmed,
    error: bidError,
    txHash: bidTxHash,
  } = useMakeBid({ chainId });

  const {
    buyNFT,
    buyNFTByOrderKey,
    isPending: isBuyPending,
    isConfirming: isBuyConfirming,
    isConfirmed: isBuyConfirmed,
    error: buyError,
    txHash: buyTxHash,
  } = useBuyNFT({ chainId });

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setPrice(initialPrice || '');
      setCurrency('ETH');
      setDuration(168);
      setStep('input');
      setError('');
    }
  }, [isOpen, initialPrice]);

  // Check approval status when listing
  useEffect(() => {
    if (isOpen && mode === 'listing' && collectionAddress && tokenId) {
      // Don't change step while loading approval status
      if (isLoadingApproval) {
        return;
      }
      
      // If not approved and we're in input or approval step, show approval screen
      if (!isApproved && (step === 'input' || step === 'approval')) {
        setStep('approval');
      } else if (isApproved && step === 'approval') {
        setStep('input');
      }
    }
  }, [isOpen, mode, isApproved, isLoadingApproval, collectionAddress, tokenId, step]);

  // Handle approval transaction status
  useEffect(() => {
    if (step === 'approval' || step === 'approving') {
      if (isApprovalPending || isApprovalConfirming) {
        setStep('approving');
      } else if (isApprovalConfirmed) {
        setStep('input');
      } else if (approvalError) {
        setError(approvalError.message);
        setStep('error');
      }
    }
  }, [isApprovalPending, isApprovalConfirming, isApprovalConfirmed, approvalError, step]);

  // Handle transaction status changes
  useEffect(() => {
    if (mode === 'listing') {
      if (isListingPending) setStep('confirming');
      else if (isListingConfirming) setStep('confirming');
      else if (isListingConfirmed) {
        setStep('success');
        onSuccess?.();
      }
      else if (listingError) {
        setError(listingError.message);
        setStep('error');
      }
    } else if (mode === 'bid') {
      if (isBidPending) setStep('confirming');
      else if (isBidConfirming) setStep('confirming');
      else if (isBidConfirmed) {
        setStep('success');
        onSuccess?.();
      }
      else if (bidError) {
        setError(bidError.message);
        setStep('error');
      }
    } else if (mode === 'buy' || mode === 'acceptOffer') {
      if (isBuyPending) setStep('confirming');
      else if (isBuyConfirming) setStep('confirming');
      else if (isBuyConfirmed) {
        setStep('success');
        onSuccess?.();
      }
      else if (buyError) {
        setError(buyError.message);
        setStep('error');
      }
    }
  }, [
    mode,
    isListingPending,
    isListingConfirming,
    isListingConfirmed,
    listingError,
    isBidPending,
    isBidConfirming,
    isBidConfirmed,
    bidError,
    isBuyPending,
    isBuyConfirming,
    isBuyConfirmed,
    buyError,
    onSuccess,
  ]);

  const handleApprove = async () => {
    setError('');
    setStep('approving');
    try {
      await grantApprovalForAll();
    } catch (err: any) {
      setError(err.message || 'Approval failed');
      setStep('error');
    }
  };

  const handleSubmit = async () => {
    if (!collectionAddress || !tokenId || !price) return;

    setError('');
    
    // For listing, check approval first
    if (mode === 'listing' && !isApproved) {
      setStep('approval');
      return;
    }

    const priceInWei = ethToWei(price);

    try {
      if (mode === 'listing') {
        await createListing(collectionAddress, tokenId, priceInWei, duration);
      } else if (mode === 'bid') {
        await makeBid(collectionAddress, tokenId, priceInWei, duration);
      } else if (mode === 'buy') {
        // For buy mode, we need to match the sell order with a buy order
        console.log('=== Buy Mode ===');
        console.log('collectionAddress:', collectionAddress);
        console.log('tokenId:', tokenId);
        console.log('price:', price);
        console.log('initialPrice:', initialPrice);
        
        if (!collectionAddress || collectionAddress === '0x0000000000000000000000000000000000000000') {
          throw new Error('Invalid collection address');
        }
        
        if (!tokenId || tokenId === '0' || tokenId === '0x0') {
          throw new Error('Invalid token ID');
        }
        
        // Validate price
        if (!price || price === '' || price === '0') {
          throw new Error('Invalid price');
        }
        
        // Convert price string to wei properly
        let priceInWei: string;
        try {
          // If price already contains ETH value (like "0.1"), convert to wei
          if (price.includes('ETH')) {
            const ethValue = price.replace(' ETH', '');
            priceInWei = ethToWei(ethValue);
          } else {
            // Price is already in wei or plain number
            priceInWei = ethToWei(price);
          }
          console.log('Price in wei:', priceInWei);
        } catch (err: any) {
          throw new Error(`Failed to convert price: ${err.message}`);
        }
        
        if (!sellOrder) {
          // ❌ Cannot create a sell order here because we don't know the seller's address
          // ✅ Should fetch the listing from API or chain first
          // For now, throw an error to indicate this needs to be fixed
          throw new Error(
            'Cannot buy NFT without a valid sell order. The sell order must come from the seller, not the buyer. ' +
            'Please fetch the listing order from the API first.'
          );
        } else {
          // Use the provided sell order (from API/chain)
          console.log('Using existing sellOrder:', sellOrder);
          
          // ✅ Validate that the sell order maker is NOT the current user
          if (sellOrder.maker.toLowerCase() === userAddress?.toLowerCase()) {
            throw new Error('Cannot buy your own listing. The sell order maker must be different from the buyer.');
          }
          
          await buyNFT(sellOrder, priceInWei);
        }
      } else if (mode === 'acceptOffer') {
        // For accept offer mode:
        // Owner accepts a bid by calling buyNFTByOrderKey which will:
        // 1. Fetch the bid order from chain
        // 2. Create a matching sell order
        // 3. Call matchOrders to execute the trade
        console.log('=== Accept Offer Mode ===');
        console.log('bidOrderKey:', bidOrderKey);
        console.log('collectionAddress:', collectionAddress);
        console.log('tokenId:', tokenId);
        console.log('price:', price);
        
        if (!bidOrderKey) {
          throw new Error('Bid order key is required for accepting offers');
        }
        
        // Use buyNFTByOrderKey to match the existing bid order
        await buyNFTByOrderKey(bidOrderKey);
      }
    } catch (err: any) {
      setError(err.message || 'Transaction failed');
      setStep('error');
    }
  };

  const handleClose = () => {
    if (step === 'success') {
      onClose();
    } else {
      // Warn before closing during transaction
      if (step === 'confirming' || step === 'approving') {
        if (!window.confirm('Transaction in progress. Close anyway?')) {
          return;
        }
      }
      onClose();
    }
  };

  if (!isOpen || !mode) return null;

  const isLoading = step === 'confirming' || step === 'approving';
  const isSuccess = step === 'success';
  const isError = step === 'error';
  const needsApproval = step === 'approval';
  const isInputStep = step === 'input';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-lg bg-[#1a1a1a] rounded-3xl border border-outline-variant/20 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-outline-variant/10">
          <h2 className="text-2xl font-headline font-bold text-on-surface">
            {mode === 'listing' ? 'List NFT' : mode === 'bid' ? 'Make Offer' : mode === 'acceptOffer' ? 'Accept Offer' : 'Buy NFT'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className="p-2 rounded-xl hover:bg-surface-container-high transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(100vh-300px)] overflow-y-auto">
          {/* Success State */}
          {isSuccess && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-primary/20 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle2 className="w-12 h-12 text-primary" />
              </div>
              <h3 className="text-2xl font-headline font-bold text-on-surface mb-2">
                {mode === 'listing' ? 'Listed Successfully!' : mode === 'bid' ? 'Offer Submitted!' : 'Purchase Complete!'}
              </h3>
              <p className="text-slate-400 mb-6">
                {mode === 'listing' 
                  ? 'Your NFT is now live on the marketplace'
                  : mode === 'bid'
                  ? 'Your offer has been submitted to the seller'
                  : 'The NFT has been transferred to your wallet'
                }
              </p>
              <button
                onClick={handleClose}
                className="px-8 py-3 bg-primary text-on-primary font-headline font-bold rounded-full hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          )}

          {/* Error State */}
          {isError && (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full bg-red-400/20 mx-auto mb-6 flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-red-400" />
              </div>
              <h3 className="text-xl font-headline font-bold text-on-surface mb-4">
                Transaction Failed
              </h3>
              <p className="text-red-400 mb-6">{error}</p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setStep(needsApproval ? 'approval' : 'input')}
                  className="px-6 py-3 bg-surface-container-high text-on-surface font-headline font-bold rounded-full hover:bg-surface-bright transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 text-slate-400 font-headline font-bold hover:text-on-surface transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}

          {/* Approval Step */}
          {needsApproval && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-secondary/20 mx-auto mb-6 flex items-center justify-center">
                <Shield className="w-8 h-8 text-secondary" />
              </div>
              <h3 className="text-xl font-headline font-bold text-on-surface mb-3">
                Approve NFT for Trading
              </h3>
              <p className="text-slate-400 mb-6 text-sm">
                Before listing your NFT, you need to grant permission to the marketplace contract to manage this NFT on your behalf.
              </p>
              
              <div className="bg-surface-container-low rounded-xl p-4 mb-6 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <Wallet className="w-5 h-5 text-secondary" />
                  <span className="text-sm text-slate-300">Collection Address</span>
                </div>
                <p className="text-xs text-slate-500 font-mono break-all">
                  {collectionAddress}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={handleApprove}
                  disabled={isLoading}
                  className={clsx(
                    'w-full py-4 rounded-2xl font-headline font-bold text-lg transition-all',
                    isLoading
                      ? 'bg-surface-container-high text-slate-500 cursor-not-allowed'
                      : 'bg-secondary text-on-secondary hover:opacity-90 active:scale-[0.98] shadow-lg shadow-secondary/20'
                  )}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Approving...
                    </span>
                  ) : (
                    'Approve for Trading'
                  )}
                </button>
                <button
                  onClick={() => setStep('input')}
                  disabled={isLoading}
                  className="text-slate-400 text-sm hover:text-on-surface transition-colors disabled:opacity-50"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}

          {/* Input/Confirm State */}
          {!isSuccess && !isError && !needsApproval && (
            <>
              {/* Approval Status Banner */}
              {mode === 'listing' && (
                <div className={clsx(
                  'mb-4 p-3 rounded-xl flex items-center gap-3',
                  isApproved 
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-amber-500/10 border border-amber-500/20'
                )}>
                  <Shield className={clsx('w-5 h-5', isApproved ? 'text-green-400' : 'text-amber-400')} />
                  <span className={clsx('text-sm', isApproved ? 'text-green-400' : 'text-amber-400')}>
                    {isApproved ? 'NFT is approved for trading' : 'NFT needs approval before listing'}
                  </span>
                </div>
              )}

              {/* Price Input */}
              {(mode === 'listing' || mode === 'bid') && (
                <div className="mb-6">
                  <PriceInput
                    value={price}
                    onChange={setPrice}
                    label={mode === 'listing' ? 'Listing Price' : 'Offer Amount'}
                    placeholder="0.00"
                    currency={currency}
                    onCurrencyChange={setCurrency}
                    showBalance
                    balance={formattedBalance}
                  />

                  {/* Duration Selector */}
                  <div className="mt-6 space-y-3">
                    <label className="block text-sm text-slate-400 font-label uppercase tracking-widest">
                      Duration
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[24, 72, 168].map((hours) => (
                        <button
                          key={hours}
                          onClick={() => setDuration(hours)}
                          className={clsx(
                            'py-3 rounded-xl font-headline font-bold text-sm transition-all border',
                            duration === hours
                              ? 'bg-primary text-on-primary border-primary shadow-lg shadow-primary/20'
                              : 'bg-surface-container-low text-slate-400 border-outline-variant/20 hover:border-primary/50'
                          )}
                        >
                          {hours === 24 ? '1 Day' : hours === 72 ? '3 Days' : '7 Days'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Order Summary */}
              {price && (
                <div className="mb-6">
                  <OrderSummary
                    type={mode}
                    price={price}
                    currency={currency}
                    duration={duration}
                    collectionName={itemName || 'Unknown'} // Pass full name (Collection #TokenId)
                    tokenId={tokenId} // Still pass tokenId for reference
                    imageUrl={itemImage || ''} // Pass image URL
                  />
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={handleSubmit}
                disabled={!price || isLoading || (mode === 'listing' && !isApproved && isInputStep)}
                className={clsx(
                  'w-full py-4 rounded-2xl font-headline font-bold text-lg transition-all',
                  !price || isLoading || (mode === 'listing' && !isApproved && isInputStep)
                    ? 'bg-surface-container-high text-slate-500 cursor-not-allowed'
                    : 'bg-primary text-on-primary hover:opacity-90 active:scale-[0.98] shadow-lg shadow-primary/20'
                )}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Confirming...
                  </span>
                ) : mode === 'listing' && !isApproved && isInputStep ? (
                  'Approval Required'
                ) : mode === 'acceptOffer' ? (
                  'Accept Offer'
                ) : (
                  mode === 'listing' ? 'List Now' : mode === 'bid' ? 'Submit Offer' : 'Confirm Purchase'
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
