import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";

function SummaryCard({ iconClass, iconToneClassName, label, loading, value }) {
  return (
    <Card className="overflow-hidden rounded-2xl border border-[#DDD8CF] bg-white shadow-[0_2px_6px_rgba(0,0,0,0.05)] dark:border-[#2a3f38] dark:bg-[#1a2e28]">
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="font-accent text-[11px] font-semibold uppercase tracking-[0.18em] text-[#7C7670] dark:text-[#A8A39A]">
            {label}
          </p>
          <span
            className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${iconToneClassName}`}
          >
            <i className={`${iconClass} text-base`} />
          </span>
        </div>

        <div>
          {loading ? (
            <Skeleton width="5rem" height="1.9rem" />
          ) : (
            <p className="font-accent text-2xl font-semibold text-[#111111] dark:text-[#F6F3EE] sm:text-3xl">
              {value}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}

function DashboardSummaryCards({ loading, summary }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <SummaryCard
        label="Total Orders"
        iconClass="pi pi-shopping-bag"
        iconToneClassName="bg-[#e6f7f5] text-[#1A9E8E] dark:bg-[#1A9E8E]/20 dark:text-[#26c9b4]"
        loading={loading}
        value={summary.totalOrders}
      />
      <SummaryCard
        label="Saved Addresses"
        iconClass="pi pi-map-marker"
        iconToneClassName="bg-[#e6f7f5] text-[#1A9E8E] dark:bg-[#1A9E8E]/20 dark:text-[#26c9b4]"
        loading={loading}
        value={summary.savedAddresses}
      />
      <SummaryCard
        label="Active Offers"
        iconClass="pi pi-percentage"
        iconToneClassName="bg-[#e6f7f5] text-[#1A9E8E] dark:bg-[#1A9E8E]/20 dark:text-[#26c9b4]"
        loading={loading}
        value={summary.activeOffers}
      />
    </div>
  );
}

export default DashboardSummaryCards;
