/**
 * Trading Components Usage Examples
 * 
 * This file demonstrates how to use the new trading UI components
 * in your Next.js application with the current Neon Vault design system.
 */

'use client';

import { useState } from 'react';
import TradingModal from '@/components/ui/TradingModal';
import PriceInput from '@/components/ui/PriceInput';
import OrderSummary from '@/components/ui/OrderSummary';
import { useTradingModal } from '@/lib/hooks';
import { ShoppingCart, Tag, Heart } from 'lucide-react';

// ============================================================================
// Example 1: Using TradingModal with useTradingModal Hook
// ============================================================================

export function NFTCardWithTrading({ 
  nft 
}: { 
  nft: { 
    id: string; 
    name: string; 
    price: string; 
    image: string;
    collectionAddress: string;
    tokenId: string;
  } 
}) {
  const { 
    modalState, 
    openListingModal, 
    openBidModal, 
    openBuyModal, 
    closeModal 
  } = useTradingModal();

  const chainId = 11155111; // Sepolia testnet

  return (
    <>
      {/* NFT Card */}
      <div className="bg-surface-container-low rounded-3xl overflow-hidden">
        {/* Image */}
        <div className="relative aspect-square">
          <img src={nft.image} alt={nft.name} className="w-full h-full object-cover" />
        </div>

        {/* Actions */}
        <div className="p-5 space-y-4">
          <h3 className="font-headline font-bold text-lg">{nft.name}</h3>
          <p className="text-secondary font-bold">{nft.price} ETH</p>

          <div className="grid grid-cols-2 gap-3">
            {/* Buy Now Button */}
            <button
              onClick={() => openBuyModal(nft.collectionAddress, nft.tokenId, nft.price)}
              className="flex items-center justify-center gap-2 bg-primary text-on-primary py-3 rounded-xl font-headline font-bold hover:opacity-90 transition-opacity"
            >
              <ShoppingCart className="w-5 h-5" />
              Buy Now
            </button>

            {/* Make Offer Button */}
            <button
              onClick={() => openBidModal(nft.collectionAddress, nft.tokenId)}
              className="flex items-center justify-center gap-2 bg-surface-variant/40 border border-secondary/30 text-secondary py-3 rounded-xl font-headline font-bold hover:bg-secondary/10 transition-colors"
            >
              <Tag className="w-5 h-5" />
              Make Offer
            </button>
          </div>

          {/* List for Sale Button (for owners) */}
          <button
            onClick={() => openListingModal(nft.collectionAddress, nft.tokenId)}
            className="w-full flex items-center justify-center gap-2 bg-surface-container-high text-on-surface py-3 rounded-xl font-headline font-bold hover:bg-surface-bright transition-colors"
          >
            List for Sale
          </button>
        </div>
      </div>

      {/* Trading Modal */}
      <TradingModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        collectionAddress={modalState.collectionAddress}
        tokenId={modalState.tokenId}
        price={modalState.price}
        onClose={closeModal}
        chainId={chainId}
      />
    </>
  );
}

// ============================================================================
// Example 2: Standalone PriceInput Component
// ============================================================================

export function SimplePriceForm() {
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState<'ETH' | 'WETH'>('ETH');

  return (
    <div className="p-6 bg-surface-container-low rounded-2xl">
      <h3 className="font-headline font-bold text-xl mb-4">Set Your Price</h3>
      
      <PriceInput
        value={price}
        onChange={setPrice}
        label="Price"
        placeholder="0.00"
        currency={currency}
        onCurrencyChange={setCurrency}
        showBalance
        balance="12.42"
      />

      <button
        disabled={!price}
        className="mt-6 w-full bg-primary text-on-primary py-4 rounded-2xl font-headline font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Confirm
      </button>
    </div>
  );
}

// ============================================================================
// Example 3: OrderSummary Preview
// ============================================================================

export function ListingPreview({ price }: { price: string }) {
  return (
    <div className="p-6 bg-surface-container-low rounded-2xl border border-outline-variant/20">
      <h3 className="font-headline font-bold text-xl mb-4">Listing Summary</h3>
      
      <OrderSummary
        type="listing"
        price={price || '0'}
        currency="ETH"
        duration={168}
        collectionName="Bored Ape Yacht Club"
        tokenId="1234"
        imageUrl="https://example.com/nft.png"
      />
    </div>
  );
}

// ============================================================================
// Example 4: Collection Page Integration
// ============================================================================

