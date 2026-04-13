import api from "./api";

const unwrapData = (response) => response?.data?.data;

export const fetchSalesPrediction = async (productId) => {
  const response = await api.get(`/admin/sales/predict/${productId}`);
  return unwrapData(response);
};

export const fetchAllSalesPredictions = async () => {
  const response = await api.get("/admin/sales/predict-all");
  return unwrapData(response);
};

export const fetchCachedSalesPredictions = async () => {
  const response = await api.get("/admin/sales/cached");
  return unwrapData(response) || { count: 0, items: [] };
};

export const fetchSalesHistory = async (productId) => {
  const response = await api.get(`/admin/sales/history/${productId}`);
  return unwrapData(response) || [];
};
