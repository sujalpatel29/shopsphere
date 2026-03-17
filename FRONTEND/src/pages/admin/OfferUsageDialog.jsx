import { Dialog } from "primereact/dialog";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";

const formatCurrency = (value) => {
  const amount = Number(value || 0);
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

const formatDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getUsageStats = (usageRows) => {
  const rows = Array.isArray(usageRows) ? usageRows : [];
  const totalUsage = rows.length;
  const uniqueUsers = new Set(
    rows.map((row) => row.user_id).filter((value) => value !== null && value !== undefined),
  ).size;
  const totalDiscount = rows.reduce(
    (sum, row) => sum + Number(row.discount_amount || 0),
    0,
  );
  const averageDiscount = totalUsage > 0 ? totalDiscount / totalUsage : 0;
  const latestUsage = rows.reduce((latest, row) => {
    if (!row?.created_at) return latest;
    if (!latest) return row.created_at;

    return new Date(row.created_at) > new Date(latest) ? row.created_at : latest;
  }, null);

  return {
    totalUsage,
    uniqueUsers,
    totalDiscount,
    averageDiscount,
    latestUsage,
  };
};

function OfferUsageDialog({
  visible,
  onHide,
  offer,
  usageRows = [],
  loading,
}) {
  const stats = getUsageStats(usageRows);

  const footer = (
    <div className="flex justify-end">
      <Button
        type="button"
        label="Close"
        onClick={onHide}
        className="admin-btn-secondary px-4 py-2 rounded-lg font-medium transition-colors"
      />
    </div>
  );

  return (
    <Dialog
      header={offer ? `Offer Usage - ${offer.offer_name}` : "Offer Usage"}
      visible={visible}
      onHide={onHide}
      draggable={false}
      style={{ width: "min(64rem, 96vw)" }}
      footer={footer}
      dismissableMask
      className="admin-dialog"
      pt={{
        root: { className: "admin-dialog rounded-2xl overflow-hidden" },
        header: { className: "admin-dialog-header px-6 py-4 border-b" },
        title: { className: "text-xl font-serif text-gray-900 dark:text-slate-100" },
        content: { className: "p-6 font-sans" },
        footer: { className: "admin-dialog-footer px-6 py-4 border-t rounded-b-2xl" },
      }}
    >
      <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-800/50">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
            Offer ID
          </p>
          <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-gray-100">
            {offer?.offer_id ?? "-"}
          </p>
        </div>
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800/40 dark:bg-green-900/20">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-green-600 dark:text-green-400">
            Total Usage
          </p>
          <p className="mt-2 text-sm font-semibold text-green-700 dark:text-green-300">
            {stats.totalUsage}
          </p>
        </div>
        <div className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800/40 dark:bg-blue-900/20">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-blue-600 dark:text-blue-400">
            Unique Users
          </p>
          <p className="mt-2 text-sm font-semibold text-blue-700 dark:text-blue-300">
            {stats.uniqueUsers}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800/40 dark:bg-amber-900/20">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-amber-600 dark:text-amber-400">
            Total Discount Given
          </p>
          <p className="mt-2 text-sm font-semibold text-amber-700 dark:text-amber-300">
            {formatCurrency(stats.totalDiscount)}
          </p>
        </div>
        <div className="rounded-xl border border-purple-200 bg-purple-50 px-4 py-3 dark:border-purple-800/40 dark:bg-purple-900/20">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-purple-600 dark:text-purple-400">
            Average Discount
          </p>
          <p className="mt-2 text-sm font-semibold text-purple-700 dark:text-purple-300">
            {formatCurrency(stats.averageDiscount)}
          </p>
        </div>
      </div>

      <div className="mb-4 rounded-xl border border-gray-200 bg-white/60 px-4 py-3 dark:border-gray-700 dark:bg-slate-900/30">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-gray-400">
          Last Used
        </p>
        <p className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
          {formatDateTime(stats.latestUsage)}
        </p>
      </div>

      <div className="admin-products-table-wrapper flex flex-col min-h-0">
        <DataTable
          value={usageRows}
          loading={loading}
          dataKey="order_id"
          scrollable
          paginator
          rows={10}
          rowsPerPageOptions={[10, 20, 50]}
          emptyMessage="No usage found for this offer."
          className="admin-products-table"
          paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
          tableStyle={{ minWidth: "52rem" }}
        >
          <Column
            header="User ID"
            body={(rowData) => rowData.user_id ?? "-"}
            style={{ minWidth: "8rem" }}
          />
          <Column
            header="Username"
            body={(rowData) => rowData.username || rowData.user_name || rowData.name || "-"}
            style={{ minWidth: "12rem" }}
          />
          <Column
            header="Order ID"
            body={(rowData) => rowData.order_id ?? "-"}
            style={{ minWidth: "8rem" }}
          />
          <Column
            header="Discount Amount"
            body={(rowData) => formatCurrency(rowData.discount_amount)}
            style={{ minWidth: "10rem" }}
          />
          <Column
            field="created_at"
            header="Used At"
            body={(rowData) => formatDateTime(rowData.created_at)}
            style={{ minWidth: "12rem" }}
          />
        </DataTable>
      </div>
    </Dialog>
  );
}

export default OfferUsageDialog;
