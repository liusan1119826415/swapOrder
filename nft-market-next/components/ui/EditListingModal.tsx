'use client';

import { useState, useEffect } from 'react';
import { X, Loader2, CheckCircle2, AlertCircle, TrendingUp } from 'lucide-react';
import { clsx } from 'clsx';

interface EditListingModalProps {
  isOpen: boolean;
  listing: {
    orderKey: string;
    name: string;
    image: string;
    collection: string;
    price: string;
    collectionAddress: string;
    tokenId: string;
  } | null;
  isPending: boolean;
  isConfirming: boolean;
  isConfirmed: boolean;
  error: Error | null;
  onConfirm: (newPrice: string) => Promise<void>;
  onClose: () => void;
}

export default function EditListingModal({
  isOpen,
  listing,
  isPending,
  isConfirming,
  isConfirmed,
  error,
  onConfirm,
  onClose,
}: EditListingModalProps) {
  const [newPrice, setNewPrice] = useState('');
  const [step, setStep] = useState<'input' | 'confirming' | 'success' | 'error'>('input');

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setNewPrice(listing?.price ? listing.price.split(' ')[0] || '' : '');
      setStep('input');
    }
  }, [isOpen, listing]);

  // Handle transaction status
  useEffect(() => {
    if (isPending || isConfirming) {
      setStep('confirming');
    } else if (isConfirmed) {
      setStep('success');
    } else if (error) {
      setStep('error');
    }
  }, [isPending, isConfirming, isConfirmed, error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
   
    if (!newPrice || !listing) return;
    
    await onConfirm(newPrice);
  };

  const handleClose = () => {
    if (step === 'success') {
      onClose();
    } else {
      setStep('input');
      setNewPrice(listing?.price ? listing.price.split(' ')[0] || '' : '');
      onClose();
    }
  };

  if (!isOpen || !listing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleClose} />
      
      <div className="relative w-full max-w-md bg-[#1a1a1a] rounded-3xl border border-outline-variant/20 shadow-2xl p-8">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-xl font-headline font-bold text-on-surface">Edit Listing</h2>
            <p className="text-sm text-slate-400 mt-1">Update your listing price</p>
          </div>
          <button 
            onClick={handleClose}
            className="text-slate-500 hover:text-on-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content based on step */}
        {step === 'input' && (
          <form onSubmit={handleSubmit}>
            {/* NFT Preview */}
            <div className="flex items-center gap-4 p-4 bg-surface-container rounded-xl mb-6">
              <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                <img 
                  src={listing.image} 
                  alt={listing.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <p className="font-bold text-on-surface">{listing.name}</p>
                <p className="text-sm text-slate-400">{listing.collection}</p>
              </div>
            </div>

            {/* Current Price */}
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-400 mb-2">
                Current Price
              </label>
              <div className="text-lg font-headline font-bold text-on-surface">
                {listing.price}
              </div>
            </div>

            {/* New Price Input */}
            <div className="mb-6">
              <label className="block text-xs font-medium text-slate-400 mb-2">
                New Price (ETH)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.000001"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  className="w-full bg-surface-container-high border border-outline-variant/30 rounded-xl px-4 py-3 text-on-surface placeholder-slate-500 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="0.00"
                  required
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                  ETH
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!newPrice || (listing && newPrice === listing.price?.split(' ')[0])}
              className="w-full py-4 rounded-xl bg-primary text-on-primary font-headline font-bold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              <TrendingUp className="w-5 h-5" />
              Update Price
            </button>
          </form>
        )}

        {step === 'confirming' && (
          <div className="text-center py-8">
            <Loader2 className="w-16 h-16 text-primary mx-auto mb-4 animate-spin" />
            <p className="text-lg font-headline font-bold text-on-surface mb-2">
              Updating Listing...
            </p>
            <p className="text-sm text-slate-400">
              Please confirm the transaction in your wallet
            </p>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-8">
            <CheckCircle2 className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <p className="text-lg font-headline font-bold text-on-surface mb-2">
              Listing Updated!
            </p>
            <p className="text-sm text-slate-400">
              Your listing has been successfully updated
            </p>
          </div>
        )}

        {step === 'error' && (
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <p className="text-lg font-headline font-bold text-on-surface mb-2">
              Update Failed
            </p>
            <p className="text-sm text-slate-400 mb-6">
              {error?.message || 'Something went wrong'}
            </p>
            <button
              onClick={() => setStep('input')}
              className="px-6 py-3 rounded-xl bg-primary text-on-primary font-headline font-bold hover:bg-primary/90 transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
