import React, { createContext, useContext, useState } from 'react';
import { User } from '../models/user';
import { AuthService } from '../services/auth-service';

interface AuthContextValue {
    user: User | null;
    login: (username: string, password: string) => Promise<boolean>;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUserState] = useState<User | null>(null);

    const login = async (username: string, password: string): Promise<boolean> => {
        try {
            const result = await AuthService.login(username, password);
            if (result?.user) {
                setUserState(result.user); // ✅ Context only
                return true;
            }
            return false;
        } catch {
            return false;
        }
    };

    const signOut = () => {
        setUserState(null); // ✅ Context only
    };

    return (
        <AuthContext.Provider value={{ user, login, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextValue => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};