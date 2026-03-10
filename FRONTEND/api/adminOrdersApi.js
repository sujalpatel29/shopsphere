/**
 * @module adminOrdersApi
 * @description API layer for admin order and payment management.
 *
 * Combines order-specific endpoints (admin orders listing, detail, status)
 * with payment endpoints (COD completion, Stripe refund) into a single
 * module consumed by AdminOrdersTab and OrderDetailModal.
 *
 * Endpoints used:
 *  - GET   /order/admin/orders                     → fetchAdminOrders
 *  - GET   /order/admin/orders/:id                 → fetchAdminOrderDetail
 *  - PATCH /order/changestatus/:id                 → updateOrderStatus (existing)
 *  - PATCH /order/admin/orders/:id/payment-status  → updatePaymentStatus (new)
 *  - PUT   /payments/:id/complete-cod              → markCODComplete (existing)
 *  - POST  /payments/:id/refund                    → refundPayment (existing)
 */
import api from "./api";

/**
 * Fetch paginated orders with user, address, payment data for admin
 */
export const fetchAdminOrders = async ({
  page = 1,
  limit = 10,
  search = "",
  sortField = "",
  sortOrder = 1,
  orderStatus = null,
  paymentStatus = null,
  paymentMethod = null,
  dateFrom = null,
  dateTo = null,
} = {}) => {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("limit", limit);

  if (search) params.append("search", search);
  if (sortField) {
    params.append("sortField", sortField);
    params.append("sortOrder", sortOrder === 1 ? "asc" : "desc");
  }
  if (orderStatus) params.append("order_status", orderStatus);
  if (paymentStatus) params.append("payment_status", paymentStatus);
  if (paymentMethod) params.append("payment_method", paymentMethod);
  if (dateFrom) params.append("date_from", dateFrom);
  if (dateTo) params.append("date_to", dateTo);

  const response = await api.get(`/order/admin/orders?${params.toString()}`);
  const d = response.data?.data || {};

  return {
    data: d.data || [],
    total: d.pagination?.totalItems || 0,
    stats: d.stats || {},
  };
};

/**
 * Fetch single order detail with items + payments
 */
export const fetchAdminOrderDetail = async (orderId) => {
  const response = await api.get(`/order/admin/orders/${orderId}`);
  return response.data?.data || null;
};

/**
 * Update order status (uses existing endpoint)
 */
export const updateOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/order/changestatus/${orderId}`, {
    latestStatus: status,
  });
  return response.data;
};

/**
 * Update payment status on an order
 */
export const updatePaymentStatus = async (orderId, status) => {
  const response = await api.patch(
    `/order/admin/orders/${orderId}/payment-status`,
    { paymentStatus: status }
  );
  return response.data;
};

/**
 * Mark COD payment as completed (uses existing payment endpoint)
 */
export const markCODComplete = async (paymentId) => {
  const response = await api.put(`/payments/${paymentId}/complete-cod`);
  return response.data;
};

/**
 * Process refund on a payment (uses existing payment endpoint)
 */
export const refundPayment = async (paymentId, { amount, reason } = {}) => {
  const body = {};
  if (amount) body.amount = amount;
  if (reason) body.reason = reason;
  const response = await api.post(`/payments/${paymentId}/refund`, body);
  return response.data;
};
