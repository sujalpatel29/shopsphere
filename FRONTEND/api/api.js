import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true, // important for refresh cookies
});

//  Attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

//  Handle 401 & Refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("login-user") &&
      !originalRequest.url.includes("create-user") &&
      !originalRequest.url.includes("refresh-token")
    ) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("Refresh token missing");
        }

        const res = await api.post("/users/refresh-token", { refreshToken });

        const newAccessToken =
          res?.data?.data?.accessToken || res?.data?.accessToken;
        if (!newAccessToken) {
          throw new Error("Access token refresh failed");
        }

        localStorage.setItem("token", newAccessToken);

        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization =
          "Bearer " + newAccessToken;

        return api(originalRequest);
      } catch (refreshError) {
        //  Refresh failed → logout
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("currentUser");

        window.location.href = "/login";

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
