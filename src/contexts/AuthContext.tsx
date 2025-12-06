import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { type User } from '../api/services/auth/auth.types';
import { tokenStorage } from '../utils/storage/token.storage';
import { userService } from '../api/services/user/user.service';
import { debugLog } from '../utils/debug/LogOverlay';

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
            // Check for token in URL (OAuth redirect)
            const searchParams = new URLSearchParams(window.location.search);
            const urlToken = searchParams.get('token') || searchParams.get('access_token');
            const storedToken = tokenStorage.getToken();

            debugLog.info("AuthContext Init: Checking for token", { urlToken: !!urlToken, storedToken: !!storedToken, rawUrl: window.location.href });

            let token = urlToken || storedToken;

            if (urlToken) {
                // If token comes from URL, save it and clean URL
                debugLog.info("AuthContext: Found URL token, saving...", urlToken.substring(0, 10) + "...");
                tokenStorage.setToken(urlToken);
                window.history.replaceState({}, document.title, window.location.pathname);
            }

            if (token) {
                try {
                    debugLog.info("AuthContext: Attempting to fetch profile with token");
                    const response = await userService.getProfile();
                    debugLog.info("AuthContext: Profile fetch response", response);
                    if (response.success && response.data) {
                        setUser(response.data as unknown as User);
                    } else {
                        debugLog.error("AuthContext: Profile fetch failed (success=false)", response);
                    }
                } catch (error) {
                    debugLog.error("AuthContext: Profile fetch error", error);
                    // Token invalid
                    tokenStorage.clearAll();
                    setUser(null);
                }
            } else {
                debugLog.info("AuthContext: No token found");
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
