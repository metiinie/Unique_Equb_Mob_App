import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';
import { UserDto } from '../../domain/dtos';
import { ApiClient } from '../../presentation/services/api_client';

export type AuthStatus = 'BOOTING' | 'UNAUTHENTICATED' | 'AUTHENTICATED';

interface AuthContextType {
    user: UserDto | null;
    status: AuthStatus;
    setUser: (user: UserDto | null) => void;
    logout: () => Promise<void>;
    // Helpers
    isAuthenticated: boolean;
    isBooting: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUserState] = useState<UserDto | null>(null);
    const [status, setStatus] = useState<AuthStatus>('BOOTING');

    const setUser = (u: UserDto | null) => {
        if (u) {
            setUserState(u);
            setStatus('AUTHENTICATED');
        } else {
            setUserState(null);
            setStatus('UNAUTHENTICATED');
        }
    };

    const logout = async () => {
        try {
            await ApiClient.post('/auth/logout', {});
        } catch (error) {
            console.error('[AuthContext] Logout API failed (continuing with local cleanup):', error);
        } finally {
            setUserState(null);
            setStatus('UNAUTHENTICATED');
        }
    };

    const value = useMemo(() => ({
        user,
        status,
        setUser,
        logout,
        isAuthenticated: status === 'AUTHENTICATED',
        isBooting: status === 'BOOTING',
    }), [user, status]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
