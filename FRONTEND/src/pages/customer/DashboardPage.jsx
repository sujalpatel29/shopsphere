import { useMemo, useState } from "react";
import {
  CreditCard,
  LayoutDashboard,
  MapPin,
  Package,
  Shield,
  User,
  WalletCards,
  Heart,
  HelpCircle,
} from "lucide-react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Tag } from "primereact/tag";
import { useAuth } from "../../context/AuthContext";

const profileNav = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "profile", label: "Profile", icon: User },
  { key: "orders", label: "Orders", icon: Package },
  { key: "payments", label: "Payment Methods", icon: CreditCard },
  { key: "addresses", label: "Addresses", icon: MapPin },
  { key: "wallet", label: "Wallet & Offers", icon: WalletCards },
  { key: "wishlist", label: "Wishlist", icon: Heart },
  { key: "security", label: "Login & Security", icon: Shield },
  { key: "support", label: "Help & Support", icon: HelpCircle },
];

function DashboardPage() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("dashboard");

  const userOrders = useMemo(() => [], []);

  const statusTemplate = (row) => (
    <Tag
      value={row.status}
      severity={row.status === "completed" ? "success" : "warning"}
    />
  );

  const renderOrdersTable = (title) => (
    <Card
      className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-[#1f2933] dark:bg-[#151e22]"
      pt={{ body: { className: "p-0" }, content: { className: "p-0" } }}
    >
      <h2 className="font-serif text-2xl text-gray-900 dark:text-slate-100">
        {title}
      </h2>
      <DataTable
        value={userOrders}
        className="mt-5"
        emptyMessage="No orders yet."
        stripedRows
      >
        <Column
          field="order_id"
          header="Order ID"
          body={(row) => `#${row.order_id}`}
        />
        <Column field="item_count" header="Items" />
        <Column
          field="total_amount"
          header="Amount"
          body={(row) => `$${row.total_amount.toFixed(2)}`}
        />
        <Column field="status" header="Status" body={statusTemplate} />
      </DataTable>
    </Card>
  );

  const renderMain = () => {
    if (activeTab === "dashboard") {
      return (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <Card
              className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-[#1f2933] dark:bg-[#151e22]"
              pt={{ body: { className: "p-0" }, content: { className: "p-0" } }}
            >
              <p className="font-accent text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-slate-400">
                Total Orders
              </p>
              <p className="mt-2 font-accent text-3xl font-semibold text-gray-900 dark:text-slate-100">
                {userOrders.length}
              </p>
            </Card>
            <Card
              className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-[#1f2933] dark:bg-[#151e22]"
              pt={{ body: { className: "p-0" }, content: { className: "p-0" } }}
            >
              <p className="font-accent text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-slate-400">
                Completed
              </p>
              <p className="mt-2 font-accent text-3xl font-semibold text-gray-900 dark:text-slate-100">
                {
                  userOrders.filter((order) => order.status === "completed")
                    .length
                }
              </p>
            </Card>
            <Card
              className="rounded-2xl border border-gray-100 bg-gray-50 p-5 dark:border-[#1f2933] dark:bg-[#151e22]"
              pt={{ body: { className: "p-0" }, content: { className: "p-0" } }}
            >
              <p className="font-accent text-xs uppercase tracking-[0.14em] text-gray-500 dark:text-slate-400">
                Pending
              </p>
              <p className="mt-2 font-accent text-3xl font-semibold text-gray-900 dark:text-slate-100">
                {
                  userOrders.filter((order) => order.status !== "completed")
                    .length
                }
              </p>
            </Card>
          </div>

          {renderOrdersTable("Recent Orders")}
        </div>
      );
    }

    if (activeTab === "profile") {
      return (
        <Card
          className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-[#1f2933] dark:bg-[#151e22]"
          pt={{ body: { className: "p-0" }, content: { className: "p-0" } }}
        >
          <h2 className="font-serif text-2xl text-gray-900 dark:text-slate-100">
            Profile Details
          </h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-slate-800">
              <p className="text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400">
                Email
              </p>
              <p className="mt-2 text-sm text-gray-800 dark:text-slate-200">
                {currentUser?.email}
              </p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 dark:bg-slate-800">
              <p className="text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400">
                Role
              </p>
              <p className="mt-2 text-sm text-gray-800 dark:text-slate-200">
                {currentUser?.role}
              </p>
            </div>
          </div>
        </Card>
      );
    }

    if (activeTab === "orders") {
      return renderOrdersTable("Order History");
    }

    const contentMap = {
      payments: {
        title: "Payment Methods",
        text: "Manage saved UPI IDs, cards, and preferred checkout methods.",
      },
      addresses: {
        title: "Saved Addresses",
        text: "Manage delivery addresses for home, office, and frequent locations.",
      },
      wallet: {
        title: "Wallet & Offers",
        text: "Review promo credits, offer eligibility, and cashback balances.",
      },
      wishlist: {
        title: "Wishlist",
        text: "Track products you plan to buy later across categories.",
      },
      security: {
        title: "Login & Security",
        text: "Update password, review active sessions, and secure your account.",
      },
      support: {
        title: "Help & Support",
        text: "Get order support, raise issues, and contact customer service.",
      },
    };

    const active = contentMap[activeTab];

    return (
      <Card
        className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-[#1f2933] dark:bg-[#151e22]"
        pt={{ body: { className: "p-0" }, content: { className: "p-0" } }}
      >
        <h2 className="font-serif text-2xl text-gray-900 dark:text-slate-100">
          {active.title}
        </h2>
        <p className="mt-3 text-sm text-gray-600 dark:text-slate-300">
          {active.text}
        </p>
      </Card>
    );
  };

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
              MY ACCOUNT
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
          {profileNav.map((item) => {
            const Icon = item.icon;
            const isActive = item.key === activeTab;

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
          })}
        </nav>
      </Card>

      <section className="space-y-4">
        <Card
          className="rounded-3xl border border-gray-100 bg-white p-6 dark:border-[#1f2933] dark:bg-[#151e22]"
          pt={{ body: { className: "p-0" }, content: { className: "p-0" } }}
        >
          <h2 className="font-serif text-3xl text-gray-900 dark:text-slate-100">
            Profile Dashboard
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            All account navigation options are available in the sidebar.
          </p>
        </Card>

        {renderMain()}
      </section>
    </div>
  );
}

export default DashboardPage;
