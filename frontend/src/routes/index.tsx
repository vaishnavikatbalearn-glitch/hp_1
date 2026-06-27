// ─── HostelPaglu Route Configuration ─────────────────────────────────────────
// Handles all role-based routing and cross-project navigation.

import { createBrowserRouter } from "react-router";
import RootLayout from "@/layouts/RootLayout";
import AuthFlow from "@/pages/auth/AuthFlow";
import StudentPortal from "@/pages/student/StudentPortal";
import ParentPortal from "@/pages/parent/ParentPortal";
import WardenPortal from "@/pages/warden/WardenPortal";
import StaffPortal from "@/pages/admin/StaffPortal";

// ─── Individual Parent screens (react-router routes from P3) ─────────────────
import { ParentDashboard } from "@/pages/parent/parent-dashboard";
import { ParentAttendance } from "@/pages/parent/parent-attendance";
import { ParentMovementHistory } from "@/pages/parent/parent-movement-history";
import { ParentLeaveTracking } from "@/pages/parent/parent-leave-tracking";
import { ParentFeesTracking } from "@/pages/parent/parent-fees-tracking";
import { ParentFinesRewards } from "@/pages/parent/parent-fines-rewards";
import { ParentNotifications } from "@/pages/parent/parent-notifications";
import { ParentNoticeBoard } from "@/pages/parent/parent-notice-board";
import { ParentEventGallery } from "@/pages/parent/parent-event-gallery";
import { ParentStudentOverview } from "@/pages/parent/parent-student-overview";
import { ParentSettings } from "@/pages/parent/parent-settings";

// ─── Individual Warden screens (react-router routes from P3) ─────────────────
import { WardenDashboard } from "@/pages/warden/warden-dashboard";
import { WardenStudentManagement } from "@/pages/warden/warden-student-management";
import { WardenStudentDetails } from "@/pages/warden/warden-student-details";
import { WardenParentPhotoView } from "@/pages/warden/warden-parent-photo-view";
import { WardenFaceEnrollment } from "@/pages/warden/warden-face-enrollment";
import { WardenAttendanceMonitoring } from "@/pages/warden/warden-attendance-monitoring";
import { WardenMovementMonitoring } from "@/pages/warden/warden-movement-monitoring";
import { WardenAbsenteeList } from "@/pages/warden/warden-absentee-list";
import { WardenCurfewManagement } from "@/pages/warden/warden-curfew-management";
import { WardenCurfewExtensions } from "@/pages/warden/warden-curfew-extensions";
import { WardenLeaveApprovals } from "@/pages/warden/warden-leave-approvals";
import { WardenRoomManagement } from "@/pages/warden/warden-room-management";
import { WardenFloorManagement } from "@/pages/warden/warden-floor-management";
import { WardenCapacityManagement } from "@/pages/warden/warden-capacity-management";
import { WardenComplaintManagement } from "@/pages/warden/warden-complaint-management";
import { WardenLaundryMonitoring } from "@/pages/warden/warden-laundry-monitoring";
import { WardenVisitorApprovals } from "@/pages/warden/warden-visitor-approvals";
import { WardenFineManagement } from "@/pages/warden/warden-fine-management";
import { WardenRewardManagement } from "@/pages/warden/warden-reward-management";
import { WardenNoticeBoardManagement } from "@/pages/warden/warden-noticeboard-management";
import { WardenEventManagement } from "@/pages/warden/warden-event-management";
import { WardenInitiativeModeration } from "@/pages/warden/warden-initiative-moderation";
import { WardenReports } from "@/pages/warden/warden-reports";
import { WardenNotifications } from "@/pages/warden/warden-notifications";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      // ── Auth (P1 screens) ──────────────────────────────────────────
      { index: true, element: <AuthFlow onAuthComplete={() => {}} /> },
      { path: "auth", element: <AuthFlow onAuthComplete={() => {}} /> },

      // ── Student (P2 screens) ───────────────────────────────────────
      { path: "student", element: <StudentPortal onLogout={() => {}} /> },

      // ── Parent (P3 screens via react-router) ───────────────────────
      { path: "parent", Component: ParentDashboard },
      { path: "parent/attendance", Component: ParentAttendance },
      { path: "parent/movement-history", Component: ParentMovementHistory },
      { path: "parent/leave-tracking", Component: ParentLeaveTracking },
      { path: "parent/fees-tracking", Component: ParentFeesTracking },
      { path: "parent/fines-rewards", Component: ParentFinesRewards },
      { path: "parent/notifications", Component: ParentNotifications },
      { path: "parent/notice-board", Component: ParentNoticeBoard },
      { path: "parent/event-gallery", Component: ParentEventGallery },
      { path: "parent/student-overview", Component: ParentStudentOverview },
      { path: "parent/settings", Component: ParentSettings },

      // ── Warden (P3 screens via react-router) ──────────────────────
      { path: "warden", Component: WardenDashboard },
      { path: "warden/students", Component: WardenStudentManagement },
      { path: "warden/students/:id", Component: WardenStudentDetails },
      { path: "warden/parent-photo-view/:id", Component: WardenParentPhotoView },
      { path: "warden/face-enrollment/:id", Component: WardenFaceEnrollment },
      { path: "warden/attendance", Component: WardenAttendanceMonitoring },
      { path: "warden/movement", Component: WardenMovementMonitoring },
      { path: "warden/absentee", Component: WardenAbsenteeList },
      { path: "warden/curfew", Component: WardenCurfewManagement },
      { path: "warden/curfew-extensions", Component: WardenCurfewExtensions },
      { path: "warden/leave-approvals", Component: WardenLeaveApprovals },
      { path: "warden/rooms", Component: WardenRoomManagement },
      { path: "warden/floors", Component: WardenFloorManagement },
      { path: "warden/capacity", Component: WardenCapacityManagement },
      { path: "warden/complaints", Component: WardenComplaintManagement },
      { path: "warden/laundry", Component: WardenLaundryMonitoring },
      { path: "warden/visitors", Component: WardenVisitorApprovals },
      { path: "warden/fines", Component: WardenFineManagement },
      { path: "warden/rewards", Component: WardenRewardManagement },
      { path: "warden/notice-board", Component: WardenNoticeBoardManagement },
      { path: "warden/events", Component: WardenEventManagement },
      { path: "warden/initiatives", Component: WardenInitiativeModeration },
      { path: "warden/reports", Component: WardenReports },
      { path: "warden/notifications", Component: WardenNotifications },

      // ── Staff portals (P4 screens) ─────────────────────────────────
      { path: "superadmin", element: <StaffPortal role="superadmin" onLogout={() => {}} /> },
      { path: "admin", element: <StaffPortal role="admin" onLogout={() => {}} /> },
      { path: "trustee", element: <StaffPortal role="trustee" onLogout={() => {}} /> },
      { path: "accountant", element: <StaffPortal role="accountant" onLogout={() => {}} /> },
      { path: "laundry", element: <StaffPortal role="laundry" onLogout={() => {}} /> },
    ],
  },
]);
