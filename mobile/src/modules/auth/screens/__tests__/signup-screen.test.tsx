/**
 * Tests for SignUpScreen
 * Location: src/modules/auth/screens/__tests__/signup-screen.test.tsx
 *
 * Run: npx jest signup-screen.test.tsx
 */

import React from 'react';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { SignUpScreen } from '../signup-screen';

// ── Mocks ─────────────────────────────────────────────────────────────────────

const mockReplace = jest.fn();

jest.mock('../../../profile/services/user-service', () => ({
    UserService: {
        register: jest.fn(),
    },
}));

jest.spyOn(Alert, 'alert');

// ── Imports after mocks ───────────────────────────────────────────────────────

import { UserService } from '../../../profile/services/user-service';

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockNavigation = { replace: mockReplace };

const validForm = {
    firstName: 'John',
    lastName:  'Doe',
    email:     'john@example.com',
    username:  'johndoe123',
    password:  'password123',
    age:       '25',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function renderScreen() {
    return render(<SignUpScreen navigation={mockNavigation as any} />);
}

function fillForm(overrides: Partial<typeof validForm> = {}) {
    const form = { ...validForm, ...overrides };
    fireEvent.changeText(screen.getByPlaceholderText('John'),             form.firstName);
    fireEvent.changeText(screen.getByPlaceholderText('Doe'),              form.lastName);
    fireEvent.changeText(screen.getByPlaceholderText('john@example.com'), form.email);
    fireEvent.changeText(screen.getByPlaceholderText('johndoe123'),       form.username);
    fireEvent.changeText(screen.getByPlaceholderText('Min. 8 characters'),form.password);
    fireEvent.changeText(screen.getByPlaceholderText('18'),               form.age);
}

// ── Setup ─────────────────────────────────────────────────────────────────────

beforeEach(() => jest.clearAllMocks());

// ── Rendering ─────────────────────────────────────────────────────────────────

describe('SignUpScreen — rendering', () => {

    it('renders title', () => {
        renderScreen();
        expect(screen.getByTestId('signup-btn')).toBeTruthy();
    });

    it('renders subtitle', () => {
        renderScreen();
        expect(screen.getByText('Fill in your details to get started')).toBeTruthy();
    });

    it('renders all input fields', () => {
        renderScreen();
        expect(screen.getByPlaceholderText('John')).toBeTruthy();
        expect(screen.getByPlaceholderText('Doe')).toBeTruthy();
        expect(screen.getByPlaceholderText('john@example.com')).toBeTruthy();
        expect(screen.getByPlaceholderText('johndoe123')).toBeTruthy();
        expect(screen.getByPlaceholderText('Min. 8 characters')).toBeTruthy();
        expect(screen.getByPlaceholderText('18')).toBeTruthy();
    });

    it('renders Create Account button', () => {
        renderScreen();
        expect(screen.getByTestId('signup-btn')).toBeTruthy();
    });

    it('renders Login and Sign Up tabs', () => {
        renderScreen();
        expect(screen.getByText('Login')).toBeTruthy();
        expect(screen.getByText('Sign Up')).toBeTruthy();
    });

    it('renders User and Admin role options', () => {
        renderScreen();
        expect(screen.getByText('User')).toBeTruthy();
        expect(screen.getByText('Admin')).toBeTruthy();
    });

    it('renders Terms of Service and Privacy Policy', () => {
        renderScreen();
        expect(screen.getByText('Terms of Service')).toBeTruthy();
        expect(screen.getByText('Privacy Policy')).toBeTruthy();
    });

    it('renders eye icon for password toggle', () => {
        renderScreen();
        expect(screen.getByText('👁')).toBeTruthy();
    });
});

// ── Input interaction ─────────────────────────────────────────────────────────

describe('SignUpScreen — input interaction', () => {

    it('updates first name when user types', () => {
        renderScreen();
        fireEvent.changeText(screen.getByPlaceholderText('John'), 'Jane');
        expect(screen.getByDisplayValue('Jane')).toBeTruthy();
    });

    it('updates last name when user types', () => {
        renderScreen();
        fireEvent.changeText(screen.getByPlaceholderText('Doe'), 'Smith');
        expect(screen.getByDisplayValue('Smith')).toBeTruthy();
    });

    it('updates email when user types', () => {
        renderScreen();
        fireEvent.changeText(screen.getByPlaceholderText('john@example.com'), 'jane@test.com');
        expect(screen.getByDisplayValue('jane@test.com')).toBeTruthy();
    });

    it('updates username when user types', () => {
        renderScreen();
        fireEvent.changeText(screen.getByPlaceholderText('johndoe123'), 'janesmith');
        expect(screen.getByDisplayValue('janesmith')).toBeTruthy();
    });

    it('updates password when user types', () => {
        renderScreen();
        fireEvent.changeText(screen.getByPlaceholderText('Min. 8 characters'), 'secret123');
        expect(screen.getByDisplayValue('secret123')).toBeTruthy();
    });

    it('updates age when user types', () => {
        renderScreen();
        fireEvent.changeText(screen.getByPlaceholderText('18'), '30');
        expect(screen.getByDisplayValue('30')).toBeTruthy();
    });

    it('password is hidden by default', () => {
        renderScreen();
        const input = screen.getByPlaceholderText('Min. 8 characters');
        expect(input.props.secureTextEntry).toBe(true);
    });

    it('toggles password visibility when eye icon pressed', () => {
        renderScreen();
        fireEvent.press(screen.getByText('👁'));
        expect(screen.getByPlaceholderText('Min. 8 characters').props.secureTextEntry).toBe(false);
    });

    it('toggles password back to hidden on second press', () => {
        renderScreen();
        fireEvent.press(screen.getByText('👁'));
        fireEvent.press(screen.getByText('🙈'));
        expect(screen.getByPlaceholderText('Min. 8 characters').props.secureTextEntry).toBe(true);
    });
});

// ── Role picker ───────────────────────────────────────────────────────────────

describe('SignUpScreen — role picker', () => {

    it('User role is selected by default', () => {
        renderScreen();
        // User option has active style (white text) by default
        expect(screen.getByText('User')).toBeTruthy();
    });

    it('switches to Admin role when pressed', () => {
        renderScreen();
        fireEvent.press(screen.getByText('Admin'));
        expect(screen.getByText('Admin')).toBeTruthy();
    });

    it('switches back to User role when pressed', () => {
        renderScreen();
        fireEvent.press(screen.getByText('Admin'));
        fireEvent.press(screen.getByText('User'));
        expect(screen.getByText('User')).toBeTruthy();
    });
});

// ── Tab navigation ────────────────────────────────────────────────────────────

describe('SignUpScreen — tabs', () => {

    it('pressing Login tab navigates to SignIn', () => {
        renderScreen();
        fireEvent.press(screen.getByText('Login'));
        expect(mockReplace).toHaveBeenCalledWith('SignIn');
    });

    it('pressing Sign Up tab does not navigate', () => {
        renderScreen();
        fireEvent.press(screen.getByText('Sign Up'));
        expect(mockReplace).not.toHaveBeenCalled();
    });
});

// ── Validation ────────────────────────────────────────────────────────────────

describe('SignUpScreen — validation', () => {

    it('shows error when first name is empty', async () => {
        renderScreen();
        fillForm({ firstName: '' });

        await act(async () => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Validation Error',
            'First name is required.'
        );
    });

    it('shows error when last name is empty', async () => {
        renderScreen();
        fillForm({ lastName: '' });

        await act(async () => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Validation Error',
            'Last name is required.'
        );
    });

    it('shows error when email is empty', async () => {
        renderScreen();
        fillForm({ email: '' });

        await act(async () => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Validation Error',
            'A valid email is required.'
        );
    });

    it('shows error when email has no @', async () => {
        renderScreen();
        fillForm({ email: 'invalidemail' });

        await act(async () => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Validation Error',
            'A valid email is required.'
        );
    });

    it('shows error when username is empty', async () => {
        renderScreen();
        fillForm({ username: '' });

        await act(async () => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Validation Error',
            'Username is required.'
        );
    });

    it('shows error when password is less than 8 characters', async () => {
        renderScreen();
        fillForm({ password: 'short' });

        await act(async () => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Validation Error',
            'Password must be at least 8 characters.'
        );
    });

    it('shows error when age is empty', async () => {
        renderScreen();
        fillForm({ age: '' });

        await act(async () => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Validation Error',
            'A valid age is required.'
        );
    });

    it('shows error when age is not a number', async () => {
        renderScreen();
        fillForm({ age: 'abc' });

        await act(async () => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Validation Error',
            'A valid age is required.'
        );
    });

    it('shows error when age is less than 1', async () => {
        renderScreen();
        fillForm({ age: '0' });

        await act(async () => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Validation Error',
            'A valid age is required.'
        );
    });

    it('does not call UserService when validation fails', async () => {
        renderScreen();
        fillForm({ firstName: '' });

        await act(async () => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        expect(UserService.register).not.toHaveBeenCalled();
    });
});

// ── Sign Up — success ─────────────────────────────────────────────────────────

describe('SignUpScreen — sign up success', () => {

    it('calls UserService.register with correct data', async () => {
        (UserService.register as jest.Mock).mockResolvedValue({});
        renderScreen();
        fillForm();

        await act(async () => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        expect(UserService.register).toHaveBeenCalledWith({
            firstName: 'John',
            lastName:  'Doe',
            email:     'john@example.com',
            username:  'johndoe123',
            password:  'password123',
            role:      'user',
            age:       25,
        });
    });

    it('shows success alert on registration success', async () => {
        (UserService.register as jest.Mock).mockResolvedValue({});
        renderScreen();
        fillForm();

        await act(async () => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Account created!',
            'You can now sign in.',
            expect.any(Array)
        );
    });

    it('navigates to SignIn when Sign In is pressed in success alert', async () => {
        (UserService.register as jest.Mock).mockResolvedValue({});
        renderScreen();
        fillForm();

        await act(async () => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        // Extract and call the onPress from the alert button
        const alertCall = (Alert.alert as jest.Mock).mock.calls[0];
        const buttons   = alertCall[2];
        const signInBtn = buttons.find((b: any) => b.text === 'Sign In');

        act(() => { signInBtn.onPress(); });

        expect(mockReplace).toHaveBeenCalledWith('SignIn');
    });

    it('calls UserService with admin role when admin is selected', async () => {
        (UserService.register as jest.Mock).mockResolvedValue({});
        renderScreen();
        fillForm();
        fireEvent.press(screen.getByText('Admin'));

        await act(async () => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        expect(UserService.register).toHaveBeenCalledWith(
            expect.objectContaining({ role: 'admin' })
        );
    });

    it('trims whitespace from text fields before submitting', async () => {
        (UserService.register as jest.Mock).mockResolvedValue({});
        renderScreen();
        fillForm({ firstName: '  John  ', email: '  john@example.com  ' });

        await act(async () => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        expect(UserService.register).toHaveBeenCalledWith(
            expect.objectContaining({
                firstName: 'John',
                email:     'john@example.com',
            })
        );
    });
});

// ── Sign Up — failure ─────────────────────────────────────────────────────────

describe('SignUpScreen — sign up failure', () => {

    it('shows error alert when UserService throws', async () => {
        (UserService.register as jest.Mock).mockRejectedValue(
            new Error('Email already exists')
        );
        renderScreen();
        fillForm();

        await act(async () => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Sign Up Failed',
            'Email already exists'
        );
    });

    it('shows fallback message when error has no message', async () => {
        (UserService.register as jest.Mock).mockRejectedValue({});
        renderScreen();
        fillForm();

        await act(async () => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        expect(Alert.alert).toHaveBeenCalledWith(
            'Sign Up Failed',
            'Something went wrong.'
        );
    });

    it('does not navigate on failure', async () => {
        (UserService.register as jest.Mock).mockRejectedValue(new Error('fail'));
        renderScreen();
        fillForm();

        await act(async () => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        expect(mockReplace).not.toHaveBeenCalled();
    });
});

// ── Loading state ─────────────────────────────────────────────────────────────

describe('SignUpScreen — loading state', () => {

    it('shows loading text while submitting', async () => {
        (UserService.register as jest.Mock).mockImplementation(
            () => new Promise(resolve => setTimeout(resolve, 100))
        );
        renderScreen();
        fillForm();

        act(() => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        await waitFor(() => {
            expect(screen.getByText('Creating account...')).toBeTruthy();
        });
    });

    it('button is disabled while loading', async () => {
        (UserService.register as jest.Mock).mockImplementation(
            () => new Promise(resolve => setTimeout(resolve, 100))
        );
        renderScreen();
        fillForm();

        act(() => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        await waitFor(() => {
            const btn = screen.getByText('Creating account...').parent?.parent;
            expect(btn?.props.accessibilityState?.disabled).toBe(true);
        });
    });

    it('restores button text after success', async () => {
        (UserService.register as jest.Mock).mockResolvedValue({});
        renderScreen();
        fillForm();

        await act(async () => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        await waitFor(() => {
            expect(screen.queryByText('Creating account...')).toBeNull();
        });
    });

    it('restores button text after failure', async () => {
        (UserService.register as jest.Mock).mockRejectedValue(new Error('fail'));
        renderScreen();
        fillForm();

        await act(async () => {
            fireEvent.press(screen.getByTestId('signup-btn'));
        });

        await waitFor(() => {
            expect(screen.queryByText('Creating account...')).toBeNull();
        });
    });
});