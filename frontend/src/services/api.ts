// ─── API Service ──────────────────────────────────────────────────────────────
// Shared frontend API helpers for backend integration.
// Includes improved error handling, typing, and loading state utilities.

import { AxiosError } from 'axios';
import { apiClient } from "../auth-integration/src/api/axiosInstance";
import { ApiError, ApiResult, safeApiCall, parallelApiCalls } from './apiError';

/**
 * Standard API response envelope from backend
 */
export type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

/**
 * Options for API calls
 */
export interface ApiCallOptions {
  /** Human-readable operation name for error logging */
  operationName?: string;
  /** Custom error message to use if request fails */
  errorMessage?: string;
  /** Whether to log errors to console */
  logErrors?: boolean;
}

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

export type StaffRole = 'ADMIN' | 'WARDEN' | 'TRUSTEE' | 'ACCOUNTANT' | 'LAUNDRY_STAFF';

export interface StaffAccountRecord {
  id: string;
  fullName: string;
  email: string;
  mobileNumber?: string | null;
  role: StaffRole | string;
  hostelAssignment?: string | null;
  status?: string | null;
  createdBy?: string | null;
  createdAt?: string;
  updatedAt?: string;
  activationToken?: string | null;
  otpExpiry?: string | null;
  employeeCode?: string | null;
  isActive?: boolean;
}

export interface CreateStaffPayload {
  fullName: string;
  email: string;
  phone: string;
  role: StaffRole;
  hostelId: string;
}

export interface UpdateStaffPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  role?: StaffRole;
  hostelId?: string;
}

export interface ResetStaffPasswordPayload {
  password: string;
  otp?: string;
}

export interface StudentRecord {
  id: string;
  userId: string;
  hostelId: string;
  enrollmentNumber: string;
  firstName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  emergencyPhone: string;
  bloodGroup?: string;
  photoUrl?: string;
  address: string;
  city: string;
  state: string;
  pinCode: string;
  course: string;
  year: number;
  branch: string;
  college: string;
  isActive: boolean;
  admissionDate: string;
  vacateDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RoomRecord {
  id: string;
  roomNumber: string;
  type: string;
  capacity: number;
  currentOccupancy: number;
  status: string;
  description?: string;
  floorId: string;
  floor?: {
    id: string;
    number: number;
    name: string;
  };
}

export interface FloorRecord {
  id: string;
  number: number;
  name: string;
  isActive: boolean;
  rooms: Array<{
    id: string;
    roomNumber: string;
    capacity: number;
    currentOccupancy: number;
    status: string;
  }>;
  totalRooms: number;
  occupiedRooms: number;
  availableRooms: number;
}

export interface ComplaintRecord {
  id: string;
  studentId: string;
  category: string;
  subject: string;
  description: string;
  priority: number;
  status: string;
  attachmentUrls: string[];
  assignedTo?: string | null;
  resolution?: string | null;
  resolvedAt?: string | null;
  resolvedBy?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    enrollmentNumber: string;
    firstName: string;
    lastName: string;
    user?: {
      id: string;
      email: string;
    };
  };
}

export interface LaundryRequest {
  id: string;
  studentId: string;
  itemCount: number;
  items: Array<{
    name: string;
    qty: number;
  }>;
  status: string;
  notes?: string | null;
  collectedAt?: string | null;
  readyAt?: string | null;
  deliveredAt?: string | null;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    enrollmentNumber: string;
    firstName: string;
    lastName: string;
  };
}

export interface MovementLog {
  id: string;
  studentId: string;
  type: string;
  timestamp: string;
  purpose?: string | null;
  destination?: string | null;
  expectedReturn?: string | null;
  actualReturn?: string | null;
  isOvernightPass: boolean;
  leaveId?: string | null;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
    hostelId?: string;
  };
}

export interface NoticeRecord {
  id: string;
  title: string;
  content: string;
  category: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
}

export interface EventRecord {
  id: string;
  title: string;
  description?: string;
  date: string;
  location?: string;
  attendees?: number;
  photos?: number;
  videos?: number;
  createdAt: string;
  updatedAt: string;
}

