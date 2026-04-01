/**
 * Tests for OrderHistoryScreen
 * Location: src/modules/orders/screens/__tests__/order-history-screen.test.tsx
 *
 * Run: npx jest order-history-screen.test.tsx
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { OrderHistoryScreen } from '../order-history-screen';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockDispatch = jest.fn();
const mockGoBack   = jest.fn();
const mockNavigate = jest.fn();

jest.mock('react-redux', () => ({
    useDispatch: () => mockDispatch,
    useSelector: jest.fn(),
}));

jest.mock('../../store/ordersSlice', () => ({
    fetchOrders: jest.fn(() => ({ type: 'orders/fetchAll' })),
}));

// ── Imports after mocks ───────────────────────────────────────────────────────

import { useSelector } from 'react-redux';
import { fetchOrders } from '../../store/ordersSlice';
import { Order, OrderStatus } from '../../store/ordersSlice';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockOrder = (overrides: Partial<Order> = {}): Order => ({
    id:              1,
    userId:          1,
    items:           [{ productId: 10, quantity: 2, price: 49.99 }],
    totalAmount:     99.98,
    shippingAddress: '123 Main St',
    paymentMethod:   'credit_card',
    status:          'pending',
    createdAt:       '2024-01-01T00:00:00.000Z',
    updatedAt:       '2024-01-01T00:00:00.000Z',
    ...overrides,
});

const mockNavigation = {
    goBack:   mockGoBack,
    navigate: mockNavigate,
};

// ── Selector setup ────────────────────────────────────────────────────────────

function setupSelectors({
    orders    = [] as Order[],
    isLoading = false,
    error     = null as string | null,
    products  = [] as any[],
} = {}) {
    (useSelector as unknown as jest.Mock).mockImplementation((selector: any) => {
        const fakeState = {
            orders: { orders, isLoading, error },
            shop:   { products },
        };
        return selector(fakeState);
    });
}

function renderScreen() {
    return render(<OrderHistoryScreen navigation={mockNavigation as any} />);
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
    mockDispatch.mockReturnValue(Promise.resolve());
});

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('OrderHistoryScreen — rendering', () => {

    it('renders header title', () => {
        setupSelectors();
        renderScreen();
        expect(screen.getByText('Order History')).toBeTruthy();
    });

    it('renders all tab labels', () => {
        setupSelectors();
        renderScreen();
        expect(screen.getByText('All Orders')).toBeTruthy();
        expect(screen.getByText('Ongoing')).toBeTruthy();
        expect(screen.getByText('Completed')).toBeTruthy();
        expect(screen.getByText('Cancelled')).toBeTruthy();
    });

    it('renders back button', () => {
        setupSelectors();
        renderScreen();
        expect(screen.getByTestId('back-button')).toBeTruthy();
    });
});

// ── Loading state ─────────────────────────────────────────────────────────────

describe('OrderHistoryScreen — loading', () => {

    it('shows loading indicator when isLoading is true', () => {
        setupSelectors({ isLoading: true });
        renderScreen();
        expect(screen.getByTestId('loading-indicator')).toBeTruthy();
    });

    it('does not show order list while loading', () => {
        setupSelectors({ isLoading: true });
        renderScreen();
        expect(screen.queryByText(/ORD-/)).toBeNull();
    });
});

// ── Error state ───────────────────────────────────────────────────────────────

describe('OrderHistoryScreen — error', () => {

    it('shows error message when error is set', () => {
        setupSelectors({ error: 'Failed to fetch orders' });
        renderScreen();
        expect(screen.getByText('Failed to fetch orders')).toBeTruthy();
    });

    it('shows Try Again button on error', () => {
        setupSelectors({ error: 'Failed to fetch orders' });
        renderScreen();
        expect(screen.getByText('Try Again')).toBeTruthy();
    });

    it('dispatches fetchOrders when Try Again is pressed', () => {
        setupSelectors({ error: 'Failed to fetch orders' });
        renderScreen();
        fireEvent.press(screen.getByText('Try Again'));
        expect(mockDispatch).toHaveBeenCalled();
        expect(fetchOrders).toHaveBeenCalled();
    });

    it('does not show loading indicator when error is set', () => {
        setupSelectors({ error: 'Failed to fetch orders' });
        renderScreen();
        expect(screen.queryByTestId('loading-indicator')).toBeNull();
    });
});

// ── Empty state ───────────────────────────────────────────────────────────────

describe('OrderHistoryScreen — empty state', () => {

    it('shows empty state when no orders on All Orders tab', () => {
        setupSelectors({ orders: [] });
        renderScreen();
        expect(screen.getByText("You haven't placed any orders yet.")).toBeTruthy();
    });

    it('shows empty state for ongoing tab when no ongoing orders', () => {
        setupSelectors({ orders: [mockOrder({ status: 'delivered' })] });
        renderScreen();
        fireEvent.press(screen.getByTestId('tab-ongoing'));
        expect(screen.getByText('No ongoing orders')).toBeTruthy();
    });

    it('shows empty state for completed tab when no completed orders', () => {
        setupSelectors({ orders: [] });
        renderScreen();
        fireEvent.press(screen.getByTestId('tab-completed'));
        expect(screen.getByText('No completed orders')).toBeTruthy();
    });

    it('shows empty state for cancelled tab when no cancelled orders', () => {
        setupSelectors({ orders: [] });
        renderScreen();
        fireEvent.press(screen.getByTestId('tab-cancelled'));
        expect(screen.getByText('No cancelled orders')).toBeTruthy();
    });
});

// ── Orders list ───────────────────────────────────────────────────────────────

describe('OrderHistoryScreen — orders list', () => {

    it('renders order number correctly', () => {
        setupSelectors({ orders: [mockOrder({ id: 1 })] });
        renderScreen();
        expect(screen.getByText('ORDER #ORD-00001')).toBeTruthy();
    });

    it('renders order total amount', () => {
        setupSelectors({ orders: [mockOrder({ totalAmount: 99.98 })] });
        renderScreen();
        expect(screen.getByText('$99.98')).toBeTruthy();
    });

    it('renders pending status badge', () => {
        setupSelectors({ orders: [mockOrder({ status: 'pending' })] });
        renderScreen();
        expect(screen.getByText('PENDING')).toBeTruthy();
    });

    it('renders delivered status badge', () => {
        setupSelectors({ orders: [mockOrder({ status: 'delivered' })] });
        renderScreen();
        expect(screen.getByText('DELIVERED')).toBeTruthy();
    });

    it('renders shipped status badge', () => {
        setupSelectors({ orders: [mockOrder({ status: 'shipped' })] });
        renderScreen();
        expect(screen.getByText('SHIPPED')).toBeTruthy();
    });

    it('renders cancelled status badge', () => {
        setupSelectors({ orders: [mockOrder({ status: 'cancelled' })] });
        renderScreen();
        expect(screen.getByText('CANCELLED')).toBeTruthy();
    });

    it('renders multiple orders', () => {
        setupSelectors({
            orders: [
                mockOrder({ id: 1 }),
                mockOrder({ id: 2, status: 'delivered' }),
            ],
        });
        renderScreen();
        expect(screen.getByText('ORDER #ORD-00001')).toBeTruthy();
        expect(screen.getByText('ORDER #ORD-00002')).toBeTruthy();
    });
});

// ── Tab filtering ─────────────────────────────────────────────────────────────

describe('OrderHistoryScreen — tab filtering', () => {

    const allOrders = [
        mockOrder({ id: 1, status: 'pending'   }),
        mockOrder({ id: 2, status: 'shipped'   }),
        mockOrder({ id: 3, status: 'delivered' }),
        mockOrder({ id: 4, status: 'cancelled' }),
    ];

    it('All Orders tab shows all orders', () => {
        setupSelectors({ orders: allOrders });
        renderScreen();
        expect(screen.getByText('ORDER #ORD-00001')).toBeTruthy();
        expect(screen.getByText('ORDER #ORD-00002')).toBeTruthy();
        expect(screen.getByText('ORDER #ORD-00003')).toBeTruthy();
        expect(screen.getByText('ORDER #ORD-00004')).toBeTruthy();
    });

    it('Ongoing tab shows only pending/processing/shipped orders', () => {
        setupSelectors({ orders: allOrders });
        renderScreen();
        fireEvent.press(screen.getByTestId('tab-ongoing'));
        expect(screen.getByText('ORDER #ORD-00001')).toBeTruthy();   // pending
        expect(screen.getByText('ORDER #ORD-00002')).toBeTruthy();   // shipped
        expect(screen.queryByText('ORDER #ORD-00003')).toBeNull();   // delivered — hidden
        expect(screen.queryByText('ORDER #ORD-00004')).toBeNull();   // cancelled — hidden
    });

    it('Completed tab shows only delivered orders', () => {
        setupSelectors({ orders: allOrders });
        renderScreen();
        fireEvent.press(screen.getByTestId('tab-completed'));
        expect(screen.getByText('ORDER #ORD-00003')).toBeTruthy();   // delivered
        expect(screen.queryByText('ORDER #ORD-00001')).toBeNull();   // pending — hidden
        expect(screen.queryByText('ORDER #ORD-00004')).toBeNull();   // cancelled — hidden
    });

    it('Cancelled tab shows only cancelled orders', () => {
        setupSelectors({ orders: allOrders });
        renderScreen();
        fireEvent.press(screen.getByTestId('tab-cancelled'));
        expect(screen.getByText('ORDER #ORD-00004')).toBeTruthy();   // cancelled
        expect(screen.queryByText('ORDER #ORD-00001')).toBeNull();   // pending — hidden
        expect(screen.queryByText('ORDER #ORD-00003')).toBeNull();   // delivered — hidden
    });
});

// ── Action buttons ────────────────────────────────────────────────────────────

describe('OrderHistoryScreen — action buttons', () => {

    it('shows Track Order button for pending order', () => {
        setupSelectors({ orders: [mockOrder({ status: 'pending' })] });
        renderScreen();
        expect(screen.getByText('📦  Track Order')).toBeTruthy();
    });

    it('shows Track Order button for shipped order', () => {
        setupSelectors({ orders: [mockOrder({ status: 'shipped' })] });
        renderScreen();
        expect(screen.getByText('📦  Track Order')).toBeTruthy();
    });

    it('shows Reorder and View Details buttons for delivered order', () => {
        setupSelectors({ orders: [mockOrder({ status: 'delivered' })] });
        renderScreen();
        expect(screen.getByText('Reorder')).toBeTruthy();
        expect(screen.getByText('View Details')).toBeTruthy();
    });

    it('shows Leave Review and Buy Again buttons for cancelled order', () => {
        setupSelectors({ orders: [mockOrder({ status: 'cancelled' })] });
        renderScreen();
        expect(screen.getByText('Leave Review')).toBeTruthy();
        expect(screen.getByText('Buy Again')).toBeTruthy();
    });

    it('navigates to OrderDetail when View Details is pressed', () => {
        const order = mockOrder({ status: 'delivered' });
        setupSelectors({ orders: [order] });
        renderScreen();
        fireEvent.press(screen.getByText('View Details'));
        expect(mockNavigate).toHaveBeenCalledWith('OrderDetail', { order });
    });
});

// ── Navigation ────────────────────────────────────────────────────────────────

describe('OrderHistoryScreen — navigation', () => {

    it('calls goBack when back button is pressed', () => {
        setupSelectors();
        renderScreen();
        fireEvent.press(screen.getByTestId('back-button'));
        expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
});

// ── fetchOrders dispatch ──────────────────────────────────────────────────────

describe('OrderHistoryScreen — fetchOrders dispatch', () => {

    it('dispatches fetchOrders on mount', () => {
        setupSelectors();
        renderScreen();
        expect(mockDispatch).toHaveBeenCalled();
        expect(fetchOrders).toHaveBeenCalled();
    });

    it('dispatches fetchOrders only once on mount', () => {
        setupSelectors();
        renderScreen();
        expect(fetchOrders).toHaveBeenCalledTimes(1);
    });
});

// ── Pull to refresh ───────────────────────────────────────────────────────────

describe('OrderHistoryScreen — pull to refresh', () => {

    it('dispatches fetchOrders again on pull to refresh', async () => {
        setupSelectors({ orders: [mockOrder()] });
        renderScreen();

        const flatList = screen.UNSAFE_getByType(
            require('react-native').FlatList
        );

        await act(async () => {
            flatList.props.refreshControl.props.onRefresh();
        });

        await waitFor(() => {
            expect(fetchOrders).toHaveBeenCalledTimes(2); // once on mount, once on refresh
        });
    });
});