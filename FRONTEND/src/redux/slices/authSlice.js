// src/redux/authSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

//  Get user from localStorage
const storedUser = localStorage.getItem("currentUser");
const storedToken = localStorage.getItem("token");
const storedRefreshToken = localStorage.getItem("refreshToken");

//  LOGIN
export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await api.post("/users/login-user", {
        email,
        password,
      });

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

      return mappedUser;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Server error"
      );
    }
  }
);

//  REGISTER
export const registerUser = createAsyncThunk(
  "auth/registerUser",
  async ({ name, email, password }, { rejectWithValue }) => {
    try {
      const { data } = await api.post("/users/create-user", {
        name,
        email,
        password,
      });

      return data;
    } catch (error) {
      const data = error.response?.data;
      const validationMsg =
        data?.errors?.[0]?.msg || data?.errors?.[0]?.message;
      return rejectWithValue(validationMsg || data?.message || "Server error");
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState: {
    currentUser: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    refreshToken: storedRefreshToken || null,
    loading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.currentUser = null;
      state.token = null;
      state.refreshToken = null;
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("currentUser");
    },
  },
  extraReducers: (builder) => {
    builder
      // LOGIN
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.currentUser = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // REGISTER
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state) => {
        state.loading = false;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;