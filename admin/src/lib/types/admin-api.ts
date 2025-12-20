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
    status: z.enum(['active', 'pending', 'blocked']),
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

// API Response Wrapper Types
export const apiSuccessResponseSchema = z.object({
    status: z.literal('success'),
    message: z.string(),
    data: z.unknown(),
})

export const apiErrorResponseSchema = z.object({
    status: z.literal('error'),
    message: z.string(),
    code: z.number(),
})

export type ApiSuccessResponse<T> = {
    status: 'success'
    message: string
    data: T
}

export type ApiErrorResponse = z.infer<typeof apiErrorResponseSchema>
