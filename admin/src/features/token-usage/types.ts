/**
 * Token Usage Types for Admin Dashboard
 */

export interface TokenUsageItem {
    user_id: string;
    email: string;
    full_name?: string;
    plan_name: string;
    daily_limit: number;
    used_today: number;
    remaining: number;
    last_reset: string;
}

export interface TokenUsageResponse {
    message: string;
    data: TokenUsageItem[];
    meta?: {
        page: number;
        limit: number;
        total: number;
    };
}

export interface TokenUsageParams {
    page?: number;
    limit?: number;
}
