'use client';

import Image from 'next/image';
import { ShoppingCart, Tag, ArrowRightLeft } from 'lucide-react';
import { clsx } from 'clsx';

interface Activity {
  id: string;
  event: 'sale' | 'list' | 'transfer' | 'bid';
  itemName: string;
  itemImage: string;
  price?: string;
  priceUsd?: string;
  from: string;
  to?: string;
  time: string;
}

interface ActivityTableProps {
  activities: Activity[];
  className?: string;
}

const eventIcons = {
  sale: ShoppingCart,
  list: Tag,
  transfer: ArrowRightLeft,
  bid: Tag,
};

const eventColors = {
  sale: 'text-secondary',
  list: 'text-primary',
  transfer: 'text-outline',
  bid: 'text-tertiary',
};

export default function ActivityTable({ activities, className }: ActivityTableProps) {
  return (
    <div className={clsx('overflow-x-auto', className)}>
      <table className="w-full text-left border-separate border-spacing-y-4">
        <thead className="text-[10px] text-slate-500 uppercase tracking-widest font-label">
          <tr>
            <th className="px-4 pb-2">Event</th>
            <th className="px-4 pb-2">Item</th>
            <th className="px-4 pb-2 text-right">Price</th>
            <th className="px-4 pb-2 text-right">From</th>
            <th className="px-4 pb-2 text-right">To</th>
            <th className="px-4 pb-2 text-right">Time</th>
          </tr>
        </thead>
        <tbody className="text-sm font-body">
          {activities.map((activity) => {
            const Icon = eventIcons[activity.event];
            return (
              <tr
                key={activity.id}
                className="bg-surface-container-high/30 hover:bg-surface-container-high/60 transition-colors group"
              >
                <td className="px-4 py-5 first:rounded-l-2xl">
                  <div className="flex items-center gap-3">
                    <Icon className={clsx('text-lg', eventColors[activity.event])} />
                    <span className="font-bold capitalize">{activity.event}</span>
                  </div>
                </td>
                <td className="px-4 py-5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg overflow-hidden">
                      <Image
                        src={activity.itemImage}
                        alt={activity.itemName}
                        width={40}
                        height={40}
                        className="object-cover"
                      />
                    </div>
                    <span className="font-bold">{activity.itemName}</span>
                  </div>
                </td>
                <td className="px-4 py-5 text-right">
                  {activity.price ? (
                    <div>
                      <span className="font-bold text-secondary">{activity.price}</span>
                      {activity.priceUsd && (
                        <p className="text-[10px] text-slate-500">{activity.priceUsd}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
                <td className="px-4 py-5 text-right">
                  <span className="font-mono text-xs text-primary hover:underline cursor-pointer">
                    {activity.from}
                  </span>
                </td>
                <td className="px-4 py-5 text-right">
                  {activity.to ? (
                    <span className="font-mono text-xs text-primary hover:underline cursor-pointer">
                      {activity.to}
                    </span>
                  ) : (
                    <span className="text-slate-500">—</span>
                  )}
                </td>
                <td className="px-4 py-5 text-right text-slate-500 last:rounded-r-2xl">
                  {activity.time}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
