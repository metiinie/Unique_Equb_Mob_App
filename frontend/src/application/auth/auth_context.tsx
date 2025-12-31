import React, { createContext, useContext, useState, ReactNode } from 'react';
import { UserDto } from '../../domain/dtos';

interface AuthContextType {
    user: UserDto | null;
    setUser: (user: UserDto | null) => void;
    isAuthenticated: boolean;
    isInitialCheckDone: boolean;
    setInitialCheckDone: (done: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<UserDto | null>(null);
    const [isInitialCheckDone, setInitialCheckDone] = useState(false);

    const handleSetUser = (u: UserDto | null) => {
        setUser(u);
        setInitialCheckDone(true);
    };

    return (
        <AuthContext.Provider value={{
            user,
            setUser: handleSetUser,
            isAuthenticated: !!user,
            isInitialCheckDone,
            setInitialCheckDone
        }}>
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
