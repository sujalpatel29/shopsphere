/**
 * @component AdminLayout
 * @description Root layout wrapper for the admin route tree.
 *
 * Provides a full-screen container with dark/light theming that wraps
 * all admin pages via React Router's <Outlet />.
 *
 * Uses:
 *  - ThemeContext for dark-mode class toggling
 *  - React Router <Outlet /> for nested route rendering
 *
 * Route: /admin/* (defined in App router)
 */
import { Outlet } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";

function AdminLayout() {
  const { darkMode } = useTheme();

  return (
    <div
      className={`h-screen overflow-hidden font-sans ${darkMode ? "bg-[#0b1114] text-slate-200" : "bg-gray-50 text-gray-900"}`}
    >
      <Outlet />
    </div>
  );
}

export default AdminLayout;
