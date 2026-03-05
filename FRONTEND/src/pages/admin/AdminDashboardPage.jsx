/**
 * @component AdminDashboardPage
 * @description Main admin dashboard with collapsible sidebar navigation
 * and lazy-loaded tab content.
 *
 * Architecture:
 *  - Sidebar: Renders `adminNav` config with collapsible "Products" submenu.
 *             Persists open/closed state in localStorage.
 *  - Tabs:   Hash-based routing (#products-list, #orders, etc.) enables
 *            browser back/forward and deep-linking.
 *  - Content: Each tab is React.lazy() code-split; wrapped in <Suspense>
 *             with a skeleton fallback.
 *
 * UI libraries: PrimeReact (Button, Card, Skeleton), lucide-react icons
 * State: Redux (auth/currentUser), ThemeContext (dark mode)
 *
 * Consumed by: AdminLayout → <Outlet /> renders this page
 */
import { useMemo, useState, useEffect, useCallback, lazy, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "primereact/skeleton";
import {
  BarChart3,
  CreditCard,
  Gift,
  LogOut,
  Moon,
  Package,
  Settings,
  Star,
  Sun,
  Users,
  ChevronDown,
  PanelLeftClose,
  PanelLeft,
} from "lucide-react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useSelector } from "react-redux";

const adminNav = [
  { key: "users", label: "Users", icon: Users },
  {
    key: "products",
    label: "Products",
    icon: Package,
    children: [
      { key: "products-list", label: "Products" },
      { key: "products-categories", label: "Categories" },
      { key: "products-portions", label: "Portions" },
      { key: "products-modifiers", label: "Modifiers" },
    ],
  },
  { key: "orders", label: "Orders & Payments", icon: CreditCard },
  { key: "offers", label: "Offers", icon: Gift },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: Settings },
];

const AdminProductsTab = lazy(() => import("./AdminProductsTab"));
const AdminPortionsTab = lazy(() => import("./AdminPortionsTab"));
const AdminModifiersTab = lazy(() => import("./AdminModifiersTab"));
const AdminOrdersTab = lazy(() => import("./AdminOrdersTab"));

// Collect all valid tab keys for hash validation
const validTabKeys = new Set(
  adminNav.flatMap((item) =>
    item.children ? item.children.map((c) => c.key) : [item.key]
  )
);

const DEFAULT_TAB = "users";

/** Read tab key from URL hash, fallback to default */
function getTabFromHash() {
  const hash = window.location.hash.replace("#", "");
  return validTabKeys.has(hash) ? hash : DEFAULT_TAB;
}

// We can create a unified loading fallback
const TabLoader = () => (
  <div className="space-y-4">
    <div className="flex gap-4">
      <Skeleton width="10rem" height="2rem" />
      <Skeleton width="10rem" height="2rem" />
    </div>
    <Skeleton width="100%" height="20rem" />
  </div>
);

