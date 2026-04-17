import { useRef, useCallback } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Search } from "lucide-react";

const statusOptions = [
  { label: "All Status", value: "all" },
  { label: "Active", value: "active" },
  { label: "Blocked", value: "blocked" },
];

const roleOptions = [
  { label: "All Roles", value: "all" },
  { label: "Customer", value: "customer" },
  { label: "Admin", value: "admin" },
];

function AdminUsersToolbar({
  onSearch,
  onRoleFilter,
  onStatusFilter,
  roleFilter,
  statusFilter,
  totalAll,
  totalBlocked,
  totalAdmins,
  onCreate,
}) {
  const debounceRef = useRef(null);

  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onSearch(value);
      }, 300);
    },
    [onSearch],
  );

  return (
    <div className="admin-products-toolbar flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Total
          </span>
          <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
            {totalAll}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/40">
          <span className="text-xs text-yellow-600 dark:text-yellow-400">
            Blocked
          </span>
          <span className="text-xs font-bold text-yellow-700 dark:text-yellow-300">
            {totalBlocked}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-200 dark:border-cyan-800/40">
          <span className="text-xs text-cyan-600 dark:text-cyan-400">
            Admins
          </span>
          <span className="text-xs font-bold text-cyan-700 dark:text-cyan-300">
            {totalAdmins}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <Dropdown
          value={roleFilter}
          onChange={(e) => onRoleFilter(e.value)}
          options={roleOptions}
          placeholder="Filter by Role"
          className="admin-filter-dropdown w-full sm:w-40"
          pt={{
            root: {
              className:
                "admin-dropdown-root rounded-xl h-10 flex items-center shadow-none border border-gray-200 dark:border-gray-700",
            },
            input: {
              className: "px-3 text-sm",
            },
            trigger: { className: "w-8" },
            panel: {
              className: "admin-dropdown-panel rounded-lg shadow-xl mt-1",
            },
          }}
        />

        <Dropdown
          value={statusFilter}
          onChange={(e) => onStatusFilter(e.value)}
          options={statusOptions}
          placeholder="Filter by Status"
          className="admin-filter-dropdown w-full sm:w-40"
          pt={{
            root: {
              className:
                "admin-dropdown-root rounded-xl h-10 flex items-center shadow-none border border-gray-200 dark:border-gray-700",
            },
            input: {
              className: "px-3 text-sm",
            },
            trigger: { className: "w-8" },
            panel: {
              className: "admin-dropdown-panel rounded-lg shadow-xl mt-1",
            },
          }}
        />

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <InputText
            type="search"
            onChange={handleSearchChange}
            placeholder="Search users..."
            className="admin-search-input w-full pl-10 border border-gray-200 dark:border-gray-700 rounded-xl h-10 text-sm transition-all outline-none"
          />
        </div>

        <Button
          type="button"
          icon="pi pi-user-plus"
          label="Create User"
          onClick={onCreate}
          className="admin-btn-primary h-10 px-4 rounded-xl font-semibold"
        />
      </div>
    </div>
  );
}

export default AdminUsersToolbar;
