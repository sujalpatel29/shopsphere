/**
 * @component ProductModifiersPanel
 * @description Tab panel for assigning modifiers to a product's portions.
 *
 * Supports two modes:
 *  1. Product HAS portions → user selects a portion first, then manages
 *     modifiers scoped to that portion (modifier_portion links via product_portion_id)
 *  2. Product has NO portions → modifiers link directly to the product
 *     (modifier_portion links via product_id)
 *
 * Features:
 *  - Dropdown to select from available (unassigned) modifiers
 *  - Inline row editing for additional_price and stock
 *  - Stock accounting: tracks portion/product stock vs. assigned modifier stock
 *
 * API: adminModifiersApi (fetchModifiers, fetchModifiersByProductPortion,
 *      fetchModifiersByProduct, createModifierPortion, updateModifierPortion,
 *      deleteModifierPortion), adminPortionsApi (fetchProductPortions)
 *
 * Props: product, onCountChange, onMutate
 * Consumed by: ProductFormModal (Modifiers tab)
 */
import { useState, useEffect, useCallback, useMemo } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Dropdown } from "primereact/dropdown";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { Plus, Save, Pencil, Trash2, X } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { fetchProductPortions } from "../../../api/adminPortionsApi";
import {
  fetchModifiers,
  fetchModifiersByProductPortion,
  fetchModifiersByProduct,
  createModifierPortion,
  updateModifierPortion,
  deleteModifierPortion,
} from "../../../api/adminModifiersApi";
import getApiErrorMessage from "../../utils/apiError";

const currencyFormat = (val) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    Number(val) || 0,
  );

