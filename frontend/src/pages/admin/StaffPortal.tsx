// ─── STAFF PORTAL — extracted from P4 (hp_p4) ────────────────────────────────
// Roles: superadmin, admin, trustee, accountant, laundry
// All screens are preserved exactly as generated from Figma.

import React, { useEffect, useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Users, Settings, Shield, FileText, Home, BarChart2,
  DollarSign, Bell, Search, Plus, ChevronRight, ArrowLeft,
  CheckCircle, XCircle, TrendingUp, TrendingDown, Activity,
  Database, Lock, Award, Truck, User, Wifi, HardDrive,
  MessageSquare, Star, Layers, CreditCard, Calendar,
  Clock, Eye, Edit, Trash2, Download, AlertCircle,
  MapPin, Package, RefreshCw, ChevronDown, Hash, Filter,
  Percent, LogOut, Phone,
} from "lucide-react";
import { getNotifications, markNotificationAsRead, getPendingFees, payFee, apiGet, type FeeRecord, type NotificationItem } from "../../services/api";

// ─── MOCK DATA ────────────────────────────────────────────────
const mockStudents = [
  { id: 1, name: "Arjun Sharma", room: "A-101", course: "B.Tech CS", year: 2, totalFee: 45000, paid: 45000, pending: 0, status: "paid", phone: "+91 98765 43210", parent: "Rajesh Sharma", attendance: 92 },
  { id: 2, name: "Priya Patel", room: "B-205", course: "B.Tech ECE", year: 3, totalFee: 45000, paid: 30000, pending: 15000, status: "partial", phone: "+91 98765 43211", parent: "Suresh Patel", attendance: 85 },
  { id: 3, name: "Rahul Verma", room: "C-310", course: "MCA", year: 1, totalFee: 50000, paid: 0, pending: 50000, status: "unpaid", phone: "+91 98765 43212", parent: "Mohan Verma", attendance: 78 },
  { id: 4, name: "Sneha Gupta", room: "A-204", course: "B.Tech ME", year: 4, totalFee: 45000, paid: 45000, pending: 0, status: "paid", phone: "+91 98765 43213", parent: "Ramesh Gupta", attendance: 96 },
  { id: 5, name: "Vikram Singh", room: "D-102", course: "MBA", year: 2, totalFee: 60000, paid: 40000, pending: 20000, status: "partial", phone: "+91 98765 43214", parent: "Ajay Singh", attendance: 88 },
  { id: 6, name: "Ananya Krishnan", room: "B-301", course: "B.Tech CS", year: 1, totalFee: 45000, paid: 45000, pending: 0, status: "paid", phone: "+91 98765 43215", parent: "Suresh Krishnan", attendance: 94 },
  { id: 7, name: "Deepak Mehta", room: "E-405", course: "B.Com", year: 3, totalFee: 38000, paid: 20000, pending: 18000, status: "partial", phone: "+91 98765 43216", parent: "Ramesh Mehta", attendance: 81 },
];
const mockWardens = [
  { id: 1, name: "Dr. Meena Kapoor", block: "A & B", phone: "+91 99001 12345", email: "meena.k@hostel.edu", shift: "Morning", status: "active" },
  { id: 2, name: "Mr. Rajiv Bose", block: "C & D", phone: "+91 99001 12346", email: "rajiv.b@hostel.edu", shift: "Evening", status: "active" },
  { id: 3, name: "Ms. Sunita Rao", block: "E", phone: "+91 99001 12347", email: "sunita.r@hostel.edu", shift: "Night", status: "active" },
];
const mockParents = [
  { id: 1, name: "Rajesh Sharma", child: "Arjun Sharma", room: "A-101", phone: "+91 98700 11111", email: "rajesh.s@gmail.com", status: "active" },
  { id: 2, name: "Suresh Patel", child: "Priya Patel", room: "B-205", phone: "+91 98700 22222", email: "suresh.p@gmail.com", status: "active" },
  { id: 3, name: "Mohan Verma", child: "Rahul Verma", room: "C-310", phone: "+91 98700 33333", email: "mohan.v@gmail.com", status: "active" },
];
const mockTrustees = [
  { id: 1, name: "Mr. Anil Kapoor", role: "Chairman", phone: "+91 98100 00001", email: "anil.k@trust.edu", status: "active" },
  { id: 2, name: "Dr. Savita Reddy", role: "Vice Chairman", phone: "+91 98100 00002", email: "savita.r@trust.edu", status: "active" },
  { id: 3, name: "Mr. Pradeep Joshi", role: "Secretary", phone: "+91 98100 00003", email: "pradeep.j@trust.edu", status: "active" },
  { id: 4, name: "Ms. Kavitha Nair", role: "Treasurer", phone: "+91 98100 00004", email: "kavitha.n@trust.edu", status: "active" },
];
const mockLaundryStaff = [
  { id: 1, name: "Ramesh Kumar", shift: "Morning", phone: "+91 98200 00001", status: "active", processed: 120 },
  { id: 2, name: "Sunita Devi", shift: "Evening", phone: "+91 98200 00002", status: "active", processed: 98 },
  { id: 3, name: "Mohan Lal", shift: "Night", phone: "+91 98200 00003", status: "active", processed: 85 },
];
const attendanceChartData = [
  { month: "Jan", present: 88, absent: 12, target: 90 },
  { month: "Feb", present: 91, absent: 9, target: 90 },
  { month: "Mar", present: 85, absent: 15, target: 90 },
  { month: "Apr", present: 93, absent: 7, target: 90 },
  { month: "May", present: 89, absent: 11, target: 90 },
  { month: "Jun", present: 94, absent: 6, target: 90 },
];
const feeChartData = [
  { month: "Jan", collected: 420, pending: 80 },
  { month: "Feb", collected: 380, pending: 120 },
  { month: "Mar", collected: 450, pending: 50 },
  { month: "Apr", collected: 390, pending: 110 },
  { month: "May", collected: 470, pending: 30 },
  { month: "Jun", collected: 440, pending: 60 },
];
const occupancyPie = [
  { name: "Occupied", value: 342 },
  { name: "Vacant", value: 58 },
];
const complaintData = [
  { month: "Jan", new: 12, resolved: 10 },
  { month: "Feb", new: 8, resolved: 9 },
  { month: "Mar", new: 15, resolved: 12 },
  { month: "Apr", new: 6, resolved: 8 },
  { month: "May", new: 10, resolved: 11 },
  { month: "Jun", new: 7, resolved: 7 },
];
const laundryChartData = [
  { day: "Mon", requests: 45, completed: 42 },
  { day: "Tue", requests: 52, completed: 50 },
  { day: "Wed", requests: 38, completed: 38 },
  { day: "Thu", requests: 61, completed: 55 },
  { day: "Fri", requests: 48, completed: 46 },
  { day: "Sat", requests: 70, completed: 65 },
  { day: "Sun", requests: 35, completed: 35 },
];
const leaveChartData = [
  { month: "Jan", approved: 18, rejected: 4, pending: 3 },
  { month: "Feb", approved: 22, rejected: 6, pending: 5 },
  { month: "Mar", approved: 15, rejected: 2, pending: 8 },
  { month: "Apr", approved: 28, rejected: 5, pending: 2 },
  { month: "May", approved: 20, rejected: 3, pending: 4 },
  { month: "Jun", approved: 25, rejected: 4, pending: 6 },
];
const yearlyData = [
  { year: "2021", students: 280, revenue: 45, attendance: 86 },
  { year: "2022", students: 310, revenue: 52, attendance: 88 },
  { year: "2023", students: 342, revenue: 58, attendance: 91 },
  { year: "2024", students: 390, revenue: 61, attendance: 89 },
];
const monthlyRevenue = [
  { month: "Jan", revenue: 42, expenses: 18 },
  { month: "Feb", revenue: 38, expenses: 16 },
  { month: "Mar", revenue: 45, expenses: 20 },
  { month: "Apr", revenue: 39, expenses: 17 },
  { month: "May", revenue: 47, expenses: 21 },
  { month: "Jun", revenue: 44, expenses: 19 },
];
const laundryRequests = [
  { id: 1, student: "Arjun Sharma", room: "A-101", clothes: "Uniform + Casual", qty: 8, pickup: "10:00 AM", status: "pending", date: "20 Jun" },
  { id: 2, student: "Priya Patel", room: "B-205", clothes: "Casual", qty: 5, pickup: "11:00 AM", status: "processing", date: "20 Jun" },
  { id: 3, student: "Rahul Verma", room: "C-310", clothes: "Uniform", qty: 3, pickup: "12:00 PM", status: "ready", date: "19 Jun" },
  { id: 4, student: "Sneha Gupta", room: "A-204", clothes: "Bedsheet", qty: 2, pickup: "09:00 AM", status: "delivered", date: "19 Jun" },
  { id: 5, student: "Vikram Singh", room: "D-102", clothes: "Casual + Sports", qty: 10, pickup: "02:00 PM", status: "pending", date: "20 Jun" },
  { id: 6, student: "Ananya Krishnan", room: "B-301", clothes: "Uniform", qty: 4, pickup: "03:00 PM", status: "processing", date: "20 Jun" },
  { id: 7, student: "Deepak Mehta", room: "E-405", clothes: "Casual", qty: 6, pickup: "04:00 PM", status: "ready", date: "20 Jun" },
];
const mockFines = [
  { id: 1, student: "Rahul Verma", room: "C-310", reason: "Late Night Return", amount: 500, date: "15 Jun", status: "unpaid" },
  { id: 2, student: "Vikram Singh", room: "D-102", reason: "Property Damage", amount: 2000, date: "12 Jun", status: "paid" },
  { id: 3, student: "Priya Patel", room: "B-205", reason: "Mess Rule Violation", amount: 300, date: "10 Jun", status: "unpaid" },
  { id: 4, student: "Arjun Sharma", room: "A-101", reason: "Noise Complaint", amount: 200, date: "08 Jun", status: "paid" },
];
const mockRewards = [
  { id: 1, student: "Sneha Gupta", room: "A-204", reason: "Best Attendance", amount: 1000, date: "15 Jun", type: "Academic" },
  { id: 2, student: "Ananya Krishnan", room: "B-301", reason: "Sports Achievement", amount: 500, date: "10 Jun", type: "Sports" },
  { id: 3, student: "Arjun Sharma", room: "A-101", reason: "Academic Excellence", amount: 2000, date: "01 Jun", type: "Scholarship" },
];
const auditLogs = [
  { id: 1, user: "Admin Raj", action: "Updated Student Profile — Arjun Sharma", date: "20 Jun", time: "09:45 AM", device: "iPhone 14", ip: "192.168.1.101" },
  { id: 2, user: "Super Admin", action: "Changed System Security Settings", date: "20 Jun", time: "09:12 AM", device: "MacBook Pro", ip: "192.168.1.100" },
  { id: 3, user: "Accountant Priya", action: "Collected Fee ₹30,000 from Priya Patel", date: "19 Jun", time: "04:30 PM", device: "Android Phone", ip: "192.168.1.105" },
  { id: 4, user: "Warden Meena", action: "Marked Attendance — Block A & B", date: "19 Jun", time: "08:00 AM", device: "Tablet", ip: "192.168.1.108" },
  { id: 5, user: "Admin Raj", action: "Approved Leave Request — Priya Patel", date: "19 Jun", time: "02:15 PM", device: "iPhone 14", ip: "192.168.1.101" },
  { id: 6, user: "Super Admin", action: "Added New Role — Night Warden", date: "18 Jun", time: "11:30 AM", device: "MacBook Pro", ip: "192.168.1.100" },
  { id: 7, user: "Laundry Staff", action: "Updated Delivery Status — Sneha Gupta", date: "18 Jun", time: "03:45 PM", device: "Android Phone", ip: "192.168.1.110" },
];
const mockRoles = [
  { id: 1, name: "Super Admin", users: 2, color: "#7C3AED", permissions: ["All Access", "System Settings", "Audit Logs", "Role Management"], description: "Full system access" },
  { id: 2, name: "Admin", users: 5, color: "#1D4ED8", permissions: ["Student Management", "Reports", "Analytics", "User Management"], description: "Hostel administration" },
  { id: 3, name: "Warden", users: 3, color: "#0891B2", permissions: ["Attendance", "Leave Approvals", "Complaints"], description: "Block supervision" },
  { id: 4, name: "Accountant", users: 2, color: "#059669", permissions: ["Fee Management", "Reports", "Fines", "Rewards"], description: "Financial management" },
  { id: 5, name: "Trustee", users: 4, color: "#D97706", permissions: ["View Analytics", "View Reports", "Strategic Overview"], description: "Read-only governance" },
  { id: 6, name: "Laundry Staff", users: 3, color: "#DB2777", permissions: ["Laundry Management", "Delivery Confirmation"], description: "Laundry operations" },
  { id: 7, name: "Parent", users: 248, color: "#65A30D", permissions: ["View Child Info", "View Attendance", "View Leave"], description: "Parent portal" },
];
const recentActivities = [
  { id: 1, action: "New student Rohan Mehta checked into Room C-201", time: "2 min ago", type: "info" },
  { id: 2, action: "Leave request approved for Priya Patel (3 days)", time: "15 min ago", type: "success" },
  { id: 3, action: "Fee overdue alert for 12 students — June installment", time: "1 hour ago", type: "warning" },
  { id: 4, action: "Room C-310 maintenance request raised", time: "2 hours ago", type: "info" },
  { id: 5, action: "Complaint resolved: Rahul Verma — Water Leak in C-310", time: "3 hours ago", type: "success" },
  { id: 6, action: "System backup completed — 2.3 GB archived", time: "6 hours ago", type: "success" },
];
const CHART_COLORS = ["#1D4ED8", "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

function formatCurrencyLabel(value: number) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(1)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(0)}L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

function normalizeStatus(value?: string | null) {
  return String(value ?? "").trim().toUpperCase();
}

