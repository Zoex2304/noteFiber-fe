import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/auth/useAuth';
import { debugLog } from '@/utils/debug/LogOverlay';

export const GuestGuard = () => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-royal-violet-base border-t-transparent" />
            </div>
        );
    }

    if (isAuthenticated) {
        debugLog.info("GuestGuard: User is authenticated, redirecting to /app");
        return <Navigate to="/app" replace />;
    }

    return <Outlet />;
};
