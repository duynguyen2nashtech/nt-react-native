/**
 * Tests for orderSlice.ts
 * Location: src/modules/orders/store/__tests__/orderSlice.test.ts
 *
 * Run: npx jest orderSlice.test.ts
 */

import { TokenService } from '../../../../services/storage/tokenService';
import orderReducer from '../ordersSlice'; 

import { clearOrders, fetchOrders, Order } from '../ordersSlice';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../../../shared/services/token-service', () => ({
    TokenService: {
        getToken: jest.fn(),
    },
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockOrder: Order = {
    id:              1,
    userId:          1,
    items:           [{ productId: 10, quantity: 2, price: 49.99 }],
    totalAmount:     99.98,
    shippingAddress: '123 Main St',
    paymentMethod:   'credit_card',
    status:          'pending',
    createdAt:       '2024-01-01T00:00:00.000Z',
    updatedAt:       '2024-01-01T00:00:00.000Z',
};

const mockOrders: Order[] = [
    mockOrder,
    { ...mockOrder, id: 2, status: 'delivered' },
];

const initialState = {
    orders:    [],
    isLoading: false,
    error:     null,
};

function mockFetch(body: object, status = 200) {
    global.fetch = jest.fn().mockResolvedValue({
        ok:     status >= 200 && status < 300,
        status,
        text:   () => Promise.resolve(JSON.stringify(body)),
    }) as jest.Mock;
}

// ── Reducer tests ─────────────────────────────────────────────────────────────

describe('orderSlice — reducer', () => {

    it('returns initial state', () => {
        const state = orderReducer(undefined, { type: '@@INIT' });
        expect(state).toEqual(initialState);
    });

    // ── clearOrders ────────────────────────────────────────────────────────────

    describe('clearOrders', () => {

        it('clears orders, error and isLoading', () => {
            const populatedState = {
                orders:    mockOrders,
                isLoading: true,
                error:     'Some error',
            };

            const state = orderReducer(populatedState, clearOrders());

            expect(state.orders).toEqual([]);
            expect(state.error).toBeNull();
            expect(state.isLoading).toBe(false);
        });

        it('has no effect when state is already empty', () => {
            const state = orderReducer(initialState, clearOrders());
            expect(state).toEqual(initialState);
        });
    });

    // ── fetchOrders.pending ────────────────────────────────────────────────────

    describe('fetchOrders.pending', () => {

        it('sets isLoading true and clears error', () => {
            const stateWithError = { ...initialState, error: 'Previous error' };
            const action         = fetchOrders.pending('', undefined);
            const state          = orderReducer(stateWithError, action);

            expect(state.isLoading).toBe(true);
            expect(state.error).toBeNull();
        });

        it('does not clear existing orders while loading', () => {
            const stateWithOrders = { ...initialState, orders: mockOrders };
            const action          = fetchOrders.pending('', undefined);
            const state           = orderReducer(stateWithOrders, action);

            expect(state.orders).toEqual(mockOrders);
        });
    });

    // ── fetchOrders.fulfilled ──────────────────────────────────────────────────

    describe('fetchOrders.fulfilled', () => {

        it('sets isLoading false and stores orders', () => {
            const loadingState = { ...initialState, isLoading: true };
            const action       = fetchOrders.fulfilled(mockOrders, '', undefined);
            const state        = orderReducer(loadingState, action);

            expect(state.isLoading).toBe(false);
            expect(state.orders).toEqual(mockOrders);
        });

        it('replaces existing orders with new ones', () => {
            const stateWithOrders = { ...initialState, orders: [mockOrder] };
            const newOrders       = [{ ...mockOrder, id: 99 }];
            const action          = fetchOrders.fulfilled(newOrders, '', undefined);
            const state           = orderReducer(stateWithOrders, action);

            expect(state.orders).toEqual(newOrders);
            expect(state.orders).toHaveLength(1);
        });

        it('stores empty array when API returns no orders', () => {
            const action = fetchOrders.fulfilled([], '', undefined);
            const state  = orderReducer(initialState, action);

            expect(state.orders).toEqual([]);
            expect(state.isLoading).toBe(false);
        });
    });

    // ── fetchOrders.rejected ───────────────────────────────────────────────────

    describe('fetchOrders.rejected', () => {

        it('sets isLoading false and stores error message', () => {
            const loadingState = { ...initialState, isLoading: true };
            const action       = fetchOrders.rejected(null, '', undefined, 'Failed to fetch orders');
            const state        = orderReducer(loadingState, action);

            expect(state.isLoading).toBe(false);
            expect(state.error).toBe('Failed to fetch orders');
        });

        it('uses Unknown error as fallback when no payload', () => {
            const action = fetchOrders.rejected(null, '', undefined, undefined);
            const state  = orderReducer(initialState, action);

            expect(state.error).toBe('Unknown error');
        });

        it('does not clear existing orders on error', () => {
            const stateWithOrders = { ...initialState, orders: mockOrders };
            const action          = fetchOrders.rejected(null, '', undefined, 'Network error');
            const state           = orderReducer(stateWithOrders, action);

            expect(state.orders).toEqual(mockOrders);
        });
    });
});

