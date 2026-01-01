/**
 * AI Limit Management Types
 * 
 * Type definitions for admin AI limit management feature.
 * Based on backend API specification v1.2.0
 */

// ========== Request Types ==========

/**
 * Request body for updating single user's AI limit
 */
export interface UpdateAiLimitRequest {
    /** -1 = unlimited, 0 = disabled, 1+ = specific limit */
    ai_daily_limit: number;
}

/**
 * Request body for bulk updating multiple users
 */
export interface BulkUpdateAiLimitRequest {
    user_ids: string[];
    ai_daily_limit: number;
}

/**
 * Request body for bulk resetting users to plan default
 */
export interface BulkResetAiLimitRequest {
    user_ids: string[];
}

// ========== Response Types ==========

/**
 * Single user token usage item
 */
export interface TokenUsageItem {
    user_id: string;
    email: string;
    full_name: string;
    plan_name: string;
    ai_daily_usage: number;
    ai_daily_credit_limit: number;
    ai_daily_remaining: number; // Computed by backend: limit - usage, -1 if unlimited
    ai_daily_usage_last_reset: string;
}

/**
 * Response data from updating a single user's AI limit
 */
export interface UpdateAiLimitResponse {
    user_id: string;
    previous_limit: number | null;
    new_limit: number;
    user_email: string;
}

/**
 * Response data from bulk operations
 */
export interface BulkAiLimitResponse {
    total_requested: number;
    total_updated: number;
    failed_user_ids: string[];
}

// ========== API Response Wrapper ==========

export interface TokenUsageApiResponse<T> {
    success: boolean;
    code: number;
    message: string;
    data: T;
}

// ========== UI Helper Types ==========

/**
 * Limit type for UI display
 */
export type LimitType = 'unlimited' | 'disabled' | 'plan_default' | 'custom';

/**
 * Get human-readable limit description
 */
export function getLimitDescription(limit: number | null): string {
    if (limit === null) return 'Plan Default';
    if (limit === -1) return 'Unlimited';
    if (limit === 0) return 'Disabled';
    return `${limit} / day`;
}

/**
 * Get limit type from value
 */
export function getLimitType(limit: number | null): LimitType {
    if (limit === null) return 'plan_default';
    if (limit === -1) return 'unlimited';
    if (limit === 0) return 'disabled';
    return 'custom';
}
