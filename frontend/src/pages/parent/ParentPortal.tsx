// ─── PARENT PORTAL ───────────────────────────────────────────────────────────
// Wraps P3 parent screens in a MemoryRouter so useNavigate works correctly.

import { MemoryRouter, Route, Routes, useNavigate } from "react-router";
import { ParentDashboard } from "./parent-dashboard";
import { ParentAttendance } from "./parent-attendance";
import { ParentMovementHistory } from "./parent-movement-history";
import { ParentLeaveTracking } from "./parent-leave-tracking";
import { ParentFeesTracking } from "./parent-fees-tracking";
import { ParentFinesRewards } from "./parent-fines-rewards";
import { ParentNotifications } from "./parent-notifications";
import { ParentNoticeBoard } from "./parent-notice-board";
import { ParentEventGallery } from "./parent-event-gallery";
import { ParentStudentOverview } from "./parent-student-overview";
import { ParentSettings } from "./parent-settings";

export interface ParentPortalProps {
  onLogout: () => void;
}

function LogoutButton({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  return (
    <div className="fixed top-4 right-4 z-[200]">
      <button
        onClick={() => { onLogout(); navigate("/parent"); }}
        className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded-lg opacity-70 hover:opacity-100"
      >
        Logout
      </button>
    </div>
  );
}

export default function ParentPortal({ onLogout }: ParentPortalProps) {
  return (
    <div className="min-h-screen bg-slate-100">
      <MemoryRouter initialEntries={["/parent"]}>
        <LogoutButton onLogout={onLogout} />
        <Routes>
          <Route path="/parent" element={<ParentDashboard />} />
          <Route path="/parent/attendance" element={<ParentAttendance />} />
          <Route path="/parent/movement-history" element={<ParentMovementHistory />} />
          <Route path="/parent/leave-tracking" element={<ParentLeaveTracking />} />
          <Route path="/parent/fees-tracking" element={<ParentFeesTracking />} />
          <Route path="/parent/fines-rewards" element={<ParentFinesRewards />} />
          <Route path="/parent/notifications" element={<ParentNotifications />} />
          <Route path="/parent/notice-board" element={<ParentNoticeBoard />} />
          <Route path="/parent/event-gallery" element={<ParentEventGallery />} />
          <Route path="/parent/student-overview" element={<ParentStudentOverview />} />
          <Route path="/parent/settings" element={<ParentSettings />} />
        </Routes>
      </MemoryRouter>
    </div>
  );
}
