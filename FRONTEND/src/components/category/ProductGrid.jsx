import { useEffect, useMemo, useRef, useState } from "react";
import { Skeleton } from "primereact/skeleton";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Paginator } from "primereact/paginator";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { getProductRatingSummariesBulk } from "../../services/categoryApi";

function ProductGrid({
  isLoading,
  products = [],
  onAddToCart,
  paginator = null,
  onPageChange,
}) {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const [ratingMap, setRatingMap] = useState({});
  const fetchedRatingsRef = useRef(new Set());
  const productIds = useMemo(
    () =>
      products
        .map((product) => product.product_id || product.id)
        .filter(Boolean),
    [products]
  );

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
        (id) => id && !fetchedRatingsRef.current.has(id)
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
    return <p className="text-sm text-gray-500">No products found.</p>;
  }

  return (
    <div className="category-product-grid space-y-6">
      <div className="category-product-grid-list grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => {
          const discount = getDiscountDetails(product);

          return (
            <div className="trace-card" key={product.product_id || product.id}>
              <Card
                className={`category-product-card trace-card-inner product-card !h-full !rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 ${
                  darkMode
                    ? "bg-[#151e22] border border-[#1f2933] text-slate-200"
                    : "bg-white border border-gray-100 text-gray-800"
                }`}
                onClick={() => {
                  const id = product.product_id || product.id;
                  if (!id) return;
                  navigate(`/products/${id}`);
                }}
              >
              <div className="flex h-full min-h-[280px] flex-col">
                <div
                  className={`category-product-media product-image-wrap relative h-32 w-full overflow-hidden ${
                    darkMode ? "bg-[#0f161a]" : "bg-gray-100"
                  }`}
                >
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.display_name || product.name || "Product"}
                      className="product-image-el h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                    />
                  ) : null}
                  {discount ? (
                    <span className="absolute left-2 top-2 rounded-md bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white">
                      {discount.percent}% OFF
                    </span>
                  ) : null}
                </div>

                <div className="product-card-content">
                  <h4
                    className={`h-10 overflow-hidden text-sm font-semibold leading-5 ${
                      darkMode ? "text-slate-200" : "text-gray-800"
                    }`}
                  >
                    {product.display_name || product.name || "Product"}
                  </h4>

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
                              index < filledCount
                                ? "pi-star-fill"
                                : "pi-star"
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
                      if (!discount) {
                        return (
                          <p className="font-bold text-amber-600">
                            {"\u20B9"}
                            {Number(product.price ?? 0).toLocaleString("en-IN")}
                          </p>
                        );
                      }

                      return (
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-amber-600">
                            {"\u20B9"}
                            {discount.discounted.toLocaleString("en-IN")}
                          </p>

                          <p
                            className={`text-xs line-through ${
                              darkMode ? "text-slate-500" : "text-gray-400"
                            }`}
                          >
                            {"\u20B9"}
                            {discount.original.toLocaleString("en-IN")}
                          </p>

                          <span className="text-xs font-semibold text-green-600">
                            {discount.percent}% OFF
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  <div className="mt-auto pt-2">
                    <Button
                      label="Add to Cart"
                      icon="pi pi-shopping-cart"
                      onClick={(e) => {
                        e.stopPropagation();
                        const id = product.product_id || product.id;
                        if (!id) return;
                        if (onAddToCart) {
                          onAddToCart(product);
                        } else {
                          navigate(`/items/${id}`);
                        }
                      }}
                      className="outline-none !w-full !px-4 !py-2.5 !bg-transparent !border !border-[var(--primary-color)] !text-[var(--primary-color)]"
                    />
                  </div>
                </div>
              </div>
            </Card>

            <svg
              className="trace-svg"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
            >
              <rect
                className="trace-base"
                x="0.75"
                y="0.75"
                width="98.5"
                height="98.5"
                rx="4.1"
                ry="4.1"
                pathLength="100"
              />
              <rect
                className="trace-run"
                x="0.75"
                y="0.75"
                width="98.5"
                height="98.5"
                rx="4.1"
                ry="4.1"
                pathLength="100"
              />
            </svg>
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
            className="customer-product-paginator"
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
          `}</style>
        </>
      ) : null}
    </div>
  );
}

export default ProductGrid;


// import { Skeleton } from "primereact/skeleton";
// import { Card } from "primereact/card";
// import { Button } from "primereact/button";
// import { Paginator } from "primereact/paginator";
// import { useNavigate } from "react-router-dom";

// function ProductGrid({
//   isLoading,
//   products = [],
//   onAddToCart,
//   paginator = null,
//   onPageChange,
// }) {
//   const navigate = useNavigate();

//   if (isLoading) {
//     return (
//       <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
//         {Array.from({ length: 8 }).map((_, index) => (
//           <div key={index} className="space-y-3">
//             <Skeleton height="150px" />
//             <Skeleton height="20px" />
//             <Skeleton width="60%" height="20px" />
//           </div>
//         ))}
//       </div>
//     );
//   }

//   if (!products.length) {
//     return <p className="text-sm text-gray-500">No products found.</p>;
//   }

//   return (
//     <div className="category-product-grid space-y-6">
//       <div className="category-product-grid-list grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
//         {products.map((product) => (
//           <div className="trace-card" key={product.product_id || product.id}>
//             <Card
//               className="category-product-card trace-card-inner product-card !h-full !rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300"
//               onClick={() => {
//                 const id = product.product_id || product.id;
//                 if (!id) return;
//                 navigate(`/products/${id}`);
//               }}
//             >
//               <div className="flex h-full min-h-[280px] flex-col">
//                 <div className="category-product-media product-image-wrap h-32 w-full bg-red-200">
//                   {product.image_url ? (
//                     <img
//                       src={product.image_url}
//                       alt={product.display_name || product.name || "Product"}
//                       className="product-image-el h-full w-full object-cover"
//                     />
//                   ) : null}
//                 </div>

//                 <div className="product-card-content">
//                   <h4 className="h-10 overflow-hidden text-sm font-semibold leading-5">
//                     {product.display_name || product.name || "Product"}
//                   </h4>

//                   <div className="mt-1 h-6">
//                     <p className="font-bold text-amber-600">
//                       {"\u20B9"}{Number(product.discounted_price ?? product.price ?? 0).toLocaleString("en-IN")}
//                     </p>
//                   </div>

//                   <div className="mt-auto pt-2">
//                     <Button
//                       label="Add to Cart"
//                       icon="pi pi-shopping-cart"
//                       onClick={(e) => {
//                         e.stopPropagation();
//                         const id = product.product_id || product.id;
//                         if (!id) return;
//                         if (onAddToCart) {
//                           onAddToCart(product);
//                         } else {
//                           navigate(`/items/${id}`);
//                         }
//                       }}
//                       className="outline-none !w-full !px-4 !py-2.5 !bg-transparent !border !border-[var(--primary-color)] !text-[var(--primary-color)]"
//                     />
//                   </div>
//                 </div>
//               </div>
//             </Card>

//             <svg className="trace-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
//               <rect className="trace-base" x="0.75" y="0.75" width="98.5" height="98.5" rx="4.1" ry="4.1" pathLength="100" />
//               <rect className="trace-run" x="0.75" y="0.75" width="98.5" height="98.5" rx="4.1" ry="4.1" pathLength="100" />
//             </svg>
//           </div>
//         ))}
//       </div>

//       {paginator?.enabled ? (
//         <>
//           <Paginator
//             first={paginator.first}
//             rows={paginator.rows}
//             totalRecords={paginator.totalRecords}
//             rowsPerPageOptions={paginator.rowsPerPageOptions || [5, 10, 25, 50]}
//             onPageChange={onPageChange}
//             template="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
//             className="customer-product-paginator"
//             pt={{
//               pageButton: ({ context }) => ({
//                 className: context.active
//                   ? "customer-page-btn-active"
//                   : "customer-page-btn",
//               }),
//             }}
//           />

//           <style>{`
//             .customer-product-paginator .p-paginator-page.customer-page-btn {
//               color: inherit;
//             }
//             .customer-product-paginator .p-paginator-page.customer-page-btn-active {
//               background: var(--primary-color) !important;
//               border-color: var(--primary-color) !important;
//               color: #fff !important;
//             }
//           `}</style>
//         </>
//       ) : null}
//     </div>
//   );
// }

// export default ProductGrid;
