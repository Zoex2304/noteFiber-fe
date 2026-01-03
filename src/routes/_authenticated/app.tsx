import { createFileRoute } from '@tanstack/react-router'
import { PersistentLayout } from '@/components/layout/PersistentLayout'

export const Route = createFileRoute('/_authenticated/app')({
    component: PersistentLayout,
})
