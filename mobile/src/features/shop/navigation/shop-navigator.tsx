// src/modules/shop/navigation/shop-navigator.tsx
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home-screen';
import { ProductDetailScreen } from '../screens/product-detail-screen';

export type ShopStackParamList = {
    Home: undefined;
    ProductDetail: { productId: number };
};

export type HomeScreenProps = NativeStackScreenProps<ShopStackParamList, 'Home'>;
export type ProductDetailScreenProps = NativeStackScreenProps<ShopStackParamList, 'ProductDetail'>;

const Stack = createNativeStackNavigator<ShopStackParamList>();

const ShopNavigator = () => (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
);

export default ShopNavigator;