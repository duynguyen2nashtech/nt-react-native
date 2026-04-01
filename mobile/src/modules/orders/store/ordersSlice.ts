import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { TokenService } from '../../../shared/services/token-service';

const BASE_URL = 'http://10.0.2.2:3000';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface OrderItem {
    productId: number;
    quantity:  number;
    price:     number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface Order {
    id:              number;
    userId:          number;
    items:           OrderItem[];
    totalAmount:     number;
    shippingAddress: string;
    paymentMethod:   string;
    status:          OrderStatus;
    createdAt:       string;
    updatedAt:       string;
}

interface OrderState {
    orders:    Order[];
    isLoading: boolean;
    error:     string | null;
}

const initialState: OrderState = {
    orders:    [],
    isLoading: false,
    error:     null,
};

// ── Thunk ─────────────────────────────────────────────────────────────────────

export const fetchOrders = createAsyncThunk<Order[], void, { rejectValue: string }>(
    'orders/fetchAll',
    async (_, { rejectWithValue }) => {
        try {
            const token = await TokenService.getToken();

            const response = await fetch(`${BASE_URL}/order`, {
                method:  'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization:  `Bearer ${token}`,
                },
            });

            const rawText = await response.text();
            const result  = JSON.parse(rawText);

            if (!response.ok || !result.status) {
                return rejectWithValue(result.message ?? 'Failed to fetch orders');
            }

            return result.data as Order[];
        } catch (e) {
            return rejectWithValue('Network error. Please check your connection.');
        }
    },
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const orderSlice = createSlice({
    name: 'orders',
    initialState,
    reducers: {
        clearOrders(state) {
            state.orders    = [];
            state.error     = null;
            state.isLoading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrders.pending, (state) => {
                state.isLoading = true;
                state.error     = null;
            })
            .addCase(fetchOrders.fulfilled, (state, action: PayloadAction<Order[]>) => {
                state.isLoading = false;
                state.orders    = action.payload;
            })
            .addCase(fetchOrders.rejected, (state, action) => {
                state.isLoading = false;
                state.error     = action.payload ?? 'Unknown error';
            });
    },
});

export const { clearOrders } = orderSlice.actions;
export default orderSlice.reducer;