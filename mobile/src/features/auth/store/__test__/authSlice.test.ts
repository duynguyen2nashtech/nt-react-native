/**
 * Tests for authSlice.ts
 * Location: src/modules/auth/store/__tests__/authSlice.test.ts
 *
 * Run: npx jest authSlice.test.ts
 */

import authReducer, {
    restoreSession,
    login,
    logout,
    selectIsLoggedIn,
    selectAuthLoading,
} from '../authSlice';
import { AuthService } from '../../services/auth-service';
import { UserService } from '../../../profile/services/userService';
import { TokenService } from '../../../../services/storage/tokenService';


// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../services/auth-service', () => ({
    AuthService: {
        login: jest.fn(),
    },
}));

jest.mock('../../../profile/services/user-service', () => ({
    UserService: {
        clearLocalProfile: jest.fn(),
    },
}));

jest.mock('../../../../shared/services/token-service', () => ({
    TokenService: {
        getToken: jest.fn(),
    },
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockUser = {
    userId:    1,
    username:  'duynguyen',
    email:     'duy001@gmail.com',
    firstName: 'Duy',
    lastName:  'Nguyen',
    role:      'admin',
    token:     'mock-token',
};

const initialState = {
    isLoggedIn: false,
    isLoading:  true,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

// function makeDispatch() {
//     return jest.fn((action: any) => {
//         if (typeof action === 'function') return action(makeDispatch(), () => ({}));
//         return action;
//     });
// }

// ── Reducer tests ─────────────────────────────────────────────────────────────

describe('authSlice — reducer', () => {

    it('returns initial state', () => {
        const state = authReducer(undefined, { type: '@@INIT' });
        expect(state).toEqual(initialState);
    });

    // ── restoreSession ─────────────────────────────────────────────────────────

    describe('restoreSession', () => {

        it('sets isLoggedIn true and isLoading false on fulfilled with token', () => {
            const action = restoreSession.fulfilled(true, '', undefined);
            const state  = authReducer(initialState, action);

            expect(state.isLoggedIn).toBe(true);
            expect(state.isLoading).toBe(false);
        });

        it('sets isLoggedIn false and isLoading false on fulfilled without token', () => {
            const action = restoreSession.fulfilled(false, '', undefined);
            const state  = authReducer(initialState, action);

            expect(state.isLoggedIn).toBe(false);
            expect(state.isLoading).toBe(false);
        });

        it('sets isLoggedIn false and isLoading false on rejected', () => {
            const action = restoreSession.rejected(new Error('error'), '', undefined);
            const state  = authReducer(initialState, action);

            expect(state.isLoggedIn).toBe(false);
            expect(state.isLoading).toBe(false);
        });
    });

    // ── login ──────────────────────────────────────────────────────────────────

    describe('login', () => {

        it('sets isLoggedIn true on fulfilled', () => {
            const action = login.fulfilled(true, '', { username: 'duynguyen', password: '12345678' });
            const state  = authReducer(initialState, action);

            expect(state.isLoggedIn).toBe(true);
        });

        it('does not change isLoggedIn on rejected', () => {
            const action = login.rejected(null, '', { username: 'duynguyen', password: 'wrong' }, 'Invalid username or password');
            const state  = authReducer(initialState, action);

            expect(state.isLoggedIn).toBe(false);
        });

        it('does not change isLoading on login fulfilled', () => {
            const action = login.fulfilled(true, '', { username: 'duynguyen', password: '12345678' });
            const state  = authReducer(initialState, action);

            expect(state.isLoading).toBe(true); // isLoading is unaffected by login
        });
    });

    // ── logout ─────────────────────────────────────────────────────────────────

    describe('logout', () => {

        it('sets isLoggedIn false on fulfilled', () => {
            const loggedInState = { isLoggedIn: true, isLoading: false };
            const action        = logout.fulfilled(undefined, '', undefined);
            const state         = authReducer(loggedInState, action);

            expect(state.isLoggedIn).toBe(false);
        });
    });
});

// ── Thunk tests ───────────────────────────────────────────────────────────────

describe('authSlice — thunks', () => {

    beforeEach(() => jest.clearAllMocks());

    // ── restoreSession ─────────────────────────────────────────────────────────

    describe('restoreSession', () => {

        it('returns true when token exists', async () => {
            (TokenService.getToken as jest.Mock).mockResolvedValue('valid-token');

            const dispatch = jest.fn();
            const thunk    = restoreSession();
            await thunk(dispatch, () => ({}), undefined);

            const [fulfilledCall] = dispatch.mock.calls.filter(
                ([action]) => action.type === 'auth/restoreSession/fulfilled'
            );
            expect(fulfilledCall[0].payload).toBe(true);
        });

        it('returns false when no token', async () => {
            (TokenService.getToken as jest.Mock).mockResolvedValue(null);

            const dispatch = jest.fn();
            const thunk    = restoreSession();
            await thunk(dispatch, () => ({}), undefined);

            const [fulfilledCall] = dispatch.mock.calls.filter(
                ([action]) => action.type === 'auth/restoreSession/fulfilled'
            );
            expect(fulfilledCall[0].payload).toBe(false);
        });

        it('dispatches rejected when TokenService throws', async () => {
            (TokenService.getToken as jest.Mock).mockRejectedValue(new Error('Storage error'));

            const dispatch = jest.fn();
            const thunk    = restoreSession();
            await thunk(dispatch, () => ({}), undefined);

            const rejectedCall = dispatch.mock.calls.find(
                ([action]) => action.type === 'auth/restoreSession/rejected'
            );
            expect(rejectedCall).toBeTruthy();
        });
    });

    // ── login ──────────────────────────────────────────────────────────────────

    describe('login', () => {

        it('dispatches fulfilled when AuthService returns user', async () => {
            (AuthService.login as jest.Mock).mockResolvedValue({ user: mockUser, token: 'mock-token' });

            const dispatch = jest.fn();
            const thunk    = login({ username: 'duynguyen', password: '12345678' });
            await thunk(dispatch, () => ({}), undefined);

            const fulfilledCall = dispatch.mock.calls.find(
                ([action]) => action.type === 'auth/login/fulfilled'
            );
            expect(fulfilledCall).toBeTruthy();
            expect(fulfilledCall[0].payload).toBe(true);
        });

        it('dispatches rejected when AuthService returns null', async () => {
            (AuthService.login as jest.Mock).mockResolvedValue(null);

            const dispatch = jest.fn();
            const thunk    = login({ username: 'duynguyen', password: 'wrong' });
            await thunk(dispatch, () => ({}), undefined);

            const rejectedCall = dispatch.mock.calls.find(
                ([action]) => action.type === 'auth/login/rejected'
            );
            expect(rejectedCall).toBeTruthy();
            expect(rejectedCall[0].payload).toBe('Invalid username or password');
        });

        it('dispatches rejected when AuthService returns result without user', async () => {
            (AuthService.login as jest.Mock).mockResolvedValue({ user: null, token: null });

            const dispatch = jest.fn();
            const thunk    = login({ username: 'duynguyen', password: 'wrong' });
            await thunk(dispatch, () => ({}), undefined);

            const rejectedCall = dispatch.mock.calls.find(
                ([action]) => action.type === 'auth/login/rejected'
            );
            expect(rejectedCall).toBeTruthy();
        });

        it('dispatches rejected when AuthService throws', async () => {
            (AuthService.login as jest.Mock).mockRejectedValue(new Error('Network error'));

            const dispatch = jest.fn();
            const thunk    = login({ username: 'duynguyen', password: '12345678' });
            await thunk(dispatch, () => ({}), undefined);

            const rejectedCall = dispatch.mock.calls.find(
                ([action]) => action.type === 'auth/login/rejected'
            );
            expect(rejectedCall).toBeTruthy();
        });

        it('calls AuthService.login with correct credentials', async () => {
            (AuthService.login as jest.Mock).mockResolvedValue({ user: mockUser, token: 'mock-token' });

            const dispatch = jest.fn();
            const thunk    = login({ username: 'duynguyen', password: '12345678' });
            await thunk(dispatch, () => ({}), undefined);

            expect(AuthService.login).toHaveBeenCalledWith('duynguyen', '12345678');
        });
    });

    // ── logout ─────────────────────────────────────────────────────────────────

    describe('logout', () => {

        it('calls UserService.clearLocalProfile', async () => {
            (UserService.clearLocalProfile as jest.Mock).mockResolvedValue(undefined);

            const dispatch = jest.fn();
            const thunk    = logout();
            await thunk(dispatch, () => ({}), undefined);

            expect(UserService.clearLocalProfile).toHaveBeenCalledTimes(1);
        });

        it('dispatches fulfilled after clearing profile', async () => {
            (UserService.clearLocalProfile as jest.Mock).mockResolvedValue(undefined);

            const dispatch = jest.fn();
            const thunk    = logout();
            await thunk(dispatch, () => ({}), undefined);

            const fulfilledCall = dispatch.mock.calls.find(
                ([action]) => action.type === 'auth/logout/fulfilled'
            );
            expect(fulfilledCall).toBeTruthy();
        });

        it('dispatches rejected when clearLocalProfile throws', async () => {
            (UserService.clearLocalProfile as jest.Mock).mockRejectedValue(new Error('DB error'));

            const dispatch = jest.fn();
            const thunk    = logout();
            await thunk(dispatch, () => ({}), undefined);

            const rejectedCall = dispatch.mock.calls.find(
                ([action]) => action.type === 'auth/logout/rejected'
            );
            expect(rejectedCall).toBeTruthy();
        });
    });
});

// ── Selector tests ────────────────────────────────────────────────────────────

describe('authSlice — selectors', () => {

    const mockRootState = (auth: { isLoggedIn: boolean; isLoading: boolean }) => ({
        auth,
    } as any);

    describe('selectIsLoggedIn', () => {

        it('returns true when isLoggedIn is true', () => {
            const state = mockRootState({ isLoggedIn: true, isLoading: false });
            expect(selectIsLoggedIn(state)).toBe(true);
        });

        it('returns false when isLoggedIn is false', () => {
            const state = mockRootState({ isLoggedIn: false, isLoading: false });
            expect(selectIsLoggedIn(state)).toBe(false);
        });
    });

    describe('selectAuthLoading', () => {

        it('returns true when isLoading is true', () => {
            const state = mockRootState({ isLoggedIn: false, isLoading: true });
            expect(selectAuthLoading(state)).toBe(true);
        });

        it('returns false when isLoading is false', () => {
            const state = mockRootState({ isLoggedIn: false, isLoading: false });
            expect(selectAuthLoading(state)).toBe(false);
        });
    });
});