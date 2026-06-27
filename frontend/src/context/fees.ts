import { createContext, createElement, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  api,
  getFeeDetails,
  getNotifications,
  getParentVisitorRequests,
  getPaymentHistory,
  getPendingFees,
  payFee,
  type FeeRecord,
  type NotificationItem,
  type PaymentRecord,
  type PayFeePayload,
  type VisitorRequest,
} from "../services/api";

interface ParentDashboardSummary {
  attendance: string;
  leaveStatus: string;
  complaintStatus: string;
  laundryStatus: string;
  visitorStatus: string;
  feeStatus: string;
  notificationCount: string;
}

interface FeesContextValue {
  feeDetails: FeeRecord[];
  paymentHistory: FeeRecord[];
  pendingFees: FeeRecord[];
  loading: boolean;
  parentDashboard: ParentDashboardSummary;
  loadingParentDashboard: boolean;
  visitorRequests: VisitorRequest[];
  loadFees: (studentId: string) => Promise<void>;
  loadPaymentHistory: (studentId: string) => Promise<void>;
  loadPendingFees: () => Promise<void>;
  payFeeForRecord: (payload: PayFeePayload) => Promise<PaymentRecord>;
  refreshParentDashboard: () => Promise<void>;
}

const FeesContext = createContext<FeesContextValue | undefined>(undefined);

export function FeesProvider({ children }: { children: ReactNode }) {
  const [feeDetails, setFeeDetails] = useState<FeeRecord[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<FeeRecord[]>([]);
  const [pendingFees, setPendingFees] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [visitorRequests, setVisitorRequests] = useState<VisitorRequest[]>([]);
  const [loadingParentDashboard, setLoadingParentDashboard] = useState(false);
  const [parentDashboard, setParentDashboard] = useState<ParentDashboardSummary>({
    attendance: "Loading...",
    leaveStatus: "Loading...",
    complaintStatus: "Loading...",
    laundryStatus: "Loading...",
    visitorStatus: "Loading...",
    feeStatus: "Loading...",
    notificationCount: "Loading...",
  });

  const loadFees = async (studentId: string) => {
    setLoading(true);
    try {
      const data = await getFeeDetails(studentId);
      setFeeDetails(data);
    } finally {
      setLoading(false);
    }
  };

  const loadPaymentHistory = async (studentId: string) => {
    setLoading(true);
    try {
      const data = await getPaymentHistory(studentId);
      setPaymentHistory(data);
    } finally {
      setLoading(false);
    }
  };

  const loadPendingFees = async () => {
    setLoading(true);
    try {
      const data = await getPendingFees();
      setPendingFees(data);
    } finally {
      setLoading(false);
    }
  };

  const payFeeForRecord = async (payload: PayFeePayload) => {
    const payment = await payFee(payload);
    await Promise.all([loadPendingFees(), refreshParentDashboard()]);
    return payment;
  };

  const refreshParentDashboard = useCallback(async () => {
    setLoadingParentDashboard(true);
    try {
      const [attendanceSummary, leaveData, complaintData, laundryData, visitorData, feesData, notificationsData] = await Promise.allSettled([
        api.get<{ monthly?: { percentage?: number }; overallPercentage?: number }>("v1/attendance/summary"),
        api.get<Array<{ status?: string }>>("v1/leave/student"),
        api.get<Array<{ status?: string }>>("v1/complaints/my"),
        api.get<Array<{ status?: string }>>("v1/laundry"),
        getParentVisitorRequests(),
        getPendingFees(),
        getNotifications(),
      ]);

      const attendanceValue = attendanceSummary.status === "fulfilled"
        ? `${Number(attendanceSummary.value?.monthly?.percentage ?? attendanceSummary.value?.overallPercentage ?? 0)}%`
        : "0%";

      const leaveList = leaveData.status === "fulfilled" ? leaveData.value : [];
      const leaveStatus = leaveList.find((leave) => ["PENDING", "APPROVED"].includes(String(leave.status || "").toUpperCase()))
        ? `Leave ${String(leaveList.find((leave) => ["PENDING", "APPROVED"].includes(String(leave.status || "").toUpperCase()))?.status || "").toLowerCase()}`
        : "No Active Leave";

      const complaintList = complaintData.status === "fulfilled" ? complaintData.value : [];
      const complaintStatus = complaintList.length > 0
        ? `${complaintList.filter((complaint) => String(complaint.status || "").toUpperCase() !== "RESOLVED").length} Pending`
        : "No Complaints";

      const laundryList = laundryData.status === "fulfilled" ? laundryData.value : [];
      const laundryStatus = laundryList[0]?.status ? laundryList[0].status : "No Requests";

      const visitorList = visitorData.status === "fulfilled" ? visitorData.value : [];
      const visitorStatus = visitorList[0]?.status ? visitorList[0].status : "No Requests";

      const feeList = feesData.status === "fulfilled" ? feesData.value : [];
      const pendingAmount = feeList.reduce((total, fee) => {
        const amount = Number(fee.amount ?? 0);
        const paid = Number(fee.paidAmount ?? 0);
        return total + Math.max(amount - paid, 0);
      }, 0);

      const notificationList = notificationsData.status === "fulfilled" ? notificationsData.value : [];
      const unreadCount = notificationList.filter((notification: NotificationItem) => !notification.read && !notification.isRead).length;

      setVisitorRequests(visitorList);
      setParentDashboard({
        attendance: attendanceValue,
        leaveStatus,
        complaintStatus,
        laundryStatus,
        visitorStatus,
        feeStatus: `₹${pendingAmount.toLocaleString()}`,
        notificationCount: String(unreadCount),
      });
    } catch {
      setVisitorRequests([]);
      setParentDashboard({
        attendance: "0%",
        leaveStatus: "No Active Leave",
        complaintStatus: "No Complaints",
        laundryStatus: "No Requests",
        visitorStatus: "No Requests",
        feeStatus: "₹0",
        notificationCount: "0",
      });
    } finally {
      setLoadingParentDashboard(false);
    }
  }, []);

  const value = useMemo<FeesContextValue>(
    () => ({
      feeDetails,
      paymentHistory,
      pendingFees,
      loading,
      parentDashboard,
      loadingParentDashboard,
      visitorRequests,
      loadFees,
      loadPaymentHistory,
      loadPendingFees,
      payFeeForRecord,
      refreshParentDashboard,
    }),
    [feeDetails, paymentHistory, pendingFees, loading, parentDashboard, loadingParentDashboard, visitorRequests, refreshParentDashboard],
  );

  return createElement(FeesContext.Provider, { value }, children);
}

export function useFeesContext() {
  const context = useContext(FeesContext);
  if (!context) {
    throw new Error("useFeesContext must be used within a FeesProvider");
  }
  return context;
}
