/**
 * @format
 */

import 'react-native';
import React from 'react';
import { it, jest, describe } from '@jest/globals';
import renderer from 'react-test-renderer';

jest.mock('react-redux', () => ({
    Provider: ({ children }: any) => children,
    useSelector: jest.fn(),
    useDispatch: () => jest.fn(),
}));

// ← path from __tests__/ to src/stores/store
jest.mock('../src/stores/store', () => ({
    __esModule: true,
    default: { dispatch: jest.fn(), getState: jest.fn(), subscribe: jest.fn() },
    useAppDispatch: () => jest.fn(),
    useAppSelector: jest.fn(),
}));

jest.mock('@react-navigation/native', () => ({
    NavigationContainer: ({ children }: any) => children,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

// native-stack — was trying to call createNavigatorFactory internally
jest.mock('@react-navigation/native-stack', () => ({
    createNativeStackNavigator: () => ({
        Navigator: ({ children }: any) => children,
        Screen: () => null,
    }),
}));

// bottom-tabs — same issue if MainNavigator is rendered
jest.mock('@react-navigation/bottom-tabs', () => ({
    createBottomTabNavigator: () => ({
        Navigator: ({ children }: any) => children,
        Screen: () => null,
    }),
}));

jest.mock('../src/modules/auth/context/auth-context', () => ({
    AuthProvider: ({ children }: any) => children,
    useAuth: () => ({ user: null, signOut: jest.fn(), login: jest.fn() }),
}));

import App from '../App';

describe('App', () => {
    it('renders without crashing', () => {
        renderer.create(<App />);
    });
});