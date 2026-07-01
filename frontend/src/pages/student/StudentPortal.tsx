// ─── STUDENT PORTAL — extracted from P2 (hp_p2) ──────────────────────────────
import React, { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api, createNotification, createVisitorRequest, getFeeDetails, getNotifications, getPaymentHistory, markNotificationAsRead, payFee, type FeeRecord, type NotificationItem, type VisitorRequest } from "../../services/api";
import { authService } from "../../auth-integration/src/api/authService";
import { apiClient } from "../../auth-integration/src/api/axiosInstance";
import { toast } from "sonner";
import {
  Home,
  User,
  Bell,
  Settings,
  Search,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  MapPin,
  FileText,
  Shirt,
  Coffee,
  Star,
  AlertCircle,
  CheckCircle,
  XCircle,
  Plus,
  Phone,
  Mail,
  Download,
  Upload,
  Filter,
  Eye,
  Edit,
  Edit3,
  MessageSquare,
  Activity,
  Package,
  RefreshCw,
  MoreVertical,
  Shield,
  BookOpen,
  Users,
  Building,
  Building2,
  Camera,
  X,
  Check,
  LogIn,
  LogOut,
  Megaphone,
  Lightbulb,
  Trophy,
  ThumbsUp,
  Heart,
  Flame,
  Zap,
  Info,
  Send,
  CreditCard,
  Wrench,
  Utensils,
} from "lucide-react";
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Bar } from "recharts";

type Screen =
  | "dashboard" | "profile" | "attendance" | "movement"
  | "leave-request" | "leave-history" | "curfew" | "fees"
  | "fines" | "maintenance" | "complaints" | "laundry-dashboard"
  | "laundry-request" | "visitor" | "mess" | "notices"
  | "events" | "initiatives" | "feedback" | "notifications"
  | "emergency" | "settings";

export interface StudentPortalProps {
  onLogout: () => void;
}

type AttendanceChartPoint = { month: string; present: number; absent: number; leave: number };

const student = {
  name: "",
  enrollment: "",
  room: "",
  floor: "",
  dob: "",
  bloodGroup: "",
  phone: "",
  email: "",
  city: "",
  state: "",
  college: "",
  branch: "",
  year: "",
  hostel: "",
  parentName: "",
  parentPhone: "",
  parentEmail: "",
  leaveBalance: 0,
};

const normalizeProfile = (payload: any) => ({
  id: payload?.id ?? payload?.studentId ?? "",
  name: payload?.name ?? payload?.fullName ?? "",
  enrollment: payload?.enrollmentNumber ?? payload?.enrollment ?? "",
  room: payload?.room ?? payload?.roomNumber ?? "",
  floor: payload?.floor ?? "",
  dob: payload?.dob ?? payload?.dateOfBirth ?? "",
  bloodGroup: payload?.bloodGroup ?? "",
  phone: payload?.phone ?? payload?.phoneNumber ?? "",
  email: payload?.email ?? "",
  city: payload?.city ?? "",
  state: payload?.state ?? "",
  college: payload?.college ?? payload?.institution ?? "",
  branch: payload?.branch ?? payload?.department ?? "",
  year: payload?.year ?? "",
  hostel: payload?.hostel ?? payload?.hostelName ?? "",
  parentName: payload?.parentName ?? payload?.guardianName ?? "",
  parentPhone: payload?.parentPhone ?? payload?.guardianPhone ?? "",
  parentEmail: payload?.parentEmail ?? payload?.guardianEmail ?? "",
  leaveBalance: typeof payload?.leaveBalance === "number" ? payload.leaveBalance : 8,
  feeDue: payload?.feeDue ?? 0,
  feeDueDueDate: payload?.feeDueDueDate ?? "",
});

const buildAttendanceCalendar = (days: Array<{ date?: string; present?: number; absent?: number; onLeave?: number }>) => {
  const entries = days
    .map((entry) => {
      if (!entry?.date) return null;
      const date = new Date(entry.date);
      if (Number.isNaN(date.getTime())) return null;
      const status = entry.present ? "present" : entry.absent ? "absent" : entry.onLeave ? "leave" : "none";
      return { day: date.getDate(), status };
    })
    .filter((entry): entry is { day: number; status: string } => entry !== null);

  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  const statusMap = new Map(entries.map((entry) => [entry.day, entry.status]));

  return Array.from({ length: daysInMonth }, (_, idx) => ({
    day: idx + 1,
    status: statusMap.get(idx + 1) ?? "none",
  }));
};

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    approved: "bg-emerald-100 text-emerald-700",
    rejected: "bg-red-100 text-red-700",
    pending: "bg-amber-100 text-amber-700",
    paid: "bg-emerald-100 text-emerald-700",
    partial: "bg-amber-100 text-amber-700",
    "in-progress": "bg-blue-100 text-blue-700",
    resolved: "bg-emerald-100 text-emerald-700",
    ready: "bg-purple-100 text-purple-700",
    delivered: "bg-slate-100 text-slate-600",
    normal: "bg-emerald-100 text-emerald-700",
    late: "bg-red-100 text-red-700",
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-slate-100 text-slate-600",
  };
  const label: Record<string, string> = {
    "in-progress": "In Progress",
  };
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${map[status] || "bg-slate-100 text-slate-600"}`}>
      {label[status] || status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-blue-50 ${className}`}>{children}</div>
);

const SectionHeader = ({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) => (
  <div className="flex items-center justify-between mb-3">
    <h2 className="text-sm font-bold text-slate-800">{title}</h2>
    {action && <button onClick={onAction} className="text-xs font-semibold text-blue-600">{action}</button>}
  </div>
);

const BackHeader = ({ title, onBack, action }: { title: string; onBack: () => void; action?: React.ReactNode }) => (
  <div className="sticky top-0 z-10 bg-white border-b border-blue-50 flex items-center px-4 h-14">
    <button onClick={onBack} className="mr-3 p-1 rounded-full hover:bg-blue-50 transition-colors">
      <ChevronLeft size={22} className="text-slate-700" />
    </button>
    <h1 className="text-base font-bold text-slate-900 flex-1">{title}</h1>
    {action}
  </div>
);

const Input = ({ label, placeholder, type = "text", icon }: { label: string; placeholder: string; type?: string; icon?: React.ReactNode }) => (
  <div className="mb-4">
    <label className="block text-xs font-semibold text-slate-600 mb-1.5">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{icon}</div>}
      <input
        type={type}
        placeholder={placeholder}
        className={`w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent ${icon ? "pl-10" : ""}`}
      />
    </div>
  </div>
);

