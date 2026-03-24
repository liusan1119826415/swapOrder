'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import { clsx } from 'clsx';

interface NFTCardProps {
  id: string;
  name: string;
  image: string;
  price: string;
  priceUsd?: string;
  collectionName?: string;
  creatorAvatar?: string;
  creatorName?: string;
  status?: 'buy_now' | 'auction' | 'sold';
  isFavorite?: boolean;
  href?: string;
  className?: string;
}

export default function NFTCard({
  id,
  name,
  image,
  price,
  priceUsd,
  collectionName,
  creatorAvatar,
  creatorName,
  status = 'buy_now',
  isFavorite = false,
  href = '#',
  className,
}: NFTCardProps) {
  const statusLabels = {
    buy_now: 'Buy Now',
    auction: 'Auction',
    sold: 'Sold',
  };

  const statusColors = {
    buy_now: 'bg-black/60 text-white border-white/10',
    auction: 'bg-primary-container/80 text-on-primary-container border-primary/20',
    sold: 'bg-surface-variant/80 text-on-surface border-outline-variant/20',
  };

  return (
    <Link
      href={href}
      className={clsx(
        'group bg-surface-container-low rounded-3xl overflow-hidden hover:-translate-y-2 transition-all duration-300 block',
        className
      )}
    >
      <div className="relative aspect-square overflow-hidden m-2 rounded-2xl">
        <Image
          src={image}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 right-4 flex gap-2">
          <span
            className={clsx(
              'backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border',
              statusColors[status]
            )}
          >
            {statusLabels[status]}
          </span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h5 className="font-headline font-bold text-lg truncate pr-2 text-on-surface">
            {name}
          </h5>
          <button
            className={clsx(
              'transition-colors',
              isFavorite ? 'text-primary fill-primary' : 'text-outline-variant hover:text-primary'
            )}
          >
            <Heart className={clsx('w-5 h-5', isFavorite && 'fill-current')} />
          </button>
        </div>
        {creatorName && (
          <div className="flex items-center gap-2 mb-4">
            {creatorAvatar && (
              <div className="w-5 h-5 rounded-full overflow-hidden border border-primary/20">
                <Image
                  src={creatorAvatar}
                  alt={creatorName}
                  width={20}
                  height={20}
                  className="object-cover"
                />
              </div>
            )}
            <span className="text-xs text-outline hover:text-primary cursor-pointer transition-colors">
              {creatorName}
            </span>
          </div>
        )}
        <div className="flex justify-between items-end border-t border-outline-variant/10 pt-4">
          <div>
            <p className="text-[10px] text-outline uppercase tracking-widest mb-1">
              {status === 'auction' ? 'Highest Bid' : 'Price'}
            </p>
            <p className="font-headline font-bold text-secondary">{price}</p>
          </div>
          <button className="bg-primary/10 text-primary hover:bg-primary hover:text-on-primary px-4 py-2 rounded-xl text-xs font-headline font-bold transition-all">
            {status === 'auction' ? 'Bid Now' : 'Details'}
          </button>
        </div>
      </div>
    </Link>
  );
}