// ── Thunk tests ───────────────────────────────────────────────────────────────

describe('orderSlice — fetchOrders thunk', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        (TokenService.getToken as jest.Mock).mockResolvedValue('mock-token');
    });

    it('dispatches fulfilled with orders on success', async () => {
        mockFetch({ status: true, data: mockOrders });

        const dispatch = jest.fn();
        const thunk    = fetchOrders();
        await thunk(dispatch, () => ({}), undefined);

        const fulfilledCall = dispatch.mock.calls.find(
            ([action]) => action.type === 'orders/fetchAll/fulfilled'
        );
        expect(fulfilledCall).toBeTruthy();
        expect(fulfilledCall[0].payload).toEqual(mockOrders);
    });

    it('calls fetch with correct URL and auth header', async () => {
        mockFetch({ status: true, data: mockOrders });

        const dispatch = jest.fn();
        await fetchOrders()(dispatch, () => ({}), undefined);

        expect(fetch).toHaveBeenCalledWith(
            'http://10.0.2.2:3000/order',
            expect.objectContaining({
                method:  'GET',
                headers: expect.objectContaining({
                    Authorization:  'Bearer mock-token',
                    'Content-Type': 'application/json',
                }),
            }),
        );
    });

    it('dispatches rejected when API returns status false', async () => {
        mockFetch({ status: false, message: 'Unauthorized' }, 401);

        const dispatch = jest.fn();
        await fetchOrders()(dispatch, () => ({}), undefined);

        const rejectedCall = dispatch.mock.calls.find(
            ([action]) => action.type === 'orders/fetchAll/rejected'
        );
        expect(rejectedCall).toBeTruthy();
        expect(rejectedCall[0].payload).toBe('Unauthorized');
    });

    it('dispatches rejected with fallback message when API has no message', async () => {
        mockFetch({ status: false }, 500);

        const dispatch = jest.fn();
        await fetchOrders()(dispatch, () => ({}), undefined);

        const rejectedCall = dispatch.mock.calls.find(
            ([action]) => action.type === 'orders/fetchAll/rejected'
        );
        expect(rejectedCall[0].payload).toBe('Failed to fetch orders');
    });

    it('dispatches rejected on network error', async () => {
        global.fetch = jest.fn().mockRejectedValue(new Error('Network request failed'));

        const dispatch = jest.fn();
        await fetchOrders()(dispatch, () => ({}), undefined);

        const rejectedCall = dispatch.mock.calls.find(
            ([action]) => action.type === 'orders/fetchAll/rejected'
        );
        expect(rejectedCall).toBeTruthy();
        expect(rejectedCall[0].payload).toBe('Network error. Please check your connection.');
    });

    it('dispatches rejected when response is not ok', async () => {
        mockFetch({ status: false, message: 'Server error' }, 500);

        const dispatch = jest.fn();
        await fetchOrders()(dispatch, () => ({}), undefined);

        const rejectedCall = dispatch.mock.calls.find(
            ([action]) => action.type === 'orders/fetchAll/rejected'
        );
        expect(rejectedCall).toBeTruthy();
    });

    it('uses token from TokenService in request', async () => {
        (TokenService.getToken as jest.Mock).mockResolvedValue('special-token');
        mockFetch({ status: true, data: [] });

        const dispatch = jest.fn();
        await fetchOrders()(dispatch, () => ({}), undefined);

        expect(fetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer special-token',
                }),
            }),
        );
    });
});