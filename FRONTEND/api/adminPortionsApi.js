/**
 * @module adminPortionsApi
 * @description API layer for admin portion management.
 *
 * Handles both standalone portion CRUD (portion_master) and product-portion
 * association CRUD (product_portion). Consumed by AdminPortionsTab and
 * ProductPortionsPanel inside the product form modal.
 *
 * Endpoints used:
 *  - GET    /portion/getAllPortion          → fetchPortions
 *  - POST   /portion/createPortion         → createPortion
 *  - PUT    /portion/updatePortion/:id     → updatePortion
 *  - PATCH  /portion/toggleActivePortion/:id → togglePortionStatus
 *  - DELETE /portion/deletePortion/:id     → deletePortion
 *  - GET    /portion/getProductPortions/:id → fetchProductPortions
 *  - POST   /portion/createProductPortion  → createProductPortion
 *  - PUT    /portion/updateProductPortion/:id → updateProductPortion
 *  - DELETE /portion/deleteProductPortion/:id → deleteProductPortion
 */
import api from "./api";

/**
 * Fetch all portions
 * @returns {Promise<Array>}
 */
export const fetchPortions = async () => {
  const response = await api.get("/portion/getAllPortion");
  return response.data?.data || [];
};

/**
 * Create a new portion
 * @param {Object} data - { portion_value, description, is_active }
 * @returns {Promise<Object>}
 */
export const createPortion = async (data) => {
  const response = await api.post("/portion/createPortion", data);
  return response.data;
};

/**
 * Update an existing portion
 * @param {number|string} id - Portion ID
 * @param {Object} data - Updated portion data
 * @returns {Promise<Object>}
 */
export const updatePortion = async (id, data) => {
  const response = await api.put(`/portion/updatePortion/${id}`, data);
  return response.data;
};

/**
 * Toggle portion active status
 * @param {number|string} id - Portion ID
 * @returns {Promise<Object>}
 */
export const togglePortionStatus = async (id) => {
  const response = await api.patch(`/portion/toggleActivePortion/${id}`);
  return response.data;
};

/**
 * Delete a portion (soft delete)
 * @param {number|string} id - Portion ID
 * @returns {Promise<Object>}
 */
export const deletePortion = async (id) => {
  const response = await api.delete(`/portion/deletePortion/${id}`);
  return response.data;
};

// ===== Product-Portion Associations =====

/**
 * Get all portions assigned to a product
 * @param {number|string} productId
 * @returns {Promise<Array>}
 */
export const fetchProductPortions = async (productId) => {
  const response = await api.get(`/portion/getProductPortions/${productId}`);
  return response.data?.data || [];
};

/**
 * Assign a portion to a product
 * @param {Object} data - { product_id, portion_id, price, discounted_price?, stock? }
 * @returns {Promise<Object>}
 */
export const createProductPortion = async (data) => {
  const response = await api.post("/portion/createProductPortion", data);
  return response.data;
};

/**
 * Update a product-portion association
 * @param {number|string} id - product_portion_id
 * @param {Object} data - { price?, discounted_price?, stock?, is_active? }
 * @returns {Promise<Object>}
 */
export const updateProductPortion = async (id, data) => {
  const response = await api.put(`/portion/updateProductPortion/${id}`, data);
  return response.data;
};

/**
 * Delete a product-portion association
 * @param {number|string} id - product_portion_id
 * @returns {Promise<Object>}
 */
export const deleteProductPortion = async (id) => {
  const response = await api.delete(`/portion/deleteProductPortion/${id}`);
  return response.data;
};
