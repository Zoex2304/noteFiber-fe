import { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth/useAuth";

export const AuthGuard = () => {
    const { isAuthenticated, isLoading } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (!isLoading && !isAuthenticated) {
            console.log("AuthGuard: Redirecting to signin", { isLoading, isAuthenticated, path: location.pathname });
            navigate("/signin", { state: { from: location.pathname } });
        }
    }, [isLoading, isAuthenticated, navigate, location]);

    if (isLoading) {
        // Can replace with a proper Loading Spinner component
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null; // Will redirect via useEffect
    }

    return <Outlet />;
};
