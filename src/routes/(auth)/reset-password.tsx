import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuthContext } from '@/contexts/AuthContext'
import ResetPassword from '@/pages/auth/ResetPassword'

export const Route = createFileRoute('/(auth)/reset-password')({
    beforeLoad: () => {
        const { user } = useAuthContext()
        if (user) {
            throw new Navigate({ to: '/app' })
        }
    },
    component: ResetPassword,
})
