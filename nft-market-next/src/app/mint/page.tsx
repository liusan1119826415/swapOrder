'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Upload, X, CheckCircle2, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import MainLayout from '@/components/layout/MainLayout';
import { useMintNFT } from '@/lib/hooks';
import { useAccount } from 'wagmi';
import { clsx } from 'clsx';
import { uploadFileToIPFS, uploadMetadataToIPFS, ipfsToHttpUrl } from '@/lib/ipfs';

const CHAIN_ID = 11155111; // Sepolia

export default function MintPage() {
  const router = useRouter();
  const { address: userAddress } = useAccount();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  // Mint hook
  const { 
    mintNFT, 
    isPending, 
    isConfirming, 
    isConfirmed, 
    error,
    txHash,
    reset 
  } = useMintNFT({ chainId: CHAIN_ID });

  // Form validation
  const isValid = name.trim() && description.trim() && imagePreview;
  const isSubmitting = isPending || isConfirming || isUploading;

  // Handle image upload
  const handleImageSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Upload to real IPFS
  const uploadToIPFS = async (): Promise<string> => {
    if (!imageFile) {
      throw new Error('No image file to upload');
    }

    setIsUploading(true);
    
    try {
      // Step 1: Upload image to IPFS
      console.log('Uploading image to IPFS...');
      const imageIpfsUrl = await uploadFileToIPFS(imageFile);
      console.log('Image uploaded:', imageIpfsUrl);
      
      // Step 2: Create NFT metadata
      const metadata = {
        name: name,
        description: description,
        image: imageIpfsUrl,
        attributes: [], // You can add custom attributes here
        external_url: window.location.origin,
      };
      
      // Step 3: Upload metadata to IPFS
      console.log('Uploading metadata to IPFS...');
      const metadataIpfsUrl = await uploadMetadataToIPFS(metadata);
      console.log('Metadata uploaded:', metadataIpfsUrl);
      
      setIsUploading(false);
      
      // Return metadata URI (this is what you'd pass to the contract)
      return metadataIpfsUrl;
    } catch (error) {
      setIsUploading(false);
      console.error('IPFS upload failed:', error);
      throw new Error('Failed to upload to IPFS. Please check your Pinata credentials.');
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isValid || !userAddress) return;

    try {
      // Step 1: Upload metadata to IPFS
      console.log('Uploading metadata to IPFS...');
      const metadataUri = await uploadToIPFS();
      console.log('Metadata uploaded to IPFS:', metadataUri);
      
      // Step 2: Set tokenURI on contract (only owner can do this)
      // Note: This should be done once after deployment, not on every mint
      // For testing, we'll skip this step here
      
      // Step 3: Mint NFT
      console.log('Minting NFT...');
      const txHash = await mintNFT({
        name,
        description,
        imageUrl: metadataUri,
        recipientAddress: recipientAddress.trim() || undefined,
      });
      
      console.log('✅ NFT minted successfully!');
      console.log('Transaction hash:', txHash);
      console.log('Metadata URI:', metadataUri);
      
      // Show success message
      alert(`NFT minted successfully!\nMetadata URI: ${metadataUri}\nTx Hash: ${txHash}`);
      
      // Reset form state
      setName('');
      setDescription('');
      setRecipientAddress('');
      setImageFile(null);
      setImagePreview('');
      // Reset file input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error('Mint failed:', err);
      alert(`Mint failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Handle image delete - reset file input as well
  const handleImageDelete = () => {
    setImageFile(null);
    setImagePreview('');
    // Reset file input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle success - redirect to portfolio page
  const handleSuccess = () => {
    reset();
    router.push('/portfolio');
  };

  // Handle Mint Another - just reset the form
  const handleMintAnother = () => {
    reset();
    // Reload the page to reset all state
    window.location.href = '/mint';
  };

  // Show success state
  if (isConfirmed) {
    return (
      <MainLayout>
        <div className="max-w-3xl mx-auto px-6 lg:px-12 py-16">
          <div className="bg-surface-container-low rounded-3xl p-12 border border-outline-variant/5 text-center">
            <div className="w-20 h-20 bg-green-400/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-12 h-12 text-green-400" />
            </div>
            <h1 className="text-3xl font-headline font-bold mb-4">NFT Minted Successfully!</h1>
            <p className="text-slate-400 mb-8">
              Your NFT has been successfully created and minted to the blockchain.
            </p>
            
            {txHash && (
              <div className="mb-8">
                <a
                  href={`https://sepolia.etherscan.io/tx/${txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:text-primary-light transition-colors"
                >
                  View on Etherscan <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            <div className="flex gap-4 justify-center">
              <button
                onClick={handleSuccess}
                className="px-8 py-3 bg-primary text-on-primary font-bold rounded-xl hover:bg-primary/90 transition-all"
              >
                View My NFTs
              </button>
              <button
                onClick={handleMintAnother}
                className="px-8 py-3 bg-surface-container-high text-on-surface font-bold rounded-xl hover:bg-surface-bright transition-all"
              >
                Mint Another
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto px-6 lg:px-12 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-outline hover:text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
          <h1 className="text-4xl font-headline font-bold tracking-tight mb-2">Create NFT</h1>
          <p className="text-slate-400">
            Mint your unique digital asset on the blockchain
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Image Upload */}
          <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/5">
            <h2 className="text-xl font-headline font-bold mb-6">Upload Image</h2>
            
            {!imagePreview ? (
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-outline-variant/30 rounded-2xl p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
              >
                <Upload className="w-12 h-12 text-outline mx-auto mb-4" />
                <p className="font-headline font-bold mb-2">
                  Click or drag image to upload
                </p>
                <p className="text-sm text-slate-400">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            ) : (
              <div className="relative aspect-square max-w-md mx-auto">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  fill
                  className="object-contain rounded-xl"
                />
                <button
                  type="button"
                  onClick={handleImageDelete}
                  className="absolute top-4 right-4 w-8 h-8 bg-red-400/20 text-red-400 rounded-full flex items-center justify-center hover:bg-red-400/30 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleImageSelect(e.target.files[0])}
              className="hidden"
            />
          </div>

          {/* NFT Details */}
          <div className="bg-surface-container-low rounded-3xl p-8 border border-outline-variant/5 space-y-6">
            <h2 className="text-xl font-headline font-bold">NFT Details</h2>
            
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-bold mb-2">
                Name <span className="text-red-400">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter NFT name"
                disabled={isSubmitting}
                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-bold mb-2">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your NFT"
                rows={4}
                disabled={isSubmitting}
                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50 resize-none"
                required
              />
            </div>

            {/* Recipient Address (Optional) */}
            <div>
              <label htmlFor="recipient" className="block text-sm font-bold mb-2">
                Recipient Address <span className="text-slate-400">(Optional)</span>
              </label>
              <input
                id="recipient"
                type="text"
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder={userAddress || 'Connect wallet'}
                disabled={isSubmitting}
                className="w-full bg-surface-container-high border border-outline-variant/20 rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
              />
              <p className="text-xs text-slate-400 mt-2">
                Leave blank to mint to your own address: {userAddress?.slice(0, 6)}...{userAddress?.slice(-4)}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-red-400 mb-1">Minting Failed</p>
                <p className="text-sm text-red-300">{error.message}</p>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={!isValid || isSubmitting || !userAddress}
              className={clsx(
                'flex-1 py-4 rounded-xl font-headline font-bold text-lg transition-all',
                isValid && !isSubmitting && userAddress
                  ? 'bg-primary text-on-primary hover:bg-primary/90 shadow-lg shadow-primary/20'
                  : 'bg-surface-container-high text-outline cursor-not-allowed opacity-50'
              )}
            >
              {isUploading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Uploading...
                </span>
              ) : isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Confirm in Wallet...
                </span>
              ) : isConfirming ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Minting...
                </span>
              ) : (
                'Mint NFT'
              )}
            </button>
          </div>

          {!userAddress && (
            <p className="text-center text-sm text-red-400">
              Please connect your wallet to mint NFTs
            </p>
          )}
        </form>
      </div>
    </MainLayout>
  );
}