type AttendanceChartPoint = { month: string; present: number; absent: number; target: number };
type FeeChartPoint = { month: string; collected: number; pending: number };
type ComplaintChartPoint = { month: string; new: number; resolved: number };
type LaundryChartPoint = { day: string; requests: number; completed: number };
type LeaveChartPoint = { month: string; approved: number; rejected: number; pending: number };
type OccupancyPoint = { name: string; value: number };

function buildAttendanceChartData(summary: { monthly?: { percentage?: number }; daily?: Array<{ date: string; present: number; absent: number; onLeave?: number }> } | undefined, fallbackPercentage: number): AttendanceChartPoint[] {
  const dailyPoints = summary?.daily ?? [];

  if (!dailyPoints.length) {
    return [{ month: "Today", present: fallbackPercentage, absent: Math.max(0, 100 - fallbackPercentage), target: fallbackPercentage }];
  }

  return dailyPoints.slice(-6).map((entry) => {
    const date = new Date(entry.date);
    return {
      month: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      present: Number(entry.present ?? 0),
      absent: Number(entry.absent ?? 0),
      target: fallbackPercentage,
    };
  });
}

function buildComplaintChartData(complaints: Array<{ createdAt?: string | null; resolvedAt?: string | null; status?: string | null }>): ComplaintChartPoint[] {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("en-US", { month: "short" }),
    };
  });

  return months.map((month) => {
    let newCount = 0;
    let resolvedCount = 0;

    complaints.forEach((complaint) => {
      const createdAt = complaint.createdAt ? new Date(complaint.createdAt) : null;
      const resolvedAt = complaint.resolvedAt ? new Date(complaint.resolvedAt) : null;
      const createdKey = createdAt ? `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}` : null;
      const resolvedKey = resolvedAt ? `${resolvedAt.getFullYear()}-${String(resolvedAt.getMonth() + 1).padStart(2, "0")}` : null;

      if (createdKey === month.key) newCount += 1;
      if (resolvedKey === month.key) resolvedCount += 1;
    });

    return { month: month.label, new: newCount, resolved: resolvedCount };
  });
}

function buildLaundryChartData(laundryRequests: Array<{ createdAt?: string | null; status?: string | null }>): LaundryChartPoint[] {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return {
      key: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString("en-US", { weekday: "short" }),
    };
  });

  return days.map((day) => {
    let requests = 0;
    let completed = 0;

    laundryRequests.forEach((request) => {
      const createdAt = request.createdAt ? new Date(request.createdAt) : null;
      const createdKey = createdAt ? createdAt.toISOString().slice(0, 10) : null;
      if (createdKey === day.key) {
        requests += 1;
        const status = normalizeStatus(request.status);
        if (status === "READY" || status === "DELIVERED") completed += 1;
      }
    });

    return { day: day.label, requests, completed };
  });
}

function buildLeaveChartData(leaveRequests: Array<{ createdAt?: string | null; status?: string | null }>): LeaveChartPoint[] {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("en-US", { month: "short" }),
    };
  });

  return months.map((month) => {
    let approved = 0;
    let rejected = 0;
    let pending = 0;

    leaveRequests.forEach((request) => {
      const createdAt = request.createdAt ? new Date(request.createdAt) : null;
      const createdKey = createdAt ? `${createdAt.getFullYear()}-${String(createdAt.getMonth() + 1).padStart(2, "0")}` : null;
      if (createdKey !== month.key) return;

      const status = normalizeStatus(request.status);
      if (status === "APPROVED") approved += 1;
      else if (status === "REJECTED") rejected += 1;
      else if (status === "PENDING") pending += 1;
    });

    return { month: month.label, approved, rejected, pending };
  });
}

function buildFeeChartData(feeRecords: Array<{ month?: number | null; year?: number | null; amount?: number | string; paidAmount?: number | string; status?: string | null }>): FeeChartPoint[] {
  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));
    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
      label: date.toLocaleDateString("en-US", { month: "short" }),
    };
  });

  return months.map((month) => {
    let collected = 0;
    let pending = 0;

    feeRecords.forEach((fee) => {
      const feeMonth = fee.month ?? new Date().getMonth() + 1;
      const feeYear = fee.year ?? new Date().getFullYear();
      const feeKey = `${feeYear}-${String(feeMonth).padStart(2, "0")}`;
      if (feeKey !== month.key) return;

      const amount = Number(fee.amount ?? 0);
      const paidAmount = Number(fee.paidAmount ?? 0);
      collected += paidAmount;
      pending += Math.max(0, amount - paidAmount);
    });

    return { month: month.label, collected, pending };
  });
}

function buildOccupancyChartData(occupancy: number): OccupancyPoint[] {
  return [
    { name: "Occupied", value: occupancy },
    { name: "Vacant", value: Math.max(0, 100 - occupancy) },
  ];
}

// ─── SHARED COMPONENTS ────────────────────────────────────────

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className={`w-12 h-6 rounded-full relative transition-all flex-shrink-0 ${value ? "bg-blue-600" : "bg-slate-300"}`}
    >
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all shadow-sm ${value ? "translate-x-6" : "translate-x-0.5"}`} />
    </button>
  );
}

function Badge({ status }: { status: string }) {
  const cfg: Record<string, { bg: string; text: string; label: string }> = {
    paid: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Paid" },
    partial: { bg: "bg-amber-100", text: "text-amber-700", label: "Partial" },
    unpaid: { bg: "bg-red-100", text: "text-red-700", label: "Unpaid" },
    pending: { bg: "bg-orange-100", text: "text-orange-700", label: "Pending" },
    processing: { bg: "bg-blue-100", text: "text-blue-700", label: "Processing" },
    ready: { bg: "bg-purple-100", text: "text-purple-700", label: "Ready" },
    delivered: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Delivered" },
    active: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Active" },
    inactive: { bg: "bg-slate-100", text: "text-slate-600", label: "Inactive" },
  };
  const c = cfg[status] ?? { bg: "bg-slate-100", text: "text-slate-600", label: status };
  return <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${c.bg} ${c.text}`}>{c.label}</span>;
}

function StatCard({ icon, label, value, sub, color = "blue", trend }: {
  icon: React.ReactNode; label: string; value: string | number; sub?: string;
  color?: string; trend?: { value: string; up: boolean };
}) {
  const cm: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600", green: "bg-emerald-50 text-emerald-600",
    orange: "bg-orange-50 text-orange-600", red: "bg-red-50 text-red-600",
    purple: "bg-purple-50 text-purple-600", cyan: "bg-cyan-50 text-cyan-600",
    pink: "bg-pink-50 text-pink-600", amber: "bg-amber-50 text-amber-600",
  };
  return (
    <div className="bg-white rounded-2xl p-3.5 shadow-sm border border-blue-50">
      <div className="flex items-start justify-between mb-2">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${cm[color] ?? cm.blue}`}>{icon}</div>
        {trend && (
          <div className={`flex items-center gap-0.5 text-xs font-bold ${trend.up ? "text-emerald-600" : "text-red-500"}`}>
            {trend.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
            {trend.value}
          </div>
        )}
      </div>
      <div className="text-xl font-extrabold text-slate-800 leading-tight">{value}</div>
      <div className="text-xs text-slate-500 mt-0.5">{label}</div>
      {sub && <div className="text-xs text-blue-600 font-semibold mt-1">{sub}</div>}
    </div>
  );
}

function SearchBar({ placeholder = "Search..." }: { placeholder?: string }) {
  const [v, setV] = useState("");
  return (
    <div className="flex items-center bg-white rounded-xl px-3 py-2.5 border border-blue-100 gap-2">
      <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
      <input value={v} onChange={e => setV(e.target.value)} placeholder={placeholder}
        className="flex-1 text-sm text-slate-700 outline-none placeholder-slate-400 bg-transparent" />
      {v && <button onClick={() => setV("")}><XCircle className="w-4 h-4 text-slate-400" /></button>}
    </div>
  );
}

function SectionTitle({ title, action }: { title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-2">
      <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">{title}</h3>
      {action}
    </div>
  );
}

function ActivityItem({ item }: { item: typeof recentActivities[0] }) {
  const tc: Record<string, string> = {
    info: "bg-blue-100 text-blue-600", success: "bg-emerald-100 text-emerald-600",
    warning: "bg-amber-100 text-amber-700", error: "bg-red-100 text-red-600",
  };
  const ic: Record<string, React.ReactNode> = {
    info: <Activity className="w-3 h-3" />, success: <CheckCircle className="w-3 h-3" />,
    warning: <AlertCircle className="w-3 h-3" />, error: <XCircle className="w-3 h-3" />,
  };
  return (
    <div className="flex items-start gap-2.5 py-2.5 border-b border-slate-50 last:border-0">
      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${tc[item.type]}`}>{ic[item.type]}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-700 leading-relaxed">{item.action}</p>
        <p className="text-xs text-slate-400 mt-0.5">{item.time}</p>
      </div>
    </div>
  );
}

