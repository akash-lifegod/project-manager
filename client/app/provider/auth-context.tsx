import {createContext, useContext, useState} from 'react';
import type {User} from '@/types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: String, password: String) =>  Promise<void>;
    logout: () =>  Promise<void>;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({children} : {children : React.ReactNode}) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const login = async (email: String, password: String) => {
        console.log(email, password);
    }
    const logout = async () => {
        console.log('Logging out');
    }    

    const values = {user, isAuthenticated, isLoading, login, logout}
    return (
        <AuthContext.Provider value={values}>
            {children}
        </AuthContext.Provider>
    );
}


export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};