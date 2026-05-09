'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch, ApiError } from '@/lib/api';
import { decodeJwtPayload, isTokenExpired } from '@/lib/auth';

const TOKEN_KEY = 'inventory-auth-token';

interface AuthContextValue {
  token: string | null;
  staffId: string | null;
  role: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken]   = useState<string | null>(null);
  const [staffId, setStaffId] = useState<string | null>(null);
  const [role, setRole]     = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      const payload = decodeJwtPayload(stored);
      if (payload && !isTokenExpired(payload)) {
        setToken(stored);
        setStaffId(payload.sub);
        setRole(payload.role);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiFetch<{ token: string }>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    const payload = decodeJwtPayload(res.token);
    if (!payload) throw new ApiError(500, 'Invalid token received');

    localStorage.setItem(TOKEN_KEY, res.token);
    setToken(res.token);
    setStaffId(payload.sub);
    setRole(payload.role);
    router.push('/dashboard');
  }, [router]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setStaffId(null);
    setRole(null);
    router.push('/');
  }, [router]);

  const value = useMemo<AuthContextValue>(() => ({
    token,
    staffId,
    role,
    loading,
    isAuthenticated: !!token,
    login,
    logout,
  }), [token, staffId, role, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
