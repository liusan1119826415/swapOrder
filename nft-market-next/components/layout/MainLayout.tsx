import { ReactNode } from 'react';
import TopNav from './TopNav';
import SideNav from './SideNav';

interface MainLayoutProps {
  children: ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-surface">
      <TopNav />
      <SideNav />
      <main className="pt-20 pb-20 xl:pl-72 pr-8 lg:px-12">
        {children}
      </main>
    </div>
  );
}
