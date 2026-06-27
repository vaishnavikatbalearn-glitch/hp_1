import { apiClient } from './axiosInstance';
import { AUTH_ENDPOINTS } from './endpoints';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../auth/types';

/**
 * Thin, framework-agnostic wrapper around the auth HTTP calls.
 * No React, no React Query here — just axios in, typed data out.
 * This keeps the hooks layer (useLogin, useRegister, ...) simple to test/mock.
 */
export const authService = {
  login: async (payload: LoginPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, payload);
    return data;
  },

  markAttendance: async (payload: unknown): Promise<unknown> => {
    const { data } = await apiClient.post('/attendance/mark', payload);
    return data;
  },

  getStudentAttendance: async (studentId: string): Promise<unknown> => {
    const { data } = await apiClient.get(`/attendance/student/${studentId}`);
    return data;
  },

  getTodayAttendance: async (): Promise<unknown> => {
    const { data } = await apiClient.get('/attendance/today');
    return data;
  },

  getAttendanceSummary: async (params?: Record<string, string | number | undefined>): Promise<unknown> => {
    const { data } = await apiClient.get('/attendance/summary', { params });
    return data;
  },

  updateAttendance: async (id: string, payload: unknown): Promise<unknown> => {
    const { data } = await apiClient.patch(`/attendance/${id}`, payload);
    return data;
  },

  register: async (payload: RegisterPayload): Promise<AuthResponse> => {
    const { data } = await apiClient.post<AuthResponse>(AUTH_ENDPOINTS.REGISTER, payload);
    return data;
  },

  refresh: async (): Promise<{ accessToken: string }> => {
    const { data } = await apiClient.post<{ accessToken: string }>(AUTH_ENDPOINTS.REFRESH);
    return data;
  },

  logout: async (): Promise<void> => {
    await apiClient.post(AUTH_ENDPOINTS.LOGOUT);
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await apiClient.get<User>(AUTH_ENDPOINTS.ME);
    return data;
  },
};
