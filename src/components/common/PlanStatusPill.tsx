import { useSubscription } from "@/contexts/SubscriptionContext";
import { cn } from "@/lib/utils";
import { Sparkles } from "lucide-react";

interface PlanStatusPillProps {
    className?: string;
}

export function PlanStatusPill({ className }: PlanStatusPillProps) {
    const { planName, isActive } = useSubscription();

    // Determine styles based on plan status
    // Assuming "active" generally means a paid plan or valid subscription
    const isPro = isActive && planName.toLowerCase().includes("pro");
    const isEnterprise = isActive && planName.toLowerCase().includes("enterprise");
    const isPaid = isPro || isEnterprise;

    return (
        <div
            className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors",
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
