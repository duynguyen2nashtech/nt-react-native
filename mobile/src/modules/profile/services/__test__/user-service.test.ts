/**
 * Tests for user-service.ts
 * Location: src/modules/profile/services/__tests__/user-service.test.ts
 *
 * Run: npx jest user-service.test.ts
 */

import { UserService, ProfileData } from '../user-service';
import { TokenService } from '../../../../shared/services/token-service';
import { DatabaseService } from '../database-service';

// ── Mock dependencies ─────────────────────────────────────────────────────────

jest.mock('../../../../shared/services/token-service', () => ({
    TokenService: {
        saveToken: jest.fn(),
        getToken:  jest.fn(),
        clearAll:  jest.fn(),
    },
}));

jest.mock('../database-service', () => ({
    DatabaseService: {
        saveProfile:  jest.fn(),
        getProfile:   jest.fn(),
        clearProfile: jest.fn(),
    },
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockProfile: ProfileData = {
    id:        1,
    username:  'duynguyen',
    email:     'duy001@gmail.com',
    firstName: 'Duy',
    lastName:  'Nguyen',
    age:       18,
    role:      'admin',
};

// ✅ Valid JWT token with userId: 1 in payload
// payload = base64({ userId: 1 })
const mockToken = 'header.' + btoa(JSON.stringify({ userId: 1 })) + '.signature';

function mockFetch(body: object, status = 200) {
    global.fetch = jest.fn().mockResolvedValue({
        ok:     status >= 200 && status < 300,
        status,
        text: () => Promise.resolve(JSON.stringify(body)),
    }) as jest.Mock;
}

// ── register() ────────────────────────────────────────────────────────────────

describe('UserService.register()', () => {

    const payload = {
        firstName: 'Duy',
        lastName:  'Nguyen',
        email:     'duy001@gmail.com',
        username:  'duynguyen',
        password:  '12345678',
        role:      'admin',
        age:       18,
    };

    beforeEach(() => jest.clearAllMocks());

    it('saves token and profile on success', async () => {
        mockFetch({ status: true, data: { user: mockProfile, token: mockToken } });

        const result = await UserService.register(payload);

        expect(TokenService.saveToken).toHaveBeenCalledWith(mockToken);
        expect(DatabaseService.saveProfile).toHaveBeenCalledWith(mockProfile);
        expect(result).toEqual(mockProfile);
    });

    it('throws when API returns status false', async () => {
        mockFetch({ status: false, message: 'Username already exists' }, 400);

        await expect(UserService.register(payload)).rejects.toThrow('Username already exists');
        expect(TokenService.saveToken).not.toHaveBeenCalled();
        expect(DatabaseService.saveProfile).not.toHaveBeenCalled();
    });

    it('throws when response is not ok', async () => {
        mockFetch({ status: false, message: 'Server error' }, 500);

        await expect(UserService.register(payload)).rejects.toThrow('Server error');
    });

    it('uses fallback error message when API provides none', async () => {
        mockFetch({ status: false }, 400);

        await expect(UserService.register(payload)).rejects.toThrow('Registration failed');
    });
});

// ── getProfile() ──────────────────────────────────────────────────────────────

describe('UserService.getProfile()', () => {

    beforeEach(() => jest.clearAllMocks());

    it('fetches from API, saves to SQLite, and returns profile', async () => {
        (TokenService.getToken as jest.Mock).mockResolvedValue(mockToken);
        mockFetch({ status: true, data: mockProfile });

        const result = await UserService.getProfile();

        expect(fetch).toHaveBeenCalledWith(
            expect.stringContaining('/user'),
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: `Bearer ${mockToken}`,
                }),
            }),
        );
        expect(DatabaseService.saveProfile).toHaveBeenCalledWith(mockProfile);
        expect(result).toEqual(mockProfile);
    });

    // ✅ FIXED: no token → return null, NOT call DatabaseService.getProfile
    it('returns null when no token', async () => {
        (TokenService.getToken as jest.Mock).mockResolvedValue(null);

        const result = await UserService.getProfile();

        expect(fetch).not.toHaveBeenCalled();
        expect(DatabaseService.getProfile).not.toHaveBeenCalled();
        expect(result).toBeNull();
    });

    // ✅ FIXED: API fails → fallback uses getProfile(userId)
    it('falls back to SQLite with userId when API returns status false', async () => {
        (TokenService.getToken as jest.Mock).mockResolvedValue(mockToken);
        (DatabaseService.getProfile as jest.Mock).mockResolvedValue(mockProfile);
        mockFetch({ status: false });

        const result = await UserService.getProfile();

        expect(DatabaseService.saveProfile).not.toHaveBeenCalled();
        expect(DatabaseService.getProfile).toHaveBeenCalledWith(1); // ← userId from token
        expect(result).toEqual(mockProfile);
    });

    // ✅ FIXED: network error → fallback uses getProfile(userId)
    it('falls back to SQLite with userId on network error', async () => {
        (TokenService.getToken as jest.Mock).mockResolvedValue(mockToken);
        (DatabaseService.getProfile as jest.Mock).mockResolvedValue(mockProfile);
        global.fetch = jest.fn().mockRejectedValue(new Error('Network request failed'));

        const result = await UserService.getProfile();

        expect(DatabaseService.getProfile).toHaveBeenCalledWith(1); // ← userId from token
        expect(result).toEqual(mockProfile);
    });

    // ✅ FIXED: no token → null, DB never called
    it('returns null when no token and SQLite is empty', async () => {
        (TokenService.getToken as jest.Mock).mockResolvedValue(null);

        const result = await UserService.getProfile();

        expect(DatabaseService.getProfile).not.toHaveBeenCalled();
        expect(result).toBeNull();
    });

    // ✅ NEW: API fails + SQLite empty → null
    it('returns null when API fails and SQLite is empty', async () => {
        (TokenService.getToken as jest.Mock).mockResolvedValue(mockToken);
        (DatabaseService.getProfile as jest.Mock).mockResolvedValue(null);
        mockFetch({ status: false });

        const result = await UserService.getProfile();

        expect(DatabaseService.getProfile).toHaveBeenCalledWith(1);
        expect(result).toBeNull();
    });
});

// ── clearLocalProfile() ───────────────────────────────────────────────────────

describe('UserService.clearLocalProfile()', () => {

    beforeEach(() => jest.clearAllMocks());

    // ✅ FIXED: clearProfile now called with userId decoded from token
    it('clears token and SQLite profile for correct user', async () => {
        (TokenService.getToken as jest.Mock).mockResolvedValue(mockToken);
        (TokenService.clearAll as jest.Mock).mockResolvedValue(undefined);
        (DatabaseService.clearProfile as jest.Mock).mockResolvedValue(undefined);

        await UserService.clearLocalProfile();

        expect(DatabaseService.clearProfile).toHaveBeenCalledWith(1); // ← userId = 1
        expect(TokenService.clearAll).toHaveBeenCalled();
    });

    // ✅ NEW: no token → only clears TokenService, not DB
    it('only clears token when no token found', async () => {
        (TokenService.getToken as jest.Mock).mockResolvedValue(null);
        (TokenService.clearAll as jest.Mock).mockResolvedValue(undefined);

        await UserService.clearLocalProfile();

        expect(DatabaseService.clearProfile).not.toHaveBeenCalled();
        expect(TokenService.clearAll).toHaveBeenCalled();
    });
});