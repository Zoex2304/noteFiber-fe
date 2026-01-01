/**
 * Token Usage Types for Admin Dashboard
 * Matches backend API response structure
 */

export interface TokenUsageItem {
    user_id: string;
    email: string;
    full_name: string;
    plan_name: string;
    ai_daily_usage: number;
    ai_daily_credit_limit: number;
    ai_daily_usage_last_reset: string;
}

export interface TokenUsageResponse {
    success: boolean;
    code: number;
    message: string;
    data: TokenUsageItem[];
}

export interface TokenUsageParams {
    page?: number;
    limit?: number;
}
