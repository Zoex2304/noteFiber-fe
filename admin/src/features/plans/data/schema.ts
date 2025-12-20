import { z } from 'zod'

// Plan Features Schema
export const planFeaturesSchema = z.object({
    max_notes: z.number().int().min(0),
    semantic_search: z.boolean(),
    ai_chat: z.boolean(),
    daily_token_limit: z.number().int().min(0),
})

export type PlanFeatures = z.infer<typeof planFeaturesSchema>

// Billing Period Schema
export const billingPeriodSchema = z.enum(['monthly', 'yearly'])
export type BillingPeriod = z.infer<typeof billingPeriodSchema>

// Subscription Plan Schema
export const subscriptionPlanSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    price: z.number(),
    billing_period: billingPeriodSchema,
    features: planFeaturesSchema,
})

export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>

// Create Plan Form Schema
export const createPlanFormSchema = z.object({
    name: z.string().min(1, 'Plan name is required'),
    slug: z
        .string()
        .min(1, 'Slug is required')
        .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
    price: z.coerce.number().min(0, 'Price must be 0 or greater'),
    tax_rate: z.coerce.number().min(0).max(1).optional(),
    billing_period: billingPeriodSchema,
    max_notes: z.coerce.number().int().min(0, 'Max notes must be 0 or greater'),
    semantic_search: z.boolean(),
    ai_chat: z.boolean(),
    daily_token_limit: z.coerce.number().int().min(0, 'Token limit must be 0 or greater'),
})

export type CreatePlanFormData = z.infer<typeof createPlanFormSchema>

// Update Plan Form Schema (all fields optional except features which are required if provided)
export const updatePlanFormSchema = z.object({
    name: z.string().min(1, 'Plan name is required').optional(),
    price: z.coerce.number().min(0, 'Price must be 0 or greater').optional(),
    tax_rate: z.coerce.number().min(0).max(1).optional(),
    max_notes: z.coerce.number().int().min(0, 'Max notes must be 0 or greater').optional(),
    semantic_search: z.boolean().optional(),
    ai_chat: z.boolean().optional(),
    daily_token_limit: z.coerce.number().int().min(0, 'Token limit must be 0 or greater').optional(),
})

export type UpdatePlanFormData = z.infer<typeof updatePlanFormSchema>
