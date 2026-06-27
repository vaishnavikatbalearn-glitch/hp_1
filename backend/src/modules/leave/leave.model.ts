export interface LeaveRequestModel {
  id: string;
  studentId: string;
  reason: string;
  startDate: string;
  endDate: string;
  destination: string;
  contactNumber: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}
