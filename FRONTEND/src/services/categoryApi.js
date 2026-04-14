import axios from "axios";

const rawBaseUrl = import.meta.env.VITE_BASE_URL || "http://localhost:3000";
const normalizedBaseUrl = rawBaseUrl.replace(/\/api\/?$/, "");

const API = axios.create({
  baseURL: `${normalizedBaseUrl}/api`,
  withCredentials: true,
});

export const getAllProducts = (params = undefined) =>
  params ? API.get("/products", { params }) : API.get("/products");

export const getAllCategories = () => API.get("/category/tree");

export const getCategoryWithChildren = (categoryId) =>
  API.get(`/category/${categoryId}`);

export const getProductsByCategory = (categoryId, params = {}) =>
  API.get(`/category/${categoryId}/products`, { params });

export const getProductsByCategories = (params = {}) =>
  API.get("/category/bulk/products", { params });

export const getProductsByCategoryFilters = (params = {}) =>
  API.post("/category/filter/products", params);

export const getCategoryProductsPriceRange = (params = {}) =>
  API.post("/category/filter/products/price-range", params);

export const searchCategoriesByName = (params = {}) =>
  API.get("/category", { params });

export const getProductRatingSummary = (productId) =>
  API.get(`/review/product/${productId}/summary`);

export const getProductRatingSummariesBulk = (productIds = []) =>
  API.post("/review/product/summary/bulk", { product_ids: productIds });

export const getBestSellers = (limit = 8) =>
  API.get("/products/bestsellers", { params: { limit } });
