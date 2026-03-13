import { useCallback, useEffect, useMemo, useState } from "react";
import { Message } from "primereact/message";
import { Skeleton } from "primereact/skeleton";
import api from "../../../../../api/api";
import OfferCard from "./OfferCard";

const toArray = (value) => (Array.isArray(value) ? value : []);
const extractData = (response) => response?.data?.data ?? null;

const extractErrorMessage = (apiError, fallback) => {
  const responseData = apiError?.response?.data;
  if (typeof responseData === "string" && responseData.trim()) return responseData;
  if (responseData?.message) return responseData.message;
  if (apiError?.message) return apiError.message;
  return fallback;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

function OfferCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-[0_16px_30px_-28px_rgba(15,23,42,0.95)] dark:border-slate-700 dark:bg-slate-900/70">
      <div className="flex items-start justify-between gap-3">
        <div className="w-full space-y-2">
          <Skeleton width="60%" height="1.1rem" />
          <Skeleton width="100%" height="0.85rem" />
          <Skeleton width="90%" height="0.85rem" />
        </div>
        <Skeleton width="4.5rem" height="1.8rem" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton width="100%" height="0.85rem" />
        <Skeleton width="100%" height="0.85rem" />
        <Skeleton width="100%" height="0.85rem" />
      </div>
      <Skeleton width="100%" height="2.4rem" className="mt-4" />
    </div>
  );
}

function OffersPage({ showToast }) {
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [applyingId, setApplyingId] = useState(null);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/offer/active");
      const payload = toArray(extractData(response));
      const sorted = [...payload].sort(
        (a, b) => Number(b?.offer_id || 0) - Number(a?.offer_id || 0),
      );
      setOffers(sorted);
    } catch (apiError) {
      setError(extractErrorMessage(apiError, "Failed to load active offers."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    showToast?.("success", "Success", successMessage);
  }, [showToast, successMessage]);

  useEffect(() => {
    if (!error) {
      return;
    }

    showToast?.("error", "Error", error);
  }, [error, showToast]);

  const handleApplyOffer = useCallback(async (offer) => {
    const offerName = offer?.offer_name;
    if (!offerName) {
      setError("Offer name is missing for this record.");
      return;
    }

    const offerId = Number(offer?.offer_id) || null;
    setApplyingId(offerId);
    setError("");
    setSuccessMessage("");

    const payload = { offer_name: offerName };
    if (offer?.product_id != null) {
      payload.product_id = offer.product_id;
    }
    if (offer?.category_id != null) {
      payload.category_id = offer.category_id;
    }

    try {
      const response = await api.post("/offer/validate", payload);
      const validationResult = extractData(response) || {};
      const discount = Number(validationResult?.discount_amount) || 0;
      const finalAmount = Number(validationResult?.final_amount) || 0;
      setSuccessMessage(
        `${offerName} applied successfully. Discount: ${formatCurrency(discount)} | Final: ${formatCurrency(finalAmount)}`,
      );
    } catch (apiError) {
      setError(extractErrorMessage(apiError, "Failed to validate offer."));
    } finally {
      setApplyingId(null);
    }
  }, []);

  const hasOffers = useMemo(() => offers.length > 0, [offers.length]);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_20px_38px_-30px_rgba(15,23,42,0.8)] dark:border-[#1f2933] dark:bg-[#151e22]">
        <h2 className="font-serif text-2xl text-slate-900 dark:text-slate-100">
          Active Offers
        </h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Browse your currently available offers and validate them instantly.
        </p>
      </div>

      {successMessage && (
        <Message severity="success" text={successMessage} className="w-full" />
      )}
      {error && <Message severity="error" text={error} className="w-full" />}

      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <OfferCardSkeleton key={index} />
          ))}
        </div>
      )}

      {!loading && !hasOffers && (
        <Message
          severity="info"
          text="No active offers are available right now."
          className="w-full"
        />
      )}

      {!loading && hasOffers && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {offers.map((offer) => (
            <OfferCard
              key={offer.offer_id}
              offer={offer}
              applyingId={applyingId}
              onApply={handleApplyOffer}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default OffersPage;
