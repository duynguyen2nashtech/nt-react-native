
import { BASE_URL } from './api/client';
import { TokenService } from './storage/tokenService';


// ─── Types ────────────────────────────────────────────────────────────────────
export interface Review {
    id: number;
    productId: number;
    userId: number;
    userName: string;
    avatar?: string;
    rating: number;
    message: string;
    comment: string;
    createdAt: string;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    image: string;
    price: number;
    priceUnit: string;
    originalPrice?: number;
    badge?: string;
    rating?: number;
    reviewCount?: number;
    battery?: string;
    connectivity?: string;
    waterResistance?: string;
    warranty?: string;
    reviews?: Review[];
    createdAt: string;
    updatedAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
async function authHeaders(): Promise<Record<string, string>> {
    const token = await TokenService.getToken();
    return {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
    };
}

// ─── Service ──────────────────────────────────────────────────────────────────
export const ProductService = {
    async getProducts(): Promise<Product[]> {
        try {
            const response = await fetch(`${BASE_URL}/product`, {
                method: 'GET',
                headers: await authHeaders(),
            });
            const result = await response.json();
            if (result.status) return result.data;
            return [];
        } catch (e) {
            console.warn('getProducts error:', e);
            return [];
        }
    },

    async getProductById(id: number): Promise<Product | null> {
        try {
            const response = await fetch(`${BASE_URL}/product/${id}`, {
                method: 'GET',
                headers: await authHeaders(),
            });
            const result = await response.json();
            if (result.status) return result.data;
            return null;
        } catch (e) {
            console.warn('getProductById error:', e);
            return null;
        }
    },

    async getReviews(productId: number): Promise<Review[]> {
        try {
            const response = await fetch(`${BASE_URL}/product/${productId}/review`, {
                method: 'GET',
                headers: await authHeaders(),
            });
            const result = await response.json();
            if (result.status && Array.isArray(result.data)) return result.data;
            return [];
        } catch (e) {
            console.warn('getReviews error:', e);
            return [];
        }
    },

    async toggleFavorite(id: number, isFavorited: boolean): Promise<boolean> {
        try {
            const method = isFavorited ? 'DELETE' : 'POST';
            const response = await fetch(`${BASE_URL}/product/${id}/favorite`, {
                method,
                headers: await authHeaders(),
            });
            const result = await response.json();
            return result.status ?? false;
        } catch (e) {
            console.warn('toggleFavorite error:', e);
            return false;
        }
    },

    async addToCart(id: number, quantity: number): Promise<boolean> {
        try {
            const response = await fetch(`${BASE_URL}/cart/items`, {
                method: 'POST',
                headers: await authHeaders(),
                body: JSON.stringify({ productId: id, quantity }),
            });
            const result = await response.json();
            return result.status ?? false;
        } catch (e) {
            console.warn('addToCart error:', e);
            return false;
        }
    },
};