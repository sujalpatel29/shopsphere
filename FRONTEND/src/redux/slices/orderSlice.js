import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../api/api";

export const fetchOrders = createAsyncThunk(
  "order/fetchOrders",
  async ({ page = 1, limit = 5 } = {}) => {
    const res = await api.get(
      `/order/user-allorder?page=${page}&limit=${limit}`,
    );
    return res.data;
  },
);
export const postOrders = createAsyncThunk("order/makeOrder", async () => {
  const res = await api.post("order/make-order");
  return res.data.data;
});
export const findOrderItems = createAsyncThunk(
  "order/orderDetail",
  async ({ id, page = 1, limit = 5 } = {}) => {
    const res = await api.get(
      `/order-item/${id}/items?page=${page}&limit=${limit}`,
    );
    return res.data;
  },
);
export const fetchUserAddress= createAsyncThunk("order/fatchAdress",async()=>{
  const res= await api.get(`/users/show-addresses`);
 
  return res.data.data;
})
const initialState = {
  orders: [],
  userAddresses:[],
  orderItems: [],
  pagination: {
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 5,
  },
  itemPagination: {
    totalItems: 0,
    totalPages: 0,
    currentPage: 1,
    itemsPerPage: 5,
  },
  loading: false,
  error: null,
};
const orderSlice = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders = action.payload.data;

        state.pagination = action.payload.pagination;
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchUserAddress.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserAddress.fulfilled, (state, action) => {
        state.loading = false;
        state.userAddresses = action.payload;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUserAddress.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })

      .addCase(postOrders.pending, (state) => {
        state.loading = true;
      })
      .addCase(postOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.orders.push(action.payload);
      })

      .addCase(postOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(findOrderItems.pending, (state) => {
        state.loading = true;
      })
      .addCase(findOrderItems.fulfilled, (state, action) => {
        state.loading = false;
        state.orderItems = action.payload.data;
        state.itemPagination = action.payload.pagination;
      })
      .addCase(findOrderItems.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

export default orderSlice.reducer;
