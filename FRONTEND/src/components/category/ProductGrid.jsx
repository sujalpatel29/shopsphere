import { Skeleton } from "primereact/skeleton";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import { Paginator } from "primereact/paginator";
import { useNavigate } from "react-router-dom";

function ProductGrid({
  isLoading,
  products = [],
  onAddToCart,
  paginator = null,
  onPageChange,
}) {
  const navigate = useNavigate();

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
        {products.map((product) => (
          <div className="trace-card" key={product.product_id || product.id}>
            <Card
              className="category-product-card trace-card-inner product-card !h-full !rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300"
              onClick={() => {
                const id = product.product_id || product.id;
                if (!id) return;
                navigate(`/products/${id}`);
              }}
            >
              <div className="flex h-full min-h-[280px] flex-col">
                <div className="category-product-media product-image-wrap h-32 w-full bg-red-200">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.display_name || product.name || "Product"}
                      className="product-image-el h-full w-full object-cover"
                    />
                  ) : null}
                </div>

                <div className="product-card-content">
                  <h4 className="h-10 overflow-hidden text-sm font-semibold leading-5">
                    {product.display_name || product.name || "Product"}
                  </h4>

                  <div className="mt-1 h-6">
                    <p className="font-bold text-amber-600">
                      {"\u20B9"}{Number(product.discounted_price ?? product.price ?? 0).toLocaleString("en-IN")}
                    </p>
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

            <svg className="trace-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
              <rect className="trace-base" x="0.75" y="0.75" width="98.5" height="98.5" rx="4.1" ry="4.1" pathLength="100" />
              <rect className="trace-run" x="0.75" y="0.75" width="98.5" height="98.5" rx="4.1" ry="4.1" pathLength="100" />
            </svg>
          </div>
        ))}
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
