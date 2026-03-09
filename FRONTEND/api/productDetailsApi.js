import api from "./api";

export const getProductById = async (productId) => {
  const response = await api.get(`/products/${productId}`);
  return response.data?.data || null;
};

export const getProductImages = async (productId) => {
  const response = await api.get(`/productImages/${productId}`);
  return response.data?.data || [];
};

export const getProductPortions = async (productId) => {
  const response = await api.get(`/portion/getProductPortions/${productId}`);
  return response.data?.data || [];
};

export const getModifiersByPortion = async (productPortionId) => {
  const response = await api.get(`/modifiers/by-portion/${productPortionId}`);
  return response.data?.data || [];
};

export const getModifiersByProduct = async (productId) => {
  const response = await api.get(`/modifiers/by-product/${productId}`);
  return response.data?.data || [];
};

export const getReviewSummary = async (productId) => {
  const response = await api.get(`/review/product/${productId}/summary`);
  return response.data?.data || null;
};

export const getReviews = async (
  productId,
  { page = 1, limit = 5, sort = "newest" } = {}
) => {
  const response = await api.get(`/review/product/${productId}`, {
    params: { page, limit, sort },
  });
  return response.data?.data || { items: [], total: 0, total_pages: 1, page, limit };
};

export const toggleReviewHelpful = async (reviewId) => {
  const response = await api.patch(`/review/${reviewId}/helpful`);
  return response.data?.data || null;
};

export const getActiveOffers = async () => {
  const response = await api.get("/offer/active");
  return response.data?.data || [];
};

export const getCategories = async () => {
  const response = await api.get("/category");
  return response.data?.data?.items || [];
};

export const getRelatedProducts = async ({ categoryId, excludeId, limit = 12 }) => {
  const response = await api.get("/products", {
    params: {
      category_id: categoryId,
      page: 1,
      limit,
      is_active: 1,
    },
  });

  const all = response.data?.data || [];
  return all.filter((item) => Number(item.product_id) !== Number(excludeId));
};

export const getCart = async () => {
  const response = await api.get("/cart");
  return response.data?.data || null;
};

export const addCartItem = async ({ productId, quantity, portionId, modifierId }) => {
  const response = await api.post("/cart/items", {
    productId,
    quantity,
    portionId,
    modifierId,
  });
  return response.data?.data || null;
};
