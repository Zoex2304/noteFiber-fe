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
    RefundListParams,
    RefundListItem,
    RefundApprovalResponse,
    User,
    UserListParams,
    UpdateUserRequest,
    SystemLog,
    LogDetail,
    LogListParams,
    UserGrowthData,
    Transaction,
    TransactionListParams,
    UpgradeSubscriptionRequest,
    UpgradeSubscriptionResponse,
    PlanDisplayFeature,
    CreatePlanDisplayFeatureRequest,
    UpdatePlanDisplayFeatureRequest,
    Feature,
    CreateFeatureRequest,
    UpdateFeatureRequest,
} from '../types/admin-api'
import { ADMIN_ENDPOINTS } from '../../config/admin-endpoints'

// Base API configuration
const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'
const API_BASE_URL = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
    // Fix: Use 'admin_token' to match what is stored in AdminAuthContext
    const token = localStorage.getItem('admin_token')
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
        const response = await apiClient.get<ApiSuccessResponse<DashboardStats>>(ADMIN_ENDPOINTS.DASHBOARD.STATS)
        return response.data.data
    },

    /**
     * Get user registration statistics over time (for charts)
     */
    async getGrowthStats(): Promise<UserGrowthData[]> {
        const response = await apiClient.get<ApiSuccessResponse<UserGrowthData[]>>(ADMIN_ENDPOINTS.DASHBOARD.GROWTH)
        return response.data.data
    },

    /**
     * Get paginated transaction history
     */
    async getTransactions(params: TransactionListParams): Promise<Transaction[]> {
        const response = await apiClient.get<ApiSuccessResponse<Transaction[]>>(ADMIN_ENDPOINTS.DASHBOARD.TRANSACTIONS, { params })
        return response.data.data
    },
}

// Subscription Plans API
export const adminPlansApi = {
    /**
     * Get all subscription plans
     */
    async getPlans(): Promise<SubscriptionPlan[]> {
        const response = await apiClient.get<ApiSuccessResponse<SubscriptionPlan[]>>(ADMIN_ENDPOINTS.PLANS.LIST)
        return response.data.data
    },

    /**
     * Get a single subscription plan by ID
     */
    async getPlan(id: string): Promise<SubscriptionPlan> {
        const response = await apiClient.get<ApiSuccessResponse<SubscriptionPlan>>(
            ADMIN_ENDPOINTS.PLANS.DETAIL(id)
        )
        return response.data.data
    },

    /**
     * Create a new subscription plan
     */
    async createPlan(data: CreatePlanRequest): Promise<SubscriptionPlan> {
        const response = await apiClient.post<ApiSuccessResponse<SubscriptionPlan>>(
            ADMIN_ENDPOINTS.PLANS.CREATE,
            data
        )
        return response.data.data
    },

    /**
     * Update an existing subscription plan
     */
    async updatePlan(id: string, data: UpdatePlanRequest): Promise<SubscriptionPlan> {
        const response = await apiClient.put<ApiSuccessResponse<SubscriptionPlan>>(
            ADMIN_ENDPOINTS.PLANS.UPDATE(id),
            data
        )
        return response.data.data
    },

    /**
     * Delete a subscription plan (soft delete)
     */
    async deletePlan(id: string): Promise<void> {
        await apiClient.delete(ADMIN_ENDPOINTS.PLANS.DELETE(id))
    },
}

// Plan Features API (Assignment)
export const adminPlanFeaturesApi = {
    /**
     * Get all features assigned to a plan
     */
    async getFeatures(planId: string): Promise<Feature[]> {
        const response = await apiClient.get<ApiSuccessResponse<Feature[]>>(
            ADMIN_ENDPOINTS.PLANS.FEATURES(planId)
        )
        return response.data.data ?? []
    },

    /**
     * Assign a feature to a plan
     */
    async assignFeature(planId: string, featureKey: string): Promise<Feature> {
        const response = await apiClient.post<ApiSuccessResponse<Feature>>(
            ADMIN_ENDPOINTS.PLANS.FEATURES(planId),
            { feature_key: featureKey }
        )
        return response.data.data
    },

    /**
     * Remove a feature from a plan
     */
    async removeFeature(planId: string, featureId: string): Promise<void> {
        await apiClient.delete(ADMIN_ENDPOINTS.PLANS.FEATURE_DELETE(planId, featureId))
    },
}