export function CollectionPageExample() {
  const { modalState, openListingModal, openBidModal, openBuyModal, closeModal } = useTradingModal();
  const chainId = 11155111;

  // Mock NFT data
  const nfts = [
    {
      id: '1',
      name: 'Ether Drift #402',
      price: '2.5',
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
      collectionAddress: '0x1234567890abcdef1234567890abcdef12345678',
      tokenId: '402',
    },
    // ... more NFTs
  ];

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-headline font-bold mb-2">Collection Name</h1>
        <p className="text-slate-400">10,000 items • Floor: 2.5 ETH</p>
      </div>

      {/* NFT Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {nfts.map((nft) => (
          <div key={nft.id} className="bg-surface-container-low rounded-3xl overflow-hidden group hover:-translate-y-2 transition-all duration-300">
            {/* Image */}
            <div className="relative aspect-square overflow-hidden">
              <img src={nft.image} alt={nft.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
              
              {/* Quick Actions Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openBuyModal(nft.collectionAddress, nft.tokenId, nft.price);
                  }}
                  className="p-3 bg-primary text-on-primary rounded-full hover:scale-110 transition-transform"
                >
                  <ShoppingCart className="w-6 h-6" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openBidModal(nft.collectionAddress, nft.tokenId);
                  }}
                  className="p-3 bg-secondary text-on-secondary rounded-full hover:scale-110 transition-transform"
                >
                  <Tag className="w-6 h-6" />
                </button>
                <button className="p-3 bg-surface-container-high text-on-surface rounded-full hover:scale-110 transition-transform">
                  <Heart className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-headline font-bold text-lg mb-1">{nft.name}</h3>
              <p className="text-secondary font-bold">{nft.price} ETH</p>
            </div>
          </div>
        ))}
      </div>

      {/* Trading Modal */}
      <TradingModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        collectionAddress={modalState.collectionAddress}
        tokenId={modalState.tokenId}
        price={modalState.price}
        onClose={closeModal}
        chainId={chainId}
      />
    </div>
  );
}

// ============================================================================
// Example 5: Portfolio Page - List Your NFT
// ============================================================================

export function PortfolioListingExample() {
  const { modalState, openListingModal, closeModal } = useTradingModal();
  const chainId = 11155111;

  const myNFT = {
    name: 'My Awesome NFT',
    image: 'https://images.unsplash.com/photo-1634973357973-f2ed2657db3c?w=400&h=400&fit=crop',
    collectionAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    tokenId: '999',
  };

  return (
    <>
      {/* Your NFT Card */}
      <div className="bg-surface-container-low rounded-3xl overflow-hidden">
        <img src={myNFT.image} alt={myNFT.name} className="w-full aspect-square object-cover" />
        <div className="p-5">
          <h3 className="font-headline font-bold text-xl mb-4">{myNFT.name}</h3>
          
          <button
            onClick={() => openListingModal(myNFT.collectionAddress, myNFT.tokenId)}
            className="w-full bg-primary text-on-primary py-4 rounded-2xl font-headline font-bold hover:opacity-90 transition-opacity"
          >
            List for Sale
          </button>
        </div>
      </div>

      {/* Trading Modal */}
      <TradingModal
        isOpen={modalState.isOpen}
        mode={modalState.mode}
        collectionAddress={modalState.collectionAddress}
        tokenId={modalState.tokenId}
        onClose={closeModal}
        chainId={chainId}
      />
    </>
  );
}

// ============================================================================
// Key Integration Points
// ============================================================================

/*
1. Import the components:
   import TradingModal from '@/components/ui/TradingModal';
   import { useTradingModal } from '@/lib/hooks';

2. Initialize the hook:
   const { modalState, openListingModal, openBidModal, openBuyModal, closeModal } = useTradingModal();

3. Add buttons to trigger modals:
   <button onClick={() => openBuyModal(address, tokenId, price)}>Buy Now</button>

4. Render the modal once in your page/component:
   <TradingModal
     isOpen={modalState.isOpen}
     mode={modalState.mode}
     collectionAddress={modalState.collectionAddress}
     tokenId={modalState.tokenId}
     price={modalState.price}
     onClose={closeModal}
     chainId={YOUR_CHAIN_ID}
   />

5. Configure wagmi in your app provider with the correct chain ID

Styling Notes:
- All components use the Neon Vault design system colors
- Responsive and mobile-friendly
- Consistent with existing UI components
- Uses Space Grotesk and Inter fonts
- Matches dark theme with surface colors
*/

export default {};
