// src/modules/cart/store/cartSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, ProductService } from '../../../services/productService';
import { RootState } from '../../../store/rootReducer';

export interface CartItem {
    product: Product;
    quantity: number;
}

interface CartState {
    items: CartItem[];
    status: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: CartState = {
    items: [],
    status: 'idle',
    error: null,
};

export const addToCartAsync = createAsyncThunk(
    'cart/addToCart',
    async ({ product, quantity }: { product: Product; quantity: number }, { rejectWithValue }) => {
        const ok = await ProductService.addToCart(product.id, quantity);
        if (!ok) return rejectWithValue('Failed to add to cart');
        return { product, quantity };
    }
);

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        removeItem(state, action: PayloadAction<number>) {
            state.items = state.items.filter((i) => i.product.id !== action.payload);
        },
        updateQuantity(state, action: PayloadAction<{ productId: number; quantity: number }>) {
            const item = state.items.find((i) => i.product.id === action.payload.productId);
            if (item) item.quantity = Math.max(1, action.payload.quantity);
        },
        clearCart(state) {
            state.items = [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(addToCartAsync.pending, (state) => {
                state.status = 'loading';
            })
            .addCase(addToCartAsync.fulfilled, (state, action) => {
                state.status = 'succeeded';
                const existing = state.items.find((i) => i.product.id === action.payload.product.id);
                if (existing) {
                    existing.quantity += action.payload.quantity;
                } else {
                    state.items.push(action.payload);
                }
            })
            .addCase(addToCartAsync.rejected, (state, action) => {
                state.status = 'failed';
                state.error = action.payload as string;
            });
    },
});

export const { removeItem, updateQuantity, clearCart } = cartSlice.actions;

export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartCount = (state: RootState) => state.cart.items.reduce((sum, i) => sum + i.quantity, 0);
export const selectCartTotal = (state: RootState) => state.cart.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

export default cartSlice.reducer;