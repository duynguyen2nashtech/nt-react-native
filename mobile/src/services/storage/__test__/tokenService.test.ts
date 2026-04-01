
import { TokenService } from '../tokenService';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockSetItem    = jest.fn();
const mockGetItem    = jest.fn();
const mockRemoveItem = jest.fn();

jest.mock('react-native-encrypted-storage', () => ({
    __esModule: true,
    default: {
        setItem:    (...args: any[]) => mockSetItem(...args),
        getItem:    (...args: any[]) => mockGetItem(...args),
        removeItem: (...args: any[]) => mockRemoveItem(...args),
    },
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock';

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => jest.clearAllMocks());

// ── saveToken ─────────────────────────────────────────────────────────────────

describe('TokenService.saveToken', () => {

    it('calls EncryptedStorage.setItem with correct key and token', async () => {
        mockSetItem.mockResolvedValue(undefined);

        await TokenService.saveToken(mockToken);

        expect(mockSetItem).toHaveBeenCalledWith('auth_token', mockToken);
    });

    it('calls setItem exactly once', async () => {
        mockSetItem.mockResolvedValue(undefined);

        await TokenService.saveToken(mockToken);

        expect(mockSetItem).toHaveBeenCalledTimes(1);
    });

    it('throws when EncryptedStorage fails', async () => {
        mockSetItem.mockRejectedValue(new Error('Storage error'));

        await expect(TokenService.saveToken(mockToken)).rejects.toThrow('Storage error');
    });
});

// ── getToken ──────────────────────────────────────────────────────────────────

describe('TokenService.getToken', () => {

    it('returns token when it exists', async () => {
        mockGetItem.mockResolvedValue(mockToken);

        const result = await TokenService.getToken();

        expect(result).toBe(mockToken);
    });

    it('returns null when token does not exist', async () => {
        mockGetItem.mockResolvedValue(null);

        const result = await TokenService.getToken();

        expect(result).toBeNull();
    });

    it('calls getItem with correct key', async () => {
        mockGetItem.mockResolvedValue(mockToken);

        await TokenService.getToken();

        expect(mockGetItem).toHaveBeenCalledWith('auth_token');
    });

    it('throws when EncryptedStorage fails', async () => {
        mockGetItem.mockRejectedValue(new Error('Storage error'));

        await expect(TokenService.getToken()).rejects.toThrow('Storage error');
    });
});

// ── clearAll ──────────────────────────────────────────────────────────────────

describe('TokenService.clearAll', () => {

    it('removes auth_token key', async () => {
        mockRemoveItem.mockResolvedValue(undefined);

        await TokenService.clearAll();

        expect(mockRemoveItem).toHaveBeenCalledWith('auth_token');
    });

    it('calls removeItem exactly once', async () => {
        // ✅ FIXED: was 'twice' — saveUser removed so only token is cleared now
        mockRemoveItem.mockResolvedValue(undefined);

        await TokenService.clearAll();

        expect(mockRemoveItem).toHaveBeenCalledTimes(1);
    });

    it('throws when EncryptedStorage fails', async () => {
        mockRemoveItem.mockRejectedValue(new Error('Storage error'));

        await expect(TokenService.clearAll()).rejects.toThrow('Storage error');
    });
});

// ── debugStorage ──────────────────────────────────────────────────────────────

describe('TokenService.debugStorage', () => {

    it('calls getItem for auth_token key only', async () => {
        // ✅ FIXED: was checking both token and user — user key removed
        mockGetItem.mockResolvedValue(null);
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await TokenService.debugStorage();

        expect(mockGetItem).toHaveBeenCalledWith('auth_token');
        expect(mockGetItem).toHaveBeenCalledTimes(1); // ← only one key now
        consoleSpy.mockRestore();
    });

    it('logs debug header and footer', async () => {
        mockGetItem.mockResolvedValue(null);
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await TokenService.debugStorage();

        expect(consoleSpy).toHaveBeenCalledWith('=== Encrypted Storage Debug ===');
        expect(consoleSpy).toHaveBeenCalledWith('===============================');
        consoleSpy.mockRestore();
    });

    it('logs token value when token exists', async () => {
        mockGetItem.mockResolvedValue(mockToken);
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await TokenService.debugStorage();

        expect(consoleSpy).toHaveBeenCalledWith('auth_token:', mockToken);
        consoleSpy.mockRestore();
    });

    it('logs null when token does not exist', async () => {
        mockGetItem.mockResolvedValue(null);
        const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});

        await TokenService.debugStorage();

        expect(consoleSpy).toHaveBeenCalledWith('auth_token:', null);
        consoleSpy.mockRestore();
    });
});