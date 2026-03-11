import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Message } from "primereact/message";
import api from "../../../../../api/api";
import { extractData, extractErrorMessage, toArray } from "../utils";
import OrderDetailsModal from "./OrderDetailsModal";
import OrdersTable from "./OrdersTable";

const normalizeRecord = (payload) => {
  if (Array.isArray(payload)) {
    return payload[0] || null;
  }

  return payload || null;
};

const normalizeStatus = (status) => String(status || "").toLowerCase();

const invoiceAllowed = (order) =>
  ["completed", "delivered"].includes(normalizeStatus(order?.order_status));

const escapeHtml = (value) =>
  String(value ?? "-").replace(/[&<>"']/g, (match) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return map[match] || match;
  });

function OrdersPage() {
  const productImageCacheRef = useRef(new Map());

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [cancelingId, setCancelingId] = useState(null);
  const [returningId, setReturningId] = useState(null);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [paymentRecord, setPaymentRecord] = useState(null);
  const [deliveryAddress, setDeliveryAddress] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [detailsError, setDetailsError] = useState("");

  const resolveProductImage = useCallback(async (productId) => {
    const normalizedProductId = Number(productId);

    if (!normalizedProductId) {
      return "";
    }

    if (productImageCacheRef.current.has(normalizedProductId)) {
      return productImageCacheRef.current.get(normalizedProductId) || "";
    }

    try {
      const response = await api.get(`/productImages/${normalizedProductId}`);
      const imageRows = toArray(extractData(response));
      const primaryImage =
        imageRows.find((entry) => Number(entry?.is_primary) === 1) || imageRows[0];
      const imageUrl = primaryImage?.image_url || "";

      productImageCacheRef.current.set(normalizedProductId, imageUrl);
      return imageUrl;
    } catch {
      productImageCacheRef.current.set(normalizedProductId, "");
      return "";
    }
  }, []);

  const hydrateItemsWithImages = useCallback(
    async (items) => {
      const rawItems = toArray(items);

      const updatedItems = await Promise.all(
        rawItems.map(async (item) => {
          const existingImage =
            item?.image_url ||
            item?.image ||
            item?.imageUrl ||
            item?.product_image ||
            item?.productImage;

          if (existingImage) {
            return item;
          }

          const imageUrl = await resolveProductImage(item?.product_id);

          if (!imageUrl) {
            return item;
          }

          return {
            ...item,
            image_url: imageUrl,
          };
        }),
      );

      return updatedItems;
    },
    [resolveProductImage],
  );

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await api.get("/order/user-allorder");
      const payload = toArray(extractData(response));

      const sortedOrders = [...payload].sort((a, b) => {
        const aDate = new Date(a?.created_at || a?.placed_at || 0).getTime();
        const bDate = new Date(b?.created_at || b?.placed_at || 0).getTime();

        if (aDate !== bDate) {
          return bDate - aDate;
        }

        return Number(b?.order_id || 0) - Number(a?.order_id || 0);
      });

      const summaryResults = await Promise.all(
        sortedOrders.map(async (order) => {
          const orderId = Number(order?.order_id);

          if (!orderId) {
            return { orderId: null, items: [] };
          }

          try {
            const itemsResponse = await api.get(`/order-item/${orderId}/items`);
            const items = await hydrateItemsWithImages(extractData(itemsResponse));

            return {
              orderId,
              items: toArray(items),
            };
          } catch {
            return { orderId, items: [] };
          }
        }),
      );

      const itemsMap = new Map(
        summaryResults
          .filter((entry) => Number(entry.orderId))
          .map((entry) => [Number(entry.orderId), entry.items]),
      );

      const normalizedOrders = sortedOrders.map((order) => ({
        ...order,
        summaryItems: toArray(itemsMap.get(Number(order?.order_id))),
      }));

      setOrders(normalizedOrders);
      return normalizedOrders;
    } catch (apiError) {
      if (apiError?.response?.status === 404) {
        setOrders([]);
        return [];
      }

      setError(extractErrorMessage(apiError, "Failed to load orders."));
      return [];
    } finally {
      setLoading(false);
    }
  }, [hydrateItemsWithImages]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const loadOrderDetails = useCallback(async (order) => {
    const orderId = Number(order?.order_id);
    if (!orderId) {
      return;
    }

    setDetailsLoading(true);
    setDetailsError("");
    setOrderItems([]);
    setPaymentRecord(null);
    setDeliveryAddress(null);

    try {
      const orderItemsRequest = api.get(`/order-item/${orderId}/items`);
      const paymentsRequest = api.get(`/payments/order/${orderId}`);
      const addressId = Number(order?.address_id);
      const addressRequest = addressId
        ? api.get(`/users/address/${addressId}`)
        : api.get("/users/getDefault");

      const [itemsResult, paymentsResult, addressResult] = await Promise.allSettled([
        orderItemsRequest,
        paymentsRequest,
        addressRequest,
      ]);

      if (itemsResult.status === "fulfilled") {
        const itemsWithImages = await hydrateItemsWithImages(
          extractData(itemsResult.value),
        );
        setOrderItems(toArray(itemsWithImages));
      } else {
        setDetailsError(
          extractErrorMessage(itemsResult.reason, "Failed to load order items."),
        );
      }

      if (paymentsResult.status === "fulfilled") {
        const paymentRows = toArray(extractData(paymentsResult.value));
        const latestPayment = [...paymentRows].sort((a, b) => {
          const aDate = new Date(a?.created_at || 0).getTime();
          const bDate = new Date(b?.created_at || 0).getTime();

          if (aDate !== bDate) {
            return bDate - aDate;
          }

          return Number(b?.payment_id || 0) - Number(a?.payment_id || 0);
        })[0];

        setPaymentRecord(latestPayment || null);
      }

      if (addressResult.status === "fulfilled") {
        setDeliveryAddress(normalizeRecord(extractData(addressResult.value)));
      } else if (Number(order?.address_id)) {
        try {
          const fallbackAddressResponse = await api.get("/users/getDefault");
          setDeliveryAddress(normalizeRecord(extractData(fallbackAddressResponse)));
        } catch {
          setDeliveryAddress(null);
        }
      }
    } finally {
      setDetailsLoading(false);
    }
  }, [hydrateItemsWithImages]);

  const handleBackToOrders = useCallback(() => {
    setSelectedOrder(null);
    setOrderItems([]);
    setPaymentRecord(null);
    setDeliveryAddress(null);
    setDetailsError("");
  }, []);

  const openOrderDetails = useCallback(
    async (order) => {
      setSelectedOrder(order);
      await loadOrderDetails(order);
    },
    [loadOrderDetails],
  );

  const syncSelectedOrderAfterAction = useCallback(
    async (orderId, refreshedOrders) => {
      if (Number(selectedOrder?.order_id) !== orderId) {
        return;
      }

      const freshOrder = refreshedOrders.find(
        (order) => Number(order?.order_id) === orderId,
      );

      if (!freshOrder) {
        handleBackToOrders();
        return;
      }

      setSelectedOrder(freshOrder);
      await loadOrderDetails(freshOrder);
    },
    [handleBackToOrders, loadOrderDetails, selectedOrder?.order_id],
  );

  const handleCancelOrder = useCallback(
    async (order) => {
      const orderId = Number(order?.order_id);
      if (!orderId) {
        return;
      }

      const confirmed = window.confirm("Cancel this order?");
      if (!confirmed) {
        return;
      }

      setCancelingId(orderId);
      setSuccessMessage("");
      setError("");

      try {
        await api.delete(`/order/cancelorder/${orderId}`);
        setSuccessMessage("Order canceled successfully.");
        const refreshedOrders = await loadOrders();
        await syncSelectedOrderAfterAction(orderId, refreshedOrders);
      } catch (apiError) {
        setError(extractErrorMessage(apiError, "Failed to cancel order."));
      } finally {
        setCancelingId(null);
      }
    },
    [loadOrders, syncSelectedOrderAfterAction],
  );

  const handleReturnOrder = useCallback(
    async (order) => {
      const orderId = Number(order?.order_id);
      if (!orderId) {
        return;
      }

      const confirmed = window.confirm("Request return for this order?");
      if (!confirmed) {
        return;
      }

      setReturningId(orderId);
      setSuccessMessage("");
      setError("");

      try {
        await api.patch(`/order/returnorder/${orderId}`);
        setSuccessMessage("Return request submitted successfully.");
        const refreshedOrders = await loadOrders();
        await syncSelectedOrderAfterAction(orderId, refreshedOrders);
      } catch (apiError) {
        setError(extractErrorMessage(apiError, "Failed to return order."));
      } finally {
        setReturningId(null);
      }
    },
    [loadOrders, syncSelectedOrderAfterAction],
  );

  const handleInvoiceDownload = useCallback((order) => {
    const targetOrder = order || selectedOrder;

    if (!targetOrder || !invoiceAllowed(targetOrder)) {
      return;
    }

    try {
      const itemRows = orderItems
        .map((item, index) => {
          const itemName = escapeHtml(item?.product_name || `Item ${index + 1}`);
          const variant = escapeHtml(item?.portion_value || "-");
          const modifier = escapeHtml(item?.modifier_value || "-");
          const quantity = Number(item?.quantity) || 0;
          const price = Number(item?.price) || 0;
          const total = Number(item?.total) || 0;

          return `
            <tr>
              <td>${index + 1}</td>
              <td>${itemName}</td>
              <td>${variant}</td>
              <td>${modifier}</td>
              <td>${quantity}</td>
              <td>${price.toFixed(2)}</td>
              <td>${total.toFixed(2)}</td>
            </tr>
          `;
        })
        .join("");

      const addressText = [
        deliveryAddress?.full_name,
        deliveryAddress?.address_line1,
        deliveryAddress?.address_line2,
        deliveryAddress?.city,
        deliveryAddress?.state,
        deliveryAddress?.postal_code,
      ]
        .filter(Boolean)
        .join(", ");

      const invoiceMarkup = `
        <!doctype html>
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <title>Invoice ${escapeHtml(targetOrder?.order_number || targetOrder?.order_id)}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
              h1 { margin-bottom: 4px; }
              .meta { margin-bottom: 22px; color: #475569; }
              .panel { border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px; margin-bottom: 16px; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; }
              th, td { border: 1px solid #e2e8f0; padding: 8px; text-align: left; font-size: 12px; }
              th { background: #f8fafc; }
              .totals { margin-top: 14px; text-align: right; font-weight: 700; }
            </style>
          </head>
          <body>
            <h1>Tax Invoice</h1>
            <p class="meta">Generated on ${escapeHtml(new Date().toLocaleString("en-IN"))}</p>
            <div class="panel">
              <p><strong>Order Number:</strong> ${escapeHtml(targetOrder?.order_number || `#${targetOrder?.order_id}`)}</p>
              <p><strong>Order Date:</strong> ${escapeHtml(new Date(targetOrder?.created_at || Date.now()).toLocaleString("en-IN"))}</p>
              <p><strong>Order Status:</strong> ${escapeHtml(targetOrder?.order_status)}</p>
              <p><strong>Payment Method:</strong> ${escapeHtml(paymentRecord?.payment_method || targetOrder?.payment_method || "-")}</p>
              <p><strong>Payment Status:</strong> ${escapeHtml(paymentRecord?.status || targetOrder?.payment_status || "-")}</p>
            </div>
            <div class="panel">
              <p><strong>Delivery Address:</strong> ${escapeHtml(addressText || "-")}</p>
            </div>
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Product</th>
                  <th>Variant</th>
                  <th>Modifier</th>
                  <th>Qty</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemRows || "<tr><td colspan='7'>No items found.</td></tr>"}
              </tbody>
            </table>
            <p class="totals">Grand Total: ${escapeHtml((Number(targetOrder?.total_amount) || 0).toFixed(2))}</p>
          </body>
        </html>
      `;

      const blob = new Blob([invoiceMarkup], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `invoice-${targetOrder?.order_number || targetOrder?.order_id}.html`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);

      setSuccessMessage("Invoice downloaded successfully.");
    } catch {
      setError("Failed to download invoice.");
    }
  }, [deliveryAddress, orderItems, paymentRecord, selectedOrder]);

  const filteredOrders = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return orders;
    }

    return orders.filter((order) => {
      const orderText = [
        order?.order_number,
        order?.order_status,
        order?.payment_status,
        order?.total_amount,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const itemText = toArray(order?.summaryItems)
        .map((item) => [item?.product_name, item?.portion_value, item?.modifier_value].join(" "))
        .join(" ")
        .toLowerCase();

      return orderText.includes(query) || itemText.includes(query);
    });
  }, [orders, searchTerm]);

  const actionLoading = useMemo(
    () => ({ cancelingId, returningId }),
    [cancelingId, returningId],
  );

  return (
    <div className="space-y-5">
      {successMessage && (
        <Message severity="success" text={successMessage} className="w-full" />
      )}
      {error && <Message severity="error" text={error} className="w-full" />}

      {selectedOrder ? (
        <OrderDetailsModal
          order={selectedOrder}
          items={orderItems}
          payment={paymentRecord}
          address={deliveryAddress}
          loading={detailsLoading}
          error={detailsError}
          actionLoading={actionLoading}
          onBack={handleBackToOrders}
          onCancelOrder={handleCancelOrder}
          onReturnOrder={handleReturnOrder}
          onDownloadInvoice={handleInvoiceDownload}
        />
      ) : (
        <OrdersTable
          loading={loading}
          orders={filteredOrders}
          totalOrders={orders.length}
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          onOpenOrder={openOrderDetails}
          actionLoading={actionLoading}
          onCancelOrder={handleCancelOrder}
          onReturnOrder={handleReturnOrder}
        />
      )}
    </div>
  );
}

export default OrdersPage;
