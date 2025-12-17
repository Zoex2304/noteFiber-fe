import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuthContext } from '@/contexts/AuthContext'
import SignUp from '@/pages/auth/SignUp'

export const Route = createFileRoute('/(auth)/signup')({
    beforeLoad: () => {
        // Guest guard: redirect if already authenticated
        const { user } = useAuthContext()
        if (user) {
            throw new Navigate({ to: '/app' })
        }
    },
    component: SignUp,
})
