import { useRef, useEffect, useState } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { cn } from "@/lib/utils";
import { Zap, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface TokenUsagePillProps {
    className?: string;
    type?: 'chat' | 'search';
    compact?: boolean;
}

function AnimatedNumber({ value }: { value: number }) {
    const prevValue = useRef(value);
    const direction = value > prevValue.current ? 1 : -1;

    useEffect(() => {
        prevValue.current = value;
    }, [value]);

    return (
        <div className="relative inline-block overflow-hidden h-[1.2em] min-w-[1ch] text-center align-top">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.span
                    key={value}
                    custom={direction}
                    variants={{
                        initial: (d: number) => ({ y: d > 0 ? "100%" : "-100%", opacity: 0 }),
                        animate: { y: "0%", opacity: 1 },
                        exit: (d: number) => ({ y: d > 0 ? "-100%" : "100%", opacity: 0 }),
                    }}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 200, damping: 20 }}
                    className="absolute inset-0 flex items-center justify-center font-bold"
                >
                    {value}
                </motion.span>
            </AnimatePresence>
        </div>
    );
}

export function TokenUsagePill({ className, type = 'chat', compact = false }: TokenUsagePillProps) {
    const { isActive, tokenUsage } = useSubscription();
    const metric = tokenUsage[type];

    // Local state for "count-up" animation on mount
    const [displayedUsed, setDisplayedUsed] = useState(0);

    useEffect(() => {
        if (metric?.used !== undefined) {
            // Small delay to ensure the 0 is rendered first, then animates to the value
            const timer = setTimeout(() => setDisplayedUsed(metric.used), 100);
            return () => clearTimeout(timer);
        }
    }, [metric?.used]);


    // Only show if subscription is active and limit > 0
    if (!isActive || !metric || !metric.limit || metric.limit === 0) return null;

    const isChat = type === 'chat';

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn("relative group", className)}
        >
            {/* Outer Glow / Border Animation */}
            <motion.div
                className="absolute -inset-0.5 rounded-full bg-royal-violet-base opacity-40 blur-md"
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Main Pill Container */}
            <div
                className={cn(
                    "relative flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium shadow-md transition-all overflow-hidden",
                    // Persistent Purple Gradient Background
                    "bg-gradient-secondary text-white border border-white/20",
                    compact && "px-1.5 py-0.5"
                )}
            >
                {/* Shimmer Effect Overlay */}
                <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-12 pointer-events-none" />

                {isChat ? (
                    <Zap className={cn("w-3.5 h-3.5 text-white/90 fill-white/20", compact && "w-3.5 h-3.5")} />
                ) : (
                    <Search className={cn("w-3.5 h-3.5 text-white/90", compact && "w-3.5 h-3.5")} />
                )}

                {!compact && (
                    <span className="flex items-center gap-0.5 tracking-tight font-bold relative z-10 text-shadow-sm">
                        {/* Pass local state to trigger animation from 0 */}
                        <AnimatedNumber value={displayedUsed} />
                        <span className="text-white/60 font-medium mx-0.5">/</span>
                        <span>{metric.limit === -1 ? '∞' : metric.limit}</span>
                    </span>
                )}
            </div>
        </motion.div>
    );
}
