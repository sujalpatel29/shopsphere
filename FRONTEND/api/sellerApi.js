import api from "./api";

export const applyToBeSeller = (data) => api.post("/sellers/apply", data);

export const getMySellerProfile = () => api.get("/sellers/profile");

export const updateMySellerProfile = (data) => api.put("/sellers/profile", data);

export const getSellerAnalytics = () => api.get("/sellers/analytics");

export const getSellerOrders = (params) => api.get("/sellers/orders", { params });

export const getSellerOrderDetail = (orderId) => api.get(`/sellers/orders/${orderId}`);

export const getAllSellers = (params) => api.get("/sellers/admin/sellers", { params });

export const getSellerById = (sellerId) => api.get(`/sellers/admin/sellers/${sellerId}`);

export const verifySeller = (sellerId, status) => api.put(`/sellers/admin/sellers/${sellerId}/verify`, { status });

export const blockSeller = (sellerId, is_blocked) => api.put(`/sellers/admin/sellers/${sellerId}/block`, { is_blocked });
