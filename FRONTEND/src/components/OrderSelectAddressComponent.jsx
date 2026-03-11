import React, { useEffect, useState } from "react";
import { Button } from "primereact/button";
import { RadioButton } from "primereact/radiobutton";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { fetchUserAddress } from "../redux/slices/orderSlice";
import OrderSummaryComponent from "./OrderSummaryComponent";
import { MapPin } from "lucide-react";

const formatPersonName = (value = "") =>
  value
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

export default function OrderSelectAddressComponent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState(null);

  useEffect(() => {
    dispatch(fetchUserAddress());
  }, [dispatch]);

  const { userAddresses, loading, error } = useSelector((state) => state.order || {});

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAddress) return;

    navigate("/checkout/payment", {
      state: { selectedAddress },
    });
  };

  return (
    <div className="order-flow-shell">
      <section className="order-flow-hero">
        <div className="order-flow-hero-content flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="order-flow-eyebrow">Step 1 of 3</p>
            <h2 className="order-flow-title">Select Delivery Address</h2>
            <p className="order-flow-text">
              Choose the address where your COD order should be delivered.
            </p>
          </div>
          <div className="order-flow-card-muted flex items-center gap-3 self-start md:self-auto">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
              <MapPin className="h-6 w-6" />
            </span>
            <div>
              <p className="order-flow-stat-label">Saved Addresses</p>
              <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-slate-100">
                {userAddresses?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </section>

      <form onSubmit={handleSubmit} className="order-flow-grid">
        <div className="space-y-4">
          <div className="order-flow-card">
            <div className="mb-5">
              <h3 className="order-flow-section-title">Delivery Address</h3>
              <p className="order-flow-section-copy">
                Pick one of your saved addresses to continue with checkout.
              </p>
            </div>

            {loading && <div className="order-flow-empty">Loading addresses...</div>}
            {!loading && error && (
              <div className="order-flow-alert border-red-300/70 bg-red-50 text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                {error}
              </div>
            )}
            {!loading && !error && userAddresses?.length === 0 && (
              <div className="order-flow-empty">
                No addresses found. Add an address before continuing to payment.
              </div>
            )}

            {!loading &&
              !error &&
              userAddresses?.map((address) => {
                const isSelected = selectedAddress?.address_id === address.address_id;

                return (
                  <div
                    key={address.address_id}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedAddress(address)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedAddress(address);
                      }
                    }}
                    className={`mb-3 cursor-pointer ${isSelected ? "order-flow-option order-flow-option-active" : "order-flow-option"}`}
                  >
                    <div className="flex items-start gap-3">
                      <RadioButton
                        inputId={`addr-${address.address_id}`}
                        name="address"
                        value={address.address_id}
                        onChange={() => setSelectedAddress(address)}
                        checked={isSelected}
                      />

                      <label htmlFor={`addr-${address.address_id}`} className="w-full cursor-pointer">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h3 className="m-0 font-semibold text-gray-900 dark:text-slate-100">
                            {formatPersonName(address.full_name)}
                          </h3>
                          <span className="text-sm text-gray-500 dark:text-slate-400">
                            {address.phone}
                          </span>
                        </div>
                        <p className="m-0 mt-2 text-sm leading-6 text-gray-700 dark:text-slate-300">
                          {address.address_line1}
                          {address.address_line2 ? `, ${address.address_line2}` : ""}
                        </p>
                        <p className="m-0 mt-1 text-sm text-gray-500 dark:text-slate-400">
                          {address.city}, {address.state} - {address.postal_code}
                        </p>
                      </label>
                    </div>
                  </div>
                );
              })}

            <Button
              type="submit"
              label="Continue to Payment Mode"
              icon="pi pi-arrow-right"
              iconPos="right"
              disabled={!selectedAddress}
              className="order-flow-primary-button mt-2"
            />
          </div>
        </div>

        <div className="space-y-4">
          <OrderSummaryComponent title="Current Cart Summary" />
        </div>
      </form>
    </div>
  );
}
