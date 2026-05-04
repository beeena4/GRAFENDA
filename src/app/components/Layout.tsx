import { Outlet, useLocation } from "react-router";
import { Navbar } from "./Navbar";

export function Layout() {
  const location = useLocation();
  const hideNavbar = location.pathname.includes('/dashboard/admin') || location.pathname.includes('/dashboard/seller');

  return (
    <div className="min-h-screen bg-slate-50">
      {!hideNavbar && <Navbar />}
      <Outlet />
    </div>
  );
}
