/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { paymentService } from '@/api/services/payment/payment.service';

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
        dailyUsed: number;
        dailyLimit: number;
        percentage: number;
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

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [planName, setPlanName] = useState<string>("Free Plan");
    const [isActive, setIsActive] = useState<boolean>(false);
    const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
    const [features, setFeatures] = useState(defaultFeatures);
    const [tokenUsage, setTokenUsage] = useState({
        dailyUsed: 0,
        dailyLimit: 0,
        percentage: 0,
    });

    const fetchSubscriptionStatus = async () => {
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

            const response = subResponse; // Keep variable name for minimal diff if wanted, or refactor below

            if (response.success && response.data) {
                setPlanName(response.data.plan_name);
                setIsActive(response.data.is_active);
                // Set subscription_id if available from response
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

                // Update token usage
                // Priority: Usage Status API > Subscription Status API
                let dailyUsed = 0;

                // Allow type assertion for usage response as strict types might not be exported here
                const usageData = usageResponse.data as any;

                if (usageResponse.success && usageData && usageData.daily?.ai_chat?.used !== undefined) {
                    dailyUsed = usageData.daily.ai_chat.used;
                } else {
                    // Fallback to subscription status fields
                    dailyUsed = response.data.ai_daily_usage ??
                        (response.data as any).ai_chat_daily_usage ??
                        (response.data as any).daily_usage ??
                        0;
                }

                // Robust Limit Calculation:
                // 1. Try explicit credit limit (new)
                // 2. Try explicit chat limit (old)
                // 3. Try to infer from usage + remaining (if available)
                // 4. Fallback to feature flags
                let dailyLimit = (response.data.ai_daily_credit_limit as number)
                    ?? (response.data.ai_chat_daily_limit as number);

                if ((dailyLimit === undefined || dailyLimit === 0) && typeof (response.data as any).ai_daily_remaining === 'number') {
                    dailyLimit = dailyUsed + ((response.data as any).ai_daily_remaining as number);
                }

                if (dailyLimit === undefined || dailyLimit === 0) {
                    dailyLimit = normalizedFeatures.daily_token_limit ?? 0;
                }

                // Ensure -1 is handled correctly (as infinity, usually passed as -1)

                const percentage = dailyLimit > 0 ? Math.min((dailyUsed / dailyLimit) * 100, 100) : 0;

                setTokenUsage({
                    dailyUsed,
                    dailyLimit,
                    percentage,
                });
            }
        } catch (error) {
            console.error("Failed to fetch subscription status:", error);
            // Default to free/locked state on error
            setFeatures(defaultFeatures);
        } finally {
            setIsLoading(false);
        }
    };

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
