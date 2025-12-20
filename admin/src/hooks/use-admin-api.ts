import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
    adminDashboardApi,
    adminPlansApi,
    adminUsersApi,
    adminRefundsApi,
    handleApiError,
} from '../api/admin-api'
import type {
    CreatePlanRequest,
    UpdatePlanRequest,
    RefundRequest,
} from '../types/admin-api'

// Query keys
export const adminQueryKeys = {
    dashboard: ['admin', 'dashboard'] as const,
    plans: ['admin', 'plans'] as const,
    plan: (id: string) => ['admin', 'plans', id] as const,
    userDetail: (id: string) => ['admin', 'users', id] as const,
}

// Dashboard Hooks
export function useDashboardStats(options?: { refetchInterval?: number }) {
    return useQuery({
        queryKey: adminQueryKeys.dashboard,
        queryFn: () => adminDashboardApi.getStats(),
        refetchInterval: options?.refetchInterval || false,
    })
}

// Subscription Plans Hooks
export function useSubscriptionPlans() {
    return useQuery({
        queryKey: adminQueryKeys.plans,
        queryFn: () => adminPlansApi.getPlans(),
    })
}

export function useSubscriptionPlan(id: string) {
    return useQuery({
        queryKey: adminQueryKeys.plan(id),
        queryFn: () => adminPlansApi.getPlan(id),
        enabled: !!id,
    })
}

export function useCreatePlan() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: CreatePlanRequest) => adminPlansApi.createPlan(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.plans })
            toast.success('Subscription plan created successfully')
        },
        onError: (error) => {
            toast.error(`Failed to create plan: ${handleApiError(error)}`)
        },
    })
}

export function useUpdatePlan() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: UpdatePlanRequest }) =>
            adminPlansApi.updatePlan(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.plans })
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.plan(variables.id) })
            toast.success('Subscription plan updated successfully')
        },
        onError: (error) => {
            toast.error(`Failed to update plan: ${handleApiError(error)}`)
        },
    })
}

export function useDeletePlan() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (id: string) => adminPlansApi.deletePlan(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.plans })
            toast.success('Subscription plan deleted successfully')
        },
        onError: (error) => {
            toast.error(`Failed to delete plan: ${handleApiError(error)}`)
        },
    })
}

// User Detail Hook
export function useUserDetail(userId: string) {
    return useQuery({
        queryKey: adminQueryKeys.userDetail(userId),
        queryFn: () => adminUsersApi.getUserDetail(userId),
        enabled: !!userId,
    })
}

// Refund Hook
export function useProcessRefund() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: RefundRequest) => adminRefundsApi.processRefund(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: adminQueryKeys.dashboard })
            toast.success(`Refund processed successfully. Refund ID: ${response.refund_id}`)
        },
        onError: (error) => {
            toast.error(`Failed to process refund: ${handleApiError(error)}`)
        },
    })
}
