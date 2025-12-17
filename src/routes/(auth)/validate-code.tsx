import { createFileRoute, Navigate } from '@tanstack/react-router'
import { useAuthContext } from '@/contexts/AuthContext'
import ValidateCode from '@/pages/auth/ValidateCode'

export const Route = createFileRoute('/(auth)/validate-code')({
    beforeLoad: () => {
        const { user } = useAuthContext()
        if (user) {
            throw new Navigate({ to: '/app' })
        }
    },
    component: ValidateCode,
})
