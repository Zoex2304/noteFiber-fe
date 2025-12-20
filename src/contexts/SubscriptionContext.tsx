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
            const response = await paymentService.getSubscriptionStatus();

            if (response.success && response.data) {
                setPlanName(response.data.plan_name);
                setIsActive(response.data.is_active);
                // Set subscription_id if available from response
                const responseData = response.data as Record<string, unknown>;
                console.log('Subscription Response Data:', responseData); // DEBUG LOG
                const subId = (responseData.subscription_id || responseData.id) as string | undefined;
                console.log('Extracted subscriptionId:', subId); // DEBUG LOG
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

                // Update token usage from response
                const dailyUsed = (response.data.ai_daily_usage as number) || 0;
                const dailyLimit = normalizedFeatures.daily_token_limit;
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
