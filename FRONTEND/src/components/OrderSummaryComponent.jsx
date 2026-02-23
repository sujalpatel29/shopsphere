import React from "react";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import { Tag } from "primereact/tag";

export default function OrderSummaryComponent() {
  
  if (!orderData) return null;

  const rowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "0.75rem"
  };

  return (
    <div>
      <Card
        style={{
          maxWidth: "450px",
          width: "100%",
          padding: "1rem",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
        }}
      >
        {/* Header */}
        <div style={rowStyle}>
          <h3 style={{ margin: 0 }}>Order Summary</h3>
          <Tag
            value={orderData?.order_status || "Processing"}
            severity={
              orderData?.order_status === "completed"
                ? "success"
                : "warning"
            }
          />
        </div>

        {/* Subtotal */}
        <div style={rowStyle}>
          <span>Subtotal</span>
          <span>${orderData?.subtotal || 0}</span>
        </div>

        {/* Tax */}
        <div style={rowStyle}>
          <span>Tax</span>
          <span>${orderData?.tax_amount || 0}</span>
        </div>

        {/* Discount */}
        <div style={rowStyle}>
          <span>Discount</span>
          <span style={{ color: "green" }}>
            - ${orderData?.discount_amount || 0}
          </span>
        </div>

        {/* Shipping */}
        <div style={rowStyle}>
          <span>Shipping</span>
          <span>${orderData?.shipping_amount || 0}</span>
        </div>

        <Divider />

        {/* Total */}
        <div
          style={{
            ...rowStyle,
            fontSize: "1.2rem",
            fontWeight: "bold"
          }}
        >
          <span>Total</span>
          <span>${orderData?.total_amount || 0}</span>
        </div>
      </Card>
    </div>
  );
}