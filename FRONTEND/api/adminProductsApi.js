/**
 * @module adminProductsApi
 * @description API layer for admin product management.
 *
 * Wraps axios calls to the product, product-status, and category endpoints.
 * Consumed by AdminProductsTab and ProductFormModal on the admin dashboard.
 *
 * Endpoints used:
 *  - GET    /products          → fetchAdminProducts (paginated, sorted, filtered)
 *  - POST   /products          → createAdminProduct
 *  - PUT    /products/:id      → updateAdminProduct
 *  - PATCH  /products/:id/status → updateProductStatus (toggle active)
 *  - DELETE /products/:id      → deleteAdminProduct
 *  - GET    /category          → fetchCategories (for dropdown)
 *
 * Uses the shared `api` axios instance (with baseURL and auth interceptors).
 */
import api from "./api";

/**
 * Fetch products with server-side pagination, sorting, and filtering
 * @param {Object} params - Query parameters
 * @param {number} params.page - Current page number (1-indexed)
 * @param {number} params.limit - Number of records per page
 * @param {string} params.search - Optional search term for product name
 * @param {string} params.sortField - Optional field to sort by
 * @param {number} params.sortOrder - Sort order (1 = asc, -1 = desc)
 * @param {boolean|null} params.isActive - Filter by active status (null = all)
 * @returns {Promise<{data: Array, total: number}>}
 */
export const fetchAdminProducts = async ({
  page = 1,
  limit = 10,
  search = "",
  sortField = "",
  sortOrder = 1,
  isActive = null,
} = {}) => {
  const params = new URLSearchParams();
  params.append("page", page);
  params.append("limit", limit);

  if (search) {
    params.append("search", search);
  }

  if (sortField) {
    params.append("sortField", sortField);
    params.append("sortOrder", sortOrder === 1 ? "asc" : "desc");
  }

  if (isActive !== null && isActive !== undefined) {
    params.append("is_active", isActive ? 1 : 0);
  }

  const response = await api.get(`/products?${params.toString()}`);

  return {
    data: response.data?.data || [],
    total: response.data?.pagination?.totalItems || 0,
    totalAll: response.data?.stats?.totalAll ?? 0,
    totalActive: response.data?.stats?.totalActive ?? 0,
  };
};

/**
 * Create a new product
 * @param {Object} data - Product data
 * @returns {Promise<Object>}
 */
export const createAdminProduct = async (data) => {
  const response = await api.post("/products", data);
  return response.data;
};

/**
 * Update an existing product
 * @param {number|string} id - Product ID
 * @param {Object} data - Updated product data
 * @returns {Promise<Object>}
 */
export const updateAdminProduct = async (id, data) => {
  const response = await api.put(`/products/${id}`, data);
  return response.data;
};

/**
 * Quick update product status (active/inactive)
 * @param {number|string} id - Product ID
 * @param {boolean} isActive - New active status
 * @returns {Promise<Object>}
 */
export const updateProductStatus = async (id, isActive) => {
  const response = await api.patch(`/products/${id}/status`, {
    is_active: isActive ? 1 : 0,
  });
  return response.data;
};

/**
 * Delete a product
 * @param {number|string} id - Product ID
 * @returns {Promise<Object>}
 */
export const deleteAdminProduct = async (id) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

/**
 * Fetch all categories for dropdown
 * @returns {Promise<Array>}
 */
export const fetchCategories = async () => {
  const response = await api.get("/category");
  const data = response.data?.data;
  return data?.items || data || [];
};
