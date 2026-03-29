
import { TokenService } from '../../../shared/services/token-service';
import { DatabaseService } from './database-service';


const BASE_URL = 'http://10.0.2.2:3000';

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

        console.log('register status:', response.status);
        console.log('register raw:', rawText);

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

        console.log('[REGISTER] token & profile saved');

        return user;
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
                console.warn('getProfile: no token — reading from SQLite');
                return await DatabaseService.getProfile();
            }

            const response = await fetch(`${BASE_URL}/user`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            const rawText = await response.text();

            console.log('getProfile status:', response.status);
            console.log('getProfile raw:', rawText);

            const result = JSON.parse(rawText);

            if (result.status && result.data) {

                await DatabaseService.saveProfile(result.data);

                return result.data;
            }

            console.warn('API failed — fallback SQLite');

            return await DatabaseService.getProfile();

        } catch (e) {

            console.warn('network error — fallback SQLite', e);

            return await DatabaseService.getProfile();
        }
    },

    /**
     * Call this on logout to wipe the local SQLite profile.
     */
    async clearLocalProfile(): Promise<void> {
        await TokenService.clearAll();
        await DatabaseService.clearProfile();
    },
};