import { Package } from "lucide-react";
import { Card } from "primereact/card";
import { Chip } from "primereact/chip";
import { Column } from "primereact/column";
import { DataTable } from "primereact/datatable";
import { Dialog } from "primereact/dialog";
import { Message } from "primereact/message";
import { ProgressSpinner } from "primereact/progressspinner";
import { Tag } from "primereact/tag";
import { formatCurrency, orderSeverity } from "../utils";

function OrderDetailsDialog({
  error,
  loading,
  onHide,
  selectedOrder,
  selectedOrderItems,
  visible,
}) {
  const productTemplate = (row) => {
    const imageUrl = row?.image_url || null;
    const productLabel = row.product_name || `Product #${row.product_id}`;

    return (
      <div className="flex items-center gap-3">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={productLabel}
            className="h-12 w-12 rounded-md border border-gray-200 object-cover dark:border-slate-700"
            loading="lazy"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-md border border-dashed border-gray-300 bg-gray-100 text-gray-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400">
            <Package className="h-5 w-5" />
          </div>
        )}
        <div>
          <p className="text-sm font-medium text-gray-900 dark:text-slate-100">
            {productLabel}
          </p>
          <p className="text-xs text-gray-500 dark:text-slate-400">
            Product ID: {row.product_id}
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog
      header={`Order Details: ${
        selectedOrder?.order_number ||
        (selectedOrder?.order_id ? `#${selectedOrder.order_id}` : "")
      }`}
      visible={visible}
      style={{ width: "70vw", maxWidth: "920px" }}
      breakpoints={{ "960px": "90vw", "641px": "95vw" }}
      onHide={onHide}
      dismissableMask
    >
      <div className="space-y-4">
        {selectedOrder && (
          <Card className="rounded-xl border border-gray-200 bg-gray-50 dark:border-slate-700 dark:bg-slate-800">
            <div className="grid gap-3 text-sm md:grid-cols-3">
            <div>
              <Chip
                label="Order"
                className="!bg-slate-200 !text-xs !font-semibold !uppercase !tracking-[0.08em] !text-slate-700 dark:!bg-slate-700 dark:!text-slate-200"
              />
              <p className="mt-1 font-medium text-gray-900 dark:text-slate-100">
                {selectedOrder.order_number || `#${selectedOrder.order_id}`}
              </p>
            </div>
            <div>
              <Chip
                label="Status"
                className="!bg-slate-200 !text-xs !font-semibold !uppercase !tracking-[0.08em] !text-slate-700 dark:!bg-slate-700 dark:!text-slate-200"
              />
              <div className="mt-1">
                <Tag
                  value={selectedOrder.order_status || "unknown"}
                  severity={orderSeverity(selectedOrder.order_status)}
                />
              </div>
            </div>
            <div>
              <Chip
                label="Total Amount"
                className="!bg-slate-200 !text-xs !font-semibold !uppercase !tracking-[0.08em] !text-slate-700 dark:!bg-slate-700 dark:!text-slate-200"
              />
              <p className="mt-1 font-medium text-gray-900 dark:text-slate-100">
                {formatCurrency(selectedOrder.total_amount)}
              </p>
            </div>
            </div>
          </Card>
        )}

        {loading ? (
          <div className="flex items-center gap-3 py-6">
            <ProgressSpinner style={{ width: "24px", height: "24px" }} strokeWidth="4" />
            <p className="text-sm text-gray-600 dark:text-slate-300">
              Loading order items...
            </p>
          </div>
        ) : error ? (
          <Message severity="error" text={error} />
        ) : (
          <DataTable
            value={selectedOrderItems}
            emptyMessage="No items found for this order."
            stripedRows
            rows={10}
          >
            <Column field="product_name" header="Product" body={productTemplate} />
            <Column
              field="portion_value"
              header="Portion"
              body={(row) => row.portion_value || "-"}
            />
            <Column
              field="modifier_value"
              header="Modifier"
              body={(row) => row.modifier_value || "-"}
            />
            <Column field="quantity" header="Qty" body={(row) => Number(row.quantity) || 0} />
            <Column field="price" header="Price" body={(row) => formatCurrency(row.price)} />
            <Column
              field="discount"
              header="Discount"
              body={(row) => formatCurrency(row.discount)}
            />
            <Column field="tax" header="Tax" body={(row) => formatCurrency(row.tax)} />
            <Column field="total" header="Total" body={(row) => formatCurrency(row.total)} />
          </DataTable>
        )}
      </div>
    </Dialog>
  );
}

export default OrderDetailsDialog;
