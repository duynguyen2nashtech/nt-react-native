import { AuthService, RegisterPayload } from '../authService';

import { DatabaseService } from '../../../profile/services/databaseService';
import { TokenService } from '../../../../services/storage/tokenService';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../../../services/storage/tokenService');
jest.mock('../../../profile/services/databaseService');

const mockFetch = jest.fn();
global.fetch = mockFetch;

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockUserResponse = {
    id:        1,
    username:  'duynguyen',
    email:     'duy001@gmail.com',
    firstName: 'Duy',
    lastName:  'Nguyen',
    role:      'admin',
};

const mockToken = 'mock-jwt-token';

const mockLoginResponse = {
    status: true,
    data: {
        token: mockToken,
        user:  mockUserResponse,
    },
};

const mockProfileResponse = {
    status: true,
    data: {
        user: mockUserResponse,
    },
};

const mockRegisterPayload: RegisterPayload = {
    firstName: 'Duy',
    lastName:  'Nguyen',
    email:     'duy001@gmail.com',
    username:  'duynguyen',
    password:  '12345678',
    role:      'user',
    age:       18,
};

const mockProfileData = {
    id:        1,
    username:  'duynguyen',
    email:     'duy001@gmail.com',
    firstName: 'Duy',
    lastName:  'Nguyen',
    age:       18,
    role:      'user',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function mockJsonResponse(data: any, ok = true) {
    return {
        ok,
        json:    jest.fn().mockResolvedValue(data),
        text:    jest.fn().mockResolvedValue(JSON.stringify(data)),
        status:  ok ? 200 : 400,
    };
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => {
    jest.clearAllMocks();
    (TokenService.saveToken as jest.Mock).mockResolvedValue(undefined);
    (DatabaseService.saveProfile as jest.Mock).mockResolvedValue(undefined);
});

// ── login ─────────────────────────────────────────────────────────────────────

describe('AuthService.login', () => {

    it('returns user and token on success', async () => {
        mockFetch.mockResolvedValue(mockJsonResponse(mockLoginResponse));

        const result = await AuthService.login('duynguyen', '12345678');

        expect(result).not.toBeNull();
        expect(result?.token).toBe(mockToken);
        expect(result?.user.username).toBe('duynguyen');
        expect(result?.user.email).toBe('duy001@gmail.com');
    });

    it('maps API response fields to User model correctly', async () => {
        mockFetch.mockResolvedValue(mockJsonResponse(mockLoginResponse));

        const result = await AuthService.login('duynguyen', '12345678');

        expect(result?.user).toMatchObject({
            userId:    mockUserResponse.id,
            username:  mockUserResponse.username,
            email:     mockUserResponse.email,
            firstName: mockUserResponse.firstName,
            lastName:  mockUserResponse.lastName,
            role:      mockUserResponse.role,
            token:     mockToken,
        });
    });

    it('returns null when status is false', async () => {
        mockFetch.mockResolvedValue(mockJsonResponse({ status: false }));

        const result = await AuthService.login('wrong', 'wrong');

        expect(result).toBeNull();
    });

    it('saves token after successful login', async () => {
        mockFetch.mockResolvedValue(mockJsonResponse(mockLoginResponse));

        await AuthService.login('duynguyen', '12345678');

        expect(TokenService.saveToken).toHaveBeenCalledWith(mockToken);
    });


    it('does not save token when login fails', async () => {
        mockFetch.mockResolvedValue(mockJsonResponse({ status: false }));

        await AuthService.login('wrong', 'wrong');

        expect(TokenService.saveToken).not.toHaveBeenCalled();
    });

    it('calls POST /login with correct body', async () => {
        mockFetch.mockResolvedValue(mockJsonResponse(mockLoginResponse));

        await AuthService.login('duynguyen', '12345678');

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/login'),
            expect.objectContaining({
                method: 'POST',
                body:   JSON.stringify({ username: 'duynguyen', password: '12345678' }),
            })
        );
    });

    it('throws on network error', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));

        await expect(AuthService.login('duynguyen', '12345678')).rejects.toThrow();
    });
});

// ── fetchProfile ──────────────────────────────────────────────────────────────

