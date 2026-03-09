'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { useAppStore } from '@/store/useAppStore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const protectedRoutes = ['/dashboard', '/calendar', '/tasks', '/analytics', '/daily-tracker', '/todo', '/expenses', '/notes', '/focus'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const setUserId = useAppStore((state) => state.setUserId);
  const setTasks = useAppStore((state) => state.setTasks);
  const setDaysData = useAppStore((state) => state.setDaysData);
  const setSelectedDay = useAppStore((state) => state.setSelectedDay);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);

      // Keep all app data strictly bound to authenticated Firebase UID.
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId('');
        setTasks([]);
        setDaysData([]);
        setSelectedDay(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [setDaysData, setSelectedDay, setTasks, setUserId]);

  useEffect(() => {
    if (!loading) {
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
      const isAuthRoute = pathname === '/login' || pathname === '/register';
      
      if (!user && isProtectedRoute) {
        router.push('/login');
      } else if (user && isAuthRoute) {
        router.push('/dashboard');
      }
    }
  }, [user, loading, pathname, router]);

  const logout = async () => {
    await firebaseSignOut(auth);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
