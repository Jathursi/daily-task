'use client';

import { LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';

export default function LogoutButton() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    await logout();
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <LogOut className="w-5 h-5" />
      )}
      <span className="font-medium">Sign Out</span>
    </button>
  );
}
