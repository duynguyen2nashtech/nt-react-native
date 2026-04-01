// src/reducers/root-reducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import shopReducer from '../modules/shop/store/shopSlice';
import cartReducer from '../modules/cart/store/cartSlice';
import orderReducer from '../modules/orders/store/ordersSlice'; 
import authReducer from '../modules/auth/store/authSlice';


const rootReducer = combineReducers({
    auth: authReducer,
    shop: shopReducer,
    cart: cartReducer,
    orders: orderReducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;