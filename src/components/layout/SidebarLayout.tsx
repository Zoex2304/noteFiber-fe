"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

interface SidebarLayoutProps {
    children: ReactNode;
    isCollapsed: boolean;
    onToggle: () => void;
    side?: "left" | "right";
    width?: number;
    collapsedWidth?: number;
    className?: string;
}

export function SidebarLayout({
    children,
    isCollapsed,
    onToggle,
    side = "left",
    width = 280,
    collapsedWidth = 64,
    className,
}: SidebarLayoutProps) {
    const isLeft = side === "left";

    return (
        <aside
            className={cn(
                "relative flex flex-col bg-white transition-[width] duration-200 ease-in-out z-20",
                isLeft ? "border-r border-gray-200" : "border-l border-gray-200",
                className
            )}
            style={{ width: isCollapsed ? collapsedWidth : width }}
        >
            {/* Collapse Toggle Button - Positioned on the edge */}
            <button
                onClick={onToggle}
                className={cn(
                    "absolute top-1/2 -translate-y-1/2 z-30",
                    "flex h-6 w-6 items-center justify-center rounded-full",
                    "bg-white border border-gray-200 shadow-sm",
                    "hover:bg-gray-50 transition-colors",
                    isLeft ? "-right-3" : "-left-3"
                )}
                aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
                {/* Logic for chevron direction based on side and interaction */}
                {isLeft ? (
                    isCollapsed ? <ChevronRight className="h-3.5 w-3.5 text-gray-600" /> : <ChevronLeft className="h-3.5 w-3.5 text-gray-600" />
                ) : (
                    isCollapsed ? <ChevronLeft className="h-3.5 w-3.5 text-gray-600" /> : <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
                )}
            </button>

            {/* Content Container */}
            <div className={cn("flex flex-col h-full w-full overflow-hidden")}>
                {children}
            </div>
        </aside>
    );
}
