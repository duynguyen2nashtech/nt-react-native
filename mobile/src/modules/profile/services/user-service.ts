
import { decode } from 'base-64';
import { TokenService } from '../../../shared/services/token-service';
import { DatabaseService } from './database-service';
import { BASE_URL } from '../../../shared/config/api-config';




function decodeUserIdFromToken(token: string): number {
    try {
        const payload = token.split('.')[1]
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const padded  = payload + '='.repeat((4 - payload.length % 4) % 4);
        const decoded = JSON.parse(decode(padded));
        return decoded.userId ?? decoded.id ?? decoded.sub;
    } catch (e) {
        console.warn('[decodeUserIdFromToken] Failed to decode token', e);
        return -1;
    }
}

export interface ProfileData {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    age: number;
    role: string;
}

export interface RegisterPayload {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    role: string;
    age: number;
}

export interface UserSummary {
    id: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    age?: number;
    role: string;
    createdAt: string;
    updatedAt: string;
}

export const UserService = {

    /**
     * POST /signup
     * Registers a new user. If the API returns profile data, saves it to local SQLite.
     */
    async register(payload: RegisterPayload): Promise<ProfileData> {

        const response = await fetch(`${BASE_URL}/signup`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload),
        });

        const rawText = await response.text();

        const result = JSON.parse(rawText);

        if (!response.ok || !result.status) {
            throw new Error(result.message ?? 'Registration failed');
        }

        const user = result.data.user;
        const token = result.data.token;

        // save token
        await TokenService.saveToken(token);

        // save profile
        await DatabaseService.saveProfile(user);

        return user;
    },

        async getAll(): Promise<UserSummary[]> {
        try {
            const token = await TokenService.getToken();
            if (!token) return [];
 
            const response = await fetch(`${BASE_URL}/user/all`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
 
            const rawText = await response.text();
            const result  = JSON.parse(rawText);
 
            if (result.status && Array.isArray(result.data)) return result.data;
            return [];
        } catch (e) {
            console.warn('UserService.getAll error:', e);
            return [];
        }
    },

    /**
     * GET /user
     * Fetches profile from API and saves to local SQLite.
     * Falls back to local SQLite if network fails.
     */
    async getProfile(): Promise<ProfileData | null> {
        try {
            const token = await TokenService.getToken();

            if (!token) {
                console.warn('getProfile: no token — redirecting to login');
                return null; 
            }

            const response = await fetch(`${BASE_URL}/user`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });


            if (response.status === 401) {
                console.warn('getProfile: token expired');
                return null;
            }

            const rawText = await response.text();
            const result  = JSON.parse(rawText);

            if (result.status && result.data) {
                await DatabaseService.saveProfile(result.data);
                return result.data;
            }

            // ── API failed but token still valid — try SQLite ─────────────
            const userId = decodeUserIdFromToken(token);
            if (userId === -1) return null; 
            return await DatabaseService.getProfile(userId);

        } catch (e) {
            console.warn('network error — fallback SQLite', e);
            const token = await TokenService.getToken();
            if (!token) return null;

            const userId = decodeUserIdFromToken(token);
            if (userId === -1) return null;
            return await DatabaseService.getProfile(userId);
        }
    },

    async updateProfile(payload: { firstName: string; lastName: string; age: number }) {
        const token = await TokenService.getToken();

        const response = await fetch(`${BASE_URL}/user`, {  
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                Authorization:  `Bearer ${token}`,         
            },
            body: JSON.stringify(payload),
        });

        const rawText = await response.text();
        const result  = JSON.parse(rawText);

        if (!response.ok || !result.status) {
            throw new Error(result.message ?? 'Update failed');
        }

        // Keep local SQLite in sync after a successful update
        if (result.data) {
            await DatabaseService.saveProfile(result.data);
        }

        return result.data;
    },

    /**
     * Call this on logout to wipe the local SQLite profile.
     */
    async clearLocalProfile(): Promise<void> {
        const token = await TokenService.getToken();

        if (token) {
            const userId = decodeUserIdFromToken(token);
            if (userId !== -1) {
                await DatabaseService.clearProfile(userId);
            }
        }

        await TokenService.clearAll();
    },
};