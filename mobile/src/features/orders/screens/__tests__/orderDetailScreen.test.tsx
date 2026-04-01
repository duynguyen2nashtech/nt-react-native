/**
 * Tests for OrderDetailScreen
 * Location: src/modules/orders/screens/__tests__/order-detail-screen.test.tsx
 *
 * Run: npx jest order-detail-screen.test.tsx
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import { OrderDetailScreen } from '../orderDetailScreen';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockGoBack = jest.fn();

jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
}));

// ── Imports after mocks ───────────────────────────────────────────────────────

import { useSelector } from 'react-redux';
import { Order } from '../../store/ordersSlice';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockProduct = {
    id:    10,
    name:  'Mechanical Keyboard',
    image: 'https://example.com/keyboard.jpg',
    price: 49.99,
};

const mockOrder: Order = {
    id:              1,
    userId:          1,
    items:           [{ productId: 10, quantity: 2, price: 49.99 }],
    totalAmount:     99.98,
    shippingAddress: '123 Main St, Ho Chi Minh City',
    paymentMethod:   'credit_card',
    status:          'pending',
    createdAt:       '2024-01-15T00:00:00.000Z',
    updatedAt:       '2024-01-16T00:00:00.000Z',
};

const mockNavigation = {
    goBack: mockGoBack,
};

function buildRoute(order: Order = mockOrder) {
    return { params: { order } };
}

// ── Selector setup ────────────────────────────────────────────────────────────

function setupSelectors({ products = [] as any[] } = {}) {
    (useSelector as unknown as jest.Mock).mockImplementation((selector: (state: any) => any) => {
        return selector({ shop: { products } });
    });
}

function renderScreen(order: Order = mockOrder) {
    return render(
        <OrderDetailScreen
            navigation={mockNavigation as any}
            route={buildRoute(order) as any}
        />
    );
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
    setupSelectors();
});

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('OrderDetailScreen — rendering', () => {

    it('renders header title', () => {
        renderScreen();
        expect(screen.getByText('Order Details')).toBeTruthy();
    });

    it('renders order number correctly', () => {
        renderScreen();
        expect(screen.getByText('ORDER #ORD-00001')).toBeTruthy();
    });

    it('renders section titles', () => {
        renderScreen();
        expect(screen.getByText('Items Ordered')).toBeTruthy();
        expect(screen.getByText('Price Summary')).toBeTruthy();
        expect(screen.getByText('Shipping Address')).toBeTruthy();
        expect(screen.getByText('Payment Method')).toBeTruthy();
        expect(screen.getByText('Order Timeline')).toBeTruthy();
    });
});

// ── Status badge ──────────────────────────────────────────────────────────────

describe('OrderDetailScreen — status badge', () => {

    it('renders PENDING badge for pending order', () => {
        renderScreen(mockOrder);
        expect(screen.getByText('PENDING')).toBeTruthy();
    });

    it('renders DELIVERED badge for delivered order', () => {
        renderScreen({ ...mockOrder, status: 'delivered' });
        expect(screen.getByText('DELIVERED')).toBeTruthy();
    });

    it('renders SHIPPED badge for shipped order', () => {
        renderScreen({ ...mockOrder, status: 'shipped' });
        expect(screen.getByText('SHIPPED')).toBeTruthy();
    });

    it('renders PROCESSING badge for processing order', () => {
        renderScreen({ ...mockOrder, status: 'processing' });
        expect(screen.getByText('PROCESSING')).toBeTruthy();
    });

    it('renders CANCELLED badge for cancelled order', () => {
        renderScreen({ ...mockOrder, status: 'cancelled' });
        expect(screen.getByText('CANCELLED')).toBeTruthy();
    });
});

// ── Items ordered ─────────────────────────────────────────────────────────────

describe('OrderDetailScreen — items ordered', () => {

    it('shows product name from shop state when product is found', () => {
        setupSelectors({ products: [mockProduct] });
        renderScreen();
        expect(screen.getByText('Mechanical Keyboard')).toBeTruthy();
    });

    it('shows fallback product name when product not in shop state', () => {
        setupSelectors({ products: [] });
        renderScreen();
        expect(screen.getByText('Product #10')).toBeTruthy();
    });

    it('renders item quantity', () => {
        renderScreen();
        expect(screen.getByText('Qty: 2')).toBeTruthy();
    });

    it('renders item price (price × quantity)', () => {
        renderScreen();
        expect(screen.getAllByText('$99.98')).toBeTruthy();
    });

    it('renders multiple items', () => {
        const orderWithMultipleItems: Order = {
            ...mockOrder,
            items: [
                { productId: 10, quantity: 1, price: 49.99 },
                { productId: 20, quantity: 2, price: 29.99 },
            ],
        };
        setupSelectors({ products: [mockProduct, { id: 20, name: 'Mouse', image: null, price: 29.99 }] });
        renderScreen(orderWithMultipleItems);
        expect(screen.getByText('Mechanical Keyboard')).toBeTruthy();
        expect(screen.getByText('Mouse')).toBeTruthy();
        expect(screen.getByText('Qty: 1')).toBeTruthy();
        expect(screen.getByText('Qty: 2')).toBeTruthy();
    });
});

// ── Price summary ─────────────────────────────────────────────────────────────

describe('OrderDetailScreen — price summary', () => {

    it('renders Subtotal label', () => {
        renderScreen();
        expect(screen.getByText('Subtotal')).toBeTruthy();
    });

    it('renders Shipping label', () => {
        renderScreen();
        expect(screen.getByText('Shipping')).toBeTruthy();
    });

    it('renders Tax label', () => {
        renderScreen();
        expect(screen.getByText('Tax (8%)')).toBeTruthy();
    });

    it('renders Total label', () => {
        renderScreen();
        expect(screen.getByText('Total')).toBeTruthy();
    });

    it('shows FREE shipping when subtotal >= $100', () => {
        const order: Order = {
            ...mockOrder,
            items:       [{ productId: 10, quantity: 2, price: 49.99 }], // subtotal = 99.98 < 100
            totalAmount: 99.98,
        };
        renderScreen(order);
        // subtotal 99.98 < 100 → should NOT be free
        expect(screen.queryByText('FREE')).toBeNull();
    });

    it('shows FREE shipping when subtotal is exactly $100 or more', () => {
        const order: Order = {
            ...mockOrder,
            items:       [{ productId: 10, quantity: 2, price: 50.00 }], // subtotal = 100
            totalAmount: 100.00,
        };
        renderScreen(order);
        expect(screen.getByText('FREE')).toBeTruthy();
    });

    it('renders total amount from order', () => {
        renderScreen();
        // Total is rendered with totalValue style (larger) — appears twice due to item price
        const totals = screen.getAllByText('$99.98');
        expect(totals.length).toBeGreaterThan(0);
    });
});

// ── Shipping & payment ────────────────────────────────────────────────────────

describe('OrderDetailScreen — shipping and payment', () => {

    it('renders shipping address', () => {
        renderScreen();
        expect(screen.getByText('123 Main St, Ho Chi Minh City')).toBeTruthy();
    });

    it('renders payment method formatted correctly', () => {
        renderScreen();
        expect(screen.getByText('Credit Card')).toBeTruthy();
    });

    it('renders payment method with underscores formatted', () => {
        renderScreen({ ...mockOrder, paymentMethod: 'bank_transfer' });
        expect(screen.getByText('Bank Transfer')).toBeTruthy();
    });
});

// ── Order timeline ────────────────────────────────────────────────────────────

describe('OrderDetailScreen — order timeline', () => {

    it('renders Order Placed label', () => {
        renderScreen();
        expect(screen.getByText('Order Placed')).toBeTruthy();
    });

    it('renders Last Updated label', () => {
        renderScreen();
        expect(screen.getByText('Last Updated')).toBeTruthy();
    });

    it('renders formatted createdAt date', () => {
        renderScreen();
        // 2024-01-15 → "Mon, January 15, 2024"
        expect(screen.getAllByText(/January 15, 2024/)).toBeTruthy();
    });

    it('renders formatted updatedAt date', () => {
        renderScreen();
        // 2024-01-16 → "Tue, January 16, 2024"
        expect(screen.getByText(/January 16, 2024/)).toBeTruthy();
    });
});

// ── Navigation ────────────────────────────────────────────────────────────────

describe('OrderDetailScreen — navigation', () => {

    it('calls goBack when back button is pressed', () => {
        renderScreen();
        fireEvent.press(screen.getByText('‹'));
        expect(mockGoBack).toHaveBeenCalledTimes(1);
    });
});