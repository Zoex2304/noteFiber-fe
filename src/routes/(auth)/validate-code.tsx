import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuthContext } from '@/contexts/AuthContext'
import ValidateCode from '@/pages/auth/ValidateCode'

function ValidateCodeRouteComponent() {
    const { user } = useAuthContext()
    if (user) {
        return <Navigate to="/app" />
    }
    return <ValidateCode />
}

export const Route = createFileRoute('/(auth)/validate-code')({
    component: ValidateCodeRouteComponent,
})
