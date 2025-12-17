import { useState } from "react";
import { useSubscriptionPlans } from "@/hooks/payment";
import { SwitchPricing, type PricingPeriod } from "@/components/shadui/SwitchPricing";
import { PricingCardTrailer } from "@/components/shadui/PricingCardTrailer";
import { Button } from "@/components/shadui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

export default function AppPricing() {
    const { data: plansResponse, isLoading, error } = useSubscriptionPlans();
    const navigate = useNavigate();
    const [period, setPeriod] = useState<PricingPeriod>("monthly");
    const [isPulsing, setIsPulsing] = useState(false);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-royal-violet-base" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex h-screen flex-col items-center justify-center gap-4">
                <p className="text-red-500">Failed to load plans</p>
                <Button onClick={() => window.location.reload()}>Retry</Button>
            </div>
        );
    }

    const allPlans = plansResponse?.data || [];

    // Robust Filtering Logic
    const filteredPlans = allPlans
        .filter(plan => {
            const planPeriod = plan.billing_period?.toLowerCase() || 'monthly';
            return planPeriod === period;
        })
        .sort((a, b) => a.price - b.price);

    const handleToggle = (newPeriod: PricingPeriod) => {
        if (newPeriod === period) return;
        setPeriod(newPeriod);
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 500);
    };

    // Map to PricingCardData format
    const cardsData = filteredPlans.map(plan => ({
        title: plan.name,
        slug: plan.slug, // Pass valid slug from backend
        price: plan.currency === 'IDR'
            ? `Rp${(plan.price).toLocaleString('id-ID')}`
            : `$${(plan.price / 100).toFixed(2)}`,
        period: plan.billing_period || (period === 'monthly' ? '/ month' : '/ year'),
        description: plan.description,
        features: plan.features,
        isPopular: plan.slug.includes("pro"),
    }));

    return (
        // Wrapper: min-h-screen for full height, flex-col for layout.
        <div className="min-h-screen bg-gray-50 flex flex-col py-12">

            {/* Inner Content Wrapper: Centered with mx-auto and max-width */}
            {/* The previous specialized 'lg:px' was likely conflicting with sidebar layout context. */}
            {/* Using max-w-7xl and mx-auto is the standard way to center content in a main view. */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 flex flex-col items-center">

                {/* Header Section */}
                <div className="w-full flex justify-center items-center relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate({ to: '..' })}
                        className="absolute left-0 rounded-full hover:bg-gray-200"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
                        <p className="text-gray-500 mt-1">Choose the perfect plan for your needs</p>
                    </div>
                </div>

                {/* Content Section: Switcher + Cards */}
                <div className="flex flex-col items-center gap-8 w-full">
                    <SwitchPricing activePeriod={period} onToggle={handleToggle} />

                    {cardsData.length > 0 ? (
                        // PricingCardTrailer now handles 'flex-1' on children for equal width
                        <PricingCardTrailer cardsData={cardsData} isPulsing={isPulsing} />
                    ) : (
                        <div className="text-center py-12">
                            <p className="text-lg text-gray-500">No {period} plans available at the moment.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
