/**
 * Tests for ProfileScreen
 * Location: src/modules/profile/screens/__tests__/profile-screen.test.tsx
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { ProfileScreen } from '../profileScreen';
import { UserService, ProfileData } from '../../services/userService';

// ── Mocks ─────────────────────────────────────────────────────────────────────

jest.mock('../../services/userService');

const mockDispatch = jest.fn();

jest.mock('../../../../store/store', () => ({
    useAppDispatch: () => mockDispatch,
    useAppSelector: jest.fn(),
}));

jest.mock('../../../auth/store/authSlice', () => ({
    logout:          jest.fn(() => ({ type: 'auth/logout' })),
    selectIsLoggedIn: jest.fn(),
}));

const mockNavigation = {
    goBack:   jest.fn(),
    navigate: jest.fn(),
};

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockProfile: ProfileData = {
    id:        1,
    username:  'duynguyen',
    email:     'duy001@gmail.com',
    firstName: 'Duy',
    lastName:  'Nguyen',
    age:       18,
    role:      'admin',
};

function renderScreen() {
    return render(<ProfileScreen navigation={mockNavigation as any} />);
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('ProfileScreen', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockDispatch.mockResolvedValue({ type: 'auth/logout/fulfilled' });
    });

    // ── Loading state ──────────────────────────────────────────────────────────

    it('shows loading indicator while fetching profile', () => {
        (UserService.getProfile as jest.Mock).mockReturnValue(new Promise(() => {}));

        renderScreen();

        expect(screen.getByTestId('activity-indicator')).toBeTruthy();
    });

    // ── Error state ────────────────────────────────────────────────────────────

    it('shows error message when getProfile throws', async () => {
        (UserService.getProfile as jest.Mock).mockRejectedValue(new Error('Network error'));

        renderScreen();

        await waitFor(() => {
            expect(screen.getByText('Something went wrong')).toBeTruthy();
        });
    });

    it('shows fallback message when getProfile returns null', async () => {
        (UserService.getProfile as jest.Mock).mockResolvedValue(null);

        renderScreen();

        await waitFor(() => {
            expect(screen.getByText('No profile data')).toBeTruthy();
        });
    });

    // ── Success state ──────────────────────────────────────────────────────────

    it('renders full name when profile loads', async () => {
        (UserService.getProfile as jest.Mock).mockResolvedValue(mockProfile);

        renderScreen();

        await waitFor(() => {
            expect(screen.getByText('Duy Nguyen')).toBeTruthy();
        });
    });

    it('renders username with @ prefix', async () => {
        (UserService.getProfile as jest.Mock).mockResolvedValue(mockProfile);

        renderScreen();

        await waitFor(() => {
            expect(screen.getByText('@duynguyen')).toBeTruthy();
        });
    });

    it('renders avatar initials correctly', async () => {
        (UserService.getProfile as jest.Mock).mockResolvedValue(mockProfile);

        renderScreen();

        await waitFor(() => {
            expect(screen.getByText('DN')).toBeTruthy();
        });
    });

    it('renders role badge in uppercase', async () => {
        (UserService.getProfile as jest.Mock).mockResolvedValue(mockProfile);

        renderScreen();

        await waitFor(() => {
            expect(screen.getByText('ADMIN')).toBeTruthy();
        });
    });

    it('renders all account detail fields', async () => {
        (UserService.getProfile as jest.Mock).mockResolvedValue(mockProfile);

        renderScreen();

        await waitFor(() => {
            expect(screen.getByText('duy001@gmail.com')).toBeTruthy();
            expect(screen.getByText('Duy')).toBeTruthy();
            expect(screen.getByText('Nguyen')).toBeTruthy();
            expect(screen.getByText('18')).toBeTruthy();
        });
    });

    // ── Interactions ───────────────────────────────────────────────────────────

    it('calls navigation.goBack when back arrow is pressed', async () => {
        (UserService.getProfile as jest.Mock).mockResolvedValue(mockProfile);

        renderScreen();

        await waitFor(() => screen.getByText('Duy Nguyen'));

        fireEvent.press(screen.getByTestId('back-button'));

        expect(mockNavigation.goBack).toHaveBeenCalledTimes(1);
    });

    it('dispatches logout when logout row is pressed', async () => {
        const { logout } = require('../../../auth/store/authSlice');
        (UserService.getProfile as jest.Mock).mockResolvedValue(mockProfile);

        renderScreen();

        await waitFor(() => screen.getByText('Logout'));

        fireEvent.press(screen.getByTestId('logout-button'));

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalled();
            expect(logout).toHaveBeenCalled();
        });
    });
});