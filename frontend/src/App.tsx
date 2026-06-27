// ─── HostelPaglu — Master App ─────────────────────────────────────────────────
// Unified frontend consolidating:
//   P1 (hp_p1) → Auth flow (splash, welcome, role selection, login, registration)
//   P2 (hp_p2) → Student portal (22 screens)
//   P3 (hp_p3) → Parent portal (11 screens) + Warden portal (24 screens)
//   P4 (hp_p4) → SuperAdmin, Admin, Trustee, Accountant, Laundry portals
//
// Role routing:
//   /           → Auth flow (P1)
//   /student    → Student portal (P2)
//   /parent/*   → Parent portal screens (P3)
//   /warden/*   → Warden portal screens (P3)
//   /superadmin → SuperAdmin portal (P4)
//   /admin      → Admin portal (P4)
//   /trustee    → Trustee portal (P4)
//   /accountant → Accountant portal (P4)
//   /laundry    → Laundry portal (P4)

import { useState } from "react";
import AuthFlow from "@/pages/auth/AuthFlow";
import StudentPortal from "@/pages/student/StudentPortal";
import ParentPortal from "@/pages/parent/ParentPortal";
import WardenPortal from "@/pages/warden/WardenPortal";
import StaffPortal from "@/pages/admin/StaffPortal";

type AppRole =
  | null
  | "student"
  | "parent"
  | "warden"
  | "superadmin"
  | "admin"
  | "trustee"
  | "accountant"
  | "laundry";

// ── Role mapping: P1 role keys → AppRole ─────────────────────────────────────
const ROLE_MAP: Record<string, AppRole> = {
  student:    "student",
  parent:     "parent",
  warden:     "warden",
  admin:      "admin",
  superadmin: "superadmin",
  trustee:    "trustee",
  accountant: "accountant",
  laundry:    "laundry",
  // P1 role screen uses generic keys — map them here
  "Student":     "student",
  "Parent":      "parent",
  "Warden":      "warden",
  "Admin":       "admin",
  "Super Admin": "superadmin",
  "Trustee":     "trustee",
  "Accountant":  "accountant",
  "Laundry":     "laundry",
};

export default function App() {
  const [role, setRole] = useState<AppRole>(null);

  const handleAuthComplete = (selectedRole: string) => {
    const mapped = ROLE_MAP[selectedRole] ?? "student";
    setRole(mapped);
  };

  const handleLogout = () => setRole(null);

  // ── Auth not completed ──────────────────────────────────────────────────────
  if (role === null) {
    return <AuthFlow onAuthComplete={handleAuthComplete} />;
  }

  // ── Student portal (P2) ────────────────────────────────────────────────────
  if (role === "student") {
    return <StudentPortal onLogout={handleLogout} />;
  }

  // ── Parent portal (P3) ─────────────────────────────────────────────────────
  if (role === "parent") {
    return <ParentPortal onLogout={handleLogout} />;
  }

  // ── Warden portal (P3) ─────────────────────────────────────────────────────
  if (role === "warden") {
    return <WardenPortal onLogout={handleLogout} />;
  }

  // ── Staff portals (P4) ─────────────────────────────────────────────────────
  if (role === "superadmin" || role === "admin" || role === "trustee" ||
      role === "accountant" || role === "laundry") {
    return <StaffPortal role={role} onLogout={handleLogout} />;
  }

  // Fallback
  return <AuthFlow onAuthComplete={handleAuthComplete} />;
}
