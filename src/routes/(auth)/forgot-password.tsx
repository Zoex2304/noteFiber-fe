import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuthContext } from '@/contexts/AuthContext'
import ForgotPassword from '@/pages/auth/ForgotPassword'

export const Route = createFileRoute('/(auth)/forgot-password')({
    beforeLoad: () => {
        const { user } = useAuthContext()
        if (user) {
            throw new Navigate({ to: '/app' })
        }
    },
    component: ForgotPassword,
})
