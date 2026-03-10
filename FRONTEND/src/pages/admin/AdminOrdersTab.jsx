import { useState, useEffect, useCallback } from "react";
import { useToast } from "../../context/ToastContext";
import OrdersToolbar from "./OrdersToolbar";
import OrdersTable from "./OrdersTable";
import OrderDetailModal from "./OrderDetailModal";
import { fetchAdminOrders } from "../../../api/adminOrdersApi";
import getApiErrorMessage from "../../utils/apiError";
import "./AdminProducts.css";

function AdminOrdersTab() {
  const showToast = useToast();

  // Order data state
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [stats, setStats] = useState({});

  // Lazy loading parameters
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
    sortField: null,
    sortOrder: null,
    search: "",
  });

  // Filter state
  const [filters, setFilters] = useState({
    orderStatus: null,
    paymentStatus: null,
    paymentMethod: null,
    dateFrom: null,
    dateTo: null,
  });

  // Detail modal
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);
  const [detailDirty, setDetailDirty] = useState(false);

  // Fetch orders
  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data,
        total,
        stats: fetchedStats,
      } = await fetchAdminOrders({
        page: lazyParams.page,
        limit: lazyParams.rows,
        search: lazyParams.search,
        sortField: lazyParams.sortField,
        sortOrder: lazyParams.sortOrder,
        orderStatus: filters.orderStatus,
        paymentStatus: filters.paymentStatus,
        paymentMethod: filters.paymentMethod,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
      });
      setOrders(data);
      setTotalRecords(total);
      setStats(fetchedStats);
    } catch (error) {
      console.error("Failed to load orders:", error);
      showToast(
        "error",
        "Error",
        getApiErrorMessage(error, "Failed to load orders."),
      );
      setOrders([]);
      setTotalRecords(0);
    } finally {
      setLoading(false);
    }
  }, [lazyParams, filters, showToast]);

  // Load on mount and when params change
  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // Lazy load handler (pagination + sorting)
  const handleLazyLoad = useCallback((params) => {
    setLazyParams((prev) => ({ ...prev, ...params }));
  }, []);

  // Search handler
  const handleSearch = useCallback((searchValue) => {
    setLazyParams((prev) => ({
      ...prev,
      first: 0,
      page: 1,
      search: searchValue,
    }));
  }, []);

  // Filter change handler
  const handleFilterChange = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    // Reset to page 1 when filters change
    setLazyParams((prev) => ({ ...prev, first: 0, page: 1 }));
  }, []);

  // Open detail modal
  const handleViewDetail = useCallback((order) => {
    setSelectedOrderId(order.order_id);
    setDetailDirty(false);
    setDetailVisible(true);
  }, []);

  // Refresh the list only after an order/payment mutation inside the modal.
  const handleCloseDetail = useCallback(() => {
    setDetailVisible(false);
    setSelectedOrderId(null);
    if (detailDirty) {
      loadOrders();
    }
    setDetailDirty(false);
  }, [detailDirty, loadOrders]);

  const handleDetailMutate = useCallback(() => {
    setDetailDirty(true);
  }, []);

  return (
    <div className="admin-products-container animate-fade-in flex-1 flex flex-col min-h-0">
      <div className="admin-products-card flex-1 flex flex-col min-h-0">
        <OrdersToolbar
          onSearch={handleSearch}
          filters={filters}
          onFilterChange={handleFilterChange}
          stats={stats}
        />

        <OrdersTable
          orders={orders}
          loading={loading}
          totalRecords={totalRecords}
          lazyParams={lazyParams}
          onLazyLoad={handleLazyLoad}
          onViewDetail={handleViewDetail}
        />
      </div>

      <OrderDetailModal
        visible={detailVisible}
        onHide={handleCloseDetail}
        orderId={selectedOrderId}
        onMutate={handleDetailMutate}
      />
    </div>
  );
}

export default AdminOrdersTab;
