// src/modules/auth/store/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { AuthService } from '../services/authService';
import { UserService } from '../../profile/services/userService';

import { RootState } from '../../../store/rootReducer';
import { TokenService } from '../../../services/storage/tokenService';

interface AuthState {
    isLoggedIn: boolean;
    isLoading: boolean;
}

const initialState: AuthState = {
    isLoggedIn: false,
    isLoading: true,
};

export const restoreSession = createAsyncThunk('auth/restoreSession', async () => {
    const token = await TokenService.getToken();
    return !!token;
});

export const login = createAsyncThunk(
    'auth/login',
    async ({ username, password }: { username: string; password: string }, { rejectWithValue }) => {
        const result = await AuthService.login(username, password);
        if (!result?.user) return rejectWithValue('Invalid username or password');
        return true;
    }
);

export const logout = createAsyncThunk('auth/logout', async () => {
    await UserService.clearLocalProfile();
});

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(restoreSession.fulfilled, (state, action: PayloadAction<boolean>) => {
                state.isLoggedIn = action.payload;
                state.isLoading = false;
            })
            .addCase(restoreSession.rejected, (state) => {
                state.isLoggedIn = false;
                state.isLoading = false;
            })
            .addCase(login.fulfilled, (state) => {
                state.isLoggedIn = true;
            })
            .addCase(logout.fulfilled, (state) => {
                state.isLoggedIn = false;
            });
    },
});

export const selectIsLoggedIn = (state: RootState) => state.auth.isLoggedIn;
export const selectAuthLoading = (state: RootState) => state.auth.isLoading;

export default authSlice.reducer;