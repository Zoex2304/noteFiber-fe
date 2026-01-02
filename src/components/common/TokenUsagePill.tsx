import { useSubscription } from "@/contexts/SubscriptionContext";
import { cn } from "@/lib/utils";
import { Zap, Search } from "lucide-react";

export interface TokenUsagePillProps {
    className?: string;
    type?: 'chat' | 'search';
}

export function TokenUsagePill({ className, type = 'chat' }: TokenUsagePillProps) {
    const { isActive, tokenUsage } = useSubscription();

    const metric = tokenUsage[type];

    // Only show if subscription is active and limit > 0
    if (!isActive || !metric || !metric.limit || metric.limit === 0) return null;

    const isChat = type === 'chat';

    return (
        <div
            className={cn(
                "flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                isChat
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-blue-50 text-blue-700 border-blue-200",
                className
            )}
            title={`Daily ${isChat ? 'AI Chat' : 'Semantic Search'} Usage`}
        >
            {isChat ? (
                <Zap className="w-3 h-3 text-purple-500 fill-purple-500" />
            ) : (
                <Search className="w-3 h-3 text-blue-500" />
            )}
            <span className="font-mono tracking-tight font-semibold">
                {metric.used.toLocaleString()}
                <span className="mx-0.5 opacity-60">/</span>
                {metric.limit === -1 ? '∞' : metric.limit.toLocaleString()}
            </span>
        </div>
    );
}
