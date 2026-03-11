import { RefreshCw, User } from "lucide-react";
import { Avatar } from "primereact/avatar";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { cardPt, profileNav, sidebarCardClassName } from "../constants";

function DashboardSidebar({
  activeTab,
  currentUser,
  loading,
  onRefresh,
  onTabChange,
}) {
  return (
    <Card
      className={`${sidebarCardClassName} overflow-hidden border-slate-200/80 shadow-[0_20px_40px_-30px_rgba(15,23,42,0.65)] lg:sticky lg:top-6 dark:border-[#1f2933]`}
      pt={cardPt}
    >
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#123332] via-[#16403f] to-[#1b4f4b] px-4 py-6 text-white sm:px-5 sm:py-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.06),transparent_70%)]" />

        <div className="relative z-10 flex flex-col items-center text-center">
          <Avatar
            shape="circle"
            size="xlarge"
            className="!mb-4 !border !border-[#d9c79a]/35 !bg-[#d9c79a]/15"
          >
            <User className="h-7 w-7 text-[#c9b88a]" />
          </Avatar>

          <p className="font-serif text-[11px] font-semibold tracking-[0.22em] text-[#d9c79a]">
            MY ACCOUNT
          </p>
          <h1
            className="mt-2 w-full truncate font-sans text-base font-semibold tracking-tight text-white antialiased sm:text-lg"
            title={currentUser?.email}
          >
            {currentUser?.email}
          </h1>
          <p className="mt-2 text-xs text-slate-200/90">Manage everything in one place</p>
        </div>
      </div>

      <div className="mt-4 px-1">
        <Button
          type="button"
          onClick={onRefresh}
          disabled={loading}
          className="!mb-3 !flex !w-full !items-center !justify-center !gap-2 !rounded-xl !border !border-slate-200 !bg-white !px-3 !py-2.5 !text-sm !font-semibold !text-slate-700 !shadow-none transition-colors hover:!border-amber-200 hover:!bg-amber-50 hover:!text-amber-700 dark:!border-slate-700 dark:!bg-[#11181c] dark:!text-slate-200 dark:hover:!border-amber-700/60 dark:hover:!bg-slate-800 dark:hover:!text-amber-300"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh Data
        </Button>
      </div>
      <Divider className="!my-2" />

      <nav className="space-y-1">
        {profileNav.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === activeTab;

          return (
            <Button
              key={item.key}
              type="button"
              onClick={() => onTabChange(item.key)}
              className={`!group !relative !flex !w-full !items-center !gap-3 !rounded-xl !px-3 !py-2.5 !text-left !text-[13px] !font-medium !shadow-none transition-colors sm:!text-sm ${
                isActive
                  ? "!bg-amber-500 !text-[#102624] !shadow-[0_8px_18px_-10px_rgba(217,157,20,0.95)]"
                  : "!bg-transparent !text-slate-700 hover:!bg-slate-100 hover:!text-slate-900 dark:!text-slate-300 dark:hover:!bg-slate-800 dark:hover:!text-slate-100"
              }`}
            >
              <span
                className={`inline-flex h-8 w-8 items-center justify-center rounded-lg ${
                  isActive
                    ? "bg-white/40 text-[#102624]"
                    : "bg-slate-100 text-slate-600 group-hover:bg-white dark:bg-slate-700 dark:text-slate-300 dark:group-hover:bg-slate-600"
                }`}
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="truncate">{item.label}</span>
              {isActive && <i className="pi pi-angle-right ml-auto hidden text-xs sm:inline" />}
            </Button>
          );
        })}
      </nav>
    </Card>
  );
}

export default DashboardSidebar;
