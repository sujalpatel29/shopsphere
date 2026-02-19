import { createContext, useContext, useMemo, useState } from "react";
import api from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("currentUser");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const login = async (email, password) => {
    try {
      const response = await api.post(
        "/users/login-user",
        {
          email,
          password,
        },
      );

      const payload = response.data?.data || {};
      const { token, refreshToken } = payload;
      const rawUser = payload.user || response.data?.user || {};

      const mappedUser = {
        user_id: rawUser.user_id ?? rawUser.id ?? null,
        email: rawUser.email ?? email,
        role:
          rawUser.role ?? rawUser.role_name ?? rawUser.roleName ?? "customer",
      };

      if (token) localStorage.setItem("token", token);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

      localStorage.setItem("currentUser", JSON.stringify(mappedUser));
      setCurrentUser(mappedUser);

      return { ok: true, user: mappedUser };
    } catch (error) {
      return {
        ok: false,
        message: error.response?.data?.message || "Server error",
      };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("currentUser");
  };

  const register = async (email, password, name) => {
    try {
      const { data } = await api.post(
        "/users/create-user",
        {
          name,
          email,
          password,
        },
      );

      return {
        ok: true,
        message: data.message, //  success message
        userId: data.data?.userId, // optional
      };
    } catch (error) {
      return {
        ok: false,
        message: error.response?.data?.message || "Server error",
      };
    }
  };

  const value = useMemo(
    () => ({
      currentUser,
      isAuthenticated: Boolean(currentUser),
      login,
      register,
      logout,
    }),
    [currentUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}
