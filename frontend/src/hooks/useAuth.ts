// ─── useAuth hook ─────────────────────────────────────────────────────────────
// Lightweight auth state management. Replace with a proper auth context in production.

import { useState, useCallback } from "react";

export type AppRole =
  | "student" | "parent" | "warden"
  | "superadmin" | "admin" | "trustee" | "accountant" | "laundry";

interface AuthState {
  role: AppRole | null;
  isAuthenticated: boolean;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    role: null,
    isAuthenticated: false,
  });

  const login = useCallback((role: AppRole) => {
    setState({ role, isAuthenticated: true });
  }, []);

  const logout = useCallback(() => {
    setState({ role: null, isAuthenticated: false });
  }, []);

  return {
    role: state.role,
    isAuthenticated: state.isAuthenticated,
    login,
    logout,
  };
}
