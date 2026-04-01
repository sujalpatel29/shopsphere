import { useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Tag } from "primereact/tag";
import { Skeleton } from "primereact/skeleton";
import { Eye, Lock, LockOpen, Trash2 } from "lucide-react";

function AdminUsersTable({
  users,
  loading,
  totalRecords,
  lazyParams,
  onLazyLoad,
  onView,
  onToggleBlock,
  onDelete,
  actionLoading,
}) {
  const handlePage = (event) => {
    onLazyLoad({
      ...lazyParams,
      first: event.first,
      rows: event.rows,
      page: Math.floor(event.first / event.rows) + 1,
    });
  };

  const handleSort = (event) => {
    onLazyLoad({
      ...lazyParams,
      first: 0,
      page: 1,
      sortField: event.sortField,
      sortOrder: event.sortOrder,
    });
  };

  const statusBodyTemplate = (rowData) => (
    <Tag
      value={Number(rowData.is_blocked) === 1 ? "Blocked" : "Active"}
      className={
        Number(rowData.is_blocked) === 1
          ? "admin-badge admin-badge--blocked"
          : "admin-badge admin-badge--active"
      }
    />
  );

  const roleBodyTemplate = (rowData) => (
    // Role classes allow themed badges per role type.
    <Tag
      value={rowData.role || "customer"}
      className={`admin-badge admin-badge--role admin-badge--role-${String(
        rowData.role || "customer",
      ).toLowerCase()}`}
    />
  );

  const dateBodyTemplate = (rowData) => {
    const raw = rowData.last_login || rowData.created_at;
    if (!raw) return <span className="text-slate-400">-</span>;

    const date = new Date(raw);
    if (Number.isNaN(date.getTime()))
      return <span className="text-slate-400">-</span>;

    return (
      <span className="text-sm text-slate-600 dark:text-slate-300">
        {date.toLocaleDateString()}
      </span>
    );
  };

  const userBodyTemplate = (rowData) => {
    const initials = (rowData.name || "U")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <div className="flex items-center gap-3">
        <div className="admin-user-avatar">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
            {rowData.name || "Unnamed user"}
          </p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            ID: {rowData.user_id}
          </p>
        </div>
      </div>
    );
  };

  const actionBodyTemplate = (rowData) => {
    const blocked = Number(rowData.is_blocked) === 1;

    return (
      <div className="flex gap-2">
        <Button
          type="button"
          rounded
          text
          severity="info"
          className="admin-action-btn h-9 w-9 p-0 flex items-center justify-center"
          onClick={() => onView(rowData)}
          tooltip="View details"
          tooltipOptions={{ position: "top" }}
        >
          <Eye className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          rounded
          text
          severity={blocked ? "success" : "warning"}
          className="admin-action-btn h-9 w-9 p-0 flex items-center justify-center"
          onClick={() => onToggleBlock(rowData)}
          disabled={actionLoading}
          tooltip={blocked ? "Unblock user" : "Block user"}
          tooltipOptions={{ position: "top" }}
        >
          {blocked ? (
            <LockOpen className="h-4 w-4" />
          ) : (
            <Lock className="h-4 w-4" />
          )}
        </Button>

        <Button
          type="button"
          rounded
          text
          severity="danger"
          className="admin-action-btn h-9 w-9 p-0 flex items-center justify-center"
          onClick={() => onDelete(rowData)}
          disabled={actionLoading}
          tooltip="Delete user"
          tooltipOptions={{ position: "top" }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    );
  };

  const skeletonUserTemplate = () => (
    <div className="flex items-center gap-3">
      <Skeleton shape="circle" size="2.25rem" />
      <div className="space-y-2">
        <Skeleton width="9rem" height="1rem" />
        <Skeleton width="5rem" height="0.85rem" />
      </div>
    </div>
  );

  const skeletonTemplate = () => (
    <Skeleton height="1.25rem" className="w-[80%]" />
  );

  const skeletonActionTemplate = () => (
    <div className="flex gap-2">
      <Skeleton shape="circle" size="2.25rem" />
      <Skeleton shape="circle" size="2.25rem" />
      <Skeleton shape="circle" size="2.25rem" />
    </div>
  );

  const skeletonData = useMemo(
    () =>
      Array.from({ length: lazyParams.rows || 5 }, (_, i) => ({
        user_id: `skeleton-${i}`,
      })),
    [lazyParams.rows],
  );

  return (
    <div className="admin-products-table-wrapper flex-1 flex flex-col min-h-0">
      <DataTable
        value={loading ? skeletonData : users}
        lazy
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={totalRecords}
        onPage={handlePage}
        onSort={handleSort}
        sortField={lazyParams.sortField}
        sortOrder={lazyParams.sortOrder}
        dataKey="user_id"
        scrollable
        emptyMessage="No users found."
        className="admin-products-table"
        rowsPerPageOptions={[5, 10, 25, 50]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        tableStyle={{ minWidth: "72rem" }}
      >
        <Column
          field="name"
          header="User"
          sortable
          body={loading ? skeletonUserTemplate : userBodyTemplate}
          style={{ minWidth: "18rem" }}
        />
        <Column
          field="email"
          header="Email"
          sortable
          body={loading ? skeletonTemplate : null}
          style={{ minWidth: "16rem" }}
        />
        <Column
          field="role"
          header="Role"
          body={loading ? skeletonTemplate : roleBodyTemplate}
          style={{ minWidth: "10rem" }}
        />
        <Column
          field="is_blocked"
          header="Status"
          body={loading ? skeletonTemplate : statusBodyTemplate}
          style={{ minWidth: "10rem" }}
        />
        <Column
          field="last_login"
          header="Last Activity"
          sortable
          body={loading ? skeletonTemplate : dateBodyTemplate}
          style={{ minWidth: "10rem" }}
        />
        <Column
          header="Actions"
          body={loading ? skeletonActionTemplate : actionBodyTemplate}
          exportable={false}
          style={{ minWidth: "9rem" }}
        />
      </DataTable>
    </div>
  );
}

export default AdminUsersTable;
