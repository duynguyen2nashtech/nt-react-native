/**
 * Tests for AuthContext
 * Location: src/modules/auth/context/__tests__/auth-context.test.tsx
 *
 * Run: npx jest auth-context.test.tsx
 */

import React from 'react';
import { act, renderHook } from '@testing-library/react-native';
import { AuthProvider, useAuth } from '../auth-context';
import { AuthService } from '../../services/auth-service';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../services/auth-service');

// ❌ REMOVED: jest.mock('../../../../stores/store', ...)
// ❌ REMOVED: jest.mock('../../store/authSlice', ...)
// AuthContext no longer touches Redux at all

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockUser = { id: '1', username: 'duynguyen', email: 'duy001@gmail.com' };

// ── Helpers ───────────────────────────────────────────────────────────────────

const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AuthProvider>{children}</AuthProvider>
);

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => jest.clearAllMocks());

// ── Initial state ─────────────────────────────────────────────────────────────

describe('AuthContext — initial state', () => {

    it('provides null user initially', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });
        expect(result.current.user).toBeNull();
    });

    it('exposes login and signOut functions', () => {
        const { result } = renderHook(() => useAuth(), { wrapper });
        expect(typeof result.current.login).toBe('function');
        expect(typeof result.current.signOut).toBe('function');
        // ❌ REMOVED: setUser check — no longer in interface
    });
});

// ── login ─────────────────────────────────────────────────────────────────────

describe('AuthContext — login', () => {

    it('returns true and sets user on successful login', async () => {
        (AuthService.login as jest.Mock).mockResolvedValue({ user: mockUser });
        const { result } = renderHook(() => useAuth(), { wrapper });

        let success: boolean;
        await act(async () => {
            success = await result.current.login('duynguyen', '12345678');
        });

        expect(success!).toBe(true);
        expect(result.current.user).toEqual(mockUser);
    });

    it('returns false when AuthService returns null', async () => {
        (AuthService.login as jest.Mock).mockResolvedValue(null);
        const { result } = renderHook(() => useAuth(), { wrapper });

        let success: boolean;
        await act(async () => {
            success = await result.current.login('wrong', 'wrong');
        });

        expect(success!).toBe(false);
        expect(result.current.user).toBeNull();
    });

    it('returns false on AuthService error', async () => {
        (AuthService.login as jest.Mock).mockRejectedValue(new Error('Network error'));
        const { result } = renderHook(() => useAuth(), { wrapper });

        let success: boolean;
        await act(async () => {
            success = await result.current.login('duynguyen', '12345678');
        });

        expect(success!).toBe(false);
        expect(result.current.user).toBeNull();
    });

    it('calls AuthService.login with correct credentials', async () => {
        (AuthService.login as jest.Mock).mockResolvedValue({ user: mockUser });
        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => {
            await result.current.login('duynguyen', '12345678');
        });

        expect(AuthService.login).toHaveBeenCalledWith('duynguyen', '12345678');
    });
});

// ── signOut ───────────────────────────────────────────────────────────────────
// ❌ REMOVED: entire setUser describe block — setUser no longer exists in context

describe('AuthContext — signOut', () => {

    it('clears user after signOut', async () => {
        (AuthService.login as jest.Mock).mockResolvedValue({ user: mockUser });
        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => { await result.current.login('duynguyen', '12345678'); });
        expect(result.current.user).toEqual(mockUser);

        await act(async () => { result.current.signOut(); });
        expect(result.current.user).toBeNull();
    });

    it('user is null after signOut even without prior login', async () => {
        const { result } = renderHook(() => useAuth(), { wrapper });

        await act(async () => { result.current.signOut(); });

        expect(result.current.user).toBeNull();
    });
});

// ── useAuth guard ─────────────────────────────────────────────────────────────

describe('AuthContext — useAuth guard', () => {

    it('throws if used outside AuthProvider', () => {
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

        expect(() => {
            renderHook(() => useAuth());
        }).toThrow('useAuth must be used within AuthProvider');

        spy.mockRestore();
    });
});