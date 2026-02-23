import React from "react";
import { useSelector } from "react-redux";
import OrderComponent from "../components/orderComponent";
import { Outlet } from "react-router-dom";

export default function OrderPage() {
  const { currentUser } = useSelector((state) => state.auth);

  // only show orders to authenticated users; otherwise ask them to login
  if (!currentUser) {
    return (
      <div className="text-center py-10">
        <p>Please log in to view your orders.</p>
      </div>
    );
  }
  return (
    <>
      <OrderComponent />
      <Outlet />
    </>
  );
}