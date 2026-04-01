// src/reducers/root-reducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import apiReducer from '../slices/api-slice';
import shopReducer from '../modules/shop/store/shopSlice';
import cartReducer from '../modules/cart/store/cartSlice';
import orderReducer from '../modules/orders/store/ordersSlice'; 


const rootReducer = combineReducers({
    api: apiReducer,
    shop: shopReducer,
    cart: cartReducer,
    orders: orderReducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;