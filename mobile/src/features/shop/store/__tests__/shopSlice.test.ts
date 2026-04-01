/**
 * Tests for shopSlice
 * Location: src/modules/shop/store/__tests__/shopSlice.test.ts
 *
 * Run: npx jest shopSlice.test.ts
 */

import { configureStore } from '@reduxjs/toolkit';
import shopReducer, {
    fetchProducts,
    fetchProductById,
    setSearch,
    clearSelectedProduct,
    selectFilteredProducts,
    selectSelectedProduct,
    selectListStatus,
    selectDetailStatus,
    selectShopError,
    selectSearch,
} from '../shopSlice';
import { ProductService } from '../../../../services/productService';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../../../services/productService');

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeStore() {
    return configureStore({ reducer: { shop: shopReducer } });
}

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockProduct = {
    id: 1,
    name: 'Microsoft Sculpt Ergonomic Keyboard',
    description: 'Best budget ergonomic keyboard for coding.',
    image: 'https://example.com/image.jpg',
    price: 80.95,
    priceUnit: 'dollar',
    createdAt: '2023-05-12T10:44:52.624Z',
    updatedAt: '2026-03-26T04:36:10.127Z',
};

const mockProduct2 = {
    id: 2,
    name: 'Logitech MK345 Wireless Keyboard',
    description: 'Best mechanical keyboard for coding.',
    image: 'https://example.com/image2.jpg',
    price: 39.99,
    priceUnit: 'dollar',
    createdAt: '2023-05-12T10:47:59.546Z',
    updatedAt: '2026-03-26T04:37:46.629Z',
};

// ── Initial state ─────────────────────────────────────────────────────────────

describe('shopSlice — initial state', () => {
    it('has correct initial state', () => {
        const store = makeStore();
        const state = store.getState().shop;

        expect(state.products).toEqual([]);
        expect(state.filteredProducts).toEqual([]);
        expect(state.selectedProduct).toBeNull();
        expect(state.search).toBe('');
        expect(state.listStatus).toBe('idle');
        expect(state.detailStatus).toBe('idle');
        expect(state.error).toBeNull();
    });
});

// ── Reducers ──────────────────────────────────────────────────────────────────

describe('shopSlice — reducers', () => {

    it('setSearch filters products by name', () => {
        const store = makeStore();
        // Manually seed products via fulfilled
        (ProductService.getProducts as jest.Mock).mockResolvedValue([mockProduct, mockProduct2]);

        store.dispatch(fetchProducts()).then(() => {
            store.dispatch(setSearch('microsoft'));
            const filtered = selectFilteredProducts(store.getState() as any);
            expect(filtered).toHaveLength(1);
            expect(filtered[0].name).toContain('Microsoft');
        });
    });

    it('setSearch is case insensitive', () => {
        const store = makeStore();
        (ProductService.getProducts as jest.Mock).mockResolvedValue([mockProduct, mockProduct2]);

        store.dispatch(fetchProducts()).then(() => {
            store.dispatch(setSearch('LOGITECH'));
            const filtered = selectFilteredProducts(store.getState() as any);
            expect(filtered).toHaveLength(1);
            expect(filtered[0].name).toContain('Logitech');
        });
    });

    it('setSearch with empty string returns all products', () => {
        const store = makeStore();
        (ProductService.getProducts as jest.Mock).mockResolvedValue([mockProduct, mockProduct2]);

        store.dispatch(fetchProducts()).then(() => {
            store.dispatch(setSearch('microsoft'));
            store.dispatch(setSearch(''));
            const filtered = selectFilteredProducts(store.getState() as any);
            expect(filtered).toHaveLength(2);
        });
    });

    it('clearSelectedProduct resets selectedProduct and detailStatus', () => {
        const store = makeStore();
        (ProductService.getProductById as jest.Mock).mockResolvedValue(mockProduct);

        store.dispatch(fetchProductById(1)).then(() => {
            expect(selectSelectedProduct(store.getState() as any)).not.toBeNull();

            store.dispatch(clearSelectedProduct());
            expect(selectSelectedProduct(store.getState() as any)).toBeNull();
            expect(selectDetailStatus(store.getState() as any)).toBe('idle');
        });
    });
});

