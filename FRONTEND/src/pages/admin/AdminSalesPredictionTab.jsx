import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Database, Download, LineChart, Loader2, Sparkles } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { fetchAdminProducts } from "../../../api/adminProductsApi";
import {
  fetchAllSalesPredictions,
  fetchCachedSalesPredictions,
  fetchSalesHistory,
  fetchSalesPrediction,
} from "../../../api/adminSalesPredictionApi";

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-IN", {
  month: "short",
  year: "2-digit",
});

const CURRENCY_FORMATTER = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatMonthLabel(monthValue) {
  const date = new Date(monthValue);
  if (Number.isNaN(date.getTime())) {
    return monthValue || "-";
  }
  return MONTH_FORMATTER.format(date);
}

function formatCurrency(value) {
  return CURRENCY_FORMATTER.format(Number(value || 0));
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function tooltipFormatter(value, keyName) {
  if (value == null) {
    return "-";
  }
  if (String(keyName).toLowerCase().includes("revenue")) {
    return formatCurrency(value);
  }
  return formatNumber(value);
}

function StatCard({ title, value, subtitle, highlight }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
      <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <p
        className={`mt-2 truncate text-2xl font-semibold ${
          highlight || "text-gray-900 dark:text-slate-100"
        }`}
      >
        {value}
      </p>
      {subtitle ? (
        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
          {subtitle}
        </p>
      ) : null}
    </div>
  );
}

