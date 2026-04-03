'use client';

import { clsx } from 'clsx';
import { 
  Zap, 
  Clock, 
  ArrowRightLeft, 
  Info, 
  ExternalLink,
  Wallet
} from 'lucide-react';

interface OrderSummaryProps {
  type: 'listing' | 'bid' | 'buy' | 'edit' | 'acceptOffer';
  price: string;
  currency?: string;
  fees?: {
    platformFee: string;
    royaltyFee?: string;
    gasFee?: string;
  };
  duration?: number;
  total?: string;
  collectionName?: string;
  tokenId?: string;
  imageUrl?: string;
  error?: string;
  onConfirm?: () => void;
  className?: string;
}

export default function OrderSummary({
  type,
  price,
  currency = 'ETH',
  fees,
  duration,
  total,
  collectionName,
  tokenId,
  imageUrl,
  error,
  className,
}: OrderSummaryProps) {
  // Calculate fees
  const platformFeeAmount = fees?.platformFee || '2.5';
  const royaltyFeeAmount = fees?.royaltyFee || '0';
  const gasFeeAmount = fees?.gasFee || '0.005'; // Remove '~' for calculation
  
  // Parse price - handle both "0.001" and "0.001 ETH" formats
  const priceStr = price?.replace(' ETH', '') || '0';
  const priceNum = parseFloat(priceStr) || 0;
  
  // Safely parse all numeric values
  const platformFeePercent = parseFloat(platformFeeAmount) || 0;
  const royaltyFeePercent = parseFloat(royaltyFeeAmount) || 0;
  const gasFeeNum = parseFloat(gasFeeAmount.replace('~', '')) || 0.005;
  
  const platformFee = (priceNum * platformFeePercent / 100).toFixed(4);
  const royaltyFee = (priceNum * royaltyFeePercent / 100).toFixed(4);
  const totalFees = (parseFloat(platformFee) + parseFloat(royaltyFee)).toFixed(4);
  const totalAmount = (priceNum + parseFloat(totalFees) + gasFeeNum).toFixed(4);

  const typeLabels = {
    listing: 'List for Sale',
    bid: 'Make Offer',
    buy: 'Buy Now',
    edit: 'Update Listing',
    acceptOffer: 'Accept Offer',
  };

  const typeDescriptions = {
    listing: 'Your NFT will be listed on the marketplace',
    bid: 'Your offer will be submitted to the seller',
    buy: 'Complete your purchase now',
    edit: 'Update your listing price and duration',
    acceptOffer: 'Accept the bid and sell your NFT',
  };

  return (
    <div className={clsx('space-y-6', className)}>
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-outline-variant/10">
        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <ArrowRightLeft className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="font-headline font-bold text-lg text-on-surface">
            {typeLabels[type]}
          </h3>
          <p className="text-xs text-slate-500">{typeDescriptions[type]}</p>
        </div>
      </div>

      {/* NFT Preview (if provided) */}
      {(imageUrl || collectionName) && (
        <div className="flex items-center gap-4 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
          {imageUrl && (
            <div className="w-16 h-16 rounded-lg overflow-hidden bg-surface-container-high">
              <img 
                src={imageUrl} 
                alt={tokenId} 
                className="w-full h-full object-cover" 
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 uppercase tracking-widest">Item</p>
            <p className="font-headline font-bold text-sm truncate">
              {collectionName || 'Unknown Collection'}
            </p>
            {tokenId && (
              <p className="text-xs text-primary">#{tokenId}</p>
            )}
          </div>
        </div>
      )}

      {/* Price Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-slate-400">Price</span>
          <span className="font-headline font-bold text-lg text-secondary">
            {price} {currency}
          </span>
        </div>

        {/* Duration (for listing/bid) */}
        {duration && (
          <div className="flex justify-between items-center">
            <span className="flex items-center gap-2 text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              Duration
            </span>
            <span className="text-sm font-bold text-on-surface">
              {duration} {duration === 1 ? 'hour' : 'hours'}
            </span>
          </div>
        )}
      </div>

      {/* Fees Breakdown */}
      {type === 'listing' && (
        <div className="space-y-2 p-4 bg-surface-container-low/50 rounded-xl">
          <p className="text-xs text-slate-500 uppercase tracking-widest mb-3">
            Fee Breakdown
          </p>
          
          <div className="flex justify-between items-center text-sm">
            <span className="flex items-center gap-2 text-slate-400">
              <Zap className="w-3 h-3" />
              Platform Fee ({platformFeeAmount}%)
            </span>
            <span className="font-bold">{platformFee} {currency}</span>
          </div>

          {parseFloat(royaltyFeeAmount) > 0 && (
            <div className="flex justify-between items-center text-sm">
              <span className="text-slate-400">Royalty ({royaltyFeeAmount}%)</span>
              <span className="font-bold">{royaltyFee} {currency}</span>
            </div>
          )}
        </div>
      )}

      {/* Gas Fee Estimate */}
      <div className="flex justify-between items-center text-sm p-4 bg-surface-container-low/30 rounded-xl">
        <span className="flex items-center gap-2 text-slate-400">
          <Wallet className="w-4 h-4" />
          Estimated Gas
        </span>
        <span className="font-bold text-slate-300">{gasFeeAmount} ETH</span>
      </div>

      {/* Total */}
      <div className="flex justify-between items-center p-4 bg-surface-container-high rounded-xl border border-primary/20">
        <span className="font-headline font-bold text-on-surface">
          {type === 'listing' || type === 'acceptOffer' ? 'You Receive' : 'Total'}
        </span>
        <div className="text-right">
          <span className="font-headline font-bold text-xl text-secondary">
            {type === 'listing' || type === 'acceptOffer'
              ? (priceNum - parseFloat(platformFee) - parseFloat(royaltyFee)).toFixed(4)
              : totalAmount
            } {currency}
          </span>
          {(type !== 'listing' && type !== 'acceptOffer') && (
            <p className="text-xs text-slate-500 mt-1">
              Includes {totalFees} {currency} fees
            </p>
          )}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-4 bg-red-400/10 border border-red-400/30 rounded-xl">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* Info Note */}
      <div className="flex items-start gap-3 p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
        <Info className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
        <div className="text-xs text-slate-500 space-y-1">
          <p>
            {type === 'listing' 
              ? 'You will receive the listed price minus fees once your NFT is sold.'
              : type === 'bid'
              ? 'Your offer will be held in escrow until accepted or expired.'
              : 'Complete this transaction in your wallet.'
            }
          </p>
          <a 
            href="#" 
            className="flex items-center gap-1 text-primary hover:text-secondary transition-colors"
          >
            Learn more about fees <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
}
