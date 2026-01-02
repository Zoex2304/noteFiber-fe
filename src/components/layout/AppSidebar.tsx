"use client";

import { useRef, useEffect } from "react";
import { Plus, FolderPlus, ChevronsDown, ChevronsUp } from "lucide-react";
import { Button } from "@/components/shadui/button";
import { ActionTooltip } from "@/components/common/ActionTooltip";
import { PlanStatusPill } from "@/components/common/PlanStatusPill";
import { Logo } from "@/components/shadui/Logo";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import type { Note } from "@/types/note";
import type { Notebook } from "@/types/notebook";
import { SidebarLayout } from "./SidebarLayout";
import { useSidebarState } from "@/hooks/useSidebarState";

// Constants
const SIDEBAR_COOKIE_NAME = "sidebar_collapsed";

export interface AppSidebarProps {
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
    setExpandedNotebooks: React.Dispatch<React.SetStateAction<Set<string>>>;
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
    // Shared sidebar state logic with cookie persistence
    const { isCollapsed, toggle: toggleCollapse, expand } = useSidebarState({
        cookieName: SIDEBAR_COOKIE_NAME,
        defaultCollapsed: false
    });

    const sidebarRef = useRef<HTMLDivElement>(null);

    // Click outside to clear selection
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            // Only clear if calling on the sidebar background, not on items
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
    }, [toggleCollapse]);

    return (
        <SidebarLayout
            side="left"
            isCollapsed={isCollapsed}
            onToggle={toggleCollapse}
            className="border-r border-gray-200"
        >
            {/* Header: Logo + Actions on SAME row - h-12 to match TopBar */}
            <div className="h-12 px-4 border-b border-gray-200 flex items-center shrink-0">
                <div className="flex items-center justify-between w-full gap-2">
                    {/* Logo */}
                    {isCollapsed ? (
                        <Logo variant="symbol" className="h-7 w-7 mx-auto" />
                    ) : (
                        <>
                            <Logo variant="horizontal" className="h-7 shrink-0" />
                            {/* Action Buttons (Icon-only like VS Code) */}
                            <div className="flex gap-1 shrink-0">
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


                                <ActionTooltip
                                    label={expandedNotebooks.size === 0 ? "Expand All" : "Collapse All"}
                                    side="bottom"
                                >
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                            if (expandedNotebooks.size === 0) {
                                                // Expand All: Create set with ALL notebook IDs
                                                setExpandedNotebooks(new Set(notebooks.map(n => n.id)));
                                            } else {
                                                // Collapse All: Clear set
                                                setExpandedNotebooks(new Set());
                                            }
                                        }}
                                        className="h-7 w-7 group"
                                    >
                                        <div className="transition-transform duration-200 ease-in-out group-active:scale-90">
                                            {expandedNotebooks.size === 0 ? (
                                                <ChevronsDown className="h-4 w-4 transition-all duration-300" />
                                            ) : (
                                                <ChevronsUp className="h-4 w-4 transition-all duration-300" />
                                            )}
                                        </div>
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
                {/* Content: File Tree or Collapsed Actions */}
                {isCollapsed ? (
                    <div className="flex flex-col items-center py-4 gap-2">
                        <ActionTooltip label="New Notebook" side="right">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    expand(); // Auto-expand on click
                                    onCreateNotebook();
                                }}
                                disabled={isCreatingNotebook}
                                className="h-8 w-8"
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
                            side="right"
                        >
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    expand(); // Auto-expand on click
                                    onCreateNote();
                                }}
                                disabled={!selectedNotebook || isCreatingNote}
                                className="h-8 w-8"
                            >
                                {isCreatingNote ? (
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600" />
                                ) : (
                                    <Plus className="h-4 w-4" />
                                )}
                            </Button>
                        </ActionTooltip>
                    </div>
                ) : (
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
            <div className="p-3 border-t border-gray-200 shrink-0">
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
        </SidebarLayout>
    );
}
