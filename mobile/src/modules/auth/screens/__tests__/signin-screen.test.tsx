/**
 * Tests for SignInScreen
 * Location: src/modules/auth/screens/__tests__/signin-screen.test.tsx
 *
 * Run: npx jest signin-screen.test.tsx
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { SignInScreen } from '../signin-screen';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockLogin    = jest.fn();
const mockReplace  = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../../context/auth-context', () => ({
    useAuth: () => ({ login: mockLogin }),
}));

jest.spyOn(Alert, 'alert');

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockNavigation = {
    replace:  mockReplace,
    navigate: mockNavigate,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderScreen() {
    return render(<SignInScreen navigation={mockNavigation as any} />);
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => jest.clearAllMocks());

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('SignInScreen — rendering', () => {

    it('renders welcome title', () => {
        renderScreen();
        expect(screen.getByText('Welcome Back')).toBeTruthy();
    });

    it('renders subtitle', () => {
        renderScreen();
        expect(screen.getByText('Please enter your details')).toBeTruthy();
    });

    it('renders username input with default value', () => {
        renderScreen();
        expect(screen.getByDisplayValue('duynguyen')).toBeTruthy();
    });

    it('renders password input with default value', () => {
        renderScreen();
        expect(screen.getByDisplayValue('12345678')).toBeTruthy();
    });

    it('renders Sign In button', () => {
        renderScreen();
        expect(screen.getByText('Sign In')).toBeTruthy();
    });

    it('renders Login and Sign Up tabs', () => {
        renderScreen();
        expect(screen.getByText('Login')).toBeTruthy();
        expect(screen.getByText('Sign Up')).toBeTruthy();
    });

    it('renders Forgot Password link', () => {
        renderScreen();
        expect(screen.getByText('Forgot Password?')).toBeTruthy();
    });

    it('renders biometrics button', () => {
        renderScreen();
        expect(screen.getByText('Sign in with Biometrics')).toBeTruthy();
    });

    it('renders biometrics checkbox label', () => {
        renderScreen();
        expect(screen.getByText('Use biometrics for faster login')).toBeTruthy();
    });

    it('renders Google and Facebook social buttons', () => {
        renderScreen();
        expect(screen.getByText('Google')).toBeTruthy();
        expect(screen.getByText('Facebook')).toBeTruthy();
    });

    it('renders terms and privacy text', () => {
        renderScreen();
        expect(screen.getByText('Terms of Service')).toBeTruthy();
        expect(screen.getByText('Privacy Policy')).toBeTruthy();
    });
});

// ── Input interaction ─────────────────────────────────────────────────────────

describe('SignInScreen — input interaction', () => {

    it('updates username when user types', () => {
        renderScreen();
        const input = screen.getByDisplayValue('duynguyen');
        fireEvent.changeText(input, 'newuser');
        expect(screen.getByDisplayValue('newuser')).toBeTruthy();
    });

    it('updates password when user types', () => {
        renderScreen();
        const input = screen.getByDisplayValue('12345678');
        fireEvent.changeText(input, 'newpassword');
        expect(screen.getByDisplayValue('newpassword')).toBeTruthy();
    });

    it('password input is hidden by default (secureTextEntry)', () => {
        renderScreen();
        const passwordInput = screen.getByDisplayValue('12345678');
        expect(passwordInput.props.secureTextEntry).toBe(true);
    });

    it('toggles password visibility when eye icon pressed', () => {
        renderScreen();
        const passwordInput = screen.getByDisplayValue('12345678');
        expect(passwordInput.props.secureTextEntry).toBe(true);

        fireEvent.press(screen.getByText('👁'));
        expect(screen.getByDisplayValue('12345678').props.secureTextEntry).toBe(false);
    });

    it('toggles password back to hidden on second press', () => {
        renderScreen();
        fireEvent.press(screen.getByText('👁'));
        fireEvent.press(screen.getByText('🙈'));
        expect(screen.getByDisplayValue('12345678').props.secureTextEntry).toBe(true);
    });
});

// ── Biometrics checkbox ───────────────────────────────────────────────────────

describe('SignInScreen — biometrics checkbox', () => {

    it('checkmark is hidden by default', () => {
        renderScreen();
        expect(screen.queryByText('✓')).toBeNull();
    });

    it('shows checkmark when biometrics checkbox pressed', () => {
        renderScreen();
        fireEvent.press(screen.getByText('Use biometrics for faster login'));
        expect(screen.getByText('✓')).toBeTruthy();
    });

    it('hides checkmark when pressed again', () => {
        renderScreen();
        fireEvent.press(screen.getByText('Use biometrics for faster login'));
        fireEvent.press(screen.getByText('Use biometrics for faster login'));
        expect(screen.queryByText('✓')).toBeNull();
    });
});

// ── Tab navigation ────────────────────────────────────────────────────────────

describe('SignInScreen — tabs', () => {

    it('Login tab is active by default', () => {
        renderScreen();
        // Login tab exists and screen is in login state (no navigation called)
        expect(screen.getByText('Login')).toBeTruthy();
        expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('pressing Sign Up tab navigates to SignUp screen', () => {
        renderScreen();
        fireEvent.press(screen.getByText('Sign Up'));
        expect(mockNavigate).toHaveBeenCalledWith('SignUp');
    });

    it('pressing Login tab does not navigate', () => {
        renderScreen();
        fireEvent.press(screen.getByText('Login'));
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});

// ── Sign In — success ─────────────────────────────────────────────────────────

describe('SignInScreen — sign in success', () => {

    it('calls login with username and password', async () => {
        mockLogin.mockResolvedValue(true);
        renderScreen();

        await act(async () => {
            fireEvent.press(screen.getByText('Sign In'));
        });

        expect(mockLogin).toHaveBeenCalledWith('duynguyen', '12345678');
    });

    it('navigates to Main on successful login', async () => {
        mockLogin.mockResolvedValue(true);
        renderScreen();

        await act(async () => {
            fireEvent.press(screen.getByText('Sign In'));
        });

        expect(mockReplace).toHaveBeenCalledWith('Main');
    });

    it('does not show alert on successful login', async () => {
        mockLogin.mockResolvedValue(true);
        renderScreen();

        await act(async () => {
            fireEvent.press(screen.getByText('Sign In'));
        });

        expect(Alert.alert).not.toHaveBeenCalled();
    });

    it('calls login with updated credentials after user types', async () => {
        mockLogin.mockResolvedValue(true);
        renderScreen();

        fireEvent.changeText(screen.getByDisplayValue('duynguyen'), 'admin');
        fireEvent.changeText(screen.getByDisplayValue('12345678'), 'secret123');

        await act(async () => {
            fireEvent.press(screen.getByText('Sign In'));
        });

        expect(mockLogin).toHaveBeenCalledWith('admin', 'secret123');
    });
});

// ── Sign In — failure ─────────────────────────────────────────────────────────

describe('SignInScreen — sign in failure', () => {

    it('shows alert on failed login', async () => {
        mockLogin.mockResolvedValue(false);
        renderScreen();

        await act(async () => {
            fireEvent.press(screen.getByText('Sign In'));
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Login failed',
            'Invalid username or password.'
        );
    });

    it('does not navigate on failed login', async () => {
        mockLogin.mockResolvedValue(false);
        renderScreen();

        await act(async () => {
            fireEvent.press(screen.getByText('Sign In'));
        });

        expect(mockReplace).not.toHaveBeenCalled();
    });

    it('shows alert when login throws an error', async () => {
        mockLogin.mockRejectedValue(new Error('Network error'));
        renderScreen();

        await act(async () => {
            fireEvent.press(screen.getByText('Sign In'));
        });

        await waitFor(() => {
            expect(Alert.alert).toHaveBeenCalled();
        });
    });
});

// ── Sign In — called once ─────────────────────────────────────────────────────

describe('SignInScreen — login called correctly', () => {

    it('calls login exactly once per press', async () => {
        mockLogin.mockResolvedValue(true);
        renderScreen();

        await act(async () => {
            fireEvent.press(screen.getByText('Sign In'));
        });

        expect(mockLogin).toHaveBeenCalledTimes(1);
    });
});