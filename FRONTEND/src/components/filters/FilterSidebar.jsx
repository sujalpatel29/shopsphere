import { useState } from "react";
import { ChevronDown, SlidersHorizontal, X, RotateCcw } from "lucide-react";
import { Button } from "primereact/button";
import { Checkbox } from "primereact/checkbox";
import { Dropdown } from "primereact/dropdown";
import { Slider } from "primereact/slider";

const sortOptions = [
  { label: "Featured", value: "featured" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Name: A-Z", value: "name-asc" },
];

function FilterSidebar({
  categories,
  productCounts,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceChange,
  priceMax,
  sortBy,
  onSortByChange,
  inStockOnly,
  onInStockOnlyChange,
  onResetFilters,
  className = "",
  onClose,
}) {
  const [openSection, setOpenSection] = useState({
    category: true,
    price: true,
    stock: true,
    sort: true,
  });

  const toggleSection = (key) => {
    setOpenSection((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside
      className={`h-fit rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-[#1f2933] dark:bg-[#151e22] ${className}`}
    >
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#2f7a6f]/10 text-[#2f7a6f] dark:bg-[#2f7a6f]/20">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <h2 className="font-serif text-xl font-medium text-gray-900 dark:text-slate-100">
            Filters
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={onResetFilters}
            className="hidden lg:flex !h-8 !w-8 !items-center !justify-center !rounded-lg !border !border-gray-200 !bg-transparent !p-0 !text-gray-500 hover:!bg-gray-50 hover:!text-gray-900 dark:!border-slate-700 dark:!text-slate-400 dark:hover:!bg-slate-800 dark:hover:!text-slate-200"
            aria-label="Reset filters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          {onClose && (
            <Button
              type="button"
              onClick={onClose}
              className="lg:hidden !h-8 !w-8 !rounded-lg !border !border-gray-200 !bg-transparent !p-0 !text-gray-500 hover:!bg-gray-50 hover:!text-gray-900 dark:!border-slate-700 dark:!text-slate-400 dark:hover:!bg-slate-800 dark:hover:!text-slate-200"
              aria-label="Close filters"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {/* Category Section */}
        <section>
          <Button
            type="button"
            onClick={() => toggleSection("category")}
            className="group !flex !w-full !items-center !justify-between !bg-transparent !p-0 !text-sm !font-bold !uppercase !tracking-wider !text-gray-900 !transition-colors !duration-300 hover:!bg-transparent hover:!text-[#2f7a6f] dark:!text-slate-100 dark:hover:!text-[#2f7a6f]"
          >
            Category
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-300 group-hover:text-[#2f7a6f] ${openSection.category ? "rotate-180" : ""}`}
            />
          </Button>
          {openSection.category && (
            <div className="mt-4 space-y-1">
              <Button
                type="button"
                onClick={() => onCategoryChange(null)}
                className={`!flex !w-full !items-center !justify-between !rounded-lg !px-3 !py-2.5 !text-left !text-sm !transition-all !duration-200 ${
                  selectedCategory === null
                    ? "!bg-[#2f7a6f] !font-medium !text-white !shadow-md !shadow-[#2f7a6f]/20"
                    : "!bg-transparent !text-gray-600 hover:!bg-gray-50 hover:!text-[#2f7a6f] dark:!text-slate-400 dark:hover:!bg-slate-800 dark:hover:!text-[#2f7a6f]"
                }`}
              >
                <span>All Categories</span>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs ${selectedCategory === null ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-500"}`}
                >
                  {productCounts.all}
                </span>
              </Button>
              {categories.map((category) => (
                <Button
                  key={category.category_id}
                  type="button"
                  onClick={() => onCategoryChange(category.category_id)}
                  className={`!flex !w-full !items-center !justify-between !rounded-lg !px-3 !py-2.5 !text-left !text-sm !transition-all !duration-200 ${
                    selectedCategory === category.category_id
                      ? "!bg-[#2f7a6f] !font-medium !text-white !shadow-md !shadow-[#2f7a6f]/20"
                      : "!bg-transparent !text-gray-600 hover:!bg-gray-50 hover:!text-[#2f7a6f] dark:!text-slate-400 dark:hover:!bg-slate-800 dark:hover:!text-[#2f7a6f]"
                  }`}
                >
                  <span>{category.category_name}</span>
                  <span
                    className={`rounded-md px-2 py-0.5 text-xs ${selectedCategory === category.category_id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500 dark:bg-slate-800 dark:text-slate-500"}`}
                  >
                    {productCounts[category.category_id] || 0}
                  </span>
                </Button>
              ))}
            </div>
          )}
        </section>

        {/* Separator */}
        <div className="h-px w-full bg-gray-100 dark:bg-slate-800"></div>

        {/* Price Section */}
        <section>
          <Button
            type="button"
            onClick={() => toggleSection("price")}
            className="group !flex !w-full !items-center !justify-between !bg-transparent !p-0 !text-sm !font-bold !uppercase !tracking-wider !text-gray-900 !transition-colors !duration-300 hover:!bg-transparent hover:!text-[#2f7a6f] dark:!text-slate-100 dark:hover:!text-[#2f7a6f]"
          >
            Price Range
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-300 group-hover:text-[#2f7a6f] ${openSection.price ? "rotate-180" : ""}`}
            />
          </Button>
          {openSection.price && (
            <div className="mt-6 px-1">
              <Slider
                value={priceRange}
                onChange={(event) => onPriceChange(event.value)}
                range
                min={0}
                max={priceMax}
                className="w-full"
              />
              <div className="mt-4 flex items-center justify-between text-sm">
                <span className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1 font-accent font-medium text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  ${priceRange[0].toLocaleString()}
                </span>
                <span className="text-gray-400">-</span>
                <span className="rounded-md border border-gray-200 bg-gray-50 px-3 py-1 font-accent font-medium text-gray-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  ${priceRange[1].toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </section>

        {/* Separator */}
        <div className="h-px w-full bg-gray-100 dark:bg-slate-800"></div>

        {/* Availability Section */}
        <section>
          <Button
            type="button"
            onClick={() => toggleSection("stock")}
            className="group !flex !w-full !items-center !justify-between !bg-transparent !p-0 !text-sm !font-bold !uppercase !tracking-wider !text-gray-900 !transition-colors !duration-300 hover:!bg-transparent hover:!text-[#2f7a6f] dark:!text-slate-100 dark:hover:!text-[#2f7a6f]"
          >
            Availability
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-300 group-hover:text-[#2f7a6f] ${openSection.stock ? "rotate-180" : ""}`}
            />
          </Button>
          {openSection.stock && (
            <div className="mt-4">
              <div className="flex items-center">
                <Checkbox
                  inputId="inStockOnly"
                  checked={inStockOnly}
                  onChange={(event) =>
                    onInStockOnlyChange(Boolean(event.checked))
                  }
                  className="mr-3"
                  pt={{
                    box: ({ props }) => ({
                      className: props.checked
                        ? "!bg-[#2f7a6f] !border-[#2f7a6f]"
                        : "!border-gray-300 dark:!border-slate-600",
                    }),
                  }}
                />
                <label
                  htmlFor="inStockOnly"
                  className="cursor-pointer text-sm font-medium text-gray-700 hover:text-[#2f7a6f] dark:text-slate-300 dark:hover:text-[#2f7a6f]"
                >
                  In stock only
                </label>
              </div>
            </div>
          )}
        </section>

        {/* Separator */}
        <div className="h-px w-full bg-gray-100 dark:bg-slate-800"></div>

        {/* Sort Section */}
        <section>
          <Button
            type="button"
            onClick={() => toggleSection("sort")}
            className="group !flex !w-full !items-center !justify-between !bg-transparent !p-0 !text-sm !font-bold !uppercase !tracking-wider !text-gray-900 !transition-colors !duration-300 hover:!bg-transparent hover:!text-[#2f7a6f] dark:!text-slate-100 dark:hover:!text-[#2f7a6f]"
          >
            Sort By
            <ChevronDown
              className={`h-4 w-4 text-gray-400 transition-transform duration-300 group-hover:text-[#2f7a6f] ${openSection.sort ? "rotate-180" : ""}`}
            />
          </Button>
          {openSection.sort && (
            <Dropdown
              value={sortBy}
              options={sortOptions}
              optionLabel="label"
              optionValue="value"
              onChange={(event) => onSortByChange(event.value)}
              className="mt-4 w-full !border-gray-200 !text-sm !shadow-none hover:!border-[#2f7a6f] focus:!border-[#2f7a6f] focus:!shadow-[0_0_0_2px_rgba(47,122,111,0.2)] dark:!border-slate-700 dark:!bg-slate-800 dark:!text-slate-200"
              pt={{
                item: { className: "text-sm" },
              }}
            />
          )}
        </section>
      </div>

      {/* Footer (Mobile only) */}
      <div className="mt-8 lg:hidden border-t border-gray-100 pt-4 dark:border-slate-800">
        <Button
          type="button"
          onClick={onResetFilters}
          className="!flex !w-full !items-center !justify-center !gap-2 !rounded-lg !border !border-gray-200 !bg-gray-50 !py-2.5 !text-sm !font-medium !text-gray-700 !shadow-none !transition-colors hover:!border-[#2f7a6f]/30 hover:!bg-[#2f7a6f]/5 hover:!text-[#2f7a6f] dark:!border-slate-700 dark:!bg-slate-800 dark:!text-slate-300 dark:hover:!border-slate-600 dark:hover:!bg-slate-700"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Filters
        </Button>
      </div>
    </aside>
  );
}

export default FilterSidebar;
