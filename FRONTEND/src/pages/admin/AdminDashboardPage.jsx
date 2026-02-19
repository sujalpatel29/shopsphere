import { useMemo, useState } from "react";
import {
  BarChart3,
  CreditCard,
  Gift,
  Package,
  Settings,
  Star,
  User,
  Users,
  ChevronDown,
} from "lucide-react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { useAuth } from "../../context/AuthContext";

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
  { key: "orders", label: "Orders", icon: Package },
  { key: "payments", label: "Payments", icon: CreditCard },
  { key: "offers", label: "Offers", icon: Gift },
  { key: "reviews", label: "Reviews", icon: Star },
  { key: "reports", label: "Reports", icon: BarChart3 },
  { key: "settings", label: "Settings", icon: Settings },
];

function AdminDashboardPage() {
  const { currentUser } = useAuth();
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

  return (
    <div className="grid gap-6 lg:grid-cols-[290px_1fr]">
      <Card
        className="h-fit rounded-3xl border border-gray-100 bg-white p-4 dark:border-[#1f2933] dark:bg-[#151e22]"
        pt={{ body: { className: "p-0" }, content: { className: "p-0" } }}
      >
        <div className="relative overflow-hidden rounded-2xl bg-[#163332] px-6 py-8 text-white">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.06),transparent_70%)]" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full border border-[#c9b88a]/30 bg-[#c9b88a]/10 shadow-sm">
              <User className="h-10 w-10 text-[#c9b88a]" />
            </div>
            <p className="font-serif text-xs font-medium tracking-[0.2em] text-[#c9b88a]">
              ADMIN PANEL
            </p>
            <h1
              className="mt-2 w-full truncate font-sans text-xl font-semibold tracking-tight text-white antialiased"
              title={currentUser?.email}
            >
              {currentUser?.email}
            </h1>
          </div>
        </div>

        <nav className="mt-4 space-y-1">
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

            const childActive = item.children.some((child) => child.key === activeTab);

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
          className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-[#1f2933] dark:bg-[#151e22]"
          pt={{ body: { className: "p-0" }, content: { className: "p-0" } }}
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
