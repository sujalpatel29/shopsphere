import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice.js";
import orderReducer from "./slices/orderSlice.js";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    order: orderReducer,
  },
});
export default store;