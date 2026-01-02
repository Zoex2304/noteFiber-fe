import { useSubscription } from "@/contexts/SubscriptionContext";
import { cn } from "@/lib/utils";
import { Sparkles, Crown } from "lucide-react";

interface PlanStatusPillProps {
    className?: string;
    compact?: boolean;
}

export function PlanStatusPill({ className, compact = false }: PlanStatusPillProps) {
    const { planName, isActive } = useSubscription();

    // Determine styles based on plan status
    const isPro = isActive && planName.toLowerCase().includes("pro");
    const isEnterprise = isActive && planName.toLowerCase().includes("enterprise");
    const isPaid = isPro || isEnterprise;

    // Compact mode: just show icon
    if (compact) {
        return (
            <div
                className={cn(
                    "flex items-center justify-center w-8 h-8 rounded-full transition-colors",
                    isPaid
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-gray-100 text-gray-500",
                    className
                )}
            >
                {isPaid ? (
                    <Crown className="w-4 h-4" />
                ) : (
                    <Sparkles className="w-4 h-4" />
                )}
            </div>
        );
    }

    return (
        <div
            className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors",
                isPaid
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-gray-100 text-gray-600 border-gray-200",
                className
            )}
        >
            {isPaid && <Sparkles className="w-3 h-3 text-emerald-500 fill-emerald-500" />}
            <span className="capitalize">{planName}</span>
        </div>
    );
}

