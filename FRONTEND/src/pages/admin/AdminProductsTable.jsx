/**
 * @component AdminProductsTable
 * @description PrimeReact DataTable for displaying products with lazy
 * server-side pagination and sorting.
 *
 * Features:
 *  - Cloudinary-optimized thumbnails via URL transformation
 *  - Portion/modifier dropdowns per row using native <select> for reliable
 *    interaction inside DataTable cells
 *  - Price and stock columns react to selected portion + modifier
 *  - Skeleton loading state with matching column templates
 *  - Active/inactive toggle switch per row
 *
 * Props: products, loading, totalRecords, lazyParams, onLazyLoad, onEdit,
 *        onDelete, onToggleStatus
 *
 * Consumed by: AdminProductsTab
 */
import { useState, useEffect, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { InputSwitch } from "primereact/inputswitch";
import { Skeleton } from "primereact/skeleton";
import { Pencil, Trash2, ImageOff } from "lucide-react";

const formatPrice = (price) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(price || 0);

/** Insert Cloudinary transforms into a URL for optimized thumbnails. */
const cloudinaryThumb = (url, size = 80) => {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace(
    "/upload/",
    `/upload/w_${size},h_${size},c_fill,q_auto,f_auto/`
  );
};

/** Parse "1@@256 GB||45000||42000||50;;2@@512 GB||55000||||30" into array of objects */
function parsePortionDetails(raw) {
  if (!raw) return [];
  return raw.split(";;").map((item) => {
    const atIdx = item.indexOf("@@");
    const ppId = Number(item.substring(0, atIdx));
    const rest = item.substring(atIdx + 2);
    const [value, price, discountedPrice, stock] = rest.split("||");
    return {
      ppId,
      value: value.trim(),
      price: Number(price),
      discountedPrice: discountedPrice ? Number(discountedPrice) : null,
      stock: stock !== undefined ? Number(stock) : 0,
    };
  });
}

/** Parse "1@@Color: Red||50||4;;2@@Size: Large||0||5" into array of objects */
function parseModifierDetails(raw) {
  if (!raw) return [];
  return raw.split(";;").map((item) => {
    const atIdx = item.indexOf("@@");
    const ppId = Number(item.substring(0, atIdx));
    const rest = item.substring(atIdx + 2);
    // Split from the right: label||additionalPrice||stock
    const parts = rest.split("||");
    const stock = Number(parts.pop()) || 0;
    const additionalPrice = Number(parts.pop()) || 0;
    const label = parts.join("||").trim();
    return { ppId, label, additionalPrice, stock };
  });
}

/**
 * ProductImage - Shows skeleton shimmer while loading, fades in on load
 */
function ProductImage({ src, alt }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    setStatus("loading");
  }, [src]);

  return (
    <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 flex-shrink-0 relative">
      {status === "loading" && (
        <Skeleton
          width="2.5rem"
          height="2.5rem"
          borderRadius="0.5rem"
          className="absolute inset-0"
        />
      )}
      {status !== "error" && (
        <img
          src={src}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            status === "loaded" ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
        />
      )}
      {status === "error" && (
        <div className="w-full h-full flex items-center justify-center">
          <ImageOff className="w-5 h-5 text-gray-400" />
        </div>
      )}
    </div>
  );
}

/**
 * AdminProductsTable - DataTable component for displaying products
 */
