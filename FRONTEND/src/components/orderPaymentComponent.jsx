import React, { useState } from "react";
import { RadioButton } from "primereact/radiobutton";
import { Button } from "primereact/button";
import { useLocation, useNavigate } from "react-router-dom";
import OrderSummaryComponent from "./OrderSummaryComponent";
import { Banknote, CreditCard } from "lucide-react";

const formatPersonName = (value = "") =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

export default function OrderPaymentComponent() {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedAddress = location.state?.selectedAddress;

  const [selectPaymentMode, setSelectPaymentMode] = useState("COD");

  const paymentModes = [
    {
      id: 1,
      name: "Cash On Delivery",
      value: "COD",
      description: "Pay when your order is delivered",
      status: "active",
    },
    {
      id: 2,
      name: "Online Payment",
      value: "ONLINE",
      description: "Card / UPI / Netbanking",
      status: "soon",
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();

    if (selectPaymentMode === "COD") {
      navigate("/checkout/beforeorderconfirm", {
        state: { selectedAddress },
      });
      return;
    }

    alert("Online payment will be enabled soon. Please use Cash on Delivery.");
  };

  return (
    <div className="order-flow-shell">
      <section className="order-flow-hero">
        <div className="order-flow-hero-content">
          <p className="order-flow-eyebrow">Step 2 of 3</p>
          <h2 className="order-flow-title">Choose Payment Mode</h2>
          <p className="order-flow-text">
            Select your preferred payment method for this order.
          </p>
        </div>
      </section>

      <div className="order-flow-grid">
        <div>
          <form onSubmit={handleSubmit} className="order-flow-card">
            <div className="mb-5">
              <h3 className="order-flow-section-title">Payment Options</h3>
              <p className="order-flow-section-copy">
                Cash on delivery is active now. Online payment is listed for the
                upcoming flow so the layout stays consistent.
              </p>
            </div>

            <div>
              {paymentModes.map((mode) => {
                const isSelected = selectPaymentMode === mode.value;
                const isSoon = mode.status === "soon";
                const Icon = mode.value === "COD" ? Banknote : CreditCard;

                return (
                  <div
                    key={mode.id}
                    className={`mb-3 ${isSelected ? "order-flow-option order-flow-option-active" : "order-flow-option"} ${isSoon ? "opacity-80" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <RadioButton
                        inputId={`payment-${mode.id}`}
                        name="payment"
                        value={mode.value}
                        onChange={() => setSelectPaymentMode(mode.value)}
                        checked={isSelected}
                      />
                      <label
                        htmlFor={`payment-${mode.id}`}
                        className="w-full cursor-pointer"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-3">
                            <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                              <Icon className="h-5 w-5" />
                            </span>
                            <h3 className="m-0 font-semibold text-gray-900 dark:text-slate-100">
                              {mode.name}
                            </h3>
                          </div>
                          {isSoon && (
                            <span className="order-flow-badge">Coming Soon</span>
                          )}
                        </div>
                        <p className="m-0 mt-2 text-sm text-gray-500 dark:text-slate-400">
                          {mode.description}
                        </p>
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <Button
                type="button"
                label="Back to Address"
                icon="pi pi-arrow-left"
                outlined
                onClick={() => navigate("/checkout/address")}
                className="order-flow-secondary-button"
              />
              <Button
                type="submit"
                label="Continue to Confirmation"
                icon="pi pi-arrow-right"
                iconPos="right"
                className="order-flow-primary-button"
              />
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <OrderSummaryComponent title="Payable Summary" />
          {selectedAddress && (
            <div className="order-flow-card-muted">
              <p className="font-accent text-xs font-semibold uppercase tracking-[0.14em] text-gray-500 dark:text-slate-400">
                Delivering To
              </p>
              <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-slate-100">
                {formatPersonName(selectedAddress.full_name)}, {selectedAddress.phone}
              </p>
              <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-slate-300">
                {selectedAddress.address_line1}
                {selectedAddress.address_line2
                  ? `, ${selectedAddress.address_line2}`
                  : ""}
                {` ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.postal_code}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
