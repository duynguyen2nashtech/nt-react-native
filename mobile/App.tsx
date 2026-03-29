import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, Text, View } from 'react-native';
import { DemoScreen } from './src/screens/demo-screen';

import DemoHooks from './src/screens/demo/demo-hooks';
import DemoUseContext, { FeatureComponent2 } from './src/screens/demo/demo-usecontext';



import { Provider } from 'react-redux';
import store from './src/stores/store';
import { SignUpScreen } from './src/modules/auth/screens/signup-screen';
import { AuthProvider, useAuth } from './src/modules/auth/context/auth-context';
import MainNavigator from './src/shared/navigation/navigator/main-navigator';
import { SignInScreen } from './src/modules/auth/screens/signin-screen';


const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <AuthProvider>
      <Provider store={store}>
        <AppContent />
      </Provider>
    </AuthProvider>

  );
};

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
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
{user ? (
                    <Stack.Screen
                        name="Main"
                        component={MainNavigator}
                        options={{ title: 'ReactNativeStater' }}
                    />
                ) : (
                    <>
                        <Stack.Screen
                            name="SignIn"
                            component={SignInScreen}
                            options={{ title: 'SignIn Screen' }}
                        />
                        <Stack.Screen name="SignUp" component={SignUpScreen} />
                    </>
                )}        
        {/* <Stack.Screen
          name="List"
          component={ListScreen}
          options={{ title: 'List Screen' }}
        /> */}
        {/* <Stack.Screen
          name="Main"
          component={MainNavigator}
          options={{ title: 'ReactNativeStater' }}
        />
        <Stack.Screen
          name="SignIn"
          component={SignInScreen}
          options={{ title: 'SignIn Screen' }}
        /> */}
        {/* <Stack.Screen
          name="Demo"
          component={DemoUseContext}
          options={{ title: 'Demo Screen' }}
        /> */}
      </Stack.Navigator>
    </NavigationContainer>
  )
}

export default App;