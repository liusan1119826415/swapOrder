'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Compass,
  LayoutGrid,
  Palette,
  BarChart3,
  Heart,
  Settings,
  Diamond,
  Plus,
} from 'lucide-react';
import { clsx } from 'clsx';

const navItems = [
  
  { label: 'Collections', href: '/collections', icon: LayoutGrid },
  { label: 'Portfolio', href: '/portfolio', icon: Compass },
  { label: 'Activity', href: '/activity', icon: BarChart3 },
  { label: 'Artists', href: '/artists', icon: Palette },
  
  { label: 'Favorites', href: '/favorites', icon: Heart },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-20 h-[calc(100vh-5rem)] w-64 bg-gradient-to-b from-[#131313] to-[#1a1a1a] hidden xl:flex flex-col py-8 z-40">
      <div className="px-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center border border-outline-variant/20">
            <Diamond className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-['Space_Grotesk'] font-bold text-sm tracking-tight">The Vault</h3>
            <p className="text-[10px] uppercase tracking-widest text-secondary font-['Space_Grotesk']">
              Digital Sovereignty
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 font-['Space_Grotesk'] uppercase text-xs tracking-widest">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-4 px-6 py-4 transition-all',
                isActive
                  ? 'bg-[#DDB7FF]/10 text-[#DDB7FF] border-r-4 border-[#DDB7FF]'
                  : 'text-slate-500 hover:bg-white/5 hover:translate-x-1'
              )}
            >
              <Icon className="w-5 h-5" style={isActive ? { fontWeight: 700 } : undefined} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="px-6 mt-auto">
        <Link href="/mint" className="block">
          <button className="w-full bg-surface-container-highest border border-outline-variant/20 text-on-surface font-['Space_Grotesk'] font-bold py-3 rounded-xl hover:bg-surface-bright transition-all active:scale-95 flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" />
            Create NFT
          </button>
        </Link>
      </div>
    </aside>
  );
}
