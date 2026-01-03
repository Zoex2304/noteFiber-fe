import { useSubscription } from "@/contexts/SubscriptionContext";
import { cn } from "@/lib/utils";
import { Search, Sparkles } from "lucide-react";
import { GradientPill } from "./GradientPill";
import { AnimatedCounter } from "./AnimatedCounter";

export interface TokenUsagePillProps {
    className?: string;
    type?: 'chat' | 'search';
    compact?: boolean;
}



export function TokenUsagePill({ className, type = 'chat', compact = false }: TokenUsagePillProps) {
    const { isActive, tokenUsage } = useSubscription();
    const metric = tokenUsage[type];

    // Only show if subscription is active and limit > 0
    if (!isActive || !metric || !metric.limit || metric.limit === 0) return null;

    const isChat = type === 'chat';

    return (
        <GradientPill className={className} compact={compact}>
            {isChat ? (
                <Sparkles className={cn("w-3.5 h-3.5 text-white fill-white/20", compact && "w-3.5 h-3.5")} />
            ) : (
                <Search className={cn("w-3.5 h-3.5 text-white/90", compact && "w-3.5 h-3.5")} />
            )}

            {!compact && (
                <span className="flex items-center gap-0.5 tracking-tight font-bold relative z-10 text-shadow-sm font-sans">
                    <AnimatedCounter
                        value={metric.used}
                        initialValue={100}
                        formatter={(v) => v.toLocaleString()}
                    />
                    <span className="text-white/60 font-medium mx-0.5">/</span>
                    <span>{metric.limit === -1 ? '∞' : metric.limit.toLocaleString()}</span>
                </span>
            )}
        </GradientPill>
    );
}
