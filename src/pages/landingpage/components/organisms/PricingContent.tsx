import { useState } from "react";
import {
    SwitchPricing,
    type PricingPeriod,
} from "@/components/shadui/SwitchPricing";
import type { PricingCardData } from "@/components/shadui/PricingCard";
import { PricingCardTrailer } from "@/components/shadui/PricingCardTrailer";

// --- Data Placeholder (Tetap di sini) ---
const monthlyData: PricingCardData[] = [
    {
        title: "Basic plan",
        price: "$99.00",
        period: "/ month",
        description:
            "Perfect for small businesses or startups, our Starter Plan gives you the essential tools.",
        features: [
            "Unlimited Invoices",
            "Basic Reporting",
            "Email Support",
            "10 Team Members",
            "5GB Storage",
        ],
    },
    {
        title: "Pro plan",
        price: "$199.00",
        period: "/ month",
        description:
            "Ideal for growing businesses that need more power, features, and support.",
        features: [
            "Everything in Basic",
            "Advanced Reporting",
            "Priority Support",
            "50 Team Members",
            "50GB Storage",
        ],
    },
    {
        title: "Enterprise plan",
        price: "$399.00",
        period: "/ month",
        description:
            "For large organizations with complex needs and dedicated support requirements.",
        features: [
            "Everything in Pro",
            "Custom Reporting",
            "Dedicated Account Manager",
            "Unlimited Team Members",
            "500GB Storage",
        ],
    },
];

const yearlyData: PricingCardData[] = [
    { ...monthlyData[0], price: "$990.00", period: "/ year" },
    { ...monthlyData[1], price: "$1990.00", period: "/ year" },
    { ...monthlyData[2], price: "$3990.00", period: "/ year" },
];

export function PricingContent() {
    const [period, setPeriod] = useState<PricingPeriod>("monthly");
    const [isPulsing, setIsPulsing] = useState(false);

    const dataToDisplay = period === "monthly" ? monthlyData : yearlyData;

    const handleToggle = (newPeriod: PricingPeriod) => {
        if (newPeriod === period) return;
        setPeriod(newPeriod);
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 500);
    };

    return (
        <div className="flex flex-col items-center gap-6 lg:gap-[26.99px] w-full">
            {/* Switcher Pricing */}
            <SwitchPricing activePeriod={period} onToggle={handleToggle} />

            {/* Card Container */}
            <PricingCardTrailer cardsData={dataToDisplay} isPulsing={isPulsing} />
        </div>
    );
}
