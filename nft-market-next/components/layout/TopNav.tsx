'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, Wallet } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { clsx } from 'clsx';

const navItems = [
  { label: 'Marketplace', href: '/' },
  { label: 'Auctions', href: '/auctions' },
  { label: 'Drops', href: '/drops' },
  { label: 'Activity', href: '/activity' },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#131313]/60 backdrop-blur-xl flex items-center justify-between px-8 h-20 w-full shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border-b border-outline-variant/10">
      <div className="flex items-center gap-12">
        <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-[#DDB7FF] to-[#A6E6FF] bg-clip-text text-transparent font-['Space_Grotesk'] tracking-tight">
          Neon Vault
        </Link>
        {/* <div className="hidden md:flex items-center gap-8 font-['Space_Grotesk'] tracking-tight text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'transition-colors pb-1',
                pathname === item.href
                  ? 'text-[#DDB7FF] border-b-2 border-[#DDB7FF]'
                  : 'text-slate-400 hover:text-slate-100'
              )}
            >
              {item.label}
            </Link>
          ))}
        </div> */}
      </div>

      <div className="flex items-center gap-6">
        <div className="relative hidden lg:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-5 h-5" />
          <input
            type="text"
            placeholder="Search collections..."
            className="bg-surface-container-highest border-none rounded-full pl-10 pr-4 py-2 w-64 text-sm focus:ring-1 focus:ring-primary transition-all placeholder:text-outline"
          />
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 text-on-surface-variant hover:bg-white/5 rounded-full transition-all active:scale-95">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 text-on-surface-variant hover:bg-white/5 rounded-full transition-all active:scale-95">
            <Wallet className="w-5 h-5" />
          </button>
          <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openChainModal, openConnectModal, mounted }) => {
              const ready = mounted;
              const connected = ready && account && chain;

              return (
                <div
                  {...(!ready && {
                    'aria-hidden': true,
                    style: {
                      opacity: 0,
                      pointerEvents: 'none',
                      userSelect: 'none',
                    },
                  })}
                >
                  {(() => {
                    if (!connected) {
                      return (
                        <button
                          onClick={openConnectModal}
                          className="bg-primary text-on-primary font-label font-bold px-6 py-2.5 rounded-full hover:shadow-[0_0_15px_rgba(221,183,255,0.4)] transition-all active:scale-95"
                        >
                          Connect Wallet
                        </button>
                      );
                    }

                    if (chain.unsupported) {
                      return (
                        <button
                          onClick={openChainModal}
                          className="bg-error-container text-on-error-container font-label font-bold px-6 py-2.5 rounded-full hover:shadow-glow transition-all active:scale-95"
                        >
                          Wrong network
                        </button>
                      );
                    }

                    return (
                      <div className="flex items-center gap-3">
                        <button
                          onClick={openChainModal}
                          className="flex items-center gap-2 bg-surface-container-high px-3 py-2 rounded-full text-sm font-medium hover:bg-surface-bright transition-all"
                        >
                          {chain.hasIcon && (
                            <div
                              style={{
                                background: chain.iconBackground,
                                width: 16,
                                height: 16,
                                borderRadius: 999,
                                overflow: 'hidden',
                              }}
                            >
                              {chain.iconUrl && (
                                <img
                                  alt={chain.name ?? 'Chain icon'}
                                  src={chain.iconUrl}
                                  style={{ width: 16, height: 16 }}
                                />
                              )}
                            </div>
                          )}
                          {chain.name}
                        </button>

                        <button
                          onClick={openAccountModal}
                          className="bg-primary text-on-primary font-label font-bold px-4 py-2 rounded-full hover:shadow-[0_0_15px_rgba(221,183,255,0.4)] transition-all active:scale-95"
                        >
                          {account.displayName}
                        </button>
                      </div>
                    );
                  })()}
                </div>
              );
            }}
          </ConnectButton.Custom>
        </div>
      </div>
    </nav>
  );
}
