import { useEffect, useRef, useCallback } from "react";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Button } from "primereact/button";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { Plus } from "lucide-react";

const statusOptions = [
  { label: "All Status", value: null },
  { label: "Active", value: true },
  { label: "Inactive", value: false },
];

const offerTypeOptions = [
  { label: "All Types", value: null },
  { label: "Flat Discount", value: "flat_discount" },
  { label: "Product Discount", value: "product_discount" },
  { label: "Category Discount", value: "category_discount" },
//   { label: "Time Based", value: "time_based" },
//   { label: "First Order", value: "first_order" },
];

function AdminOffersToolbar({
  onSearch,
  onStatusFilter,
  statusFilter,
  onOfferTypeFilter,
  offerTypeFilter,
  onAddOffer,
  totalAll,
  totalActive,
}) {
  const debounceRef = useRef(null);
  const safeTotalAll = totalAll ?? 0;
  const safeTotalActive = totalActive ?? 0;
  const inactiveCount = safeTotalAll - safeTotalActive;

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
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      debounceRef.current = setTimeout(() => {
        onSearch(value);
      }, 300);
    },
    [onSearch],
  );

  return (
    <div className="admin-products-toolbar admin-offers-toolbar mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <IconField iconPosition="left" className="w-full sm:w-60">
          <InputIcon className="pi pi-search text-gray-400" />
          <InputText
            type="search"
            onChange={handleSearchChange}
            placeholder="Search offers..."
            className="admin-search-input h-10 w-full rounded-xl border border-gray-200 pl-10 pr-3 text-sm outline-none transition-all dark:border-gray-700"
          />
        </IconField>

        <Dropdown
          value={statusFilter}
          onChange={(e) => onStatusFilter(e.value ?? null)}
          options={statusOptions}
          optionLabel="label"
          optionValue="value"
          placeholder="Filter by Status"
          className="admin-filter-dropdown w-full sm:w-40"
          pt={{
            root: {
              className:
                "admin-dropdown-root rounded-xl h-10 flex items-center shadow-none border border-gray-200 dark:border-gray-700",
            },
            input: { className: "px-3 text-sm" },
            trigger: { className: "w-8" },
            panel: {
              className:
                "admin-dropdown-panel admin-offers-dropdown-panel rounded-lg shadow-xl mt-1",
            },
          }}
        />

        <Dropdown
          value={offerTypeFilter}
          onChange={(e) => onOfferTypeFilter(e.value ?? null)}
          options={offerTypeOptions}
          optionLabel="label"
          optionValue="value"
          placeholder="Filter by Offer Type"
          className="admin-filter-dropdown w-full sm:w-44"
          pt={{
            root: {
              className:
                "admin-dropdown-root rounded-xl h-10 flex items-center shadow-none border border-gray-200 dark:border-gray-700",
            },
            input: { className: "px-3 text-sm" },
            trigger: { className: "w-8" },
            panel: {
              className:
                "admin-dropdown-panel admin-offers-dropdown-panel rounded-lg shadow-xl mt-1",
            },
          }}
        />
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 dark:border-gray-700 dark:bg-gray-800/50">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              Total
            </span>
            <span className="text-xs font-bold text-gray-900 dark:text-gray-100">
              {safeTotalAll}
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 dark:border-green-800/40 dark:bg-green-900/20">
            <span className="text-xs text-green-600 dark:text-green-400">
              Active
            </span>
            <span className="text-xs font-bold text-green-700 dark:text-green-300">
              {safeTotalActive}
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 dark:border-red-800/40 dark:bg-red-900/20">
            <span className="text-xs text-red-500 dark:text-red-400">
              Inactive
            </span>
            <span className="text-xs font-bold text-red-600 dark:text-red-300">
              {inactiveCount}
            </span>
          </div>
        </div>

        <Button
          type="button"
          className="admin-btn-primary flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium shadow-md transition-all hover:shadow-lg"
          onClick={onAddOffer}
        >
          <Plus className="h-4 w-4" />
          <span>New Offer</span>
        </Button>
      </div>
    </div>
  );
}

export default AdminOffersToolbar;
