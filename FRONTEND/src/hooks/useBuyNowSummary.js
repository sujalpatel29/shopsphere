import { useEffect, useMemo, useState } from "react";
import api from "../../api/api";

export default function useBuyNowSummary(buyNowItem) {
  const requestKey = useMemo(
    () => JSON.stringify(buyNowItem || null),
    [buyNowItem],
  );
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(Boolean(buyNowItem));
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    if (!buyNowItem) {
      setSummary(null);
      setLoading(false);
      setError("");
      return undefined;
    }

    const loadSummary = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await api.post("/order/order-summary-preview", {
          buy_now_item: buyNowItem,
        });

        if (!active) {
          return;
        }

        setSummary(response?.data?.data || null);
      } catch (summaryError) {
        if (!active) {
          return;
        }

        setSummary(null);
        setError(
          summaryError?.response?.data?.message ||
            "Unable to load Buy Now summary.",
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadSummary();

    return () => {
      active = false;
    };
  }, [buyNowItem, requestKey]);

  return { summary, loading, error };
}
