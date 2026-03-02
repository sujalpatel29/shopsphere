/**
 * @module adminProductImagesApi
 * @description API layer for product image management (Cloudinary-backed).
 *
 * Handles upload, replace, and delete of product images via multipart/form-data.
 * Images are stored in Cloudinary; the backend returns Cloudinary URLs.
 * Consumed by ProductImagesPanel inside the product form modal.
 *
 * Endpoints used:
 *  - POST   /productImages/upload       → uploadProductImage (multipart)
 *  - GET    /productImages/:id          → fetchProductImages
 *  - PATCH  /productImages/update/:id   → updateProductImage (multipart)
 *  - DELETE /productImages/delete/:id   → deleteProductImage
 */
import api from "./api";

/**
 * Upload a product image (multipart/form-data).
 * @param {Object} params
 * @param {File}   params.file
 * @param {number} params.product_id
 * @param {string} params.image_level - "PRODUCT" or "MODIFIER"
 * @param {number} [params.modifier_portion_id]
 * @param {number} [params.is_primary] - 1 or 0
 */
export const uploadProductImage = async ({
  file,
  product_id,
  image_level,
  modifier_portion_id,
  is_primary = 0,
}) => {
  const formData = new FormData();
  formData.append("image", file);
  formData.append("product_id", product_id);
  formData.append("image_level", image_level);
  if (modifier_portion_id) {
    formData.append("modifier_portion_id", modifier_portion_id);
  }
  formData.append("is_primary", is_primary);

  const response = await api.post("/productImages/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Get all images for a product.
 * @param {number} productId
 */
export const fetchProductImages = async (productId) => {
  const response = await api.get(`/productImages/${productId}`);
  return response.data?.data || [];
};

/**
 * Replace an existing image file.
 * @param {number} imageId
 * @param {File}   file
 */
export const updateProductImage = async (imageId, file) => {
  const formData = new FormData();
  formData.append("image", file);
  const response = await api.patch(`/productImages/update/${imageId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

/**
 * Soft-delete an image (also cleans up Cloudinary).
 * @param {number} imageId
 */
export const deleteProductImage = async (imageId) => {
  const response = await api.delete(`/productImages/delete/${imageId}`);
  return response.data;
};
