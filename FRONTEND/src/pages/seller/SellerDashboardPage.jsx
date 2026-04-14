import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";
import { Tag } from "primereact/tag";
import { Package, ShoppingCart, TrendingUp, Wallet } from "lucide-react";
import { getSellerAnalytics } from "../../../api/sellerApi";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function SellerDashboardPage() {
  const { currentUser } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        const response = await getSellerAnalytics();
        setAnalytics(response.data?.data || null);
      } catch (error) {
        setAnalytics(null);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  const statCards = useMemo(
    () => [
      {
        label: "Products",
        value: analytics?.products?.total_products || 0,
        accent: "bg-blue-500",
        icon: Package,
      },
      {
        label: "Active Listings",
        value: analytics?.products?.active_products || 0,
        accent: "bg-emerald-500",
        icon: TrendingUp,
      },
      {
        label: "Orders",
        value: analytics?.orders?.total_orders || 0,
        accent: "bg-violet-500",
        icon: ShoppingCart,
      },
      {
        label: "Revenue",
        value: currencyFormatter.format(analytics?.orders?.total_revenue || 0),
        accent: "bg-amber-500",
        icon: Wallet,
      },
    ],
    [analytics],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} height="9rem" />
          ))}
        </div>
        <Skeleton height="18rem" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[#b08d57]">
            Seller Overview
          </p>
          <h1 className="mt-1 font-serif text-3xl text-gray-900 dark:text-slate-100">
            Welcome back, {currentUser?.name || "Seller"}
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
            Keep an eye on listing health, order momentum, and store readiness from one place.
          </p>
        </div>
        <Tag
          value={`${analytics?.verification_status || "pending"} account`}
          severity={analytics?.verification_status === "approved" ? "success" : "warning"}
          className="capitalize"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label} className="rounded-2xl border border-gray-100 shadow-sm dark:border-[#1f2933] dark:bg-[#151e22]">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">{item.label}</p>
                  <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-slate-100">
                    {item.value}
                  </p>
                </div>
                <div className={`rounded-2xl p-3 text-white ${item.accent}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card className="rounded-2xl border border-gray-100 shadow-sm dark:border-[#1f2933] dark:bg-[#151e22]">
          <div className="space-y-5">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#b08d57]">
                Store Pulse
              </p>
              <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-slate-100">
                Performance snapshot
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-[#f5f0e8] p-4 dark:bg-[#10181d]">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
                  Items Sold
                </p>
                <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-slate-100">
                  {analytics?.orders?.total_items_sold || 0}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f5f0e8] p-4 dark:bg-[#10181d]">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
                  Pending Orders
                </p>
                <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-slate-100">
                  {analytics?.pending_orders || 0}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f5f0e8] p-4 dark:bg-[#10181d]">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
                  Catalog Readiness
                </p>
                <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-slate-100">
                  {analytics?.products?.total_products
                    ? `${Math.round(
                        ((analytics?.products?.active_products || 0) /
                          analytics.products.total_products) *
                          100,
                      )}%`
                    : "0%"}
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-gray-100 shadow-sm dark:border-[#1f2933] dark:bg-[#151e22]">
          <div className="space-y-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[#b08d57]">
                Checklist
              </p>
              <h2 className="mt-1 text-xl font-semibold text-gray-900 dark:text-slate-100">
                What to watch next
              </h2>
            </div>
            <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
              <div className="rounded-2xl border border-gray-200 px-4 py-3 dark:border-gray-700">
                Keep inactive products low so customers only see ready-to-ship inventory.
              </div>
              <div className="rounded-2xl border border-gray-200 px-4 py-3 dark:border-gray-700">
                Review pending orders quickly to keep fulfillment moving smoothly.
              </div>
              <div className="rounded-2xl border border-gray-200 px-4 py-3 dark:border-gray-700">
                Make sure business and banking details stay current for verification and payouts.
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default SellerDashboardPage;
