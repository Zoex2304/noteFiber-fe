import { useSubscription } from "@/contexts/SubscriptionContext";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

export interface TokenUsagePillProps {
    className?: string;
}

export function TokenUsagePill({ className }: TokenUsagePillProps) {
    const { isActive, tokenUsage } = useSubscription();

    // Only show if subscription is active and limit > 0
    if (!isActive || !tokenUsage.dailyLimit || tokenUsage.dailyLimit === 0) return null;

    return (
        <div
            className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                "bg-purple-50 text-purple-700 border-purple-200",
                className
            )}
            title="Daily AI Token Usage"
        >
            <Zap className="w-3 h-3 text-purple-500 fill-purple-500" />
            <span className="font-mono tracking-tight font-semibold">
                {tokenUsage.dailyUsed.toLocaleString()}
                <span className="mx-0.5 opacity-60">/</span>
                {tokenUsage.dailyLimit === -1 ? '∞' : tokenUsage.dailyLimit.toLocaleString()}
            </span>
        </div>
    );
}
