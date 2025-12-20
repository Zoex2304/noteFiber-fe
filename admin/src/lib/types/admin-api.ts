import { z } from 'zod'

// Dashboard Statistics Types
export const dashboardStatsSchema = z.object({
    total_revenue: z.number(),
    active_subscribers: z.number(),
    total_users: z.number(),
    active_users: z.number(),
    recent_transactions: z.array(
        z.object({
            id: z.string(),
            user_id: z.string(),
            user_email: z.string(),
            plan_name: z.string(),
            amount: z.number(),
            status: z.enum(['active', 'inactive', 'canceled']),
            payment_status: z.enum(['pending', 'success', 'failed', 'refunded']),
            transaction_date: z.string(),
            midtrans_order_id: z.string().nullable(),
        })
    ),
})

export type DashboardStats = z.infer<typeof dashboardStatsSchema>
export type RecentTransaction = DashboardStats['recent_transactions'][number]

// Subscription Plan Types
export const planFeaturesSchema = z.object({
    max_notes: z.number(),
    semantic_search: z.boolean(),
    ai_chat: z.boolean(),
    daily_token_limit: z.number(),
})

export const subscriptionPlanSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    price: z.number(),
    billing_period: z.enum(['monthly', 'yearly']),
    features: planFeaturesSchema,
})

export const subscriptionPlansSchema = z.array(subscriptionPlanSchema)

export type PlanFeatures = z.infer<typeof planFeaturesSchema>
export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>

// Create/Update Plan Request Types
export const createPlanRequestSchema = z.object({
    name: z.string().min(1),
    slug: z.string().min(1),
    price: z.number().min(0),
    tax_rate: z.number().optional(),
    billing_period: z.enum(['monthly', 'yearly']),
    features: planFeaturesSchema,
})

export const updatePlanRequestSchema = z.object({
    name: z.string().optional(),
    price: z.number().min(0).optional(),
    tax_rate: z.number().optional(),
    features: planFeaturesSchema.partial().optional(),
})

export type CreatePlanRequest = z.infer<typeof createPlanRequestSchema>
export type UpdatePlanRequest = z.infer<typeof updatePlanRequestSchema>

// User Detail with Token Usage Types
export const userDetailSchema = z.object({
    id: z.string(),
    email: z.string(),
    full_name: z.string(),
    role: z.enum(['user', 'admin']),
    status: z.enum(['active', 'pending', 'banned']),
    ai_daily_usage: z.number(),
    created_at: z.string(),
})

export type UserDetail = z.infer<typeof userDetailSchema>

// Refund Types
export const refundRequestSchema = z.object({
    subscription_id: z.string(),
    reason: z.string().min(1),
    amount: z.number().positive().optional(),
})

export const refundResponseSchema = z.object({
    refund_id: z.string(),
    refunded_amount: z.number(),
    status: z.string(),
})

export type RefundRequest = z.infer<typeof refundRequestSchema>
export type RefundResponse = z.infer<typeof refundResponseSchema>

// Refund List Types (for admin management page)
export const refundStatusSchema = z.enum(['pending', 'approved', 'rejected'])
export type RefundStatus = z.infer<typeof refundStatusSchema>

export const refundListParamsSchema = z.object({
    status: refundStatusSchema.optional(),
    page: z.number().default(1),
    limit: z.number().default(10),
})
export type RefundListParams = z.infer<typeof refundListParamsSchema>

export const refundListItemSchema = z.object({
    id: z.string(),
    user: z.object({
        id: z.string(),
        email: z.string(),
        full_name: z.string(),
    }),
    subscription: z.object({
        id: z.string(),
        plan_name: z.string(),
        amount_paid: z.number(),
        payment_date: z.string(),
    }),
    amount: z.number(),
    reason: z.string(),
    status: refundStatusSchema,
    admin_notes: z.string().optional(),
    created_at: z.string(),
    processed_at: z.string().optional(),
})
export type RefundListItem = z.infer<typeof refundListItemSchema>

