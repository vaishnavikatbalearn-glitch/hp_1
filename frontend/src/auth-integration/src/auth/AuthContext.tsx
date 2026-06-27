import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { tokenManager } from './tokenManager';
import { setOnAuthFailure } from '../api/axiosInstance';
import { authService } from '../api/authService';
import type { User } from './types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  /** true while the app attempts a silent refresh on first load */
  isBootstrapping: boolean;
  setSession: (user: User, accessToken: string) => void;
  clearSession: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  const setSession = useCallback((nextUser: User, accessToken: string) => {
    tokenManager.setToken(accessToken);
    setUser(nextUser);
  }, []);

  const clearSession = useCallback(() => {
    tokenManager.setToken(null);
    setUser(null);
  }, []);

  // If axios's response interceptor exhausts a refresh attempt (refresh
  // cookie expired/invalid), it calls this to clear local session state.
  useEffect(() => {
    setOnAuthFailure(clearSession);
  }, [clearSession]);

  // On app load there's no access token in memory yet (page was refreshed,
  // new tab, etc). Try a silent refresh using the httpOnly cookie; if it
  // works, fetch the user. If not, the visitor is simply treated as logged out.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const { accessToken } = await authService.refresh();
        if (cancelled) return;
        tokenManager.setToken(accessToken);

        const currentUser = await authService.getCurrentUser();
        if (cancelled) return;
        setUser(currentUser);
      } catch {
        if (!cancelled) clearSession();
      } finally {
        if (!cancelled) setIsBootstrapping(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      isBootstrapping,
      setSession,
      clearSession,
    }),
    [user, isBootstrapping, setSession, clearSession]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
