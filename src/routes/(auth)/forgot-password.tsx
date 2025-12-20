import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuthContext } from '@/contexts/AuthContext'
import ForgotPassword from '@/pages/auth/ForgotPassword'

function ForgotPasswordRouteComponent() {
    const { user } = useAuthContext()
    if (user) {
        return <Navigate to="/app" />
    }
    return <ForgotPassword />
}

export const Route = createFileRoute('/(auth)/forgot-password')({
    component: ForgotPasswordRouteComponent,
})
