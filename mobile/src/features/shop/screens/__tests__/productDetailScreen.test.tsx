/**
 * Tests for ProductDetailScreen
 * Location: src/features/shop/screens/__tests__/product-detail-screen.test.tsx
 *
 * Run: npx jest product-detail-screen.test.tsx
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { ActivityIndicator } from 'react-native';
import { ProductDetailScreen } from '../productDetailScreen';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockDispatch = jest.fn();
const mockGoBack   = jest.fn();

jest.mock('../../../../store/store', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: jest.fn(),
}));

jest.mock('../../store/shopSlice', () => ({
    // thunks
    fetchProductById:     jest.fn(() => ({ type: 'shop/fetchProductById' })),
    fetchProductReviews:  jest.fn(() => ({ type: 'shop/fetchProductReviews' })),
    clearSelectedProduct: jest.fn(() => ({ type: 'shop/clearSelectedProduct' })),
    clearReviews:         jest.fn(() => ({ type: 'shop/clearReviews' })),
    // selectors
    selectSelectedProduct: jest.fn(),
    selectDetailStatus:    jest.fn(),
    selectReviews:         jest.fn(),
    selectReviewStatus:    jest.fn(),
}));

jest.mock('../../../cart/store/cartSlice', () => ({
    addToCartAsync: jest.fn(() => ({ type: 'cart/addToCart' })),
}));

// ── Imports after mocks ───────────────────────────────────────────────────────

import { useAppSelector } from '../../../../store/store';
import {
    selectSelectedProduct,
    selectDetailStatus,
    selectReviews,
    selectReviewStatus,
} from '../../store/shopSlice';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockProduct = {
    id: 1,
    name: 'Microsoft Sculpt Ergonomic Keyboard',
    description: 'Best budget ergonomic keyboard for coding in 2023.',
    image: 'https://example.com/image.jpg',
    price: 80.95,
    priceUnit: 'dollar',
    createdAt: '2023-05-12T10:44:52.624Z',
    updatedAt: '2026-03-26T04:36:10.127Z',
};

const mockProductLongDesc = {
    ...mockProduct,
    description: 'A'.repeat(200),
};

const mockReviews = [
    {
        id: 1,
        productId: 1,
        userId: 8,
        rating: 5,
        message: 'Great product!',
        resolvedName: 'Harry Smith',
        initials: 'HS',
        createdAt: '2026-04-01T13:13:38.780Z',
        updatedAt: '2026-04-01T13:13:38.780Z',
    },
];

const mockNavigation = {
    goBack:    mockGoBack,
    navigate:  jest.fn(),
    getParent: jest.fn(),
};

const mockRoute = {
    key:    'ProductDetail',
    name:   'ProductDetail' as const,
    params: { productId: 1 },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function setupSelectors({
    product      = mockProduct as any,
    status       = 'succeeded',
    reviews      = [] as any[],
    reviewStatus = 'succeeded',
}: {
    product?:      any;
    status?:       string;
    reviews?:      any[];
    reviewStatus?: string;
} = {}) {
    (useAppSelector as jest.Mock).mockImplementation((selector: any) => {
        if (selector === selectSelectedProduct) return product;
        if (selector === selectDetailStatus)    return status;
        if (selector === selectReviews)         return reviews;
        if (selector === selectReviewStatus)    return reviewStatus;
        return null;
    });
}

function renderScreen() {
    return render(
        <ProductDetailScreen
            navigation={mockNavigation as any}
            route={mockRoute as any}
        />
    );
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => jest.clearAllMocks());

// ── Loading state ─────────────────────────────────────────────────────────────

describe('ProductDetailScreen — loading', () => {

    it('shows activity indicator when status is loading', () => {
        setupSelectors({ product: null, status: 'loading' });
        const { UNSAFE_getByType } = renderScreen();
        expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    it('shows activity indicator when status is idle', () => {
        setupSelectors({ product: null, status: 'idle' });
        const { UNSAFE_getByType } = renderScreen();
        expect(UNSAFE_getByType(ActivityIndicator)).toBeTruthy();
    });

    it('does not show product name while loading', () => {
        setupSelectors({ product: null, status: 'loading' });
        renderScreen();
        expect(screen.queryByText(mockProduct.name)).toBeNull();
    });
});

// ── Error / not found state ───────────────────────────────────────────────────

describe('ProductDetailScreen — not found', () => {

    it('shows not found message when status is failed', () => {
        setupSelectors({ product: null, status: 'failed' });
        renderScreen();
        expect(screen.getByText('Product not found.')).toBeTruthy();
    });

    it('shows not found message when product is null after success', () => {
        setupSelectors({ product: null, status: 'succeeded' });
        renderScreen();
        expect(screen.getByText('Product not found.')).toBeTruthy();
    });

    it('shows Go back button when product not found', () => {
        setupSelectors({ product: null, status: 'failed' });
        renderScreen();
        expect(screen.getByText('Go back')).toBeTruthy();
    });

    it('calls navigation.goBack when Go back is pressed', () => {
        setupSelectors({ product: null, status: 'failed' });
        renderScreen();
        fireEvent.press(screen.getByText('Go back'));
        expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
});

// ── Success state ─────────────────────────────────────────────────────────────

describe('ProductDetailScreen — success', () => {

    it('shows Product Details title', () => {
        setupSelectors();
        renderScreen();
        expect(screen.getByText('Product Details')).toBeTruthy();
    });

    it('shows product name', () => {
        setupSelectors();
        renderScreen();
        expect(screen.getByText(mockProduct.name)).toBeTruthy();
    });

    it('shows formatted price', () => {
        setupSelectors();
        renderScreen();
        expect(screen.getByText(/80\.95/)).toBeTruthy();
    });

    it('shows Add to Cart button', () => {
        setupSelectors();
        renderScreen();
        expect(screen.getByText('Add to Cart')).toBeTruthy();
    });

    it('shows Buy Now button', () => {
        setupSelectors();
        renderScreen();
        expect(screen.getByText('Buy Now')).toBeTruthy();
    });

    it('shows Key Features section', () => {
        setupSelectors();
        renderScreen();
        expect(screen.getByText('Key Features')).toBeTruthy();
    });

    it('shows Product Description section', () => {
        setupSelectors();
        renderScreen();
        expect(screen.getByText('Product Description')).toBeTruthy();
    });

    it('shows User Reviews section', () => {
        setupSelectors();
        renderScreen();
        expect(screen.getByText('User Reviews')).toBeTruthy();
    });
});

// ── Reviews ───────────────────────────────────────────────────────────────────

describe('ProductDetailScreen — reviews', () => {

    it('shows review spinner when reviewStatus is loading', () => {
        setupSelectors({ reviewStatus: 'loading' });
        const { UNSAFE_getAllByType } = renderScreen();
        // one for product loading, one for reviews
        expect(UNSAFE_getAllByType(ActivityIndicator).length).toBeGreaterThan(0);
    });

    it('shows no reviews message when reviews are empty', () => {
        setupSelectors({ reviews: [] });
        renderScreen();
        expect(screen.getByText('No reviews yet.')).toBeTruthy();
    });

    it('shows review message when reviews are loaded', () => {
        setupSelectors({ reviews: mockReviews });
        renderScreen();
        expect(screen.getByText('Great product!')).toBeTruthy();
    });

    it('shows reviewer resolved name', () => {
        setupSelectors({ reviews: mockReviews });
        renderScreen();
        expect(screen.getByText('Harry Smith')).toBeTruthy();
    });

    it('shows error message when reviewStatus is failed', () => {
        setupSelectors({ reviewStatus: 'failed' });
        renderScreen();
        expect(screen.getByText('Failed to load reviews.')).toBeTruthy();
    });
});

// ── Navigation ────────────────────────────────────────────────────────────────

describe('ProductDetailScreen — navigation', () => {

    it('calls navigation.goBack when back arrow is pressed', () => {
        setupSelectors();
        renderScreen();
        fireEvent.press(screen.getByText('‹'));
        expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
});

// ── Add to Cart ───────────────────────────────────────────────────────────────

describe('ProductDetailScreen — Add to Cart', () => {

    it('dispatches addToCartAsync when Add to Cart is pressed', () => {
        setupSelectors();
        renderScreen();
        fireEvent.press(screen.getByText('Add to Cart'));
        expect(mockDispatch).toHaveBeenCalled();
    });

    it('shows ✓ Added! after pressing Add to Cart', () => {
        setupSelectors();
        renderScreen();
        fireEvent.press(screen.getByText('Add to Cart'));
        expect(screen.getByText('✓ Added!')).toBeTruthy();
    });

    it('does not show Add to Cart when product is null', () => {
        setupSelectors({ product: null, status: 'succeeded' });
        renderScreen();
        expect(screen.queryByText('Add to Cart')).toBeNull();
    });
});

// ── Description expand/collapse ───────────────────────────────────────────────

describe('ProductDetailScreen — description', () => {

    it('shows Read more when description is longer than 160 chars', () => {
        setupSelectors({ product: mockProductLongDesc });
        renderScreen();
        expect(screen.getByText('Read more...')).toBeTruthy();
    });

    it('does not show Read more when description is short', () => {
        setupSelectors();
        renderScreen();
        expect(screen.queryByText('Read more...')).toBeNull();
    });

    it('shows full description after pressing Read more', () => {
        setupSelectors({ product: mockProductLongDesc });
        renderScreen();
        fireEvent.press(screen.getByText('Read more...'));
        expect(screen.getByText('Read less')).toBeTruthy();
    });

    it('shows truncated description initially when long', () => {
        setupSelectors({ product: mockProductLongDesc });
        renderScreen();
        expect(
            screen.getByText(mockProductLongDesc.description.slice(0, 160) + '…')
        ).toBeTruthy();
    });

    it('collapses description again after pressing Read less', () => {
        setupSelectors({ product: mockProductLongDesc });
        renderScreen();
        fireEvent.press(screen.getByText('Read more...'));
        fireEvent.press(screen.getByText('Read less'));
        expect(screen.getByText('Read more...')).toBeTruthy();
    });
});

// ── useEffect ─────────────────────────────────────────────────────────────────

describe('ProductDetailScreen — useEffect', () => {

    it('dispatches fetchProductById on mount', () => {
        setupSelectors();
        renderScreen();
        const { fetchProductById } = require('../../store/shopSlice');
        expect(fetchProductById).toHaveBeenCalledWith(1);
    });

    it('dispatches fetchProductReviews on mount', () => {
        setupSelectors();
        renderScreen();
        const { fetchProductReviews } = require('../../store/shopSlice');
        expect(fetchProductReviews).toHaveBeenCalledWith(1);
    });

    it('dispatches clearSelectedProduct on unmount', () => {
        setupSelectors();
        const { unmount } = renderScreen();
        unmount();
        const { clearSelectedProduct } = require('../../store/shopSlice');
        expect(clearSelectedProduct).toHaveBeenCalled();
    });

    it('dispatches clearReviews on unmount', () => {
        setupSelectors();
        const { unmount } = renderScreen();
        unmount();
        const { clearReviews } = require('../../store/shopSlice');
        expect(clearReviews).toHaveBeenCalled();
    });
});