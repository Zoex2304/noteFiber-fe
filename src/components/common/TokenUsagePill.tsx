import { useRef, useEffect, useState } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { cn } from "@/lib/utils";
import { Search, Sparkles } from "lucide-react";
import { motion, AnimatePresence, useSpring } from "framer-motion";

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
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn("relative group rounded-full overflow-visible p-[2px]", className)}
        >
            {/* Orbiting Border Effect - White & Purple Comet */}
            <div className="absolute inset-0 rounded-full overflow-hidden">
                <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#7050f0_40%,#ffffff_50%,transparent_55%)] opacity-100 will-change-transform" />
            </div>

            {/* Main Pill / Button Container */}
            <div
                className={cn(
                    "relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all",
                    // 3D Glassy Gradient Button Style
                    "bg-gradient-to-b from-[#9E8CE8] to-[#7050F0]",
                    "text-white border border-white/20",
                    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_2px_8px_rgba(112,80,240,0.3)]",
                    compact && "px-1.5 py-0.5"
                )}
            >
                {/* Subtle sheen overlay */}
                <div className="absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-full" />

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
            </div>

            {/* Background Glow (Outer) - Softer White/Purple Mix */}
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-white/20 rounded-full blur-md -z-10" />
        </motion.div>
    );
}