// User Management API
export const adminUsersApi = {
    /**
     * Get list of users
     */
    async getUsers(params: UserListParams): Promise<User[]> {
        const response = await apiClient.get<ApiSuccessResponse<User[]>>(ADMIN_ENDPOINTS.USERS.LIST, { params })
        return response.data.data
    },

    /**
     * Get user detail including AI token usage
     */
    async getUserDetail(userId: string): Promise<UserDetail> {
        const response = await apiClient.get<ApiSuccessResponse<UserDetail>>(
            ADMIN_ENDPOINTS.USERS.DETAIL(userId)
        )
        return response.data.data
    },

    /**
     * Update user status
     */
    async updateUserStatus(id: string, status: 'active' | 'pending' | 'banned', reason?: string): Promise<void> {
        await apiClient.put(ADMIN_ENDPOINTS.USERS.UPDATE_STATUS(id), { status, reason })
    },

    /**
     * Update user profile
     */
    async updateUserProfile(id: string, data: UpdateUserRequest): Promise<UserDetail> {
        const response = await apiClient.put<ApiSuccessResponse<UserDetail>>(ADMIN_ENDPOINTS.USERS.UPDATE_PROFILE(id), data)
        return response.data.data
    },

    /**
     * Soft delete user
     */
    async deleteUser(id: string): Promise<void> {
        await apiClient.delete(ADMIN_ENDPOINTS.USERS.DELETE(id))
    },
}

// Logging Management API
export const adminLogsApi = {
    /**
     * Get system logs
     */
    async getLogs(params: LogListParams): Promise<SystemLog[]> {
        const response = await apiClient.get<ApiSuccessResponse<SystemLog[]>>(ADMIN_ENDPOINTS.LOGS.LIST, { params })
        return response.data.data
    },

    /**
     * Get log details
     */
    async getLogDetail(id: string): Promise<LogDetail> {
        const response = await apiClient.get<ApiSuccessResponse<LogDetail>>(ADMIN_ENDPOINTS.LOGS.DETAIL(id))
        return response.data.data
    },
}

// Refund Processing API
export const adminRefundsApi = {
    /**
     * Get list of refund requests with filtering by status
     */
    async getRefunds(params?: RefundListParams): Promise<RefundListItem[]> {
        const response = await apiClient.get<ApiSuccessResponse<RefundListItem[]>>(ADMIN_ENDPOINTS.REFUNDS.LIST, { params })
        return response.data.data
    },

    /**
     * Get a single refund request details
     */
    async getRefund(id: string): Promise<RefundListItem> {
        const response = await apiClient.get<ApiSuccessResponse<RefundListItem>>(ADMIN_ENDPOINTS.REFUNDS.DETAIL(id))
        return response.data.data
    },

    /**
     * Approve a pending refund request
     */
    async approveRefund(id: string, adminNotes?: string): Promise<RefundApprovalResponse> {
        const response = await apiClient.post<ApiSuccessResponse<RefundApprovalResponse>>(
            ADMIN_ENDPOINTS.REFUNDS.APPROVE(id),
            { admin_notes: adminNotes }
        )
        return response.data.data
    },

    /**
     * Reject a pending refund request (optional future feature)
     */
    async rejectRefund(id: string, reason: string): Promise<void> {
        await apiClient.post(ADMIN_ENDPOINTS.REFUNDS.REJECT(id), { rejection_reason: reason })
    },

    /**
     * Process a subscription refund (legacy - for direct refund from dashboard)
     */
    async processRefund(data: RefundRequest): Promise<RefundResponse> {
        const response = await apiClient.post<ApiSuccessResponse<RefundResponse>>(
            ADMIN_ENDPOINTS.REFUNDS.PROCESS_LEGACY,
            data
        )
        return response.data.data
    },

    /**
     * Manually upgrade a user's subscription (Admin Override)
     */
    async upgradeSubscription(data: UpgradeSubscriptionRequest): Promise<UpgradeSubscriptionResponse> {
        const response = await apiClient.post<ApiSuccessResponse<UpgradeSubscriptionResponse>>(
            ADMIN_ENDPOINTS.REFUNDS.UPGRADE_SUBSCRIPTION,
            data
        )
        return response.data.data
    },
}

// Master Feature Management API
export const adminFeaturesApi = {
    /**
     * Get all master features
     */
    async getFeatures(): Promise<Feature[]> {
        const response = await apiClient.get<ApiSuccessResponse<Feature[]>>(ADMIN_ENDPOINTS.FEATURES.LIST)
        return response.data.data
    },

    /**
     * Create a new master feature
     */
    async createFeature(data: CreateFeatureRequest): Promise<Feature> {
        const response = await apiClient.post<ApiSuccessResponse<Feature>>(
            ADMIN_ENDPOINTS.FEATURES.CREATE,
            data
        )
        return response.data.data
    },

    /**
     * Update a master feature
     */
    async updateFeature(id: string, data: UpdateFeatureRequest): Promise<Feature> {
        const response = await apiClient.put<ApiSuccessResponse<Feature>>(
            ADMIN_ENDPOINTS.FEATURES.UPDATE(id),
            data
        )
        return response.data.data
    },

    /**
     * Delete a master feature
     */
    async deleteFeature(id: string): Promise<void> {
        await apiClient.delete(ADMIN_ENDPOINTS.FEATURES.DELETE(id))
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
