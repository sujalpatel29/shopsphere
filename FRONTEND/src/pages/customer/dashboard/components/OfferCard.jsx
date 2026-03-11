import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
};

const formatLabelValue = (value) => {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-gray-500 dark:text-slate-400">{label}</span>
      <span className="font-medium text-gray-800 dark:text-slate-200">{value}</span>
    </div>
  );
}

function OfferCard({ applyingId, offer, onApply }) {
  const offerId = Number(offer?.offer_id) || 0;
  const isApplying = Number(applyingId) === offerId;

  return (
    <Card className="h-full rounded-2xl border border-slate-200/80 bg-white shadow-[0_16px_30px_-28px_rgba(15,23,42,0.95)] dark:border-slate-700 dark:bg-slate-900/70">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-semibold text-slate-900 dark:text-slate-100">
            {offer?.offer_name || "Offer"}
          </p>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-700 dark:text-slate-300">
            {offer?.description || "-"}
          </p>
        </div>
        <Tag value={formatLabelValue(offer?.discount_type)} severity="info" />
      </div>

      <Divider className="!my-3" />

      <div className="space-y-2.5">
        <InfoRow
          label="Discount Type"
          value={formatLabelValue(offer?.discount_type)}
        />
        <InfoRow
          label="Minimum Purchase"
          value={formatCurrency(
            offer?.min_purchase_amount ?? offer?.minimum_purchase_amount,
          )}
        />
        <InfoRow
          label="Maximum Discount"
          value={formatCurrency(
            offer?.maximum_discount_amount ?? offer?.max_discount_amount,
          )}
        />
      </div>

      <Button
        type="button"
        label={isApplying ? "Applying..." : "Apply Offer"}
        icon="pi pi-check"
        className="mt-4 w-full !rounded-xl !bg-amber-500 !text-sm !font-semibold !text-[#132a29] hover:!bg-amber-400"
        disabled={isApplying}
        onClick={() => onApply(offer)}
      />
    </Card>
  );
}

export default OfferCard;