// ── fetchProducts thunk ───────────────────────────────────────────────────────

describe('shopSlice — fetchProducts', () => {

    it('sets listStatus to loading while pending', () => {
        const store = makeStore();
        (ProductService.getProducts as jest.Mock).mockReturnValue(new Promise(() => {}));

        store.dispatch(fetchProducts());

        expect(selectListStatus(store.getState() as any)).toBe('loading');
    });

    it('sets products and filteredProducts on success', async () => {
        const store = makeStore();
        (ProductService.getProducts as jest.Mock).mockResolvedValue([mockProduct, mockProduct2]);

        await store.dispatch(fetchProducts());

        expect(selectListStatus(store.getState() as any)).toBe('succeeded');
        expect(selectFilteredProducts(store.getState() as any)).toHaveLength(2);
    });

    it('sets listStatus to failed on empty response', async () => {
        const store = makeStore();
        (ProductService.getProducts as jest.Mock).mockResolvedValue([]);

        await store.dispatch(fetchProducts());

        expect(selectListStatus(store.getState() as any)).toBe('failed');
        expect(selectShopError(store.getState() as any)).toBe('Failed to load products');
    });

    it('sets listStatus to failed on rejection', async () => {
        const store = makeStore();
        (ProductService.getProducts as jest.Mock).mockRejectedValue(new Error('Network error'));

        await store.dispatch(fetchProducts());

        expect(selectListStatus(store.getState() as any)).toBe('failed');
    });

    it('clears error on new fetch', async () => {
        const store = makeStore();
        (ProductService.getProducts as jest.Mock).mockResolvedValue([]);
        await store.dispatch(fetchProducts());
        expect(selectShopError(store.getState() as any)).not.toBeNull();

        (ProductService.getProducts as jest.Mock).mockReturnValue(new Promise(() => {}));
        store.dispatch(fetchProducts());
        expect(selectShopError(store.getState() as any)).toBeNull();
    });
});

// ── fetchProductById thunk ────────────────────────────────────────────────────

describe('shopSlice — fetchProductById', () => {

    it('sets detailStatus to loading while pending', () => {
        const store = makeStore();
        (ProductService.getProductById as jest.Mock).mockReturnValue(new Promise(() => {}));

        store.dispatch(fetchProductById(1));

        expect(selectDetailStatus(store.getState() as any)).toBe('loading');
    });

    it('sets selectedProduct on success', async () => {
        const store = makeStore();
        (ProductService.getProductById as jest.Mock).mockResolvedValue(mockProduct);

        await store.dispatch(fetchProductById(1));

        expect(selectDetailStatus(store.getState() as any)).toBe('succeeded');
        expect(selectSelectedProduct(store.getState() as any)).toEqual(mockProduct);
    });

    it('sets detailStatus to failed when product not found', async () => {
        const store = makeStore();
        (ProductService.getProductById as jest.Mock).mockResolvedValue(null);

        await store.dispatch(fetchProductById(99));

        expect(selectDetailStatus(store.getState() as any)).toBe('failed');
        expect(selectShopError(store.getState() as any)).toBe('Product not found');
    });

    it('sets detailStatus to failed on rejection', async () => {
        const store = makeStore();
        (ProductService.getProductById as jest.Mock).mockRejectedValue(new Error('Network error'));

        await store.dispatch(fetchProductById(1));

        expect(selectDetailStatus(store.getState() as any)).toBe('failed');
    });
});

// ── Selectors ─────────────────────────────────────────────────────────────────

describe('shopSlice — selectors', () => {

    it('selectSearch returns current search value', async () => {
        const store = makeStore();
        store.dispatch(setSearch('keyboard'));
        expect(selectSearch(store.getState() as any)).toBe('keyboard');
    });
});