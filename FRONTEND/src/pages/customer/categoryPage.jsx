// import { useRef, useState } from "react";
// import { Avatar } from "primereact/avatar";
// import { Button } from "primereact/button";
// import { Ripple } from "primereact/ripple";
// import { Sidebar } from "primereact/sidebar";
// import { StyleClass } from "primereact/styleclass";
// import { useTheme } from "../../context/ThemeContext";

// const favoriteItems = [
//   { icon: "pi pi-home", label: "Dashboard" },
//   { icon: "pi pi-bookmark", label: "Bookmarks" },
//   { icon: "pi pi-users", label: "Team" },
//   { icon: "pi pi-comments", label: "Messages" },
//   { icon: "pi pi-calendar", label: "Calendar" },
//   { icon: "pi pi-cog", label: "Settings" },
// ];

// const appItems = [
//   { icon: "pi pi-folder", label: "Projects" },
//   { icon: "pi pi-chart-bar", label: "Performance" },
//   { icon: "pi pi-cog", label: "Settings" },
// ];

// function CategoryPage() {
//   const { darkMode } = useTheme();
//   const [visible, setVisible] = useState(false);

//   const btnRef1 = useRef(null);
//   const btnRef2 = useRef(null);

//   return (
//     <div className="space-y-6">
//       <section
//   className={`rounded-3xl border p-6 md:p-10 ${
//     darkMode
//       ? "border-[#1f2933] bg-[#151e22]"
//       : "border-amber-200/70 bg-[#fff8ee]"
//   }`}
// >
//   <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

//     {/* LEFT SIDE - CATEGORY BUTTON */}
//     <div className="flex items-center">
//       <Button
//   type="button"
//   label="Categories"
//   icon="pi pi-list"
//   iconPos="left"
//   onClick={() => setVisible(true)}
//   className="!rounded-lg !border-0 !bg-amber-600 !px-4 !py-2 !text-sm !text-white !font-semibold hover:!bg-amber-700 transition-all duration-200"
// />
//     </div>

//     {/* RIGHT SIDE - TEXT CONTENT */}
//     <div className="text-right md:max-w-xl">
//       <p className="font-accent text-xs uppercase tracking-[0.25em] text-amber-600">
//         Categories
//       </p>

//       <h1
//         className={`mt-2 font-serif text-3xl md:text-4xl font-semibold ${
//           darkMode ? "text-slate-100" : "text-gray-900"
//         }`}
//       >
//         Browse Category Menu
//       </h1>

//       <p
//         className={`mt-3 text-sm leading-relaxed ${
//           darkMode ? "text-slate-400" : "text-gray-600"
//         }`}
//       >
//         Explore all product collections and navigate through structured
//         category sections designed for a smooth shopping experience.
//       </p>
//     </div>
//   </div>
// </section>

//       <Sidebar
//         visible={visible}
//         onHide={() => setVisible(false)}
//         showCloseIcon={false}
//         dismissable
//         blockScroll
//         className="!w-[90vw] !max-w-[360px]"
//         content={({ closeIconRef, hide }) => (
//           <div
//             className={`h-full ${
//               darkMode ? "bg-[#151e22] text-slate-100" : "bg-[#fff8ee] text-gray-900"
//             }`}
//           >
//             <div
//               className={`flex items-center justify-between border-b px-4 py-4 ${
//                 darkMode ? "border-[#1f2933]" : "border-amber-200/70"
//               }`}
//             >
//               <div className="inline-flex items-center gap-2">
//                 <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-500/20 text-amber-500">
//                   <i className="pi pi-th-large" />
//                 </span>
//                 <span className="font-serif text-xl font-semibold">ShopSphere</span>
//               </div>

//               <Button
//                 type="button"
//                 ref={closeIconRef}
//                 onClick={(e) => hide(e)}
//                 icon="pi pi-times"
//                 rounded
//                 text
//                 className={darkMode ? "!text-slate-200" : "!text-gray-700"}
//               />
//             </div>

//             <div className="h-[calc(100%-73px)] overflow-y-auto px-3 py-4">
//               <ul className="m-0 list-none p-0">
//                 <li>
//                   <StyleClass
//                     nodeRef={btnRef1}
//                     selector="@next"
//                     enterFromClassName="hidden"
//                     enterActiveClassName="slidedown"
//                     leaveToClassName="hidden"
//                     leaveActiveClassName="slideup"
//                   >
//                     <div
//                       ref={btnRef1}
//                       className={`p-ripple flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 ${
//                         darkMode ? "text-slate-200 hover:bg-[#1a2327]" : "text-gray-700 hover:bg-amber-50"
//                       }`}
//                     >
//                       <span className="font-accent text-xs font-semibold uppercase tracking-[0.15em]">
//                         Favorites
//                       </span>
//                       <i className="pi pi-chevron-down text-xs" />
//                       <Ripple />
//                     </div>
//                   </StyleClass>

