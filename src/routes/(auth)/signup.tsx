import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuthContext } from '@/contexts/AuthContext'
import SignUp from '@/pages/auth/SignUp'

function SignUpRouteComponent() {
    const { user } = useAuthContext()

    // Guest guard: redirect if already authenticated
    if (user) {
        return <Navigate to="/app" />
    }

    return <SignUp />
}

export const Route = createFileRoute('/(auth)/signup')({
    component: SignUpRouteComponent,
})
