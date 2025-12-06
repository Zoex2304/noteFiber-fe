import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type User } from '../api/services/auth/auth.types';
import { tokenStorage } from '../utils/storage/token.storage';
import { userService } from '../api/services/user/user.service';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Initialize auth state
    useEffect(() => {
        const initAuth = async () => {
            const token = tokenStorage.getToken();
            if (token) {
                try {
                    // Verify token by fetching profile? Or just load from storage?
                    // Rules say: "Server state is source of truth".
                    // Better to fetch profile if token exists.
                    const response = await userService.getProfile();
                    if (response.success && response.data) { // Assuming wrapper
                        setUser(response.data as unknown as User); // Force cast if types slightly differ
                    }
                } catch (error) {
                    // Token invalid
                    tokenStorage.clearAll();
                    setUser(null);
                }
            }
            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = (token: string, userData: User) => {
        tokenStorage.setToken(token);
        tokenStorage.setUserData(userData);
        setUser(userData);
    };

    const logout = () => {
        tokenStorage.clearAll();
        setUser(null);
        // Optional: QueryClient.clear()
    };

    const updateUser = (userData: User) => {
        setUser(userData);
        tokenStorage.setUserData(userData);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuthContext must be used within an AuthProvider');
    }
    return context;
};
