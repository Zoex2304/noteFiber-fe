import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import { PricingModal } from '@/components/modals/PricingModal';
import { useCanUseFeature } from '@/hooks/payment';
import { useAuthContext } from '@/contexts/AuthContext';

interface LimitExceededInfo {
    featureName: string;
    used: number;
    limit: number;
    resetsAt?: string;
}

interface UsageLimitsContextType {
    // Modal controls
    showPricingModal: (featureName?: string, limitInfo?: Omit<LimitExceededInfo, 'featureName'>) => void;
    hidePricingModal: () => void;
    isPricingModalOpen: boolean;

    // Usage checking functions (with auto-modal on failure)
    checkCanCreateNotebook: () => Promise<boolean>;
    checkCanCreateNote: () => Promise<boolean>;
    checkCanUseAiChat: () => Promise<boolean>;
    checkCanUseSemanticSearch: () => Promise<boolean>;

    // Raw usage data
    usage: ReturnType<typeof useCanUseFeature>;
}

const UsageLimitsContext = createContext<UsageLimitsContextType | undefined>(undefined);

interface UsageLimitsProviderProps {
    children: ReactNode;
}

export function UsageLimitsProvider({ children }: UsageLimitsProviderProps) {
    const { isAuthenticated } = useAuthContext();
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [modalFeatureName, setModalFeatureName] = useState<string>('This feature');
    const [modalLimitInfo, setModalLimitInfo] = useState<Omit<LimitExceededInfo, 'featureName'> | undefined>();

    // Only fetch usage status when user is authenticated
    const usage = useCanUseFeature({ enabled: isAuthenticated });

    const showPricingModal = useCallback((featureName = 'This feature', limitInfo?: Omit<LimitExceededInfo, 'featureName'>) => {
        setModalFeatureName(featureName);
        setModalLimitInfo(limitInfo);
        setIsPricingModalOpen(true);
    }, []);

    const hidePricingModal = useCallback(() => {
        setIsPricingModalOpen(false);
        setModalLimitInfo(undefined);
    }, []);

    // Check functions that auto-show modal on failure
    const checkCanCreateNotebook = useCallback(async () => {
        const result = await usage.refetch();
        const freshData = result.data?.data;
        const canUse = freshData?.storage.notebooks.can_use ?? false;
        if (!canUse && freshData?.storage?.notebooks) {
            showPricingModal('notebooks', {
                used: freshData.storage.notebooks.used,
                limit: freshData.storage.notebooks.limit,
            });
        }
        return canUse;
    }, [usage, showPricingModal]);

    const checkCanCreateNote = useCallback(async () => {
        const result = await usage.refetch();
        const freshData = result.data?.data;
        const canUse = freshData?.storage.notes.can_use ?? false;
        if (!canUse && freshData?.storage?.notes) {
            showPricingModal('notes per notebook', {
                used: freshData.storage.notes.used,
                limit: freshData.storage.notes.limit,
            });
        }
        return canUse;
    }, [usage, showPricingModal]);

    const checkCanUseAiChat = useCallback(async () => {
        const result = await usage.refetch();
        const freshData = result.data?.data;
        const canUse = freshData?.daily.ai_chat.can_use ?? false;
        if (!canUse && freshData?.daily?.ai_chat) {
            showPricingModal('AI chat messages', {
                used: freshData.daily.ai_chat.used,
                limit: freshData.daily.ai_chat.limit,
                resetsAt: freshData.daily.ai_chat.resets_at,
            });
        }
        return canUse;
    }, [usage, showPricingModal]);

    const checkCanUseSemanticSearch = useCallback(async () => {
        const result = await usage.refetch();
        const freshData = result.data?.data;
        const canUse = freshData?.daily.semantic_search.can_use ?? false;
        if (!canUse && freshData?.daily?.semantic_search) {
            showPricingModal('semantic searches', {
                used: freshData.daily.semantic_search.used,
                limit: freshData.daily.semantic_search.limit,
                resetsAt: freshData.daily.semantic_search.resets_at,
            });
        }
        return canUse;
    }, [usage, showPricingModal]);

    return (
        <UsageLimitsContext.Provider
            value={{
                showPricingModal,
                hidePricingModal,
                isPricingModalOpen,
                checkCanCreateNotebook,
                checkCanCreateNote,
                checkCanUseAiChat,
                checkCanUseSemanticSearch,
                usage,
            }}
        >
            {children}
            <PricingModal
                isOpen={isPricingModalOpen}
                onClose={hidePricingModal}
                featureName={modalFeatureName}
                limitInfo={modalLimitInfo}
                currentPlanSlug={usage.plan?.slug}
            />
        </UsageLimitsContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUsageLimits() {
    const context = useContext(UsageLimitsContext);
    if (context === undefined) {
        throw new Error('useUsageLimits must be used within a UsageLimitsProvider');
    }
    return context;
}

/**
 * Helper function to handle 429 limit exceeded errors from API
 * Use this in your API error handlers
 */
// eslint-disable-next-line react-refresh/only-export-components
export function handleLimitExceededError(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    error: any,
    showPricingModal: UsageLimitsContextType['showPricingModal']
): boolean {
    // Check if this is a 429 error with limit exceeded data
    if (error?.response?.status === 429 || error?.code === 429) {
        const data = error?.response?.data?.data || error?.data;
        if (data) {
            const featureName = error?.response?.data?.message || 'Daily limit';
            showPricingModal(featureName, {
                used: data.used,
                limit: data.limit,
                resetsAt: data.reset_after,
            });
            return true;
        }
        // Show modal even without detailed data
        showPricingModal();
        return true;
    }

    // Check for 403 forbidden (feature requires upgrade)
    if (error?.response?.status === 403) {
        showPricingModal();
        return true;
    }

    return false;
}
