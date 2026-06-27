// ─── WARDEN PORTAL ───────────────────────────────────────────────────────────
// Wraps P3 warden screens in a MemoryRouter so useNavigate works correctly.
// Route paths map to internal screen state.

import { MemoryRouter, Route, Routes, useNavigate } from "react-router";
import { WardenDashboard } from "./warden-dashboard";
import { WardenStudentManagement } from "./warden-student-management";
import { WardenStudentDetails } from "./warden-student-details";
import { WardenParentPhotoView } from "./warden-parent-photo-view";
import { WardenFaceEnrollment } from "./warden-face-enrollment";
import { WardenAttendanceMonitoring } from "./warden-attendance-monitoring";
import { WardenMovementMonitoring } from "./warden-movement-monitoring";
import { WardenAbsenteeList } from "./warden-absentee-list";
import { WardenCurfewManagement } from "./warden-curfew-management";
import { WardenCurfewExtensions } from "./warden-curfew-extensions";
import { WardenLeaveApprovals } from "./warden-leave-approvals";
import { WardenRoomManagement } from "./warden-room-management";
import { WardenFloorManagement } from "./warden-floor-management";
import { WardenCapacityManagement } from "./warden-capacity-management";
import { WardenComplaintManagement } from "./warden-complaint-management";
import { WardenLaundryMonitoring } from "./warden-laundry-monitoring";
import { WardenVisitorApprovals } from "./warden-visitor-approvals";
import { WardenFineManagement } from "./warden-fine-management";
import { WardenRewardManagement } from "./warden-reward-management";
import { WardenNoticeBoardManagement } from "./warden-noticeboard-management";
import { WardenEventManagement } from "./warden-event-management";
import { WardenInitiativeModeration } from "./warden-initiative-moderation";
import { WardenReports } from "./warden-reports";
import { WardenNotifications } from "./warden-notifications";

export interface WardenPortalProps {
  onLogout: () => void;
}

function LogoutButton({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="fixed top-4 right-4 z-[200]">
      <button
        onClick={() => { onLogout(); navigate("/warden"); }}
        className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-70 hover:opacity-100"
      >
        Logout
      </button>
    </div>
  );
}

export default function WardenPortal({ onLogout }: WardenPortalProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <MemoryRouter initialEntries={["/warden"]}>
        <LogoutButton onLogout={onLogout} />
        <Routes>
          <Route path="/warden" element={<WardenDashboard />} />
          <Route path="/warden/students" element={<WardenStudentManagement />} />
          <Route path="/warden/students/:id" element={<WardenStudentDetails />} />
          <Route path="/warden/parent-photo-view/:id" element={<WardenParentPhotoView />} />
          <Route path="/warden/face-enrollment/:id" element={<WardenFaceEnrollment />} />
          <Route path="/warden/attendance" element={<WardenAttendanceMonitoring />} />
          <Route path="/warden/movement" element={<WardenMovementMonitoring />} />
          <Route path="/warden/absentee" element={<WardenAbsenteeList />} />
          <Route path="/warden/curfew" element={<WardenCurfewManagement />} />
          <Route path="/warden/curfew-extensions" element={<WardenCurfewExtensions />} />
          <Route path="/warden/leave-approvals" element={<WardenLeaveApprovals />} />
          <Route path="/warden/rooms" element={<WardenRoomManagement />} />
          <Route path="/warden/floors" element={<WardenFloorManagement />} />
          <Route path="/warden/capacity" element={<WardenCapacityManagement />} />
          <Route path="/warden/complaints" element={<WardenComplaintManagement />} />
          <Route path="/warden/laundry" element={<WardenLaundryMonitoring />} />
          <Route path="/warden/visitors" element={<WardenVisitorApprovals />} />
          <Route path="/warden/fines" element={<WardenFineManagement />} />
          <Route path="/warden/rewards" element={<WardenRewardManagement />} />
          <Route path="/warden/notice-board" element={<WardenNoticeBoardManagement />} />
          <Route path="/warden/events" element={<WardenEventManagement />} />
          <Route path="/warden/initiatives" element={<WardenInitiativeModeration />} />
          <Route path="/warden/reports" element={<WardenReports />} />
          <Route path="/warden/notifications" element={<WardenNotifications />} />
        </Routes>
      </MemoryRouter>
    </div>
  );
}
