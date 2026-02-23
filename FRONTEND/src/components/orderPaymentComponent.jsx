import React from "react";
import { RadioButton } from "primereact/radiobutton";
import { Button } from "primereact/button";
import OrderSummaryComponent from "./OrderSummaryComponent";
import { useState } from "react";

export default function orderPaymentComponent() {
  const paymentModes = [
    {
      id: 1,
      name: "Cash On Delivery",
      value: "COD",
      description: "Pay with cash when your order is delivered",
    },
    {
      id: 2,
      name: "Online Payment",
      value: "ONLINE",
      description: "Pay securely using card, UPI, or net banking",
    },
  ];
  const [selectPaymentMode, setSelectPaymentMode] = useState("");
  console.log(selectPaymentMode);
  function handleSubmit() {}
  return (
    <div className="card flex justify-content-center">
      <form onSubmit={handleSubmit} className="flex flex-column gap-2">
        <h2>Select Payment Mode</h2>
        <div className="flex">
          {paymentModes.map((mode) => {
            return (
              <div key={mode.id} className="flex align-items-center mr-3">
                <RadioButton
                  inputId={`payment-${mode.id}`}
                  name="payment"
                  value={mode.value}
                  onChange={(e) => setSelectPaymentMode(mode.value)}
                  checked={selectPaymentMode === mode.value}
                />
                <label
                  htmlFor={`payment-${mode.id}`}
                  className="cursor-pointer"
                >
                  <h3 className="font-semibold">{mode.name}</h3>
                  <p className="text-sm text-gray-500">{mode.description}</p>
                </label>
              </div>
            );
          })}
        </div>
        <Button type="submit" label="Continue" />
      </form>
      <OrderSummaryComponent/>
    </div>
  );
}
