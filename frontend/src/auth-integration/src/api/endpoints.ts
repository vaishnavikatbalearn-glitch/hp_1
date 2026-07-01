/**
 * Single source of truth for auth endpoint paths.
 * Update these to match your backend's actual routes.
 */
export const AUTH_ENDPOINTS = {
  LOGIN: '/v1/auth/login',
  REGISTER: '/v1/auth/register',
  REFRESH: '/v1/auth/refresh',
  LOGOUT: '/v1/auth/logout',
  ME: '/v1/auth/me',
} as const;
