// ─── API Service ──────────────────────────────────────────────────────────────
// Shared frontend API helpers for backend integration.

import { apiClient } from "../auth-integration/src/api/axiosInstance";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

export interface FeeRecord {
  id: string;
  studentId: string;
  type: string;
  amount: number | string;
  dueDate: string;
  paidAmount: number | string;
  status: string;
  description?: string | null;
  month?: number | null;
  year?: number | null;
  payments?: PaymentRecord[];
  student?: {
    id: string;
    enrollmentNumber?: string;
    firstName?: string;
    lastName?: string;
  };
}

export interface PaymentRecord {
  id: string;
  feeRecordId: string;
  amount: number | string;
  method: string;
  transactionId?: string | null;
  receiptNumber: string;
  paidAt: string;
  notes?: string | null;
  collectedBy?: string;
}

export interface PayFeePayload {
  feeRecordId: string;
  amount: number;
  method: "CASH" | "BANK_TRANSFER" | "UPI" | "CHEQUE" | "ONLINE";
  transactionId?: string;
  receiptNumber: string;
  notes?: string;
}

export interface VisitorRequest {
  id?: string;
  visitorName: string;
  visitorPhone?: string;
  relation?: string | null;
  purpose: string;
  expectedDate: string;
  expectedDuration?: number | null;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVisitorPayload {
  visitorName: string;
  visitorPhone: string;
  relation?: string;
  purpose: string;
  expectedDate: string;
  expectedDuration?: number;
}

export interface NotificationItem {
  id: string;
  type?: string;
  title: string;
  body: string;
  time?: string;
  read?: boolean;
  createdAt?: string;
  isRead?: boolean;
}

export async function apiGet<T>(path: string): Promise<T> {
  const { data } = await apiClient.get<ApiEnvelope<T>>(path);
  return data.data;
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const { data } = await apiClient.post<ApiEnvelope<T>>(path, body);
  return data.data;
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const { data } = await apiClient.put<ApiEnvelope<T>>(path, body);
  return data.data;
}

export async function apiPatch<T>(path: string, body: unknown): Promise<T> {
  const { data } = await apiClient.patch<ApiEnvelope<T>>(path, body);
  return data.data;
}

export async function apiDelete<T>(path: string): Promise<T> {
  const { data } = await apiClient.delete<ApiEnvelope<T>>(path);
  return data.data;
}

const FEE_API_PREFIX = "v1/fees";

export async function getFeeDetails(studentId: string): Promise<FeeRecord[]> {
  return apiGet<FeeRecord[]>(`${FEE_API_PREFIX}/student/${studentId}`);
}

export async function getPaymentHistory(studentId: string): Promise<FeeRecord[]> {
  return apiGet<FeeRecord[]>(`${FEE_API_PREFIX}/history/${studentId}`);
}

export async function getPendingFees(): Promise<FeeRecord[]> {
  return apiGet<FeeRecord[]>(`${FEE_API_PREFIX}/pending`);
}

export async function payFee(payload: PayFeePayload): Promise<PaymentRecord> {
  return apiPost<PaymentRecord>(`${FEE_API_PREFIX}/payment`, payload);
}

export async function createVisitorRequest(payload: CreateVisitorPayload): Promise<VisitorRequest> {
  return apiPost<VisitorRequest>("v1/visitor", payload);
}

export async function getNotifications(): Promise<NotificationItem[]> {
  return apiGet<NotificationItem[]>("notifications");
}

export async function createNotification(payload: { title: string; body: string; type?: string; data?: Record<string, unknown> | null }): Promise<NotificationItem> {
  return apiPost<NotificationItem>("notifications", payload);
}

export async function markNotificationAsRead(id: string): Promise<NotificationItem> {
  return apiPatch<NotificationItem>(`notifications/${id}/read`, {});
}

export async function getParentVisitorRequests(): Promise<VisitorRequest[]> {
  return apiGet<VisitorRequest[]>("v1/visitor/student");
}

export async function getPendingVisitorRequests(): Promise<VisitorRequest[]> {
  return apiGet<VisitorRequest[]>("v1/visitor/warden");
}

export async function approveVisitorRequest(id: string): Promise<VisitorRequest> {
  return apiPatch<VisitorRequest>(`v1/visitor/${id}/approve`, {});
}

export async function rejectVisitorRequest(id: string): Promise<VisitorRequest> {
  return apiPatch<VisitorRequest>(`v1/visitor/${id}/reject`, {});
}

export const api = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
};
