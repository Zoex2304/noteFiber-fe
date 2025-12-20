import { z } from 'zod';

export const planSchema = z.object({
    id: z.string(),
    name: z.string(),
    slug: z.string(),
    price: z.number(),
    currency: z.string(),
    billing_period: z.string(),
    description: z.string(),
    features: z.array(z.string()),
    ai_daily_credit_limit: z.number().optional(), // Make optional if sometimes missing
    is_active: z.boolean(),
});

export const checkoutRequestSchema = z.object({
    plan_id: z.string(),
    first_name: z.string().min(1),
    last_name: z.string().min(1),
    email: z.string().email(),
    phone: z.string(),
    address_line1: z.string(),
    address_line2: z.string().optional(),
    city: z.string(),
    state: z.string(),
    postal_code: z.string(),
    country: z.string(),
});

export const checkoutResponseSchema = z.object({
    subscription_id: z.string(),
    order_id: z.string(),
    status: z.string(),
    snap_token: z.string(),
    snap_redirect_url: z.string(),
});

export const orderSummaryResponseSchema = z.object({
    plan_name: z.string(),
    billing_period: z.string(),
    price_per_unit: z.string(),
    subtotal: z.number(),
    tax: z.number(),
    total: z.number(),
    currency: z.string(),
});

export const subscriptionFeaturesSchema = z.object({
    ai_chat: z.boolean(),
    semantic_search: z.boolean(),
    max_notes: z.number(),
    daily_token_limit: z.number().optional(),
});

export const subscriptionStatusSchema = z.object({
    plan_name: z.string(),
    status: z.string(),
    is_active: z.boolean(),
    ai_daily_usage: z.number().optional(),
    features: subscriptionFeaturesSchema,
    subscription_id: z.string().optional(),
    id: z.string().optional(),
});
