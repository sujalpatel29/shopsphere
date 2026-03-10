/**
 * @component PaymentPage
 * @description Payment method selection page with three options:
 *
 *  1. Stripe   → Initiates a Stripe Checkout Session via POST /payments/initiate,
 *                then redirects to Stripe's hosted checkout page.
 *  2. COD      → Calls POST /payments/initiate with payment_method="cash_on_delivery",
 *                then navigates to /dashboard on success.
 *  3. UPI QR   → Generates a UPI deep-link QR code (client-side via qrcode lib)
 *                using env vars VITE_UPI_ID and VITE_UPI_NAME.
 *
 * Reads order data from React Router location.state (orderId, amount, currency)
 * passed by CheckoutPage. Handles Stripe return via ?status=success|cancel query param.
 *
 * Route: /checkout/payment (customer-facing)
 * Dependencies: qrcode (npm), lucide-react, PrimeReact Button
 */
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { BadgeIndianRupee, CreditCard, QrCode } from "lucide-react";
import { Button } from "primereact/button";
import QRCode from "qrcode";
import api from "../../../api/api";
import { useTheme } from "../../context/ThemeContext";

function PaymentPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { darkMode } = useTheme();

  const stateOrderId = Number(location.state?.orderId || 0);
  const stateAmount = Number(location.state?.amount || 0);
  const stateCurrency = location.state?.currency || "INR";
  const effectiveOrderId = stateOrderId || 1;
  const resolvedAmount = stateAmount || 1;

  const [loadingMethod, setLoadingMethod] = useState("");
  const [showQr, setShowQr] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");

  const status = searchParams.get("status");
  const upiId = import.meta.env.VITE_UPI_ID || "merchant@upi";
  const upiName = import.meta.env.VITE_UPI_NAME || "ShopSphere";

  const upiPaymentUrl = useMemo(() => {
    const validAmount = Number(resolvedAmount || 0).toFixed(2);
    return `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
      upiName,
    )}&am=${encodeURIComponent(validAmount)}&cu=INR&tn=${encodeURIComponent(
      `Order #${effectiveOrderId}`,
    )}`;
  }, [upiId, upiName, resolvedAmount, effectiveOrderId]);

  useEffect(() => {
    const generateQr = async () => {
      try {
        const url = await QRCode.toDataURL(upiPaymentUrl, { width: 260, margin: 1 });
        setQrDataUrl(url);
      } catch {
        setQrDataUrl("");
      }
    };
    generateQr();
  }, [upiPaymentUrl]);

  const formattedAmount = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: stateCurrency,
      }).format(Number(resolvedAmount || 0)),
    [resolvedAmount, stateCurrency],
  );

  const handleCashOnDelivery = async () => {
    if (!effectiveOrderId || !resolvedAmount) {
      setError("Invalid checkout data. Please go back to checkout.");
      return;
    }

    try {
      setError("");
      setMessage("");
      setLoadingMethod("cash_on_delivery");

      await api.post("/payments/initiate", {
        order_id: effectiveOrderId,
        amount: resolvedAmount,
        currency: stateCurrency,
        payment_method: "cash_on_delivery",
      });

      setMessage("Cash on Delivery selected successfully.");
      navigate("/dashboard");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to initiate COD payment");
    } finally {
      setLoadingMethod("");
    }
  };

  const handleStripe = async () => {
    if (!effectiveOrderId || !resolvedAmount) {
      setError("Invalid checkout data. Please go back to checkout.");
      return;
    }

    try {
      setError("");
      setMessage("");
      setLoadingMethod("stripe");

      const { data } = await api.post("/payments/initiate", {
        order_id: effectiveOrderId,
        amount: resolvedAmount,
        currency: stateCurrency,
        payment_method: "stripe",
        success_url: `${window.location.origin}/checkout/payment?status=success`,
        cancel_url: `${window.location.origin}/checkout/payment?status=cancel`,
      });

      const checkoutUrl = data?.data?.checkout_url || data?.data?.url;
      if (!checkoutUrl) {
        setError("Stripe checkout URL missing from backend response.");
        return;
      }

      window.location.assign(checkoutUrl);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Failed to initiate Stripe payment");
    } finally {
      setLoadingMethod("");
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <section
        className={`rounded-3xl border p-7 md:p-9 ${
          darkMode
            ? "border-[#1f2933] bg-[#151e22] text-slate-100"
            : "border-amber-200/70 bg-[#fff8ee] text-gray-900"
        }`}
      >
        <p className="font-accent text-xs uppercase tracking-[0.18em] text-amber-600">
          Payment
        </p>
        <h1 className="mt-2 font-serif text-3xl">Choose Payment Method</h1>
        <p className={`mt-2 text-sm ${darkMode ? "text-slate-300" : "text-gray-600"}`}>
          Choose Stripe, Cash on Delivery, or Pay with QR.
        </p>

        {status === "success" && (
          <div className="mt-4 rounded-xl border border-emerald-300/60 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            Stripe payment completed successfully.
          </div>
        )}
        {status === "cancel" && (
          <div className="mt-4 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Stripe payment was cancelled. You can try again.
          </div>
        )}
        {error && (
          <div className="mt-4 rounded-xl border border-red-300/60 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {message && (
          <div className="mt-4 rounded-xl border border-emerald-300/60 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
            {message}
          </div>
        )}

        <div
          className={`mt-6 rounded-xl border p-4 ${
            darkMode ? "border-[#1f2933] bg-[#10171b]" : "border-amber-200/70 bg-white"
          }`}
        >
          <p className={`text-xs uppercase tracking-[0.12em] ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
            Order Summary
          </p>
          <p className="mt-1 text-sm">Order ID: {effectiveOrderId || "-"}</p>
          <p className="mt-1 font-accent text-2xl font-semibold">{formattedAmount}</p>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-3">
          <div className={`rounded-2xl border p-5 ${darkMode ? "border-[#1f2933] bg-[#10171b]" : "border-amber-200/70 bg-white"}`}>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <CreditCard className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-serif text-xl">Stripe</h2>
                <p className={`text-sm ${darkMode ? "text-slate-300" : "text-gray-600"}`}>Continue to Stripe checkout.</p>
              </div>
            </div>
            <Button type="button" onClick={handleStripe} disabled={loadingMethod.length > 0} label={loadingMethod === "stripe" ? "Redirecting..." : "Pay with Stripe"} className="mt-5 !w-full !rounded-xl !bg-[#635bff] !px-4 !py-3 !font-semibold !text-white hover:!bg-[#4f46e5]" />
          </div>

          <div className={`rounded-2xl border p-5 ${darkMode ? "border-[#1f2933] bg-[#10171b]" : "border-amber-200/70 bg-white"}`}>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <BadgeIndianRupee className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-serif text-xl">Cash on Delivery</h2>
                <p className={`text-sm ${darkMode ? "text-slate-300" : "text-gray-600"}`}>Pay when order is delivered.</p>
              </div>
            </div>
            <Button type="button" onClick={handleCashOnDelivery} disabled={loadingMethod.length > 0} label={loadingMethod === "cash_on_delivery" ? "Processing..." : "Choose COD"} className="mt-5 !w-full !rounded-xl !bg-amber-600 !px-4 !py-3 !font-semibold !text-white hover:!bg-amber-700" />
          </div>

          <div className={`rounded-2xl border p-5 ${darkMode ? "border-[#1f2933] bg-[#10171b]" : "border-amber-200/70 bg-white"}`}>
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                <QrCode className="h-5 w-5" />
              </span>
              <div>
                <h2 className="font-serif text-xl">Pay with QR</h2>
                <p className={`text-sm ${darkMode ? "text-slate-300" : "text-gray-600"}`}>Generate UPI QR and scan to pay.</p>
              </div>
            </div>
            <Button type="button" onClick={() => setShowQr((prev) => !prev)} label={showQr ? "Hide QR" : "Show QR"} className="mt-5 !w-full !rounded-xl !bg-[#163332] !px-4 !py-3 !font-semibold !text-white hover:!bg-[#102a29]" />
          </div>
        </div>

        {showQr && (
          <div className={`mt-4 rounded-2xl border p-5 ${darkMode ? "border-[#1f2933] bg-[#10171b]" : "border-amber-200/70 bg-white"}`}>
            <h2 className="font-serif text-xl">UPI QR (Custom Amount)</h2>
            <p className={`mt-1 text-sm ${darkMode ? "text-slate-300" : "text-gray-600"}`}>Scan this QR and pay exactly {formattedAmount}.</p>
            <div className="mt-4 flex flex-col items-start gap-3 md:flex-row md:items-center">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="UPI payment QR" className="h-[220px] w-[220px] rounded-xl border border-amber-200 bg-white p-2" />
              ) : (
                <div className="flex h-[220px] w-[220px] items-center justify-center rounded-xl border border-amber-200 bg-white text-sm text-gray-500">QR not available</div>
              )}
              <div className={`text-sm ${darkMode ? "text-slate-300" : "text-gray-600"}`}>
                <p>UPI ID: {upiId}</p>
                <p>Payee: {upiName}</p>
                <p>Amount: {formattedAmount}</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

export default PaymentPage;

