'use client';

import { useCallback, useState } from 'react';
import { Menu, Sparkles } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import RealtimeAlertSystem from '@/components/RealtimeAlertSystem';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const closeMobileMenu = useCallback(() => setIsMobileMenuOpen(false), []);

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onClose={closeMobileMenu}
      />

      {isMobileMenuOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={closeMobileMenu}
        />
      )}

      <RealtimeAlertSystem />

      <div className="flex-1 lg:ml-[280px] min-w-0 overflow-x-hidden">
        <header className="fixed top-0 left-0 right-0 z-30 h-16 border-b border-accent-light/10 bg-primary-dark/95 backdrop-blur lg:hidden">
          <div className="h-full px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-orange to-accent-red flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-white">SmartLife</span>
            </div>

            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setIsMobileMenuOpen(true)}
              className="w-10 h-10 rounded-lg bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors"
            >
              <Menu className="w-5 h-5 text-accent-light" />
            </button>
          </div>
        </header>

        <main className="p-4 pt-20 sm:p-6 sm:pt-20 lg:p-8 lg:pt-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
