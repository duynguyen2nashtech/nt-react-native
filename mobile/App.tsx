import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View } from 'react-native';
import { Provider } from 'react-redux';
import store from './src/stores/store';
import { useAppDispatch, useAppSelector } from './src/stores/store';
import { restoreSession, selectIsLoggedIn, selectAuthLoading } from './src/modules/auth/store/authSlice';
import MainNavigator from './src/shared/navigation/navigator/main-navigator';
import { SignInScreen } from './src/modules/auth/screens/signin-screen';
import { SignUpScreen } from './src/modules/auth/screens/signup-screen';

const Stack = createNativeStackNavigator();

const AppContent: React.FC = () => {
    const dispatch = useAppDispatch();
    const isLoggedIn = useAppSelector(selectIsLoggedIn);
    const isLoading = useAppSelector(selectAuthLoading);

    useEffect(() => {
        dispatch(restoreSession());
    }, [dispatch]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {isLoggedIn ? (
                    <Stack.Screen name="Main" component={MainNavigator} />
                ) : (
                    <>
                        <Stack.Screen name="SignIn" component={SignInScreen} />
                        <Stack.Screen name="SignUp" component={SignUpScreen} />
                    </>
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
};

const App = () => (
    <Provider store={store}>
        <AppContent />
    </Provider>
);

export default App;