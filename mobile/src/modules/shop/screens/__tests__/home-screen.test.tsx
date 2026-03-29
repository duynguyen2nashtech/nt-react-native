import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { HomeScreen } from '../home-screen';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockDispatch = jest.fn();
const mockNavigate = jest.fn();
const mockGetParent = jest.fn(() => ({ navigate: mockNavigate }));

jest.mock('../../../../stores/store', () => ({
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

// ❌ REMOVED: jest.mock('../../../auth/store/authSlice', ...)
// ✅ ADDED: mock useAuth from Context
jest.mock('../../../auth/context/auth-context', () => ({
    useAuth: jest.fn(),
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

import { useAppSelector } from '../../../../stores/store';
import { useAuth } from '../../../auth/context/auth-context';
import {
    selectFilteredProducts,
    selectListStatus,
    selectShopError,
    selectSearch,
} from '../../store/shopSlice';

// ❌ REMOVED: import { selectUser } from '../../../auth/store/authSlice';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockProduct = {
    id: 1,
    name: 'Microsoft Sculpt Keyboard',
    description: 'Great keyboard',
    image: 'https://example.com/img.jpg',
    price: 80.95,
    priceUnit: 'dollar',
    createdAt: '2023-01-01',
    updatedAt: '2023-01-01',
};

const mockUser = { id: '1', username: 'duynguyen', email: 'duy@gmail.com' };

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
    user = mockUser,
    products = [],
    status = 'succeeded',
    error = null,
    search = '',
}: {
    user?: any;
    products?: any[];
    status?: string;
    error?: string | null;
    search?: string;
} = {}) {
    // ✅ Mock useAuth to return user from Context
    (useAuth as jest.Mock).mockReturnValue({
        user,
        login: jest.fn(),
        signOut: jest.fn(),
    });

    // ❌ REMOVED: selectUser from useAppSelector map
    (useAppSelector as jest.Mock).mockImplementation((selector: any) => {
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

// ── Tests (unchanged) ─────────────────────────────────────────────────────────

beforeEach(() => jest.clearAllMocks());

describe('HomeScreen — guest (no user)', () => {
    it('shows welcome guest title', () => {
        setupSelectors({ user: null });
        renderScreen();
        expect(screen.getByText('Welcome Guest')).toBeTruthy();
    });

    it('shows sign in subtitle', () => {
        setupSelectors({ user: null });
        renderScreen();
        expect(screen.getByText('Sign in to explore products')).toBeTruthy();
    });

    it('shows Sign In button', () => {
        setupSelectors({ user: null });
        renderScreen();
        expect(screen.getByText('Sign In')).toBeTruthy();
    });

    it('navigates to SignIn when Sign In button is pressed', () => {
        setupSelectors({ user: null });
        renderScreen();
        fireEvent.press(screen.getByText('Sign In'));
        expect(mockGetParent).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('SignIn');
    });

    it('does not show product list when guest', () => {
        setupSelectors({ user: null });
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
    it('dispatches fetchProducts when user is set and status is idle', () => {
        setupSelectors({ status: 'idle' });
        renderScreen();
        expect(mockDispatch).toHaveBeenCalled();
    });

    it('does not dispatch fetchProducts when user is null', () => {
        setupSelectors({ user: null, status: 'idle' });
        renderScreen();
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('does not dispatch fetchProducts when status is not idle', () => {
        setupSelectors({ status: 'succeeded' });
        renderScreen();
        expect(mockDispatch).not.toHaveBeenCalled();
    });

    it('does not dispatch fetchProducts when already loading', () => {
        setupSelectors({ status: 'loading' });
        renderScreen();
        expect(mockDispatch).not.toHaveBeenCalled();
    });
});