describe('AuthService.fetchProfile', () => {

    it('returns user on success', async () => {
        mockFetch.mockResolvedValue(mockJsonResponse(mockProfileResponse));

        const result = await AuthService.fetchProfile(mockToken);

        expect(result).not.toBeNull();
        expect(result?.username).toBe('duynguyen');
        expect(result?.token).toBe(mockToken);
    });

    it('maps API response fields to User model correctly', async () => {
        mockFetch.mockResolvedValue(mockJsonResponse(mockProfileResponse));

        const result = await AuthService.fetchProfile(mockToken);

        expect(result).toMatchObject({
            userId:    mockUserResponse.id,
            username:  mockUserResponse.username,
            email:     mockUserResponse.email,
            firstName: mockUserResponse.firstName,
            lastName:  mockUserResponse.lastName,
            role:      mockUserResponse.role,
        });
    });

    it('returns null when status is false', async () => {
        mockFetch.mockResolvedValue(mockJsonResponse({ status: false }));

        const result = await AuthService.fetchProfile(mockToken);

        expect(result).toBeNull();
    });

    it('returns null on network error', async () => {
        mockFetch.mockRejectedValue(new Error('Network error'));

        const result = await AuthService.fetchProfile(mockToken);

        expect(result).toBeNull();
    });

    it('calls GET /me with Authorization header', async () => {
        mockFetch.mockResolvedValue(mockJsonResponse(mockProfileResponse));

        await AuthService.fetchProfile(mockToken);

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/me'),
            expect.objectContaining({
                headers: expect.objectContaining({
                    Authorization: `Bearer ${mockToken}`,
                }),
            })
        );
    });
});

// ── register ──────────────────────────────────────────────────────────────────

describe('AuthService.register', () => {

    it('returns ProfileData on success', async () => {
        mockFetch.mockResolvedValue(mockJsonResponse({
            status: true,
            data: { user: mockProfileData, token: mockToken },
        }));

        const result = await AuthService.register(mockRegisterPayload);

        expect(result).toEqual(mockProfileData);
    });

    it('saves token after successful registration', async () => {
        mockFetch.mockResolvedValue(mockJsonResponse({
            status: true,
            data: { user: mockProfileData, token: mockToken },
        }));

        await AuthService.register(mockRegisterPayload);

        expect(TokenService.saveToken).toHaveBeenCalledWith(mockToken);
    });

    it('saves profile to database after successful registration', async () => {
        mockFetch.mockResolvedValue(mockJsonResponse({
            status: true,
            data: { user: mockProfileData, token: mockToken },
        }));

        await AuthService.register(mockRegisterPayload);

        expect(DatabaseService.saveProfile).toHaveBeenCalledWith(mockProfileData);
    });

    it('throws when response is not ok', async () => {
        mockFetch.mockResolvedValue(mockJsonResponse(
            { status: false, message: 'Username already exists' },
            false
        ));

        await expect(AuthService.register(mockRegisterPayload))
            .rejects.toThrow('Username already exists');
    });

    it('throws with fallback message when no message in response', async () => {
        mockFetch.mockResolvedValue(mockJsonResponse(
            { status: false },
            false
        ));

        await expect(AuthService.register(mockRegisterPayload))
            .rejects.toThrow('Registration failed');
    });

    it('does not save token when registration fails', async () => {
        mockFetch.mockResolvedValue(mockJsonResponse(
            { status: false, message: 'Error' },
            false
        ));

        try { await AuthService.register(mockRegisterPayload); } catch {}

        expect(TokenService.saveToken).not.toHaveBeenCalled();
    });

    it('does not save profile when registration fails', async () => {
        mockFetch.mockResolvedValue(mockJsonResponse(
            { status: false, message: 'Error' },
            false
        ));

        try { await AuthService.register(mockRegisterPayload); } catch {}

        expect(DatabaseService.saveProfile).not.toHaveBeenCalled();
    });

    it('calls POST /signup with correct payload', async () => {
        mockFetch.mockResolvedValue(mockJsonResponse({
            status: true,
            data: { user: mockProfileData, token: mockToken },
        }));

        await AuthService.register(mockRegisterPayload);

        expect(mockFetch).toHaveBeenCalledWith(
            expect.stringContaining('/signup'),
            expect.objectContaining({
                method: 'POST',
                body:   JSON.stringify(mockRegisterPayload),
            })
        );
    });

    it('throws when status is false but response is ok', async () => {
        mockFetch.mockResolvedValue(mockJsonResponse(
            { status: false, message: 'Validation error' },
            true
        ));

        await expect(AuthService.register(mockRegisterPayload))
            .rejects.toThrow('Validation error');
    });
});