import { useRef, useEffect, useState } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { cn } from "@/lib/utils";
import { Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence, useSpring } from "framer-motion";
import { GradientPill } from "./GradientPill";

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
        <div className="relative inline-block overflow-hidden h-[1.2em] min-w-[3ch] text-center align-top">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.span
                    key={value}
                    custom={direction}
                    variants={{
                        // For countdown (dir -1): Enter from Top (-100%), Exit to Bottom (100%)
                        // For countup (dir 1): Enter from Bottom (100%), Exit to Top (-100%)
                        initial: (d: number) => ({ y: d > 0 ? "100%" : "-100%", opacity: 0 }),
                        animate: { y: "0%", opacity: 1 },
                        exit: (d: number) => ({ y: d > 0 ? "-100%" : "100%", opacity: 0 }),
                    }}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                    // Snappy digit flip to prevent "sinking" feeling
                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    className="absolute inset-0 flex items-center justify-center font-bold"
                >
                    {value.toLocaleString()}
                </motion.span>
            </AnimatePresence>
        </div>
    );
}

export function TokenUsagePill({ className, type = 'chat', compact = false }: TokenUsagePillProps) {
    const { isActive, tokenUsage } = useSubscription();
    const metric = tokenUsage[type];

    // Spring to drive the "Odometer" tumbling effect
    // Very slow stiffness to ensure we see the numbers tumbling (100..99..98)
    const springValue = useSpring(100, {
        stiffness: 15,
        damping: 10,
        mass: 1
    });

    const [displayedUsed, setDisplayedUsed] = useState(100);

    // Sync spring to state to trigger re-renders of AnimatedNumber
    useEffect(() => {
        return springValue.on("change", (latest) => {
            setDisplayedUsed(Math.max(0, Math.round(latest)));
        });
    }, [springValue]);

    useEffect(() => {
        if (metric?.used !== undefined) {
            // Reset to 100 on mount
            springValue.jump(100);

            // Trigger tumble to actual value after brief delay
            const t = setTimeout(() => springValue.set(metric.used), 400);

            return () => clearTimeout(t);
        }
    }, [metric?.used, springValue]);


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
                    <AnimatedNumber value={displayedUsed} />
                    <span className="text-white/60 font-medium mx-0.5">/</span>
                    <span>{metric.limit === -1 ? '∞' : metric.limit.toLocaleString()}</span>
                </span>
            )}
        </GradientPill>
    );
}