export const refundApprovalResponseSchema = z.object({
    refund_id: z.string(),
    status: z.literal('approved'),
    refunded_amount: z.number(),
    processed_at: z.string(),
})
export type RefundApprovalResponse = z.infer<typeof refundApprovalResponseSchema>


// User Management Types
export const userListParamsSchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    q: z.string().optional(),
})

export type UserListParams = z.infer<typeof userListParamsSchema>

export const userSchema = z.object({
    id: z.string(),
    email: z.string(),
    full_name: z.string(),
    role: z.enum(['user', 'admin']),
    status: z.enum(['active', 'pending', 'banned']), // Updated from blocked to banned based on payload
    created_at: z.string(),
})

export type User = z.infer<typeof userSchema>

export const updateUserStatusSchema = z.object({
    status: z.enum(['active', 'pending', 'banned']),
    reason: z.string().optional(),
})

export const updateUserProfileSchema = z.object({
    full_name: z.string().optional(),
    email: z.string().email().optional(),
    role: z.enum(['user', 'admin']).optional(),
    status: z.enum(['active', 'pending', 'banned']).optional(),
    avatar: z.string().optional(),
})

export type UpdateUserRequest = z.infer<typeof updateUserProfileSchema>

// Logging Types
export const logListParamsSchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    level: z.string().optional(),
})

export type LogListParams = z.infer<typeof logListParamsSchema>

export const systemLogSchema = z.object({
    id: z.string(),
    level: z.string(),
    module: z.string(),
    message: z.string(),
    details: z.record(z.string(), z.any()).optional(),
    created_at: z.string(),
})

export type SystemLog = z.infer<typeof systemLogSchema>

export const logDetailSchema = systemLogSchema.extend({
    details: z.record(z.string(), z.any()).optional(),
})

export type LogDetail = z.infer<typeof logDetailSchema>


// API Response Wrapper Types
export const apiSuccessResponseSchema = z.object({
    status: z.literal('success'), // Keeping status for compatibility if backend sends it
    success: z.boolean().optional(), // Adding success for new payloads
    message: z.string().optional(),
    data: z.unknown(),
})

export const apiErrorResponseSchema = z.object({
    status: z.literal('error'),
    success: z.boolean().optional(),
    message: z.string(),
    code: z.number().optional(),
})

export type ApiSuccessResponse<T> = {
    status?: 'success'
    success?: boolean
    message?: string
    data: T
}

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>

// User Growth Stats Types
export const userGrowthDataSchema = z.object({
    date: z.string(),
    count: z.number(),
})

export type UserGrowthData = z.infer<typeof userGrowthDataSchema>

// Transaction Types
export const transactionListParamsSchema = z.object({
    page: z.number().default(1),
    limit: z.number().default(10),
    status: z.string().optional(),
})

export type TransactionListParams = z.infer<typeof transactionListParamsSchema>

export const transactionSchema = z.object({
    id: z.string(),
    user_id: z.string(),
    user_email: z.string(),
    plan_name: z.string(),
    amount: z.number(),
    status: z.string(),
    payment_status: z.string(),
    transaction_date: z.string(),
    midtrans_order_id: z.string().nullable(),
})

export type Transaction = z.infer<typeof transactionSchema>

// Subscription Upgrade Types
export const upgradeSubscriptionRequestSchema = z.object({
    user_id: z.string(),
    new_plan_id: z.string(),
})

export const upgradeSubscriptionResponseSchema = z.object({
    old_subscription_id: z.string(),
    new_subscription_id: z.string(),
    status: z.string(),
})

export type UpgradeSubscriptionRequest = z.infer<typeof upgradeSubscriptionRequestSchema>
export type UpgradeSubscriptionResponse = z.infer<typeof upgradeSubscriptionResponseSchema>
