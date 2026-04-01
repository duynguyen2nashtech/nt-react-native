// src/navigation/MainNavigator.tsx
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image, StyleSheet } from 'react-native';
import ShopNavigator from '../features/shop/navigation/shop-navigator';
import ProfileNavigator from '../features/profile/navigation/profile-navigator';




const Tab = createBottomTabNavigator();

interface IMainNavigator {
    navigation: any;
}

const MainNavigator: React.FC<IMainNavigator> = ({ navigation }) => {
    return (
        <Tab.Navigator screenOptions={{ headerShown: false }}>

            {/* Home tab now owns a stack — ProductDetail can be pushed inside it */}
            <Tab.Screen
                name="ShopTab"
                component={ShopNavigator}
                options={{
                    tabBarLabel: 'Home',
                    tabBarIcon: () => (
                        <Image source={require('../assets/images/home.png')} style={styles.icon} />
                    ),
                }}
            />
            <Tab.Screen
                name="Profile"
                component={ProfileNavigator}
                options={{
                    tabBarLabel: 'Profile',
                    tabBarIcon: () => (
                        <Image source={require('../assets/images/person.png')} style={styles.icon} />
                    ),
                }}
            />

        </Tab.Navigator>
    );
};

const styles = StyleSheet.create({
    icon: { width: 24, height: 24 },
});

export default MainNavigator;