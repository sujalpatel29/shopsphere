import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
const normalizedBaseUrl = rawBaseUrl.replace(/\/api\/?$/, "");

const API = axios.create({
  baseURL: `${normalizedBaseUrl}/api`,
  withCredentials: true,
});

export const getAllProducts = (params = undefined, config = {}) =>
  params
    ? API.get("/products", { params, ...config })
    : API.get("/products", config);

export const getAllCategories = (config = {}) => API.get("/category/tree", config);

export const getCategoryWithChildren = (categoryId, config = {}) =>
  API.get(`/category/${categoryId}`, config);

export const getProductsByCategory = (categoryId, params = {}, config = {}) =>
  API.get(`/category/${categoryId}/products`, { params, ...config });

export const getProductsByCategories = (params = {}, config = {}) =>
  API.get("/category/bulk/products", { params, ...config });

export const getProductsByCategoryFilters = (params = {}, config = {}) =>
  API.post("/category/filter/products", params, config);

export const getCategoryProductsPriceRange = (params = {}, config = {}) =>
  API.post("/category/filter/products/price-range", params, config);

export const searchCategoriesByName = (params = {}, config = {}) =>
  API.get("/category", { params, ...config });

export const getProductRatingSummary = (productId, config = {}) =>
  API.get(`/review/product/${productId}/summary`, config);

export const getProductRatingSummariesBulk = (productIds = [], config = {}) =>
  API.post("/review/product/summary/bulk", { product_ids: productIds }, config);

export const getBestSellers = (limit = 8, config = {}) =>
  API.get("/products/bestsellers", { params: { limit }, ...config });
