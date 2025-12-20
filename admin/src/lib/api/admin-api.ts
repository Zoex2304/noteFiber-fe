import axios, { AxiosError } from 'axios'
import type {
    ApiSuccessResponse,
    DashboardStats,
    SubscriptionPlan,
    CreatePlanRequest,
    UpdatePlanRequest,
    UserDetail,
    RefundRequest,
    RefundResponse,
} from '../types/admin-api'

// Base API configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Dashboard Statistics API
export const adminDashboardApi = {
    /**
     * Fetch dashboard statistics including revenue, user counts, and recent transactions
     */
    async getStats(): Promise<DashboardStats> {
        const response = await apiClient.get<ApiSuccessResponse<DashboardStats>>('/admin/dashboard')
        return response.data.data
    },
}

// Subscription Plans API
export const adminPlansApi = {
    /**
     * Get all subscription plans
     */
    async getPlans(): Promise<SubscriptionPlan[]> {
        const response = await apiClient.get<ApiSuccessResponse<SubscriptionPlan[]>>('/admin/plans')
        return response.data.data
    },

    /**
     * Get a single subscription plan by ID
     */
    async getPlan(id: string): Promise<SubscriptionPlan> {
        const response = await apiClient.get<ApiSuccessResponse<SubscriptionPlan>>(
            `/admin/plans/${id}`
        )
        return response.data.data
    },

    /**
     * Create a new subscription plan
     */
    async createPlan(data: CreatePlanRequest): Promise<SubscriptionPlan> {
        const response = await apiClient.post<ApiSuccessResponse<SubscriptionPlan>>(
            '/admin/plans',
            data
        )
        return response.data.data
    },

    /**
     * Update an existing subscription plan
     */
    async updatePlan(id: string, data: UpdatePlanRequest): Promise<SubscriptionPlan> {
        const response = await apiClient.put<ApiSuccessResponse<SubscriptionPlan>>(
            `/admin/plans/${id}`,
            data
        )
        return response.data.data
    },

    /**
     * Delete a subscription plan (soft delete)
     */
    async deletePlan(id: string): Promise<void> {
        await apiClient.delete(`/admin/plans/${id}`)
    },
}

// User Management API
export const adminUsersApi = {
    /**
     * Get user detail including AI token usage
     */
    async getUserDetail(userId: string): Promise<UserDetail> {
        const response = await apiClient.get<ApiSuccessResponse<UserDetail>>(
            `/admin/users/${userId}`
        )
        return response.data.data
    },
}

// Refund Processing API
export const adminRefundsApi = {
    /**
     * Process a subscription refund
     */
    async processRefund(data: RefundRequest): Promise<RefundResponse> {
        const response = await apiClient.post<ApiSuccessResponse<RefundResponse>>(
            '/admin/subscriptions/refund',
            data
        )
        return response.data.data
    },
}

// Error handling helper
export function handleApiError(error: unknown): string {
    if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<{ message: string }>
        return axiosError.response?.data?.message || axiosError.message || 'An error occurred'
    }
    if (error instanceof Error) {
        return error.message
    }
    return 'An unknown error occurred'
}
