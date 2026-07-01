// ─── HostelPaglu Route Configuration ─────────────────────────────────────────
// Handles all role-based routing and cross-project navigation.

import { createBrowserRouter } from "react-router-dom";
import RootLayout from "@/layouts/RootLayout";
import AuthFlow from "@/pages/auth/AuthFlow";
import StudentPortal from "@/pages/student/StudentPortal";
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
    element: <RootLayout />,
    children: [
      // ── Auth (P1 screens) ──────────────────────────────────────────
      { index: true, element: <AuthFlow onAuthComplete={() => {}} /> },
      { path: "auth", element: <AuthFlow onAuthComplete={() => {}} /> },

      // ── Student (P2 screens) ───────────────────────────────────────
      { path: "student", element: <StudentPortal onLogout={() => {}} /> },

      // ── Parent (P3 screens via react-router) ───────────────────────
      { path: "parent", element: <ParentDashboard /> },
      { path: "parent/attendance", element: <ParentAttendance /> },
      { path: "parent/movement-history", element: <ParentMovementHistory /> },
      { path: "parent/leave-tracking", element: <ParentLeaveTracking /> },
      { path: "parent/fees-tracking", element: <ParentFeesTracking /> },
      { path: "parent/fines-rewards", element: <ParentFinesRewards /> },
      { path: "parent/notifications", element: <ParentNotifications /> },
      { path: "parent/notice-board", element: <ParentNoticeBoard /> },
      { path: "parent/event-gallery", element: <ParentEventGallery /> },
      { path: "parent/student-overview", element: <ParentStudentOverview /> },
      { path: "parent/settings", element: <ParentSettings /> },

      // ── Warden (P3 screens via react-router) ──────────────────────
      { path: "warden", element: <WardenDashboard /> },
      { path: "warden/students", element: <WardenStudentManagement /> },
      { path: "warden/students/:id", element: <WardenStudentDetails /> },
      { path: "warden/parent-photo-view/:id", element: <WardenParentPhotoView /> },
      { path: "warden/face-enrollment/:id", element: <WardenFaceEnrollment /> },
      { path: "warden/attendance", element: <WardenAttendanceMonitoring /> },
      { path: "warden/movement", element: <WardenMovementMonitoring /> },
      { path: "warden/absentee", element: <WardenAbsenteeList /> },
      { path: "warden/curfew", element: <WardenCurfewManagement /> },
      { path: "warden/curfew-extensions", element: <WardenCurfewExtensions /> },
      { path: "warden/leave-approvals", element: <WardenLeaveApprovals /> },
      { path: "warden/rooms", element: <WardenRoomManagement /> },
      { path: "warden/floors", element: <WardenFloorManagement /> },
      { path: "warden/capacity", element: <WardenCapacityManagement /> },
      { path: "warden/complaints", element: <WardenComplaintManagement /> },
      { path: "warden/laundry", element: <WardenLaundryMonitoring /> },
      { path: "warden/visitors", element: <WardenVisitorApprovals /> },
      { path: "warden/fines", element: <WardenFineManagement /> },
      { path: "warden/rewards", element: <WardenRewardManagement /> },
      { path: "warden/notice-board", element: <WardenNoticeBoardManagement /> },
      { path: "warden/events", element: <WardenEventManagement /> },
      { path: "warden/initiatives", element: <WardenInitiativeModeration /> },
      { path: "warden/reports", element: <WardenReports /> },
      { path: "warden/notifications", element: <WardenNotifications /> },

      // ── Staff portals (P4 screens) ─────────────────────────────────
      { path: "superadmin", element: <StaffPortal role="superadmin" onLogout={() => {}} /> },
      { path: "admin", element: <StaffPortal role="admin" onLogout={() => {}} /> },
      { path: "trustee", element: <StaffPortal role="trustee" onLogout={() => {}} /> },
      { path: "accountant", element: <StaffPortal role="accountant" onLogout={() => {}} /> },
      { path: "laundry", element: <StaffPortal role="laundry" onLogout={() => {}} /> },
    ],
  },
]);
