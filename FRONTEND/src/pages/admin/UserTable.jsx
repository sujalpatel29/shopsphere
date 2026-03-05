import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Tag } from "primereact/tag";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  blockUserByAdmin,
  deleteUserByAdmin,
  fetchAllUsers,
  unblockUserByAdmin,
} from "../../redux/slices/userSlice";

const UserTable = () => {
  const dispatch = useDispatch();
  const { users, loading, actionLoading } = useSelector((state) => state.users);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    dispatch(fetchAllUsers({ page: 1, limit: 10 }));
  }, [dispatch]);

  const roleOptions = useMemo(() => {
    const uniqueRoles = [
      ...new Set(users.map((user) => user.role).filter(Boolean)),
    ];
    return [
      { label: "All roles", value: "all" },
      ...uniqueRoles.map((role) => ({ label: role, value: role })),
    ];
  }, [users]);

  const statusOptions = [
    { label: "All status", value: "all" },
    { label: "Active", value: "active" },
    { label: "Blocked", value: "blocked" },
  ];

  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const text = `${user.name || ""} ${user.email || ""} ${user.role || ""}`
        .toLowerCase()
        .trim();
      const bySearch = searchTerm ? text.includes(searchTerm.toLowerCase()) : true;
      const byRole = roleFilter === "all" ? true : user.role === roleFilter;
      const isBlocked = Number(user.is_blocked) === 1;
      const byStatus =
        statusFilter === "all"
          ? true
          : statusFilter === "blocked"
            ? isBlocked
            : !isBlocked;
      return bySearch && byRole && byStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  const statusTemplate = (rowData) => (
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
    <Tag value={rowData.role || "customer"} className="admin-badge admin-badge--role" />
  );

  const dateBodyTemplate = (rowData) => {
    const raw = rowData.updated_at || rowData.last_login || rowData.created_at;
    if (!raw) return <span className="text-slate-400">-</span>;

    const date = new Date(raw);
    if (Number.isNaN(date.getTime())) return <span className="text-slate-400">-</span>;

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
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d8ede8] text-xs font-semibold text-[#1f5f55] dark:bg-[#24433e] dark:text-[#b5e2d9]">
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

  const actionsTemplate = (rowData) => {
    const blocked = Number(rowData.is_blocked) === 1;

    return (
      <div className="flex items-center gap-2">
        {blocked ? (
          <Button
            type="button"
            icon="pi pi-lock-open"
            rounded
            text
            severity="success"
            aria-label="Unblock user"
            disabled={actionLoading}
            onClick={() => dispatch(unblockUserByAdmin(Number(rowData.user_id)))}
          />
        ) : (
          <Button
            type="button"
            icon="pi pi-lock"
            rounded
            text
            severity="warning"
            aria-label="Block user"
            disabled={actionLoading}
            onClick={() => dispatch(blockUserByAdmin(Number(rowData.user_id)))}
          />
        )}

        <Button
          type="button"
          icon="pi pi-trash"
          rounded
          text
          severity="danger"
          aria-label="Delete user"
          disabled={actionLoading}
          onClick={() => {
            if (window.confirm(`Delete user "${rowData.name}"?`)) {
              dispatch(deleteUserByAdmin(Number(rowData.user_id)));
            }
          }}
        />
      </div>
    );
  };

  const header = (
    <div className="admin-table-toolbar space-y-3">
      <div className="grid items-center gap-3 lg:grid-cols-[minmax(320px,1fr)_180px_180px_auto]">
        <span className="p-input-icon-left admin-search">
          <i className="pi pi-search" />
          <InputText
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email or role"
          />
        </span>

        <Dropdown
          value={roleFilter}
          options={roleOptions}
          onChange={(e) => setRoleFilter(e.value)}
          className="admin-toolbar-select"
        />

        <Dropdown
          value={statusFilter}
          options={statusOptions}
          onChange={(e) => setStatusFilter(e.value)}
          className="admin-toolbar-select"
        />

        <Button
          type="button"
          icon="pi pi-filter-slash"
          label="Reset"
          outlined
          onClick={clearFilters}
        />
      </div>
    </div>
  );

  return (
    <div className="admin-user-table-wrap">
      <DataTable
        value={filteredUsers}
        className="admin-user-table"
        showGridlines
        stripedRows
        loading={loading}
        paginator
        rows={10}
        rowsPerPageOptions={[5, 10, 25, 50]}
        paginatorDropdownAppendTo="self"
        dataKey="user_id"
        header={header}
        tableStyle={{ minWidth: "50rem" }}
        emptyMessage="No users found."
        rowHover
      >
        <Column
          header="User"
          body={userBodyTemplate}
          style={{ minWidth: "18rem" }}
        />
        <Column
          field="email"
          header="Email"
          sortable
          style={{ minWidth: "16rem" }}
        />
        <Column
          field="role"
          header="Role"
          body={roleBodyTemplate}
          sortable
          style={{ minWidth: "10rem" }}
        />
        <Column
          field="is_blocked"
          header="Status"
          body={statusTemplate}
          style={{ minWidth: "10rem" }}
        />
        <Column header="Last Activity" body={dateBodyTemplate} style={{ minWidth: "10rem" }} />
        <Column header="Actions" body={actionsTemplate} style={{ width: "8rem" }} />
      </DataTable>
    </div>
  );
};

export default UserTable;
