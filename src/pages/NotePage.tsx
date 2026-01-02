"use client";

import { AppSidebar } from "@/components/layout/AppSidebar";
import { NoteEditor } from "@/components/note-editor";
import { SearchDialog } from "@/components/search-dialog";
// AIChatDialog removed
import { NoteBreadcrumb } from "@/components/NoteBreadcrumb";
import { ArrowLeft, Loader2 } from "lucide-react";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { Link } from "@tanstack/react-router";
import { TopBar } from "@/components/common/TopBar";
import "@/App.css";
import { useNoteOrchestrator } from "@/hooks/useNoteOrchestrator";

export default function NotePage() {
    // -- Orchestration --
    const {
        appSidebarProps,
        activeNote,
        noteSystem,
        handleNoteUpdate,
        // Search
        searchOpen,
        setSearchOpen,
        checkAndOpenSearch,
        // Chat Sidebar
        isChatOpen,
        setIsChatOpen,
        checkAndToggleChat,
        // Navigation
        navigateToNote
    } = useNoteOrchestrator();

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {/* Left Sidebar */}
            <AppSidebar {...appSidebarProps} />

            {/* Main Workspace */}
            <div className="flex-1 flex flex-col min-w-0 h-full">
                <TopBar
                    onSearchClick={checkAndOpenSearch}
                    onChatClick={checkAndToggleChat}
                />

                <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                    {/* Note Content */}
                    <div className="absolute inset-0 flex flex-col overflow-y-auto overflow-x-hidden">
                        {activeNote.isLoadingNote ? (
                            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                                <div className="text-center">
                                    <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                                    <p className="text-gray-600">Loading note...</p>
                                </div>
                            </div>
                        ) : activeNote.noteError ? (
                            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">❌</div>
                                    <h2 className="text-xl font-medium mb-2 text-red-600">
                                        {activeNote.noteError}
                                    </h2>
                                    <Link
                                        to="/app"
                                        className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 mt-4"
                                    >
                                        <ArrowLeft className="h-4 w-4" />
                                        Back to Dashboard
                                    </Link>
                                </div>
                            </div>
                        ) : activeNote.currentNote ? (
                            <>
                                <NoteBreadcrumb
                                    note={activeNote.currentNote}
                                    onFolderClick={(folderId) => appSidebarProps.setExpandedNotebooks(prev => {
                                        const next = new Set(prev);
                                        // 1. Ensure ancestors
                                        const crumbIndex = activeNote.currentNote?.breadcrumb?.findIndex(b => b.id === folderId) ?? -1;
                                        if (crumbIndex > 0) {
                                            activeNote.currentNote?.breadcrumb?.slice(0, crumbIndex).forEach(crumb => {
                                                next.add(crumb.id);
                                            });
                                        }
                                        // 2. Toggle self
                                        if (next.has(folderId)) {
                                            next.delete(folderId);
                                        } else {
                                            next.add(folderId);
                                        }
                                        return next;
                                    })}
                                />
                                <div className="flex-1">
                                    <NoteEditor note={activeNote.currentNote} onUpdate={handleNoteUpdate} />
                                </div>
                            </>
                        ) : (
                            <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                                <div className="text-center">
                                    <div className="text-6xl mb-4">📝</div>
                                    <h2 className="text-xl font-medium mb-2">
                                        Select a note to start editing
                                    </h2>
                                    <p className="text-sm">
                                        Choose a note from the sidebar or create a new one
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Right Sidebar (Chat) */}
            <RightSidebar
                isOpen={isChatOpen}
                onToggle={() => setIsChatOpen(!isChatOpen)}
                onNavigateToNote={navigateToNote}
            />

            {/* Dialogs */}
            <SearchDialog
                open={searchOpen}
                onOpenChange={setSearchOpen}
                notes={noteSystem.notes}
                onNoteSelect={(selectedNoteId) => {
                    navigateToNote(selectedNoteId);
                    setSearchOpen(false);
                }}
            />
            {/* AIChatDialog removed */}
        </div>
    );
}
