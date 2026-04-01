/**
 * Tests for ProductService
 * Location: src/shared/services/__tests__/product-service.test.ts
 *
 * Run: npx jest product-service.test.ts
 */

import { ProductService } from '../productService';
import { TokenService } from '../storage/tokenService';


// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../token-service');

const mockFetch = jest.fn();
global.fetch = mockFetch;

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockProduct = {
    id: 1,
    name: 'Microsoft Sculpt Ergonomic Keyboard',
    description: 'Best budget ergonomic keyboard.',
    image: 'https://example.com/image.jpg',
    price: 80.95,
    priceUnit: 'dollar',
    createdAt: '2023-05-12T10:44:52.624Z',
    updatedAt: '2026-03-26T04:36:10.127Z',
};

function mockResponse(data: any, status = true) {
    return {
        json: jest.fn().mockResolvedValue({ status, data }),
    };
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
    (TokenService.getToken as jest.Mock).mockResolvedValue('mock-token');
});

// ── getProducts ───────────────────────────────────────────────────────────────

describe('ProductService.getProducts', () => {

    it('returns products array on success', async () => {
        mockFetch.mockResolvedValue(mockResponse([mockProduct]));

        const result = await ProductService.getProducts();

        expect(result).toHaveLength(1);
        expect(result[0].id).toBe(1);
    });

    it('returns empty array when status is false', async () => {
        mockFetch.mockResolvedValue(mockResponse([], false));

        const result = await ProductService.getProducts();

        expect(result).toEqual([]);
    });

    it('returns empty array on network error', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));

        const result = await ProductService.getProducts();

        expect(result).toEqual([]);
    });

    it('calls fetch with Authorization header', async () => {
        mockFetch.mockResolvedValue(mockResponse([mockProduct]));

        await ProductService.getProducts();

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/product'),
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: 'Bearer mock-token',
                }),
            })
        );
    });

    it('returns multiple products', async () => {
        const products = [mockProduct, { ...mockProduct, id: 2, name: 'Logitech' }];
        mockFetch.mockResolvedValue(mockResponse(products));

        const result = await ProductService.getProducts();

        expect(result).toHaveLength(2);
    });
});

// ── getProductById ────────────────────────────────────────────────────────────

describe('ProductService.getProductById', () => {

    it('returns product on success', async () => {
        mockFetch.mockResolvedValue(mockResponse(mockProduct));

        const result = await ProductService.getProductById(1);

        expect(result).toEqual(mockProduct);
        expect(result?.id).toBe(1);
    });

    it('returns null when status is false', async () => {
        mockFetch.mockResolvedValue(mockResponse(null, false));

        const result = await ProductService.getProductById(99);

        expect(result).toBeNull();
    });

    it('returns null on network error', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));

        const result = await ProductService.getProductById(1);

        expect(result).toBeNull();
    });

    it('calls fetch with correct product id in URL', async () => {
        mockFetch.mockResolvedValue(mockResponse(mockProduct));

        await ProductService.getProductById(42);

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/product/42'),
            expect.any(Object)
        );
    });
});

// ── addToCart ─────────────────────────────────────────────────────────────────

describe('ProductService.addToCart', () => {

    it('returns true on success', async () => {
        mockFetch.mockResolvedValue(mockResponse(null, true));

        const result = await ProductService.addToCart(1, 2);

        expect(result).toBe(true);
    });

    it('returns false when status is false', async () => {
        mockFetch.mockResolvedValue(mockResponse(null, false));

        const result = await ProductService.addToCart(1, 1);

        expect(result).toBe(false);
    });

    it('returns false on network error', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));

        const result = await ProductService.addToCart(1, 1);

        expect(result).toBe(false);
    });

    it('calls fetch with POST method', async () => {
        mockFetch.mockResolvedValue(mockResponse(null, true));

        await ProductService.addToCart(1, 3);

        expect(mockFetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({ method: 'POST' })
        );
    });

    it('sends productId and quantity in request body', async () => {
        mockFetch.mockResolvedValue(mockResponse(null, true));

        await ProductService.addToCart(5, 3);

        expect(mockFetch).toHaveBeenCalledWith(
            expect.any(String),
            expect.objectContaining({
                body: JSON.stringify({ productId: 5, quantity: 3 }),
            })
        );
    });
});