export interface RewardRecord {
  id: string;
  studentId: string;
  rewardType: string;
  points: number;
  reason: string;
  awardedDate: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface FineRecord {
  id: string;
  studentId: string;
  amount: number;
  reason: string;
  status: string;
  issuedDate: string;
  dueDate?: string;
  paidDate?: string;
  student?: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

/**
 * Typed GET request with error handling
 * @throws ApiError if request fails
 */
export async function apiGet<T>(path: string, options?: ApiCallOptions): Promise<T> {
  try {
    const { data } = await apiClient.get<ApiEnvelope<T>>(path);
    return data.data;
  } catch (err) {
    const error = err instanceof AxiosError ? ApiError.fromAxiosError(err) : new ApiError(0, String(err));
    if (options?.logErrors !== false) {
      console.error(`[API GET] ${options?.operationName ?? path}:`, error);
    }
    throw error;
  }
}

/**
 * Typed POST request with error handling
 * @throws ApiError if request fails
 */
export async function apiPost<T>(path: string, body: unknown, options?: ApiCallOptions): Promise<T> {
  try {
    const { data } = await apiClient.post<ApiEnvelope<T>>(path, body);
    return data.data;
  } catch (err) {
    const error = err instanceof AxiosError ? ApiError.fromAxiosError(err) : new ApiError(0, String(err));
    if (options?.logErrors !== false) {
      console.error(`[API POST] ${options?.operationName ?? path}:`, error);
    }
    throw error;
  }
}

/**
 * Typed PUT request with error handling
 * @throws ApiError if request fails
 */
export async function apiPut<T>(path: string, body: unknown, options?: ApiCallOptions): Promise<T> {
  try {
    const { data } = await apiClient.put<ApiEnvelope<T>>(path, body);
    return data.data;
  } catch (err) {
    const error = err instanceof AxiosError ? ApiError.fromAxiosError(err) : new ApiError(0, String(err));
    if (options?.logErrors !== false) {
      console.error(`[API PUT] ${options?.operationName ?? path}:`, error);
    }
    throw error;
  }
}

/**
 * Typed PATCH request with error handling
 * @throws ApiError if request fails
 */
export async function apiPatch<T>(path: string, body: unknown, options?: ApiCallOptions): Promise<T> {
  try {
    const { data } = await apiClient.patch<ApiEnvelope<T>>(path, body);
    return data.data;
  } catch (err) {
    const error = err instanceof AxiosError ? ApiError.fromAxiosError(err) : new ApiError(0, String(err));
    if (options?.logErrors !== false) {
      console.error(`[API PATCH] ${options?.operationName ?? path}:`, error);
    }
    throw error;
  }
}

/**
 * Typed DELETE request with error handling
 * @throws ApiError if request fails
 */
export async function apiDelete<T>(path: string, options?: ApiCallOptions): Promise<T> {
  try {
    const { data } = await apiClient.delete<ApiEnvelope<T>>(path);
    return data.data;
  } catch (err) {
    const error = err instanceof AxiosError ? ApiError.fromAxiosError(err) : new ApiError(0, String(err));
    if (options?.logErrors !== false) {
      console.error(`[API DELETE] ${options?.operationName ?? path}:`, error);
    }
    throw error;
  }
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
  return apiGet<NotificationItem[]>("/v1/notifications");
}

export async function createNotification(payload: { title: string; body: string; type?: string; data?: Record<string, unknown> | null }): Promise<NotificationItem> {
  return apiPost<NotificationItem>("/v1/notifications", payload);
}

export async function markNotificationAsRead(id: string): Promise<NotificationItem> {
  return apiPatch<NotificationItem>(`/v1/notifications/${id}/read`, {});
}

export async function listStaffAccounts(): Promise<StaffAccountRecord[]> {
  return apiGet<StaffAccountRecord[]>("v1/admin/staff");
}

export async function createStaffAccount(payload: CreateStaffPayload): Promise<{ staff: StaffAccountRecord; activationToken?: string; activationExpiresAt?: string }> {
  return apiPost<{ staff: StaffAccountRecord; activationToken?: string; activationExpiresAt?: string }>("v1/admin/staff", payload);
}

export async function updateStaffAccount(id: string, payload: UpdateStaffPayload): Promise<StaffAccountRecord> {
  return apiPatch<StaffAccountRecord>(`v1/admin/staff/${id}`, payload);
}

export async function disableStaffAccount(id: string): Promise<StaffAccountRecord> {
  return apiPatch<StaffAccountRecord>(`v1/admin/staff/${id}/disable`, {});
}

export async function enableStaffAccount(id: string): Promise<StaffAccountRecord> {
  return apiPatch<StaffAccountRecord>(`v1/admin/staff/${id}/enable`, {});
}

export async function sendStaffOtp(id: string): Promise<{ success?: boolean; message?: string }> {
  return apiPost<{ success?: boolean; message?: string }>(`v1/admin/staff/${id}/send-otp`, {});
}

export async function resetStaffPassword(id: string, payload: ResetStaffPasswordPayload): Promise<{ success?: boolean; message?: string }> {
  return apiPost<{ success?: boolean; message?: string }>(`v1/admin/staff/${id}/reset-password`, payload);
}

export async function requestStaffActivationOtp(email: string): Promise<{ message: string }> {
  return apiPost<{ message: string }>("v1/auth/request-otp", { email });
}

export async function verifyStaffActivationOtp(email: string, otp: string): Promise<{ message?: string }> {
  return apiPost<{ message?: string }>("v1/auth/verify-otp", { email, otp });
}

export async function activateStaffAccountWithToken(token: string, password: string): Promise<{ id: string; email: string }> {
  return apiPost<{ id: string; email: string }>("v1/admin/activate-account", { token, password });
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

// ─── Student Management ───────────────────────────────────────────────────────

export async function getStudents(): Promise<StudentRecord[]> {
  return apiGet<StudentRecord[]>('v1/student');
}

export async function getStudentById(id: string): Promise<StudentRecord> {
  return apiGet<StudentRecord>(`v1/student/${id}`);
}

// ─── Room Management ─────────────────────────────────────────────────────────

export async function getRooms(): Promise<RoomRecord[]> {
  return apiGet<RoomRecord[]>('v1/rooms');
}

export async function getFloors(): Promise<FloorRecord[]> {
  return apiGet<FloorRecord[]>('v1/rooms/floors');
}

// ─── Complaint Management ────────────────────────────────────────────────────

export async function getComplaints(params?: { search?: string; status?: string; category?: string; priority?: number }): Promise<ComplaintRecord[]> {
  const qs = new URLSearchParams();
  if (params?.search) qs.append('search', params.search);
  if (params?.status) qs.append('status', params.status);
  if (params?.category) qs.append('category', params.category);
  if (typeof params?.priority !== 'undefined') qs.append('priority', String(params.priority));

  const path = qs.toString() ? `v1/complaints?${qs.toString()}` : 'v1/complaints';
  return apiGet<ComplaintRecord[]>(path);
}

export async function updateComplaintStatus(id: string, status: string, resolution?: string): Promise<ComplaintRecord> {
  return apiPatch<ComplaintRecord>(`v1/complaints/${id}`, { status, resolution });
}

export async function getComplaintTimeline(id: string): Promise<any[]> {
  return apiGet<any[]>(`v1/complaints/${id}/timeline`);
}

// ─── Laundry Management ──────────────────────────────────────────────────────

export async function getLaundryRequests(): Promise<LaundryRequest[]> {
  return apiGet<LaundryRequest[]>('v1/laundry');
}

export async function updateLaundryStatus(id: string, status: string): Promise<LaundryRequest> {
  return apiPatch<LaundryRequest>(`v1/laundry/${id}/status`, { status });
}

// ─── Notice Board ────────────────────────────────────────────────────────────

export async function getNotices(): Promise<NoticeRecord[]> {
  return apiGet<NoticeRecord[]>('v1/notices');
}

export async function createNotice(payload: { title: string; content: string; category: string; isPinned?: boolean }): Promise<NoticeRecord> {
  return apiPost<NoticeRecord>('v1/notices', payload);
}

// ─── Event Management ────────────────────────────────────────────────────────

export async function getEvents(): Promise<EventRecord[]> {
  return apiGet<EventRecord[]>('v1/events');
}

export async function createEvent(payload: { title: string; description?: string; date: string; location?: string }): Promise<EventRecord> {
  return apiPost<EventRecord>('v1/events', payload);
}

// ─── Reward Management ───────────────────────────────────────────────────────

export async function getRewards(): Promise<RewardRecord[]> {
  return apiGet<RewardRecord[]>('v1/rewards');
}

export async function createReward(payload: { studentId: string; rewardType: string; points: number; reason: string }): Promise<RewardRecord> {
  return apiPost<RewardRecord>('v1/rewards', payload);
}

// ─── Fine Management ─────────────────────────────────────────────────────────

export async function getFines(): Promise<FineRecord[]> {
  return apiGet<FineRecord[]>('v1/fines');
}

export async function createFine(payload: { studentId: string; amount: number; reason: string; dueDate?: string }): Promise<FineRecord> {
  return apiPost<FineRecord>('v1/fines', payload);
}

/**
 * Safe API call versions that return results instead of throwing
 */
export const apiSafe = {
  get: <T,>(path: string, options?: ApiCallOptions) => safeApiCall(() => apiGet<T>(path, options), options?.operationName),
  post: <T,>(path: string, body: unknown, options?: ApiCallOptions) => safeApiCall(() => apiPost<T>(path, body, options), options?.operationName),
  put: <T,>(path: string, body: unknown, options?: ApiCallOptions) => safeApiCall(() => apiPut<T>(path, body, options), options?.operationName),
  patch: <T,>(path: string, body: unknown, options?: ApiCallOptions) => safeApiCall(() => apiPatch<T>(path, body, options), options?.operationName),
  delete: <T,>(path: string, options?: ApiCallOptions) => safeApiCall(() => apiDelete<T>(path, options), options?.operationName),
};

/**
 * API client with various call types
 */
export const api = {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  patch: apiPatch,
  delete: apiDelete,
  // Safe versions
  safe: apiSafe,
};

// ─── Type Exports ─────────────────────────────────────────────────────────────
// Error handling types
export type { ApiResult } from './apiError';

// Loading state types
export type { LoadingState } from './apiLoading';

// ─── Function Exports ─────────────────────────────────────────────────────────
// Error handling functions
export { 
  ApiError,
  isSuccess, 
  isError, 
  safeApiCall,
  retryApiCall,
  parallelApiCalls,
} from './apiError';

// Loading state utilities
export { 
  getQueryLoadingState,
  getMutationLoadingState,
  combineLoadingStates,
  isAnyLoading,
  isAllIdle,
  useDebounceLoading,
  isInitialLoading,
  isRefetching,
  createLoadingState,
} from './apiLoading';
