import { apiClient } from './axiosInstance';

const LAUNDRY_BASE = '/v1/laundry';

export type LaundryItemPayload = {
  name: string;
  qty: number;
};

export type CreateLaundryPayload = {
  items: LaundryItemPayload[];
  notes?: string;
};

export type LaundryStatus = 'COLLECTED' | 'WASHING' | 'DRYING' | 'READY' | 'DELIVERED';

export type UpdateLaundryStatusPayload = {
  status: LaundryStatus;
};

export async function createLaundryRequest(payload: CreateLaundryPayload) {
  const { data } = await apiClient.post<unknown>(LAUNDRY_BASE, payload);
  return data;
}

export async function getLaundryRequests() {
  const { data } = await apiClient.get<unknown[]>(LAUNDRY_BASE);
  return data;
}

export async function updateLaundryStatus(id: string, payload: UpdateLaundryStatusPayload) {
  const { data } = await apiClient.patch<unknown>(`${LAUNDRY_BASE}/${id}/status`, payload);
  return data;
}