function AdminDashboardPage() {
  const { currentUser } = useSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState("users");
  const [productsOpen, setProductsOpen] = useState(true);

  const activeLabel = useMemo(() => {
    for (const item of adminNav) {
      if (item.key === activeTab) return item.label;
      for (const child of item.children || []) {
        if (child.key === activeTab) return `${item.label} - ${child.label}`;
      }
    }
    return "Dashboard";
  }, [activeTab]);

  const renderActiveContent = () => {
    if (activeTab === "users") {
      return <UserTable />;
    }

    return (
      <>
        <h3 className="font-serif text-2xl text-gray-900 dark:text-slate-100">
          {activeLabel}
        </h3>
        <p className="mt-3 text-sm text-gray-600 dark:text-slate-300">
          This section is ready for backend/API integration.
        </p>
      </>
    );
  };

  const dashboardStats = useMemo(() => {
    const totalUsers = pagination?.total ?? users.length;
    const blockedUsers = users.filter((user) => Number(user.is_blocked) === 1).length;
    const activeUsers = users.length - blockedUsers;
    const adminUsers = users.filter((user) => user.role === "admin").length;

    return [
      {
        label: "Total Users",
        value: totalUsers,
        tone: "text-cyan-700 dark:text-cyan-300",
      },
      {
        label: "Active Users",
        value: activeUsers,
        tone: "text-emerald-700 dark:text-emerald-300",
      },
      {
        label: "Blocked Users",
        value: blockedUsers,
        tone: "text-rose-700 dark:text-rose-300",
      },
      {
        label: "Admin Users",
        value: adminUsers,
        tone: "text-amber-700 dark:text-amber-300",
      },
    ];
  }, [users, pagination]);

  return (
    <div className={`admin-dashboard-grid grid items-start gap-6 p-6 ${sidebarOpen ? "lg:grid-cols-[290px_1fr]" : "lg:grid-cols-1"}`}>
      <div
        className={`rounded-3xl border border-gray-100 bg-white p-4 dark:border-[#1f2933] dark:bg-[#151e22] max-h-[calc(100vh-3rem)] sticky top-6 overflow-hidden flex-col transition-all duration-300 hidden lg:flex ${sidebarOpen ? "opacity-100" : "lg:hidden"}`}
      >
        <div className="flex-shrink-0 relative overflow-hidden rounded-2xl bg-[#163332] px-6 py-8 text-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.06),transparent_70%)]" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-3 flex items-center gap-2">
              <img src="/logo.svg" alt="ShopSphere" className="h-10 w-10" />
              <span className="font-serif text-2xl font-semibold tracking-tight text-white">ShopSphere</span>
            </div>
            <p className="font-serif text-xs font-medium tracking-[0.2em] text-[#c9b88a]">
              ADMIN PANEL
            </p>
            <h1
              className="mt-2 w-full truncate font-sans text-lg font-medium tracking-tight text-white/80 antialiased"
              title={currentUser?.email}
            >
              {currentUser?.email}
            </h1>
          </div>
        </div>

        <nav className="admin-sidebar-nav mt-4 space-y-1 flex-1 overflow-y-auto min-h-0">
          {adminNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeTab;
            const hasChildren = Boolean(item.children?.length);

            if (!hasChildren) {
              return (
                <Button
                  key={item.key}
                  type="button"
                  onClick={() => setActiveTab(item.key)}
                  className={`!flex !w-full !items-center !gap-3 !rounded-xl !px-3 !py-3 !text-left !text-sm !font-medium !shadow-none ${isActive ? "!bg-amber-600 !text-white !shadow-lg !shadow-amber-600/20" : "!bg-transparent !text-gray-700 hover:!bg-amber-50 hover:!text-amber-700 dark:!text-slate-300 dark:hover:!bg-slate-800 dark:hover:!text-amber-300"}`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            }

            const childActive = item.children.some(
              (child) => child.key === activeTab,
            );

            return (
              <div key={item.key} className="space-y-1">
                <Button
                  type="button"
                  onClick={() => setProductsOpen((prev) => !prev)}
                  className={`!flex !w-full !items-center !justify-between !rounded-xl !px-3 !py-3 !text-left !text-sm !font-medium !shadow-none ${childActive ? "!bg-amber-600 !text-white !shadow-lg !shadow-amber-600/20" : "!bg-transparent !text-gray-700 hover:!bg-amber-50 hover:!text-amber-700 dark:!text-slate-300 dark:hover:!bg-slate-800 dark:hover:!text-amber-300"}`}
                >
                  <span className="inline-flex items-center gap-3">
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </span>
                  <ChevronDown
                    className={`h-4 w-4 transition ${productsOpen ? "rotate-180" : ""}`}
                  />
                </Button>

                {productsOpen && (
                  <div className="ml-8 space-y-1">
                    {item.children.map((child) => (
                      <Button
                        key={child.key}
                        type="button"
                        onClick={() => setActiveTab(child.key)}
                        className={`!flex !w-full !items-center !rounded-lg !px-3 !py-2 !text-left !text-sm !font-medium !shadow-none ${activeTab === child.key ? "!bg-amber-100 !text-amber-800 dark:!bg-amber-500/20 dark:!text-amber-200" : "!bg-transparent !text-gray-600 hover:!bg-amber-50 hover:!text-amber-700 dark:!text-slate-400 dark:hover:!bg-slate-800 dark:hover:!text-amber-300"}`}
                      >
                        {child.label}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </Card>

      <section className="space-y-4">
        <Card
          className="rounded-3xl border border-gray-100 bg-white p-6 dark:border-[#1f2933] dark:bg-[#151e22]"
          pt={{ body: { className: "p-0" }, content: { className: "p-0" } }}
        >
          <h2 className="font-serif text-3xl text-gray-900 dark:text-slate-100">
            Admin Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            Manage platform operations and modules from the sidebar.
          </p>
        </Card>

        <Card
          className="rounded-2xl border border-gray-100 bg-white pt-6 px-6 pb-1 dark:border-[#1f2933] dark:bg-[#151e22] shadow-sm h-full overflow-hidden"
          pt={{ body: { className: "p-0 h-full flex flex-col" }, content: { className: "p-0 flex-1 flex flex-col min-h-0" } }}
        >
          <h3 className="font-serif text-2xl text-gray-900 dark:text-slate-100">
            {activeLabel}
          </h3>
          <p className="mt-3 text-sm text-gray-600 dark:text-slate-300">
            This section is ready for backend/API integration.
          </p>
        </Card>
      </section>
    </div>
  );
}

export default AdminDashboardPage;