const PrimaryBtn = ({ label, onClick, icon, className = "", disabled = false }: { label: string; onClick?: () => void; icon?: React.ReactNode; className?: string; disabled?: boolean }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`w-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-semibold py-3.5 rounded-2xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
  >
    {icon}{label}
  </button>
);

// ─── Bottom Navigation ────────────────────────────────────────────────────────
const tabs = [
  { id: "dashboard", icon: Home, label: "Home" },
  { id: "attendance", icon: Activity, label: "Attend." },
  { id: "fees", icon: CreditCard, label: "Fees" },
  { id: "notifications", icon: Bell, label: "Alerts" },
  { id: "settings", icon: Settings, label: "Settings" },
];

const BottomNav = ({ active, onNavigate, unread }: { active: string; onNavigate: (s: Screen) => void; unread: number }) => (
  <div className="flex border-t border-slate-100 bg-white">
    {tabs.map(({ id, icon: Icon, label }) => {
      const isActive = active === id || (id === "dashboard" && !tabs.map(t => t.id).includes(active));
      return (
        <button
          key={id}
          onClick={() => onNavigate(id as Screen)}
          className={`flex-1 flex flex-col items-center py-2.5 gap-0.5 transition-colors relative ${isActive ? "text-blue-600" : "text-slate-400"}`}
        >
          <div className="relative">
            <Icon size={20} strokeWidth={isActive ? 2.5 : 1.8} />
            {id === "notifications" && unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">{unread}</span>
            )}
          </div>
          <span className={`text-[10px] font-${isActive ? "700" : "500"}`}>{label}</span>
          {isActive && <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-0.5 bg-blue-600 rounded-full" />}
        </button>
      );
    })}
  </div>
);

// ─── Screen: Dashboard ────────────────────────────────────────────────────────
const DashboardScreen = ({ onNavigate, profile, attendanceRate, attendanceRecords, leaveBalance, complaintsOpen, attendanceSummary }: { onNavigate: (s: Screen) => void; profile: Partial<typeof student>; attendanceRate: number; attendanceRecords: Array<{ month: string; present: number; absent: number; leave?: number }>; leaveBalance: number; complaintsOpen: number; attendanceSummary: { overallAttendance?: number; departmentAttendance?: number; hostelAttendance?: number; dailySummary?: string; monthlySummary?: string; }; }) => {
  const quickActions = [
    { label: "Apply\nLeave", icon: Calendar, screen: "leave-request" as Screen, color: "bg-blue-100 text-blue-700" },
    { label: "Complaint", icon: Wrench, screen: "maintenance" as Screen, color: "bg-amber-100 text-amber-700" },
    { label: "Laundry", icon: Shirt, screen: "laundry-request" as Screen, color: "bg-purple-100 text-purple-700" },
    { label: "View\nFees", icon: CreditCard, screen: "fees" as Screen, color: "bg-emerald-100 text-emerald-700" },
    { label: "Visitor", icon: Users, screen: "visitor" as Screen, color: "bg-teal-100 text-teal-700" },
    { label: "Mess\nMenu", icon: Utensils, screen: "mess" as Screen, color: "bg-orange-100 text-orange-700" },
  ];

  const statusCards = [
    { label: "Attendance", value: `${attendanceRate}%`, icon: Activity, color: "text-blue-600", bg: "bg-blue-50", trend: attendanceRate >= 85 ? "On track" : "Below target" },
    { label: "Fee Due", value: profile.feeDue ? `₹${profile.feeDue}` : "₹0", icon: CreditCard, color: "text-amber-600", bg: "bg-amber-50", trend: profile.feeDue ? `Due ${profile.feeDueDueDate ?? 'TBD'}` : "No dues" },
    { label: "Leave Bal.", value: `${leaveBalance} days`, icon: Calendar, color: "text-emerald-600", bg: "bg-emerald-50", trend: "Current balance" },
    { label: "Complaints", value: `${complaintsOpen} open`, icon: Wrench, color: "text-red-600", bg: "bg-red-50", trend: `${complaintsOpen} pending` },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Hero Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 pt-12 pb-6 px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-blue-200 text-xs font-medium">Good Morning 👋</p>
            <h1 className="text-white text-xl font-bold mt-0.5">{profile.name ?? ""}</h1>
            <p className="text-blue-300 text-xs mt-0.5">
              {profile.room ? `Room ${profile.room}` : ""}
              {profile.floor ? ` · ${profile.floor}` : ""}
              {profile.hostel ? ` · ${profile.hostel}` : ""}
            </p>
          </div>
          <button onClick={() => onNavigate("profile")} className="w-12 h-12 rounded-2xl bg-white/20 border-2 border-white/30 flex items-center justify-center">
            <span className="text-white font-bold text-base">{profile.name ? profile.name.split(' ').map((w) => w[0]).join('') : ""}</span>
          </button>
        </div>
        {/* Present Status (dynamic based on attendanceSummary) */}
        <div className="bg-white/15 rounded-2xl p-3 flex items-center gap-3 border border-white/20">
          <div className="w-8 h-8 bg-emerald-400 rounded-xl flex items-center justify-center">
            <CheckCircle size={16} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-white font-semibold text-sm">Attendance</p>
            <p className="text-blue-200 text-xs">Last update: {attendanceSummary.monthlySummary ?? "-"}</p>
          </div>
          <span className="text-[10px] bg-emerald-400/30 text-emerald-200 font-bold px-2 py-1 rounded-full">IN</span>
        </div>
      </div>

      <div className="px-4 -mt-3 space-y-4 pb-4">
        {/* Status Cards */}
        <div className="grid grid-cols-2 gap-3">
          {statusCards.map((c) => (
            <Card key={c.label} className="p-3">
              <div className={`w-8 h-8 rounded-xl ${c.bg} flex items-center justify-center mb-2`}>
                <c.icon size={15} className={c.color} />
              </div>
              <p className="text-[11px] font-medium text-slate-500">{c.label}</p>
              <p className="text-base font-bold text-slate-900 mt-0.5">{c.value}</p>
              <p className={`text-[10px] font-medium mt-0.5 ${c.color}`}>{c.trend}</p>
            </Card>
          ))}
        </div>

        {/* Attendance Summary */}
        <Card className="p-4">
          <SectionHeader title="Attendance Summary" />
          <div className="space-y-2">
            {[
              { label: "Overall Attendance", value: `${attendanceSummary.overallAttendance ?? attendanceRate}%` },
              { label: "Department Attendance", value: `${attendanceSummary.departmentAttendance ?? 0}%` },
              { label: "Hostel Attendance", value: `${attendanceSummary.hostelAttendance ?? 0}%` },
              { label: "Daily Summary", value: attendanceSummary.dailySummary ?? "No data" },
              { label: "Monthly Summary", value: attendanceSummary.monthlySummary ?? "No data" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <span className="text-[11px] font-medium text-slate-600">{item.label}</span>
                <span className="text-[11px] font-semibold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-4">
          <SectionHeader title="Quick Actions" />
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((a) => (
              <button key={a.label} onClick={() => onNavigate(a.screen)} className="flex flex-col items-center gap-2">
                <div className={`w-12 h-12 rounded-2xl ${a.color} flex items-center justify-center`}>
                  <a.icon size={20} />
                </div>
                <span className="text-[10px] font-semibold text-slate-600 text-center leading-tight whitespace-pre-line">{a.label}</span>
              </button>
            ))}
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="p-4">
          <SectionHeader title="Recent Activity" action="View All" onAction={() => onNavigate("movement")} />
          <div className="space-y-3">
            {movementData.slice(0, 3).map((m) => (
              <div key={m.date} className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                  <Clock size={13} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800">{m.date}</p>
                  <p className="text-[11px] text-slate-500">Exit {m.exit} · Entry {m.entry}</p>
                </div>
                <StatusBadge status={m.status} />
              </div>
            ))}
          </div>
        </Card>

        {/* Explore */}
        <Card className="p-4">
          <SectionHeader title="Explore" />
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "Notices", icon: Megaphone, screen: "notices" as Screen, color: "text-indigo-600 bg-indigo-50" },
              { label: "Events", icon: Camera, screen: "events" as Screen, color: "text-pink-600 bg-pink-50" },
              { label: "Initiatives", icon: Lightbulb, screen: "initiatives" as Screen, color: "text-yellow-600 bg-yellow-50" },
              { label: "Emergency", icon: Shield, screen: "emergency" as Screen, color: "text-red-600 bg-red-50" },
            ].map((item) => (
              <button
                key={item.label}
                onClick={() => onNavigate(item.screen)}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <div className={`w-8 h-8 rounded-lg ${item.color.split(" ")[1]} flex items-center justify-center`}>
                  <item.icon size={14} className={item.color.split(" ")[0]} />
                </div>
                <span className="text-xs font-semibold text-slate-700">{item.label}</span>
              </button>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── Screen: Profile ──────────────────────────────────────────────────────────
const ProfileScreen = ({ onBack, profile }: { onBack: () => void; profile: Partial<typeof student> }) => {
  const docs = [
    { name: "Aadhaar Card", status: "verified" },
    { name: "College ID", status: "verified" },
    { name: "Admission Letter", status: "verified" },
    { name: "10th Marksheet", status: "verified" },
    { name: "12th Marksheet", status: "pending" },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <BackHeader title="My Profile" onBack={onBack} action={<button className="p-2 rounded-full hover:bg-blue-50"><Edit3 size={17} className="text-blue-600" /></button>} />
      <div className="pb-6">
        {/* Profile Hero */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-6 flex flex-col items-center">
          <div className="w-20 h-20 rounded-3xl bg-white/20 border-2 border-white/40 flex items-center justify-center mb-3">
            <span className="text-white font-bold text-2xl">{profile.name ? profile.name.split(' ').map((w) => w[0]).join('') : ""}</span>
          </div>
          <h2 className="text-white font-bold text-lg">{profile.name ?? ""}</h2>
          <p className="text-blue-200 text-xs mt-1">{profile.enrollment ?? ""}</p>
          <div className="flex gap-2 mt-3">
            <span className="bg-white/20 text-white text-[11px] font-semibold px-3 py-1 rounded-full">Room {profile.room ?? ""}</span>
            <span className="bg-white/20 text-white text-[11px] font-semibold px-3 py-1 rounded-full">{profile.floor ?? ""}</span>
          </div>
        </div>

        <div className="px-4 space-y-4 mt-4">
          {/* Personal Info */}
          <Card className="p-4">
            <SectionHeader title="Personal Information" />
            <div className="space-y-3">
              {[
                { label: "Date of Birth", value: profile.dob ?? "" },
                { label: "Blood Group", value: profile.bloodGroup ?? "", highlight: true },
                { label: "Mobile", value: profile.phone ?? "" },
                { label: "Email", value: profile.email ?? "" },
                { label: "City", value: profile.city ?? "" },
                { label: "State", value: profile.state ?? "" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-500">{r.label}</span>
                  <span className={`text-xs font-semibold ${r.highlight ? "text-red-600" : "text-slate-800"}`}>{r.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Academic Info */}
          <Card className="p-4">
            <SectionHeader title="Academic Information" />
            <div className="space-y-3">
              {[
                { label: "College", value: profile.college ?? "" },
                { label: "Branch", value: profile.branch ?? "" },
                { label: "Year", value: profile.year ?? "" },
                { label: "Hostel", value: profile.hostel ?? "" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-start py-1 border-b border-slate-50 last:border-0 gap-4">
                  <span className="text-xs text-slate-500 shrink-0">{r.label}</span>
                  <span className="text-xs font-semibold text-slate-800 text-right">{r.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Parent Info */}
          <Card className="p-4">
            <SectionHeader title="Parent / Guardian" />
            <div className="space-y-3">
              {[
                { label: "Name", value: profile.parentName ?? "" },
                { label: "Mobile", value: profile.parentPhone ?? "" },
                { label: "Email", value: profile.parentEmail ?? "" },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-center py-1 border-b border-slate-50 last:border-0">
                  <span className="text-xs text-slate-500">{r.label}</span>
                  <span className="text-xs font-semibold text-slate-800">{r.value}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Documents */}
          <Card className="p-4">
            <SectionHeader title="Documents" action="Upload" />
            <div className="space-y-2">
              {docs.map((d) => (
                <div key={d.name} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <FileText size={14} className="text-slate-500" />
                    <span className="text-xs font-medium text-slate-700">{d.name}</span>
                  </div>
                  {d.status === "verified"
                    ? <CheckCircle size={14} className="text-emerald-500" />
                    : <span className="text-[10px] bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">Pending</span>}
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// ─── Screen: Attendance ───────────────────────────────────────────────────────
const AttendanceScreen = ({ onBack, onNavigate, studentId }: { onBack: () => void; onNavigate: (s: Screen) => void; studentId?: string }) => {
  const queryClient = useQueryClient();
  const attendanceQuery = useQuery({
    queryKey: ["student-attendance-screen", studentId],
    queryFn: async () => {
      if (!studentId) {
        return {
          stats: { present: 0, absent: 0, leave: 0, percentage: 0, todayStatus: "No Record", lastUpdated: "-" },
          monthly: [] as AttendanceChartPoint[],
          daily: [],
        };
      }

      const summary = await authService.getAttendanceSummary();
      const payload = summary?.data ?? summary ?? {};
      const dailyEntries = Array.isArray(payload?.daily) ? payload.daily : [];
      const normalized = dailyEntries.map((entry: any) => ({
        date: entry?.date ?? entry?.createdAt ?? entry?.updatedAt,
        present: Number(entry?.present ?? 0),
        absent: Number(entry?.absent ?? 0),
        leave: Number(entry?.onLeave ?? entry?.on_leave ?? entry?.leave ?? 0),
      }));
      const present = normalized.reduce((sum: number, entry: any) => sum + Number(entry.present ?? 0), 0);
      const absent = normalized.reduce((sum: number, entry: any) => sum + Number(entry.absent ?? 0), 0);
      const leave = normalized.reduce((sum: number, entry: any) => sum + Number(entry.leave ?? 0), 0);
      const total = present + absent + leave;
      const percentage = total > 0 ? Math.round((present / total) * 100) : 0;
      const latestEntry = normalized[normalized.length - 1];
      const todayStatus = latestEntry
        ? latestEntry.present > 0
          ? "Present"
          : latestEntry.absent > 0
            ? "Absent"
            : latestEntry.leave > 0
              ? "Leave"
              : "No Record"
        : "No Record";
      const lastUpdated = latestEntry?.date
        ? new Date(latestEntry.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "-";

      return {
        stats: { present, absent, leave, percentage, todayStatus, lastUpdated },
        monthly: normalized.length ? [{ month: "Last 7 Days", present, absent, leave }] : [],
        daily: dailyEntries,
      };
    },
    enabled: Boolean(studentId),
    staleTime: 30_000,
  });

  const markAttendanceMutation = useMutation({
    mutationFn: async (status: "PRESENT" | "ABSENT" | "ON_LEAVE") => {
      await authService.markAttendance({ studentId, status, remarks: "" });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["student-attendance-screen", studentId] });
      await queryClient.invalidateQueries({ queryKey: ["student-attendance-summary"] });
    },
  });

  const attendanceStats = attendanceQuery.data?.stats ?? { present: 0, absent: 0, leave: 0, percentage: 0, todayStatus: "No Record", lastUpdated: "-" };
  const monthlyAttendance = attendanceQuery.data?.monthly ?? [];
  const loadingAttendance = attendanceQuery.isLoading || attendanceQuery.isFetching;
  const submittingAttendance = markAttendanceMutation.isPending;

  const handleMarkAttendance = async (status: "PRESENT" | "ABSENT" | "ON_LEAVE") => {
    if (!studentId) return;
    await markAttendanceMutation.mutateAsync(status);
  };

  const calendarDays = React.useMemo(() => buildAttendanceCalendar(attendanceQuery.data?.daily ?? []), [attendanceQuery.data?.daily]);
  const calendarTitle = React.useMemo(() => {
    const now = new Date();
    return now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }, []);

  const summaryLabel = loadingAttendance ? "Loading..." : `${attendanceStats.present} Present · ${attendanceStats.absent} Absent · ${attendanceStats.leave} Leave`;

  return (
    <div className="flex-1 overflow-y-auto">
      <BackHeader title="Attendance" onBack={onBack} action={
        <button onClick={() => onNavigate("movement")} className="text-xs font-semibold text-blue-600">History</button>
      } />

      <div className="px-4 space-y-4 py-4 pb-6">
        {/* Donut stat */}
        <Card className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20">
              <svg viewBox="0 0 80 80" className="w-20 h-20 -rotate-90">
                <circle cx="40" cy="40" r="30" fill="none" stroke="#DBEAFE" strokeWidth="10" />
                <circle cx="40" cy="40" r="30" fill="none" stroke="#2563EB" strokeWidth="10"
                  strokeDasharray={`${2 * Math.PI * 30 * (attendanceStats.percentage / 100)} ${2 * Math.PI * 30}`} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">{loadingAttendance ? "--" : `${attendanceStats.percentage}%`}</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-base font-bold text-slate-900">Overall Attendance</h3>
              <p className="text-xs text-slate-500 mt-0.5">{summaryLabel}</p>
              <div className="flex gap-3 mt-2">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-600" /><span className="text-[11px] text-slate-600">Present</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-100" /><span className="text-[11px] text-slate-600">Absent</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-100" /><span className="text-[11px] text-slate-600">Leave</span></div>
              </div>
            </div>
          </div>
          <div className="mt-3 p-2.5 bg-amber-50 rounded-xl border border-amber-100">
            <p className="text-[11px] text-amber-700 font-medium">⚠️ Minimum 85% attendance required. {attendanceStats.percentage >= 85 ? "You are meeting the minimum." : "You are below the minimum."}</p>
          </div>
        </Card>

        {/* Today status */}
        <Card className="p-4">
          <SectionHeader title="Today" />
          <div className="flex gap-3">
            <div className="flex-1 p-3 bg-emerald-50 rounded-xl text-center">
              <CheckCircle size={16} className="text-emerald-600 mx-auto mb-1" />
              <p className="text-[10px] text-slate-500">Today's Status</p>
              <p className="text-sm font-bold text-emerald-700">{loadingAttendance ? "Loading..." : attendanceStats.todayStatus}</p>
            </div>
            <div className="flex-1 p-3 bg-orange-50 rounded-xl text-center">
              <Calendar size={16} className="text-orange-600 mx-auto mb-1" />
              <p className="text-[10px] text-slate-500">Last Updated</p>
              <p className="text-sm font-bold text-orange-700">{loadingAttendance ? "Loading..." : attendanceStats.lastUpdated}</p>
            </div>
            <div className="flex-1 p-3 bg-blue-50 rounded-xl text-center">
              <Clock size={16} className="text-blue-600 mx-auto mb-1" />
              <p className="text-[10px] text-slate-500">Attendance %</p>
              <p className="text-sm font-bold text-blue-700">{loadingAttendance ? "--" : `${attendanceStats.percentage}%`}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            {[
              { label: "Present", status: "PRESENT", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
              { label: "Absent", status: "ABSENT", className: "bg-rose-50 text-rose-700 border-rose-200" },
              { label: "Leave", status: "ON_LEAVE", className: "bg-amber-50 text-amber-700 border-amber-200" },
            ].map((item) => (
              <button
                key={item.status}
                onClick={() => handleMarkAttendance(item.status as "PRESENT" | "ABSENT" | "ON_LEAVE")}
                disabled={submittingAttendance}
                className={`flex-1 rounded-xl border px-2 py-2 text-[11px] font-semibold ${item.className} ${submittingAttendance ? "opacity-70" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Card>

        {/* Monthly Chart */}
        <Card className="p-4">
          <SectionHeader title="Monthly Attendance (2025)" />
          <ResponsiveContainer width="100%" height={140}>
            <BarChart data={monthlyAttendance.length ? monthlyAttendance : [{ month: "No Data", present: 0, absent: 0, leave: 0 }]} barSize={10} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94A3B8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey="present" fill="#2563EB" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" fill="#DBEAFE" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Calendar */}
        <Card className="p-4">
          <SectionHeader title={`${calendarTitle} Calendar`} />
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["S","M","T","W","T","F","S"].map((d, i) => (
              <div key={i} className="text-center text-[10px] font-bold text-slate-400">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {[...Array(6)].map((_, i) => <div key={`e${i}`} />)}
            {calendarDays.map(({ day, status }) => (
              <div key={day} className={`aspect-square rounded-lg flex items-center justify-center text-[11px] font-semibold
                ${status === "present" ? "bg-blue-100 text-blue-700" : status === "absent" ? "bg-red-100 text-red-600" : status === "leave" ? "bg-amber-100 text-amber-700" : "bg-slate-50 text-slate-300"}`}>
                {day}
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 justify-center">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-blue-100 rounded" /><span className="text-[11px] text-slate-600">Present</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-red-100 rounded" /><span className="text-[11px] text-slate-600">Absent</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-100 rounded" /><span className="text-[11px] text-slate-600">Leave</span></div>
          </div>
        </Card>

        {/* Rules */}
        <Card className="p-4">
          <SectionHeader title="Attendance Rules" />
          <div className="space-y-2">
            {[
              "Minimum 85% monthly attendance is mandatory",
              "Below 75% results in disciplinary action",
              "Curfew time: 10:00 PM on weekdays, 11:00 PM weekends",
              "Late entry after curfew incurs ₹200 fine per instance",
            ].map((rule, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="w-5 h-5 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-[9px] font-bold text-blue-600">{i + 1}</span>
                </div>
                <p className="text-xs text-slate-600">{rule}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── Screen: Movement History ─────────────────────────────────────────────────
const MovementScreen = ({ onBack }: { onBack: () => void }) => {
  const [search, setSearch] = useState("");
  return (
    <div className="flex-1 overflow-y-auto">
      <BackHeader title="Movement History" onBack={onBack} />
      <div className="px-4 py-4 space-y-3 pb-6">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by date..."
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Movement API not available in current backend module set; remove mock data */}
        <Card className="p-6 text-center text-slate-600">
          Movement history is not available right now.
        </Card>
      </div>
    </div>
  );
};

// ─── Screen: Leave Request ────────────────────────────────────────────────────
const LeaveRequestScreen = ({ onBack, onNavigate, onSubmit, leaveBalanceValue }: { onBack: () => void; onNavigate: (s: Screen) => void; onSubmit: (request: { reason: string; startDate: string; endDate: string; destination: string; contact: string; details: string }) => Promise<void>; leaveBalanceValue: number }) => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [form, setForm] = useState({ reason: "Home Visit", startDate: "", endDate: "", destination: "", contact: "", details: "" });
  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Validation
  const reasonValid = form.reason.trim() !== "";
  const startDateValid = form.startDate.trim() !== "";
  const endDateValid = form.endDate.trim() !== "";
  const destinationValid = form.destination.trim() !== "";
  const contactValid = /^\d{10}$/.test(form.contact.replace(/\D/g, ""));
  const dateOrderValid = !startDateValid || !endDateValid || form.endDate >= form.startDate;
  const isFormValid = reasonValid && startDateValid && endDateValid && destinationValid && contactValid && dateOrderValid;

  const reasonError = form.reason.trim() === "" ? "Reason is required" : "";
  const startDateError = form.startDate.trim() === "" ? "Start date is required" : "";
  const endDateError = form.endDate.trim() === "" ? "End date is required" : !dateOrderValid ? "End date must be >= start date" : "";
  const destinationError = form.destination.trim() === "" ? "Destination is required" : "";
  const contactError = form.contact.trim() === "" ? "Emergency contact is required" : !/^\d{10}$/.test(form.contact.replace(/\D/g, "")) ? "Contact must be 10 digits" : "";

  const submitRequest = async () => {
    if (!isFormValid || submitting) return;
    setSubmitError("");
    setSubmitting(true);
    try {
      await onSubmit(form);
      setSubmitted(true);
    } catch (error: unknown) {
      setSubmitError(
        error instanceof Error ? error.message : "Unable to submit leave request. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <div className="flex-1 flex flex-col">
      <BackHeader title="Apply Leave" onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mb-4">
          <CheckCircle size={36} className="text-emerald-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Leave Request Submitted!</h2>
        <p className="text-sm text-slate-500 mb-6">Your request has been submitted and is pending warden approval. You will be notified once processed.</p>
        <PrimaryBtn label="View Leave History" onClick={() => onNavigate("leave-history")} />
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <BackHeader title="Apply Leave" onBack={onBack} action={
        <button onClick={() => onNavigate("leave-history")} className="text-xs font-semibold text-blue-600">History</button>
      } />
      <div className="px-4 py-4 space-y-4 pb-6">
        <Card className="p-3 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
            <Calendar size={18} className="text-emerald-600" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Available Leave Balance</p>
              <p className="text-base font-bold text-slate-900">{leaveBalanceValue} days remaining</p>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Reason for Leave *</label>
            <select value={form.reason} onChange={(e) => set("reason")(e.target.value)} className={`w-full bg-slate-50 border-2 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${!reasonValid ? "border-red-400" : "border-slate-200"}`}>
              <option>Home Visit</option>
              <option>Medical Emergency</option>
              <option>Family Function</option>
              <option>Academic Purpose</option>
              <option>Personal Work</option>
            </select>
            {reasonError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{reasonError}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Start Date *</label>
              <input type="date" value={form.startDate} onChange={(e) => set("startDate")(e.target.value)} className={`w-full bg-slate-50 border-2 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${!startDateValid ? "border-red-400" : "border-slate-200"}`} />
              {startDateError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{startDateError}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">End Date *</label>
              <input type="date" value={form.endDate} onChange={(e) => set("endDate")(e.target.value)} className={`w-full bg-slate-50 border-2 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${!endDateValid || !dateOrderValid ? "border-red-400" : "border-slate-200"}`} />
              {(endDateError || !dateOrderValid) && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{endDateError || "End date must be >= start date"}</p>}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Destination Address *</label>
            <div className="relative">
              <MapPin size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={form.destination} onChange={(e) => set("destination")(e.target.value)} placeholder="Enter your destination" className={`w-full bg-slate-50 border-2 rounded-xl px-3 py-3 pl-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${!destinationValid ? "border-red-400" : "border-slate-200"}`} />
            </div>
            {destinationError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{destinationError}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Emergency Contact *</label>
            <div className="relative">
              <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="tel" value={form.contact} onChange={(e) => set("contact")(e.target.value)} placeholder="+91 XXXXX XXXXX" className={`w-full bg-slate-50 border-2 rounded-xl px-3 py-3 pl-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${contactError ? "border-red-400" : "border-slate-200"}`} />
            </div>
            {contactError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{contactError}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Additional Details</label>
            <textarea rows={3} value={form.details} onChange={(e) => set("details")(e.target.value)} placeholder="Any additional information..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center gap-3 mb-4">
            <Upload size={16} className="text-slate-400" />
            <div>
              <p className="text-xs font-semibold text-slate-600">Supporting Document</p>
              <p className="text-[11px] text-slate-400">Medical certificate, invitation, etc.</p>
            </div>
          </div>
          <PrimaryBtn label={submitting ? "Submitting..." : "Submit Leave Request"} onClick={submitRequest} icon={<Send size={16} />} disabled={!isFormValid || submitting} />
          {submitError && <p className="text-xs text-red-500 mt-3">{submitError}</p>}
        </Card>
      </div>
    </div>
  );
};

// ─── Screen: Leave History ────────────────────────────────────────────────────
const LeaveHistoryScreen = ({ onBack, leaveRequests }: { onBack: () => void; leaveRequests: any[] }) => {
  const [filter, setFilter] = useState("all");
  const filters = ["all", "approved", "pending", "rejected"];
  const filtered = filter === "all" ? leaveRequests : leaveRequests.filter(l => l.status === filter);
  return (
    <div className="flex-1 overflow-y-auto">
      <BackHeader title="Leave History" onBack={onBack} />
      <div className="px-4 py-4 space-y-3 pb-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {filters.map(f => (
            <button key={f} onClick={() => setFilter(f)} className={`shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full transition-colors
              ${filter === f ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <Card className="p-6 text-center text-slate-600">No Leave Requests</Card>
        ) : (
          filtered.map((l) => (
            <Card key={l.id} className="p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs font-bold text-slate-800">{l.id} · {l.reason}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{l.start} – {l.end}</p>
                </div>
                <StatusBadge status={l.status} />
              </div>
              <div className="border-t border-slate-50 pt-2 mt-2 space-y-1">
                <div className="flex justify-between"><span className="text-[11px] text-slate-400">Applied</span><span className="text-[11px] font-medium text-slate-700">{l.applied}</span></div>
                <div className="flex justify-between"><span className="text-[11px] text-slate-400">Approved By</span><span className="text-[11px] font-medium text-slate-700">{l.approvedBy}</span></div>
                <div className="flex justify-between"><span className="text-[11px] text-slate-400">Action Time</span><span className="text-[11px] font-medium text-slate-700">{l.approvedAt}</span></div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

// ─── Screen: Curfew Extension ─────────────────────────────────────────────────
const CurfewScreen = ({ onBack }: { onBack: () => void }) => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ date: "", time: "", reason: "" });
  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  // Validation
  const dateValid = form.date.trim() !== "";
  const timeValid = form.time.trim() !== "";
  const reasonValid = form.reason.trim() !== "";
  const isFormValid = dateValid && timeValid && reasonValid;

  const dateError = form.date.trim() === "" ? "Date is required" : "";
  const timeError = form.time.trim() === "" ? "Return time is required" : "";
  const reasonError = form.reason.trim() === "" ? "Reason is required" : "";
  return (
    <div className="flex-1 overflow-y-auto">
      <BackHeader title="Curfew Extension" onBack={onBack} />
      <div className="px-4 py-4 space-y-4 pb-6">
        <Card className="p-4">
          <SectionHeader title="Curfew" />
          <p className="text-sm text-slate-500">Curfew extension and curfew rules are not available in the current backend module set.</p>
        </Card>

        <Card className="p-4">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Request Extension</h3>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Requested Return Time *</label>
            <input type="time" value={form.time} onChange={(e) => set("time")(e.target.value)} className={`w-full bg-slate-50 border-2 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${!timeValid ? "border-red-400" : "border-slate-200"}`} />
            {timeError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{timeError}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Date *</label>
            <input type="date" value={form.date} onChange={(e) => set("date")(e.target.value)} className={`w-full bg-slate-50 border-2 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${!dateValid ? "border-red-400" : "border-slate-200"}`} />
            {dateError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{dateError}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Reason *</label>
            <textarea rows={3} value={form.reason} onChange={(e) => set("reason")(e.target.value)} placeholder="Explain why you need an extension..." className={`w-full bg-slate-50 border-2 rounded-xl px-3 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition-colors ${!reasonValid ? "border-red-400" : "border-slate-200"}`} />
            {reasonError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{reasonError}</p>}
          </div>

          {submitted ? (
            <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
              <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
              <h3 className="font-bold text-slate-900 mb-1">Request Recorded</h3>
              <p className="text-xs text-slate-500">Backend curfew workflow is not wired yet; this is a local confirmation only.</p>
            </div>
          ) : (
            <PrimaryBtn label="Submit Request" onClick={() => setSubmitted(true)} disabled={!isFormValid} />
          )}
        </Card>

        <Card className="p-4">
          <SectionHeader title="Past Requests" />
          <p className="text-sm text-slate-500">No historical curfew requests available right now.</p>
        </Card>
      </div>
    </div>
  );
};

// ─── Screen: Fees ─────────────────────────────────────────────────────────────
const FeesScreen = ({ onBack, studentId }: { onBack: () => void; studentId?: string }) => {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const formatCurrency = (value: number) => value.toLocaleString("en-IN");
  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    return new Date(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  const getRecordStatus = (record: FeeRecord) => {
    const amount = Number(record.amount ?? 0);
    const paidAmount = Number(record.paidAmount ?? 0);
    if (amount <= 0) return "paid";
    if (paidAmount >= amount) return "paid";
    if (paidAmount > 0) return "partial";
    return "pending";
  };

  const uniqueFeeRecords = (records: FeeRecord[]) => {
    const seen = new Set<string>();
    return records.filter((record) => {
      if (!record?.id || seen.has(record.id)) return false;
      seen.add(record.id);
      return true;
    });
  };

  const feeQuery = useQuery({
    queryKey: ["student-fees", studentId],
    queryFn: async () => {
      if (!studentId) return [] as FeeRecord[];
      const [details, history] = await Promise.all([getFeeDetails(studentId), getPaymentHistory(studentId)]);
      return uniqueFeeRecords([...details, ...history]);
    },
    enabled: Boolean(studentId),
    staleTime: 30_000,
  });

  const feeRecords = feeQuery.data ?? [];
  const loading = feeQuery.isLoading;
  const feeError = feeQuery.isError ? "Unable to load fee details right now." : error;

  const total = feeRecords.reduce((sum, record) => sum + Number(record.amount ?? 0), 0);
  const paid = feeRecords.reduce((sum, record) => sum + Number(record.paidAmount ?? 0), 0);
  const pending = Math.max(total - paid, 0);
  const pct = total > 0 ? Math.round((paid / total) * 100) : 0;
  const pendingRecords = feeRecords.filter((record) => Number(record.paidAmount ?? 0) < Number(record.amount ?? 0));
  const dueRecord = pendingRecords[0] ?? feeRecords[0];
  const dueAmount = dueRecord ? Math.max(Number(dueRecord.amount ?? 0) - Number(dueRecord.paidAmount ?? 0), 0) : 0;
  const paymentTimeline = [...feeRecords].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());

  const handlePayNow = async () => {
    if (!studentId || !dueRecord || dueAmount <= 0) return;

    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      await payFee({
        feeRecordId: dueRecord.id,
        amount: dueAmount,
        method: "ONLINE",
        receiptNumber: `RCPT-${Date.now()}`,
        transactionId: `TXN-${Date.now()}`,
        notes: "Paid from student portal",
      });

      await queryClient.invalidateQueries({ queryKey: ["student-fees", studentId] });
      setSuccess("Payment submitted successfully.");
    } catch {
      setError("Payment could not be completed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      <BackHeader title="Fee Dashboard" onBack={onBack} action={
        <button className="p-2 rounded-full hover:bg-blue-50"><Download size={16} className="text-blue-600" /></button>
      } />
      <div className="px-4 py-4 space-y-4 pb-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-4 text-white">
          <p className="text-blue-200 text-xs font-medium mb-1">Total Hostel Fee 2024–25</p>
          <p className="text-2xl font-bold">₹{formatCurrency(total)}</p>
          <div className="mt-3 bg-white/20 rounded-full h-2">
            <div className="bg-white rounded-full h-2 transition-all" style={{ width: `${pct}%` }} />
          </div>
          <div className="flex justify-between mt-2">
            <p className="text-blue-200 text-xs">Paid: <span className="text-white font-bold">₹{formatCurrency(paid)}</span></p>
            <p className="text-blue-200 text-xs">Due: <span className="text-amber-300 font-bold">₹{formatCurrency(pending)}</span></p>
          </div>
        </div>

        <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
          <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-amber-800">{pending > 0 ? `Payment Due: ₹${formatCurrency(pending)}` : "All fees are up to date"}</p>
            <p className="text-[11px] text-amber-600">{pending > 0 ? `Due by ${formatDate(dueRecord?.dueDate)}` : "No outstanding balance for the current period."}</p>
          </div>
        </div>

        <Card className="p-4">
          <SectionHeader title="Payment Timeline" />
          {loading ? (
            <p className="text-sm text-slate-500">Loading fee records...</p>
          ) : feeRecords.length === 0 ? (
            <p className="text-sm text-slate-500">No fee records available.</p>
          ) : (
            <div className="space-y-3">
              {paymentTimeline.map((record) => {
                const status = getRecordStatus(record);
                const amount = Number(record.amount ?? 0);
                const paidAmount = Number(record.paidAmount ?? 0);
                return (
                  <div key={record.id} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${status === "paid" ? "bg-emerald-100" : status === "partial" ? "bg-amber-100" : "bg-red-100"}`}>
                      {status === "paid" ? <CheckCircle size={14} className="text-emerald-600" /> : <Clock size={14} className="text-amber-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-slate-800">{record.description || `Fee ${record.month || ""}`.trim()}</p>
                      <p className="text-[11px] text-slate-500">Due: {formatDate(record.dueDate)}</p>
                      {status === "partial" && (
                        <p className="text-[11px] text-amber-600 font-medium">Paid ₹{formatCurrency(paidAmount)} of ₹{formatCurrency(amount)}</p>
                      )}
                    </div>
                    <StatusBadge status={status} />
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {feeError ? <p className="text-sm text-red-500">{feeError}</p> : null}
        {success ? <p className="text-sm text-emerald-600">{success}</p> : null}

        <PrimaryBtn
          label={submitting ? "Processing..." : pending > 0 ? `Pay Now · ₹${formatCurrency(dueAmount)}` : "All Fees Paid"}
          icon={<CreditCard size={16} />}
          onClick={handlePayNow}
          disabled={submitting || !studentId || !dueRecord || dueAmount <= 0}
        />

        <button className="w-full flex items-center justify-center gap-2 py-3 border border-blue-200 rounded-2xl text-blue-600 font-semibold text-sm">
          <Download size={16} />Download All Receipts
        </button>
      </div>
    </div>
  );
};

// ─── Screen: Fines & Rewards ──────────────────────────────────────────────────
const FinesScreen = ({ onBack }: { onBack: () => void }) => {
  const [tab, setTab] = useState<"fines" | "rewards">("fines");
  const items = tab === "fines" ? fines.filter(f => !f.isReward) : fines.filter(f => f.isReward);
  return (
    <div className="flex-1 overflow-y-auto">
      <BackHeader title="Fines & Rewards" onBack={onBack} />
      <div className="px-4 py-4 space-y-3 pb-6">
        <div className="flex bg-slate-100 rounded-2xl p-1">
          {(["fines", "rewards"] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${tab === t ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}>
              {t === "fines" ? "⚡ Fines" : "🏆 Rewards"}
            </button>
          ))}
        </div>

        {tab === "fines" && (
          <Card className="p-3 flex items-center gap-3 bg-red-50 border-red-100">
            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center"><AlertCircle size={18} className="text-red-600" /></div>
            <div>
              <p className="text-xs text-slate-500">Total Pending Fines</p>
              <p className="text-lg font-bold text-red-700">₹200</p>
            </div>
          </Card>
        )}

        {tab === "rewards" && (
          <Card className="p-3 flex items-center gap-3 bg-emerald-50 border-emerald-100">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center"><Trophy size={18} className="text-emerald-600" /></div>
            <div>
              <p className="text-xs text-slate-500">Total Reward Points</p>
              <p className="text-lg font-bold text-emerald-700">80 pts</p>
            </div>
          </Card>
        )}

        {items.map((item) => (
          <Card key={item.id} className="p-4">
            <div className="flex items-start justify-between mb-1">
              <p className="text-xs font-bold text-slate-800">{item.type}</p>
              {item.isReward
                ? <span className="text-xs font-bold text-emerald-600">+{item.points} pts</span>
                : <span className="text-xs font-bold text-red-600">₹{item.amount}</span>}
            </div>
            <p className="text-[11px] text-slate-500 mb-2">{item.reason}</p>
            <div className="flex items-center justify-between">
              <p className="text-[11px] text-slate-400">{item.date}</p>
              {!item.isReward && <StatusBadge status={(item as { status: string }).status} />}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── Screen: Maintenance Request ──────────────────────────────────────────────
const MaintenanceScreen = ({ onBack, onNavigate }: { onBack: () => void; onNavigate: (s: Screen) => void }) => {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const types = ["Plumbing", "Electrical", "Furniture", "Cleaning", "Network/WiFi", "AC/Fan", "Other"];
  const [selected, setSelected] = useState("Plumbing");
  const [priority, setPriority] = useState("High — Urgent Fix Required");
  const [form, setForm] = useState({ description: "" });
  
  // Validation
  const descriptionValid = form.description.trim().length >= 20;
  const isFormValid = descriptionValid;
  const descError = form.description.trim() === "" ? "Description is required" : form.description.trim().length < 20 ? "Minimum 20 characters required" : "";

  const handleSubmitComplaint = async () => {
    if (!isFormValid || submitting) return;

    setSubmitting(true);
    try {
      const priorityValue = priority.includes("High") ? 1 : priority.includes("Low") ? 3 : 2;
      await apiClient.post("/v1/complaints", {
        category: "MAINTENANCE",
        subject: `${selected} issue`,
        description: form.description.trim(),
        priority: priorityValue,
      });
      setSubmitted(true);
    } catch {
      toast.error("Couldn't submit your complaint. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };
  if (submitted) return (
    <div className="flex-1 flex flex-col">
      <BackHeader title="Raise Complaint" onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mb-4">
          <CheckCircle size={36} className="text-emerald-500" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Complaint Raised!</h2>
        <p className="text-sm text-slate-500 mb-2">ID: <strong>CM-0051</strong></p>
        <p className="text-sm text-slate-500 mb-6">A technician will be assigned within 24 hours. Track your complaint status anytime.</p>
        <PrimaryBtn label="Track Complaint" onClick={() => onNavigate("complaints")} />
      </div>
    </div>
  );
  return (
    <div className="flex-1 overflow-y-auto">
      <BackHeader title="Raise Complaint" onBack={onBack} action={
        <button onClick={() => onNavigate("complaints")} className="text-xs font-semibold text-blue-600">Track</button>
      } />
      <div className="px-4 py-4 space-y-4 pb-6">
        <Card className="p-4">
          <h3 className="text-sm font-bold text-slate-800 mb-4">Complaint Details</h3>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-2">Complaint Type *</label>
            <div className="flex flex-wrap gap-2">
              {types.map(t => (
                <button key={t} onClick={() => setSelected(t)} className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors
                  ${selected === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200"}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Priority *</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              <option>High — Urgent Fix Required</option>
              <option>Medium — Fix Within 2 Days</option>
              <option>Low — Scheduled Maintenance</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description * (Minimum 20 characters)</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm({ description: e.target.value })} placeholder="Describe the issue in detail..." className={`w-full bg-slate-50 border-2 rounded-xl px-3 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none transition-colors ${!descriptionValid ? "border-red-400" : "border-slate-200"}`} />
            {descError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{descError}</p>}
          </div>
          <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-300 flex items-center justify-center gap-3">
            <Camera size={18} className="text-slate-400" />
            <div>
              <p className="text-xs font-semibold text-slate-600">Add Photo Evidence</p>
              <p className="text-[11px] text-slate-400">Tap to upload photo (optional)</p>
            </div>
          </div>
          <PrimaryBtn label={submitting ? "Submitting..." : "Submit Complaint"} onClick={handleSubmitComplaint} icon={<Send size={16} />} disabled={!isFormValid || submitting} />
        </Card>
      </div>
    </div>
  );
};

// ─── Screen: Complaint Tracking ───────────────────────────────────────────────
const ComplaintsScreen = ({ onBack, complaints }: { onBack: () => void; complaints: typeof complaints }) => (
  <div className="flex-1 overflow-y-auto">
    <BackHeader title="My Complaints" onBack={onBack} />
    <div className="px-4 py-4 space-y-4 pb-6">
      {complaints.map((c) => (
        <Card key={c.id} className="p-4">
          <div className="flex items-start justify-between mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-blue-600">{c.id}</span>
                <StatusBadge status={c.priority} />
              </div>
              <p className="text-xs font-bold text-slate-800 mt-1">{c.type} Issue</p>
            </div>
            <StatusBadge status={c.status} />
          </div>
          <p className="text-[11px] text-slate-500 mb-3">{c.desc}</p>

          {/* Timeline */}
          <div className="space-y-2 border-l-2 border-blue-100 pl-3 ml-1">
            <div className="relative">
              <div className="absolute -left-4 top-0.5 w-2 h-2 bg-blue-600 rounded-full" />
              <p className="text-[10px] text-slate-400">{c.created}</p>
              <p className="text-[11px] font-medium text-slate-700">Complaint submitted</p>
            </div>
            <div className="relative">
              <div className="absolute -left-4 top-0.5 w-2 h-2 bg-blue-400 rounded-full" />
              <p className="text-[10px] text-slate-400">{c.updated}</p>
              <p className="text-[11px] font-medium text-slate-700">Assigned to {c.assignedTo}</p>
            </div>
            {c.status === "resolved" && (
              <div className="relative">
                <div className="absolute -left-4 top-0.5 w-2 h-2 bg-emerald-500 rounded-full" />
                <p className="text-[10px] text-slate-400">Resolved</p>
                <p className="text-[11px] font-medium text-emerald-700">Issue resolved successfully</p>
              </div>
            )}
          </div>

          <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between">
            <p className="text-[11px] text-slate-400">ETA: {c.eta}</p>
            {c.status !== "resolved" && (
              <button className="text-[11px] font-semibold text-blue-600">Add Remark</button>
            )}
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// ─── Screen: Laundry Dashboard ────────────────────────────────────────────────
const LaundryDashboardScreen = ({ onBack, onNavigate, laundryHistory }: { onBack: () => void; onNavigate: (s: Screen) => void; laundryHistory: Array<{ id: string; items: string; status: string; submitted: string }> }) => {
  const stageCounts = laundryHistory.reduce(
    (acc, item) => {
      const status = String(item.status || "pending").toLowerCase();
      if (["pending", "submitted", "requested"].includes(status)) acc.pending += 1;
      else if (["washing", "drying", "processing", "in-progress", "in_progress"].includes(status)) acc.processing += 1;
      else if (["ready"].includes(status)) acc.ready += 1;
      else if (["delivered", "collected"].includes(status)) acc.delivered += 1;
      return acc;
    },
    { pending: 0, processing: 0, ready: 0, delivered: 0 },
  );

  const readyPickup = laundryHistory.find((item) => ["ready", "delivered", "collected"].includes(String(item.status || "").toLowerCase()));
  const stages = [
    { label: "Pending", count: stageCounts.pending, icon: Package, color: "bg-slate-100 text-slate-500" },
    { label: "Processing", count: stageCounts.processing, icon: RefreshCw, color: "bg-blue-100 text-blue-600" },
    { label: "Ready", count: stageCounts.ready, icon: CheckCircle, color: "bg-purple-100 text-purple-600" },
    { label: "Delivered", count: stageCounts.delivered, icon: ThumbsUp, color: "bg-emerald-100 text-emerald-600" },
  ];
  return (
    <div className="flex-1 overflow-y-auto">
      <BackHeader title="Laundry" onBack={onBack} action={
        <button onClick={() => onNavigate("laundry-request")} className="bg-blue-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
          <Plus size={12} />New
        </button>
      } />
      <div className="px-4 py-4 space-y-4 pb-6">
        {/* Stage cards */}
        <div className="grid grid-cols-2 gap-3">
          {stages.map((s) => (
            <Card key={s.label} className="p-3">
              <div className={`w-9 h-9 rounded-xl ${s.color} flex items-center justify-center mb-2`}>
                <s.icon size={16} />
              </div>
              <p className="text-2xl font-bold text-slate-900">{s.count}</p>
              <p className="text-[11px] text-slate-500">{s.label}</p>
            </Card>
          ))}
        </div>

        {/* Ready for pickup alert */}
        {readyPickup ? (
          <div className="p-3 bg-purple-50 border border-purple-100 rounded-2xl flex items-start gap-3">
            <CheckCircle size={18} className="text-purple-600 shrink-0" />
            <div className="flex-1">
              <p className="text-xs font-bold text-purple-800">{readyPickup.id} is ready for pickup!</p>
              <p className="text-[11px] text-purple-600">{readyPickup.items} · Room delivery available</p>
            </div>
          </div>
        ) : null}

        {/* History */}
        <Card className="p-4">
          <SectionHeader title="Recent Orders" />
          <div className="space-y-3">
            {laundryHistory.map((l) => (
              <div key={l.id} className="flex items-center gap-3 p-2.5 bg-slate-50 rounded-xl">
                <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                  <Shirt size={14} className="text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-bold text-slate-800">{l.id}</p>
                    <StatusBadge status={l.status} />
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">{l.items}</p>
                  <p className="text-[10px] text-slate-400">Submitted: {l.submitted}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── Screen: Laundry Request ──────────────────────────────────────────────────
const LaundryRequestScreen = ({ onBack }: { onBack: () => void }) => {
  const queryClient = useQueryClient();
  const cats = [
    { name: "Shirts", icon: "👕" }, { name: "Pants", icon: "👖" },
    { name: "Bedsheets", icon: "🛏️" }, { name: "Blankets", icon: "🧣" },
    { name: "Towels", icon: "🏖️" }, { name: "Others", icon: "👔" },
  ];
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [slot, setSlot] = useState("2–4 PM");
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  
  // Validation
  const itemsValid = total > 0;
  const slotValid = slot.trim() !== "";
  const isFormValid = itemsValid && slotValid;

  const handleSubmit = async () => {
    if (!isFormValid || submitting) return;
    setSubmitting(true);
    try {
      const items = Object.entries(counts)
        .filter(([, qty]) => Number(qty) > 0)
        .map(([name, qty]) => ({ name, qty }));

      await apiClient.post("/v1/laundry", { items, notes: `Pickup slot: ${slot}` });
      await queryClient.invalidateQueries({ queryKey: ["student-laundry"] });
      setSubmitted(true);
      toast.success("Laundry request submitted successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit laundry request.";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) return (
    <div className="flex-1 flex flex-col">
      <BackHeader title="Laundry Request" onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mb-4">
          <Shirt size={36} className="text-blue-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Request Submitted!</h2>
        <p className="text-sm text-slate-500 mb-6">LN-090 · {total} items. Pickup scheduled for today between 2–4 PM.</p>
        <PrimaryBtn label="Track My Laundry" onClick={() => setSubmitted(false)} />
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto">
      <BackHeader title="New Laundry Request" onBack={onBack} />
      <div className="px-4 py-4 space-y-4 pb-6">
        <Card className="p-4">
          <SectionHeader title="Select Items" />
          <div className="space-y-3">
            {cats.map((c) => (
              <div key={c.name} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{c.icon}</span>
                  <span className="text-sm font-medium text-slate-700">{c.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <button onClick={() => setCounts(p => ({ ...p, [c.name]: Math.max(0, (p[c.name] || 0) - 1) }))}
                    className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-lg leading-none">−</button>
                  <span className="w-5 text-center text-sm font-bold text-slate-900">{counts[c.name] || 0}</span>
                  <button onClick={() => setCounts(p => ({ ...p, [c.name]: (p[c.name] || 0) + 1 }))}
                    className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg leading-none">+</button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <SectionHeader title="Pickup Time *" />
          <div className="grid grid-cols-3 gap-2">
            {["8–10 AM", "12–2 PM", "2–4 PM", "4–6 PM", "6–8 PM", "On Demand"].map((t) => (
              <button key={t} onClick={() => setSlot(t)} className={`text-xs font-semibold py-2 px-1 rounded-xl border transition-colors text-center ${slot === t ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-600 border-slate-200"}`}>
                {t}
              </button>
            ))}
          </div>
        </Card>

        <Card className={`p-3 flex items-center justify-between border-2 transition-colors ${!itemsValid ? "border-red-400 bg-red-50" : "border-slate-200"}`}>
          <div>
            <p className="text-xs text-slate-500">Total items selected</p>
            <p className="text-base font-bold text-slate-900">{total} items</p>
          </div>
          {!itemsValid && <p className="text-xs text-red-500 flex items-center gap-1"><AlertCircle size={12} />At least 1 item required</p>}
        </Card>

        <PrimaryBtn label={submitting ? "Submitting..." : `Submit Request · ${total} items`} onClick={handleSubmit} disabled={!isFormValid || submitting} />
      </div>
    </div>
  );
};

// ─── Screen: Visitor Request ──────────────────────────────────────────────────
const VisitorScreen = ({ onBack }: { onBack: () => void }) => {
  const initialVisitorHistory = [
    { name: "Ramesh Sharma (Father)", date: "10 Jun 2025", time: "11:00 AM", status: "approved" },
    { name: "Neha Sharma (Sister)", date: "20 May 2025", time: "3:00 PM", status: "approved" },
  ];

  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [visitorHistory, setVisitorHistory] = useState(initialVisitorHistory);
  const [form, setForm] = useState({ name: "", relation: "Parent / Guardian", purpose: "", date: "", time: "" });
  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!isFormValid) {
      setSubmitError("Please complete all required fields.");
      return;
    }

    setSubmitting(true);
    setSubmitError("");

    try {
      const expectedDate = new Date(`${form.date}T${form.time}:00`).toISOString();
      const createdVisitor = await createVisitorRequest({
        visitorName: form.name.trim(),
        visitorPhone: "0000000000",
        relation: form.relation.trim(),
        purpose: form.purpose.trim(),
        expectedDate,
        expectedDuration: 60,
      });

      const visitDate = new Date(createdVisitor.expectedDate || expectedDate);
      const formattedVisitor = {
        name: `${createdVisitor.visitorName} (${createdVisitor.relation || form.relation})`,
        date: visitDate.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
        time: visitDate.toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }),
        status: (createdVisitor.status || "pending").toLowerCase(),
      };

      setVisitorHistory((prev) => [formattedVisitor, ...prev]);
      setForm({ name: "", relation: "Parent / Guardian", purpose: "", date: "", time: "" });
      setSubmitted(true);
      toast.success("Visitor request submitted successfully.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to submit visitor request.";
      setSubmitError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Validation
  const nameValid = form.name.trim() !== "";
  const relationValid = form.relation.trim() !== "";
  const purposeValid = form.purpose.trim() !== "";
  const dateValid = form.date.trim() !== "";
  const timeValid = form.time.trim() !== "";
  const isFormValid = nameValid && relationValid && purposeValid && dateValid && timeValid;

  const nameError = form.name.trim() === "" ? "Visitor name is required" : "";
  const relationError = form.relation.trim() === "" ? "Relation is required" : "";
  const purposeError = form.purpose.trim() === "" ? "Purpose is required" : "";
  const dateError = form.date.trim() === "" ? "Visit date is required" : "";
  const timeError = form.time.trim() === "" ? "Visit time is required" : "";
  return (
    <div className="flex-1 overflow-y-auto">
      <BackHeader title="Visitor Request" onBack={onBack} />
      <div className="px-4 py-4 space-y-4 pb-6">
        {submitted ? (
          <Card className="p-6 text-center">
            <CheckCircle size={40} className="text-emerald-500 mx-auto mb-3" />
            <h3 className="font-bold text-slate-900 mb-1">Request Submitted</h3>
            <p className="text-xs text-slate-500">VR-012 · Visitor pass will be sent to gate after warden approval.</p>
          </Card>
        ) : (
          <Card className="p-4">
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Visitor Name *</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input type="text" value={form.name} onChange={(e) => set("name")(e.target.value)} placeholder="Full name of visitor" className={`w-full bg-slate-50 border-2 rounded-xl px-3 py-3 pl-10 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${!nameValid ? "border-red-400" : "border-slate-200"}`} />
              </div>
              {nameError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{nameError}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Relation *</label>
              <select value={form.relation} onChange={(e) => set("relation")(e.target.value)} className={`w-full bg-slate-50 border-2 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${!relationValid ? "border-red-400" : "border-slate-200"}`}>
                <option>Parent / Guardian</option>
                <option>Sibling</option>
                <option>Relative</option>
                <option>Friend</option>
                <option>Other</option>
              </select>
              {relationError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{relationError}</p>}
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Purpose of Visit *</label>
              <input type="text" value={form.purpose} onChange={(e) => set("purpose")(e.target.value)} placeholder="Reason for the visit" className={`w-full bg-slate-50 border-2 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${!purposeValid ? "border-red-400" : "border-slate-200"}`} />
              {purposeError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{purposeError}</p>}
            </div>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Visit Date *</label>
                <input type="date" value={form.date} onChange={(e) => set("date")(e.target.value)} className={`w-full bg-slate-50 border-2 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${!dateValid ? "border-red-400" : "border-slate-200"}`} />
                {dateError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{dateError}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5">Visit Time *</label>
                <input type="time" value={form.time} onChange={(e) => set("time")(e.target.value)} className={`w-full bg-slate-50 border-2 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-colors ${!timeValid ? "border-red-400" : "border-slate-200"}`} />
                {timeError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{timeError}</p>}
              </div>
            </div>
            <PrimaryBtn label="Submit Request" onClick={handleSubmit} icon={<Send size={16} />} disabled={!isFormValid || submitting} />
            {submitError && <p className="text-xs text-red-500 mt-2 flex items-center gap-1"><AlertCircle size={12} />{submitError}</p>}
          </Card>
        )}

        <Card className="p-4">
          <SectionHeader title="Recent Visitor Requests" />
          <div className="space-y-2">
            {visitorHistory.map((v, i) => (
              <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <div>
                  <p className="text-xs font-semibold text-slate-700">{v.name}</p>
                  <p className="text-[11px] text-slate-400">{v.date} · {v.time}</p>
                </div>
                <StatusBadge status={v.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// ─── Screen: Mess Menu ────────────────────────────────────────────────────────
const MessScreen = ({ onBack }: { onBack: () => void }) => {
  const meals = [
    { name: "Breakfast", time: "7:30 – 9:00 AM", items: ["Poha / Upma", "Boiled Eggs (2)", "Bread & Butter", "Milk / Tea", "Seasonal Fruit"], icon: Coffee, color: "bg-amber-50 text-amber-600 border-amber-100" },
    { name: "Lunch", time: "12:30 – 2:00 PM", items: ["Dal Tadka", "Mix Veg Sabzi", "Steamed Rice", "2 Roti", "Salad & Pickle", "Buttermilk"], icon: Utensils, color: "bg-blue-50 text-blue-600 border-blue-100" },
    { name: "Dinner", time: "7:30 – 9:00 PM", items: ["Paneer Butter Masala", "Dal Fry", "Jeera Rice", "3 Roti", "Raita", "Sweet: Gulab Jamun"], icon: Star, color: "bg-purple-50 text-purple-600 border-purple-100" },
  ];
  return (
    <div className="flex-1 overflow-y-auto">
      <BackHeader title="Today's Mess Menu" onBack={onBack} />
      <div className="px-4 py-4 space-y-4 pb-6">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-600">Monday · 20 June 2025</p>
          <span className="bg-emerald-100 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full">Veg Day</span>
        </div>
        {meals.map((m) => (
          <Card key={m.name} className="p-4">
            <div className={`flex items-center gap-3 mb-3 p-2.5 rounded-xl border ${m.color}`}>
              <m.icon size={16} />
              <div>
                <p className="text-xs font-bold">{m.name}</p>
                <p className="text-[10px] opacity-70">{m.time}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {m.items.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  <p className="text-xs text-slate-700">{item}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
        <Card className="p-4 bg-gradient-to-r from-orange-50 to-amber-50 border-orange-100">
          <div className="flex items-center gap-2 mb-2">
            <Star size={14} className="text-orange-500" />
            <p className="text-xs font-bold text-orange-800">Special Weekend Meal</p>
          </div>
          <p className="text-[11px] text-orange-600">Sunday special: Chole Bhature + Kheer. Available 12–2 PM only.</p>
        </Card>
      </div>
    </div>
  );
};

// ─── Screen: Notices ──────────────────────────────────────────────────────────
const NoticesScreen = ({ onBack }: { onBack: () => void }) => (
  <div className="flex-1 overflow-y-auto">
    <BackHeader title="Notice Board" onBack={onBack} />
    <div className="px-4 py-4 space-y-3 pb-6">
      {notices.map((n) => (
        <Card key={n.id} className={`p-4 ${n.urgent ? "border-red-200 bg-red-50" : ""}`}>
          {n.type === "pinned" && (
            <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">📌 Pinned</span>
          )}
          {n.urgent && (
            <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">🚨 Emergency</span>
          )}
          {n.type === "announcement" && (
            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">📢 Announcement</span>
          )}
          <h3 className={`text-sm font-bold mt-2 mb-1 ${n.urgent ? "text-red-800" : "text-slate-900"}`}>{n.title}</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">{n.body}</p>
          <p className="text-[10px] text-slate-400 mt-2">{n.date}</p>
        </Card>
      ))}
    </div>
  </div>
);

// ─── Screen: Events ───────────────────────────────────────────────────────────
const EventsScreen = ({ onBack }: { onBack: () => void }) => (
  <div className="flex-1 overflow-y-auto">
    <BackHeader title="Events & Gallery" onBack={onBack} />
    <div className="px-4 py-4 space-y-4 pb-6">
      {events.map((e) => (
        <Card key={e.id} className="overflow-hidden">
          <div className="relative">
            <img src={e.img} alt={e.title} className="w-full h-40 object-cover bg-blue-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-3 left-3 text-white">
              <p className="text-sm font-bold">{e.title}</p>
              <p className="text-[11px] text-white/80">{e.date} · {e.venue}</p>
            </div>
          </div>
          <div className="p-4">
            <p className="text-[11px] text-slate-600 mb-2 leading-relaxed">{e.desc}</p>
            <p className="text-[11px] text-blue-600 font-medium mb-3">{e.guests}</p>
            <div className="flex gap-2">
              <button className="flex-1 bg-blue-600 text-white text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5">
                <Heart size={12} />Interested
              </button>
              <button className="flex-1 border border-slate-200 text-slate-600 text-xs font-bold py-2 rounded-xl flex items-center justify-center gap-1.5">
                <Send size={12} />Share
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  </div>
);

// ─── Screen: Initiatives ──────────────────────────────────────────────────────
const InitiativesScreen = ({ onBack }: { onBack: () => void }) => {
  const typeColors: Record<string, string> = {
    startup: "bg-indigo-100 text-indigo-700",
    research: "bg-emerald-100 text-emerald-700",
    club: "bg-pink-100 text-pink-700",
    sports: "bg-amber-100 text-amber-700",
  };
  return (
    <div className="flex-1 overflow-y-auto">
      <BackHeader title="Initiatives Portal" onBack={onBack} />
      <div className="px-4 py-4 space-y-3 pb-6">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {["All", "Startup", "Research", "Club", "Sports", "Hackathon"].map(f => (
            <button key={f} className={`shrink-0 text-xs font-semibold px-4 py-1.5 rounded-full transition-colors ${f === "All" ? "bg-blue-600 text-white" : "bg-white border border-slate-200 text-slate-600"}`}>{f}</button>
          ))}
        </div>
        {initiatives.map((init) => (
          <Card key={init.id} className="p-4">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-2xl shrink-0">{init.icon}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-0.5">
                  <h3 className="text-sm font-bold text-slate-900">{init.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${typeColors[init.type]}`}>{init.type}</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">{init.desc}</p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-slate-50 pt-3">
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-slate-500"><Users size={11} className="inline mr-1" />{init.members} members</span>
                <span className="text-[11px] text-slate-500"><Heart size={11} className="inline mr-1" />{init.interested} interested</span>
              </div>
              <button className="bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full">Join</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── Screen: Feedback ─────────────────────────────────────────────────────────
const FeedbackScreen = ({ onBack }: { onBack: () => void }) => {
  const [rating, setRating] = useState(0);
  const [anon, setAnon] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  // Validation
  const ratingValid = rating > 0;
  const isFormValid = ratingValid;
  const ratingError = rating === 0 ? "Please select a rating" : "";
  if (submitted) return (
    <div className="flex-1 flex flex-col">
      <BackHeader title="Feedback" onBack={onBack} />
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
        <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mb-4">
          <ThumbsUp size={36} className="text-blue-600" />
        </div>
        <h2 className="text-lg font-bold text-slate-900 mb-2">Thank You!</h2>
        <p className="text-sm text-slate-500">Your feedback helps us improve. We appreciate you taking the time.</p>
      </div>
    </div>
  );
  return (
    <div className="flex-1 overflow-y-auto">
      <BackHeader title="Give Feedback" onBack={onBack} />
      <div className="px-4 py-4 space-y-4 pb-6">
        <Card className="p-4">
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Category *</label>
            <select className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400">
              <option>Hostel Facilities</option>
              <option>Mess Food Quality</option>
              <option>Maintenance Services</option>
              <option>Laundry Services</option>
              <option>Security & Safety</option>
              <option>Staff Behaviour</option>
              <option>General</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-2">Rating *</label>
            <div className={`flex gap-2 pb-2 border-b-2 transition-colors ${!ratingValid ? "border-red-400" : "border-slate-200"}`}>
              {[1, 2, 3, 4, 5].map(s => (
                <button key={s} onClick={() => setRating(s)} className="text-2xl transition-transform active:scale-110">
                  {s <= rating ? "⭐" : "☆"}
                </button>
              ))}
              {rating > 0 && <span className="text-xs text-slate-500 self-end ml-1">{["", "Poor", "Fair", "Good", "Very Good", "Excellent"][rating]}</span>}
            </div>
            {ratingError && <p className="text-xs text-red-500 mt-1 flex items-center gap-1"><AlertCircle size={12} />{ratingError}</p>}
          </div>
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Comment</label>
            <textarea rows={4} placeholder="Share your experience..." className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" />
          </div>
          <button onClick={() => setAnon(!anon)} className="flex items-center gap-3 w-full mb-4 p-3 bg-slate-50 rounded-xl">
            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${anon ? "bg-blue-600 border-blue-600" : "border-slate-300"}`}>
              {anon && <CheckCircle size={12} className="text-white" />}
            </div>
            <span className="text-xs font-medium text-slate-700">Submit Anonymously</span>
          </button>
          <PrimaryBtn label="Submit Feedback" onClick={() => setSubmitted(true)} icon={<Send size={16} />} disabled={!isFormValid} />
        </Card>
      </div>
    </div>
  );
};

// ─── Screen: Notifications ────────────────────────────────────────────────────
const NotificationsScreen = ({ onBack, notifications, onMarkAllRead }: { onBack: () => void; notifications: NotificationItem[]; onMarkAllRead?: () => void }) => {
  const iconMap: Record<string, React.ReactNode> = {
    attendance: <Activity size={14} className="text-blue-600" />,
    laundry: <Shirt size={14} className="text-purple-600" />,
    fee: <CreditCard size={14} className="text-amber-600" />,
    complaint: <Wrench size={14} className="text-orange-600" />,
    leave: <Calendar size={14} className="text-emerald-600" />,
  };
  const bgMap: Record<string, string> = {
    attendance: "bg-blue-100", laundry: "bg-purple-100",
    fee: "bg-amber-100", complaint: "bg-orange-100", leave: "bg-emerald-100",
  };
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-blue-50 flex items-center justify-between px-4 h-14">
        <h1 className="text-base font-bold text-slate-900">Notifications</h1>
        <button onClick={onMarkAllRead} className="text-xs font-semibold text-blue-600">Mark all read</button>
      </div>
      <div className="px-4 py-3 pb-6 space-y-2">
        {notifications.map((n) => (
          <div key={n.id} className={`flex items-start gap-3 p-3.5 rounded-2xl border transition-colors ${n.read ? "bg-white border-slate-100" : "bg-blue-50/50 border-blue-100"}`}>
            <div className={`w-8 h-8 ${bgMap[n.type]} rounded-xl flex items-center justify-center shrink-0`}>
              {iconMap[n.type]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className={`text-xs font-bold ${n.read ? "text-slate-700" : "text-slate-900"}`}>{n.title}</p>
                {!n.read && <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />}
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">{n.body}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Screen: Emergency Contacts ───────────────────────────────────────────────
const EmergencyScreen = ({ onBack }: { onBack: () => void }) => {
  const contacts = [
    { name: "Warden (Mr. Rakesh Verma)", role: "Hostel Warden", phone: "+91 94012 34567", icon: Building, color: "bg-blue-100 text-blue-700" },
    { name: "Hostel Admin Office", role: "Administration", phone: "+91 755 267 1234", icon: FileText, color: "bg-indigo-100 text-indigo-700" },
    { name: "Campus Medical Centre", role: "Doctor on Duty", phone: "+91 755 267 2000", icon: Heart, color: "bg-red-100 text-red-700" },
    { name: "Fire Station", role: "Emergency", phone: "101", icon: Flame, color: "bg-orange-100 text-orange-700" },
    { name: "Police Control Room", role: "Law Enforcement", phone: "100", icon: Shield, color: "bg-slate-100 text-slate-700" },
    { name: "Ambulance", role: "Medical Emergency", phone: "108", icon: Zap, color: "bg-emerald-100 text-emerald-700" },
  ];
  return (
    <div className="flex-1 overflow-y-auto">
      <BackHeader title="Emergency Contacts" onBack={onBack} />
      <div className="px-4 py-4 space-y-3 pb-6">
        <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2">
          <AlertCircle size={16} className="text-red-600 shrink-0" />
          <p className="text-[11px] text-red-700 font-medium">In life-threatening emergencies, call 112 (National Emergency) immediately.</p>
        </div>
        {contacts.map((c) => (
          <Card key={c.name} className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-2xl ${c.color} flex items-center justify-center shrink-0`}>
                <c.icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-800 truncate">{c.name}</p>
                <p className="text-[11px] text-slate-500">{c.role}</p>
                <p className="text-xs font-bold text-blue-600 mt-0.5">{c.phone}</p>
              </div>
              <a href={`tel:${c.phone}`} className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                <Phone size={16} className="text-white" />
              </a>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

// ─── Screen: Settings ─────────────────────────────────────────────────────────
const SettingsScreen = ({ onNavigate, profile }: { onNavigate: (s: Screen) => void; profile: Partial<typeof student> }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [biometric, setBiometric] = useState(true);

  const groups = [
    {
      title: "Account",
      items: [
        { label: "My Profile", icon: User, action: () => onNavigate("profile"), chevron: true },
        { label: "Emergency Contacts", icon: Phone, action: () => onNavigate("emergency"), chevron: true },
        { label: "Documents", icon: FileText, action: () => {}, chevron: true },
      ],
    },
    {
      title: "Preferences",
      items: [
        { label: "Push Notifications", icon: Bell, toggle: true, value: notifications, onChange: setNotifications },
        { label: "Dark Mode", icon: Eye, toggle: true, value: darkMode, onChange: setDarkMode },
        { label: "Biometric Login", icon: Shield, toggle: true, value: biometric, onChange: setBiometric },
      ],
    },
    {
      title: "Support",
      items: [
        { label: "Give Feedback", icon: MessageSquare, action: () => onNavigate("feedback"), chevron: true },
        { label: "Help & FAQ", icon: Info, action: () => {}, chevron: true },
        { label: "About HostelPaglu", icon: BookOpen, action: () => {}, chevron: true },
      ],
    },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-blue-50 flex items-center px-4 h-14">
        <h1 className="text-base font-bold text-slate-900">Settings</h1>
      </div>

      <div className="px-4 py-4 pb-6 space-y-5">
        <button onClick={() => onNavigate("profile")} className="w-full">
          <Card className="p-4 flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
              <span className="text-blue-700 font-bold text-lg">
                {profile.name ? profile.name.split(" ").map((w) => w[0]).join("") : ""}
              </span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-bold text-slate-900">{profile.name ?? ""}</p>
              <p className="text-xs text-slate-500">{profile.enrollment ?? ""}</p>
              <p className="text-xs text-blue-600 font-medium mt-0.5">
                {profile.room ? `Room ${profile.room}` : ""}
                {profile.hostel ? ` · ${profile.hostel}` : ""}
              </p>
            </div>
          </Card>
        </button>

        {groups.map((g) => (
          <div key={g.title}>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">{g.title}</p>
            <Card className="divide-y divide-slate-50">
              {g.items.map((item: any, i) => (
                <div key={i} className="flex items-center gap-3 p-4" onClick={item.action}>
                  <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center">
                    <item.icon size={15} className="text-slate-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-800 flex-1">{item.label}</span>
                  {item.toggle ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); item.onChange(!item.value); }}
                      className={`w-11 h-6 rounded-full transition-colors relative ${item.value ? "bg-blue-600" : "bg-slate-200"}`}
                    >
                      <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all shadow ${item.value ? "left-6" : "left-1"}`} />
                    </button>
                  ) : (
                    <ChevronRight size={16} className="text-slate-400" />
                  )}
                </div>
              ))}
            </Card>
          </div>
        ))}

        <button className="w-full p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center gap-2 text-red-600 font-semibold text-sm">
          <LogOut size={16} />Sign Out
        </button>

        <p className="text-center text-[11px] text-slate-400">HostelPaglu v2.4.1 · NIT Bhopal</p>
      </div>
    </div>
  );
};

// ─── More Menu ────────────────────────────────────────────────────────────────
const MoreMenuScreen = ({ onNavigate }: { onNavigate: (s: Screen) => void }) => {
  const items = [
    { label: "Movement History", icon: Clock, screen: "movement" as Screen, color: "bg-blue-100 text-blue-700" },
    { label: "Leave History", icon: Calendar, screen: "leave-history" as Screen, color: "bg-emerald-100 text-emerald-700" },
    { label: "Curfew Extension", icon: Clock, screen: "curfew" as Screen, color: "bg-indigo-100 text-indigo-700" },
    { label: "Fines & Rewards", icon: Trophy, screen: "fines" as Screen, color: "bg-amber-100 text-amber-700" },
    { label: "Complaints", icon: Wrench, screen: "complaints" as Screen, color: "bg-orange-100 text-orange-700" },
    { label: "Visitor Request", icon: Users, screen: "visitor" as Screen, color: "bg-teal-100 text-teal-700" },
    { label: "Initiatives", icon: Lightbulb, screen: "initiatives" as Screen, color: "bg-yellow-100 text-yellow-700" },
    { label: "Events", icon: Camera, screen: "events" as Screen, color: "bg-pink-100 text-pink-700" },
    { label: "Emergency", icon: Shield, screen: "emergency" as Screen, color: "bg-red-100 text-red-700" },
    { label: "Feedback", icon: MessageSquare, screen: "feedback" as Screen, color: "bg-purple-100 text-purple-700" },
  ];
  return (
    <div className="flex-1 overflow-y-auto">
      <div className="sticky top-0 z-10 bg-white border-b border-blue-50 flex items-center px-4 h-14">
        <h1 className="text-base font-bold text-slate-900">More Services</h1>
      </div>
      <div className="px-4 py-4 pb-6">
        <div className="grid grid-cols-3 gap-3">
          {items.map((item) => (
            <button key={item.label} onClick={() => onNavigate(item.screen)} className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl border border-slate-100 shadow-sm">
              <div className={`w-11 h-11 rounded-2xl ${item.color} flex items-center justify-center`}>
                <item.icon size={19} />
              </div>
              <span className="text-[10px] font-semibold text-slate-700 text-center leading-tight">{item.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Root App ─────────────────────────────────────────────────────────────────

// ─── StudentPortal Export ─────────────────────────────────────────────────────
export default function StudentPortal({ onLogout }: StudentPortalProps) {
  const [screen, setScreen] = useState<Screen>("dashboard");
  const [history, setHistory] = useState<Screen[]>([]);
  const [profile, setProfile] = useState<Partial<typeof student>>({});
  const [attendanceRecords, setAttendanceRecords] = useState<typeof attendanceData>(attendanceData);
  const [attendanceSummary, setAttendanceSummary] = useState({ overallAttendance: 0, departmentAttendance: 0, hostelAttendance: 0, dailySummary: "No data", monthlySummary: "No data" });
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [complaintsData, setComplaintsData] = useState<any[]>([]);
  const [notificationsData, setNotificationsData] = useState<NotificationItem[]>([]);
  const [laundryHistoryData, setLaundryHistoryData] = useState<Array<{ id: string; items: string; status: string; submitted: string }>>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);

  const profileValue = profile;
  const totalAttendance = attendanceRecords.reduce((sum, item) => sum + item.present + item.absent, 0);
  const totalPresent = attendanceRecords.reduce((sum, item) => sum + item.present, 0);
  const attendanceRate = typeof attendanceSummary.overallAttendance === "number" && attendanceSummary.overallAttendance > 0 ? attendanceSummary.overallAttendance : (totalAttendance ? Math.round((totalPresent / totalAttendance) * 100) : 0);
  const complaintsOpen = complaintsData.filter((c) => c.status !== 'resolved').length;
  const leaveBalanceValue = profileValue.leaveBalance ?? Math.max(0, 8 - leaveRequests.filter((l) => l.status === 'pending').length);
  const unread = notificationsData.filter(n => !n.read).length;

  const normalizeLeave = (leave: any) => {
    const startDate = leave?.startDate ?? leave?.fromDate ?? leave?.start ?? '';
    const endDate = leave?.endDate ?? leave?.toDate ?? leave?.end ?? '';

    return {
      id: leave?.id ?? `LV-${String(Date.now()).slice(-6)}`,
      reason: leave?.reason ?? 'Leave request',
      start: startDate,
      end: endDate,
      applied: leave?.appliedAt ? new Date(leave.appliedAt).toLocaleDateString('en-GB') : leave?.createdAt ? new Date(leave.createdAt).toLocaleDateString('en-GB') : leave?.applied || '-',
      approvedBy: String(leave?.status || 'pending').toUpperCase() === 'PENDING' ? 'Pending' : 'Warden',
      approvedAt: leave?.approvedAt ? new Date(leave.approvedAt).toLocaleDateString('en-GB') : '-',
      status: String(leave?.status || 'pending').toLowerCase(),
    };
  };

  const normalizeComplaint = (item: any) => ({
    id: item.id,
    type: item.category ?? item.type,
    priority: item.priority === 1 ? 'high' : item.priority === 3 ? 'low' : 'medium',
    status: String(item.status ?? 'pending').toLowerCase(),
    desc: item.description || item.desc || '',
    created: item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : item.created || '',
    updated: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-GB') : item.updated || '',
    assignedTo: item.assignedTo || 'Support Team',
    eta: item.eta || 'TBD',
  });

  const normalizeNotification = (item: any): NotificationItem => ({
    id: item.id,
    type: item.type || 'attendance',
    title: item.title || item.subject || 'Notification',
    body: item.body || item.message || '',
    time: item.time || (item.createdAt ? new Date(item.createdAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''),
    read: typeof item.read === 'boolean' ? item.read : (typeof item.isRead === 'boolean' ? item.isRead : item.status === 'read'),
    createdAt: item.createdAt,
    isRead: typeof item.isRead === 'boolean' ? item.isRead : item.status === 'read',
  });

  const loadNotifications = async () => {
    try {
      const { data } = await apiClient.get("/v1/notifications");
      const payload = Array.isArray(data?.data) ? data.data : [];
      setNotificationsData((payload || []).map(normalizeNotification));
    } catch {
      setNotificationsData([]);
    }
  };

  const handleCreateNotification = async (payload: { title: string; body: string; type?: string }) => {
    const { data } = await apiClient.post("/v1/notifications", payload);
    const created = data?.data ?? data;
    setNotificationsData((prev) => [normalizeNotification(created), ...prev]);
    return created;
  };

  const handleMarkAllRead = async () => {
    const unreadItems = notificationsData.filter((n) => !n.read);
    if (!unreadItems.length) return;

    const updatedItems = await Promise.all(unreadItems.map((item) => apiClient.patch(`/v1/notifications/${item.id}/read`, {})));
    const updatedMap = new Map(updatedItems.map((item) => [item.id, item?.data?.data ?? item]));

    setNotificationsData((prev) => prev.map((item) => {
      const updated = updatedMap.get(item.id);
      if (!updated) return item;
      return { ...item, read: true, isRead: true };
    }));
  };

  const attendanceSummaryQuery = useQuery({
    queryKey: ["student-attendance-summary"],
    queryFn: async () => {
      const summary = await authService.getAttendanceSummary();
      const payload = summary?.data ?? summary ?? {};
      const chart = Array.isArray(payload?.daily)
        ? payload.daily.slice(-6).map((entry: any) => ({
            month: new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            present: Number(entry.present ?? 0),
            absent: Number(entry.absent ?? 0),
            leave: Number(entry.onLeave ?? entry.on_leave ?? entry.leave ?? 0),
          }))
        : [];

      const overallAttendance = Number(payload?.overallPercentage ?? payload?.monthly?.percentage ?? payload?.hostel?.percentage ?? 0);
      const presentTotal = Number(payload?.monthly?.present ?? 0);
      const absentTotal = Number(payload?.monthly?.absent ?? 0);
      const onLeaveTotal = Number(payload?.monthly?.onLeave ?? payload?.monthly?.on_leave ?? 0);

      return {
        overallAttendance,
        departmentAttendance: Number(payload?.department?.percentage ?? payload?.departmentAttendance ?? 0),
        hostelAttendance: Number(payload?.hostel?.percentage ?? payload?.hostelAttendance ?? 0),
        dailySummary: Array.isArray(payload?.daily) ? `${presentTotal} present · ${absentTotal} absent · ${onLeaveTotal} leave` : "No data",
        monthlySummary: overallAttendance ? `${overallAttendance}% attendance` : "No data",
        chart,
      };
    },
    staleTime: 30_000,
  });

  const profileQuery = useQuery({
    queryKey: ["student-profile"],
    queryFn: async () => {
      const { data } = await apiClient.get("/v1/auth/me");
      return normalizeProfile(data?.data ?? data ?? {});
    },
    staleTime: 60_000,
  });

  const leaveRequestsQuery = useQuery({
    queryKey: ["student-leaves"],
    queryFn: async () => {
      const { data } = await apiClient.get("/v1/leave/student");
      return Array.isArray(data?.data) ? data.data : [];
    },
    staleTime: 30_000,
  });

  const complaintsQuery = useQuery({
    queryKey: ["student-complaints"],
    queryFn: async () => {
      const { data } = await apiClient.get("/v1/complaints/my");
      return Array.isArray(data?.data) ? data.data : [];
    },
    staleTime: 30_000,
  });

  const notificationsQuery = useQuery({
    queryKey: ["student-notifications"],
    queryFn: async () => {
      const { data } = await apiClient.get("/v1/notifications");
      return Array.isArray(data?.data) ? data.data : [];
    },
    staleTime: 15_000,
  });

  const laundryQuery = useQuery({
    queryKey: ["student-laundry"],
    queryFn: async () => {
      const { data } = await apiClient.get("/v1/laundry");
      return Array.isArray(data?.data) ? data.data : [];
    },
    staleTime: 15_000,
  });

  useEffect(() => {
    if (attendanceSummaryQuery.data) {
      const data = attendanceSummaryQuery.data;
      setAttendanceSummary({
        overallAttendance: data.overallAttendance,
        departmentAttendance: data.departmentAttendance,
        hostelAttendance: data.hostelAttendance,
        dailySummary: data.dailySummary,
        monthlySummary: data.monthlySummary,
      });
      setAttendanceRecords(data.chart);
    }
  }, [attendanceSummaryQuery.data]);

  useEffect(() => {
    if (profileQuery.data) {
      setProfile(profileQuery.data);
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (leaveRequestsQuery.data) {
      setLeaveRequests(leaveRequestsQuery.data.map(normalizeLeave));
    }
  }, [leaveRequestsQuery.data]);

  useEffect(() => {
    if (complaintsQuery.data) {
      setComplaintsData(complaintsQuery.data.map(normalizeComplaint));
    }
  }, [complaintsQuery.data]);

  useEffect(() => {
    if (notificationsQuery.data) {
      setNotificationsData(notificationsQuery.data.map(normalizeNotification));
    }
  }, [notificationsQuery.data]);

  useEffect(() => {
    if (laundryQuery.data) {
      setLaundryHistoryData(
        laundryQuery.data.map((item: any) => ({
          id: item.id,
          items: item.items?.map((record: any) => record.name).join(", ") || item.notes || "Laundry request",
          status: String(item.status || "pending").toLowerCase(),
          submitted: item.createdAt ? new Date(item.createdAt).toLocaleDateString("en-GB") : "Today",
        })),
      );
    }
  }, [laundryQuery.data]);

  const navigateTo = (s: Screen) => {
    setHistory(h => [...h, screen]);
    setScreen(s);
  };

  const handleLeaveRequestSubmit = async (request: {
    reason: string;
    startDate: string;
    endDate: string;
    destination: string;
    contact: string;
    details: string;
  }) => {
    const leave = await api.post('/v1/leave', {
      type: 'HOME',
      startDate: request.startDate,
      endDate: request.endDate,
      reason: request.reason,
      destination: request.destination,
      contactNumber: request.contact,
    });

    const normalizedLeave = normalizeLeave(leave);
    const submittedDate = leave?.createdAt
      ? new Date(leave.createdAt).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        })
      : normalizedLeave.applied;

    const newRequest = {
      ...normalizedLeave,
      applied: submittedDate,
    };

    setLeaveRequests((prev) => [newRequest, ...prev]);
  };

  const goBack = () => {
    const prev = history[history.length - 1];
    if (prev) {
      setHistory(h => h.slice(0, -1));
      setScreen(prev);
    }
  };

  const navToTab = (s: Screen) => {
    setHistory([]);
    setScreen(s);
  };

  const renderScreen = () => {
    switch (screen) {
      case "dashboard": return <DashboardScreen onNavigate={navigateTo} profile={profile} attendanceRate={attendanceRate} attendanceRecords={attendanceRecords} leaveBalance={leaveBalanceValue} complaintsOpen={complaintsOpen} attendanceSummary={attendanceSummary} />;
      case "profile": return <ProfileScreen onBack={goBack} profile={profile} />;
      case "attendance": return <AttendanceScreen onBack={goBack} onNavigate={navigateTo} studentId={profile?.id} />;
      case "movement": return <MovementScreen onBack={goBack} />;
      case "leave-request": return <LeaveRequestScreen onBack={goBack} onNavigate={navigateTo} onSubmit={handleLeaveRequestSubmit} leaveBalanceValue={leaveBalanceValue} />;
      case "leave-history": return <LeaveHistoryScreen onBack={goBack} leaveRequests={leaveRequests} />;
      case "curfew": return <CurfewScreen onBack={goBack} />;
      case "fees": return <FeesScreen onBack={goBack} studentId={profile?.id} />;
      case "fines": return <FinesScreen onBack={goBack} />;
      case "maintenance": return <MaintenanceScreen onBack={goBack} onNavigate={navigateTo} />;
      case "complaints": return <ComplaintsScreen onBack={goBack} complaints={complaintsData} />;
      case "laundry-dashboard": return <LaundryDashboardScreen onBack={goBack} onNavigate={navigateTo} laundryHistory={laundryHistoryData} />;
      case "laundry-request": return <LaundryRequestScreen onBack={goBack} />;
      case "visitor": return <VisitorScreen onBack={goBack} />;
      case "mess": return <MessScreen onBack={goBack} />;
      case "notices": return <NoticesScreen onBack={goBack} />;
      case "events": return <EventsScreen onBack={goBack} />;
      case "initiatives": return <InitiativesScreen onBack={goBack} />;
      case "feedback": return <FeedbackScreen onBack={goBack} />;
      case "notifications": return <NotificationsScreen onBack={goBack} notifications={notificationsData} onMarkAllRead={handleMarkAllRead} />;
      case "emergency": return <EmergencyScreen onBack={goBack} />;
      case "settings": return <SettingsScreen onNavigate={navigateTo} profile={profile} />;
      default: return <DashboardScreen onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 flex items-center justify-center p-4">
      <div className="relative w-[390px] bg-[#F8FAFC] rounded-[44px] overflow-hidden shadow-2xl border-[6px] border-slate-800"
        style={{ height: "844px", fontFamily: "'Inter', system-ui, sans-serif" }}>
        <div className="bg-white flex items-center justify-between px-6 pt-3 pb-1.5 shrink-0">
          <span className="text-[11px] font-bold text-slate-900">9:41</span>
          <div className="w-28 h-6 bg-slate-900 rounded-full absolute left-1/2 -translate-x-1/2 top-1" />
          <div className="flex items-center gap-1">
            <div className="w-3.5 h-2 border border-slate-900 rounded-[2px] relative">
              <div className="absolute inset-0.5 bg-slate-900 rounded-[1px]" style={{ right: "25%" }} />
            </div>
          </div>
        </div>
        <div className="flex flex-col" style={{ height: "calc(100% - 44px)" }}>
          <div className="flex-1 overflow-hidden flex flex-col">
            {renderScreen()}
          </div>
          <BottomNav active={screen} onNavigate={navToTab} unread={unread} />
        </div>
      </div>
    </div>
  );
}
