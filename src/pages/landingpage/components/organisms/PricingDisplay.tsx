import { useState } from "react";
import {
    SwitchPricing,
    type PricingPeriod,
} from "@/components/shadui/SwitchPricing";
import type { PricingCardData } from "@/components/shadui/PricingCard";
import { PricingSection } from "@/components/shadui/PricingSection";
import { usePublicPlans } from "@/hooks/payment";
import { Loader2 } from "lucide-react";

interface PricingDisplayProps {
    // Optional customization for button behavior (e.g., in modal)
    onPlanSelect?: (planSlug: string) => void;
    currentPlanSlug?: string;
    showSwitcher?: boolean; // Default true
    /**
     * Context determines button behavior:
     * - 'landing': Always show "Get Started" → signup
     * - 'app': Show "Current plan" / "Upgrade to X"
     */
    context?: 'landing' | 'app';
}

/**
 * Reusable Pricing Display Organism
 * 
 * Encapsulates all pricing display logic:
 * - API data fetching
 * - Monthly/Yearly switcher
 * - Loading/Error states
 * - Pricing cards grid
 * 
 * Used in:
 * - Landing page MainContentSection5
 * - Pricing modal
 * - Any other pricing display
 */
export function PricingDisplay({
    onPlanSelect,
    currentPlanSlug,
    showSwitcher = true,
    context = 'app',
}: PricingDisplayProps) {
    const [period, setPeriod] = useState<PricingPeriod>("monthly");
    const [isPulsing, setIsPulsing] = useState(false);

    // Fetch public plans from API
    const { data: plansResponse, isLoading, error } = usePublicPlans();

    const handleToggle = (newPeriod: PricingPeriod) => {
        if (newPeriod === period) return;
        setPeriod(newPeriod);
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 500);
    };

    // Filter and transform API data to PricingCardData format
    const dataToDisplay: PricingCardData[] = (plansResponse?.data || [])
        .filter((plan) => {
            const planPeriod = plan.billing_period?.toLowerCase() || 'monthly';
            return planPeriod === period;
        })
        .map((plan) => {
            // Generate features from plan limits
            const features: string[] = [];

            if (plan.limits.max_notebooks === -1) {
                features.push("Unlimited notebooks");
            } else {
                features.push(`${plan.limits.max_notebooks} notebooks maximum`);
            }

            if (plan.limits.max_notes_per_notebook === -1) {
                features.push("Unlimited notes per notebook");
            } else {
                features.push(`${plan.limits.max_notes_per_notebook} notes per notebook`);
            }

            if (plan.limits.semantic_search_daily > 0) {
                if (plan.limits.semantic_search_daily === -1) {
                    features.push("Unlimited semantic search");
                } else {
                    features.push(`${plan.limits.semantic_search_daily} semantic searches/day`);
                }
            }

            if (plan.limits.ai_chat_daily > 0) {
                if (plan.limits.ai_chat_daily === -1) {
                    features.push("Unlimited AI chat");
                } else {
                    features.push(`${plan.limits.ai_chat_daily} AI chats/day`);
                }
            }

            // Format price
            const formattedPrice = new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
            }).format(plan.price);

            const baseData = {
                title: plan.name,
                price: formattedPrice,
                period: `/ ${plan.billing_period === 'monthly' ? 'month' : 'year'}`,
                description: plan.tagline || "",
                features,
                slug: plan.slug,
                isPopular: plan.is_most_popular,
            };

            // Add custom button behavior if onPlanSelect is provided (for modal usage)
            if (onPlanSelect) {
                return {
                    ...baseData,
                    onClick: () => onPlanSelect(plan.slug),
                    buttonText: plan.slug === currentPlanSlug ? "Current Plan" : "Upgrade Now",
                    isDisabled: plan.slug === currentPlanSlug,
                };
            }

            return baseData;
        });

    return (
        <div className="w-full">
            <div className="flex flex-col items-center gap-6 lg:gap-8">
                {/* Switcher Pricing */}
                {showSwitcher && (
                    <SwitchPricing activePeriod={period} onToggle={handleToggle} />
                )}

                {/* Card Container */}
                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-royal-violet-base" />
                    </div>
                ) : error ? (
                    <div className="text-center py-12">
                        <p className="text-red-500">Failed to load pricing plans</p>
                    </div>
                ) : dataToDisplay.length > 0 ? (
                    <PricingSection cardsData={dataToDisplay} isPulsing={isPulsing} context={context} />
                ) : (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No {period} plans available at the moment.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
