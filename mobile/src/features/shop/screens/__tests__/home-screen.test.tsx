import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { HomeScreen } from '../home-screen';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockGetParent = jest.fn(() => ({ navigate: mockNavigate }));

jest.mock('../../../../store/store', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: jest.fn(),
}));

jest.mock('../../store/shopSlice', () => ({
    fetchProducts:          jest.fn(() => ({ type: 'shop/fetchProducts' })),
    setSearch:              jest.fn((text) => ({ type: 'shop/setSearch', payload: text })),
    selectFilteredProducts: jest.fn(),
    selectListStatus:       jest.fn(),
    selectShopError:        jest.fn(),
    selectSearch:           jest.fn(),
}));

jest.mock('../../../auth/store/authSlice', () => ({
    selectIsLoggedIn: jest.fn(),
}));

jest.mock('../../components/ProductList', () => {
    const { View, Text } = require('react-native');
    return ({ products }: any) => (
        <View testID="product-list">
            <Text>{products.length} products</Text>
        </View>
    );
});

// ── Imports after mocks ───────────────────────────────────────────────────────

import { useAppSelector } from '../../../../store/store';
import {
    selectFilteredProducts,
    selectListStatus,
    selectShopError,
    selectSearch,
} from '../../store/shopSlice';
import { selectIsLoggedIn } from '../../../auth/store/authSlice';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockProduct = {
    id:          1,
    name:        'Microsoft Sculpt Keyboard',
    description: 'Great keyboard',
    image:       'https://example.com/img.jpg',
    price:       80.95,
    priceUnit:   'dollar',
    createdAt:   '2023-01-01',
    updatedAt:   '2023-01-01',
};

const mockNavigation = {
    navigate:  mockNavigate,
    goBack:    jest.fn(),
    getParent: mockGetParent,
};

const mockRoute = {
    key:    'Home',
    name:   'Home' as const,
    params: undefined,
};

// ── Selector setup ────────────────────────────────────────────────────────────

function setupSelectors({
    isLoggedIn = true,
    products   = [],
    status     = 'succeeded',
    error      = null,
    search     = '',
}: {
    isLoggedIn?: boolean;
    products?:   any[];
    status?:     string;
    error?:      string | null;
    search?:     string;
} = {}) {
    (useAppSelector as jest.Mock).mockImplementation((selector: any) => {
        if (selector === selectIsLoggedIn)      return isLoggedIn;
        if (selector === selectFilteredProducts) return products;
        if (selector === selectListStatus)       return status;
        if (selector === selectShopError)        return error;
        if (selector === selectSearch)           return search;
        return null;
    });
}

function renderScreen() {
    return render(
        <HomeScreen
            navigation={mockNavigation as any}
            route={mockRoute as any}
        />
    );
}

// ── Tests ─────────────────────────────────────────────────────────────────────

beforeEach(() => jest.clearAllMocks());

describe('HomeScreen — guest (not logged in)', () => {
    it('shows welcome guest title', () => {
        setupSelectors({ isLoggedIn: false });
        renderScreen();
        expect(screen.getByText('Welcome Guest')).toBeTruthy();
    });

    it('shows sign in subtitle', () => {
        setupSelectors({ isLoggedIn: false });
        renderScreen();
        expect(screen.getByText('Sign in to explore products')).toBeTruthy();
    });

    it('shows Sign In button', () => {
        setupSelectors({ isLoggedIn: false });
        renderScreen();
        expect(screen.getByText('Sign In')).toBeTruthy();
    });

    it('navigates to SignIn when Sign In button is pressed', () => {
        setupSelectors({ isLoggedIn: false });
        renderScreen();
        fireEvent.press(screen.getByText('Sign In'));
        expect(mockGetParent).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('SignIn');
    });

    it('does not show product list when guest', () => {
        setupSelectors({ isLoggedIn: false });
        renderScreen();
        expect(screen.queryByTestId('product-list')).toBeNull();
    });
});

describe('HomeScreen — loading', () => {
    it('shows activity indicator while loading', () => {
        setupSelectors({ status: 'loading' });
        renderScreen();
        expect(screen.getByTestId('activity-indicator')).toBeTruthy();
    });

    it('does not show product list while loading', () => {
        setupSelectors({ status: 'loading' });
        renderScreen();
        expect(screen.queryByTestId('product-list')).toBeNull();
    });
});

describe('HomeScreen — error', () => {
    it('shows error message when fetch fails', () => {
        setupSelectors({ status: 'failed', error: 'Failed to load products' });
        renderScreen();
        expect(screen.getByText('Failed to load products')).toBeTruthy();
    });

    it('shows Retry button when fetch fails', () => {
        setupSelectors({ status: 'failed', error: 'Failed to load products' });
        renderScreen();
        expect(screen.getByText('Retry')).toBeTruthy();
    });

    it('dispatches fetchProducts when Retry is pressed', () => {
        setupSelectors({ status: 'failed', error: 'Failed to load products' });
        renderScreen();
        fireEvent.press(screen.getByText('Retry'));
        expect(mockDispatch).toHaveBeenCalled();
    });
});

describe('HomeScreen — success', () => {
    it('shows Discover title', () => {
        setupSelectors({ products: [mockProduct] });
        renderScreen();
        expect(screen.getByText('Discover')).toBeTruthy();
    });

    it('renders product list', () => {
        setupSelectors({ products: [mockProduct] });
        renderScreen();
        expect(screen.getByTestId('product-list')).toBeTruthy();
    });

    it('shows correct product count in list', () => {
        setupSelectors({ products: [mockProduct, { ...mockProduct, id: 2 }] });
        renderScreen();
        expect(screen.getByText('2 products')).toBeTruthy();
    });

    it('shows 0 products when list is empty', () => {
        setupSelectors({ products: [] });
        renderScreen();
        expect(screen.getByText('0 products')).toBeTruthy();
    });

    it('shows search input', () => {
        setupSelectors();
        renderScreen();
        expect(screen.getByPlaceholderText('Search products...')).toBeTruthy();
    });

    it('shows current search value in input', () => {
        setupSelectors({ search: 'keyboard' });
        renderScreen();
        expect(screen.getByDisplayValue('keyboard')).toBeTruthy();
    });

    it('dispatches setSearch when user types in search', () => {
        setupSelectors();
        renderScreen();
        fireEvent.changeText(screen.getByPlaceholderText('Search products...'), 'logitech');
        expect(mockDispatch).toHaveBeenCalled();
    });
});

describe('HomeScreen — fetchProducts dispatch', () => {
    it('dispatches fetchProducts when logged in and status is idle', () => {
        setupSelectors({ isLoggedIn: true, status: 'idle' });
        renderScreen();
        expect(mockDispatch).toHaveBeenCalled();
    });

    it('does not dispatch fetchProducts when not logged in', () => {
        setupSelectors({ isLoggedIn: false, status: 'idle' });
        renderScreen();
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('does not dispatch fetchProducts when status is not idle', () => {
        setupSelectors({ isLoggedIn: true, status: 'succeeded' });
        renderScreen();
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('does not dispatch fetchProducts when already loading', () => {
        setupSelectors({ isLoggedIn: true, status: 'loading' });
        renderScreen();
        expect(mockDispatch).not.toHaveBeenCalled();
    });
});