function AdminProductsTable({
  products,
  loading,
  totalRecords,
  lazyParams,
  onLazyLoad,
  onEdit,
  onDelete,
  onToggleStatus,
}) {
  // Track selected portion per product (keyed by product_id → ppId)
  const [selectedPortions, setSelectedPortions] = useState({});
  // Track selected modifier per product for browsing (keyed by product_id → label)
  const [selectedModifiers, setSelectedModifiers] = useState({});

  // Enrich products with selection state so DataTable re-renders cells when selections change
  const tableData = useMemo(() =>
    products.map((p) => ({
      ...p,
      _selectedPpId: selectedPortions[p.product_id] ?? null,
      _selectedModifier: selectedModifiers[p.product_id] ?? null,
    })),
    [products, selectedPortions, selectedModifiers]
  );

  // Image column template
  const imageBodyTemplate = (rowData) => {
    const imageUrl = rowData.image_url || rowData.thumbnail || rowData.image;
    if (imageUrl) {
      return (
        <ProductImage
          src={cloudinaryThumb(imageUrl, 80)}
          alt={rowData.display_name || rowData.name}
        />
      );
    }
    return (
      <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
        <ImageOff className="w-4 h-4 text-gray-400" />
      </div>
    );
  };

  // Name column
  const nameBodyTemplate = (rowData) => (
    <div className="flex flex-col">
      <span className="font-medium text-gray-900 dark:text-gray-100">
        {rowData.display_name || rowData.name}
      </span>
      {rowData.display_name && rowData.name !== rowData.display_name && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {rowData.name}
        </span>
      )}
    </div>
  );

  // Helper: find selected modifier object for a row
  const getSelectedModifier = (rowData, portions) => {
    if (!rowData._selectedModifier) return null;
    const allModifiers = parseModifierDetails(rowData.modifier_details);
    const selectedPpId = rowData._selectedPpId ?? (portions[0]?.ppId || null);
    return allModifiers.find(
      (m) => m.label === rowData._selectedModifier && m.ppId === selectedPpId
    ) || null;
  };

  // Price column — reacts to selected portion + modifier additional price
  const priceBodyTemplate = (rowData) => {
    const portions = parsePortionDetails(rowData.portion_details);
    const mod = getSelectedModifier(rowData, portions);
    const modifierExtra = mod?.additionalPrice || 0;

    if (portions.length > 0) {
      const selectedPpId = rowData._selectedPpId ?? portions[0].ppId;
      const portion = portions.find((p) => p.ppId === selectedPpId) || portions[0];

      const basePrice = portion.price + modifierExtra;
      const discPrice = portion.discountedPrice
        ? portion.discountedPrice + modifierExtra
        : null;

      if (discPrice && discPrice < basePrice) {
        return (
          <div className="flex flex-col">
            <span className="font-medium text-green-600 dark:text-green-400">
              {formatPrice(discPrice)}
            </span>
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(basePrice)}
            </span>
          </div>
        );
      }
      return (
        <span className="font-medium text-green-600 dark:text-green-400">
          {formatPrice(basePrice)}
        </span>
      );
    }

    // No portions — show base price + modifier extra
    const basePrice = (rowData.price || 0) + modifierExtra;
    const discPrice = rowData.discounted_price
      ? rowData.discounted_price + modifierExtra
      : null;

    if (discPrice && discPrice < basePrice) {
      return (
        <div className="flex flex-col">
          <span className="font-medium text-green-600 dark:text-green-400">
            {formatPrice(discPrice)}
          </span>
          <span className="text-xs text-gray-400 line-through">
            {formatPrice(basePrice)}
          </span>
        </div>
      );
    }
    return (
      <span className="font-medium">{formatPrice(basePrice)}</span>
    );
  };

  // Stock column — reacts to selected portion + modifier
  const stockBodyTemplate = (rowData) => {
    const portions = parsePortionDetails(rowData.portion_details);
    let stock = rowData.stock || 0;

    // Show portion-specific stock when a portion is selected
    if (portions.length > 0) {
      const selectedPpId = rowData._selectedPpId ?? portions[0].ppId;
      const portion = portions.find((p) => p.ppId === selectedPpId) || portions[0];
      stock = portion.stock;
    }

    // Show modifier-specific stock when a modifier is selected
    const mod = getSelectedModifier(rowData, portions);
    if (mod) {
      stock = mod.stock;
    }

    let colorClass = "text-gray-700 dark:text-gray-300";
    if (stock === 0) {
      colorClass = "text-red-600 dark:text-red-400 font-semibold";
    } else if (stock < 10) {
      colorClass = "text-amber-600 dark:text-amber-400";
    }
    return <span className={colorClass}>{stock}</span>;
  };

  // Portions — native <select> for reliable interaction inside DataTable
  const portionsBodyTemplate = (rowData) => {
    const portions = parsePortionDetails(rowData.portion_details);
    if (portions.length === 0) {
      return <span className="text-xs text-gray-400 dark:text-gray-500">None</span>;
    }

    const selectedPpId = rowData._selectedPpId ?? portions[0].ppId;

    return (
      <select
        value={selectedPpId}
        onChange={(e) => {
          e.stopPropagation();
          const ppId = Number(e.target.value);
          setSelectedPortions((prev) => ({ ...prev, [rowData.product_id]: ppId }));
          // Reset modifier selection when portion changes
          setSelectedModifiers((prev) => {
            const next = { ...prev };
            delete next[rowData.product_id];
            return next;
          });
        }}
        onClick={(e) => e.stopPropagation()}
        className="admin-table-select admin-table-select-blue"
      >
        {portions.map((p) => (
          <option key={p.ppId} value={p.ppId}>{p.value}</option>
        ))}
      </select>
    );
  };

  // Modifiers — native <select> filtered by selected portion
  const modifiersBodyTemplate = (rowData) => {
    const allModifiers = parseModifierDetails(rowData.modifier_details);
    if (allModifiers.length === 0) {
      return <span className="text-xs text-gray-400 dark:text-gray-500">None</span>;
    }

    const portions = parsePortionDetails(rowData.portion_details);
    const selectedPpId = rowData._selectedPpId ?? (portions[0]?.ppId || null);

    // Filter modifiers by the selected portion
    const filtered = selectedPpId
      ? allModifiers.filter((m) => m.ppId === selectedPpId)
      : allModifiers;

    if (filtered.length === 0) {
      return <span className="text-xs text-gray-400 dark:text-gray-500">None</span>;
    }

    // Deduplicate labels
    const unique = [...new Map(filtered.map((m) => [m.label, m])).values()];

    return (
      <select
        value={rowData._selectedModifier ?? ""}
        onChange={(e) => {
          e.stopPropagation();
          const val = e.target.value;
          setSelectedModifiers((prev) => {
            if (!val) {
              const next = { ...prev };
              delete next[rowData.product_id];
              return next;
            }
            return { ...prev, [rowData.product_id]: val };
          });
        }}
        onClick={(e) => e.stopPropagation()}
        className="admin-table-select admin-table-select-purple"
      >
        <option value="">
          None ({unique.length} available)
        </option>
        {unique.map((m) => (
          <option key={m.label} value={m.label}>{m.label}</option>
        ))}
      </select>
    );
  };

  // Status toggle
  const statusBodyTemplate = (rowData) => (
    <div className="flex items-center gap-2">
      <InputSwitch
        checked={Boolean(rowData.is_active)}
        onChange={(e) => onToggleStatus(rowData, e.value)}
        className="admin-status-switch"
      />
      <span
        className={`text-xs font-medium ${
          rowData.is_active
            ? "text-green-600 dark:text-green-400"
            : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {rowData.is_active ? "Active" : "Inactive"}
      </span>
    </div>
  );

  // Action buttons
  const actionBodyTemplate = (rowData) => (
    <div className="flex gap-2">
      <Button
        type="button"
        rounded
        text
        severity="info"
        className="admin-action-btn h-9 w-9 p-0 flex items-center justify-center"
        onClick={() => onEdit(rowData)}
        tooltip="Edit product"
        tooltipOptions={{ position: "top" }}
      >
        <Pencil className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        rounded
        text
        severity="danger"
        className="admin-action-btn h-9 w-9 p-0 flex items-center justify-center"
        onClick={() => onDelete(rowData)}
        tooltip="Delete product"
        tooltipOptions={{ position: "top" }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );

  // Skeleton templates
  const skeletonImageTemplate = () => (
    <Skeleton width="2.5rem" height="2.5rem" borderRadius="0.5rem" />
  );
  const skeletonTemplate = () => (
    <Skeleton height="1.25rem" className="w-[80%]" />
  );
  const skeletonSwitchTemplate = () => (
    <div className="flex items-center gap-2">
      <Skeleton width="2.5rem" height="1.25rem" borderRadius="1rem" />
      <Skeleton width="3rem" height="0.875rem" />
    </div>
  );
  const skeletonDropdownTemplate = () => (
    <Skeleton width="7rem" height="1.75rem" borderRadius="0.375rem" />
  );
  const skeletonActionTemplate = () => (
    <div className="flex gap-2">
      <Skeleton shape="circle" size="2.25rem" />
      <Skeleton shape="circle" size="2.25rem" />
    </div>
  );

  const skeletonData = Array.from({ length: lazyParams.rows || 5 }, (_, i) => ({
    product_id: `skeleton-${i}`,
  }));

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

  return (
    <div className="admin-products-table-wrapper flex-1 flex flex-col min-h-0">
      <DataTable
        value={loading ? skeletonData : tableData}
        lazy
        paginator
        first={lazyParams.first}
        rows={lazyParams.rows}
        totalRecords={totalRecords}
        onPage={handlePage}
        onSort={handleSort}
        sortField={lazyParams.sortField}
        sortOrder={lazyParams.sortOrder}
        dataKey="product_id"
        scrollable
        emptyMessage="No products found."
        className="admin-products-table"
        rowsPerPageOptions={[5, 10, 25, 50]}
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
        tableStyle={{ minWidth: "70rem" }}
      >
        <Column field="product_id" header="ID" sortable body={loading ? skeletonTemplate : null} style={{ width: "5rem" }} />
        <Column header="Image" body={loading ? skeletonImageTemplate : imageBodyTemplate} style={{ width: "5rem" }} />
        <Column field="display_name" header="Name" sortable body={loading ? skeletonTemplate : nameBodyTemplate} style={{ minWidth: "14rem" }} />
        <Column field="category_name" header="Category" sortable body={loading ? skeletonTemplate : null} style={{ minWidth: "8rem" }} />
        <Column field="price" header="Price" sortable body={loading ? skeletonTemplate : priceBodyTemplate} style={{ minWidth: "8rem" }} />
        <Column field="stock" header="Stock" sortable body={loading ? skeletonTemplate : stockBodyTemplate} style={{ minWidth: "5rem" }} />
        <Column field="portion_count" header="Portions" body={loading ? skeletonDropdownTemplate : portionsBodyTemplate} style={{ minWidth: "10rem" }} />
        <Column field="modifier_count" header="Modifiers" body={loading ? skeletonDropdownTemplate : modifiersBodyTemplate} style={{ minWidth: "10rem" }} />
        <Column field="is_active" header="Status" body={loading ? skeletonSwitchTemplate : statusBodyTemplate} style={{ minWidth: "8rem" }} />
        <Column header="Actions" body={loading ? skeletonActionTemplate : actionBodyTemplate} exportable={false} style={{ minWidth: "7rem" }} />
      </DataTable>
    </div>
  );
}

export default AdminProductsTable;
