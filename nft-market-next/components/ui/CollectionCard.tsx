'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, TrendingUp, TrendingDown } from 'lucide-react';
import { clsx } from 'clsx';

interface CollectionCardProps {
  id: string;
  name: string;
  image: string;
  creator: string;
  isVerified?: boolean;
  floorPrice: string;
  volume: string;
  change24h: number;
  href?: string;
  className?: string;
}

export default function CollectionCard({
  id,
  name,
  image,
  creator,
  isVerified = false,
  floorPrice,
  volume,
  change24h,
  href = '#',
  className,
}: CollectionCardProps) {
  const isPositive = change24h >= 0;

  // Format creator address: show first 6 and last 4 characters
  const formatAddress = (address: string) => {
    if (!address || address === 'Unknown' || address.length < 10) {
      return address;
    }
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const displayCreator = formatAddress(creator);

  return (
    <Link
      href={href}
      className={clsx(
        'group bg-surface-container-low p-6 rounded-3xl border border-outline-variant/10 hover:border-primary/30 transition-all duration-300 block',
        className
      )}
    >
      <div className="flex items-center gap-4 mb-6">
        <div className="w-16 h-16 rounded-2xl overflow-hidden">
          <Image
            src={image}
            alt={name}
            width={64}
            height={64}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-headline font-bold text-lg truncate">{name}</h4>
          <p className="text-xs text-outline-variant flex items-center gap-1">
            by <span className="text-primary hover:underline" title={creator}>{displayCreator}</span>
            {isVerified && (
              <BadgeCheck className="w-4 h-4 text-secondary fill-secondary" />
            )}
          </p>
        </div>
        <div className="text-right">
          <p
            className={clsx(
              'text-xs font-headline font-bold flex items-center gap-1',
              isPositive ? 'text-secondary' : 'text-error'
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {isPositive ? '+' : ''}
            {change24h}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="bg-surface-container px-4 py-3 rounded-2xl">
          <p className="text-[10px] text-outline uppercase tracking-widest mb-1">Floor Price</p>
          <p className="font-headline font-bold text-secondary">{floorPrice}</p>
        </div>
        <div className="bg-surface-container px-4 py-3 rounded-2xl">
          <p className="text-[10px] text-outline uppercase tracking-widest mb-1">Volume</p>
          <p className="font-headline font-bold text-on-surface">{volume}</p>
        </div>
      </div>
    </Link>
  );
}