function ProductModifiersPanel({
  product,
  onCountChange,
  onMutate,
}) {
  const showToast = useToast();
  // Product-portions for the first dropdown
  const [productPortions, setProductPortions] = useState([]);
  const [selectedPPId, setSelectedPPId] = useState(null);

  // All modifiers from master (for the add dropdown)
  const [allModifiers, setAllModifiers] = useState([]);

  // Modifiers assigned to selected product-portion
  const [portionModifiers, setPortionModifiers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingModifiers, setLoadingModifiers] = useState(false);

  // Add form
  const [newModifierId, setNewModifierId] = useState(null);
  const [newAdditionalPrice, setNewAdditionalPrice] = useState(null);
  const [newStock, setNewStock] = useState(null);
  const [adding, setAdding] = useState(false);

  // Inline editing
  const [editingRows, setEditingRows] = useState({});
  const [savingRows, setSavingRows] = useState({});
  const [deletingRows, setDeletingRows] = useState({});

  // ── Load product-portions & all modifiers on mount ──
  useEffect(() => {
    const loadInitial = async () => {
      setLoading(true);
      try {
        const [pPortions, mods] = await Promise.all([
          fetchProductPortions(product.product_id),
          fetchModifiers(),
        ]);
        setProductPortions(pPortions);
        setAllModifiers(mods);
      } catch (error) {
        showToast("error", "Error", getApiErrorMessage(error));
      } finally {
        setLoading(false);
      }
    };

    if (product?.product_id) {
      loadInitial();
    }
  }, [product?.product_id, showToast]);

  // Whether product has no portions (modifiers link directly to product)
  const noPortions = !loading && productPortions.length === 0;

  // ── Load modifiers when product-portion selection changes ──
  const loadPortionModifiers = useCallback(
    async (ppId) => {
      if (!ppId) {
        setPortionModifiers([]);
        return;
      }
      setLoadingModifiers(true);
      try {
        const data = await fetchModifiersByProductPortion(ppId);
        setPortionModifiers(data);
      } catch (error) {
        showToast("error", "Error", getApiErrorMessage(error));
        setPortionModifiers([]);
      } finally {
        setLoadingModifiers(false);
      }
    },
    [showToast],
  );

  // ── Load modifiers directly for product (no portions) ──
  const loadProductModifiers = useCallback(async () => {
    setLoadingModifiers(true);
    try {
      const data = await fetchModifiersByProduct(product.product_id);
      setPortionModifiers(data);
    } catch (error) {
      showToast("error", "Error", getApiErrorMessage(error));
      setPortionModifiers([]);
    } finally {
      setLoadingModifiers(false);
    }
  }, [product.product_id, showToast]);

  useEffect(() => {
    if (noPortions) {
      loadProductModifiers();
    } else {
      loadPortionModifiers(selectedPPId);
    }
    setEditingRows({});
  }, [selectedPPId, noPortions, loadPortionModifiers, loadProductModifiers]);

  // Report count to parent whenever modifiers change
  useEffect(() => {
    if (portionModifiers.length > 0) {
      onCountChange?.(portionModifiers.length);
    }
  }, [portionModifiers.length, onCountChange]);

  // Enrich data with editing state so DataTable re-renders when edit state changes
  const tableData = useMemo(
    () =>
      portionModifiers.map((pm) => ({
        ...pm,
        _editing: editingRows[pm.modifier_portion_id] || null,
        _saving: savingRows[pm.modifier_portion_id] || false,
        _deleting: deletingRows[pm.modifier_portion_id] || false,
      })),
    [portionModifiers, editingRows, savingRows, deletingRows],
  );

  // ── Dropdown options ──
  const ppOptions = productPortions.map((pp) => ({
    label: `${pp.portion_value} — ${currencyFormat(pp.price)}`,
    value: pp.product_portion_id,
  }));

  const availableModifiers = allModifiers.filter(
    (m) => !portionModifiers.some((pm) => pm.modifier_id === m.modifier_id),
  );

  const modifierOptions = availableModifiers.map((m) => ({
    label: `${m.modifier_name}: ${m.modifier_value}`,
    value: m.modifier_id,
  }));

  // Stock accounting: total modifier stock vs portion stock (or product stock if no portions)
  const selectedPortion = productPortions.find(
    (pp) => pp.product_portion_id === selectedPPId,
  );
  const baseStock = noPortions
    ? Number(product?.stock) || 0
    : Number(selectedPortion?.stock) || 0;
  const assignedModifierStock = portionModifiers.reduce(
    (sum, pm) => sum + (Number(pm.stock) || 0),
    0,
  );
  const remainingModifierStock = baseStock - assignedModifierStock;

  // ── Add handler ──
  const handleAdd = async () => {
    if (!newModifierId) {
      showToast("warn", "Warning", "Please select a modifier");
      return;
    }
    if (!noPortions && !selectedPPId) {
      showToast("warn", "Warning", "Please select a portion first");
      return;
    }
    const stockToAdd = newStock || 0;
    if (stockToAdd > remainingModifierStock) {
      showToast(
        "warn",
        "Stock Exceeded",
        `Only ${remainingModifierStock} units remaining out of ${baseStock} ${noPortions ? "product" : "portion"} stock`,
      );
      return;
    }
    setAdding(true);
    try {
      const payload = {
        modifier_id: newModifierId,
        additional_price: newAdditionalPrice || 0,
        stock: newStock || 0,
      };
      if (noPortions) {
        payload.product_id = product.product_id;
      } else {
        payload.product_portion_id = selectedPPId;
      }
      await createModifierPortion(payload);
      onMutate?.();
      showToast("success", "Success", "Modifier assigned successfully");
      setNewModifierId(null);
      setNewAdditionalPrice(null);
      setNewStock(null);
      if (noPortions) {
        await loadProductModifiers();
      } else {
        await loadPortionModifiers(selectedPPId);
      }
    } catch (error) {
      showToast("error", "Error", getApiErrorMessage(error));
    } finally {
      setAdding(false);
    }
  };

  // ── Inline editing helpers ──
  const startEdit = (rowData) => {
    setEditingRows((prev) => ({
      ...prev,
      [rowData.modifier_portion_id]: {
        additional_price: Number(rowData.additional_price) || 0,
        stock: Number(rowData.stock) || 0,
      },
    }));
  };

  const cancelEdit = (id) => {
    setEditingRows((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateEditField = (id, field, value) => {
    setEditingRows((prev) => ({
      ...prev,
      [id]: { ...prev[id], [field]: value },
    }));
  };

  const handleRowSave = async (rowData) => {
    const edited = editingRows[rowData.modifier_portion_id];
    if (!edited) return;

    // Check stock doesn't exceed total (remaining + this row's original stock)
    const originalRowStock = Number(rowData.stock) || 0;
    const maxAllowed = remainingModifierStock + originalRowStock;
    if ((edited.stock || 0) > maxAllowed) {
      showToast(
        "warn",
        "Stock Exceeded",
        `Max ${maxAllowed} units allowed for this modifier (${baseStock} ${noPortions ? "product" : "portion"} stock)`,
      );
      return;
    }

    setSavingRows((prev) => ({ ...prev, [rowData.modifier_portion_id]: true }));
    try {
      await updateModifierPortion(rowData.modifier_portion_id, edited);
      onMutate?.();
      showToast("success", "Success", "Modifier updated successfully");
      cancelEdit(rowData.modifier_portion_id);
      if (noPortions) await loadProductModifiers();
      else await loadPortionModifiers(selectedPPId);
    } catch (error) {
      showToast("error", "Error", getApiErrorMessage(error));
    } finally {
      setSavingRows((prev) => ({
        ...prev,
        [rowData.modifier_portion_id]: false,
      }));
    }
  };

  const handleRowDelete = async (rowData) => {
    setDeletingRows((prev) => ({
      ...prev,
      [rowData.modifier_portion_id]: true,
    }));
    try {
      await deleteModifierPortion(rowData.modifier_portion_id);
      onMutate?.();
      showToast("success", "Success", "Modifier removed successfully");
      if (noPortions) await loadProductModifiers();
      else await loadPortionModifiers(selectedPPId);
    } catch (error) {
      showToast("error", "Error", getApiErrorMessage(error));
    } finally {
      setDeletingRows((prev) => ({
        ...prev,
        [rowData.modifier_portion_id]: false,
      }));
    }
  };

  // ── Column templates (read from enriched rowData._editing etc.) ──
  const nameBodyTemplate = (rowData) => (
    <span className="font-medium text-gray-900 dark:text-gray-100">
      {rowData.modifier_name}
    </span>
  );

  const valueBodyTemplate = (rowData) => (
    <span className="text-gray-700 dark:text-gray-300">
      {rowData.modifier_value}
    </span>
  );

  const additionalPriceBodyTemplate = (rowData) => {
    const id = rowData.modifier_portion_id;
    const edited = rowData._editing;
    if (edited) {
      return (
        <InputNumber
          value={edited.additional_price}
          onValueChange={(e) =>
            updateEditField(id, "additional_price", e.value)
          }
          mode="currency"
          currency="INR"
          locale="en-IN"
          className="admin-inputnumber-wrap w-full"
          pt={{
            input: {
              className: "admin-input w-full rounded-lg h-8 px-2 text-xs",
              autoComplete: "off",
            },
          }}
        />
      );
    }
    const val = Number(rowData.additional_price) || 0;
    if (val === 0) return <span className="text-gray-400">—</span>;
    return (
      <span className="font-medium text-green-600 dark:text-green-400">
        {currencyFormat(val)}
      </span>
    );
  };

  const stockBodyTemplate = (rowData) => {
    const id = rowData.modifier_portion_id;
    const edited = rowData._editing;
    if (edited) {
      return (
        <InputNumber
          value={edited.stock}
          onValueChange={(e) => updateEditField(id, "stock", e.value)}
          min={0}
          className="admin-inputnumber-wrap w-full"
          pt={{
            input: {
              className: "admin-input w-full rounded-lg h-8 px-2 text-xs",
              autoComplete: "off",
            },
          }}
        />
      );
    }
    return (
      <span className="text-gray-700 dark:text-gray-300">
        {rowData.stock ?? 0}
      </span>
    );
  };

  const actionBodyTemplate = (rowData) => {
    const id = rowData.modifier_portion_id;
    const edited = rowData._editing;
    const isSaving = rowData._saving;
    const isDeleting = rowData._deleting;

    return (
      <div
        className="flex gap-1.5"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {edited ? (
          <>
            <button
              type="button"
              className="h-8 w-8 rounded-full flex items-center justify-center text-green-600 hover:bg-green-50 dark:hover:bg-green-500/15 transition-colors disabled:opacity-40"
              onClick={(e) => {
                e.stopPropagation();
                handleRowSave(rowData);
              }}
              disabled={isSaving}
              title="Save"
            >
              <Save className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              className="h-8 w-8 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40"
              onClick={(e) => {
                e.stopPropagation();
                cancelEdit(id);
              }}
              disabled={isSaving}
              title="Cancel"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </>
        ) : (
          <button
            type="button"
            className="h-8 w-8 rounded-full flex items-center justify-center text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-500/15 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              startEdit(rowData);
            }}
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
        )}
        <button
          type="button"
          className="h-8 w-8 rounded-full flex items-center justify-center text-red-600 hover:bg-red-50 dark:hover:bg-red-500/15 transition-colors disabled:opacity-40"
          onClick={(e) => {
            e.stopPropagation();
            handleRowDelete(rowData);
          }}
          disabled={isDeleting || Boolean(edited)}
          title="Remove"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  };

  // ── Render ──
  // Whether to show the modifier form (either no portions or a portion is selected)
  const showForm = noPortions || selectedPPId;

  return (
    <div className="flex flex-col gap-4 mt-2">
      {/* ── Product-Portion selector (only when portions exist) ── */}
      {!noPortions && (
        <div className="flex flex-col gap-1">
          <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Select Product-Portion
          </label>
          <Dropdown
            value={selectedPPId}
            onChange={(e) => setSelectedPPId(e.value)}
            options={ppOptions}
            placeholder="Choose a portion to manage its modifiers…"
            loading={loading}
            className="admin-dropdown w-full max-w-md"
            pt={{
              root: {
                className:
                  "admin-dropdown-root rounded-lg h-10 flex items-center shadow-none",
              },
              input: { className: "px-3 text-sm" },
              trigger: { className: "w-10" },
              panel: {
                className: "admin-dropdown-panel rounded-lg shadow-xl mt-1",
              },
            }}
          />
        </div>
      )}

      {showForm && (
        <>
          {/* ── Stock info ── */}
          <div className="flex items-center gap-4 text-xs font-medium px-1">
            <span className="text-gray-500 dark:text-gray-400">
              {noPortions ? "Product" : "Portion"} Stock:{" "}
              <span className="text-gray-800 dark:text-gray-200">
                {baseStock}
              </span>
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              Assigned:{" "}
              <span className="text-gray-800 dark:text-gray-200">
                {assignedModifierStock}
              </span>
            </span>
            <span
              className={
                remainingModifierStock < 0
                  ? "text-red-600 dark:text-red-400"
                  : remainingModifierStock === 0
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-green-600 dark:text-green-400"
              }
            >
              Remaining: {remainingModifierStock}
            </span>
          </div>

          {/* ── Add modifier form ── */}
          <div className="flex flex-wrap items-end gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col gap-1 flex-1 min-w-[12rem]">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Modifier
              </label>
              <Dropdown
                value={newModifierId}
                onChange={(e) => setNewModifierId(e.value)}
                options={modifierOptions}
                placeholder="Select modifier…"
                className="admin-dropdown w-full"
                pt={{
                  root: {
                    className:
                      "admin-dropdown-root rounded-lg h-9 flex items-center shadow-none",
                  },
                  input: { className: "px-3 text-sm" },
                  trigger: { className: "w-10" },
                  panel: {
                    className: "admin-dropdown-panel rounded-lg shadow-xl mt-1",
                  },
                }}
              />
            </div>
            <div className="flex flex-col gap-1 min-w-[8rem]">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Add. Price
              </label>
              <InputNumber
                value={newAdditionalPrice}
                onValueChange={(e) => setNewAdditionalPrice(e.value)}
                mode="currency"
                currency="INR"
                locale="en-IN"
                className="admin-inputnumber-wrap w-full"
                pt={{
                  input: {
                    className: "admin-input w-full rounded-lg h-9 px-3 text-sm",
                    autoComplete: "off",
                  },
                }}
              />
            </div>
            <div className="flex flex-col gap-1 min-w-[5rem]">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                Stock{" "}
                <span className="text-gray-400 font-normal">
                  (max {Math.max(remainingModifierStock, 0)})
                </span>
              </label>
              <InputNumber
                value={newStock}
                onValueChange={(e) => setNewStock(e.value)}
                min={0}
                className="admin-inputnumber-wrap w-full"
                pt={{
                  input: {
                    className: "admin-input w-full rounded-lg h-9 px-3 text-sm",
                    autoComplete: "off",
                  },
                }}
              />
            </div>
            <Button
              type="button"
              className="admin-btn-primary flex items-center gap-1.5 px-4 h-9 rounded-lg text-sm font-medium shadow-sm"
              onClick={handleAdd}
              disabled={adding || !newModifierId}
            >
              <Plus className="h-4 w-4" />
              <span>{adding ? "Adding…" : "Add"}</span>
            </Button>
          </div>

          {/* ── Assigned modifiers table ── */}
          <div style={{ maxHeight: "220px", overflowY: "auto" }}>
            <DataTable
              value={tableData}
              dataKey="modifier_portion_id"
              loading={loadingModifiers}
              emptyMessage={
                noPortions
                  ? "No modifiers assigned to this product yet."
                  : "No modifiers assigned to this portion yet."
              }
              className="admin-products-table"
              tableStyle={{ minWidth: "36rem" }}
            >
              <Column
                field="modifier_name"
                header="Name"
                body={nameBodyTemplate}
                style={{ minWidth: "8rem" }}
              />
              <Column
                field="modifier_value"
                header="Value"
                body={valueBodyTemplate}
                style={{ minWidth: "8rem" }}
              />
              <Column
                field="additional_price"
                header="Add. Price"
                body={additionalPriceBodyTemplate}
                style={{ minWidth: "9rem" }}
              />
              <Column
                field="stock"
                header="Stock"
                body={stockBodyTemplate}
                style={{ minWidth: "5rem" }}
              />
              <Column
                header="Actions"
                body={actionBodyTemplate}
                exportable={false}
                style={{ minWidth: "7rem" }}
              />
            </DataTable>
          </div>
        </>
      )}
    </div>
  );
}

export default ProductModifiersPanel;
