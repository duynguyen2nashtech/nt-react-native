import EncryptedStorage from 'react-native-encrypted-storage';
import { User } from '../../modules/auth/models/user';


const TOKEN_KEY = 'auth_token';
// const USER_KEY = 'auth_user';

export const TokenService = {
    async saveToken(token: string): Promise<void> {
        await EncryptedStorage.setItem(TOKEN_KEY, token);
    },

    async getToken(): Promise<string | null> {
        return await EncryptedStorage.getItem(TOKEN_KEY);
    },

    // async saveUser(user: User): Promise<void> {
    //     await EncryptedStorage.setItem(USER_KEY, JSON.stringify(user));
    // },

    // async getUser(): Promise<User | null> {
    //     const raw = await EncryptedStorage.getItem(USER_KEY);
    //     return raw ? JSON.parse(raw) : null;
    // },

    async clearAll(): Promise<void> {
        await EncryptedStorage.removeItem(TOKEN_KEY);
        // await EncryptedStorage.removeItem(USER_KEY);
    },

    async debugStorage(): Promise<void> {
        const token = await EncryptedStorage.getItem(TOKEN_KEY);
        // const user = await EncryptedStorage.getItem(USER_KEY);
        console.log('=== Encrypted Storage Debug ===');
        console.log('auth_token:', token);
        // console.log('auth_user:', user);
        console.log('===============================');
    },
};