function ScreenHeader({ title, subtitle, onBack, action }: {
  title: string; subtitle?: string; onBack?: () => void; action?: React.ReactNode;
}) {
  return (
    <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-4 py-4 flex items-center gap-3 flex-shrink-0">
      {onBack && (
        <button onClick={onBack} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <ArrowLeft className="w-4 h-4 text-white" />
        </button>
      )}
      <div className="flex-1 min-w-0">
        <h1 className="text-white font-extrabold text-base truncate">{title}</h1>
        {subtitle && <p className="text-blue-200 text-xs">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

function SubTabBar({ tabs, active, onChange }: { tabs: string[]; active: number; onChange: (i: number) => void }) {
  return (
    <div className="flex bg-slate-100 rounded-xl p-1 mx-4 my-3 flex-shrink-0">
      {tabs.map((tab, i) => (
        <button key={tab} onClick={() => onChange(i)}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${active === i ? "bg-white text-blue-700 shadow-sm" : "text-slate-500"}`}>
          {tab}
        </button>
      ))}
    </div>
  );
}

function ChartCard({ title, children, height = 170 }: { title: string; children: React.ReactNode; height?: number }) {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50 mb-3">
      <h3 className="text-sm font-bold text-slate-700 mb-3">{title}</h3>
      <div style={{ height }}>{children}</div>
    </div>
  );
}

function BottomNav({ tabs, active, onChange }: {
  tabs: Array<{ icon: React.ReactNode; label: string }>; active: number; onChange: (i: number) => void;
}) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 flex items-center z-30" style={{ paddingBottom: 8 }}>
      {tabs.map((tab, i) => (
        <button key={i} onClick={() => onChange(i)}
          className={`flex-1 flex flex-col items-center gap-0.5 pt-2 pb-1 transition-all ${active === i ? "text-blue-700" : "text-slate-400"}`}>
          <div className={`p-1.5 rounded-xl transition-all ${active === i ? "bg-blue-50" : ""}`}>{tab.icon}</div>
          <span className="text-xs font-bold">{tab.label}</span>
        </button>
      ))}
    </div>
  );
}

// ─── SUPER ADMIN ──────────────────────────────────────────────

function SuperAdminDashboard() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-20">
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-600 px-4 pt-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-300 text-xs font-semibold">Good Morning</p>
            <h1 className="text-white font-extrabold text-lg">Super Admin</h1>
          </div>
          <div className="flex gap-2">
            <button className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
              <Bell className="w-4 h-4 text-white" />
            </button>
            <button className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
              <Settings className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
        <div className="bg-white/10 rounded-2xl p-3 grid grid-cols-3 gap-2 text-center backdrop-blur-sm">
          {[["400", "Students"], ["85.5%", "Occupancy"], ["91%", "Attendance"]].map(([v, l]) => (
            <div key={l}>
              <div className="text-white font-extrabold text-xl">{v}</div>
              <div className="text-blue-200 text-xs">{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 -mt-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard icon={<Users className="w-4 h-4" />} label="Total Students" value="400" color="blue" trend={{ value: "+12", up: true }} />
          <StatCard icon={<Shield className="w-4 h-4" />} label="Wardens" value="8" color="purple" />
          <StatCard icon={<User className="w-4 h-4" />} label="Parents Registered" value="248" color="green" />
          <StatCard icon={<Award className="w-4 h-4" />} label="Trustees" value="4" color="orange" />
          <StatCard icon={<Truck className="w-4 h-4" />} label="Laundry Staff" value="6" color="cyan" />
          <StatCard icon={<DollarSign className="w-4 h-4" />} label="Fee Collected" value="₹44L" color="green" sub="This month" trend={{ value: "+8%", up: true }} />
        </div>

        <ChartCard title="Attendance Trend (%)">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={attendanceChartData}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} domain={[75, 100]} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", fontSize: 12 }} />
              <Area type="monotone" dataKey="present" stroke="#1D4ED8" fill="url(#ag)" strokeWidth={2.5} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fee Collection (₹ Thousands)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={feeChartData} barGap={4}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", boxShadow: "0 4px 24px rgba(0,0,0,0.1)", fontSize: 12 }} />
              <Bar dataKey="collected" fill="#1D4ED8" radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="pending" fill="#FCA5A5" radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50 mb-3">
          <SectionTitle title="System Health" />
          {[
            { label: "Database", status: "Healthy", icon: <Database className="w-4 h-4" />, ok: true },
            { label: "Network", status: "Connected", icon: <Wifi className="w-4 h-4" />, ok: true },
            { label: "Storage", status: "72% Used", icon: <HardDrive className="w-4 h-4" />, ok: false },
            { label: "Security", status: "Active", icon: <Lock className="w-4 h-4" />, ok: true },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${item.ok ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>{item.icon}</div>
                <span className="text-sm font-semibold text-slate-700">{item.label}</span>
              </div>
              <span className={`text-xs font-bold ${item.ok ? "text-emerald-600" : "text-amber-600"}`}>{item.status}</span>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50 mb-4">
          <SectionTitle title="Recent Activities" />
          {recentActivities.map(item => <ActivityItem key={item.id} item={item} />)}
        </div>
      </div>
    </div>
  );
}

function RoleManagementScreen() {
  const [selected, setSelected] = useState<typeof mockRoles[0] | null>(null);
  if (selected) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 pb-20 flex flex-col">
        <ScreenHeader title={selected.name} subtitle="Role Details" onBack={() => setSelected(null)} />
        <div className="px-4 py-4 space-y-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-extrabold" style={{ backgroundColor: selected.color }}>{selected.name[0]}</div>
              <div>
                <h2 className="font-extrabold text-slate-800">{selected.name}</h2>
                <p className="text-xs text-slate-500">{selected.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-extrabold text-blue-700">{selected.users}</div>
                <div className="text-xs text-blue-500">Assigned Users</div>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <div className="text-2xl font-extrabold text-emerald-600">{selected.permissions.length}</div>
                <div className="text-xs text-emerald-500">Permissions</div>
              </div>
            </div>
            <SectionTitle title="Permissions" />
            <div className="space-y-2">
              {selected.permissions.map(p => (
                <div key={p} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5">
                  <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  <span className="text-sm text-slate-700 font-medium">{p}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <button className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
              <Edit className="w-4 h-4" /> Edit Role
            </button>
            <button className="flex-1 bg-red-50 text-red-600 py-3 rounded-xl font-bold text-sm border border-red-100 flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-20 flex flex-col">
      <ScreenHeader title="Role Management" subtitle="Manage user roles & permissions"
        action={<button className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center"><Plus className="w-4 h-4 text-white" /></button>} />
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          {[["7", "Total Roles", "blue"], ["276", "Total Users", "green"], ["12", "Permissions", "purple"]].map(([v, l, c]) => (
            <div key={l} className={`bg-white rounded-2xl p-3 text-center shadow-sm border border-blue-50`}>
              <div className={`text-xl font-extrabold ${c === "blue" ? "text-blue-700" : c === "green" ? "text-emerald-600" : "text-purple-600"}`}>{v}</div>
              <div className="text-xs text-slate-500 mt-0.5">{l}</div>
            </div>
          ))}
        </div>
        <div className="mb-4"><SearchBar placeholder="Search roles..." /></div>
        <SectionTitle title="All Roles" />
        <div className="space-y-2">
          {mockRoles.map(role => (
            <button key={role.id} onClick={() => setSelected(role)}
              className="w-full bg-white rounded-2xl p-3.5 shadow-sm border border-blue-50 flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0" style={{ backgroundColor: role.color }}>{role.name[0]}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-800 text-sm">{role.name}</h3>
                  <span className="text-xs text-slate-400">{role.users} users</span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5 truncate">{role.description}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function SystemSettingsScreen() {
  const [tab, setTab] = useState(0);
  const [sms, setSms] = useState(true);
  const [notificationsList, setNotificationsList] = useState<Array<{ id: string; title: string; body: string; read: boolean; time: string; type: string }>>([]);
  const [email, setEmail] = useState(true);
  const [push, setPush] = useState(true);
  const [backup, setBackup] = useState(true);
  const [twofa, setTwofa] = useState(false);
  const [session, setSession] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const data = await getNotifications();
        setNotificationsList((data || []).map((item: NotificationItem) => ({
          id: item.id,
          title: item.title,
          body: item.body,
          read: Boolean(item.read ?? item.isRead ?? false),
          time: item.time || (item.createdAt ? new Date(item.createdAt).toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''),
          type: item.type || 'general',
        })));
      } catch {
        setNotificationsList([]);
      }
    };

    loadNotifications();
  }, []);

  const handleNotificationClick = async (notificationId: string) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotificationsList((prev) => prev.map((item) => item.id === notificationId ? { ...item, read: true } : item));
    } catch {
      // keep existing UI behavior if the request fails
    }
  };

  const unreadCount = notificationsList.filter((item) => !item.read).length;

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-20 flex flex-col">
      <ScreenHeader title="System Settings" subtitle="Configure platform settings" />
      <SubTabBar tabs={["SMS", "Notifications", "Security", "Backup"]} active={tab} onChange={setTab} />
      <div className="px-4 flex-1">
        {tab === 0 && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50">
              <h3 className="font-bold text-slate-700 text-sm mb-4">SMS Configuration</h3>
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-50">
                <div><p className="text-sm font-semibold text-slate-700">Enable SMS</p><p className="text-xs text-slate-400">Send SMS notifications to users</p></div>
                <Toggle value={sms} onChange={() => setSms(!sms)} />
              </div>
              {[["SMS Provider", "Twilio", "select"], ["API Key", "sk_live_••••••••••••", "password"], ["Sender ID", "HSTLPG", "text"], ["Daily Limit", "1000 messages", "text"]].map(([label, val, type]) => (
                <div key={label} className="mb-3">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</label>
                  <div className="mt-1 bg-slate-50 rounded-xl px-3 py-2.5 flex items-center justify-between">
                    <input type={type} defaultValue={val} className="flex-1 bg-transparent text-sm text-slate-700 outline-none" />
                    {type === "select" && <ChevronDown className="w-4 h-4 text-slate-400" />}
                  </div>
                </div>
              ))}
              <button className="w-full bg-blue-700 text-white py-3 rounded-xl font-bold text-sm mt-2">Send Test SMS</button>
            </div>
          </div>
        )}
        {tab === 1 && (
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-700 text-sm">Notification Settings</h3>
              {unreadCount > 0 && <span className="text-[11px] font-semibold text-orange-600">{unreadCount} unread</span>}
            </div>
            {notificationsList.length > 0 && (
              <div className="space-y-2">
                {notificationsList.map((item) => (
                  <div key={item.id} onClick={() => handleNotificationClick(item.id)} className={`rounded-xl border p-3 text-sm cursor-pointer ${item.read ? 'bg-slate-50 border-slate-100' : 'bg-orange-50 border-orange-200'}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-slate-700">{item.title}</p>
                        <p className="text-xs text-slate-500 mt-1">{item.body}</p>
                      </div>
                      {!item.read && <span className="h-2.5 w-2.5 rounded-full bg-orange-500 flex-shrink-0 mt-1" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-2">{item.time}</p>
                  </div>
                ))}
              </div>
            )}
            {[
              ["Email Notifications", "Receive email alerts", email, () => setEmail(!email)],
              ["Push Notifications", "Mobile push alerts", push, () => setPush(!push)],
              ["Fee Reminders", "Remind students of due fees", true, () => {}],
              ["Attendance Alerts", "Low attendance warnings", true, () => {}],
              ["Leave Updates", "Leave approval notifications", false, () => {}],
              ["Maintenance Alerts", "System maintenance notices", true, () => {}],
            ].map(([label, sub, val, fn]) => (
              <div key={label as string} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                <div><p className="text-sm font-semibold text-slate-700">{label as string}</p><p className="text-xs text-slate-400">{sub as string}</p></div>
                <Toggle value={val as boolean} onChange={fn as () => void} />
              </div>
            ))}
          </div>
        )}
        {tab === 2 && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50 space-y-3">
              <h3 className="font-bold text-slate-700 text-sm">Security Settings</h3>
              {[
                ["Two-Factor Auth", "Require 2FA for admin login", twofa, () => setTwofa(!twofa)],
                ["Session Timeout", "Auto logout after inactivity", session, () => setSession(!session)],
                ["IP Whitelist", "Restrict admin access by IP", false, () => {}],
                ["Login Alerts", "Email on new device login", true, () => {}],
              ].map(([l, s, v, f]) => (
                <div key={l as string} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
                  <div><p className="text-sm font-semibold text-slate-700">{l as string}</p><p className="text-xs text-slate-400">{s as string}</p></div>
                  <Toggle value={v as boolean} onChange={f as () => void} />
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50 space-y-3">
              <h3 className="font-bold text-slate-700 text-sm">Password Policy</h3>
              {[["Minimum Length", "8 characters"], ["Password Expiry", "90 days"], ["Failed Attempts", "5 attempts"], ["Lockout Duration", "30 minutes"]].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{l}</span>
                  <div className="bg-blue-50 rounded-lg px-3 py-1.5"><span className="text-sm text-blue-700 font-bold">{v}</span></div>
                </div>
              ))}
            </div>
          </div>
        )}
        {tab === 3 && (
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50 space-y-3">
              <h3 className="font-bold text-slate-700 text-sm">Backup Settings</h3>
              <div className="flex items-center justify-between pb-3 border-b border-slate-50">
                <div><p className="text-sm font-semibold text-slate-700">Auto Backup</p><p className="text-xs text-slate-400">Daily automatic backups</p></div>
                <Toggle value={backup} onChange={() => setBackup(!backup)} />
              </div>
              {[["Frequency", "Daily"], ["Backup Time", "02:00 AM"], ["Retention", "30 days"], ["Storage", "Cloud (AWS S3)"]].map(([l, v]) => (
                <div key={l} className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">{l}</span>
                  <div className="bg-slate-50 rounded-lg px-3 py-1.5 flex items-center gap-1">
                    <span className="text-sm text-blue-700 font-bold">{v}</span>
                    <ChevronDown className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50">
              <h3 className="font-bold text-slate-700 text-sm mb-3">Last Backup Status</h3>
              <div className="flex items-center gap-3 bg-emerald-50 rounded-xl p-3 mb-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div><p className="text-sm font-bold text-emerald-700">Backup Successful</p><p className="text-xs text-emerald-600">Today 02:00 AM · 2.3 GB</p></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <button className="bg-blue-700 text-white py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5">
                  <RefreshCw className="w-4 h-4" /> Backup Now
                </button>
                <button className="bg-slate-100 text-slate-700 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5">
                  <Download className="w-4 h-4" /> Restore
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function AuditLogsScreen() {
  const [filter, setFilter] = useState(0);
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-20 flex flex-col">
      <ScreenHeader title="Audit Logs" subtitle="System activity history" />
      <div className="px-4 pt-3">
        <SearchBar placeholder="Search logs by user or action..." />
        <div className="flex gap-2 mt-2 mb-3">
          {["All Time", "Today", "This Week"].map((f, i) => (
            <button key={f} onClick={() => setFilter(i)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${filter === i ? "bg-blue-700 text-white" : "bg-white text-slate-600 border border-blue-100"}`}>
              {f}
            </button>
          ))}
        </div>
        <div className="space-y-2 pb-4">
          {auditLogs.map(log => (
            <div key={log.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-blue-50">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-800 truncate">{log.user}</h3>
                    <span className="text-xs text-slate-400 flex-shrink-0">{log.time}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{log.action}</p>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <div className="flex items-center gap-1 text-xs text-slate-400"><Calendar className="w-3 h-3" />{log.date}</div>
                    <div className="flex items-center gap-1 text-xs text-slate-400"><MapPin className="w-3 h-3" />{log.ip}</div>
                    <div className="flex items-center gap-1 text-xs text-slate-400"><Hash className="w-3 h-3" />{log.device}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SuperAdminApp({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState(0);
  const tabs = [
    { icon: <Home className="w-4 h-4" />, label: "Dashboard" },
    { icon: <Shield className="w-4 h-4" />, label: "Roles" },
    { icon: <Settings className="w-4 h-4" />, label: "Settings" },
    { icon: <FileText className="w-4 h-4" />, label: "Audit" },
  ];
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {tab === 0 && <SuperAdminDashboard />}
      {tab === 1 && <RoleManagementScreen />}
      {tab === 2 && <SystemSettingsScreen />}
      {tab === 3 && <AuditLogsScreen />}
      <BottomNav tabs={tabs} active={tab} onChange={setTab} />
    </div>
  );
}

// ─── ADMIN ────────────────────────────────────────────────────

function AdminDashboard() {
  const [dashboardStats, setDashboardStats] = useState({
    students: 342,
    attendance: 91,
    occupancy: 85.5,
    openComplaints: 8,
    laundryPending: 24,
    feesCollected: 4400000,
    pendingFees: 600000,
    leavePending: 12,
    leaveApproved: 28,
    leaveRejected: 5,
  });
  const [attendanceChartPoints, setAttendanceChartPoints] = useState<AttendanceChartPoint[]>([
    { month: "Today", present: 91, absent: 9, target: 90 },
  ]);
  const [complaintChartPoints, setComplaintChartPoints] = useState<ComplaintChartPoint[]>([
    { month: "Today", new: 8, resolved: 7 },
  ]);
  const [laundryChartPoints, setLaundryChartPoints] = useState<LaundryChartPoint[]>([
    { day: "Today", requests: 24, completed: 18 },
  ]);
  const [leaveChartPoints, setLeaveChartPoints] = useState<LeaveChartPoint[]>([
    { month: "Today", approved: 28, rejected: 5, pending: 12 },
  ]);
  const [feeChartPoints, setFeeChartPoints] = useState<FeeChartPoint[]>([
    { month: "Today", collected: 4400000, pending: 600000 },
  ]);
  const [occupancyChartPoints, setOccupancyChartPoints] = useState<OccupancyPoint[]>([
    { name: "Occupied", value: 85.5 },
    { name: "Vacant", value: 14.5 },
  ]);

  // Refresh token to ensure charts update after CRUD operations without reloading.
  const [chartRefreshTick, setChartRefreshTick] = useState(0);

  const refreshCharts = () => {
    setChartRefreshTick((t) => t + 1);
  };


  useEffect(() => {
    let isMounted = true;

    const loadDashboardStats = async () => {
      try {
        const [pendingFees, attendanceSummary, complaints, laundryRequests, leaveRequests] = await Promise.all([
          getPendingFees(),
          apiGet<{ monthly?: { percentage?: number; total?: number }; overallPercentage?: number }>("v1/attendance/summary?month=6&year=2025"),
          apiGet<Array<{ status?: string | null; createdAt?: string | null; resolvedAt?: string | null }>>("v1/complaints"),
          apiGet<Array<{ status?: string | null; createdAt?: string | null }>>("v1/laundry"),
          apiGet<Array<{ status?: string | null; createdAt?: string | null }>>("v1/leave/warden"),
        ]);

        if (!isMounted) return;

        const totalCollected = pendingFees.reduce((sum, fee) => sum + Number(fee.paidAmount ?? 0), 0);
        const totalPending = pendingFees.reduce((sum, fee) => sum + Math.max(0, Number(fee.amount ?? 0) - Number(fee.paidAmount ?? 0)), 0);
        const attendancePercentage = attendanceSummary?.monthly?.percentage ?? attendanceSummary?.overallPercentage ?? 91;
        const studentCount = attendanceSummary?.monthly?.total ?? 342;
        const occupancy = Math.min(100, Math.max(70, Math.round((studentCount / 400) * 100)));

        const openComplaints = complaints.filter((complaint) => normalizeStatus(complaint.status) === "OPEN").length;
        const laundryPending = laundryRequests.filter((request) => {
          const status = normalizeStatus(request.status);
          return status !== "DELIVERED" && status !== "READY";
        }).length;

        const leavePending = leaveRequests.filter((request) => normalizeStatus(request.status) === "PENDING").length;
        const leaveApproved = leaveRequests.filter((request) => normalizeStatus(request.status) === "APPROVED").length;
        const leaveRejected = leaveRequests.filter((request) => normalizeStatus(request.status) === "REJECTED").length;

        setDashboardStats({
          students: studentCount,
          attendance: attendancePercentage,
          occupancy,
          openComplaints,
          laundryPending,
          feesCollected: totalCollected,
          pendingFees: totalPending,
          leavePending,
          leaveApproved,
          leaveRejected,
        });
        setAttendanceChartPoints(buildAttendanceChartData(attendanceSummary, attendancePercentage));
        setComplaintChartPoints(buildComplaintChartData(complaints));
        setLaundryChartPoints(buildLaundryChartData(laundryRequests));
        setLeaveChartPoints(buildLeaveChartData(leaveRequests));
        setFeeChartPoints(buildFeeChartData(pendingFees));
        setOccupancyChartPoints(buildOccupancyChartData(occupancy));
      } catch {
        if (isMounted) {
          setDashboardStats((current) => current);
        }
      }
    };

    void loadDashboardStats();
    return () => {
      isMounted = false;
    };
  }, [chartRefreshTick]);

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-20">
      <div className="bg-gradient-to-br from-blue-800 to-blue-600 px-4 pt-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-300 text-xs font-semibold">Friday, 20 June 2025</p>
            <h1 className="text-white font-extrabold text-lg">Admin Dashboard</h1>
          </div>
          <button className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center relative">
            <Bell className="w-4 h-4 text-white" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-400 rounded-full" />
          </button>
        </div>
        <div className="bg-white/10 rounded-2xl p-3 grid grid-cols-4 gap-2 text-center">
          {[[dashboardStats.students, "Students"], [`${dashboardStats.attendance}%`, "Attend."], [`${dashboardStats.occupancy}%`, "Occupancy"], [dashboardStats.openComplaints, "Open"]].map(([v, l]) => (
            <div key={l}>
              <div className="text-white font-extrabold text-base">{v}</div>
              <div className="text-blue-200 text-xs">{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-4 -mt-4 pb-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard icon={<Users className="w-4 h-4" />} label="Total Students" value={dashboardStats.students} color="blue" trend={{ value: "+5", up: true }} />
          <StatCard icon={<Activity className="w-4 h-4" />} label="Attendance Today" value={`${dashboardStats.attendance}%`} color="green" />
          <StatCard icon={<Layers className="w-4 h-4" />} label="Room Occupancy" value={`${dashboardStats.occupancy}%`} color="purple" sub={`${dashboardStats.students}/400 rooms`} />
          <StatCard icon={<MessageSquare className="w-4 h-4" />} label="Open Complaints" value={dashboardStats.openComplaints} color="red" />
          <StatCard icon={<Package className="w-4 h-4" />} label="Laundry Pending" value={dashboardStats.laundryPending} color="orange" />
          <StatCard icon={<DollarSign className="w-4 h-4" />} label="Fees Collected" value={formatCurrencyLabel(dashboardStats.feesCollected)} color="green" sub="Live data" trend={{ value: "+8%", up: true }} />
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50 mb-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-700">Leave Requests</h3>
            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-0.5 rounded-full">{dashboardStats.leavePending} Pending</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[[dashboardStats.leavePending, "Pending", "amber"], [dashboardStats.leaveApproved, "Approved", "emerald"], [dashboardStats.leaveRejected, "Rejected", "red"]].map(([v, l, c]) => (
              <div key={l} className={`rounded-xl p-2 text-center ${c === "amber" ? "bg-amber-50" : c === "emerald" ? "bg-emerald-50" : "bg-red-50"}`}>
                <div className={`text-lg font-extrabold ${c === "amber" ? "text-amber-600" : c === "emerald" ? "text-emerald-600" : "text-red-600"}`}>{v}</div>
                <div className="text-xs text-slate-500">{l}</div>
              </div>
            ))}
          </div>
        </div>

        <ChartCard title="Attendance Trend">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={attendanceChartPoints}>
              <defs>
                <linearGradient id="ag2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} domain={[75, 100]} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
              <Area type="monotone" dataKey="present" stroke="#1D4ED8" fill="url(#ag2)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Complaints Overview">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={complaintChartPoints}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
              <Bar dataKey="new" fill="#EF4444" radius={[4, 4, 0, 0]} maxBarSize={16} />
              <Bar dataKey="resolved" fill="#10B981" radius={[4, 4, 0, 0]} maxBarSize={16} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50 mb-4">
          <SectionTitle title="Recent Activities" />
          {recentActivities.slice(0, 4).map(item => <ActivityItem key={item.id} item={item} />)}
        </div>
      </div>
    </div>
  );
}

function UserManagementScreen() {
  const [tab, setTab] = useState(0);
  const lists = [
    { label: "Students", data: mockStudents.map(s => ({ name: s.name, sub: `${s.room} · ${s.course}`, status: s.status, avatar: s.name[0] })) },
    { label: "Parents", data: mockParents.map(p => ({ name: p.name, sub: `Parent of ${p.child}`, status: p.status, avatar: p.name[0] })) },
    { label: "Wardens", data: mockWardens.map(w => ({ name: w.name, sub: `Block ${w.block} · ${w.shift}`, status: w.status, avatar: w.name[0] })) },
    { label: "Trustees", data: mockTrustees.map(t => ({ name: t.name, sub: t.role, status: t.status, avatar: t.name[0] })) },
    { label: "Laundry", data: mockLaundryStaff.map(l => ({ name: l.name, sub: `${l.shift} Shift · ${l.processed} processed`, status: l.status, avatar: l.name[0] })) },
  ];
  const current = lists[tab];
  const avatarColors = ["bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-orange-500", "bg-pink-500", "bg-cyan-500"];
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 pb-20">
      <ScreenHeader title="User Management" subtitle={`${lists[tab].data.length} ${lists[tab].label}`}
        action={<button className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center"><Plus className="w-4 h-4 text-white" /></button>} />
      <div className="flex gap-1 px-4 py-3 overflow-x-auto flex-shrink-0">
        {lists.map((l, i) => (
          <button key={l.label} onClick={() => setTab(i)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex-shrink-0 ${tab === i ? "bg-blue-700 text-white" : "bg-white text-slate-600 border border-blue-100"}`}>
            {l.label}
          </button>
        ))}
      </div>
      <div className="px-4 mb-3 flex gap-2 flex-shrink-0">
        <div className="flex-1"><SearchBar placeholder={`Search ${current.label.toLowerCase()}...`} /></div>
        <button className="w-10 h-10 bg-white rounded-xl border border-blue-100 flex items-center justify-center flex-shrink-0">
          <Filter className="w-4 h-4 text-slate-500" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-2">
          {current.data.map((item, i) => (
            <div key={i} className="bg-white rounded-2xl p-3.5 shadow-sm border border-blue-50 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-extrabold text-sm flex-shrink-0 ${avatarColors[i % avatarColors.length]}`}>
                {item.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-sm truncate">{item.name}</h3>
                <p className="text-xs text-slate-500 truncate">{item.sub}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Badge status={item.status} />
                <button className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminAnalyticsScreen() {
  const [tab, setTab] = useState(0);

  // Chart datasets backed by live API data.
  const [attendanceChartPointsLocal, setAttendanceChartPointsLocal] = useState<AttendanceChartPoint[]>(attendanceChartData as any);
  const [leaveChartPointsLocal, setLeaveChartPointsLocal] = useState<LeaveChartPoint[]>(leaveChartData as any);
  const [occupancyChartPointsLocal, setOccupancyChartPointsLocal] = useState<OccupancyPoint[]>(occupancyPie as any);
  const [complaintChartPointsLocal, setComplaintChartPointsLocal] = useState<ComplaintChartPoint[]>(complaintData as any);
  const [laundryChartPointsLocal, setLaundryChartPointsLocal] = useState<LaundryChartPoint[]>(laundryChartData as any);
  const [feeChartPointsLocal, setFeeChartPointsLocal] = useState<FeeChartPoint[]>(feeChartData as any);

  useEffect(() => {
    let isMounted = true;
    const loadAnalytics = async () => {
      try {
        const [pendingFees, attendanceSummary, complaints, laundryRequests, leaveRequests] = await Promise.all([
          getPendingFees(),
          apiGet<{ monthly?: { percentage?: number; total?: number }; overallPercentage?: number; daily?: Array<{ date: string; present: number; absent: number }> }>("v1/attendance/summary?month=6&year=2025"),
          apiGet<Array<{ status?: string | null; createdAt?: string | null; resolvedAt?: string | null }>>("v1/complaints"),
          apiGet<Array<{ status?: string | null; createdAt?: string | null }>>("v1/laundry"),
          apiGet<Array<{ status?: string | null; createdAt?: string | null }>>("v1/leave/warden"),
        ]);

        if (!isMounted) return;

        const attendancePercentage = attendanceSummary?.monthly?.percentage ?? attendanceSummary?.overallPercentage ?? 91;
        const studentCount = attendanceSummary?.monthly?.total ?? 342;
        const occupancy = Math.min(100, Math.max(70, Math.round((studentCount / 400) * 100)));

        setAttendanceChartPointsLocal(buildAttendanceChartData(attendanceSummary as any, attendancePercentage));
        setComplaintChartPointsLocal(buildComplaintChartData(complaints));
        setLaundryChartPointsLocal(buildLaundryChartData(laundryRequests));
        setLeaveChartPointsLocal(buildLeaveChartData(leaveRequests));
        setFeeChartPointsLocal(buildFeeChartData(pendingFees as any));
        setOccupancyChartPointsLocal(buildOccupancyChartData(occupancy));
      } catch {
        // keep existing datasets
      }
    };

    void loadAnalytics();
    return () => {
      isMounted = false;
    };
  }, []);

  const charts = [
    {
      title: "Attendance Trends", chart: (
        <AreaChart data={attendanceChartPointsLocal}>
          <defs><linearGradient id="ag3" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.2} /><stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} /></linearGradient></defs>
          <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
          <Area type="monotone" dataKey="present" stroke="#1D4ED8" fill="url(#ag3)" strokeWidth={2.5} dot={false} />
        </AreaChart>
      )
    },
    {
      title: "Leave Trends", chart: (
        <BarChart data={leaveChartPointsLocal as any}>
          <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
          <Bar dataKey="approved" fill="#10B981" radius={[3, 3, 0, 0]} maxBarSize={12} />
          <Bar dataKey="rejected" fill="#EF4444" radius={[3, 3, 0, 0]} maxBarSize={12} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
        </BarChart>
      )
    },
    {
      title: "Occupancy Trends", chart: (
        <PieChart>
          <Pie data={occupancyChartPointsLocal as any} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={10}>
            {(occupancyChartPointsLocal as any[]).map((_, index) => <Cell key={index} fill={CHART_COLORS[index]} />)}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
        </PieChart>
      )
    },
    {
      title: "Complaint Trends", chart: (
        <BarChart data={complaintChartPointsLocal as any}>
          <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
          <Bar dataKey="new" fill="#EF4444" radius={[3, 3, 0, 0]} maxBarSize={14} />
          <Bar dataKey="resolved" fill="#10B981" radius={[3, 3, 0, 0]} maxBarSize={14} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
        </BarChart>
      )
    },
    {
      title: "Laundry Trends", chart: (
        <BarChart data={laundryChartPointsLocal as any}>
          <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
          <Bar dataKey="requests" fill="#8B5CF6" radius={[3, 3, 0, 0]} maxBarSize={16} />
          <Bar dataKey="completed" fill="#A78BFA" radius={[3, 3, 0, 0]} maxBarSize={16} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
        </BarChart>
      )
    },
    {
      title: "Fee Collection Trends", chart: (
        <BarChart data={feeChartPointsLocal as any}>
          <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
          <Bar dataKey="collected" fill="#1D4ED8" radius={[4, 4, 0, 0]} maxBarSize={18} />
          <Bar dataKey="pending" fill="#FCA5A5" radius={[4, 4, 0, 0]} maxBarSize={18} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
        </BarChart>
      )
    },
  ];

  const tabs = ["Attend.", "Leave", "Occupancy", "Complain.", "Laundry", "Fees"];
  const current = charts[tab];

  const kpis = [
    [["91%", "Avg Attendance"], ["8.5%", "Absent Rate"]],
    [["28", "Approved"], ["5", "Rejected"]],
    [["85.5%", "Occupied"], ["58", "Vacant"]],
    [["8", "Open"], ["7", "Resolved"]],
    [["24", "Pending"], ["45", "Delivered"]],
    [["₹44L", "Collected"], ["₹6L", "Pending"]],
  ];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 pb-20">
      <ScreenHeader title="Analytics" subtitle="Data insights & trends" />
      <div className="flex gap-1 px-4 py-3 overflow-x-auto flex-shrink-0">
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setTab(i)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${tab === i ? "bg-blue-700 text-white" : "bg-white text-slate-600 border border-blue-100"}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="grid grid-cols-2 gap-3 mb-3">
          {kpis[tab].map(([v, l]) => (
            <div key={l} className="bg-white rounded-2xl p-3.5 shadow-sm border border-blue-50 text-center">
              <div className="text-2xl font-extrabold text-blue-700">{v}</div>
              <div className="text-xs text-slate-500 mt-0.5">{l}</div>
            </div>
          ))}
        </div>
        <ChartCard title={current.title} height={200}>
          <ResponsiveContainer width="100%" height="100%">{current.chart}</ResponsiveContainer>
        </ChartCard>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50">
          <SectionTitle title="Insights" />
          <div className="space-y-2">
            {[
              "Attendance peaked in June at 94% — highest this academic year",
              "Fee collection improved by 8% compared to last month",
              "Complaint resolution rate is 87.5% — above target",
            ].map((insight, i) => (
              <div key={i} className="flex items-start gap-2 bg-blue-50 rounded-xl p-3">
                <TrendingUp className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 font-medium leading-relaxed">{insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function AdminReportsScreen() {
  const reports = [
    { title: "Attendance Report", desc: "Daily & monthly attendance summary", icon: <Activity className="w-4 h-4" />, color: "blue", date: "Jun 2025" },
    { title: "Leave Report", desc: "Leave requests and approvals", icon: <Calendar className="w-4 h-4" />, color: "purple", date: "Jun 2025" },
    { title: "Laundry Report", desc: "Laundry requests and deliveries", icon: <Package className="w-4 h-4" />, color: "pink", date: "Jun 2025" },
    { title: "Complaint Report", desc: "Complaints raised and resolved", icon: <MessageSquare className="w-4 h-4" />, color: "orange", date: "Jun 2025" },
    { title: "Fee Report", desc: "Fee collection and pending summary", icon: <DollarSign className="w-4 h-4" />, color: "green", date: "Jun 2025" },
    { title: "Occupancy Report", desc: "Room occupancy and vacancy stats", icon: <Layers className="w-4 h-4" />, color: "cyan", date: "Jun 2025" },
  ];
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600", purple: "bg-purple-50 text-purple-600",
    pink: "bg-pink-50 text-pink-600", orange: "bg-orange-50 text-orange-600",
    green: "bg-emerald-50 text-emerald-600", cyan: "bg-cyan-50 text-cyan-600",
  };
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-20">
      <ScreenHeader title="Reports" subtitle="Download & export hostel reports" />
      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50 mb-4">
          <h3 className="text-sm font-bold text-slate-700 mb-3">Quick Export</h3>
          <div className="grid grid-cols-3 gap-2">
            {["PDF", "Excel", "CSV"].map(fmt => (
              <button key={fmt} className="bg-blue-50 text-blue-700 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                <Download className="w-3.5 h-3.5" /> {fmt}
              </button>
            ))}
          </div>
        </div>
        <SectionTitle title="Available Reports" />
        <div className="space-y-2">
          {reports.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl p-3.5 shadow-sm border border-blue-50">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${colorMap[r.color]}`}>{r.icon}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm">{r.title}</h3>
                  <p className="text-xs text-slate-500">{r.desc}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{r.date}</p>
                </div>
                <button className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Download className="w-3.5 h-3.5 text-blue-600" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AdminApp({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState(0);
  const tabs = [
    { icon: <Home className="w-4 h-4" />, label: "Dashboard" },
    { icon: <Users className="w-4 h-4" />, label: "Users" },
    { icon: <BarChart2 className="w-4 h-4" />, label: "Analytics" },
    { icon: <FileText className="w-4 h-4" />, label: "Reports" },
  ];
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {tab === 0 && <AdminDashboard />}
      {tab === 1 && <UserManagementScreen />}
      {tab === 2 && <AdminAnalyticsScreen />}
      {tab === 3 && <AdminReportsScreen />}
      <BottomNav tabs={tabs} active={tab} onChange={setTab} />
    </div>
  );
}

// ─── TRUSTEE ──────────────────────────────────────────────────

function TrusteeDashboard() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-20">
      <div className="bg-gradient-to-br from-amber-700 to-amber-500 px-4 pt-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-amber-200 text-xs font-semibold">June 2025 Overview</p>
            <h1 className="text-white font-extrabold text-lg">Trustee Portal</h1>
          </div>
          <div className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
            <Bell className="w-4 h-4 text-white" />
          </div>
        </div>
        <div className="bg-white/15 rounded-2xl p-3 grid grid-cols-3 gap-2 text-center">
          {[["₹44L", "Revenue"], ["342", "Students"], ["85%", "Occupancy"]].map(([v, l]) => (
            <div key={l}><div className="text-white font-extrabold text-lg">{v}</div><div className="text-amber-200 text-xs">{l}</div></div>
          ))}
        </div>
      </div>
      <div className="px-4 -mt-4 pb-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard icon={<Users className="w-4 h-4" />} label="Total Students" value="342" color="blue" trend={{ value: "+12%", up: true }} />
          <StatCard icon={<Activity className="w-4 h-4" />} label="Avg Attendance" value="91%" color="green" />
          <StatCard icon={<DollarSign className="w-4 h-4" />} label="Fees Collected" value="₹44L" color="green" sub="June 2025" />
          <StatCard icon={<Calendar className="w-4 h-4" />} label="Leave Requests" value="45" color="purple" sub="This month" />
          <StatCard icon={<MessageSquare className="w-4 h-4" />} label="Complaints" value="15" color="red" sub="Jun total" />
          <StatCard icon={<Layers className="w-4 h-4" />} label="Room Occupancy" value="85.5%" color="cyan" />
        </div>

        <ChartCard title="Monthly Revenue vs Expenses (₹L)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthlyRevenue}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
              <Bar dataKey="revenue" fill="#1D4ED8" radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="expenses" fill="#FCA5A5" radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50 mb-3">
          <SectionTitle title="Key Events" />
          {[
            { title: "Annual Day Celebration", date: "28 Jun 2025", type: "event" },
            { title: "Board Meeting — Q2 Review", date: "25 Jun 2025", type: "meeting" },
            { title: "Hostel Fee Collection Deadline", date: "30 Jun 2025", type: "deadline" },
            { title: "Inspection by Education Board", date: "15 Jul 2025", type: "inspection" },
          ].map((ev, i) => (
            <div key={i} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
              <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-700">{ev.title}</p>
                <p className="text-xs text-slate-400">{ev.date}</p>
              </div>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${ev.type === "event" ? "bg-blue-100 text-blue-700" : ev.type === "meeting" ? "bg-purple-100 text-purple-700" : ev.type === "deadline" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                {ev.type}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StrategicAnalyticsScreen() {
  const [tab, setTab] = useState(0);
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 pb-20">
      <ScreenHeader title="Strategic Analytics" subtitle="Yearly & monthly comparisons" />
      <SubTabBar tabs={["Yearly", "Monthly", "Comparison"]} active={tab} onChange={setTab} />
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {tab === 0 && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[["390", "2024 Students", "blue"], ["₹61L", "2024 Revenue", "green"], ["89%", "2024 Attendance", "purple"], ["+12%", "YoY Growth", "amber"]].map(([v, l, c]) => (
                <div key={l} className="bg-white rounded-2xl p-3.5 shadow-sm border border-blue-50 text-center">
                  <div className={`text-xl font-extrabold ${c === "blue" ? "text-blue-700" : c === "green" ? "text-emerald-600" : c === "purple" ? "text-purple-600" : "text-amber-600"}`}>{v}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{l}</div>
                </div>
              ))}
            </div>
            <ChartCard title="Student Enrollment by Year" height={190}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData}>
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
                  <Bar dataKey="students" fill="#1D4ED8" radius={[6, 6, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Annual Revenue (₹ Lakhs)" height={190}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={yearlyData}>
                  <defs>
                    <linearGradient id="yg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="year" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#10B981" fill="url(#yg)" strokeWidth={2.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        )}
        {tab === 1 && (
          <>
            <ChartCard title="Monthly Revenue (₹L)" height={200}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyRevenue}>
                  <defs>
                    <linearGradient id="mr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#1D4ED8" fill="url(#mr)" strokeWidth={2} dot={false} />
                  <Area type="monotone" dataKey="expenses" stroke="#EF4444" fill="none" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <ChartCard title="Monthly Attendance (%)" height={200}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceChartData}>
                  <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} domain={[75, 100]} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
                  <Line type="monotone" dataKey="present" stroke="#1D4ED8" strokeWidth={2.5} dot={{ r: 3, fill: "#1D4ED8" }} />
                  <Line type="monotone" dataKey="target" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 2" dot={false} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                </LineChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        )}
        {tab === 2 && (
          <>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50 mb-3">
              <h3 className="text-sm font-bold text-slate-700 mb-3">Year-over-Year Comparison</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-slate-400 font-bold">
                      <td className="py-2">Metric</td>
                      <td className="py-2 text-right">2023</td>
                      <td className="py-2 text-right">2024</td>
                      <td className="py-2 text-right">Change</td>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ["Students", "342", "390", "+14%", true],
                      ["Revenue", "₹58L", "₹61L", "+5%", true],
                      ["Attendance", "91%", "89%", "-2%", false],
                      ["Complaints", "58", "42", "-28%", true],
                      ["Fee Defaults", "32", "25", "-22%", true],
                    ].map(([m, v1, v2, chg, up]) => (
                      <tr key={m as string} className="border-t border-slate-50">
                        <td className="py-2.5 font-semibold text-slate-700">{m as string}</td>
                        <td className="py-2.5 text-right text-slate-500">{v1 as string}</td>
                        <td className="py-2.5 text-right font-bold text-slate-800">{v2 as string}</td>
                        <td className={`py-2.5 text-right font-bold ${up ? "text-emerald-600" : "text-red-500"}`}>{chg as string}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function TrusteeReportsScreen() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-20">
      <ScreenHeader title="Reports" subtitle="Strategic summary reports (read-only)" />
      <div className="px-4 py-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-start gap-2 mb-4">
          <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700 font-medium">These are read-only reports. Contact Admin for edits.</p>
        </div>
        {[
          { title: "Quarterly Summary Report", period: "Q2 2025 (Apr – Jun)", size: "3.2 MB", type: "PDF" },
          { title: "Annual Revenue Report", period: "FY 2024–25", size: "1.8 MB", type: "Excel" },
          { title: "Student Enrollment Report", period: "Academic Year 2024", size: "0.9 MB", type: "PDF" },
          { title: "Infrastructure Utilization", period: "Jun 2025", size: "2.1 MB", type: "PDF" },
          { title: "Compliance & Audit Summary", period: "FY 2024–25", size: "4.5 MB", type: "PDF" },
        ].map((r, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50 mb-2">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-800 text-sm">{r.title}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{r.period}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-lg">{r.type}</span>
                  <span className="text-xs text-slate-400">{r.size}</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                </button>
                <button className="w-8 h-8 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Download className="w-3.5 h-3.5 text-emerald-600" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function TrusteeApp({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState(0);
  const tabs = [
    { icon: <Home className="w-4 h-4" />, label: "Dashboard" },
    { icon: <BarChart2 className="w-4 h-4" />, label: "Analytics" },
    { icon: <FileText className="w-4 h-4" />, label: "Reports" },
  ];
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {tab === 0 && <TrusteeDashboard />}
      {tab === 1 && <StrategicAnalyticsScreen />}
      {tab === 2 && <TrusteeReportsScreen />}
      <BottomNav tabs={tabs} active={tab} onChange={setTab} />
    </div>
  );
}

// ─── ACCOUNTANT ───────────────────────────────────────────────

function AccountantDashboard() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-20">
      <div className="bg-gradient-to-br from-emerald-800 to-emerald-600 px-4 pt-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-emerald-200 text-xs font-semibold">June 2025</p>
            <h1 className="text-white font-extrabold text-lg">Accounts Dashboard</h1>
          </div>
          <button className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
            <Bell className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="bg-white/15 rounded-2xl p-3 grid grid-cols-3 gap-2 text-center">
          {[["₹2.7Cr", "Total Fees"], ["₹44L", "Collected"], ["₹6L", "Pending"]].map(([v, l]) => (
            <div key={l}><div className="text-white font-extrabold text-base">{v}</div><div className="text-emerald-200 text-xs">{l}</div></div>
          ))}
        </div>
      </div>
      <div className="px-4 -mt-4 pb-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard icon={<DollarSign className="w-4 h-4" />} label="Total Fee Due" value="₹2.7Cr" color="blue" />
          <StatCard icon={<CheckCircle className="w-4 h-4" />} label="Collected This Month" value="₹44L" color="green" trend={{ value: "+8%", up: true }} />
          <StatCard icon={<AlertCircle className="w-4 h-4" />} label="Pending Fees" value="₹6L" color="red" sub="12 students" />
          <StatCard icon={<TrendingUp className="w-4 h-4" />} label="Monthly Revenue" value="₹44L" color="emerald" />
          <StatCard icon={<XCircle className="w-4 h-4" />} label="Total Fines" value="₹3,000" color="orange" sub="4 pending" />
          <StatCard icon={<Award className="w-4 h-4" />} label="Rewards Issued" value="₹3,500" color="purple" sub="3 students" />
        </div>

        <ChartCard title="Fee Collection (₹ Thousands)">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={feeChartData}>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
              <Bar dataKey="collected" fill="#059669" radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Bar dataKey="pending" fill="#FCA5A5" radius={[4, 4, 0, 0]} maxBarSize={18} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Fee Status Distribution" height={160}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={[{ name: "Paid", value: 285 }, { name: "Partial", value: 42 }, { name: "Unpaid", value: 15 }]}
                cx="50%" cy="50%" outerRadius={65} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false} fontSize={9}>
                {["#059669", "#F59E0B", "#EF4444"].map((c, i) => <Cell key={i} fill={c} />)}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function FeeStructureScreen() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-20">
      <ScreenHeader title="Fee Structure" subtitle="Manage fee categories" />
      <div className="px-4 py-4 space-y-3">
        {[
          { title: "Hostel Fee", fields: [["Annual Fee", "₹30,000"], ["Mess Charges (Monthly)", "₹3,500"], ["Electricity (Monthly)", "₹500"]] },
          { title: "Security Deposit", fields: [["Refundable Deposit", "₹5,000"], ["Key Deposit", "₹500"]] },
          { title: "Additional Charges", fields: [["Laundry (Monthly)", "₹400"], ["Internet (Monthly)", "₹300"], ["Gym (Optional)", "₹600"]] },
        ].map(section => (
          <div key={section.title} className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50">
            <h3 className="font-bold text-slate-700 text-sm mb-3">{section.title}</h3>
            <div className="space-y-3">
              {section.fields.map(([label, value]) => (
                <div key={label}>
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">{label}</label>
                  <div className="mt-1 bg-slate-50 rounded-xl px-3 py-2.5 flex items-center justify-between">
                    <input type="text" defaultValue={value} className="flex-1 bg-transparent text-sm font-semibold text-slate-700 outline-none" />
                    <Edit className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        <button className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4" /> Save Fee Structure
        </button>
      </div>
    </div>
  );
}

function StudentFeeLedgerScreen() {
  const [students, setStudents] = useState<FeeRecord[]>([]);
  const [selected, setSelected] = useState<FeeRecord | null>(null);
  const [filter, setFilter] = useState<"All" | "Paid" | "Partial" | "Unpaid">("All");
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const getStatus = (record: FeeRecord) => {
    const total = Number(record.amount ?? 0);
    const paid = Number(record.paidAmount ?? 0);
    if (total > 0 && paid >= total) return "paid";
    if (total > 0 && paid > 0) return "partial";
    return "unpaid";
  };

  const loadStudents = async () => {
    setLoading(true);
    try {
      const data = await getPendingFees();
      setStudents(Array.isArray(data) ? data : []);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadStudents();
  }, []);

  const filteredStudents = students.filter((record) => {
    const status = getStatus(record);
    if (filter === "Paid") return status === "paid";
    if (filter === "Partial") return status === "partial";
    if (filter === "Unpaid") return status === "unpaid";
    return true;
  });

  const totalStudents = students.length;
  const paidStudents = students.filter((record) => getStatus(record) === "paid").length;
  const unpaidStudents = students.filter((record) => getStatus(record) !== "paid").length;
  const dueAmount = students.reduce((sum, record) => sum + Math.max(Number(record.amount ?? 0) - Number(record.paidAmount ?? 0), 0), 0);

  const handleMarkPaymentReceived = async (record: FeeRecord) => {
    const remaining = Math.max(Number(record.amount ?? 0) - Number(record.paidAmount ?? 0), 0);
    if (!record.id || remaining <= 0) return;

    setProcessingId(record.id);
    try {
      await payFee({
        feeRecordId: record.id,
        amount: remaining,
        method: "CASH",
        receiptNumber: `ADMIN-${Date.now()}`,
        transactionId: `ADMIN-${Date.now()}`,
        notes: "Marked payment received by admin",
      });

      await loadStudents();

      // Refresh charts after successful CRUD without reloading the page.
      // (No cross-screen state; charts will refresh when their own data loads.)

      const refreshed = students.find((item) => item.id === record.id);
      setSelected(refreshed ?? null);
    } finally {
      setProcessingId(null);
    }
  };

  if (selected) {
    const total = Number(selected.amount ?? 0);
    const paid = Number(selected.paidAmount ?? 0);
    const pending = Math.max(total - paid, 0);
    const studentName = selected.student
      ? [selected.student.firstName, selected.student.lastName].filter(Boolean).join(" ")
      : "Student";
    const studentMeta = selected.student?.enrollmentNumber || selected.description || "Fee record";

    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 pb-20 flex flex-col">
        <ScreenHeader title={studentName} subtitle={studentMeta} onBack={() => setSelected(null)} />
        <div className="px-4 py-4 space-y-3">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-blue-50 rounded-xl p-3 text-center"><div className="text-base font-extrabold text-blue-700">₹{total.toLocaleString("en-IN")}</div><div className="text-xs text-blue-500">Total Fee</div></div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center"><div className="text-base font-extrabold text-emerald-600">₹{paid.toLocaleString("en-IN")}</div><div className="text-xs text-emerald-500">Paid</div></div>
              <div className="bg-red-50 rounded-xl p-3 text-center"><div className="text-base font-extrabold text-red-600">₹{pending.toLocaleString("en-IN")}</div><div className="text-xs text-red-500">Due</div></div>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Badge status={getStatus(selected)} />
              <button
                onClick={() => handleMarkPaymentReceived(selected)}
                disabled={processingId === selected.id || pending <= 0}
                className={`px-3 py-2 rounded-xl text-xs font-bold ${processingId === selected.id || pending <= 0 ? "bg-slate-200 text-slate-500" : "bg-emerald-600 text-white"}`}
              >
                {processingId === selected.id ? "Processing..." : "Mark Payment Received"}
              </button>
            </div>
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50">
            <SectionTitle title="Payment History" />
            {selected.payments && selected.payments.length > 0 ? (
              <div className="space-y-2">
                {selected.payments.map((payment, i) => (
                  <div key={payment.id || i} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                    <div><p className="text-sm font-semibold text-slate-700">{payment.receiptNumber || `Payment ${i + 1}`}</p><p className="text-xs text-slate-400">{payment.method} · {new Date(payment.paidAt).toLocaleDateString("en-GB")}</p></div>
                    <span className="font-bold text-emerald-600 text-sm">₹{Number(payment.amount ?? 0).toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-slate-400 py-4 text-center">No payments recorded</p>}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 pb-20">
      <ScreenHeader title="Student Fee Ledger" subtitle="Fee status of all students" />
      <div className="px-4 py-3 flex gap-2">
        <div className="flex-1"><SearchBar placeholder="Search student..." /></div>
        <button className="w-10 h-10 bg-white rounded-xl border border-blue-100 flex items-center justify-center flex-shrink-0">
          <Filter className="w-4 h-4 text-slate-500" />
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2 px-4 mb-3">
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-blue-50"><p className="text-[11px] text-slate-500">All students</p><p className="text-lg font-extrabold text-slate-800">{totalStudents}</p></div>
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-blue-50"><p className="text-[11px] text-slate-500">Paid</p><p className="text-lg font-extrabold text-emerald-600">{paidStudents}</p></div>
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-blue-50"><p className="text-[11px] text-slate-500">Unpaid</p><p className="text-lg font-extrabold text-red-600">{unpaidStudents}</p></div>
        <div className="bg-white rounded-2xl p-3 shadow-sm border border-blue-50"><p className="text-[11px] text-slate-500">Due Amount</p><p className="text-lg font-extrabold text-amber-600">₹{dueAmount.toLocaleString("en-IN")}</p></div>
      </div>
      <div className="flex gap-2 px-4 mb-3">
        {['All', 'Paid', 'Partial', 'Unpaid'].map((f) => (
          <button key={f} onClick={() => setFilter(f as "All" | "Paid" | "Partial" | "Unpaid")} className={`px-3 py-1 rounded-xl text-xs font-bold ${filter === f ? "bg-emerald-600 text-white" : "bg-white text-slate-600 border border-blue-100"}`}>{f}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {loading ? (
          <div className="bg-white rounded-2xl p-4 text-sm text-slate-500 shadow-sm border border-blue-50">Loading fee records...</div>
        ) : filteredStudents.length === 0 ? (
          <div className="bg-white rounded-2xl p-4 text-sm text-slate-500 shadow-sm border border-blue-50">No fee records found.</div>
        ) : (
          <div className="space-y-2">
            {filteredStudents.map((record) => {
              const total = Number(record.amount ?? 0);
              const paid = Number(record.paidAmount ?? 0);
              const pending = Math.max(total - paid, 0);
              const studentName = record.student
                ? [record.student.firstName, record.student.lastName].filter(Boolean).join(" ")
                : record.description || "Student";
              const studentMeta = record.student?.enrollmentNumber || record.description || "Fee record";
              return (
                <button key={record.id} onClick={() => setSelected(record)} className="w-full bg-white rounded-2xl p-3.5 shadow-sm border border-blue-50 flex items-center gap-3 text-left">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-extrabold text-sm flex-shrink-0">{studentName[0] || "S"}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between"><h3 className="font-bold text-slate-800 text-sm">{studentName}</h3><Badge status={getStatus(record)} /></div>
                    <p className="text-xs text-slate-500">{studentMeta}</p>
                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-xs text-emerald-600 font-semibold">Paid: ₹{paid.toLocaleString("en-IN")}</span>
                      {pending > 0 && <span className="text-xs text-red-500 font-semibold">Due: ₹{pending.toLocaleString("en-IN")}</span>}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function PaymentCollectionScreen() {
  const [showReceipt, setShowReceipt] = useState(false);
  const [payMode, setPayMode] = useState("UPI");
  if (showReceipt) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 pb-20 flex flex-col">
        <ScreenHeader title="Payment Receipt" onBack={() => setShowReceipt(false)} />
        <div className="px-4 py-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-extrabold text-slate-800 mb-1">Payment Recorded</h2>
          <p className="text-sm text-slate-500 mb-6">Receipt #HP-2025-06-0021</p>
          <div className="w-full bg-white rounded-2xl p-5 shadow-sm border border-blue-50 space-y-3">
            {[["Student", "Arjun Sharma"], ["Room", "A-101"], ["Amount", "₹15,000"], ["Payment Mode", payMode], ["Date", "20 Jun 2025"], ["Received By", "Accountant Priya"], ["Reference", "UPI-202506-001"]].map(([l, v]) => (
              <div key={l} className="flex justify-between">
                <span className="text-xs text-slate-400 font-semibold">{l}</span>
                <span className="text-xs font-bold text-slate-700">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-3 w-full mt-6">
            <button className="flex-1 bg-blue-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2"><Download className="w-4 h-4" /> Download</button>
            <button className="flex-1 bg-slate-100 text-slate-700 py-3 rounded-xl font-bold text-sm">Share</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-20">
      <ScreenHeader title="Payment Collection" subtitle="Record new payment" />
      <div className="px-4 py-4 space-y-3">
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50">
          <h3 className="font-bold text-slate-700 text-sm mb-4">Payment Details</h3>
          {[["Student Name", "Arjun Sharma", "text"], ["Room Number", "A-101", "text"], ["Fee Type", "Hostel + Mess Fee", "text"], ["Amount (₹)", "15000", "number"]].map(([l, v, t]) => (
            <div key={l} className="mb-3">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">{l}</label>
              <div className="mt-1 bg-slate-50 rounded-xl px-3 py-2.5">
                <input type={t} defaultValue={v} className="w-full bg-transparent text-sm text-slate-700 outline-none font-semibold" />
              </div>
            </div>
          ))}
          <div className="mb-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Payment Mode</label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {["UPI", "Cash", "Bank"].map(m => (
                <button key={m} onClick={() => setPayMode(m)}
                  className={`py-2 rounded-xl text-sm font-bold border transition-all ${payMode === m ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-slate-600 border-slate-200"}`}>
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-3">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Reference Number</label>
            <div className="mt-1 bg-slate-50 rounded-xl px-3 py-2.5">
              <input type="text" placeholder="UPI/Transaction ID" className="w-full bg-transparent text-sm text-slate-700 outline-none" />
            </div>
          </div>
          <button onClick={() => setShowReceipt(true)} className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold text-sm">Record Payment & Generate Receipt</button>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50">
          <SectionTitle title="Recent Payments" />
          {[
            { student: "Priya Patel", amount: "₹30,000", mode: "Bank Transfer", date: "19 Jun" },
            { student: "Sneha Gupta", amount: "₹45,000", mode: "UPI", date: "18 Jun" },
            { student: "Arjun Sharma", amount: "₹15,000", mode: "Cash", date: "15 Jun" },
          ].map((p, i) => (
            <div key={i} className="flex items-center justify-between py-2.5 border-b border-slate-50 last:border-0">
              <div><p className="text-sm font-semibold text-slate-700">{p.student}</p><p className="text-xs text-slate-400">{p.mode} · {p.date}</p></div>
              <span className="font-bold text-emerald-600 text-sm">{p.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function FineManagementScreen() {
  const [showAdd, setShowAdd] = useState(false);
  if (showAdd) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 pb-20 flex flex-col">
        <ScreenHeader title="Add Fine" onBack={() => setShowAdd(false)} />
        <div className="px-4 py-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50 space-y-3">
            {[["Student Name", "text"], ["Room Number", "text"], ["Fine Reason", "text"], ["Amount (₹)", "number"], ["Date", "date"]].map(([l, t]) => (
              <div key={l}>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">{l}</label>
                <div className="mt-1 bg-slate-50 rounded-xl px-3 py-2.5">
                  <input type={t} className="w-full bg-transparent text-sm text-slate-700 outline-none" />
                </div>
              </div>
            ))}
            <button className="w-full bg-red-500 text-white py-3 rounded-xl font-bold text-sm">Issue Fine</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-20">
      <ScreenHeader title="Fine Management" subtitle="Issue & track student fines"
        action={<button onClick={() => setShowAdd(true)} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center"><Plus className="w-4 h-4 text-white" /></button>} />
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-blue-50"><div className="text-lg font-extrabold text-red-500">₹3K</div><div className="text-xs text-slate-500">Total Fines</div></div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-blue-50"><div className="text-lg font-extrabold text-orange-500">₹800</div><div className="text-xs text-slate-500">Unpaid</div></div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-blue-50"><div className="text-lg font-extrabold text-emerald-600">₹2.2K</div><div className="text-xs text-slate-500">Collected</div></div>
        </div>
        <SectionTitle title="Fine Records" />
        <div className="space-y-2">
          {mockFines.map(f => (
            <div key={f.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-blue-50">
              <div className="flex items-start justify-between mb-2">
                <div><h3 className="font-bold text-slate-800 text-sm">{f.student}</h3><p className="text-xs text-slate-500">Room {f.room}</p></div>
                <Badge status={f.status} />
              </div>
              <p className="text-xs text-slate-600 mb-2">{f.reason}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-red-500">₹{f.amount}</span>
                  <span className="text-xs text-slate-400">{f.date}</span>
                </div>
                <div className="flex gap-1.5">
                  <button className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center"><Edit className="w-3 h-3 text-blue-600" /></button>
                  <button className="w-7 h-7 bg-red-50 rounded-lg flex items-center justify-center"><Trash2 className="w-3 h-3 text-red-500" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RewardManagementScreen() {
  const [showCreate, setShowCreate] = useState(false);
  if (showCreate) {
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 pb-20 flex flex-col">
        <ScreenHeader title="Create Reward" onBack={() => setShowCreate(false)} />
        <div className="px-4 py-4">
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50 space-y-3">
            {[["Student Name", "text"], ["Room Number", "text"], ["Reward Reason", "text"], ["Amount (₹)", "number"]].map(([l, t]) => (
              <div key={l}>
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">{l}</label>
                <div className="mt-1 bg-slate-50 rounded-xl px-3 py-2.5">
                  <input type={t} className="w-full bg-transparent text-sm text-slate-700 outline-none" />
                </div>
              </div>
            ))}
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wide">Reward Type</label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {["Academic", "Sports", "Scholarship"].map(t => (
                  <button key={t} className="py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-700 border border-amber-100">{t}</button>
                ))}
              </div>
            </div>
            <button className="w-full bg-amber-500 text-white py-3 rounded-xl font-bold text-sm">Issue Reward</button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-20">
      <ScreenHeader title="Reward Management" subtitle="Issue & track student rewards"
        action={<button onClick={() => setShowCreate(true)} className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center"><Plus className="w-4 h-4 text-white" /></button>} />
      <div className="px-4 py-4">
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-blue-50"><div className="text-lg font-extrabold text-amber-500">₹3.5K</div><div className="text-xs text-slate-500">Total Issued</div></div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-blue-50"><div className="text-lg font-extrabold text-blue-600">3</div><div className="text-xs text-slate-500">This Month</div></div>
          <div className="bg-white rounded-2xl p-3 text-center shadow-sm border border-blue-50"><div className="text-lg font-extrabold text-purple-600">3</div><div className="text-xs text-slate-500">Students</div></div>
        </div>
        <SectionTitle title="Reward Records" />
        <div className="space-y-2">
          {mockRewards.map(r => (
            <div key={r.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-blue-50">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-slate-800 text-sm">{r.student}</h3><span className="font-extrabold text-amber-500 text-sm">₹{r.amount}</span></div>
                  <p className="text-xs text-slate-600 mt-0.5">{r.reason}</p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{r.type}</span>
                    <span className="text-xs text-slate-400">{r.date}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AccountantApp({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState(0);
  const tabs = [
    { icon: <Home className="w-4 h-4" />, label: "Dashboard" },
    { icon: <Layers className="w-4 h-4" />, label: "Fees" },
    { icon: <FileText className="w-4 h-4" />, label: "Ledger" },
    { icon: <CreditCard className="w-4 h-4" />, label: "Collect" },
    { icon: <Award className="w-4 h-4" />, label: "Fines" },
  ];
  const [fineTab, setFineTab] = useState(0);
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {tab === 0 && <AccountantDashboard />}
      {tab === 1 && <FeeStructureScreen />}
      {tab === 2 && <StudentFeeLedgerScreen />}
      {tab === 3 && <PaymentCollectionScreen />}
      {tab === 4 && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-blue-800 to-blue-600 px-4 py-3 flex-shrink-0">
            <h1 className="text-white font-extrabold text-base">Fines & Rewards</h1>
          </div>
          <SubTabBar tabs={["Fines", "Rewards"]} active={fineTab} onChange={setFineTab} />
          <div className="flex-1 overflow-hidden">
            {fineTab === 0 ? <FineManagementScreen /> : <RewardManagementScreen />}
          </div>
        </div>
      )}
      <BottomNav tabs={tabs} active={tab} onChange={setTab} />
    </div>
  );
}

// ─── LAUNDRY STAFF ────────────────────────────────────────────

function LaundryDashboard() {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-20">
      <div className="bg-gradient-to-br from-pink-700 to-pink-500 px-4 pt-4 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-pink-200 text-xs font-semibold">Friday, 20 Jun 2025</p>
            <h1 className="text-white font-extrabold text-lg">Laundry Dashboard</h1>
          </div>
          <button className="w-9 h-9 bg-white/15 rounded-xl flex items-center justify-center">
            <Bell className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="bg-white/15 rounded-2xl p-3 grid grid-cols-4 gap-2 text-center">
          {[["18", "Pending"], ["8", "Process."], ["12", "Ready"], ["45", "Delivered"]].map(([v, l]) => (
            <div key={l}><div className="text-white font-extrabold text-lg">{v}</div><div className="text-pink-200 text-xs">{l}</div></div>
          ))}
        </div>
      </div>
      <div className="px-4 -mt-4 pb-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard icon={<Clock className="w-4 h-4" />} label="Pending Pickup" value="18" color="orange" />
          <StatCard icon={<RefreshCw className="w-4 h-4" />} label="In Processing" value="8" color="blue" />
          <StatCard icon={<CheckCircle className="w-4 h-4" />} label="Ready for Pickup" value="12" color="purple" />
          <StatCard icon={<Truck className="w-4 h-4" />} label="Delivered Today" value="45" color="green" trend={{ value: "+5", up: true }} />
        </div>

        <ChartCard title="Weekly Laundry Volume">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={laundryChartData}>
              <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
              <Bar dataKey="requests" fill="#DB2777" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Bar dataKey="completed" fill="#F9A8D4" radius={[4, 4, 0, 0]} maxBarSize={20} />
              <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50 mb-3">
          <SectionTitle title="Today's Summary" />
          {[
            { label: "Total Requests", value: "83", color: "text-blue-700" },
            { label: "Completed", value: "65", color: "text-emerald-600" },
            { label: "Clothes Processed", value: "312 items", color: "text-purple-600" },
            { label: "Pending Notifications", value: "12", color: "text-orange-500" },
          ].map(item => (
            <div key={item.label} className="flex justify-between py-2 border-b border-slate-50 last:border-0">
              <span className="text-sm text-slate-600">{item.label}</span>
              <span className={`text-sm font-extrabold ${item.color}`}>{item.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LaundryRequestsScreen() {
  const [tab, setTab] = useState(0);
  const statusFilters = ["All", "Pending", "Processing", "Ready", "Delivered"];
  const filtered = tab === 0 ? laundryRequests : laundryRequests.filter(r => r.status === statusFilters[tab].toLowerCase());
  const statusCount = (s: string) => laundryRequests.filter(r => r.status === s).length;
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 pb-20">
      <ScreenHeader title="Laundry Requests" subtitle={`${filtered.length} requests`} />
      <div className="flex gap-1 px-4 py-3 overflow-x-auto flex-shrink-0">
        {statusFilters.map((f, i) => (
          <button key={f} onClick={() => setTab(i)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex-shrink-0 transition-all ${tab === i ? "bg-pink-600 text-white" : "bg-white text-slate-600 border border-pink-100"}`}>
            {f}{i > 0 ? ` (${statusCount(f.toLowerCase())})` : ""}
          </button>
        ))}
      </div>
      <div className="px-4 mb-3 flex-shrink-0"><SearchBar placeholder="Search student or room..." /></div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-2">
          {filtered.map(req => (
            <div key={req.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-blue-50">
              <div className="flex items-start justify-between mb-2">
                <div><h3 className="font-bold text-slate-800 text-sm">{req.student}</h3><p className="text-xs text-slate-500">Room {req.room} · {req.date}</p></div>
                <Badge status={req.status} />
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Package className="w-3 h-3" />{req.clothes}</span>
                <span className="flex items-center gap-1"><Hash className="w-3 h-3" />{req.qty} items</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{req.pickup}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function RoomwiseLaundryScreen() {
  const [expanded, setExpanded] = useState<string | null>("A");
  const blocks = ["A", "B", "C", "D", "E"];
  const roomData: Record<string, Array<{ room: string; student: string; qty: number; status: string }>> = {
    A: [{ room: "A-101", student: "Arjun Sharma", qty: 8, status: "pending" }, { room: "A-204", student: "Sneha Gupta", qty: 2, status: "delivered" }],
    B: [{ room: "B-205", student: "Priya Patel", qty: 5, status: "processing" }, { room: "B-301", student: "Ananya Krishnan", qty: 4, status: "processing" }],
    C: [{ room: "C-310", student: "Rahul Verma", qty: 3, status: "ready" }],
    D: [{ room: "D-102", student: "Vikram Singh", qty: 10, status: "pending" }],
    E: [{ room: "E-405", student: "Deepak Mehta", qty: 6, status: "ready" }],
  };
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 pb-20">
      <ScreenHeader title="Room-wise Laundry" subtitle="Requests organized by block" />
      <div className="px-4 py-3">
        <div className="grid grid-cols-5 gap-2 mb-4">
          {blocks.map(b => (
            <div key={b} className="bg-white rounded-xl p-2 text-center shadow-sm border border-blue-50">
              <div className="font-extrabold text-blue-700 text-base">Block {b}</div>
              <div className="text-xs text-slate-500">{roomData[b].length} rooms</div>
            </div>
          ))}
        </div>
        <div className="space-y-2">
          {blocks.map(block => (
            <div key={block} className="bg-white rounded-2xl shadow-sm border border-blue-50 overflow-hidden">
              <button onClick={() => setExpanded(expanded === block ? null : block)}
                className="w-full flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-pink-100 rounded-xl flex items-center justify-center">
                    <span className="text-pink-700 font-extrabold text-sm">{block}</span>
                  </div>
                  <div className="text-left">
                    <h3 className="font-bold text-slate-800 text-sm">Block {block}</h3>
                    <p className="text-xs text-slate-500">{roomData[block].length} requests</p>
                  </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expanded === block ? "rotate-180" : ""}`} />
              </button>
              {expanded === block && (
                <div className="border-t border-slate-50">
                  {roomData[block].map((r, i) => (
                    <div key={i} className="flex items-center justify-between px-4 py-3 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-bold text-slate-700">{r.room}</p>
                        <p className="text-xs text-slate-500">{r.student} · {r.qty} items</p>
                      </div>
                      <Badge status={r.status} />
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StudentwiseLaundryScreen() {
  const [selected, setSelected] = useState<typeof mockStudents[0] | null>(null);
  if (selected) {
    const studentRequests = laundryRequests.filter(r => r.student === selected.name);
    return (
      <div className="flex-1 overflow-y-auto bg-slate-50 pb-20 flex flex-col">
        <ScreenHeader title={selected.name} subtitle={`Room ${selected.room} · Laundry History`} onBack={() => setSelected(null)} />
        <div className="px-4 py-4 space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {[["Total", studentRequests.length, "blue"], ["Active", studentRequests.filter(r => r.status !== "delivered").length, "orange"], ["Done", studentRequests.filter(r => r.status === "delivered").length, "green"]].map(([l, v, c]) => (
              <div key={l as string} className={`bg-white rounded-xl p-3 text-center shadow-sm border border-blue-50`}>
                <div className={`text-lg font-extrabold ${c === "blue" ? "text-blue-700" : c === "orange" ? "text-orange-500" : "text-emerald-600"}`}>{v}</div>
                <div className="text-xs text-slate-500">{l}</div>
              </div>
            ))}
          </div>
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-blue-50">
            <SectionTitle title="Laundry Timeline" />
            {studentRequests.length > 0 ? studentRequests.map(req => (
              <div key={req.id} className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
                <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${req.status === "delivered" ? "bg-emerald-500" : req.status === "ready" ? "bg-purple-500" : req.status === "processing" ? "bg-blue-500" : "bg-orange-500"}`} />
                <div className="flex-1">
                  <div className="flex justify-between"><p className="text-sm font-bold text-slate-700">{req.clothes}</p><Badge status={req.status} /></div>
                  <p className="text-xs text-slate-400 mt-0.5">{req.date} · {req.qty} items · Pickup {req.pickup}</p>
                </div>
              </div>
            )) : <p className="text-sm text-slate-400 py-4 text-center">No laundry history</p>}
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 pb-20">
      <ScreenHeader title="Student-wise Laundry" subtitle="View per-student laundry history" />
      <div className="px-4 py-3 flex-shrink-0"><SearchBar placeholder="Search student..." /></div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="space-y-2">
          {mockStudents.map(s => {
            const reqs = laundryRequests.filter(r => r.student === s.name);
            return (
              <button key={s.id} onClick={() => setSelected(s)} className="w-full bg-white rounded-2xl p-3.5 shadow-sm border border-blue-50 flex items-center gap-3 text-left">
                <div className="w-10 h-10 bg-pink-100 rounded-xl flex items-center justify-center text-pink-700 font-extrabold text-sm flex-shrink-0">{s.name[0]}</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm">{s.name}</h3>
                  <p className="text-xs text-slate-500">Room {s.room}</p>
                  <p className="text-xs text-pink-600 font-semibold mt-0.5">{reqs.length} request{reqs.length !== 1 ? "s" : ""}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0" />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function LaundryActionsScreen() {
  const [tab, setTab] = useState(0);
  const [delivered, setDelivered] = useState<number[]>([]);
  const pending = laundryRequests.filter(r => r.status === "pending");
  const processing = laundryRequests.filter(r => r.status === "processing");
  const ready = laundryRequests.filter(r => r.status === "ready");
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 pb-20">
      <ScreenHeader title="Laundry Actions" subtitle="Process, pickup & deliver" />
      <SubTabBar tabs={["Process", "Pickup", "Deliver"]} active={tab} onChange={setTab} />
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {tab === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 mb-3">{pending.length} items awaiting processing</p>
            {pending.map(req => (
              <div key={req.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-blue-50">
                <div className="flex items-start justify-between mb-3">
                  <div><h3 className="font-bold text-slate-800 text-sm">{req.student}</h3><p className="text-xs text-slate-500">Room {req.room} · {req.qty} items</p></div>
                  <Badge status={req.status} />
                </div>
                <p className="text-xs text-slate-600 mb-3">{req.clothes}</p>
                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 text-white py-2 rounded-xl text-xs font-bold">Mark Processing</button>
                  <button className="flex-1 bg-purple-100 text-purple-700 py-2 rounded-xl text-xs font-bold">Mark Ready</button>
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 1 && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 mb-3">{ready.length} items ready for pickup</p>
            {ready.map(req => (
              <div key={req.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-blue-50">
                <div className="flex items-start justify-between mb-2">
                  <div><h3 className="font-bold text-slate-800 text-sm">{req.student}</h3><p className="text-xs text-slate-500">Room {req.room}</p></div>
                  <Badge status="ready" />
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                  <span>{req.clothes} · {req.qty} items</span>
                </div>
                <div className="flex items-center gap-2 bg-purple-50 rounded-xl p-2 mb-3">
                  <Bell className="w-4 h-4 text-purple-600" />
                  <span className="text-xs text-purple-700 font-medium">Notification sent to student</span>
                </div>
                <button className="w-full bg-purple-600 text-white py-2 rounded-xl text-xs font-bold">Confirm Student Pickup</button>
              </div>
            ))}
            {processing.map(req => (
              <div key={req.id} className="bg-white rounded-2xl p-3.5 shadow-sm border border-blue-50 opacity-60">
                <div className="flex items-start justify-between">
                  <div><h3 className="font-bold text-slate-700 text-sm">{req.student}</h3><p className="text-xs text-slate-400">Room {req.room} · Still processing</p></div>
                  <Badge status="processing" />
                </div>
              </div>
            ))}
          </div>
        )}
        {tab === 2 && (
          <div className="space-y-2">
            <p className="text-xs text-slate-500 mb-3">Confirm delivery to students</p>
            {[...processing, ...ready].map(req => (
              <div key={req.id} className={`bg-white rounded-2xl p-3.5 shadow-sm border transition-all ${delivered.includes(req.id) ? "border-emerald-200 bg-emerald-50" : "border-blue-50"}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800 text-sm">{req.student}</h3>
                    <p className="text-xs text-slate-500">Room {req.room} · {req.qty} items · {req.date}</p>
                  </div>
                  {delivered.includes(req.id) ? <Badge status="delivered" /> : <Badge status={req.status} />}
                </div>
                <p className="text-xs text-slate-600 mb-3">{req.clothes}</p>
                {delivered.includes(req.id) ? (
                  <div className="flex items-center gap-2 bg-emerald-50 rounded-xl p-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs text-emerald-700 font-bold">Delivered — {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                  </div>
                ) : (
                  <button onClick={() => setDelivered(prev => [...prev, req.id])} className="w-full bg-emerald-600 text-white py-2 rounded-xl text-xs font-bold">Confirm Delivery</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LaundryReportsScreen() {
  const [tab, setTab] = useState(0);
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-slate-50 pb-20">
      <ScreenHeader title="Laundry Reports" subtitle="Daily, weekly & monthly analytics" />
      <SubTabBar tabs={["Daily", "Weekly", "Monthly"]} active={tab} onChange={setTab} />
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {tab === 0 && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatCard icon={<Package className="w-4 h-4" />} label="Total Requests" value="83" color="blue" />
              <StatCard icon={<CheckCircle className="w-4 h-4" />} label="Completed" value="65" color="green" />
              <StatCard icon={<Clock className="w-4 h-4" />} label="Pending" value="18" color="orange" />
              <StatCard icon={<Layers className="w-4 h-4" />} label="Items Processed" value="312" color="purple" />
            </div>
            <ChartCard title="Today's Hourly Distribution" height={170}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[{ h: "8am", v: 12 }, { h: "10am", v: 18 }, { h: "12pm", v: 25 }, { h: "2pm", v: 15 }, { h: "4pm", v: 8 }, { h: "6pm", v: 5 }]}>
                  <XAxis dataKey="h" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
                  <Bar dataKey="v" fill="#DB2777" radius={[4, 4, 0, 0]} maxBarSize={28} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        )}
        {tab === 1 && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatCard icon={<Package className="w-4 h-4" />} label="Weekly Requests" value="349" color="blue" />
              <StatCard icon={<CheckCircle className="w-4 h-4" />} label="Completed" value="329" color="green" />
              <StatCard icon={<Percent className="w-4 h-4" />} label="Completion Rate" value="94.3%" color="purple" trend={{ value: "+2.1%", up: true }} />
              <StatCard icon={<Star className="w-4 h-4" />} label="Avg Daily" value="49.9" color="amber" />
            </div>
            <ChartCard title="Weekly Volume" height={180}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={laundryChartData}>
                  <XAxis dataKey="day" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
                  <Bar dataKey="requests" fill="#DB2777" radius={[4, 4, 0, 0]} maxBarSize={22} />
                  <Bar dataKey="completed" fill="#F9A8D4" radius={[4, 4, 0, 0]} maxBarSize={22} />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        )}
        {tab === 2 && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <StatCard icon={<Package className="w-4 h-4" />} label="Monthly Total" value="1,420" color="blue" trend={{ value: "+12%", up: true }} />
              <StatCard icon={<Layers className="w-4 h-4" />} label="Items Processed" value="5,680" color="purple" />
              <StatCard icon={<Percent className="w-4 h-4" />} label="Avg Completion" value="94.8%" color="green" />
              <StatCard icon={<Clock className="w-4 h-4" />} label="Avg Turnaround" value="18 hrs" color="orange" />
            </div>
            <ChartCard title="Monthly Trend" height={180}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={[{ m: "Jan", v: 1200 }, { m: "Feb", v: 1100 }, { m: "Mar", v: 1350 }, { m: "Apr", v: 1280 }, { m: "May", v: 1390 }, { m: "Jun", v: 1420 }]}>
                  <defs>
                    <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#DB2777" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#DB2777" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="m" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "none", fontSize: 12 }} />
                  <Area type="monotone" dataKey="v" stroke="#DB2777" fill="url(#lg)" strokeWidth={2.5} dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </ChartCard>
            <div className="flex gap-2 justify-center">
              {["PDF", "Excel", "CSV"].map(fmt => (
                <button key={fmt} className="flex-1 bg-white border border-pink-200 text-pink-600 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5">
                  <Download className="w-3.5 h-3.5" /> {fmt}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function LaundryApp({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState(0);
  const [trackTab, setTrackTab] = useState(0);
  const tabs = [
    { icon: <Home className="w-4 h-4" />, label: "Dashboard" },
    { icon: <Package className="w-4 h-4" />, label: "Requests" },
    { icon: <MapPin className="w-4 h-4" />, label: "Track" },
    { icon: <Truck className="w-4 h-4" />, label: "Actions" },
    { icon: <BarChart2 className="w-4 h-4" />, label: "Reports" },
  ];
  return (
    <div className="flex-1 flex flex-col relative overflow-hidden">
      {tab === 0 && <LaundryDashboard />}
      {tab === 1 && <LaundryRequestsScreen />}
      {tab === 2 && (
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="bg-gradient-to-r from-pink-700 to-pink-500 px-4 py-3 flex-shrink-0">
            <h1 className="text-white font-extrabold text-base">Track Laundry</h1>
          </div>
          <SubTabBar tabs={["By Room", "By Student"]} active={trackTab} onChange={setTrackTab} />
          <div className="flex-1 overflow-hidden">
            {trackTab === 0 ? <RoomwiseLaundryScreen /> : <StudentwiseLaundryScreen />}
          </div>
        </div>
      )}
      {tab === 3 && <LaundryActionsScreen />}
      {tab === 4 && <LaundryReportsScreen />}
      <BottomNav tabs={tabs} active={tab} onChange={setTab} />
    </div>
  );
}

// ─── ROLE SELECTOR ────────────────────────────────────────────

const ROLES = [
  { key: "superadmin", label: "Super Admin", sub: "Full system access", icon: <Shield className="w-6 h-6" />, color: "from-violet-600 to-violet-500", dot: "bg-violet-500" },
  { key: "admin", label: "Admin", sub: "Hostel administration", icon: <Settings className="w-6 h-6" />, color: "from-blue-700 to-blue-500", dot: "bg-blue-500" },
  { key: "trustee", label: "Trustee", sub: "Strategic governance", icon: <Star className="w-6 h-6" />, color: "from-amber-600 to-amber-400", dot: "bg-amber-500" },
  { key: "accountant", label: "Accountant", sub: "Financial management", icon: <DollarSign className="w-6 h-6" />, color: "from-emerald-700 to-emerald-500", dot: "bg-emerald-500" },
  { key: "laundry", label: "Laundry Staff", sub: "Laundry operations", icon: <Package className="w-6 h-6" />, color: "from-pink-600 to-pink-400", dot: "bg-pink-500" },
];

function RoleSelector({ onSelect }: { onSelect: (role: string) => void }) {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50">
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 px-6 pt-8 pb-12 text-center">
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <span className="text-white font-extrabold text-2xl">H</span>
        </div>
        <h1 className="text-white font-extrabold text-2xl tracking-tight">HostelPaglu</h1>
        <p className="text-blue-200 text-sm mt-1.5">Select your role to continue</p>
      </div>

      <div className="px-5 -mt-6 pb-8">
        <div className="bg-white rounded-3xl shadow-xl border border-blue-50 overflow-hidden mb-5">
          <div className="px-5 py-4 border-b border-slate-50">
            <h2 className="font-extrabold text-slate-800 text-base">Welcome Back!</h2>
            <p className="text-xs text-slate-500 mt-0.5">Choose your role to access your dashboard</p>
          </div>
          <div className="divide-y divide-slate-50">
            {ROLES.map(role => (
              <button key={role.key} onClick={() => onSelect(role.key)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${role.color} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
                  {role.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-slate-800 text-sm">{role.label}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{role.sub}</p>
                </div>
                <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${role.dot}`} />
              </button>
            ))}
          </div>
        </div>
        <p className="text-center text-xs text-slate-400">
          Demo mode — backend integration pending
        </p>
      </div>
    </div>
  );
}

// ─── PHONE FRAME ──────────────────────────────────────────────

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4"
      style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <div className="relative flex flex-col bg-white overflow-hidden"
        style={{ width: 390, height: 844, borderRadius: 44, boxShadow: "0 50px 120px -20px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.08), inset 0 0 0 1px rgba(0,0,0,0.3)" }}>
        {/* Dynamic Island */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-28 h-7 bg-black z-50 rounded-full" />
        {/* Status bar */}
        <div className="bg-blue-800 flex-shrink-0" style={{ height: 52, paddingTop: 14, paddingLeft: 24, paddingRight: 20, display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingBottom: 6 }}>
          <span style={{ color: "white", fontSize: 12, fontWeight: 700 }}>9:41</span>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            {/* Signal bars */}
            <div style={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
              {[4, 7, 10, 12].map((h, i) => (
                <div key={i} style={{ width: 3, height: h, backgroundColor: "white", borderRadius: 1.5, opacity: i < 3 ? 0.7 : 1 }} />
              ))}
            </div>
            {/* WiFi */}
            <svg width="14" height="12" viewBox="0 0 24 18" fill="none" style={{ marginLeft: 2 }}>
              <path d="M12 14.5L12.01 14.51" stroke="white" strokeWidth="3" strokeLinecap="round" />
              <path d="M8.5 11.5C9.5 10.4 10.7 9.75 12 9.75C13.3 9.75 14.5 10.4 15.5 11.5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
              <path d="M5.5 8.5C7.3 6.5 9.5 5.25 12 5.25C14.5 5.25 16.7 6.5 18.5 8.5" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
            </svg>
            {/* Battery */}
            <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
              <div style={{ width: 22, height: 11, border: "1.5px solid white", borderRadius: 3, padding: "1.5px", display: "flex", alignItems: "stretch" }}>
                <div style={{ flex: 1, backgroundColor: "white", borderRadius: 1.5 }} />
              </div>
              <div style={{ width: 2, height: 5, backgroundColor: "white", borderRadius: 1, opacity: 0.7 }} />
            </div>
          </div>
        </div>
        {/* App content */}
        <div className="flex-1 overflow-hidden flex flex-col">{children}</div>
      </div>
    </div>
  );
}

// ─── StaffPortal Export ───────────────────────────────────────────────────────
export interface StaffPortalProps {
  role: "superadmin" | "admin" | "trustee" | "accountant" | "laundry";
  onLogout: () => void;
}

export default function StaffPortal({ role, onLogout }: StaffPortalProps) {
  return (
    <PhoneFrame>
      {role === "superadmin" && <SuperAdminApp onLogout={onLogout} />}
      {role === "admin" && <AdminApp onLogout={onLogout} />}
      {role === "trustee" && <TrusteeApp onLogout={onLogout} />}
      {role === "accountant" && <AccountantApp onLogout={onLogout} />}
      {role === "laundry" && <LaundryApp onLogout={onLogout} />}
    </PhoneFrame>
  );
}
