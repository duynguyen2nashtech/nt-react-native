import EncryptedStorage from 'react-native-encrypted-storage'

const TOKEN_KEY = 'auth_token';


export const TokenService = {
    async saveToken(token: string): Promise<void> {
        console.log('auth_token:', token);
        await EncryptedStorage.setItem(TOKEN_KEY, token);
    },

    async getToken(): Promise<string | null> {
        const token = await EncryptedStorage.getItem(TOKEN_KEY);
        console.log('Retrieved auth_token:', token);
        return token;
    },

    async clearAll(): Promise<void> {
        await EncryptedStorage.removeItem(TOKEN_KEY);
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