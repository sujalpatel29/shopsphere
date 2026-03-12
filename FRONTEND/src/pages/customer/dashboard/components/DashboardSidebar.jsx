import { RefreshCw } from "lucide-react";
import { Button } from "primereact/button";
import { profileNav } from "../constants";

function DashboardSidebar({
  activeTab,
  currentUser,
  loading,
  onRefresh,
  sidebarOpen,
  onTabChange,
}) {
  return (
    <aside
      className={`rounded-3xl border border-gray-100 bg-white p-4 dark:border-[#1f2933] dark:bg-[#151e22] overflow-hidden flex flex-col transition-all duration-300 lg:max-h-[calc(100vh-3rem)] lg:sticky lg:top-6 ${
        sidebarOpen ? "opacity-100" : "lg:hidden"
      }`}
    >
      <div className="relative overflow-hidden rounded-2xl bg-[#163332] px-6 py-8 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.06),transparent_70%)]" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="mb-3 flex items-center gap-2">
            <img src="/logo.svg" alt="ShopSphere" className="h-10 w-10" />
            <span className="font-serif text-2xl font-semibold tracking-tight text-white">
              ShopSphere
            </span>
          </div>
          <p className="font-serif text-xs font-medium tracking-[0.2em] text-[#c9b88a]">
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

      <Button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="!mt-4 !mb-2 !flex !w-full !items-center !gap-3 !rounded-xl !px-3 !py-3 !text-left !text-sm !font-medium !shadow-none !bg-transparent !text-gray-700 hover:!bg-amber-50 hover:!text-amber-700 dark:!text-slate-300 dark:hover:!bg-slate-800 dark:hover:!text-amber-300"
      >
        <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        Refresh Data
      </Button>

      <nav className="admin-sidebar-nav mt-2 space-y-1 flex-1 overflow-y-auto min-h-0">
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
                  ? "!bg-amber-600 !text-white !shadow-lg !shadow-amber-600/20"
                  : "!bg-transparent !text-gray-700 hover:!bg-amber-50 hover:!text-amber-700 dark:!text-slate-300 dark:hover:!bg-slate-800 dark:hover:!text-amber-300"
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>
    </aside>
  );
}

export default DashboardSidebar;
