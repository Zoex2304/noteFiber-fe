/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { paymentService } from '@/api/services/payment/payment.service';

interface UsageMetric {
    used: number;
    limit: number;
    percentage: number;
}

interface SubscriptionContextType {
    isLoading: boolean;
    planName: string;
    isActive: boolean;
    subscriptionId: string | null;
    features: {
        ai_chat: boolean;
        semantic_search: boolean;
        max_notes: number;
        daily_token_limit: number;
    };
    tokenUsage: {
        chat: UsageMetric;
        search: UsageMetric;
    };
    checkPermission: (feature: 'ai_chat' | 'semantic_search') => boolean;
    refreshSubscription: () => Promise<void>;
}

const defaultFeatures = {
    ai_chat: false,
    semantic_search: false,
    max_notes: 5,
    daily_token_limit: 0,
};

const defaultMetric: UsageMetric = { used: 0, limit: 0, percentage: 0 };

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [planName, setPlanName] = useState<string>("Free Plan");
    const [isActive, setIsActive] = useState<boolean>(false);
    const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
    const [features, setFeatures] = useState(defaultFeatures);

    const [tokenUsage, setTokenUsage] = useState({
        chat: defaultMetric,
        search: defaultMetric,
    });

    const fetchSubscriptionStatus = useCallback(async () => {
        try {
            // Fetch both endpoints:
            // 1. Subscription Status (Plan info, Features)
            // 2. Usage Status (REAL-TIME usage count, critical for consistency with Modals)
            const [subResponse, usageResponse] = await Promise.all([
                paymentService.getSubscriptionStatus(),
                paymentService.getUsageStatus().catch(e => {
                    console.warn("Usage status fetch failed silently:", e);
                    return { success: false, data: null };
                })
            ]);

            const response = subResponse;

            if (response.success && response.data) {
                setPlanName(response.data.plan_name);
                setIsActive(response.data.is_active);

                const responseData = response.data as Record<string, unknown>;
                const subId = (responseData.subscription_id || responseData.id) as string | undefined;
                setSubscriptionId(subId || null);

                const rawFeatures = response.data.features;
                let normalizedFeatures = { ...defaultFeatures };

                // Handle if features is an Array (list of strings)
                if (Array.isArray(rawFeatures)) {
                    console.warn("Features received as array, normalizing...");
                    const featureList = (rawFeatures as unknown as string[]).map(f => f.toLowerCase());

                    normalizedFeatures.ai_chat = featureList.some(f =>
                        f === 'ai_chat' ||
                        f === 'aichat' ||
                        (f.includes('ai') && f.includes('chat'))
                    );

                    normalizedFeatures.semantic_search = featureList.some(f =>
                        f === 'semantic_search' ||
                        f === 'semanticsearch' ||
                        f.includes('semantic')
                    );

                    normalizedFeatures.max_notes = 9999;
                }
                // Handle if features is an Object
                else if (typeof rawFeatures === 'object' && rawFeatures !== null) {
                    const featureRecord = rawFeatures as Record<string, boolean | number>;
                    normalizedFeatures = {
                        ai_chat: !!(featureRecord.ai_chat || featureRecord.aiChat),
                        semantic_search: !!(featureRecord.semantic_search || featureRecord.semanticSearch),
                        max_notes: (featureRecord.max_notes as number) || 5,
                        daily_token_limit: (featureRecord.daily_token_limit as number) || 0,
                    };
                }

                setFeatures(normalizedFeatures);

                // --- Calculate Usage & Limits ---
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const usageData = usageResponse.success ? (usageResponse.data as any) : null;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const subData = response.data as any;

                // Helper to calculate metric
                const calculateMetric = (
                    usageKeys: string[],
                    limitKeys: string[],
                    defaultLimit: number
                ): UsageMetric => {
                    // 1. Get Usage
                    let used = 0;
                    // Try Usage Status API first (nested structure)
                    if (usageData && usageData.daily) {
                        if (usageKeys.includes('ai_chat') && usageData.daily.ai_chat?.used !== undefined) used = usageData.daily.ai_chat.used;
                        else if (usageKeys.includes('semantic_search') && usageData.daily.semantic_search?.used !== undefined) used = usageData.daily.semantic_search.used;
                    }
                    // Fallback to Subscription Status API
                    if (used === 0) {
                        for (const key of usageKeys) {
                            if (subData[key] !== undefined) {
                                used = subData[key];
                                break;
                            }
                        }
                    }

                    // 2. Get Limit
                    let limit = 0;
                    for (const key of limitKeys) {
                        if (subData[key] !== undefined) {
                            limit = subData[key];
                            break;
                        }
                    }
                    if (limit === 0 && defaultLimit > 0) limit = defaultLimit;

                    // 3. Calculate Percentage
                    const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;

                    return { used, limit, percentage };
                };

                // Chat Metrics
                const chatMetric = calculateMetric(
                    ['ai_chat_daily_usage', 'ai_daily_usage', 'daily_usage'],
                    ['ai_chat_daily_limit', 'ai_daily_credit_limit', 'ai_chat_limit'], // fallback keys
                    normalizedFeatures.daily_token_limit || 0
                );

                // Search Metrics
                const searchMetric = calculateMetric(
                    ['semantic_search_daily_usage'],
                    ['semantic_search_daily_limit', 'semantic_search_limit'],
                    100 // Default search limit fallback if not present? Or 0.
                );


                setTokenUsage({
                    chat: chatMetric,
                    search: searchMetric,
                });
            }
        } catch (error) {
            console.error("Failed to fetch subscription status:", error);
            // Default to free/locked state on error
            setFeatures(defaultFeatures);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        if (isAuthenticated) {
            fetchSubscriptionStatus();
        } else {
            setIsLoading(false);
            setFeatures(defaultFeatures);
        }
    }, [isAuthenticated]);

    const checkPermission = (feature: 'ai_chat' | 'semantic_search'): boolean => {
        return features[feature];
    };

    return (
        <SubscriptionContext.Provider
            value={{
                isLoading,
                planName,
                isActive,
                subscriptionId,
                features,
                tokenUsage,
                checkPermission,
                refreshSubscription: fetchSubscriptionStatus
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
};

export const useSubscription = () => {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error('useSubscription must be used within a SubscriptionProvider');
    }
    return context;
};
