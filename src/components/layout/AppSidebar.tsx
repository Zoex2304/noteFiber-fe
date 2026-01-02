"use client";

import { useState, useRef, useEffect } from "react";
import { Plus, FolderPlus, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/shadui/button";
import { ActionTooltip } from "@/components/common/ActionTooltip";
import { PlanStatusPill } from "@/components/common/PlanStatusPill";
import { Logo } from "@/components/shadui/Logo";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import type { Note } from "@/types/note";
import type { Notebook } from "@/types/notebook";

// Constants
const SIDEBAR_WIDTH = 280;
const SIDEBAR_COLLAPSED_WIDTH = 64;
const SIDEBAR_COOKIE_NAME = "sidebar_collapsed";

interface AppSidebarProps {
    notebooks: Notebook[];
    notes: Note[];
    selectedNotebook: string | null;
    selectedNote: string | null;
    onNotebookSelect: (notebookId: string) => void;
    onNoteSelect: (noteId: string) => void;
    onNotebookUpdate: (notebookId: string, updates: Partial<Notebook>) => void;
    onDeleteNotebook: (notebookId: string) => void;
    onDeleteNote: (noteId: string) => void;
    onMoveNote: (noteId: string, targetNotebookId: string) => void;
    onMoveNotebook: (notebookId: string, targetParentId: string | null) => void;
    expandedNotebooks: Set<string>;
    setExpandedNotebooks: (expanded: Set<string>) => void;
    isProcessingMove: boolean;
    isDeletingNotebook: string | null;
    isDeletingNote: string | null;
    onCreateNotebook: () => void;
    onCreateNote: () => void;
    isCreatingNotebook: boolean;
    isCreatingNote: boolean;
    onClearSelection: () => void;
}

export function AppSidebar({
    notebooks,
    notes,
    selectedNotebook,
    selectedNote,
    onNotebookSelect,
    onNoteSelect,
    onNotebookUpdate,
    onDeleteNotebook,
    onDeleteNote,
    onMoveNote,
    onMoveNotebook,
    expandedNotebooks,
    setExpandedNotebooks,
    isProcessingMove,
    isDeletingNotebook,
    isDeletingNote,
    onCreateNotebook,
    onCreateNote,
    isCreatingNotebook,
    isCreatingNote,
    onClearSelection,
}: AppSidebarProps) {
    // Collapse state with cookie persistence
    const [isCollapsed, setIsCollapsed] = useState(() => {
        if (typeof document !== "undefined") {
            return document.cookie.includes(`${SIDEBAR_COOKIE_NAME}=true`);
        }
        return false;
    });

    const sidebarRef = useRef<HTMLDivElement>(null);

    // Toggle collapse
    const toggleCollapse = () => {
        const newState = !isCollapsed;
        setIsCollapsed(newState);
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${newState}; path=/; max-age=${60 * 60 * 24 * 365}`;
    };

    // Click outside to clear selection
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Only clear if clicking on the sidebar background, not on items
            if (
                sidebarRef.current &&
                sidebarRef.current.contains(target) &&
                target === sidebarRef.current
            ) {
                onClearSelection();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [onClearSelection]);

    // Keyboard shortcut: Ctrl/Cmd + B to toggle
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "b" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                toggleCollapse();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <aside
            className={cn(
                "relative flex flex-col bg-white border-r border-gray-200 transition-[width] duration-200 ease-in-out",
                isCollapsed ? "w-16" : "w-72"
            )}
            style={{ width: isCollapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH }}
        >
            {/* Header: Logo + Actions on SAME row - h-12 to match TopBar */}
            <div className="h-12 px-3 border-b border-gray-200 flex items-center">
                <div className="flex items-center justify-between w-full">
                    {/* Logo */}
                    {isCollapsed ? (
                        <Logo variant="symbol" className="h-7 w-7 mx-auto" />
                    ) : (
                        <>
                            <Logo variant="horizontal" className="h-6" />
                            {/* Action Buttons (Icon-only like VS Code) */}
                            <div className="flex gap-1">
                                <ActionTooltip label="New Notebook" side="bottom">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onCreateNotebook}
                                        disabled={isCreatingNotebook}
                                        className="h-7 w-7"
                                    >
                                        {isCreatingNotebook ? (
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600" />
                                        ) : (
                                            <FolderPlus className="h-4 w-4" />
                                        )}
                                    </Button>
                                </ActionTooltip>

                                <ActionTooltip
                                    label={!selectedNotebook ? "Select a notebook first" : "New Note"}
                                    side="bottom"
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={onCreateNote}
                                        disabled={!selectedNotebook || isCreatingNote}
                                        className="h-7 w-7"
                                    >
                                        {isCreatingNote ? (
                                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600" />
                                        ) : (
                                            <Plus className="h-4 w-4" />
                                        )}
                                    </Button>
                                </ActionTooltip>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Content: File Tree */}
            <div
                ref={sidebarRef}
                className={cn(
                    "flex-1 overflow-auto",
                    isCollapsed && "overflow-hidden"
                )}
            >
                {!isCollapsed && (
                    <Sidebar
                        notebooks={notebooks}
                        notes={notes}
                        selectedNotebook={selectedNotebook}
                        selectedNote={selectedNote}
                        onNotebookSelect={onNotebookSelect}
                        onNoteSelect={onNoteSelect}
                        onNotebookUpdate={onNotebookUpdate}
                        onDeleteNotebook={onDeleteNotebook}
                        onDeleteNote={onDeleteNote}
                        onMoveNote={onMoveNote}
                        onMoveNotebook={onMoveNotebook}
                        expandedNotebooks={expandedNotebooks}
                        setExpandedNotebooks={setExpandedNotebooks}
                        isProcessingMove={isProcessingMove}
                        isDeletingNotebook={isDeletingNotebook}
                        isDeletingNote={isDeletingNote}
                    />
                )}
            </div>

            {/* Footer: Plan Status Pill (like Mistral AI) */}
            <div className="p-3 border-t border-gray-200">
                {isCollapsed ? (
                    <ActionTooltip label="Your Plan" side="right">
                        <div className="flex justify-center">
                            <PlanStatusPill compact />
                        </div>
                    </ActionTooltip>
                ) : (
                    <PlanStatusPill />
                )}
            </div>

            {/* Collapse Rail Button */}
            <button
                onClick={toggleCollapse}
                className={cn(
                    "absolute -right-3 top-1/2 -translate-y-1/2 z-10",
                    "flex h-6 w-6 items-center justify-center rounded-full",
                    "bg-white border border-gray-200 shadow-sm",
                    "hover:bg-gray-50 transition-colors"
                )}
                aria-label="Toggle Sidebar"
            >
                {isCollapsed ? (
                    <ChevronRight className="h-3.5 w-3.5 text-gray-600" />
                ) : (
                    <ChevronLeft className="h-3.5 w-3.5 text-gray-600" />
                )}
            </button>
        </aside>
    );
}
