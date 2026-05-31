'use client';

import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Header from './Header';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050b14] text-white flex">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header />
        <main className="flex-1 pb-24 md:pb-8">{children}</main>
      </div>
      <BottomNav />
    </div>
  );
}
