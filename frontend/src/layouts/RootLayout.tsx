// ─── Root Layout ──────────────────────────────────────────────────────────────
import { Outlet } from "react-router";

export default function RootLayout() {
  return (
    <div className="min-h-screen">
      <Outlet />
    </div>
  );
}
