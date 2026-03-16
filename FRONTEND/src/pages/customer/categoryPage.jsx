import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Toast } from "primereact/toast";
import CategoryFilterSidebar from "../../components/category/CategoryFilterSidebar";
import CategorySearchBar from "../../components/category/CategorySearchBar";
import SelectedFilters from "../../components/category/SelectedFilters";
import ProductGrid from "../../components/category/ProductGrid";
import PortionPickerModal from "../../components/category/PortionPickerModal";
import {
  getAllCategories,
  getAllProducts,
  getProductsByCategoryFilters,
  getCategoryProductsPriceRange,
} from "../../services/categoryApi";
import api from "../../../api/api";

const extractProducts = (res) => {
  const data = res?.data;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.items)) return data.items;
  return [];
};

const extractCategoryTree = (res) => {
  const data = res?.data;
  if (Array.isArray(data?.data?.items)) return data.data.items;
  if (Array.isArray(data?.data)) return data.data;
  if (data?.data?.item && typeof data.data.item === "object")
    return [data.data.item];
  return [];
};

const getSelectedCategoryIds = (selectedKeys = {}) =>
  Object.entries(selectedKeys)
    .filter(([, value]) => value === true || value?.checked === true)
    .map(([key]) => Number(key))
    .filter((value) => Number.isFinite(value) && value > 0);

const buildParentMap = (nodes = []) => {
  const parentMap = new Map();

  const walk = (node, parentId = null) => {
    if (parentId !== null) parentMap.set(node.category_id, parentId);
    (node.children || []).forEach((child) => walk(child, node.category_id));
  };

  nodes.forEach(walk);
  return parentMap;
};

const isDescendantOf = (childId, ancestorId, parentMap) => {
  let current = parentMap.get(childId);
  while (current !== undefined) {
    if (current === ancestorId) return true;
    current = parentMap.get(current);
  }
  return false;
};

const extractTotalRecords = (res, fallback = 0) =>
  Number(
    res?.data?.pagination?.totalItems ?? res?.data?.data?.count ?? fallback,
  );

const buildCategoryLabelMap = (nodes = [], map = new Map()) => {
  nodes.forEach((node) => {
    map.set(node.category_id, node.category_name);
    buildCategoryLabelMap(node.children || [], map);
  });
  return map;
};

const buildParentIdSet = (nodes = [], set = new Set()) => {
  nodes.forEach((node) => {
    if (node?.children?.length) {
      set.add(node.category_id);
      buildParentIdSet(node.children, set);
    }
  });
  return set;
};

const isDescendantOfAny = (childId, ancestorSet, parentMap) => {
  let current = parentMap.get(childId);
  while (current !== undefined) {
    if (ancestorSet.has(current)) return true;
    current = parentMap.get(current);
  }
  return false;
};

const useDebouncedValue = (value, delayMs = 300) => {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebounced(value);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
};

function CategoryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const toast = useRef(null);
  const { currentUser } = useSelector((state) => state.auth);

  const [isTreeLoading, setIsTreeLoading] = useState(true);
  const [isProductsLoading, setIsProductsLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [categoryTree, setCategoryTree] = useState([]);
  const [treeLoaded, setTreeLoaded] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState({});
  const [priceRange, setPriceRange] = useState([0, 0]);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [pager, setPager] = useState({ first: 0, rows: 8 });
  const [totalRecords, setTotalRecords] = useState(0);
  const [priceBounds, setPriceBounds] = useState({ min: 0, max: 0 });
  const [pickerProduct, setPickerProduct] = useState(null);
  const prevFilterSignatureRef = useRef("");
  const productsRequestIdRef = useRef(0);
  const priceRangeRequestIdRef = useRef(0);
  const hasUserPriceSelectionRef = useRef(false);
  const debouncedPriceRange = useDebouncedValue(priceRange, 300);
  const urlSearch = searchParams.get("search") || "";
  const urlCategory = searchParams.get("category");

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsTreeLoading(true);
        const categoryRes = await getAllCategories();
        setCategoryTree(extractCategoryTree(categoryRes));
      } catch (error) {
        console.error("Failed to load categories:", error);
        setCategoryTree([]);
      } finally {
        setIsTreeLoading(false);
        setTreeLoaded(true);
      }
    };

    loadInitialData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchText(searchText.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    setSearchText(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    if (!treeLoaded) {
      return;
    }

    if (!urlCategory) {
      setSelectedKeys({});
      return;
    }

    const categoryId = Number(urlCategory);
    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      setSelectedKeys({});
      return;
    }

    setSelectedKeys({
      [String(categoryId)]: {
        checked: true,
        partialChecked: false,
      },
    });
  }, [treeLoaded, urlCategory]);

  const selectedCategoryIds = useMemo(
    () => getSelectedCategoryIds(selectedKeys),
    [selectedKeys],
  );

  const categoryLabelMap = useMemo(
    () => buildCategoryLabelMap(categoryTree),
    [categoryTree],
  );

  const parentMap = useMemo(() => buildParentMap(categoryTree), [categoryTree]);

  const parentIdSet = useMemo(
    () => buildParentIdSet(categoryTree),
    [categoryTree],
  );

  const parentSelectionIds = useMemo(
    () => selectedCategoryIds.filter((id) => parentIdSet.has(id)),
    [selectedCategoryIds, parentIdSet],
  );

  const parentSelectionSet = useMemo(
    () => new Set(parentSelectionIds),
    [parentSelectionIds],
  );

  const childSelectionIds = useMemo(
    () =>
      selectedCategoryIds.filter(
        (id) =>
          !parentIdSet.has(id) &&
          !isDescendantOfAny(id, parentSelectionSet, parentMap),
      ),
    [selectedCategoryIds, parentIdSet, parentSelectionSet, parentMap],
  );

  const categoryIdGroups = useMemo(
    () => ({
      parent: parentSelectionIds,
      child: childSelectionIds,
    }),
    [parentSelectionIds, childSelectionIds],
  );

  const backendPage = useMemo(
    () => Math.floor(pager.first / pager.rows) + 1,
    [pager.first, pager.rows],
  );

  const paginationFetchKey = useMemo(
    () => `${backendPage}-${pager.rows}`,
    [backendPage, pager.rows],
  );

  const filterSignature = useMemo(() => {
    const parentKey = parentSelectionIds.join(",");
    const childKey = childSelectionIds.join(",");
    const priceKey = hasUserPriceSelectionRef.current
      ? `${debouncedPriceRange[0]}-${debouncedPriceRange[1]}`
      : "";
    return `${debouncedSearchText}|${parentKey}|${childKey}|${priceKey}`;
  }, [
    debouncedSearchText,
    parentSelectionIds,
    childSelectionIds,
    debouncedPriceRange,
  ]);

  const boundsSignature = useMemo(() => {
    const parentKey = parentSelectionIds.join(",");
    const childKey = childSelectionIds.join(",");
    return `${debouncedSearchText}|${parentKey}|${childKey}`;
  }, [debouncedSearchText, parentSelectionIds, childSelectionIds]);

  const priceFilterParams = useMemo(() => {
    const hasPriceFilter =
      hasUserPriceSelectionRef.current &&
      (debouncedPriceRange[0] !== priceBounds.min ||
        debouncedPriceRange[1] !== priceBounds.max);
    return hasPriceFilter
      ? { min_price: debouncedPriceRange[0], max_price: debouncedPriceRange[1] }
      : {};
  }, [debouncedPriceRange, priceBounds.min, priceBounds.max]);

  useEffect(() => {
    if (!treeLoaded) return;
    setPager((prev) => (prev.first === 0 ? prev : { ...prev, first: 0 }));
  }, [treeLoaded, boundsSignature]);

  useEffect(() => {
    if (!treeLoaded) return;

    const isFilterChanged = prevFilterSignatureRef.current !== filterSignature;
    if (isFilterChanged) {
      prevFilterSignatureRef.current = filterSignature;
      setProducts([]);
      setTotalRecords(0);
      if (pager.first !== 0) {
        setPager((prev) => ({ ...prev, first: 0 }));
        return;
      }
    } else {
      prevFilterSignatureRef.current = filterSignature;
    }

    const loadProductsBySelection = async () => {
      const requestId = ++productsRequestIdRef.current;
      try {
        setIsProductsLoading(true);
        let items = [];

        const hasSearch = debouncedSearchText.length > 0;
        const hasCategoryFilter =
          categoryIdGroups.parent.length > 0 ||
          categoryIdGroups.child.length > 0;

        if (!hasCategoryFilter) {
          const productRes = await getAllProducts({
            page: backendPage,
            limit: pager.rows,
            ...(hasSearch ? { search: debouncedSearchText } : {}),
            ...priceFilterParams,
          });
          items = extractProducts(productRes);
          if (requestId === productsRequestIdRef.current) {
            setTotalRecords(extractTotalRecords(productRes, items.length));
          }
        } else {
          const productRes = await getProductsByCategoryFilters({
            ...(categoryIdGroups.parent.length
              ? { parent_ids: categoryIdGroups.parent }
              : {}),
            ...(categoryIdGroups.child.length
              ? { child_ids: categoryIdGroups.child }
              : {}),
            ...(hasSearch ? { search: debouncedSearchText } : {}),
            ...priceFilterParams,
            page: backendPage,
            limit: pager.rows,
          });
          items = extractProducts(productRes);
          if (requestId === productsRequestIdRef.current) {
            setTotalRecords(extractTotalRecords(productRes, items.length));
          }
        }

        if (items.length > pager.rows) {
          items = items.slice(0, pager.rows);
        }

        if (requestId === productsRequestIdRef.current) {
          setProducts(items);
        }
      } catch (error) {
        console.error("Failed to load products:", error);
        if (requestId === productsRequestIdRef.current) {
          setProducts([]);
        }
      } finally {
        if (requestId === productsRequestIdRef.current) {
          setIsProductsLoading(false);
        }
      }
    };

    loadProductsBySelection();
  }, [treeLoaded, paginationFetchKey, filterSignature]);

  useEffect(() => {
    if (!treeLoaded) return;

    let ignore = false;

    const loadPriceBounds = async () => {
      const requestId = ++priceRangeRequestIdRef.current;
      try {
        const hasSearch = debouncedSearchText.length > 0;

        const priceRes = await getCategoryProductsPriceRange({
          ...(categoryIdGroups.parent.length
            ? { parent_ids: categoryIdGroups.parent }
            : {}),
          ...(categoryIdGroups.child.length
            ? { child_ids: categoryIdGroups.child }
            : {}),
          ...(hasSearch ? { search: debouncedSearchText } : {}),
        });

        if (ignore || requestId !== priceRangeRequestIdRef.current) return;
        const min = Number(priceRes?.data?.data?.min ?? 0);
        const max = Number(priceRes?.data?.data?.max ?? 0);
        setPriceBounds({ min, max });
      } catch (error) {
        if (!ignore && requestId === priceRangeRequestIdRef.current) {
          setPriceBounds({ min: 0, max: 0 });
        }
      }
    };

    loadPriceBounds();
    return () => {
      ignore = true;
    };
  }, [treeLoaded, boundsSignature]);

  useEffect(() => {
    setPriceRange((prev) => {
      if (prev[0] === priceBounds.min && prev[1] === priceBounds.max)
        return prev;
      return [priceBounds.min, priceBounds.max];
    });
  }, [priceBounds.min, priceBounds.max]);

  useEffect(() => {
    setPager((prev) => {
      const currentLength = totalRecords;
      if (prev.first < currentLength) return prev;
      return { ...prev, first: 0 };
    });
  }, [products.length, totalRecords]);

  const combinedCategoryIds = useMemo(
    () => [...new Set([...parentSelectionIds, ...childSelectionIds])],
    [parentSelectionIds, childSelectionIds],
  );

  const categoryTags = useMemo(() => {
    return combinedCategoryIds.map((id) => ({
      id,
      label: categoryLabelMap.get(id) || `Category ${id}`,
    }));
  }, [combinedCategoryIds, categoryLabelMap]);

  const priceTag = useMemo(() => {
    const isFullRange =
      priceRange[0] === priceBounds.min && priceRange[1] === priceBounds.max;
    if (isFullRange) return "";
    return `₹${priceRange[0].toLocaleString("en-IN")} - ₹${priceRange[1].toLocaleString("en-IN")}`;
  }, [priceRange, priceBounds.min, priceBounds.max]);

  const handleRemoveCategoryTag = (categoryId) => {
    setSelectedKeys((prev) => {
      const next = { ...prev };
      Object.keys(next).forEach((key) => {
        const id = Number(key);
        if (!Number.isFinite(id)) return;

        const shouldRemove =
          id === categoryId || isDescendantOf(id, categoryId, parentMap);
        if (shouldRemove) delete next[key];
      });
      return next;
    });
  };

  const handleClearPrice = () => {
    hasUserPriceSelectionRef.current = false;
    setPriceRange([priceBounds.min, priceBounds.max]);
  };

  const doAddToCart = async (product, portionId, modifierIds) => {
    const productId = product.product_id || product.id;
    try {
      await api.post("/cart/items", {
        productId,
        quantity: 1,
        ...(portionId != null && { portionId }),
        ...(modifierIds != null && { modifierIds }),
      });
      window.dispatchEvent(new CustomEvent("cart:updated"));
      toast.current?.show({
        severity: "success",
        summary: "Added to Cart",
        detail: `${product.display_name || product.name} added to cart`,
        life: 3000,
      });
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: error.response?.data?.message || "Failed to add to cart",
        life: 3000,
      });
    }
  };

  const handleAddToCart = async (product) => {
    if (!currentUser) {
      toast.current?.show({
        severity: "warn",
        summary: "Login Required",
        detail: "Please login to add items to cart",
        life: 3000,
      });
      navigate("/login", { state: { from: "/categories" } });
      return;
    }

    const productId = product.product_id || product.id;
    if (!productId) {
      toast.current?.show({
        severity: "error",
        summary: "Error",
        detail: "Invalid product",
        life: 3000,
      });
      return;
    }

    try {
      const portRes = await api.get(`/portion/getProductPortions/${productId}`);
      const raw = portRes.data?.data ?? portRes.data ?? [];
      const portions = Array.isArray(raw) ? raw : [];

      if (portions.length > 1) {
        setPickerProduct({ ...product, _portions: portions });
        return;
      }

      if (portions.length === 1) {
        const portionId = portions[0].product_portion_id;
        const modRes = await api.get(`/modifiers/by-portion/${portionId}`);
        const rawMods = modRes.data?.data ?? modRes.data ?? [];
        const mods = Array.isArray(rawMods) ? rawMods : [];

        if (mods.length > 0) {
          setPickerProduct({ ...product, _portions: portions });
          return;
        }

        await doAddToCart(product, portionId, null);
        return;
      }

      await doAddToCart(product, null, null);
    } catch {
      await doAddToCart(product, null, null);
    }
  };

  const handlePickerConfirm = async (portionId, modifierIds) => {
    await doAddToCart(pickerProduct, portionId, modifierIds);
    setPickerProduct(null);
  };

  return (
    <div className="category-page">
      <Toast ref={toast} position="top-right" className="app-toast-offset" />
      {pickerProduct && (
        <PortionPickerModal
          product={pickerProduct}
          onHide={() => setPickerProduct(null)}
          onConfirm={handlePickerConfirm}
        />
      )}
      <div className="container mx-auto px-4 py-8">
        <div className="category-page-layout flex flex-col lg:flex-row gap-8">
          <CategoryFilterSidebar
            isLoading={isTreeLoading}
            categoryTree={categoryTree}
            selectedKeys={selectedKeys}
            onSelectionChange={setSelectedKeys}
            priceRange={priceRange}
            minPrice={priceBounds.min}
            maxPrice={priceBounds.max}
            onPriceRangeChange={(nextRange) => {
              hasUserPriceSelectionRef.current = true;
              setPriceRange(nextRange);
            }}
          />

          <div className="category-results flex-1 space-y-6">
            <CategorySearchBar
              isLoading={isTreeLoading}
              searchText={searchText}
              onSearchChange={setSearchText}
            />
            <SelectedFilters
              isLoading={isProductsLoading}
              categoryTags={categoryTags}
              searchText={debouncedSearchText}
              priceTag={priceTag}
              onRemoveCategory={handleRemoveCategoryTag}
              onClearSearch={() => setSearchText("")}
              onClearPrice={handleClearPrice}
            />
            <ProductGrid
              isLoading={isProductsLoading}
              products={products}
              onAddToCart={handleAddToCart}
              paginator={{
                enabled: true,
                first: pager.first,
                rows: pager.rows,
                totalRecords: totalRecords,
                rowsPerPageOptions: [8, 16, 24, 32],
              }}
              onPageChange={(event) =>
                setPager({ first: event.first, rows: event.rows })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default CategoryPage;
