// src/reducers/root-reducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import shopReducer from '../features/shop/store/shopSlice';
import cartReducer from '../features/cart/store/cartSlice';
import orderReducer from '../features/orders/store/ordersSlice'; 
import authReducer from '../features/auth/store/authSlice';


const rootReducer = combineReducers({
    auth: authReducer,
    shop: shopReducer,
    cart: cartReducer,
    orders: orderReducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;