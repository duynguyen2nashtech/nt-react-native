// src/modules/profile/navigation/profile-navigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/profileScreen';
import { OrderHistoryScreen } from '../../orders/screens/orderHistoryScreen';
import { Order } from '../../orders/store/ordersSlice';
import { OrderDetailScreen } from '../../orders/screens/orderDetailScreen';

export type ProfileStackParamList = {
    ProfileMain:  undefined;
    OrderHistory: undefined;
    OrderDetail:   { order: Order };
};

export type ProfileScreenProps    = NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>;
export type OrderHistoryScreenProps = NativeStackScreenProps<ProfileStackParamList, 'OrderHistory'>;

const Stack = createNativeStackNavigator<ProfileStackParamList>();

const ProfileNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="ProfileMain"  component={ProfileScreen} />
        <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
        <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
    </Stack.Navigator>
);

export default ProfileNavigator;