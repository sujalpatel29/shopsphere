import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { getOfferLifecycleMeta } from "./offerLifecycle";

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatNumber = (value) => {
  if (value === null || value === undefined || value === "") return "-";
  return Number(value).toLocaleString();
};

function OfferViewDialog({ visible, onHide, offer }) {
  const lifecycle = getOfferLifecycleMeta(offer);

  const footer = (
    <div className="flex justify-end">
      <Button
        type="button"
        label="Close"
        onClick={onHide}
        className="admin-btn-secondary px-4 py-2 rounded-lg font-medium transition-colors"
      />
    </div>
  );

  const infoItem = (label, value) => (
    <div className="rounded-xl border border-gray-200 bg-white/60 p-4 dark:border-gray-700 dark:bg-slate-900/40">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <div className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
        {value}
      </div>
    </div>
  );

  return (
    <Dialog
      header={offer ? `Offer Details - ${offer.offer_name}` : "Offer Details"}
      visible={visible}
      onHide={onHide}
      style={{ width: "min(58rem, 95vw)" }}
      footer={footer}
      dismissableMask
      className="admin-dialog"
      pt={{
        root: { className: "admin-dialog rounded-2xl overflow-hidden" },
        header: { className: "admin-dialog-header px-6 py-4 border-b" },
        title: { className: "text-xl font-serif text-gray-900 dark:text-slate-100" },
        content: { className: "p-6 font-sans" },
        footer: { className: "admin-dialog-footer px-6 py-4 border-t rounded-b-2xl" },
      }}
    >
      {offer ? (
        <div className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {infoItem("Offer ID", offer.offer_id ?? "-")}
            {infoItem(
              "Offer Type",
              <Tag
                value={String(offer.offer_type || "").replaceAll("_", " ")}
                className="!font-medium !text-xs !px-2 !py-1 !rounded-full !bg-amber-100 !text-amber-800 dark:!bg-amber-900/40 dark:!text-amber-200"
              />,
            )}
            {infoItem("Offer Name", offer.offer_name || "-")}
            {infoItem(
              "Lifecycle",
              <Tag
                value={lifecycle.label}
                className={`!font-medium !text-xs !px-2 !py-1 !rounded-full ${lifecycle.className}`}
              />,
            )}
            {infoItem(
              "Status",
              <span
                className={
                  offer.is_active
                    ? "text-green-600 dark:text-green-400"
                    : "text-gray-500 dark:text-gray-400"
                }
              >
                {offer.is_active ? "Active" : "Inactive"}
              </span>,
            )}
            {infoItem("Discount Type", offer.discount_type || "-")}
            {infoItem(
              "Discount Value",
              offer.discount_type === "percentage"
                ? `${formatNumber(offer.discount_value)}%`
                : `Rs ${formatNumber(offer.discount_value)}`,
            )}
            {infoItem(
              "Maximum Discount Amount",
              `Rs ${formatNumber(offer.maximum_discount_amount)}`,
            )}
            {infoItem(
              "Minimum Purchase Amount",
              `Rs ${formatNumber(offer.min_purchase_amount)}`,
            )}
            {infoItem("Usage Limit Per User", formatNumber(offer.usage_limit_per_user))}
            {infoItem("Product / Category", offer.scope_name || "-")}
            {infoItem("Start Date", formatDate(offer.start_date))}
            {infoItem("End Date", formatDate(offer.end_date))}
            {infoItem("Start Time", offer.start_time || "-")}
            {infoItem("End Time", offer.end_time || "-")}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white/60 p-4 dark:border-gray-700 dark:bg-slate-900/40">
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
              Description
            </p>
            <p className="mt-2 text-sm text-gray-800 dark:text-gray-200">
              {offer.description || "-"}
            </p>
          </div>
        </div>
      ) : null}
    </Dialog>
  );
}

export default OfferViewDialog;
