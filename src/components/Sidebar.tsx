'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Calendar, 
  ClipboardList, 
  BarChart3, 
  FileText, 
  Timer,
  Sparkles,
  CheckSquare
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';

const navItems = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/calendar', label: 'Calendar', icon: Calendar },
  { href: '/daily-tracker', label: 'Daily Tracker', icon: ClipboardList },
  { href: '/todo', label: 'Tasks', icon: CheckSquare },
  { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  { href: '/notes', label: 'Notes', icon: FileText },
  { href: '/focus', label: 'Focus Timer', icon: Timer },
];

export default function Sidebar() {
  const pathname = usePathname();
  const userId = useAppStore((state) => state.userId);
  const initUserId = useAppStore((state) => state.initUserId);

  useEffect(() => {
    initUserId();
  }, [initUserId]);

  return (
    <aside className="fixed left-0 top-0 h-screen w-[280px] bg-primary-dark border-r border-accent-light/10 flex flex-col z-50">
      <div className="p-6 border-b border-accent-light/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-orange to-accent-red flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">SmartLife</h1>
            <p className="text-xs text-accent-light/60">Productivity Tracker</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-accent-light/10">
        <div className="glass-card p-4">
          <p className="text-xs text-accent-light/60 mb-1">Your ID</p>
          <p className="text-sm text-accent-light truncate font-mono">{userId}</p>
        </div>
      </div>
    </aside>
  );
}