function AdminSalesPredictionTab() {
  const { darkMode } = useTheme();
  const [products, setProducts] = useState([]);
  const [cachedPredictions, setCachedPredictions] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingPrediction, setLoadingPrediction] = useState(false);
  const [loadingBulkPrediction, setLoadingBulkPrediction] = useState(false);
  const [bulkMessage, setBulkMessage] = useState("");
  const [activeMetric, setActiveMetric] = useState("qty");

  const loadProducts = useCallback(async () => {
    setLoadingProducts(true);
    try {
      const result = await fetchAdminProducts({
        page: 1,
        limit: 1000,
        sortField: "display_name",
        sortOrder: 1,
      });
      setProducts(Array.isArray(result?.data) ? result.data : []);
    } catch {
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const loadCachedPredictions = useCallback(async () => {
    try {
      const data = await fetchCachedSalesPredictions();
      setCachedPredictions(Array.isArray(data?.items) ? data.items : []);
    } catch {
      setCachedPredictions([]);
    }
  }, []);

  useEffect(() => {
    Promise.all([loadProducts(), loadCachedPredictions()]);
  }, [loadProducts, loadCachedPredictions]);

  const runPrediction = useCallback(
    async (product) => {
      setSelectedProduct(product);
      setLoadingPrediction(true);
      setError("");
      setPrediction(null);

      try {
        const predicted = await fetchSalesPrediction(product.product_id);
        let hydrated = predicted;

        if (
          !Array.isArray(predicted?.historical) ||
          predicted.historical.length === 0
        ) {
          const history = await fetchSalesHistory(product.product_id);
          hydrated = {
            ...predicted,
            historical: history,
          };
        }

        setPrediction(hydrated);
        await loadCachedPredictions();
      } catch (apiError) {
        setError(
          apiError?.response?.data?.message ||
            "Could not fetch prediction. Ensure the prediction service is running.",
        );
      } finally {
        setLoadingPrediction(false);
      }
    },
    [loadCachedPredictions],
  );

  const runBulkPrediction = useCallback(async () => {
    setLoadingBulkPrediction(true);
    setBulkMessage("");

    try {
      const result = await fetchAllSalesPredictions();
      setBulkMessage(
        `Predicted ${result?.count ?? 0} products and refreshed cache successfully.`,
      );
      await loadCachedPredictions();
    } catch (apiError) {
      setBulkMessage(
        apiError?.response?.data?.message ||
          "Bulk prediction failed. Check prediction service health.",
      );
    } finally {
      setLoadingBulkPrediction(false);
    }
  }, [loadCachedPredictions]);

  const filteredProducts = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    if (!query) {
      return products;
    }
    return products.filter((product) =>
      `${product.display_name || ""} ${product.name || ""} ${product.product_id || ""}`
        .toLowerCase()
        .includes(query),
    );
  }, [products, searchText]);

  const chartData = useMemo(() => {
    if (!prediction) {
      return [];
    }

    const historyRows = Array.isArray(prediction.historical)
      ? prediction.historical
      : [];
    const historicalPoints = historyRows.map((row) => ({
      monthLabel: formatMonthLabel(row.month),
      actual_qty: Number(row.qty || 0),
      actual_revenue: Number(row.revenue || 0),
      forecast_qty: null,
      forecast_revenue: null,
    }));

    const forecastPoint = {
      monthLabel: `${formatMonthLabel(prediction.predicted_month)} *`,
      actual_qty: null,
      actual_revenue: null,
      forecast_qty: Number(prediction.predicted_qty || 0),
      forecast_revenue: Number(prediction.predicted_revenue || 0),
    };

    return [...historicalPoints, forecastPoint];
  }, [prediction]);

  const confidence = prediction?.confidence_score;
  const confidenceLabel =
    confidence == null ? "N/A" : `${Math.round(Number(confidence) * 100)}%`;

  const confidenceColor =
    confidence == null
      ? "text-gray-500 dark:text-gray-400"
      : confidence >= 0.7
        ? "text-emerald-600 dark:text-emerald-400"
        : confidence >= 0.4
          ? "text-[#1A9E8E] dark:text-[#26c9b4]"
          : "text-rose-600 dark:text-rose-400";

  const exportCsv = useCallback(() => {
    if (!prediction || !selectedProduct) {
      return;
    }

    const rows = [
      [
        "Month",
        "Actual Units",
        "Actual Revenue (INR)",
        "Forecast Units",
        "Forecast Revenue (INR)",
        "Type",
      ],
      ...(prediction.historical || []).map((row) => [
        row.month,
        row.qty,
        row.revenue,
        "",
        "",
        "actual",
      ]),
      [
        prediction.predicted_month,
        "",
        "",
        prediction.predicted_qty,
        prediction.predicted_revenue,
        "forecast",
      ],
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `sales_forecast_${selectedProduct.product_id}.csv`;
    anchor.click();
    window.URL.revokeObjectURL(url);
  }, [prediction, selectedProduct]);

  const actualKey = activeMetric === "qty" ? "actual_qty" : "actual_revenue";
  const forecastKey =
    activeMetric === "qty" ? "forecast_qty" : "forecast_revenue";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-slate-100">
            Sales Prediction
          </h2>
          <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">
            Forecast next month demand per product using historical completed
            sales.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={runBulkPrediction}
            disabled={loadingBulkPrediction}
            className="inline-flex items-center gap-2 rounded-lg border border-[#1A9E8E] bg-[#1A9E8E] px-3 py-2 text-sm font-medium text-white hover:bg-[#168c7e] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loadingBulkPrediction ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Predict All
          </button>
          <button
            type="button"
            onClick={exportCsv}
            disabled={!prediction}
            className="inline-flex items-center gap-2 rounded-lg border border-teal-600 bg-teal-600 px-3 py-2 text-sm font-medium text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-70"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </div>

      {bulkMessage ? (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            bulkMessage.toLowerCase().includes("failed")
              ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-900/20 dark:text-rose-300"
              : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-900/20 dark:text-emerald-300"
          }`}
        >
          {bulkMessage}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
            Product Selector
          </h3>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Search active products and run prediction on click.
          </p>

          <input
            type="text"
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search by name or ID"
            className="mt-3 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-[#1A9E8E] dark:border-gray-700 dark:bg-[#0f1720] dark:text-slate-100"
          />

          <div className="mt-3 max-h-[430px] overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-800">
            {loadingProducts ? (
              <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
                Loading products...
              </div>
            ) : filteredProducts.length ? (
              filteredProducts.map((product) => {
                const isActive =
                  selectedProduct?.product_id === product.product_id;
                return (
                  <button
                    key={product.product_id}
                    type="button"
                    onClick={() => runPrediction(product)}
                    className={`block w-full border-b border-gray-200 px-3 py-2 text-left text-sm last:border-b-0 dark:border-gray-800 ${
                      isActive
                        ? "bg-[#e6f7f5] text-[#117a6e] dark:bg-[#1A9E8E]/20 dark:text-[#26c9b4]"
                        : "text-gray-700 hover:bg-gray-50 dark:text-slate-200 dark:hover:bg-[#1a2632]"
                    }`}
                  >
                    <p className="truncate font-medium">
                      {product.display_name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                      #{product.product_id}
                    </p>
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-sm text-gray-500 dark:text-gray-400">
                No products found.
              </div>
            )}
          </div>
        </aside>

        <section className="min-w-0 space-y-4">
          {!selectedProduct && !loadingPrediction ? (
            <div className="flex h-56 items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
              Select a product to generate forecast output.
            </div>
          ) : null}

          {loadingPrediction ? (
            <div className="flex h-56 items-center justify-center rounded-2xl border border-gray-200 bg-white text-sm text-gray-500 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-300">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Running prediction...
            </div>
          ) : null}

          {error && !loadingPrediction ? (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-900/20 dark:text-rose-300">
              {error}
            </div>
          ) : null}

          {prediction && !loadingPrediction ? (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <StatCard
                  title="Predicted Units"
                  value={formatNumber(prediction.predicted_qty)}
                  subtitle={`For ${formatMonthLabel(prediction.predicted_month)}`}
                />
                <StatCard
                  title="Predicted Revenue"
                  value={formatCurrency(prediction.predicted_revenue)}
                  subtitle="Estimated line-item revenue"
                  highlight="text-teal-700 dark:text-teal-300"
                />
                <StatCard
                  title="Model Confidence (R²)"
                  value={confidenceLabel}
                  subtitle={`Model: ${prediction.model_used || "unknown"}`}
                  highlight={confidenceColor}
                />
              </div>

              {prediction.error ? (
                <div className="rounded-lg border border-[#1A9E8E]/30 bg-[#e6f7f5] px-3 py-2 text-sm text-[#117a6e] dark:border-[#1A9E8E]/30 dark:bg-[#1A9E8E]/20 dark:text-[#26c9b4]">
                  {prediction.error}
                </div>
              ) : null}

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
                    <LineChart className="h-4 w-4 text-[#1A9E8E]" />
                    Historical + Forecast ({selectedProduct?.display_name})
                  </div>
                  <div className="inline-flex rounded-lg border border-gray-200 p-1 dark:border-gray-700">
                    <button
                      type="button"
                      onClick={() => setActiveMetric("qty")}
                      className={`rounded-md px-3 py-1 text-xs font-medium ${
                        activeMetric === "qty"
                          ? "bg-[#1A9E8E] text-white"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      Units
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveMetric("revenue")}
                      className={`rounded-md px-3 py-1 text-xs font-medium ${
                        activeMetric === "revenue"
                          ? "bg-[#1A9E8E] text-white"
                          : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                      }`}
                    >
                      Revenue
                    </button>
                  </div>
                </div>

                <ResponsiveContainer width="100%" height={320}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient
                        id="actualGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#0d9488"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="#0d9488"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                      <linearGradient
                        id="forecastGradient"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="#1A9E8E"
                          stopOpacity={0.35}
                        />
                        <stop
                          offset="95%"
                          stopColor="#1A9E8E"
                          stopOpacity={0.05}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke={darkMode ? "#22303d" : "#e5e7eb"}
                    />
                    <XAxis dataKey="monthLabel" tick={{ fontSize: 12 }} />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) =>
                        activeMetric === "revenue"
                          ? `₹${Math.round(Number(value || 0) / 1000)}k`
                          : formatNumber(value)
                      }
                    />
                    <Tooltip formatter={tooltipFormatter} />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey={actualKey}
                      name={
                        activeMetric === "qty"
                          ? "Actual Units"
                          : "Actual Revenue"
                      }
                      stroke="#0d9488"
                      fill="url(#actualGradient)"
                      strokeWidth={2}
                      connectNulls={false}
                      dot={{ r: 3 }}
                    />
                    <Area
                      type="monotone"
                      dataKey={forecastKey}
                      name={
                        activeMetric === "qty"
                          ? "Forecast Units"
                          : "Forecast Revenue"
                      }
                      stroke="#1A9E8E"
                      fill="url(#forecastGradient)"
                      strokeDasharray="6 6"
                      strokeWidth={2}
                      connectNulls={false}
                      dot={{ r: 5 }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </>
          ) : null}
        </section>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
          <Database className="h-4 w-4 text-teal-600" />
          Cached Predictions
        </div>
        {cachedPredictions.length ? (
          <div className="max-h-[500px] overflow-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500 dark:border-gray-800 dark:text-gray-400">
                <tr>
                  <th className="py-2 pr-3">Product</th>
                  <th className="py-2 pr-3">Month</th>
                  <th className="py-2 pr-3">Qty</th>
                  <th className="py-2 pr-3">Revenue</th>
                  <th className="py-2 pr-3">Model</th>
                </tr>
              </thead>
              <tbody>
                {cachedPredictions.map((row) => (
                  <tr
                    key={`${row.product_id}-${row.predicted_month}`}
                    className="border-b border-gray-100 dark:border-gray-800"
                  >
                    <td className="py-2 pr-3 text-gray-900 dark:text-slate-100">
                      {row.display_name}
                    </td>
                    <td className="py-2 pr-3 text-gray-600 dark:text-gray-300">
                      {formatMonthLabel(row.predicted_month)}
                    </td>
                    <td className="py-2 pr-3 text-gray-600 dark:text-gray-300">
                      {formatNumber(row.predicted_qty)}
                    </td>
                    <td className="py-2 pr-3 text-gray-600 dark:text-gray-300">
                      {formatCurrency(row.predicted_revenue)}
                    </td>
                    <td className="py-2 pr-3 text-gray-600 dark:text-gray-300">
                      {row.model_used}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            No cached predictions yet. Run a product prediction or Predict All.
          </p>
        )}
      </div>
    </div>
  );
}

export default AdminSalesPredictionTab;
