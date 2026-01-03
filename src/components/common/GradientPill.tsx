
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

export interface GradientPillProps {
    className?: string;
    children: ReactNode;
    onClick?: () => void;
    compact?: boolean;
    showGlow?: boolean;
}

export function GradientPill({
    className,
    children,
    onClick,
    compact = false,
    showGlow = true
}: GradientPillProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className={cn(
                "relative group rounded-full overflow-visible p-[2px] cursor-pointer",
                className
            )}
            onClick={onClick}
        >
            {/* Orbiting Border Effect - White & Purple Comet */}
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none">
                <div className="absolute inset-[-100%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_0deg_at_50%_50%,transparent_0%,#7050f0_40%,#ffffff_50%,transparent_55%)] opacity-100 will-change-transform" />
            </div>

            {/* Main Pill / Button Container */}
            <div
                className={cn(
                    "relative z-10 flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium transition-all group-hover:brightness-110",
                    // 3D Glassy Gradient Button Style
                    "bg-gradient-to-b from-[#9E8CE8] to-[#7050F0]",
                    "text-white border border-white/20",
                    "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),0_2px_8px_rgba(112,80,240,0.3)]",
                    compact && "px-1.5 py-0.5"
                )}
            >
                {/* Subtle sheen overlay */}
                <div className="absolute inset-x-0 top-0 h-[50%] bg-gradient-to-b from-white/10 to-transparent pointer-events-none rounded-t-full" />

                {children}
            </div>

            {/* Background Glow (Outer) - Softer White/Purple Mix */}
            {showGlow && (
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 to-white/20 rounded-full blur-md -z-10 transition-opacity group-hover:opacity-100" />
            )}
        </motion.div>
    );
}
