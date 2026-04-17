import { LogOut, Moon, Sun } from "lucide-react";
import { Button } from "primereact/button";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logoutUser } from "../../../../redux/slices/authSlice";
import { useTheme } from "../../../../context/ThemeContext";
import { profileNav } from "../constants";

function DashboardSidebar({
  activeTab,
  currentUser,
  sidebarOpen,
  onTabChange,
}) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  const handleLogout = () => {
    dispatch(logoutUser());
    navigate("/login");
  };

  return (
    <aside
      className={`rounded-3xl border border-[#E8E3DA] bg-white p-4 dark:border-[#2a3f38] dark:bg-[#132420] overflow-hidden flex flex-col transition-all duration-300 lg:max-h-[calc(100vh-7rem)] lg:sticky lg:top-28 ${sidebarOpen ? "opacity-100" : "lg:hidden"}`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#132420] px-6 py-8 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(26,158,142,0.15),transparent_70%)]" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-3 flex items-center gap-2">
            <img src="/logo.svg" alt="ShopSphere" className="h-10 w-10" />
            <span className="font-serif text-2xl font-semibold tracking-tight text-white">
              ShopSphere
            </span>
          </div>
          <p className="font-serif text-xs font-medium tracking-[0.2em] text-[#1A9E8E]">
            CUSTOMER PANEL
          </p>
          <h1
            className="mt-2 w-full truncate font-sans text-lg font-medium tracking-tight text-white/80 antialiased"
            title={currentUser?.email}
          >
            {currentUser?.email || "customer@shopsphere.com"}
          </h1>
        </div>
      </div>

      <nav className="admin-sidebar-nav mt-4 space-y-1 flex-1 overflow-y-auto min-h-0">
        {profileNav.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === activeTab;

          return (
            <Button
              key={item.key}
              type="button"
              onClick={() => onTabChange(item.key)}
              className={`!flex !w-full !items-center !gap-3 !rounded-xl !px-3 !py-3 !text-left !text-sm !font-medium !shadow-none ${
                isActive
                  ? "!bg-[#1A9E8E] !text-white !shadow-lg !shadow-[#1A9E8E]/20"
                  : "!bg-transparent !text-gray-700 hover:!bg-[#e6f7f5] hover:!text-[#1A9E8E] dark:!text-slate-300 dark:hover:!bg-[#1a2e28] dark:hover:!text-[#26c9b4]"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="flex-shrink-0 mt-4 border-t border-gray-200 pt-4 dark:border-gray-700 space-y-1">
        <Button
          type="button"
          onClick={toggleDarkMode}
          className="!flex !w-full !items-center !gap-3 !rounded-xl !px-3 !py-3 !text-left !text-sm !font-medium !shadow-none !bg-transparent !text-gray-700 hover:!bg-[#e6f7f5] hover:!text-[#1A9E8E] dark:!text-slate-300 dark:hover:!bg-[#1a2e28] dark:hover:!text-[#26c9b4]"
        >
          {darkMode ? (
            <Sun className="h-4 w-4" />
          ) : (
            <Moon className="h-4 w-4" />
          )}
          {darkMode ? "Light Mode" : "Dark Mode"}
        </Button>
        <Button
          type="button"
          onClick={handleLogout}
          className="!flex !w-full !items-center !gap-3 !rounded-xl !px-3 !py-3 !text-left !text-sm !font-medium !shadow-none !bg-transparent !text-red-600 hover:!bg-red-50 dark:!text-red-400 dark:hover:!bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </aside>
  );
}

export default DashboardSidebar;
