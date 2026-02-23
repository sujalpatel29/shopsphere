import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { findOrderItems } from "../redux/slices/orderSlice";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { InputText } from "primereact/inputtext";
import { FilterMatchMode } from "primereact/api";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Dialog } from "primereact/dialog";
import { useLocation } from "react-router-dom";
import { Card } from "primereact/card";
import { Divider } from "primereact/divider";
import OrderSummaryComponent from "./OrderSummaryComponent";

export default function OrderDetailComponents() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const data = location.state?.data;

  const { id } = useParams();
  const { loading, error, orderItems, itemPagination, orders } = useSelector(
    (state) => state.order || {},
  );

  // Fallback: if data is missing from navigation state, try to find it in the orders list
  const orderData =
    data || orders.find((o) => String(o.order_id) === String(id));

  const [first, setFirst] = useState(0);

  useEffect(() => {
    dispatch(findOrderItems({ id, page: 1, limit: 5 }));
  }, [id, dispatch]);

  if (!orderData && !loading) {
    return (
      <div className="p-4 text-center">
        <p>Order data not found. Please go back to the orders list.</p>
        <Button
          label="Back to Orders"
          onClick={() => navigate("/dashboard/orders")}
          className="mt-4"
        />
      </div>
    );
  }

  const onPage = (event) => {
    const page = Math.floor(event.first / event.rows) + 1;
    const limit = event.rows;
    setFirst(event.first);
    dispatch(findOrderItems({ id, page, limit }));
  };

  const [globalValue, setGlobalValue] = useState("");
  const [filters, setFilters] = useState({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS },
    order_number: { value: null, matchMode: FilterMatchMode.CONTAINS },
    order_status: { value: null, matchMode: FilterMatchMode.CONTAINS },
    payment_status: { value: null, matchMode: FilterMatchMode.CONTAINS },
    created_at: { value: null, matchMode: FilterMatchMode.CONTAINS },
  });

  const onGlobalFilterChange = (e) => {
    const value = e.target.value;
    let _filters = { ...filters };
    _filters["global"].value = value;

    setFilters(_filters);
    setGlobalValue(value);
  };

  const header = (
    <div className="orders-header-flex">
      <div className="orders-title-text">Order Items</div>
      <div className="orders-search-container">
        <i className="pi pi-search orders-search-icon" />
        <InputText
          value={globalValue}
          onChange={onGlobalFilterChange}
          placeholder="Search items..."
          className="orders-search-input"
        />
      </div>
    </div>
  );

  return (
    <div className="orders-page-wrapper animate-fade-in">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="orders-card">
        <Dialog
          header={`Order #${orderData?.order_number || id}`}
          visible={true}
          style={{ width: "min(1100px, 95vw)" }}
          breakpoints={{ "960px": "98vw", "640px": "100vw" }}
          onHide={() => navigate("/dashboard/orders")}
          className="rounded-3xl shadow-2xl"
        >
          <DataTable
            value={orderItems}
            paginator
           lazy
            rows={itemPagination?.itemsPerPage || 5}
            first={first}
            rowsPerPageOptions={[5, 10, 25, 50]}
            responsiveLayout="stack"
            breakpoint="960px"
            stripedRows
            tableStyle={{ width: "100%" }}
            paginatorTemplate="RowsPerPageDropdown FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink"
            currentPageReportTemplate="{first} to {last} of {totalRecords}"
            totalRecords={itemPagination?.totalItems || 0}
            onPage={onPage}
            dataKey="order_item_id"
            filterDisplay="row"
            filters={filters}
            loading={loading}
            className="cursor-pointer order-items-table"
            emptyMessage="No Item found."
            header={header}
          >
            <Column field="order_item_id" sortable header="ID" />
            <Column field="product_name" sortable header="Product Name" />
            <Column field="quantity" sortable header="Quantity" />
            <Column
              field="total"
              header="Total Amount"
              body={(row) => `$${row.total}`}
            />
          </DataTable>
          <OrderSummaryComponent orderData={orderData} />
        </Dialog>
      </div>
    </div>
  );
}
