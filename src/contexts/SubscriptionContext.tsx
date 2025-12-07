import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { paymentService } from '@/api/services/payment/payment.service';

interface SubscriptionContextType {
    isLoading: boolean;
    planName: string;
    isActive: boolean;
    features: {
        ai_chat: boolean;
        semantic_search: boolean;
        max_notes: number;
    };
    checkPermission: (feature: 'ai_chat' | 'semantic_search') => boolean;
    refreshSubscription: () => Promise<void>;
}

const defaultFeatures = {
    ai_chat: false,
    semantic_search: false,
    max_notes: 5,
};

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [planName, setPlanName] = useState<string>("Free Plan");
    const [isActive, setIsActive] = useState<boolean>(false);
    const [features, setFeatures] = useState(defaultFeatures);

    const fetchSubscriptionStatus = async () => {
        try {
            const response = await paymentService.getSubscriptionStatus();
            console.log("Subscription Status Response:", response); // Debug log

            if (response.success && response.data) {
                setPlanName(response.data.plan_name);
                setIsActive(response.data.is_active);

                let rawFeatures = response.data.features;
                let normalizedFeatures = { ...defaultFeatures };

                // Handle if features is an Array (list of strings)
                if (Array.isArray(rawFeatures)) {
                    console.warn("Features received as array, normalizing...");
                    const featureList = rawFeatures as unknown as string[];
                    normalizedFeatures = {
                        ai_chat: featureList.includes('ai_chat') || featureList.includes('aiChat'),
                        semantic_search: featureList.includes('semantic_search') || featureList.includes('semanticSearch'),
                        max_notes: 9999, // unlimited if array usually implies Pro
                    };
                }
                // Handle if features is an Object
                else if (typeof rawFeatures === 'object' && rawFeatures !== null) {
                    normalizedFeatures = {
                        ai_chat: rawFeatures.ai_chat || (rawFeatures as any).aiChat || false,
                        semantic_search: rawFeatures.semantic_search || (rawFeatures as any).semanticSearch || false,
                        max_notes: rawFeatures.max_notes || 5,
                    };
                }

                setFeatures(normalizedFeatures);
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
                features,
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
