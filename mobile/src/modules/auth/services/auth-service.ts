import { TokenService } from '../../../shared/services/token-service';
import { DatabaseService } from '../../profile/services/database-service';
import { ProfileData } from '../../profile/services/user-service';
import { User } from '../models/user';

const BASE_URL = 'http://10.0.2.2:3000';

export interface RegisterPayload {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
    password: string;
    role: string;
    age: number;
}

export const AuthService = {

    /**
     * POST /login
     * Returns the logged-in User and token, or null on failure.
     */
    async login(username: string, password: string): Promise<{ user: User; token: string } | null> {
        const response = await fetch(`${BASE_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        const result = await response.json();

        if (!result.status) return null;

        const newToken: string = result.data.token;
        const userData = result.data.user;

        const user: User = {
            userId:    userData.id,
            username:  userData.username,
            email:     userData.email,
            firstName: userData.firstName,
            lastName:  userData.lastName,
            role:      userData.role,
            token:     newToken,
        };

        await Promise.all([
            TokenService.saveToken(newToken),
        ]);

        return { user, token: newToken };
    },

    /**
     * GET /me
     * Restores session from a saved token. Returns User or null if token is invalid/expired.
     */
    async fetchProfile(authToken: string): Promise<User | null> {
        try {
            const response = await fetch(`${BASE_URL}/me`, {
                headers: { Authorization: `Bearer ${authToken}` },
            });

            const result = await response.json();

            if (!result.status) return null;

            return {
                userId:    result.data.user.id,
                username:  result.data.user.username,
                email:     result.data.user.email,
                firstName: result.data.user.firstName,
                lastName:  result.data.user.lastName,
                role:      result.data.user.role,
                token:     authToken,
            };
        } catch (e) {
            console.warn('[AUTH] fetchProfile error:', e);
            return null;
        }
    },

    /**
     * POST /signup
     * Registers a new user, saves token and profile locally.
     */
    async register(payload: RegisterPayload): Promise<ProfileData> {
        const response = await fetch(`${BASE_URL}/signup`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        const rawText = await response.text();

        const result = JSON.parse(rawText);

        if (!response.ok || !result.status) {
            throw new Error(result.message ?? 'Registration failed');
        }

        const user: ProfileData = result.data.user;
        const token: string = result.data.token;

        await TokenService.saveToken(token);
        await DatabaseService.saveProfile(user);

        return user;
    },
};