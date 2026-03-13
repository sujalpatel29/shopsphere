import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  itemCount: 0,
  cartId: null,
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartCount: (state, action) => {
      state.itemCount = action.payload;
    },
    incrementCart: (state) => {
      state.itemCount += 1;
    },
    decrementCart: (state) => {
      state.itemCount = Math.max(0, state.itemCount - 1);
    },
    clearCart: (state) => {
      state.itemCount = 0;
      state.cartId = null;
    },
    setCartId: (state, action) => {
      state.cartId = action.payload;
    },
  },
});

export const { setCartCount, incrementCart, decrementCart, clearCart, setCartId } = cartSlice.actions;
export default cartSlice.reducer;
