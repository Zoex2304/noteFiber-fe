import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuthContext } from '@/contexts/AuthContext'
import ResetPassword from '@/pages/auth/ResetPassword'

function ResetPasswordRouteComponent() {
    const { user } = useAuthContext()
    if (user) {
        return <Navigate to="/app" />
    }
    return <ResetPassword />
}

export const Route = createFileRoute('/(auth)/reset-password')({
    component: ResetPasswordRouteComponent,
})
