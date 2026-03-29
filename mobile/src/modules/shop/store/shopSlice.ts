import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Product, ProductService } from '../../../shared/services/product-service';
import { RootState } from '../../../reducers/root-reducer';

interface ShopState {
    products: Product[];
    filteredProducts: Product[];
    selectedProduct: Product | null;
    search: string;
    activeCategory: string;
    listStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    detailStatus: 'idle' | 'loading' | 'succeeded' | 'failed';
    error: string | null;
}

const initialState: ShopState = {
    products: [],
    filteredProducts: [],
    selectedProduct: null,
    search: '',
    activeCategory: 'All Items',
    listStatus: 'idle',
    detailStatus: 'idle',
    error: null,
};

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

function applyFilters(products: Product[], search: string, category: string): Product[] {
    return products.filter((p) => {
        const matchesSearch = search.trim()
            ? p.name?.toLowerCase().includes(search.toLowerCase())
            : true;
        const matchesCategory = category === 'All Items' ? true : false
        return matchesSearch && matchesCategory;
    });
}

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
    },
    extraReducers: (builder) => {
        builder
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
            });
    },
});

export const { setSearch, setActiveCategory, clearSelectedProduct } = shopSlice.actions;

export const selectFilteredProducts = (state: RootState) => state.shop.filteredProducts;
export const selectSelectedProduct  = (state: RootState) => state.shop.selectedProduct;
export const selectListStatus       = (state: RootState) => state.shop.listStatus;
export const selectDetailStatus     = (state: RootState) => state.shop.detailStatus;
export const selectShopError        = (state: RootState) => state.shop.error;
export const selectSearch           = (state: RootState) => state.shop.search;
export const selectActiveCategory   = (state: RootState) => state.shop.activeCategory;

export default shopSlice.reducer;