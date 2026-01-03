import { create } from 'zustand';
import { paymentService } from '@/api/services/payment/payment.service';

interface UsageMetric {
    used: number;
    limit: number;
    can_use: boolean;
    resets_at?: string;
    percentage: number;
}

interface SubscriptionState {
    // Plan & Status
    planName: string;
    isActive: boolean;
    subscriptionId: string | null;
    isLoading: boolean;

    // Features (Normalized)
    features: {
        ai_chat: boolean;
        semantic_search: boolean;
        max_notes: number;
        daily_token_limit: number;
    };

    // Usage Stats (Mapped from /api/user/usage-status)
    tokenUsage: {
        chat: UsageMetric;
        search: UsageMetric;
    };

    // Actions
    fetchSubscription: () => Promise<void>;
    checkPermission: (feature: 'ai_chat' | 'semantic_search') => boolean;
    checkLimit: (type: 'chat' | 'search') => boolean;
}

const defaultMetric: UsageMetric = { used: 0, limit: 0, can_use: false, percentage: 0 };
const defaultFeatures = { ai_chat: false, semantic_search: false, max_notes: 5, daily_token_limit: 0 };

export const useSubscriptionStore = create<SubscriptionState>((set, get) => ({
    planName: "Free Plan",
    isActive: false,
    subscriptionId: null,
    isLoading: true,
    features: defaultFeatures,
    tokenUsage: {
        chat: defaultMetric,
        search: defaultMetric,
    },

    fetchSubscription: async () => {
        set({ isLoading: true });
        try {
            // 1. Fetch Plan Status (Features, ID, Active Status)
            const subResponse = await paymentService.getSubscriptionStatus();

            // 2. Fetch Usage Status (Limits, Used Count)
            // We expect the JSON structure: data.daily.ai_chat, data.daily.semantic_search
            const usageResponse = await paymentService.getUsageStatus().catch(e => {
                console.warn("Usage fetch failed:", e);
                return { success: false, data: null };
            });

            // --- Process Subscription Data ---
            if (subResponse.success && subResponse.data) {
                const subData = subResponse.data;
                // Normalize features
                let normalizedFeatures = { ...defaultFeatures };
                const rawFeatures = subData.features;

                if (Array.isArray(rawFeatures)) {
                    // Handle string array ["ai_chat", "semantic_search"]
                    const list = (rawFeatures as unknown as string[]).map(f => f.toLowerCase());
                    normalizedFeatures.ai_chat = list.some(f => f.includes('chat'));
                    normalizedFeatures.semantic_search = list.some(f => f.includes('semantic'));
                    normalizedFeatures.max_notes = 9999; // Assume unlimited for paid plans if array
                } else if (typeof rawFeatures === 'object' && rawFeatures) {
                    // Handle object map
                    const rec = rawFeatures as Record<string, any>;
                    normalizedFeatures = {
                        ai_chat: !!(rec.ai_chat || rec.aiChat),
                        semantic_search: !!(rec.semantic_search || rec.semanticSearch),
                        max_notes: Number(rec.max_notes) || 5,
                        daily_token_limit: Number(rec.daily_token_limit) || 0
                    };
                }

                set({
                    planName: subData.plan_name,
                    isActive: subData.is_active,
                    subscriptionId: (subData as any).subscription_id || (subData as any).id || null,
                    features: normalizedFeatures
                });
            }

            // --- Process Usage Data ---
            if (usageResponse.success && usageResponse.data) {
                const uData = usageResponse.data as any; // Using any to be safe with dynamic API response
                const daily = uData.daily || {};

                const mapMetric = (source: any): UsageMetric => {
                    if (!source) return defaultMetric;
                    const used = Number(source.used) || 0;
                    const limit = Number(source.limit) || 0;
                    const can_use = source.can_use !== false; // Default true if missing?
                    const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
                    return { used, limit, can_use, resets_at: source.resets_at, percentage: pct };
                };

                set({
                    tokenUsage: {
                        chat: mapMetric(daily.ai_chat),
                        search: mapMetric(daily.semantic_search)
                    }
                });
            }

        } catch (error) {
            console.error("Subscription Sync Error:", error);
        } finally {
            set({ isLoading: false });
        }
    },

    checkPermission: (feature) => {
        return get().features[feature];
    },

    checkLimit: (type) => {
        const metric = get().tokenUsage[type];
        // If limit is -1 or 0 (sometimes means unlimited depending on backend convention, 
        // but usually 0 means no access if plan is free).
        // Based on JSON: "limit": 20000. 
        // If "can_use" is explicitly provided, verify that.
        if (metric.can_use === false) return false;
        if (metric.limit <= 0) return false; // Fail safe
        return metric.used < metric.limit;
    }
}));
