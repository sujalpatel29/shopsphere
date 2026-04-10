/**
 * @component AdminProductsToolbar
 * @description Toolbar bar above the products DataTable.
 *
 * Contains:
 *  - "New Product" button (primary action)
 *  - Stats badges (Total, Active, Inactive counts)
 *  - Status filter dropdown (All / Active / Inactive)
 *  - Debounced search input (300ms delay)
 *
 * Props: onSearch, onStatusFilter, statusFilter, onAddProduct, totalAll, totalActive
 * Consumed by: AdminProductsTab
 */
import { useRef, useCallback, useEffect } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { Search, Plus } from "lucide-react";

// Status filter options
const statusOptions = [
  { label: "All Status", value: null },
  { label: "Active", value: true },
  { label: "Inactive", value: false },
];

/**
 * AdminProductsToolbar - Top bar with search, filters, and "New Product" button
 * @param {Object} props
 * @param {Function} props.onSearch - Callback when search value changes (debounced)
 * @param {Function} props.onStatusFilter - Callback when status filter changes
 * @param {*} props.statusFilter - Current status filter value
 * @param {Function} props.onAddProduct - Callback when "New Product" button is clicked
 */
function AdminProductsToolbar({
  onSearch,
  onStatusFilter,
  statusFilter,
  onAddProduct,
  totalAll,
  totalActive,
  helperText = "",
}) {
  const debounceRef = useRef(null);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const handleSearchChange = useCallback(
    (e) => {
      const value = e.target.value;

      // Clear existing timeout
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      // Set new timeout for debounce (300ms)
      debounceRef.current = setTimeout(() => {
        onSearch(value);
      }, 300);
    },
    [onSearch]
  );

  return (
    <div className="admin-products-toolbar mb-6 flex flex-col gap-4">
      {helperText ? (
        <div className="rounded-3xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-stone-50 to-emerald-50 px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-amber-500/20 dark:bg-[linear-gradient(135deg,rgba(35,47,50,0.96),rgba(24,31,34,0.94))] dark:text-stone-200">
          {helperText}
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left side: New Product button */}
        <Button
          type="button"
          className="admin-btn-primary flex items-center justify-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-medium shadow-md transition-all hover:shadow-lg"
          onClick={onAddProduct}
        >
          <Plus className="h-4 w-4" />
          <span>New Product</span>
        </Button>

        {/* Right side: Stats + Filters + Search */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          {/* Stats badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-2xl border border-stone-200/80 bg-white/90 px-3 py-2 shadow-sm dark:border-stone-700 dark:bg-stone-900/70">
              <span className="block text-[11px] uppercase tracking-[0.18em] text-stone-500 dark:text-stone-400">
                Total
              </span>
              <span className="text-sm font-semibold text-slate-900 dark:text-stone-100">
                {totalAll}
              </span>
            </div>
            <div className="rounded-2xl border border-emerald-200/80 bg-emerald-50/90 px-3 py-2 shadow-sm dark:border-emerald-800/40 dark:bg-emerald-950/40">
              <span className="block text-[11px] uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                Active
              </span>
              <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-200">
                {totalActive}
              </span>
            </div>
            <div className="rounded-2xl border border-rose-200/80 bg-rose-50/90 px-3 py-2 shadow-sm dark:border-rose-900/40 dark:bg-rose-950/40">
              <span className="block text-[11px] uppercase tracking-[0.18em] text-rose-700 dark:text-rose-300">
                Inactive
              </span>
              <span className="text-sm font-semibold text-rose-700 dark:text-rose-200">
                {totalAll - totalActive}
              </span>
            </div>
          </div>

          {/* Status Filter */}
          <Dropdown
            value={statusFilter}
            onChange={(e) => onStatusFilter(e.value)}
            options={statusOptions}
            placeholder="Filter by Status"
            className="admin-filter-dropdown w-full sm:w-44"
            pt={{
              root: {
                className:
                  "admin-dropdown-root rounded-2xl h-10 flex items-center shadow-none border border-gray-200 dark:border-gray-700",
              },
              input: {
                className: "px-3 text-sm",
              },
              trigger: { className: "w-8" },
              panel: {
                className:
                  "admin-dropdown-panel rounded-2xl shadow-xl mt-1 border border-stone-200 bg-white dark:border-stone-700 dark:bg-stone-900",
              },
            }}
          />

          {/* Search input */}
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-400 dark:text-stone-500" />
            <InputText
              type="search"
              onChange={handleSearchChange}
              placeholder="Search products..."
              className="admin-search-input h-10 w-full rounded-2xl border border-gray-200 pl-10 text-sm outline-none transition-all dark:border-gray-700"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminProductsToolbar;
