import { Button } from "primereact/button";

const formatCurrency = (value) => {
  if (value === null || value === undefined || value === "") return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

const formatLabel = (value) => {
  if (!value && value !== 0) return "—";
  return String(value)
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

function InfoRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-gray-500 dark:text-slate-400">{label}</span>
      <span className="font-semibold text-gray-800 dark:text-slate-200">
        {value}
      </span>
    </div>
  );
}

function DiscountBadge({ type }) {
  const label = formatLabel(type);
  const isPercent = String(type).toLowerCase().includes("percent");
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide ${
        isPercent
          ? "bg-[#e6f7f5] text-[#1A9E8E] dark:bg-[#1A9E8E]/20 dark:text-[#26c9b4]"
          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
      }`}
    >
      {label}
    </span>
  );
}

function OfferCard({ applyingId, offer, onApply }) {
  const offerId = Number(offer?.offer_id) || 0;
  const isApplying = Number(applyingId) === offerId;

  return (
    <div className="flex h-full flex-col rounded-2xl border border-[#DDD8CF]/60 bg-white p-5 transition hover:border-[#1A9E8E]/30 hover:shadow-lg hover:shadow-[#1A9E8E]/10 dark:border-[#1f2933] dark:bg-[#151e22] dark:hover:border-[#1A9E8E]/30">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate font-serif text-lg font-semibold text-gray-900 dark:text-slate-100">
            {offer?.offer_name || "Offer"}
          </p>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-gray-500 dark:text-slate-400">
            {offer?.description || "No description provided."}
          </p>
        </div>
        <DiscountBadge type={offer?.discount_type} />
      </div>

      {/* Divider */}
      <div className="my-4 border-t border-dashed border-gray-200 dark:border-[#1f2933]" />

      {/* Info rows */}
      <div className="flex-1 space-y-2.5">
        <InfoRow label="Type" value={formatLabel(offer?.discount_type)} />
        <InfoRow
          label="Min. Purchase"
          value={formatCurrency(
            offer?.min_purchase_amount ?? offer?.minimum_purchase_amount,
          )}
        />
        <InfoRow
          label="Max. Discount"
          value={formatCurrency(
            offer?.maximum_discount_amount ?? offer?.max_discount_amount,
          )}
        />
      </div>

      {/* CTA */}
      <Button
        type="button"
        label={isApplying ? "Applying…" : "Apply Offer"}
        icon={isApplying ? "pi pi-spin pi-spinner" : "pi pi-tag"}
        iconPos="left"
        className="mt-5 w-full !rounded-xl !border !border-[#1A9E8E]/60 !bg-[#e6f7f5] !py-2.5 !text-sm !font-semibold !text-[#1A9E8E] !shadow-none transition hover:!bg-[#d4f0ec] dark:!border-[#1A9E8E]/30 dark:!bg-[#1A9E8E]/10 dark:!text-[#26c9b4] dark:hover:!bg-[#1A9E8E]/20"
        disabled={isApplying}
        onClick={() => onApply(offer)}
      />
    </div>
  );
}

export default OfferCard;
