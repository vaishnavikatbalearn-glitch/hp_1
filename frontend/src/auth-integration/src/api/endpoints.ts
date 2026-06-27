/**
 * Single source of truth for auth endpoint paths.
 * Update these to match your backend's actual routes.
 */
export const AUTH_ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  ME: '/auth/me',
} as const;
