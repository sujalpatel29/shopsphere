import { useState, useEffect } from "react";
import { X, ShoppingCart } from "lucide-react";
import api from "../../../api/api.js";

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

function PickerButton({ selected, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border px-3 py-1.5 text-sm font-medium transition ${
        selected
          ? "border-amber-500 bg-amber-50 text-amber-700 dark:border-amber-500 dark:bg-amber-500/15 dark:text-amber-300"
          : "border-gray-200 bg-white text-gray-700 hover:border-amber-400 hover:text-amber-600 dark:border-[#1f2933] dark:bg-[#1a252b] dark:text-slate-300 dark:hover:border-amber-500"
      }`}
    >
      {children}
    </button>
  );
}

function PortionPickerModal({ product, onHide, onConfirm }) {
  const [portions, setPortions] = useState([]);
  const [modifiers, setModifiers] = useState([]);
  const [selectedPortion, setSelectedPortion] = useState(null);
  const [selectedModifier, setSelectedModifier] = useState([]);
  const [portionsLoading, setPortionsLoading] = useState(true);
  const [modifiersLoading, setModifiersLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  // Receive already-fetched portions from caller via product._portions
  useEffect(() => {
    if (!product) return;
    const initial = Array.isArray(product._portions) ? product._portions : [];
    setPortions(initial);
    setPortionsLoading(false);
    if (initial.length > 0) setSelectedPortion(initial[0]);
  }, [product]);

  // Fetch modifiers whenever the selected portion changes
  useEffect(() => {
    if (!selectedPortion) return;
    let active = true;
    setModifiersLoading(true);
    setSelectedModifier([]);
    api
      .get(`/modifiers/by-portion/${selectedPortion.product_portion_id}`)
      .then((res) => {
        if (!active) return;
        const raw = res.data?.data ?? res.data ?? [];
        setModifiers(Array.isArray(raw) ? raw : []);
      })
      .catch(() => {
        if (active) setModifiers([]);
      })
      .finally(() => {
        if (active) setModifiersLoading(false);
      });
    return () => {
      active = false;
    };
  }, [selectedPortion]);

  const effectivePrice = (() => {
    if (!selectedPortion) return null;
    const base = Number(
      selectedPortion.discounted_price ?? selectedPortion.price ?? 0,
    );
    const extra = selectedModifier.reduce((acc, m) => acc + Number(m.additional_price ?? 0), 0);
    return base + extra;
  })();

  const handleConfirm = async () => {
    setAdding(true);
    const modifierIds = selectedModifier.map(m => m.modifier_id);
    await onConfirm(
      selectedPortion?.product_portion_id ?? null,
      modifierIds
    );
    setAdding(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center bg-black/40 backdrop-blur-sm"
      onClick={onHide}
    >
      <div
        className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl bg-white dark:bg-[#151e22] shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 dark:border-[#1f2933] p-5">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Customize
            </p>
            <p className="mt-0.5 truncate font-serif text-lg font-semibold text-gray-900 dark:text-slate-100">
              {product?.display_name || product?.name}
            </p>
          </div>
          <button
            onClick={onHide}
            className="shrink-0 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-[#1f2933] dark:hover:text-slate-300"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">
          {/* Portions */}
          {portionsLoading ? (
            <div className="space-y-2">
              <div className="h-3 w-16 animate-pulse rounded bg-gray-100 dark:bg-[#1f2933]" />
              <div className="flex gap-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-8 w-20 animate-pulse rounded-xl bg-gray-100 dark:bg-[#1f2933]"
                  />
                ))}
              </div>
            </div>
          ) : portions.length > 0 ? (
            <div>
              <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
                Size / Variant
              </p>
              <div className="flex flex-wrap gap-2">
                {portions.map((p) => {
                  const price = p.discounted_price ?? p.price;
                  return (
                    <PickerButton
                      key={p.product_portion_id}
                      selected={
                        selectedPortion?.product_portion_id ===
                        p.product_portion_id
                      }
                      onClick={() => setSelectedPortion(p)}
                    >
                      {p.portion_value}
                      {price ? (
                        <span className="ml-1 text-[11px] opacity-70">
                          {formatCurrency(price)}
                        </span>
                      ) : null}
                    </PickerButton>
                  );
                })}
              </div>
            </div>
          ) : null}

          {/* Modifiers */}
          {selectedPortion &&
            (modifiersLoading ? (
              <div className="space-y-2">
                <div className="h-3 w-20 animate-pulse rounded bg-gray-100 dark:bg-[#1f2933]" />
                <div className="flex gap-2">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-8 w-24 animate-pulse rounded-xl bg-gray-100 dark:bg-[#1f2933]"
                    />
                  ))}
                </div>
              </div>
            ) : modifiers.length > 0 ? (
              <div className="space-y-4">
                {Object.entries(
                  modifiers.reduce((acc, m) => {
                    const type = m.modifier_type || "Add-ons";
                    if (!acc[type]) acc[type] = [];
                    acc[type].push(m);
                    return acc;
                  }, {})
                ).map(([type, mods]) => (
                  <div key={type}>
                    <p className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400 flex items-center gap-2">
                      {type}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {mods.map((m) => (
                        <PickerButton
                          key={m.modifier_id}
                          selected={selectedModifier.some(sm => sm.modifier_id === m.modifier_id)}
                          onClick={() =>
                            setSelectedModifier((prev) => {
                               // If it's already selected, clicking again toggles it off
                               if (prev.some(sm => sm.modifier_id === m.modifier_id)) {
                                 return prev.filter(sm => sm.modifier_id !== m.modifier_id);
                               }

                               // Otherwise, we are selecting it.
                               // We want to ENFORCE 1 selection per modifier_type.
                               const currentType = m.modifier_type || "Add-ons";

                               // Remove any currently selected modifier that shares the SAME type
                               const filtered = prev.filter(sm => (sm.modifier_type || "Add-ons") !== currentType);
                               
                               return [...filtered, m];
                            })
                          }
                        >
                          {m.modifier_value || m.modifier_name}
                          {Number(m.additional_price) > 0 && (
                            <span className="ml-1 text-[11px] opacity-70">
                              +{formatCurrency(m.additional_price)}
                            </span>
                          )}
                        </PickerButton>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : null)}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 dark:border-[#1f2933] p-5">
          <div className="flex items-center justify-between gap-3">
            {effectivePrice !== null ? (
              <span className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {formatCurrency(effectivePrice)}
              </span>
            ) : (
              <span />
            )}
            <button
              type="button"
              disabled={adding}
              onClick={handleConfirm}
              className="flex items-center gap-2 rounded-xl bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-600/20 transition hover:bg-amber-700 disabled:opacity-60"
            >
              {adding ? (
                <span className="pi pi-spin pi-spinner text-sm" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
              {adding ? "Adding…" : "Add to Cart"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PortionPickerModal;
