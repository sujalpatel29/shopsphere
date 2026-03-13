import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Heart,
  Minus,
  Plus,
  Share2,
  Star,
} from "lucide-react";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Dialog } from "primereact/dialog";
import { Skeleton } from "primereact/skeleton";
import { Toast } from "primereact/toast";
import { useSelector, useDispatch } from "react-redux";
import { incrementCart } from "../../redux/slices/cartSlice";
import { useTheme } from "../../context/ThemeContext";
import {
  addCartItem,
  getCart,
  getCategories,
  getModifiersByPortion,
  getModifiersByProduct,
  getProductById,
  getProductImages,
  getProductPortions,
  getRelatedProducts,
  getReviews,
  getReviewSummary,
  getVisibleProductOffers,
  toggleReviewHelpful,
} from "../../../api/productDetailsApi";

const formatINR = (value) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(
    Number(value || 0)
  );

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getEffectivePrice = (entity) => {
  if (!entity) return 0;
  const discounted = Number(entity.discounted_price);
  const regular = Number(entity.price);
  if (discounted > 0 && discounted < regular) return discounted;
  return regular;
};  

const getSavingsPct = (regular, discounted) => {
  if (!regular || !discounted || discounted >= regular) return 0;
  return Math.round(((regular - discounted) / regular) * 100);
};

const getStockLabel = (stock) => {
  if (stock <= 0) return { label: "Out of Stock", className: "bg-red-100 text-red-700" };
  if (stock <= 5) return { label: "Low Stock", className: "bg-amber-100 text-amber-700" };
  return { label: "In Stock", className: "bg-emerald-100 text-emerald-700" };
};

const metaUpsert = (selector, attributes) => {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement("meta");
    document.head.appendChild(node);
  }
  Object.entries(attributes).forEach(([key, value]) => {
    node.setAttribute(key, value);
  });
};

const renderCompactStars = (ratingValue) => {
  const normalized = Number(ratingValue || 0);
  return Array.from({ length: 5 }).map((_, idx) => (
    <Star
      key={idx}
      className={`h-3.5 w-3.5 ${idx < Math.round(normalized) ? "fill-current" : ""}`}
    />
  ));
};

const formatOfferDate = (value) => {
  if (!value) return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return String(value);
  return parsed.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const formatOfferTime = (value) => {
  if (!value) return "All day";
  const [hours = "0", minutes = "0"] = String(value).split(":");
  const parsed = new Date();
  parsed.setHours(Number(hours), Number(minutes), 0, 0);
  return parsed.toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  });
};

function ProductDetailsPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.auth);
  const toastRef = useRef(null);
  const ctaAnchorRef = useRef(null);
  const bottomSentinelRef = useRef(null);
  const recentlyViewedRef = useRef(null);
  const relatedProductsRef = useRef(null);
  const touchStartXRef = useRef(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [categories, setCategories] = useState([]);
  const [offers, setOffers] = useState([]);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const [portions, setPortions] = useState([]);
  const [selectedPortionId, setSelectedPortionId] = useState(null);
  const [modifierGroups, setModifierGroups] = useState([]);
  const [selectedModifiers, setSelectedModifiers] = useState({});
  const [summary, setSummary] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [reviewPage, setReviewPage] = useState(1);
  const [reviewTotalPages, setReviewTotalPages] = useState(1);
  const [reviewLoadingMore, setReviewLoadingMore] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [tapZoom, setTapZoom] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [addLoading, setAddLoading] = useState(false);
  const [buyLoading, setBuyLoading] = useState(false);
  const [wishlistSaved, setWishlistSaved] = useState(false);
  const [quantityInCart, setQuantityInCart] = useState(0);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [isBottomVisible, setIsBottomVisible] = useState(false);

  const showToast = useCallback((severity, summaryText, detail) => {
    toastRef.current?.show({ severity, summary: summaryText, detail, life: 3000 });
  }, []);

  const userScopedWishlistKey = useMemo(
    () => `shopsphere_wishlist_${currentUser?.user_id || "guest"}`,
    [currentUser?.user_id]
  );

  const selectedPortion = useMemo(
    () =>
      portions.find((portion) => Number(portion.product_portion_id) === Number(selectedPortionId)) ||
      null,
    [portions, selectedPortionId]
  );

  const selectedModifierItems = useMemo(
    () => Object.values(selectedModifiers).filter(Boolean),
    [selectedModifiers]
  );

  const modifierExtraPrice = useMemo(
    () =>
      selectedModifierItems.reduce(
        (sum, item) => sum + Number(item.additional_price || 0),
        0
      ),
    [selectedModifierItems]
  );

  const baseRegularPrice = selectedPortion
    ? Number(selectedPortion.price || 0)
    : Number(product?.price || 0);
  const baseDiscountedPrice = selectedPortion
    ? Number(selectedPortion.discounted_price || 0)
    : Number(product?.discounted_price || 0);
  const effectiveRegularPrice = baseRegularPrice + modifierExtraPrice;
  const effectivePrice = (baseDiscountedPrice > 0 && baseDiscountedPrice < baseRegularPrice
    ? baseDiscountedPrice
    : baseRegularPrice) + modifierExtraPrice;
  const savingsPct = getSavingsPct(effectiveRegularPrice, effectivePrice);
  const effectiveStock = selectedPortion
    ? Number(selectedPortion.stock || 0)
    : Number(product?.stock || 0);
  const stockMeta = getStockLabel(effectiveStock);
  const outOfStock = effectiveStock <= 0 || !product?.is_active;

  const breadcrumbTrail = useMemo(() => {
    if (!product?.category_id || categories.length === 0) return [];
    const byId = new Map(categories.map((item) => [Number(item.category_id), item]));
    const trail = [];
    let pointer = byId.get(Number(product.category_id));
    while (pointer) {
      trail.push(pointer);
      pointer = pointer.parent_id ? byId.get(Number(pointer.parent_id)) : null;
    }
    return trail.reverse();
  }, [categories, product?.category_id]);

  const activeImage = images[activeImageIndex] || images[0] || null;

  const requiredModifierMissing = useMemo(
    () =>
      modifierGroups.some((group) => group.required && !selectedModifiers[group.groupKey]),
    [modifierGroups, selectedModifiers]
  );

  const loadReviews = useCallback(
    async (page, append = false) => {
      const data = await getReviews(productId, { page, limit: 5, sort: "newest" });
      setReviews((prev) => (append ? [...prev, ...(data.items || [])] : data.items || []));
      setReviewPage(Number(data.page || page));
      setReviewTotalPages(Number(data.total_pages || 1));
    },
    [productId]
  );

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [
        productData,
        imageData,
        portionsData,
        reviewSummaryData,
        offerData,
        categoriesData,
        cartData,
      ] = await Promise.all([
        getProductById(productId),
        getProductImages(productId).catch(() => []),
        getProductPortions(productId).catch(() => []),
        getReviewSummary(productId).catch(() => null),
        getVisibleProductOffers(productId).catch(() => []),
        getCategories().catch(() => []),
        getCart().catch(() => null),
      ]);

      if (!productData) {
        setError("Product not found.");
        return;
      }

      setProduct(productData);
      setImages(imageData?.length ? imageData : []);
      const activePortions = (portionsData || []).filter((item) => Number(item.is_active) === 1);
      setPortions(activePortions);
      const defaultPortion =
        activePortions.find((item) => Number(item.is_default) === 1) || activePortions[0] || null;
      setSelectedPortionId(defaultPortion?.product_portion_id || null);
      setSummary(reviewSummaryData);
      setOffers(offerData || []);
      setCategories(categoriesData || []);

      const cartItems = cartData?.items || [];
      const inCartCount = cartItems
        .filter((item) => Number(item.productId) === Number(productData.product_id))
        .reduce((sum, item) => sum + Number(item.quantity || 0), 0);
      setQuantityInCart(inCartCount);

      const wishlistRaw = localStorage.getItem(userScopedWishlistKey);
      const wishlistIds = wishlistRaw ? JSON.parse(wishlistRaw) : [];
      setWishlistSaved(wishlistIds.includes(Number(productData.product_id)));

      await loadReviews(1, false);

      const recentlyRaw = localStorage.getItem("shopsphere_recently_viewed");
      const recentlyList = recentlyRaw ? JSON.parse(recentlyRaw) : [];
      const currentEntry = {
        product_id: productData.product_id,
        display_name: productData.display_name || productData.name,
        price: Number(productData.price || 0),
        discounted_price: Number(productData.discounted_price || 0),
        average_rating: Number(reviewSummaryData?.average_rating || 0),
        image_url: imageData?.[0]?.image_url || "",
      };

      const nextViewed = [
        currentEntry,
        ...recentlyList.filter((item) => Number(item.product_id) !== Number(productData.product_id)),
      ].slice(0, 10);

      localStorage.setItem("shopsphere_recently_viewed", JSON.stringify(nextViewed));
      setRecentlyViewed(nextViewed.filter((item) => Number(item.product_id) !== Number(productData.product_id)).slice(0, 8));

      if (productData.category_id) {
        const related = await getRelatedProducts({
          categoryId: productData.category_id,
          excludeId: productData.product_id,
          limit: 12,
        }).catch(() => []);
        setRelatedProducts(related || []);
      } else {
        setRelatedProducts([]);
      }
    } catch (loadError) {
      setError(loadError?.response?.data?.message || "Failed to load product details.");
    } finally {
      setLoading(false);
    }
  }, [loadReviews, productId, userScopedWishlistKey]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    if (!product) return;
    document.title = `${product.display_name || product.name} | ShopSphere`;
    metaUpsert('meta[name="description"]', {
      name: "description",
      content: product.short_description || product.description || "Shop product details on ShopSphere.",
    });
    if (images[0]?.image_url) {
      metaUpsert('meta[property="og:image"]', {
        property: "og:image",
        content: images[0].image_url,
      });
    }
  }, [product, images]);

  useEffect(() => {
    if (!selectedPortion && !product) return;
    const loadModifiers = async () => {
      try {
        const rawModifiers = selectedPortion
          ? await getModifiersByPortion(selectedPortion.product_portion_id)
          : await getModifiersByProduct(product.product_id);

        const groupsMap = new Map();
        (rawModifiers || []).forEach((item) => {
          const groupKey = item.modifier_name || "Options";
          if (!groupsMap.has(groupKey)) {
            groupsMap.set(groupKey, {
              groupKey,
              label: item.modifier_name || "Options",
              required: Boolean(item.is_required || item.required),
              items: [],
            });
          }
          groupsMap.get(groupKey).items.push(item);
        });

        const groups = Array.from(groupsMap.values()).map((group) => ({
          ...group,
          items: group.items.filter((item) => Number(item.is_active ?? 1) === 1),
        }));

        setModifierGroups(groups.filter((group) => group.items.length > 0));
        setSelectedModifiers({});
      } catch {
        setModifierGroups([]);
        setSelectedModifiers({});
      }
    };

    loadModifiers();
  }, [selectedPortion, product]);

  useEffect(() => {
    const anchor = ctaAnchorRef.current;
    if (!anchor) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowStickyBar(!entry.isIntersecting);
      },
      { threshold: 0.2 }
    );
    observer.observe(anchor);
    return () => observer.disconnect();
  }, [loading]);

  useEffect(() => {
    const sentinel = bottomSentinelRef.current;
    if (!sentinel) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsBottomVisible(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [loading]);

  const handleToggleWishlist = () => {
    const raw = localStorage.getItem(userScopedWishlistKey);
    const ids = raw ? JSON.parse(raw) : [];
    const id = Number(product.product_id);
    const next = wishlistSaved ? ids.filter((x) => Number(x) !== id) : [...new Set([...ids, id])];
    localStorage.setItem(userScopedWishlistKey, JSON.stringify(next));
    setWishlistSaved(!wishlistSaved);
  };

  const validateSelection = () => {
    if (requiredModifierMissing) {
      showToast("warn", "Required Selection", "Please select all required modifiers.");
      return false;
    }
    if (outOfStock) {
      showToast("warn", "Out of Stock", "This product is currently unavailable.");
      return false;
    }
    return true;
  };

  const performAddToCart = async () => {
    if (!currentUser) {
      showToast("warn", "Login Required", "Please log in to continue.");
      navigate("/login");
      return false;
    }
    if (!validateSelection()) return false;
    
    // Get all selected modifier portion IDs
    const modifierPortionIds = selectedModifierItems
      .map(m => Number(m.modifier_portion_id))
      .filter(Boolean);
    
    await addCartItem({
      productId: Number(product.product_id),
      quantity,
      portionId: selectedPortion ? Number(selectedPortion.product_portion_id) : undefined,
      modifierIds: modifierPortionIds.length > 0 ? modifierPortionIds : undefined,
    });
    setQuantityInCart((prev) => prev + quantity);
    dispatch(incrementCart()); // Update cart badge count
    showToast("success", "Added to Cart", "Product added successfully.");
    return true;
  };

  const handleAddToCart = async () => {
    setAddLoading(true);
    try {
      await performAddToCart();
    } catch (addError) {
      showToast("error", "Add to Cart Failed", addError?.response?.data?.message || "Try again.");
    } finally {
      setAddLoading(false);
    }
  };

  const handleBuyNow = async () => {
    setBuyLoading(true);
    try {
      const added = await performAddToCart();
      if (added) navigate("/checkout");
    } catch (buyError) {
      showToast("error", "Buy Now Failed", buyError?.response?.data?.message || "Try again.");
    } finally {
      setBuyLoading(false);
    }
  };

  const handleShare = async () => {
    const title = product.display_name || product.name;
    const url = window.location.href;
    try {
      showToast("info", "Link Copied", "Product link copied to clipboard.");
      if (navigator.share) {
        await navigator.share({ title, text: product.short_description || title, url });
      } else if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        showToast("info", "Link Copied", "Product link copied to clipboard.");
      }
    } catch {
      showToast("warn", "Share Cancelled", "Share action was not completed.");
    }
  };

  const handleHelpful = async (reviewId) => {
    if (!currentUser) {
      showToast("warn", "Login Required", "Please log in to vote reviews.");
      navigate("/login");
      return;
    }
    setReviews((prev) =>
      prev.map((item) =>
        item.review_id === reviewId
          ? {
              ...item,
              is_liked_by_me: !item.is_liked_by_me,
              helpful_count: clamp(
                Number(item.helpful_count || 0) + (item.is_liked_by_me ? -1 : 1),
                0,
                999999
              ),
            }
          : item
      )
    );
    try {
      const data = await toggleReviewHelpful(reviewId);
      setReviews((prev) =>
        prev.map((item) =>
          item.review_id === reviewId
            ? { ...item, helpful_count: Number(data?.helpful_count || item.helpful_count) }
            : item
        )
      );
    } catch {
      setReviews((prev) =>
        prev.map((item) =>
          item.review_id === reviewId
            ? {
                ...item,
                is_liked_by_me: !item.is_liked_by_me,
                helpful_count: clamp(
                  Number(item.helpful_count || 0) + (item.is_liked_by_me ? -1 : 1),
                  0,
                  999999
                ),
              }
            : item
        )
      );
      showToast("error", "Action Failed", "Could not update helpful vote.");
    }
  };

  const handleLoadMoreReviews = async () => {
    if (reviewPage >= reviewTotalPages) return;
    setReviewLoadingMore(true);
    try {
      await loadReviews(reviewPage + 1, true);
    } finally {
      setReviewLoadingMore(false);
    }
  };

  const goToImage = (nextIndex) => {
    const total = images.length;
    if (!total) return;
    const normalized = ((nextIndex % total) + total) % total;
    setActiveImageIndex(normalized);
    setTapZoom(false);
  };

  const scrollRailByCard = (railRef, direction) => {
    const rail = railRef.current;
    if (!rail) return;
    const card = rail.firstElementChild;
    const cardWidth = card ? card.getBoundingClientRect().width : 240;
    rail.scrollBy({
      left: direction * (cardWidth + 12) * 2,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <Skeleton width="16rem" height="1rem" />
        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <Card className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-[#1f2933] dark:bg-[#151e22]">
            <Skeleton width="100%" height="27rem" className="rounded-xl" />
            <div className="mt-3 flex gap-2">
              {Array.from({ length: 5 }).map((_, idx) => (
                <Skeleton key={idx} width="4.5rem" height="4.5rem" className="rounded-lg" />
              ))}
            </div>
          </Card>
          <Card className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-[#1f2933] dark:bg-[#151e22]">
            <Skeleton width="70%" height="2rem" />
            <Skeleton width="40%" height="1rem" className="mt-3" />
            <Skeleton width="35%" height="2rem" className="mt-4" />
            <Skeleton width="100%" height="8rem" className="mt-4 rounded-xl" />
            <Skeleton width="100%" height="3rem" className="mt-4 rounded-xl" />
          </Card>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <Card className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-8 dark:border-red-700/40 dark:bg-[#151e22]">
        <h1 className="font-serif text-2xl text-gray-900 dark:text-slate-100">Could not load product</h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">{error || "Unknown error"}</p>
        <Button
          type="button"
          label="Retry"
          onClick={loadAll}
          className="mt-5 !rounded-xl !bg-amber-600 !px-5 !py-3 !text-white hover:!bg-amber-700"
        />
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <Toast ref={toastRef} position="top-right" />
      <Dialog
        visible={Boolean(selectedOffer)}
        onHide={() => setSelectedOffer(null)}
        header={selectedOffer?.offer_name || "Offer Details"}
        draggable={false}
        resizable={false}
        dismissableMask
        className="w-[92vw] max-w-2xl"
        contentClassName={darkMode ? "bg-[#151e22] text-slate-100" : "bg-[#fff8ee] text-gray-900"}
      >
        {selectedOffer && (
          <div className="space-y-4">
            <div className="rounded-xl border border-amber-200/60 bg-amber-50/70 p-4 dark:border-amber-600/30 dark:bg-amber-500/5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400">Offer Code</p>
                  <p className="mt-1 font-accent text-2xl font-semibold text-amber-700">
                    {selectedOffer.offer_name}
                  </p>
                </div>
                <Button
                  type="button"
                  label="Copy Code"
                  className="!rounded-xl !bg-amber-600 !px-4 !py-2 !text-xs !font-semibold !text-white hover:!bg-amber-700"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(selectedOffer.offer_name || "");
                      showToast("success", "Copied", "Offer code copied to clipboard.");
                    } catch {
                      showToast("error", "Copy Failed", "Could not copy offer code.");
                    }
                  }}
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-gray-200 p-4 dark:border-[#1f2933]">
                <p className="text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400">Discount</p>
                <p className="mt-1 text-sm font-medium">
                  {selectedOffer.discount_type === "percentage"
                    ? `${selectedOffer.discount_value}% off`
                    : `${formatINR(selectedOffer.discount_value)} off`}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 dark:border-[#1f2933]">
                <p className="text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400">Offer Type</p>
                <p className="mt-1 text-sm font-medium">{selectedOffer.offer_type || "General"}</p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 dark:border-[#1f2933]">
                <p className="text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400">Valid Dates</p>
                <p className="mt-1 text-sm font-medium">
                  {formatOfferDate(selectedOffer.start_date)} to {formatOfferDate(selectedOffer.end_date)}
                </p>
              </div>
              <div className="rounded-xl border border-gray-200 p-4 dark:border-[#1f2933]">
                <p className="text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400">Valid Time</p>
                <p className="mt-1 text-sm font-medium">
                  {selectedOffer.start_time || selectedOffer.end_time
                    ? `${formatOfferTime(selectedOffer.start_time)} to ${formatOfferTime(selectedOffer.end_time)}`
                    : "All day"}
                </p>
              </div>
            </div>

            {selectedOffer.description && (
              <div className="rounded-xl border border-gray-200 p-4 dark:border-[#1f2933]">
                <p className="text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400">Details</p>
                <p className="mt-2 text-sm text-gray-700 dark:text-slate-300">
                  {selectedOffer.description}
                </p>
              </div>
            )}

            {(selectedOffer.min_purchase_amount || selectedOffer.maximum_discount_amount) && (
              <div className="rounded-xl border border-gray-200 p-4 dark:border-[#1f2933]">
                <p className="text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400">Conditions</p>
                <div className="mt-2 space-y-1 text-sm text-gray-700 dark:text-slate-300">
                  {selectedOffer.min_purchase_amount ? (
                    <p>Minimum purchase: {formatINR(selectedOffer.min_purchase_amount)}</p>
                  ) : null}
                  {selectedOffer.maximum_discount_amount ? (
                    <p>Maximum discount: {formatINR(selectedOffer.maximum_discount_amount)}</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}
      </Dialog>

      <nav aria-label="Breadcrumb" className="text-sm">
        <ol className="flex flex-wrap items-center gap-2 text-gray-500 dark:text-slate-400">
          <li><Link to="/" className="hover:text-amber-600">Home</Link></li>
          {breadcrumbTrail.map((item) => (
            <li key={item.category_id} className="flex items-center gap-2">
              <span>/</span>
              <span>{item.category_name}</span>
            </li>
          ))}
          <li className="flex items-center gap-2 text-gray-900 dark:text-slate-100">
            <span>/</span>
            <span>{product.display_name || product.name}</span>
          </li>
        </ol>
      </nav>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] items-stretch">
        <Card className="rounded-2xl border border-gray-100 bg-white p-4 dark:border-[#1f2933] dark:bg-[#151e22] flex flex-col">
          <div
            className="relative overflow-hidden rounded-xl border border-gray-100 bg-gray-50 dark:border-[#1f2933] dark:bg-[#10171b]"
            onTouchStart={(event) => {
              touchStartXRef.current = event.changedTouches[0]?.clientX || 0;
            }}
            onTouchEnd={(event) => {
              const endX = event.changedTouches[0]?.clientX || 0;
              if (Math.abs(endX - touchStartXRef.current) < 40) return;
              goToImage(activeImageIndex + (endX < touchStartXRef.current ? 1 : -1));
            }}
          >
            {activeImage?.image_url ? (
              <button
                type="button"
                onClick={() => setTapZoom((prev) => !prev)}
                className="group h-[280px] w-full overflow-hidden md:h-[320px]"
                aria-label="Toggle image zoom"
              >
                <img
                  src={activeImage.image_url}
                  alt={product.display_name || product.name}
                  className={`h-full w-full object-contain transition-transform duration-300 ${
                    tapZoom ? "scale-150" : "scale-100 group-hover:scale-125"
                  }`}
                />
              </button>
            ) : (
              <div className="flex h-[280px] items-center justify-center text-gray-500 dark:text-slate-400">
                No image available
              </div>
            )}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => goToImage(activeImageIndex - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-700 shadow"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => goToImage(activeImageIndex + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 text-gray-700 shadow"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>
          <div className="mt-3 w-full">
            <div className="flex flex-wrap gap-2">
              {(images.length ? images : [{ image_url: "" }]).map((item, index) => (
                <button
                  key={item.image_id || `img-${index}`}
                  type="button"
                  onClick={() => goToImage(index)}
                  className={`h-12 w-12 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                    index === activeImageIndex
                      ? "border-amber-500 ring-2 ring-amber-200"
                      : "border-gray-200 dark:border-[#1f2933] hover:border-gray-400"
                  }`}
                  aria-label={`View image ${index + 1}`}
                >
                  {item.image_url ? (
                    <img src={item.image_url} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full bg-gray-100 dark:bg-[#10171b]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </Card>

        <Card className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-[#1f2933] dark:bg-[#151e22] flex flex-col">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="font-serif text-3xl text-gray-900 dark:text-slate-100">
                {product.display_name || product.name}
              </h1>
              <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
                {product.short_description || product.description}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className={`h-4 w-4 ${
                        idx < Math.round(summary?.average_rating || 0)
                          ? "fill-current"
                          : ""
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-slate-300">
                  {(summary?.average_rating || 0).toFixed(1)} ({summary?.total_reviews || 0} reviews)
                </span>
              </div>
            </div>
            <div className={`rounded-full px-3 py-1 text-xs font-semibold ${stockMeta.className}`}>
              {stockMeta.label}
            </div>
          </div>

          <div className="mt-5 rounded-xl border border-amber-200/60 bg-amber-50/50 p-4 dark:border-amber-600/30 dark:bg-amber-500/5">
            <div className="flex flex-wrap items-end gap-3">
              <span className="font-accent text-3xl font-semibold text-gray-900 dark:text-slate-100">
                {formatINR(effectivePrice)}
              </span>
              {effectivePrice < effectiveRegularPrice && (
                <>
                  <span className="text-sm text-gray-500 line-through">{formatINR(effectiveRegularPrice)}</span>
                  <span className="rounded-md bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
                    Save {savingsPct}%
                  </span>
                </>
              )}
            </div>
          </div>

          {offers.length > 0 && (
            <div className="mt-5 rounded-xl border border-gray-200 p-4 dark:border-[#1f2933]">
              <h2 className="font-accent text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400">
                Offers
              </h2>
              <div className="mt-3 space-y-2">
                {offers.slice(0, 4).map((offer) => (
                  <button
                    key={offer.offer_id}
                    type="button"
                    onClick={() => setSelectedOffer(offer)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-3 text-left transition hover:border-amber-300 hover:bg-amber-50 dark:border-[#1f2933] dark:bg-[#10171b] dark:hover:border-amber-500/40 dark:hover:bg-amber-500/5"
                  >
                    <p className="text-sm text-gray-700 dark:text-slate-300">
                      Use code <span className="font-semibold text-amber-700">{offer.offer_name}</span> for{" "}
                      {offer.discount_type === "percentage"
                        ? `${offer.discount_value}% off`
                        : `${formatINR(offer.discount_value)} off`}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                      Tap to view offer details
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {portions.length > 0 && (
            <div className="mt-5">
              <h2 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400">
                Portion / Variant
              </h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {portions.map((portion) => {
                  const isSelected =
                    Number(portion.product_portion_id) === Number(selectedPortionId);
                  return (
                    <button
                      key={portion.product_portion_id}
                      type="button"
                      onClick={() => setSelectedPortionId(portion.product_portion_id)}
                      className={`rounded-lg border px-3 py-2 text-sm ${
                        isSelected
                          ? "border-amber-500 bg-amber-50 text-amber-800"
                          : "border-gray-200 text-gray-700 dark:border-[#1f2933] dark:text-slate-300"
                      }`}
                      aria-pressed={isSelected}
                    >
                      {portion.portion_value} {formatINR(getEffectivePrice(portion))}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {modifierGroups.length > 0 && (
            <div className="mt-5 space-y-4">
              {modifierGroups.map((group) => (
                <div key={group.groupKey}>
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-slate-100">
                    {group.label}{" "}
                    <span className="text-xs text-gray-500">
                      ({group.required ? "Required" : "Optional"})
                    </span>
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {group.items.map((item) => {
                      const selected =
                        Number(selectedModifiers[group.groupKey]?.modifier_portion_id) ===
                        Number(item.modifier_portion_id);
                      return (
                        <button
                          key={item.modifier_portion_id}
                          type="button"
                          onClick={() =>
                            setSelectedModifiers((prev) => ({
                              ...prev,
                              [group.groupKey]: selected ? null : item,
                            }))
                          }
                          className={`rounded-lg border px-3 py-2 text-sm ${
                            selected
                              ? "border-amber-500 bg-amber-50 text-amber-800"
                              : "border-gray-200 text-gray-700 dark:border-[#1f2933] dark:text-slate-300"
                          }`}
                          aria-pressed={selected}
                        >
                          {item.modifier_value}
                          {Number(item.additional_price || 0) > 0
                            ? ` (+${formatINR(item.additional_price)})`
                            : ""}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div ref={ctaAnchorRef} className="mt-6 rounded-xl border border-gray-200 p-4 dark:border-[#1f2933]">
            {quantityInCart > 0 && (
              <p className="mb-2 text-xs font-medium text-emerald-700">
                {quantityInCart} already in cart
              </p>
            )}
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center rounded-lg border border-gray-200 dark:border-[#1f2933]">
                <button
                  type="button"
                  className="px-3 py-2 text-gray-700 dark:text-slate-300"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  aria-label="Decrease quantity"
                >
                  <Minus className="h-4 w-4" />
                </button>
                <span className="min-w-10 px-2 text-center text-sm">{quantity}</span>
                <button
                  type="button"
                  className="px-3 py-2 text-gray-700 dark:text-slate-300"
                  onClick={() => setQuantity((prev) => Math.min(99, prev + 1))}
                  aria-label="Increase quantity"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <Button
                type="button"
                onClick={handleAddToCart}
                disabled={outOfStock || addLoading}
                label={addLoading ? "Adding..." : "Add to Cart"}
                className="!rounded-xl !bg-amber-600 !px-5 !py-3 !text-white hover:!bg-amber-700"
              />
              <Button
                type="button"
                onClick={handleBuyNow}
                disabled={outOfStock || buyLoading}
                label={buyLoading ? "Processing..." : "Buy Now"}
                className="!rounded-xl !bg-[#163332] !px-5 !py-3 !text-white hover:!bg-[#102a29]"
              />
              <button
                type="button"
                onClick={handleToggleWishlist}
                className={`rounded-xl border px-4 py-3 text-sm ${
                  wishlistSaved
                    ? "border-red-300 bg-red-50 text-red-700"
                    : "border-gray-200 text-gray-700 dark:border-[#1f2933] dark:text-slate-300"
                }`}
                aria-label={wishlistSaved ? "Remove from wishlist" : "Save to wishlist"}
              >
                <Heart className={`mr-1 inline h-4 w-4 ${wishlistSaved ? "fill-current" : ""}`} />
                {wishlistSaved ? "Saved" : "Save"}
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-700 dark:border-[#1f2933] dark:text-slate-300"
                aria-label="Share product"
              >
                <Share2 className="mr-1 inline h-4 w-4" />
                Share
              </button>
            </div>
          </div>
        </Card>
      </div>

      <Card className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-[#1f2933] dark:bg-[#151e22]">
        <h2 className="font-serif text-2xl text-gray-900 dark:text-slate-100">Ratings & Reviews</h2>
        {reviews.length === 0 ? (
          <p className="mt-3 text-sm text-gray-600 dark:text-slate-300">No reviews yet.</p>
        ) : (
          <div className="mt-4 space-y-4">
            {reviews.map((review) => (
              <article
                key={review.review_id}
                className="rounded-xl border border-gray-200 p-4 dark:border-[#1f2933]"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-slate-100">{review.reviewer_name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(review.created_at).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <Star key={idx} className={`h-4 w-4 ${idx < Number(review.rating) ? "fill-current" : ""}`} />
                    ))}
                  </div>
                </div>
                {review.title && (
                  <p className="mt-2 text-sm font-semibold text-gray-900 dark:text-slate-100">{review.title}</p>
                )}
                <p className="mt-1 text-sm text-gray-700 dark:text-slate-300">{review.review_text}</p>
                <button
                  type="button"
                  onClick={() => handleHelpful(review.review_id)}
                  className={`mt-3 rounded-lg border px-3 py-1.5 text-xs ${
                    review.is_liked_by_me
                      ? "border-amber-300 bg-amber-50 text-amber-700"
                      : "border-gray-200 text-gray-600 dark:border-[#1f2933] dark:text-slate-300"
                  }`}
                  aria-pressed={Boolean(review.is_liked_by_me)}
                >
                  Helpful ({review.helpful_count || 0})
                </button>
              </article>
            ))}
            {reviewPage < reviewTotalPages && (
              <Button
                type="button"
                onClick={handleLoadMoreReviews}
                disabled={reviewLoadingMore}
                label={reviewLoadingMore ? "Loading..." : "Load More Reviews"}
                className="!rounded-xl !border !border-gray-200 !bg-transparent !text-gray-700 dark:!border-[#1f2933] dark:!text-slate-300"
              />
            )}
          </div>
        )}
      </Card>

      {recentlyViewed.length > 0 && (
        <Card className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-[#1f2933] dark:bg-[#151e22]">
          <h2 className="font-serif text-2xl text-gray-900 dark:text-slate-100">Recently Viewed</h2>
          <div className="relative mt-4">
            <button
              type="button"
              onClick={() => scrollRailByCard(recentlyViewedRef, -1)}
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white/95 p-2 text-gray-700 shadow-sm transition hover:border-amber-300 hover:text-amber-700 dark:border-[#1f2933] dark:bg-[#151e22]/95 dark:text-slate-300"
              aria-label="Scroll recently viewed left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollRailByCard(recentlyViewedRef, 1)}
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white/95 p-2 text-gray-700 shadow-sm transition hover:border-amber-300 hover:text-amber-700 dark:border-[#1f2933] dark:bg-[#151e22]/95 dark:text-slate-300"
              aria-label="Scroll recently viewed right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div
              ref={recentlyViewedRef}
              className="flex gap-3 overflow-x-auto px-10 pb-2 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {recentlyViewed.map((item) => (
                (() => {
                  const regularPrice = Number(item.price || 0);
                  const discountedPrice = Number(item.discounted_price || regularPrice);
                  const effectiveCardPrice =
                    discountedPrice > 0 && discountedPrice < regularPrice
                      ? discountedPrice
                      : regularPrice;
                  const cardSavingsPct = getSavingsPct(regularPrice, effectiveCardPrice);
                  const cardRating = Number(item.average_rating || item.rating || 0);

                  return (
                    <Link
                      key={`recent-${item.product_id}`}
                      to={`/products/${item.product_id}`}
                      className="w-56 shrink-0 rounded-xl border border-gray-200 p-3 dark:border-[#1f2933]"
                    >
                      <div className="h-64 w-45 overflow-hidden rounded-lg bg-gray-100 dark:bg-[#10171b]">
                        {item.image_url && (
                          <img src={item.image_url} alt={item.display_name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm font-medium text-gray-900 dark:text-slate-100">{item.display_name}</p>
                      <div className="mt-2 flex items-center gap-1 text-amber-500">
                        <div className="flex items-center gap-0.5">
                          {cardRating ? renderCompactStars(cardRating) : null}
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
                          {cardRating ? cardRating.toFixed(1) : null}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-semibold text-amber-700">{formatINR(effectiveCardPrice)}</p>
                        {effectiveCardPrice < regularPrice && (
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-gray-500 line-through">{formatINR(regularPrice)}</span>
                            <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                              Save {cardSavingsPct}%
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })()
              ))}
            </div>
          </div>
        </Card>
      )}

      {relatedProducts.length > 0 && (
        <Card className="rounded-2xl border border-gray-100 bg-white p-6 dark:border-[#1f2933] dark:bg-[#151e22]">
          <h2 className="font-serif text-2xl text-gray-900 dark:text-slate-100">You May Also Like</h2>
          <div className="relative mt-4">
            <button
              type="button"
              onClick={() => scrollRailByCard(relatedProductsRef, -1)}
              className="absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white/95 p-2 text-gray-700 shadow-sm transition hover:border-amber-300 hover:text-amber-700 dark:border-[#1f2933] dark:bg-[#151e22]/95 dark:text-slate-300"
              aria-label="Scroll related products left"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollRailByCard(relatedProductsRef, 1)}
              className="absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full border border-gray-200 bg-white/95 p-2 text-gray-700 shadow-sm transition hover:border-amber-300 hover:text-amber-700 dark:border-[#1f2933] dark:bg-[#151e22]/95 dark:text-slate-300"
              aria-label="Scroll related products right"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div
              ref={relatedProductsRef}
              className="flex gap-3 overflow-x-auto px-10 pb-2 [&::-webkit-scrollbar]:hidden"
              style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
            >
              {relatedProducts.map((item) => (
                (() => {
                  const regularPrice = Number(item.price || 0);
                  const discountedPrice = Number(item.discounted_price || regularPrice);
                  const effectiveCardPrice =
                    discountedPrice > 0 && discountedPrice < regularPrice
                      ? discountedPrice
                      : regularPrice;
                  const cardSavingsPct = getSavingsPct(regularPrice, effectiveCardPrice);
                  const cardRating = Number(item.average_rating || item.rating || 0);

                  return (
                    <Link
                      key={item.product_id}
                      to={`/products/${item.product_id}`}
                      className="w-56 shrink-0 rounded-xl border border-gray-200 p-3 dark:border-[#1f2933]"
                    >
                      <div className="h-64 w-45 overflow-hidden rounded-lg bg-gray-100 dark:bg-[#10171b]">
                        {(item.image_url || "").length > 0 && (
                          <img src={item.image_url} alt={item.display_name || item.name} className="h-full w-full object-cover" />
                        )}
                      </div>
                      <p className="mt-2 line-clamp-2 text-sm font-medium text-gray-900 dark:text-slate-100">
                        {item.display_name || item.name}
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-amber-500">
                        <div className="flex items-center gap-0.5">
                          {renderCompactStars(cardRating)}
                          
                        </div>
                        <span className="text-xs font-medium text-gray-700 dark:text-slate-300">
                          {cardRating ? cardRating.toFixed(1) : "New"}
                        </span>
                      </div>
                      <div className="mt-2">
                        <p className="text-sm font-semibold text-amber-700">{formatINR(effectiveCardPrice)}</p>
                        {effectiveCardPrice < regularPrice && (
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className="text-xs text-gray-500 line-through">{formatINR(regularPrice)}</span>
                            <span className="rounded-md bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700">
                              Save {cardSavingsPct}%
                            </span>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })()
              ))}
            </div>
          </div>
        </Card>
      )}

      <div ref={bottomSentinelRef} className="h-1 w-full" aria-hidden="true" />

      {showStickyBar && !isBottomVisible && (
        <div
          className={`fixed bottom-0 left-0 right-0 z-30 border-t px-4 py-3 shadow-lg ${
            darkMode ? "border-[#1f2933] bg-[#151e22]/95" : "border-amber-200 bg-[#fff8ee]/95"
          }`}
        >
          <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 md:px-8 lg:px-12">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-gray-500 dark:text-slate-400">Price</p>
              <p className="font-accent text-xl font-semibold">{formatINR(effectivePrice)}</p>
            </div>
            <Button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock || addLoading}
              label={addLoading ? "Adding..." : "Add to Cart"}
              className="!rounded-xl !bg-amber-600 !px-5 !py-3 !text-white hover:!bg-amber-700"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default ProductDetailsPage;
