import { useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "primereact/skeleton";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Paginator } from "primereact/paginator";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { getProductRatingSummariesBulk } from "../../services/categoryApi";
import api from "../../../api/api";

function ProductGrid({
  isLoading,
  products = [],
  onAddToCart,
  recentlyAddedProductId = null,
  addingProductId = null,
  addErrorProductId = null,
  paginator = null,
  onPageChange,
}) {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [ratingMap, setRatingMap] = useState({});
  const fetchedRatingsRef = useRef(new Set());
  const [effectivePriceMap, setEffectivePriceMap] = useState({});
  const fetchedPricingRef = useRef(new Set());
  const productIds = useMemo(
    () =>
      products
        .map((product) => product.product_id || product.id)
        .filter(Boolean),
    [products],
  );

  const extractList = (res) => {
    const data = res?.data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.data?.items)) return data.data.items;
    if (Array.isArray(data)) return data;
    return [];
  };

  const computeDiscount = (original, discounted) => {
    const o = Number(original ?? 0);
    const d = Number(discounted ?? o);
    if (!o || d >= o) return null;
    const percent = Math.round(((o - d) / o) * 100);
    return { original: o, discounted: d, percent };
  };

  const getBasePriceForProduct = (product) => {
    const original = Number(product.price ?? 0);
    const discounted = Number(product.discounted_price ?? original);
    return { original, discounted };
  };

  const resolveEffectivePricing = async (product) => {
    const productId = product.product_id || product.id;
    if (!productId) return null;

    // 1) Portion: if exactly 1, its price becomes base
    let portion = null;
    try {
      const portRes = await api.get(`/portion/getProductPortions/${productId}`);
      const portions = extractList(portRes).filter((p) => p && !p.is_deleted);
      if (portions.length === 1) {
        portion = portions[0];
      }
    } catch {
      portion = null;
    }

    const baseOriginal = portion
      ? Number(portion.price ?? 0)
      : getBasePriceForProduct(product).original;
    const baseDiscounted = portion
      ? Number(portion.discounted_price ?? baseOriginal)
      : getBasePriceForProduct(product).discounted;

    // 2) Modifier: if exactly 1, add additional_price to base
    let modifierAdd = 0;
    try {
      if (portion?.product_portion_id) {
        const comboRes = await api.get(
          `/modifiers/combinations/by-portion/${portion.product_portion_id}`,
        );
        const combos = extractList(comboRes).filter((c) => c && !c.is_deleted);
        if (combos.length === 1) {
          modifierAdd = Number(combos[0].additional_price ?? 0);
        } else {
          const modRes = await api.get(
            `/modifiers/by-portion/${portion.product_portion_id}`,
          );
          const mods = extractList(modRes).filter((m) => m && !m.is_deleted);
          if (mods.length === 1) {
            modifierAdd = Number(mods[0].additional_price ?? 0);
          }
        }
      } else {
        const comboRes = await api.get(
          `/modifiers/combinations/by-product/${productId}`,
        );
        const combos = extractList(comboRes).filter((c) => c && !c.is_deleted);
        if (combos.length === 1) {
          modifierAdd = Number(combos[0].additional_price ?? 0);
        } else {
          const modRes = await api.get(`/modifiers/by-product/${productId}`);
          const mods = extractList(modRes).filter((m) => m && !m.is_deleted);
          if (mods.length === 1) {
            modifierAdd = Number(mods[0].additional_price ?? 0);
          }
        }
      }
    } catch {
      modifierAdd = 0;
    }

    const effectiveOriginal = baseOriginal + modifierAdd;
    const effectiveDiscounted = baseDiscounted + modifierAdd;

    return {
      original: effectiveOriginal,
      discounted: effectiveDiscounted,
      discount: computeDiscount(effectiveOriginal, effectiveDiscounted),
    };
  };

  // NEW FUNCTION (added without modifying existing logic)
  const getDiscountDetails = (product) => {
    const original = Number(product.price ?? 0);
    const discounted = Number(product.discounted_price ?? original);

    if (!original || discounted >= original) return null;

    const percent = Math.round(((original - discounted) / original) * 100);

    return {
      original,
      discounted,
      percent,
    };
  };

  const getRatingDetails = (product) => {
    const id = product.product_id || product.id;
    return id ? ratingMap[id] : null;
  };

  useEffect(() => {
    if (isLoading) return;
    if (!productIds.length) return;

    let isActive = true;

    const fetchRatings = async () => {
      const pending = productIds.filter(
        (id) => id && !fetchedRatingsRef.current.has(id),
      );

      if (!pending.length) return;

      pending.forEach((id) => fetchedRatingsRef.current.add(id));

      try {
        const response = await getProductRatingSummariesBulk(pending);
        const payload = response?.data;
        const summaries = payload?.success ? payload.data : {};

        if (!isActive) return;

        setRatingMap((prev) => {
          const next = { ...prev };
          Object.keys(summaries || {}).forEach((id) => {
            next[id] = summaries[id];
          });
          return next;
        });
      } catch (error) {
        // Keep UI resilient if rating fetch fails
      }
    };

    fetchRatings();

    return () => {
      isActive = false;
    };
  }, [productIds, isLoading]);

  useEffect(() => {
    if (isLoading) return;
    if (!products.length) return;

    let active = true;

    const fetchPricing = async () => {
      const pending = products.filter((p) => {
        const id = p.product_id || p.id;
        return id && !fetchedPricingRef.current.has(id);
      });
      if (!pending.length) return;

      pending.forEach((p) => {
        const id = p.product_id || p.id;
        if (id) fetchedPricingRef.current.add(id);
      });

      const results = await Promise.allSettled(
        pending.map(async (p) => {
          const id = p.product_id || p.id;
          const pricing = await resolveEffectivePricing(p);
          return { id, pricing };
        }),
      );

      if (!active) return;

      setEffectivePriceMap((prev) => {
        const next = { ...prev };
        results.forEach((r) => {
          if (r.status !== "fulfilled") return;
          const { id, pricing } = r.value || {};
          if (!id || !pricing) return;
          next[id] = pricing;
        });
        return next;
      });
    };

    fetchPricing();

    return () => {
      active = false;
    };
  }, [products, isLoading]);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div key={index} className="space-y-3">
            <Skeleton height="150px" />
            <Skeleton height="20px" />
            <Skeleton width="60%" height="20px" />
          </div>
        ))}
      </div>
    );
  }

  if (!products.length) {
    return (
      <div
        className={`flex flex-col items-center justify-center rounded-2xl border py-16 ${darkMode ? "border-[#1f2933] bg-[#151e22]/50" : "border-[#DDD8CF]/50 bg-white/50"}`}
      >
        <div
          className={`mb-4 rounded-full p-4 ${darkMode ? "bg-[#1A9E8E]/20" : "bg-[#e6f7f5]"}`}
        >
          <svg
            className={`h-10 w-10 ${darkMode ? "text-[#26c9b4]" : "text-[#1A9E8E]"}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
            />
          </svg>
        </div>
        <h3
          className={`font-serif text-lg font-semibold ${darkMode ? "text-slate-100" : "text-gray-900"}`}
        >
          No products found
        </h3>
        <p
          className={`mt-1 max-w-sm text-center text-sm ${darkMode ? "text-slate-400" : "text-gray-500"}`}
        >
          We couldn't find any products matching your criteria. Try adjusting
          your filters or search terms.
        </p>
      </div>
    );
  }

  return (
    <div className="category-product-grid space-y-6">
      <div className="category-product-grid-list grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => {
          const rawId =
            product?.product_id ?? product?.id ?? product?.productId;
          const id = Number.parseInt(rawId, 10);
          const isRecentlyAdded = Boolean(
            recentlyAddedProductId && id === Number(recentlyAddedProductId),
          );
          const isAdding = Boolean(addingProductId && id === addingProductId);
          const isError = Boolean(
            addErrorProductId && id === addErrorProductId,
          );
          const effective = id ? effectivePriceMap[id] : null;
          const discount = effective?.discount ?? getDiscountDetails(product);

          return (
            <div
              className={`trace-card ${isRecentlyAdded ? "shopsphere-added-pop" : ""} ${
                isError ? "shopsphere-add-error" : ""
              }`}
              key={product.product_id || product.id}
            >
              <Card
                className={`category-product-card trace-card-inner product-card !h-full !rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 ${
                  darkMode
                    ? "bg-slate-800 border border-slate-700 text-slate-100"
                    : "bg-white border border-slate-200 text-gray-900"
                }`}
                onClick={() => {
                  const id = Number.parseInt(
                    product?.product_id ?? product?.id ?? product?.productId,
                    10,
                  );
                  if (!id) return;
                  navigate(`/products/${id}`);
                }}
              >
                <div className="flex h-full min-h-[320px] flex-col">
                  <div
                    className={`category-product-media product-image-wrap relative h-48 w-full overflow-hidden rounded-t-2xl ${
                      darkMode ? "bg-slate-700" : "bg-slate-100"
                    }`}
                  >
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.display_name || product.name || "Product"}
                        loading="lazy"
                        className="product-image-el h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    ) : (
                      <div
                        className={`flex h-full w-full items-center justify-center ${darkMode ? "bg-slate-700" : "bg-slate-100"}`}
                      >
                        <span
                          className={`text-xs ${darkMode ? "text-slate-500" : "text-gray-400"}`}
                        >
                          No image
                        </span>
                      </div>
                    )}
                    {discount ? (
                      <span className="absolute left-2 top-2 rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                        {discount.percent}% OFF
                      </span>
                    ) : null}
                  </div>

                  <div className="product-card-content">
                    <h4
                      className={`h-10 overflow-hidden text-sm font-semibold leading-5 ${
                        darkMode ? "text-slate-100" : "text-gray-800"
                      }`}
                    >
                      {product.display_name || product.name || "Product"}
                    </h4>
                    <p
                      className={`mt-1 line-clamp-1 text-[11px] font-medium uppercase tracking-[0.12em] ${
                        darkMode ? "text-slate-400" : "text-gray-500"
                      }`}
                    >
                      {product.seller_business_name || product.seller_name
                        ? `Sold by ${product.seller_business_name || product.seller_name}`
                        : "Sold by ShopSphere"}
                    </p>

                    {(() => {
                      const rating = getRatingDetails(product);
                      const averageRating = Number(rating?.average_rating ?? 0);
                      const totalRatings = Number(rating?.total_ratings ?? 0);
                      const filledCount = Math.round(averageRating);

                      return (
                        <div className="mt-1 flex items-center gap-1 text-xs">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <i
                              key={index}
                              className={`pi ${
                                index < filledCount ? "pi-star-fill" : "pi-star"
                              } text-yellow-400`}
                            />
                          ))}
                          <span
                            className={`ml-1 ${
                              darkMode ? "text-slate-400" : "text-gray-500"
                            }`}
                          >
                            ({totalRatings})
                          </span>
                        </div>
                      );
                    })()}

                    {/* UPDATED PRICE SECTION (old logic preserved) */}
                    <div className="mt-1 min-h-[32px]">
                      {(() => {
                        const effectiveOriginal = Number(
                          effective?.original ?? product.price ?? 0,
                        );
                        const effectiveDiscounted = Number(
                          effective?.discounted ??
                            product.discounted_price ??
                            effectiveOriginal,
                        );

                        if (!discount) {
                          return (
                            <p className="font-bold text-[#1A9E8E]">
                              {"\u20B9"}
                              {effectiveDiscounted.toLocaleString("en-IN")}
                            </p>
                          );
                        }

                        return (
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-[#1A9E8E]">
                              {"\u20B9"}
                              {effectiveDiscounted.toLocaleString("en-IN")}
                            </p>

                            <p
                              className={`text-xs line-through ${
                                darkMode ? "text-slate-400" : "text-gray-400"
                              }`}
                            >
                              {"\u20B9"}
                              {effectiveOriginal.toLocaleString("en-IN")}
                            </p>

                            <span className="text-xs font-semibold text-[#1A9E8E]">
                              {discount.percent}% OFF
                            </span>
                          </div>
                        );
                      })()}
                    </div>

                    <div className="mt-auto pt-2">
                      <button
                        type="button"
                        className="cart-button w-full"
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          const btn = e.currentTarget;
                          if (btn?.classList.contains("is-locked")) {
                            return;
                          }
                          if (btn) {
                            btn.classList.remove("clicked");
                            btn.classList.remove("pulse-success");
                            btn.classList.add("is-locked");
                            void btn.offsetWidth;
                            btn.classList.add("clicked");
                            setTimeout(() => {
                              btn.classList.remove("clicked");
                              btn.classList.add("pulse-success");
                              setTimeout(() => {
                                btn.classList.remove("pulse-success");
                                btn.classList.remove("is-locked");
                              }, 420);
                            }, 1500);
                          }
                          const id = product.product_id || product.id;
                          if (!id) return;
                          if (onAddToCart) {
                            try {
                              window.dispatchEvent(
                                new CustomEvent("shopsphere:addToCartClick", {
                                  detail: {
                                    target: e.currentTarget,
                                  },
                                }),
                              );
                            } catch {
                              // ignore
                            }
                            onAddToCart(product);
                          } else {
                            navigate(`/items/${id}`);
                          }
                        }}
                      >
                        <span className="add-to-cart">Add to Cart</span>
                        <span className="added">Added</span>
                        <i className="pi pi-shopping-cart" />
                        <i className="pi pi-box" />
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          );
        })}
      </div>

      {paginator?.enabled ? (
        <>
          <Paginator
            first={paginator.first}
            rows={paginator.rows}
            totalRecords={paginator.totalRecords}
            rowsPerPageOptions={paginator.rowsPerPageOptions || [5, 10, 25, 50]}
            onPageChange={onPageChange}
            template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
            className={`customer-product-paginator ${
              darkMode ? "customer-product-paginator-dark" : ""
            }`}
            pt={{
              pageButton: ({ context }) => ({
                className: context.active
                  ? "customer-page-btn-active"
                  : "customer-page-btn",
              }),
            }}
          />

          <style>{`
            .customer-product-paginator .p-paginator-page.customer-page-btn {
              color: inherit;
            }
            .customer-product-paginator .p-paginator-page.customer-page-btn-active {
              background: var(--primary-color) !important;
              border-color: var(--primary-color) !important;
              color: #fff !important;
            }
            .customer-product-paginator.customer-product-paginator-dark {
              background: #151e22;
              border: 1px solid #1f2933;
              color: #e2e8f0;
            }
            .customer-product-paginator.customer-product-paginator-dark .p-paginator-page.customer-page-btn {
              color: #e2e8f0;
            }
            .customer-product-paginator.customer-product-paginator-dark .p-paginator-first,
            .customer-product-paginator.customer-product-paginator-dark .p-paginator-prev,
            .customer-product-paginator.customer-product-paginator-dark .p-paginator-next,
            .customer-product-paginator.customer-product-paginator-dark .p-paginator-last,
            .customer-product-paginator.customer-product-paginator-dark .p-paginator-rpp-options {
              color: #e2e8f0;
            }
            .customer-product-paginator.customer-product-paginator-dark .p-dropdown {
              background: #0f161a;
              border: 1px solid #223038;
              color: #e2e8f0;
            }
            .customer-product-paginator.customer-product-paginator-dark .p-dropdown .p-dropdown-label {
              color: #e2e8f0;
            }
            .customer-product-paginator.customer-product-paginator-dark .p-dropdown .p-dropdown-trigger {
              color: #e2e8f0;
            }
          `}</style>
        </>
      ) : null}
    </div>
  );
}

export default ProductGrid;
