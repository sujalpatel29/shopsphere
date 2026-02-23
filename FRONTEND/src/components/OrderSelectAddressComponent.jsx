import React, { useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { Button } from "primereact/button";
import { RadioButton } from "primereact/radiobutton";
import { fetchUserAddress } from "../redux/slices/orderSlice";
import { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function OrderSelectAddressComponent() {
  const dispatch = useDispatch();
  const navigate = useNavigate(); 
  const [selectedAddress, setSelectedAddress] = useState("");
  useEffect(() => {
    dispatch(fetchUserAddress());
  }, [dispatch]);
  const { userAddresses, loading, error, pagination } = useSelector(
    (state) => state.order || {},
  );
  function handleSubmit(e) {
    e.preventDefault();
    if (!selectedAddress) {
      alert("Please select an address");
      return;
    }
    navigate("/checkout/payment")
  }
  return (
    <form onSubmit={handleSubmit}>
      <div>
        {userAddresses.map((btn, i) => {
          return (
            <div
              key={btn.address_id}
              className="flex items-start gap-3 border rounded-lg p-4 mb-3 shadow-sm hover:shadow-md transition bg-white"
            >
              {/* Radio Button */}
              <RadioButton
                inputId={`addr-${btn.address_id}`}
                name="address"
                value={btn.address_id}
                onChange={(e) => setSelectedAddress(btn)}
                checked={selectedAddress?.address_id === btn.address_id}
              />
              {/* Address Details */}
              <label
                htmlFor={`addr-${btn.address_id}`}
                className="cursor-pointer w-full"
              >
                {/* Name + Phone */}
                <div className="flex justify-between items-center">
                  <h2 className="font-semibold text-gray-800 text-lg">
                    {btn.full_name}
                  </h2>

                  <span className="text-sm text-gray-500">{btn.phone}</span>
                </div>

                {/* Address Line */}
                <p className="text-gray-600 mt-1">
                  {btn.address_line1}, {btn.address_line2}
                </p>

                {/* City / Postal */}
                <p className="text-gray-500 text-sm mt-1">
                  {btn.city}, {btn.state} - {btn.postal_code}
                </p>
              </label>
            </div>
          );
        })}
      </div>
      <Button
        className="bg-teal-700 text-white px-5 py-2 rounded-lg font-medium hover:bg-teal-800 transition"
        type="submit"
        label="Continue With Selected Address"
      />
    </form>
  );
}
