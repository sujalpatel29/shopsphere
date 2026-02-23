import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchOrders, findOrderItems } from "../redux/slices/orderSlice";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { Tag } from "primereact/tag";
import { Button } from "primereact/button";

// component name should be capitalized so React treats it as a component
export default function OrderComponent() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // the reducer is registered under "order" in the store, not "orders".
  // provide a default object to avoid destructure errors when state is undefined.
  const [globalValue, setGlobalValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    order_number: { value: null, matchMode: FilterMatchMode.CONTAINS },
    order_status: { value: null, matchMode: FilterMatchMode.CONTAINS },
    payment_status: { value: null, matchMode: FilterMatchMode.CONTAINS },
    created_at: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });
  const { orders, loading, error, pagination } = useSelector(
    (state) => state.order || {},
  );
  const [first, setFirst] = useState(0);
  useEffect(() => {
    dispatch(fetchOrders({ page: 1, limit: 5 }));
  }, [dispatch]);

  const onPage = (event) => {
    // PrimeReact sometimes doesn't populate `page`; safer to compute from first/rows
    const page = Math.floor(event.first / event.rows) + 1;
    const limit = event.rows;
    setFirst(event.first);
    dispatch(fetchOrders({ page, limit }));
  };

  useEffect(() => {
    console.log("Orders state:", { orders, loading, error, pagination });
  }, [orders, loading, error, pagination]);

  if (loading && !orders.length) return <div>Loading orders...</div>;
  if (error) return <div>Error fetching orders: {error}</div>;

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalValue(value);
  };

  const statusBodyTemplate = (rowData) => {
    const status = rowData.order_status?.toLowerCase();
    const severity =
      status === "completed" || status === "delivered"
        ? "success"
        : status === "pending" || status === "processing"
          ? "warning"
          : status === "cancelled"
            ? "danger"
            : "info";

    return (
      <Tag
        value={rowData.order_status}
        severity={severity}
        className="text-xs uppercase px-3 py-1 bg-opacity-20 translate-y-[1px]"
      />
    );
  };

  const paymentStatusBodyTemplate = (rowData) => {
    const status = rowData.payment_status?.toLowerCase();
    const severity =
      status === "paid" || status === "success" || status === "processing"
        ? "success"
        : status === "pending"
          ? "warning"
          : status === "failed"
            ? "danger"
            : "info";

    return (
      <Tag
        value={rowData.payment_status}
        severity={severity}
        className="text-xs uppercase px-3 py-1 bg-opacity-20 translate-y-[1px]"
      />
    );
  };

  const header = (
    <div className="orders-header-flex">
      <div className="orders-title-text">Orders Overview</div>
      <div className="orders-search-container">
        <i className="pi pi-search orders-search-icon" />
        <InputText
          value={globalValue}
          onChange={onGlobalFilterChange}
          placeholder="Search all orders..."
          className="orders-search-input"
        />
      </div>
    </div>
  );

  const refresh = () => {
    dispatch(
      fetchOrders({
        page: pagination?.currentPage || 1,
        limit: pagination?.itemsPerPage || 5,
      }),
    );
  };

  return (
    <div className="orders-page-wrapper animate-fade-in">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="orders-card">
        <DataTable
          value={orders}
          paginator
          rows={pagination?.itemsPerPage || 5}
          first={first}
          rowsPerPageOptions={[5, 10, 25, 50]}
          responsiveLayout="stack"
          breakpoint="960px"
          stripedRows
          tableStyle={{ width: "100%" }}
          paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
          currentPageReportTemplate="{first} to {last} of {totalRecords}"
          totalRecords={pagination?.totalItems || 0}
          onPage={onPage}
          dataKey="order_id"
          filterDisplay="row"
          filters={filters}
          loading={loading}
          onRowClick={(e) => {
            const id = e.data.order_id;
            navigate(`/dashboard/orders/${id}`, {
              state: {
                data: e.data,
              },
            });
          }}
          className="cursor-pointer orders-main-table"
          globalFilterFields={[
            "order_number",
            "order_status",
            "payment_status",
            "created_at",
          ]}
          header={header}
          emptyMessage="No Order found."
        >
          <Column field="order_id" sortable header="ID" />

          <Column field="order_number" sortable header="Order Number" />

          <Column
            field="order_status"
            header="Order Status"
            sortable
            body={statusBodyTemplate}
          />

          <Column
            field="payment_status"
            header="Payment Status"
            sortable
            body={paymentStatusBodyTemplate}
          />
          <Column
            field="created_at"
            sortable
            header="Order Date"
            body={(row) => new Date(row.created_at).toLocaleDateString()}
          />

          <Column
            field="total_amount"
            sortable
            header="Total Amount"
            body={(row) => `$${row.total_amount}`}
          />
        </DataTable>
      </div>
    </div>
  );
}
