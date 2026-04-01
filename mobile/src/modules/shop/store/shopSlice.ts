import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, Review, ProductService } from '../../../shared/services/product-service';
import { RootState } from '../../../reducers/root-reducer';
import { UserService, UserSummary } from '../../profile/services/user-service';

// ─── State ────────────────────────────────────────────────────────────────────
export interface EnrichedReview extends Review {
    resolvedName: string;   // "Harry Smith" or "User 8" fallback
    initials: string;       // "HS" or "U8"
}
 
interface ShopState {
    products: Product[];
    filteredProducts: Product[];
    selectedProduct: Product | null;
    reviews: EnrichedReview[];
    userMap: Record<number, UserSummary>;  // id → UserSummary, for fast lookup
    search: string;
    activeCategory: string;
    listStatus:   'idle' | 'loading' | 'succeeded' | 'failed';
    detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    reviewStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}
 
const initialState: ShopState = {
    products: [],
    filteredProducts: [],
    selectedProduct: null,
    reviews: [],
    userMap: {},
    search: '',
    activeCategory: 'All Items',
    listStatus:   'idle',
    detailStatus: 'idle',
    reviewStatus: 'idle',
    error: null,
};
 
// ─── Helpers ──────────────────────────────────────────────────────────────────
function buildUserMap(users: UserSummary[]): Record<number, UserSummary> {
    return users.reduce<Record<number, UserSummary>>((acc, u) => {
        acc[u.id] = u;
        return acc;
    }, {});
}
 
function enrichReviews(reviews: Review[], userMap: Record<number, UserSummary>): EnrichedReview[] {
    return reviews.map(r => {
        const user = userMap[r.userId];
        const resolvedName = user
            ? `${user.firstName} ${user.lastName}`.trim()
            : `User ${r.userId}`;
        const initials = user
            ? `${user.firstName[0] ?? ''}${user.lastName[0] ?? ''}`.toUpperCase()
            : `U${r.userId}`;
        return { ...r, resolvedName, initials };
    });
}
 
function applyFilters(products: Product[], search: string, category: string): Product[] {
    return products.filter(p => {
        const matchesSearch = search.trim()
            ? p.name?.toLowerCase().includes(search.toLowerCase())
            : true;
        const matchesCategory = category === 'All Items' ? true : false;
        return matchesSearch && matchesCategory;
    });
}
 
// ─── Thunks ───────────────────────────────────────────────────────────────────
export const fetchProducts = createAsyncThunk(
    'shop/fetchProducts',
    async (_, { rejectWithValue }) => {
        const data = await ProductService.getProducts();
        if (!data.length) return rejectWithValue('Failed to load products');
        return data;
    }
);
 
export const fetchProductById = createAsyncThunk(
    'shop/fetchProductById',
    async (productId: number, { rejectWithValue }) => {
        const data = await ProductService.getProductById(productId);
        if (!data) return rejectWithValue('Product not found');
        return data;
    }
);
 
// Fetches reviews + users in parallel, enriches reviews with real names
export const fetchProductReviews = createAsyncThunk(
    'shop/fetchProductReviews',
    async (productId: number, { rejectWithValue }) => {
        const [reviews, users] = await Promise.all([
            ProductService.getReviews(productId),
            UserService.getAll(),
        ]);
        const userMap = buildUserMap(users);
        const enriched = enrichReviews(reviews, userMap);
        return { enriched, userMap };
    }
);
 
// ─── Slice ────────────────────────────────────────────────────────────────────
const shopSlice = createSlice({
    name: 'shop',
    initialState,
    reducers: {
        setSearch(state, action: PayloadAction<string>) {
            state.search = action.payload;
            state.filteredProducts = applyFilters(state.products, action.payload, state.activeCategory);
        },
        setActiveCategory(state, action: PayloadAction<string>) {
            state.activeCategory = action.payload;
            state.filteredProducts = applyFilters(state.products, state.search, action.payload);
        },
        clearSelectedProduct(state) {
            state.selectedProduct = null;
            state.detailStatus = 'idle';
        },
        clearReviews(state) {
            state.reviews = [];
            state.reviewStatus = 'idle';
        },
    },
    extraReducers: (builder) => {
        builder
            // ── fetchProducts ──────────────────────────────────────────
            .addCase(fetchProducts.pending, (state) => {
                state.listStatus = 'loading';
                state.error = null;
            })
            .addCase(fetchProducts.fulfilled, (state, action) => {
                state.listStatus = 'succeeded';
                state.products = action.payload;
                state.filteredProducts = action.payload;
            })
            .addCase(fetchProducts.rejected, (state, action) => {
                state.listStatus = 'failed';
                state.error = action.payload as string;
            })
 
            // ── fetchProductById ───────────────────────────────────────
            .addCase(fetchProductById.pending, (state) => {
                state.detailStatus = 'loading';
                state.error = null;
            })
            .addCase(fetchProductById.fulfilled, (state, action) => {
                state.detailStatus = 'succeeded';
                state.selectedProduct = action.payload;
            })
            .addCase(fetchProductById.rejected, (state, action) => {
                state.detailStatus = 'failed';
                state.error = action.payload as string;
            })
 
            // ── fetchProductReviews ────────────────────────────────────
            .addCase(fetchProductReviews.pending, (state) => {
                state.reviewStatus = 'loading';
                state.error = null;
            })
            .addCase(fetchProductReviews.fulfilled, (state, action) => {
                state.reviewStatus = 'succeeded';
                state.reviews  = action.payload.enriched;
                state.userMap  = action.payload.userMap;
            })
            .addCase(fetchProductReviews.rejected, (state) => {
                state.reviewStatus = 'succeeded'; // empty is not a hard error
                state.reviews = [];
            });
    },
});
 
export const { setSearch, setActiveCategory, clearSelectedProduct, clearReviews } = shopSlice.actions;
 
// ─── Selectors ────────────────────────────────────────────────────────────────
export const selectFilteredProducts = (state: RootState) => state.shop.filteredProducts;
export const selectSelectedProduct  = (state: RootState) => state.shop.selectedProduct;
export const selectReviews          = (state: RootState) => state.shop.reviews;
export const selectUserMap          = (state: RootState) => state.shop.userMap as Record<number, UserSummary>;
export const selectListStatus       = (state: RootState) => state.shop.listStatus;
export const selectDetailStatus     = (state: RootState) => state.shop.detailStatus;
export const selectReviewStatus     = (state: RootState) => state.shop.reviewStatus;
export const selectShopError        = (state: RootState) => state.shop.error;
export const selectSearch           = (state: RootState) => state.shop.search;
export const selectActiveCategory   = (state: RootState) => state.shop.activeCategory;
 
export default shopSlice.reducer;