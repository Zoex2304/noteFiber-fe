import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

interface AdminUser {
    id: string;
    email: string;
    full_name: string;
    role: 'admin';
}

interface AdminAuthContextType {
    admin: AdminUser | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_BASE_URL = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;

export const AdminAuthProvider = ({ children }: { children: ReactNode }) => {
    const [admin, setAdmin] = useState<AdminUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        const storedAdmin = localStorage.getItem('admin_user');

        if (token && storedAdmin) {
            try {
                setAdmin(JSON.parse(storedAdmin));
            } catch (error) {
                console.error('Failed to parse stored admin data:', error);
                localStorage.removeItem('admin_token');
                localStorage.removeItem('admin_user');
            }
        }
        setIsLoading(false);
    }, []);

    const login = async (email: string, password: string) => {
        try {
            // TODO: Replace with actual admin login endpoint
            // For now using placeholder - verify with backend team
            const response = await axios.post(`${API_BASE_URL}/admin/auth/signin`, {
                email,
                password,
            });

            const { token, user } = response.data.data;

            // Store token and user info
            localStorage.setItem('admin_token', token);
            localStorage.setItem('admin_user', JSON.stringify(user));

            setAdmin(user);
        } catch (error) {
            console.error('Admin login failed:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        setAdmin(null);
    };

    return (
        <AdminAuthContext.Provider
            value={{
                admin,
                login,
                logout,
                isAuthenticated: !!admin,
                isLoading,
            }}
        >
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
};