//                   <ul className="m-0 mt-1 list-none overflow-hidden p-0">
//                     {favoriteItems.map((item) => (
//                       <li key={item.label}>
//                         <a
//                           className={`p-ripple flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
//                             darkMode
//                               ? "text-slate-200 hover:bg-[#1a2327] hover:text-amber-300"
//                               : "text-gray-700 hover:bg-amber-50 hover:text-amber-700"
//                           }`}
//                         >
//                           <i className={item.icon} />
//                           <span className="font-medium">{item.label}</span>
//                           <Ripple />
//                         </a>
//                       </li>
//                     ))}
//                   </ul>
//                 </li>
//               </ul>

//               <ul className="m-0 mt-4 list-none p-0">
//                 <li>
//                   <StyleClass
//                     nodeRef={btnRef2}
//                     selector="@next"
//                     enterFromClassName="hidden"
//                     enterActiveClassName="slidedown"
//                     leaveToClassName="hidden"
//                     leaveActiveClassName="slideup"
//                   >
//                     <div
//                       ref={btnRef2}
//                       className={`p-ripple flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 ${
//                         darkMode ? "text-slate-200 hover:bg-[#1a2327]" : "text-gray-700 hover:bg-amber-50"
//                       }`}
//                     >
//                       <span className="font-accent text-xs font-semibold uppercase tracking-[0.15em]">
//                         Application
//                       </span>
//                       <i className="pi pi-chevron-down text-xs" />
//                       <Ripple />
//                     </div>
//                   </StyleClass>

//                   <ul className="m-0 mt-1 list-none overflow-hidden p-0">
//                     {appItems.map((item) => (
//                       <li key={item.label}>
//                         <a
//                           className={`p-ripple flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
//                             darkMode
//                               ? "text-slate-200 hover:bg-[#1a2327] hover:text-amber-300"
//                               : "text-gray-700 hover:bg-amber-50 hover:text-amber-700"
//                           }`}
//                         >
//                           <i className={item.icon} />
//                           <span className="font-medium">{item.label}</span>
//                           <Ripple />
//                         </a>
//                       </li>
//                     ))}
//                   </ul>
//                 </li>
//               </ul>

//               <div
//                 className={`mt-6 border-t pt-4 ${
//                   darkMode ? "border-[#1f2933]" : "border-amber-200/70"
//                 }`}
//               >
//                 <a
//                   className={`p-ripple flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 ${
//                     darkMode ? "hover:bg-[#1a2327]" : "hover:bg-amber-50"
//                   }`}
//                 >
//                   <Avatar
//                     image="https://primefaces.org/cdn/primereact/images/avatar/amyelsner.png"
//                     shape="circle"
//                   />
//                   <span className="font-semibold">Amy Elsner</span>
//                   <Ripple />
//                 </a>
//               </div>
//             </div>
//           </div>
//         )}
//       />
//     </div>
//   );
// }

// export default CategoryPage;

// import { useEffect, useState } from "react";
// import CategoryFilterSidebar from "../../components/category/CategoryFilterSidebar";
// import CategorySearchBar from "../../components/category/CategorySearchBar";
// import SelectedFilters from "../../components/category/SelectedFilters";
// import ProductGrid from "../../components/category/ProductGrid";

// function CategoryPage() {
//   const [isLoading, setIsLoading] = useState(true);

//   // Simulate API call
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       setIsLoading(false);
//     }, 2000);

//     return () => clearTimeout(timer);
//   }, []);

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col lg:flex-row gap-8">
//         <CategoryFilterSidebar isLoading={isLoading} />

//         <div className="flex-1 space-y-6">
//           <CategorySearchBar isLoading={isLoading} />
//           <SelectedFilters isLoading={isLoading} />
//           <ProductGrid isLoading={isLoading} />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CategoryPage;

// import { useEffect, useState } from "react";
// import CategoryFilterSidebar from "../../components/category/CategoryFilterSidebar";
// import CategorySearchBar from "../../components/category/CategorySearchBar";
// import SelectedFilters from "../../components/category/SelectedFilters";
// import ProductGrid from "../../components/category/ProductGrid";
// import { getAllCategories, getAllProducts } from "../../services/categoryApi";

// function buildCategoryTree(items = []) {
//   const map = new Map();

//   items.forEach((c) => {
//     map.set(c.category_id, {
//       key: String(c.category_id),
//       label: c.category_name,
//       children: [],
//     });
//   });

//   const roots = [];
//   items.forEach((c) => {
//     const node = map.get(c.category_id);
//     if (c.parent_id && map.has(c.parent_id)) {
//       map.get(c.parent_id).children.push(node);
//     } else {
//       roots.push(node);
//     }
//   });

//   return roots;
// }

