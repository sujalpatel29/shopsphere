/**
 * @component AdminOrdersTab
 * @description Orders & Payments management tab for admin dashboard
 *
 * Features:
 *  - View all orders with pagination
 *  - Search/filter orders by status, order ID, customer
 *  - Update order status (pending, processing, shipped, delivered, cancelled)
 *  - View order details
 *  - Handle payment status
 */
import { useState, useEffect, useCallback, useRef } from "react";
import { Toast } from "primereact/toast";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Dialog } from "primereact/dialog";
import { Card } from "primereact/card";
import { Skeleton } from "primereact/skeleton";
import { Badge } from "primereact/badge";
import {
  Search,
  Eye,
  Package,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  CreditCard,
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import "./AdminOrders.css";

// Mock API - replace with actual orders API
const mockFetchOrders = async ({ page, limit, search, status }) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  return {
    data: [],
    total: 0,
    totalPending: 0,
    totalProcessing: 0,
    totalShipped: 0,
    totalDelivered: 0,
  };
};

const orderStatusOptions = [
  { label: "All", value: null },
  { label: "Pending", value: "pending" },
  { label: "Processing", value: "processing" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
  { label: "Cancelled", value: "cancelled" },
];

const paymentStatusOptions = [
  { label: "Pending", value: "pending" },
  { label: "Paid", value: "paid" },
  { label: "Failed", value: "failed" },
  { label: "Refunded", value: "refunded" },
];

const getStatusSeverity = (status) => {
  switch (status) {
    case "delivered":
      return "success";
    case "shipped":
      return "info";
    case "processing":
      return "warning";
    case "pending":
      return "secondary";
    case "cancelled":
      return "danger";
    default:
      return "secondary";
  }
};

const getPaymentStatusSeverity = (status) => {
  switch (status) {
    case "paid":
      return "success";
    case "pending":
      return "warning";
    case "failed":
      return "danger";
    case "refunded":
      return "info";
    default:
      return "secondary";
  }
};

function AdminOrdersTab() {
  const toast = useRef(null);
  const { darkMode } = useTheme();

  // Orders data state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);

  // Stats
  const [stats, setStats] = useState({
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
  });

  // Lazy loading parameters
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: "order_date",
    sortOrder: -1,
    search: "",
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState(null);

  // Selected order for details modal
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsModal, setDetailsModal] = useState(false);

  // Operation states
  const [updating, setUpdating] = useState(false);

  const showToast = useCallback((severity, summary, detail) => {
    toast.current?.show({
      severity,
      summary,
      detail,
      life: 3000,
    });
  }, []);

  // Fetch orders from API
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const result = await mockFetchOrders({
        page: lazyParams.page,
        limit: lazyParams.rows,
        search: lazyParams.search,
        status: statusFilter,
      });
      setOrders(result.data);
      setTotalRecords(result.total);
      setStats({
        pending: result.totalPending,
        processing: result.totalProcessing,
        shipped: result.totalShipped,
        delivered: result.totalDelivered,
      });
    } catch (error) {
      console.error("Failed to load orders:", error);
      showToast("error", "Error", "Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [lazyParams, statusFilter, showToast]);

  // Load orders on mount and when parameters change
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Handle lazy loading events (pagination, sorting)
  const handleLazyLoad = useCallback((params) => {
    setLazyParams((prev) => ({
      ...prev,
      ...params,
    }));
  }, []);

  // Handle search
  const handleSearch = useCallback((e) => {
    const value = e.target.value;
    setLazyParams((prev) => ({
      ...prev,
      first: 0,
      page: 1,
      search: value,
    }));
  }, []);

  // Handle status filter
  const handleStatusFilter = useCallback((e) => {
    setStatusFilter(e.value);
    setLazyParams((prev) => ({
      ...prev,
      first: 0,
      page: 1,
    }));
  }, []);

  // Open order details
  const handleViewDetails = useCallback((order) => {
    setSelectedOrder(order);
    setDetailsModal(true);
  }, []);

  // Close details modal
  const handleCloseDetails = useCallback(() => {
    setDetailsModal(false);
    setSelectedOrder(null);
  }, []);

  // Update order status
  const handleUpdateStatus = useCallback(
    async (order, newStatus) => {
      setUpdating(true);
      try {
        // Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        showToast("success", "Success", `Order status updated to ${newStatus}`);
        loadOrders();
        handleCloseDetails();
      } catch (error) {
        console.error("Failed to update order status:", error);
        showToast("error", "Error", "Failed to update order status");
      } finally {
        setUpdating(false);
      }
    },
    [loadOrders, handleCloseDetails, showToast]
  );

  // Action template for DataTable
  const actionTemplate = (rowData) => {
    return (
      <div className="flex gap-2">
        <Button
          icon={<Eye size={16} />}
          className="p-button-rounded p-button-text p-button-sm"
          onClick={() => handleViewDetails(rowData)}
          tooltip="View Details"
        />
      </div>
    );
  };

  // Status template
  const statusTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.order_status}
        severity={getStatusSeverity(rowData.order_status)}
      />
    );
  };

  // Payment status template
  const paymentTemplate = (rowData) => {
    return (
      <Tag
        value={rowData.payment_status}
        severity={getPaymentStatusSeverity(rowData.payment_status)}
      />
    );
  };

  // Amount template
  const amountTemplate = (rowData) => {
    return (
      <span className="font-mono font-semibold">
        ₹{rowData.total_amount?.toFixed(2) || "0.00"}
      </span>
    );
  };

  // Date template
  const dateTemplate = (rowData) => {
    return (
      <span>
        {rowData.order_date
          ? new Date(rowData.order_date).toLocaleDateString()
          : "-"}
      </span>
    );
  };

  return (
    <div className="admin-orders-container animate-fade-in flex-1 flex flex-col min-h-0">
      <Toast ref={toast} position="top-right" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </div>
            <Clock className="text-yellow-500" size={24} />
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Processing</p>
              <p className="text-2xl font-bold">{stats.processing}</p>
            </div>
            <Package className="text-blue-500" size={24} />
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Shipped</p>
              <p className="text-2xl font-bold">{stats.shipped}</p>
            </div>
            <Truck className="text-purple-500" size={24} />
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">Delivered</p>
              <p className="text-2xl font-bold">{stats.delivered}</p>
            </div>
            <CheckCircle className="text-green-500" size={24} />
          </div>
        </Card>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-4 p-3 rounded-lg bg-card">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={18} className="text-muted" />
          <InputText
            value={lazyParams.search}
            onChange={handleSearch}
            placeholder="Search orders..."
            className="flex-1"
          />
        </div>
        <Dropdown
          value={statusFilter}
          options={orderStatusOptions}
          onChange={handleStatusFilter}
          placeholder="Filter by Status"
          className="w-40"
        />
      </div>

      {/* Orders Table */}
      <div className="flex-1 overflow-auto rounded-lg bg-card">
        <DataTable
          value={orders}
          lazy
          paginator
          first={lazyParams.first}
          rows={lazyParams.rows}
          totalRecords={totalRecords}
          onPage={handleLazyLoad}
          onSort={handleLazyLoad}
          sortField={lazyParams.sortField}
          sortOrder={lazyParams.sortOrder}
          loading={loading}
          stripedRows
          scrollable
          scrollHeight="flex"
          emptyMessage="No orders found"
          className="p-datatable-sm"
        >
          <Column
            field="order_id"
            header="Order ID"
            sortable
            style={{ minWidth: "100px" }}
          />
          <Column
            field="customer_name"
            header="Customer"
            sortable
            style={{ minWidth: "150px" }}
          />
          <Column
            field="order_date"
            header="Date"
            sortable
            body={dateTemplate}
            style={{ minWidth: "120px" }}
          />
          <Column
            field="total_amount"
            header="Amount"
            sortable
            body={amountTemplate}
            style={{ minWidth: "100px" }}
          />
          <Column
            field="order_status"
            header="Status"
            sortable
            body={statusTemplate}
            style={{ minWidth: "120px" }}
          />
          <Column
            field="payment_status"
            header="Payment"
            sortable
            body={paymentTemplate}
            style={{ minWidth: "120px" }}
          />
          <Column
            header="Actions"
            body={actionTemplate}
            style={{ minWidth: "80px", textAlign: "center" }}
          />
        </DataTable>
      </div>

      {/* Order Details Modal */}
      <Dialog
        visible={detailsModal}
        onHide={handleCloseDetails}
        header="Order Details"
        style={{ width: "50vw", minWidth: "500px" }}
        modal
        className="p-dialog-responsive"
        footer={
          <div className="flex justify-end gap-2">
            <Button
              label="Close"
              icon="pi pi-times"
              onClick={handleCloseDetails}
              className="p-button-text"
            />
          </div>
        }
      >
        {selectedOrder && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted mb-1">Order ID</p>
                <p className="font-mono font-semibold">
                  #{selectedOrder.order_id}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted mb-1">Order Date</p>
                <p>
                  {selectedOrder.order_date
                    ? new Date(selectedOrder.order_date).toLocaleString()
                    : "-"}
                </p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted mb-1">Customer</p>
              <p className="font-semibold">{selectedOrder.customer_name}</p>
              <p className="text-sm">{selectedOrder.customer_email}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted mb-1">Order Status</p>
                <Tag
                  value={selectedOrder.order_status}
                  severity={getStatusSeverity(selectedOrder.order_status)}
                />
              </div>
              <div>
                <p className="text-sm text-muted mb-1">Payment Status</p>
                <Tag
                  value={selectedOrder.payment_status}
                  severity={getPaymentStatusSeverity(selectedOrder.payment_status)}
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="text-sm text-muted mb-2">Update Status</p>
              <div className="flex flex-wrap gap-2">
                {orderStatusOptions
                  .filter((opt) => opt.value && opt.value !== selectedOrder.order_status)
                  .map((status) => (
                    <Button
                      key={status.value}
                      label={status.label}
                      onClick={() => handleUpdateStatus(selectedOrder, status.value)}
                      loading={updating}
                      className="p-button-sm"
                      severity={getStatusSeverity(status.value)}
                    />
                  ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <p className="font-semibold mb-2">Order Items</p>
              <p className="text-sm text-muted">Items list would appear here...</p>
            </div>

            <div className="border-t pt-4 flex justify-between">
              <p className="font-semibold">Total Amount</p>
              <p className="font-mono font-bold text-xl">
                ₹{selectedOrder.total_amount?.toFixed(2) || "0.00"}
              </p>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

export default AdminOrdersTab;
