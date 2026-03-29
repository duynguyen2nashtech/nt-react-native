// src/reducers/root-reducer.ts
import { combineReducers } from '@reduxjs/toolkit';
import apiReducer from '../slices/api-slice';
import shopReducer from '../modules/shop/store/shopSlice';
import cartReducer from '../modules/cart/store/cartSlice';

const rootReducer = combineReducers({
    api: apiReducer,
    shop: shopReducer,
    cart: cartReducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;