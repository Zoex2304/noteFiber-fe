import { Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { TopBar } from "@/components/common/TopBar";
import { SearchDialog } from "@/components/search-dialog";
import { useNoteOrchestratorContext } from "@/contexts/NoteOrchestratorContext";
import { useChatStore } from "@/stores/useChatStore";
import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { playNotificationSound } from "@/utils/sound";

export function PersistentLayout() {
    const {
        appSidebarProps,
        noteSystem,
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
    } = useNoteOrchestratorContext();

    // Background Job Notification Logic
    const isGenerating = useChatStore(state => state.isGenerating);
    const prevGenerating = useRef(isGenerating);

    useEffect(() => {
        const handleOpenChatSidebar = () => setIsChatOpen(true);
        window.addEventListener("open-chat-sidebar", handleOpenChatSidebar);
        return () => window.removeEventListener("open-chat-sidebar", handleOpenChatSidebar);
    }, [setIsChatOpen]);

    useEffect(() => {
        // If we WERE generating, and now NOT generating, and sidebar is CLOSED
        // If we WERE generating, and now NOT generating, and sidebar is CLOSED
        if (prevGenerating.current && !isGenerating && !isChatOpen) {
            playNotificationSound();
            toast.success("Response Ready", {
                description: "The AI has finished processing your request.",
                action: {
                    label: "Open Chat",
                    onClick: () => setIsChatOpen(true)
                },
                duration: 5000
            });
        }
        prevGenerating.current = isGenerating;
    }, [isGenerating, isChatOpen, setIsChatOpen]);

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

                {/* Content Area - Where specific pages like MainApp, NotePage, AccountSettings rendered */}
                <div className="flex-1 flex flex-col bg-white overflow-y-auto overflow-x-hidden relative">
                    <Outlet />
                </div>
            </div>

            {/* Right Sidebar (Chat) */}
            <RightSidebar
                isOpen={isChatOpen}
                onToggle={() => setIsChatOpen(!isChatOpen)}
                onNavigateToNote={navigateToNote}
                notes={noteSystem.notes}
            />

            {/* Dialogs */}
            <SearchDialog
                open={searchOpen}
                onOpenChange={setSearchOpen}
                notes={noteSystem.notes}
                onNoteSelect={(noteId) => {
                    navigateToNote(noteId);
                    setSearchOpen(false);
                }}
            />
        </div>
    );
}