// function CategoryPage() {
//   const [isLoading, setIsLoading] = useState(true);
//   const [categoryNodes, setCategoryNodes] = useState([]);
//   const [products, setProducts] = useState([]);

//   useEffect(() => {
//     const loadPageData = async () => {
//       try {
//         setIsLoading(true);

//         const [categoryRes, productRes] = await Promise.all([
//           getAllCategories(),
//           getAllProducts(),
//         ]);

//         const categoryItems = categoryRes?.data?.data?.items || [];
//         setCategoryNodes(buildCategoryTree(categoryItems));

//         const productItems =
//           productRes?.data?.data?.items || productRes?.data?.data || [];
//         setProducts(Array.isArray(productItems) ? productItems : []);
//       } catch (error) {
//         console.error("Failed to load category page data:", error);
//         setCategoryNodes([]);
//         setProducts([]);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     loadPageData();
//   }, []);

//   return (
//     <div className="container mx-auto px-4 py-8">
//       <div className="flex flex-col lg:flex-row gap-8">
//         <CategoryFilterSidebar
//           isLoading={isLoading}
//           categoryNodes={categoryNodes}
//         />

//         <div className="flex-1 space-y-6">
//           <CategorySearchBar isLoading={isLoading} />
//           <SelectedFilters isLoading={isLoading} />
//           <ProductGrid isLoading={isLoading} products={products} />
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CategoryPage;

import { useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Toast } from "primereact/toast";
import CategoryFilterSidebar from "../../components/category/CategoryFilterSidebar";
import CategorySearchBar from "../../components/category/CategorySearchBar";
import SelectedFilters from "../../components/category/SelectedFilters";
import ProductGrid from "../../components/category/ProductGrid";
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
  if (data?.data?.item && typeof data.data.item === "object") return [data.data.item];
  return [];
};

const getEffectivePrice = (product) =>
  Number(product?.discounted_price ?? product?.price ?? 0);

const getSelectedCategoryIds = (selectedKeys = {}) =>
  Object.entries(selectedKeys)
    .filter(
      ([, value]) =>
        value === true || value?.checked === true,
    )
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
  Number(res?.data?.pagination?.totalItems ?? res?.data?.data?.count ?? fallback);

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
  const prevFilterSignatureRef = useRef("");
  const productsRequestIdRef = useRef(0);
  const priceRangeRequestIdRef = useRef(0);
  const hasUserPriceSelectionRef = useRef(false);
  const debouncedPriceRange = useDebouncedValue(priceRange, 300);

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

  const usesBackendPagination = true;

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
        console.log("Category selection debug:", {
          selectedKeys,
          selectedCategoryIds,
          categoryIdGroups,
          hasSearch,
        });

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
              ? { parent_ids: categoryIdGroups.parent.join(",") }
              : {}),
            ...(categoryIdGroups.child.length
              ? { child_ids: categoryIdGroups.child.join(",") }
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

        if (
          items.length > pager.rows
        ) {
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
  }, [
    treeLoaded,
    paginationFetchKey,
    filterSignature,
  ]);

  useEffect(() => {
    if (!treeLoaded) return;

    let ignore = false;

    const loadPriceBounds = async () => {
      const requestId = ++priceRangeRequestIdRef.current;
      try {
        const hasSearch = debouncedSearchText.length > 0;
        const hasCategoryFilter =
          categoryIdGroups.parent.length > 0 ||
          categoryIdGroups.child.length > 0;

        const priceRes = await getCategoryProductsPriceRange({
          ...(categoryIdGroups.parent.length
            ? { parent_ids: categoryIdGroups.parent.join(",") }
            : {}),
          ...(categoryIdGroups.child.length
            ? { child_ids: categoryIdGroups.child.join(",") }
            : {}),
          ...(hasSearch ? { search: debouncedSearchText } : {}),
          ...(hasCategoryFilter ? {} : {}),
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
      if (prev[0] === priceBounds.min && prev[1] === priceBounds.max) return prev;
      return [priceBounds.min, priceBounds.max];
    });
  }, [priceBounds.min, priceBounds.max]);

  useEffect(() => {
    setPager((prev) => {
      const currentLength = totalRecords;
      if (prev.first < currentLength) return prev;
      return { ...prev, first: 0 };
    });
  }, [
    products.length,
    totalRecords,
  ]);

  const pagedProducts = useMemo(
    () => products,
    [products],
  );

  const paginatorTotalRecords = totalRecords;

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

  // Add to cart handler
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
      await api.post("/cart/items", {
        productId,
        quantity: 1,
      });
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

  return (
    <div className="category-page">
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
            products={pagedProducts}
            onAddToCart={handleAddToCart}
            paginator={{
              enabled: true,
              first: pager.first,
              rows: pager.rows,
              totalRecords: paginatorTotalRecords,
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
