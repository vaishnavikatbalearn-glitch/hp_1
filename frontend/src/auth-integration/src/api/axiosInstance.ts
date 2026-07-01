import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { tokenManager } from '../auth/tokenManager';
import { AUTH_ENDPOINTS } from './endpoints';

// Vite convention. If this is a Create-React-App project instead, swap for
// process.env.REACT_APP_API_BASE_URL.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // required: lets the browser send/receive the httpOnly refresh cookie
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- Attach the in-memory access token to every outgoing request ---
apiClient.interceptors.request.use((config) => {
  const token = tokenManager.getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Called when a refresh attempt definitively fails (refresh cookie expired/invalid) ---
// AuthContext wires its own session-clearing logic into this on mount.
let onAuthFailure: () => void = () => {};
export function setOnAuthFailure(handler: () => void): void {
  onAuthFailure = handler;
}

// --- 401 handling with single-flight refresh + request queueing ---
// If five requests 401 at once, only one refresh call is made; the other
// four wait for it and then retry with the new token.
let isRefreshing = false;
let pendingQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (err: unknown) => void;
}> = [];

function flushQueue(error: unknown, token: string | null) {
  pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  pendingQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const isAuthEndpoint = originalRequest?.url?.includes(AUTH_ENDPOINTS.REFRESH);
    const shouldAttemptRefresh =
      error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint;

    if (!shouldAttemptRefresh) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingQueue.push({
          resolve: (token) => {
            if (token && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { data } = await apiClient.post<{ accessToken: string }>(AUTH_ENDPOINTS.REFRESH);
      tokenManager.setToken(data.accessToken);
      flushQueue(null, data.accessToken);

      if (originalRequest.headers) {
        originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      }
      return apiClient(originalRequest);
    } catch (refreshError) {
      flushQueue(refreshError, null);
      tokenManager.setToken(null);
      onAuthFailure();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);
