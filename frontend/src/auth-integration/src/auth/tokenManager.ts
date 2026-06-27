/**
 * In-memory access-token store.
 *
 * Deliberately NOT persisted to localStorage/sessionStorage — that would
 * expose it to XSS. The refresh token lives in an httpOnly cookie set by
 * the backend and is never readable by JS; the browser attaches it
 * automatically as long as requests are made with `withCredentials: true`.
 *
 * This is a plain module (not a React hook) so the axios interceptors,
 * which live outside the React tree, can read/write it too.
 */

type Listener = (token: string | null) => void;

let accessToken: string | null = null;
const listeners = new Set<Listener>();

export const tokenManager = {
  getToken(): string | null {
    return accessToken;
  },

  setToken(token: string | null): void {
    accessToken = token;
    listeners.forEach((listener) => listener(accessToken));
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
