'use client';

import { clsx } from 'clsx';

interface StatsCardProps {
  label: string;
  value: string;
  subValue?: string;
  subValueColor?: 'positive' | 'negative' | 'neutral';
  icon?: React.ReactNode;
  className?: string;
}

export default function StatsCard({
  label,
  value,
  subValue,
  subValueColor = 'neutral',
  icon,
  className,
}: StatsCardProps) {
  const subValueColorClasses = {
    positive: 'text-green-400',
    negative: 'text-error',
    neutral: 'text-slate-400',
  };

  return (
    <div
      className={clsx(
        'p-4 rounded-2xl bg-surface-container-low border border-outline-variant/5',
        className
      )}
    >
      <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="font-headline font-bold text-on-surface text-lg">{value}</p>
        {subValue && (
          <span className={clsx('text-xs font-normal', subValueColorClasses[subValueColor])}>
            {subValue}
          </span>
        )}
      </div>
    </div>
  );
}
