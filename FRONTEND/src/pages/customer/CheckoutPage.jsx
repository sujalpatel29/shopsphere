/**
 * @component CheckoutPage
 * @description Pre-payment checkout screen where the user reviews order
 * details before proceeding to payment.
 *
 * Currently a test/dev page:
 *  - Fixed order ID (#1)
 *  - Editable amount via PrimeReact InputNumber
 *  - "Continue to Payment" navigates to PaymentPage with state
 *
 * Route: /checkout (customer-facing)
 * Navigates to: /checkout/payment (PaymentPage) with { orderId, amount, currency }
 */
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "primereact/button";
import { InputNumber } from "primereact/inputnumber";
import { useTheme } from "../../context/ThemeContext";

function CheckoutPage() {
  const navigate = useNavigate();
  const { darkMode } = useTheme();

  const [orderId] = useState(1);
  const [amount, setAmount] = useState(1);

  const formattedAmount = useMemo(
    () =>
      new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
      }).format(Number(amount || 0)),
    [amount],
  );

  const handleContinue = () => {
    const parsedAmount = Number(amount);
    if (!parsedAmount || parsedAmount <= 0) return;

    navigate("/checkout/payment", {
      state: { orderId, amount: parsedAmount, currency: "INR" },
    });
  };

  return (
    <div className="mx-auto max-w-3xl">
      <section
        className={`rounded-3xl border p-7 md:p-9 ${
          darkMode
            ? "border-[#1f2933] bg-[#151e22] text-slate-100"
            : "border-amber-200/70 bg-[#fff8ee] text-gray-900"
        }`}
      >
        <p className="font-accent text-xs uppercase tracking-[0.18em] text-amber-600">
          Checkout
        </p>
        <h1 className="mt-2 font-serif text-3xl">Review Before Payment</h1>
        <p className={`mt-2 text-sm ${darkMode ? "text-slate-300" : "text-gray-600"}`}>
          Test mode order ID is fixed to `#1`.
        </p>

        <div className="mt-7 grid gap-4 md:grid-cols-2">
          <div>
            <label className={`mb-2 block text-xs uppercase tracking-[0.12em] ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
              Order ID
            </label>
            <input
              type="text"
              value={orderId}
              readOnly
              className="w-full rounded-lg border border-gray-200 bg-gray-100 px-3 py-2 text-gray-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          <div>
            <label className={`mb-2 block text-xs uppercase tracking-[0.12em] ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
              Total Amount (INR)
            </label>
            <InputNumber
              value={amount}
              onValueChange={(event) => setAmount(event.value || 0)}
              mode="decimal"
              minFractionDigits={2}
              maxFractionDigits={2}
              className="w-full"
              inputClassName="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-gray-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <div
          className={`mt-6 rounded-xl border p-4 ${
            darkMode ? "border-[#1f2933] bg-[#10171b]" : "border-amber-200/70 bg-white"
          }`}
        >
          <p className={`text-xs uppercase tracking-[0.12em] ${darkMode ? "text-slate-400" : "text-gray-500"}`}>
            Payable
          </p>
          <p className="mt-1 font-accent text-2xl font-semibold">{formattedAmount}</p>
        </div>

        <Button
          type="button"
          onClick={handleContinue}
          label="Continue to Payment"
          className="mt-7 !inline-flex !items-center !justify-center !rounded-xl !bg-amber-600 !px-6 !py-3 !font-semibold !text-white !shadow-md hover:!bg-amber-700"
        />
      </section>
    </div>
  );
}

export default CheckoutPage;

