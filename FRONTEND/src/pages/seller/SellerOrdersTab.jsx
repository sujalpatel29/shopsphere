import { useCallback, useEffect, useState } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { Tag } from "primereact/tag";
import { Skeleton } from "primereact/skeleton";
import { Search } from "lucide-react";
import { InputText } from "primereact/inputtext";
import { useToast } from "../../context/ToastContext";
import { getSellerOrderDetail, getSellerOrders } from "../../../api/sellerApi";
import getApiErrorMessage from "../../utils/apiError";
import "../admin/AdminShared.css";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function SellerOrdersTab() {
  const showToast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalRecords, setTotalRecords] = useState(0);
  const [search, setSearch] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: 10,
    page: 1,
  });

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getSellerOrders({
        page: lazyParams.page,
        limit: lazyParams.rows,
        search,
      });

      const payload = response.data?.data || {};
      const items = (payload.items || []).filter((item) => {
        if (!search.trim()) {
          return true;
        }

        const term = search.trim().toLowerCase();
        return [
          item.order_number,
          item.customer_name,
          item.customer_email,
          item.status,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(term));
      });

      setOrders(items);
      setTotalRecords(search.trim() ? items.length : payload.count || 0);
    } catch (error) {
      setOrders([]);
      setTotalRecords(0);
      showToast(
        "error",
        "Error",
        getApiErrorMessage(error, "Failed to load orders."),
      );
    } finally {
      setLoading(false);
    }
  }, [lazyParams.page, lazyParams.rows, search, showToast]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleViewOrder = useCallback(
    async (order) => {
      try {
        setDetailsLoading(true);
        setDetailsVisible(true);
        const response = await getSellerOrderDetail(order.order_id);
        setSelectedOrder(response.data?.data || null);
      } catch (error) {
        setDetailsVisible(false);
        showToast(
          "error",
          "Error",
          getApiErrorMessage(error, "Failed to load order details."),
        );
      } finally {
        setDetailsLoading(false);
      }
    },
    [showToast],
  );

  const statusTemplate = (rowData) => {
    const severityMap = {
      pending: "warning",
      processing: "info",
      shipped: "info",
      delivered: "success",
      completed: "success",
      cancelled: "danger",
      returned: "danger",
    };

    return (
      <Tag
        value={rowData.status || "unknown"}
        severity={severityMap[rowData.status] || "secondary"}
        className="capitalize"
      />
    );
  };

  const dateTemplate = (rowData) =>
    rowData.created_at
      ? new Date(rowData.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "-";

  const amountTemplate = (rowData) =>
    currencyFormatter.format(rowData.total_amount || 0);

  return (
    <div className="admin-products-container animate-fade-in flex-1 flex flex-col min-h-0">
      <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-[#b08d57]">
            Orders
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-gray-900 dark:text-slate-100">
            Customer orders for your catalog
          </h2>
        </div>
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <InputText
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search orders..."
            className="admin-search-input h-10 w-full rounded-xl border border-gray-200 pl-10 text-sm outline-none dark:border-gray-700"
          />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mb-5">
        <Card className="!p-0">
          <div className="p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
              Orders on this page
            </p>
            <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-slate-100">
              {orders.length}
            </p>
          </div>
        </Card>
        <Card className="!p-0">
          <div className="p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
              Pending
            </p>
            <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-slate-100">
              {orders.filter((order) => order.status === "pending").length}
            </p>
          </div>
        </Card>
        <Card className="!p-0">
          <div className="p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
              Revenue on page
            </p>
            <p className="mt-3 text-3xl font-semibold text-gray-900 dark:text-slate-100">
              {currencyFormatter.format(
                orders.reduce(
                  (sum, order) => sum + Number(order.total_amount || 0),
                  0,
                ),
              )}
            </p>
          </div>
        </Card>
      </div>

      <div className="admin-products-card flex-1 flex flex-col min-h-0">
        <DataTable
          value={
            loading
              ? Array.from({ length: lazyParams.rows }, (_, i) => ({
                  order_id: `skeleton-${i}`,
                }))
              : orders
          }
          lazy
          paginator
          first={lazyParams.first}
          rows={lazyParams.rows}
          totalRecords={totalRecords}
          onPage={(event) =>
            setLazyParams({
              first: event.first,
              rows: event.rows,
              page: Math.floor(event.first / event.rows) + 1,
            })
          }
          loading={loading}
          scrollable
          scrollHeight="calc(100vh - 22rem)"
          emptyMessage="No seller orders found."
          className="admin-products-table"
          rowsPerPageOptions={[10, 25, 50]}
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        >
          <Column
            field="order_number"
            header="Order"
            body={(rowData) =>
              loading ? (
                <Skeleton width="7rem" height="1.1rem" />
              ) : (
                <div>
                  <p className="font-mono text-xs font-semibold">
                    {rowData.order_number || `#${rowData.order_id}`}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    #{rowData.order_id}
                  </p>
                </div>
              )
            }
            style={{ minWidth: "9rem" }}
          />
          <Column
            field="customer_name"
            header="Customer"
            body={(rowData) =>
              loading ? (
                <Skeleton width="8rem" height="1.1rem" />
              ) : (
                <div>
                  <p className="font-medium text-gray-900 dark:text-slate-100">
                    {rowData.customer_name || "Customer"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-slate-400">
                    {rowData.customer_email || "No email"}
                  </p>
                </div>
              )
            }
            style={{ minWidth: "14rem" }}
          />
          <Column
            field="created_at"
            header="Date"
            body={(rowData) =>
              loading ? (
                <Skeleton width="6rem" height="1.1rem" />
              ) : (
                dateTemplate(rowData)
              )
            }
            style={{ minWidth: "8rem" }}
          />
          <Column
            field="item_count"
            header="Items"
            body={(rowData) =>
              loading ? (
                <Skeleton width="2rem" height="1.1rem" />
              ) : (
                rowData.item_count || 0
              )
            }
            style={{ minWidth: "6rem" }}
          />
          <Column
            field="total_amount"
            header="Amount"
            body={(rowData) =>
              loading ? (
                <Skeleton width="6rem" height="1.1rem" />
              ) : (
                amountTemplate(rowData)
              )
            }
            style={{ minWidth: "8rem" }}
          />
          <Column
            field="status"
            header="Status"
            body={(rowData) =>
              loading ? (
                <Skeleton width="6rem" height="2rem" />
              ) : (
                statusTemplate(rowData)
              )
            }
            style={{ minWidth: "9rem" }}
          />
          <Column
            header="Actions"
            body={(rowData) =>
              loading ? (
                <Skeleton shape="circle" size="2.25rem" />
              ) : (
                <Button
                  type="button"
                  icon="pi pi-eye"
                  rounded
                  text
                  className="admin-action-btn"
                  onClick={() => handleViewOrder(rowData)}
                />
              )
            }
            style={{ minWidth: "6rem" }}
          />
        </DataTable>
      </div>

      <Dialog
        visible={detailsVisible}
        onHide={() => {
          setDetailsVisible(false);
          setSelectedOrder(null);
        }}
        header={selectedOrder?.order_number || "Order details"}
        modal
        style={{ width: "760px", maxWidth: "96vw" }}
        pt={{
          root: { className: "admin-dialog rounded-2xl overflow-hidden" },
          header: { className: "admin-dialog-header px-6 py-4 border-b" },
          content: { className: "p-6" },
        }}
      >
        {detailsLoading ? (
          <div className="space-y-4">
            <Skeleton height="4rem" />
            <Skeleton height="14rem" />
          </div>
        ) : selectedOrder ? (
          <div className="space-y-5">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl bg-[#f1f5f4] p-4 dark:bg-[#10181d]">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
                  Customer
                </p>
                <p className="mt-3 font-semibold text-gray-900 dark:text-slate-100">
                  {selectedOrder.customer_name || "Customer"}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400">
                  {selectedOrder.customer_email || "No email"}
                </p>
              </div>
              <div className="rounded-2xl bg-[#f1f5f4] p-4 dark:bg-[#10181d]">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
                  Status
                </p>
                <div className="mt-3">{statusTemplate(selectedOrder)}</div>
              </div>
              <div className="rounded-2xl bg-[#f1f5f4] p-4 dark:bg-[#10181d]">
                <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
                  Total
                </p>
                <p className="mt-3 font-semibold text-gray-900 dark:text-slate-100">
                  {currencyFormatter.format(selectedOrder.total_amount || 0)}
                </p>
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 p-4 dark:border-gray-700">
              <p className="text-xs uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
                Shipping Address
              </p>
              <p className="mt-3 text-sm text-gray-700 dark:text-slate-200">
                {selectedOrder.shipping_address || "Address not available"}
              </p>
            </div>

            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.18em] text-gray-500 dark:text-slate-400">
                Seller items in this order
              </p>
              {selectedOrder.items?.map((item) => (
                <div
                  key={item.order_item_id}
                  className="flex flex-col gap-3 rounded-2xl border border-gray-200 p-4 dark:border-gray-700 md:flex-row md:items-center md:justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-slate-100">
                      {item.product_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-slate-400">
                      {[item.portion_value, item.modifier_value]
                        .filter(Boolean)
                        .join(" | ") || "Standard option"}
                    </p>
                  </div>
                  <div className="text-sm text-gray-700 dark:text-slate-200 md:text-right">
                    <p>Qty: {item.quantity}</p>
                    <p className="font-semibold">
                      {currencyFormatter.format(
                        item.total || item.price * item.quantity || 0,
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </Dialog>
    </div>
  );
}

export default SellerOrdersTab;
