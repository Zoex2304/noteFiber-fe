import { Outlet } from "@tanstack/react-router";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { RightSidebar } from "@/components/layout/RightSidebar";
import { TopBar } from "@/components/common/TopBar";
import { SearchDialog } from "@/components/search-dialog";
import { NoteOrchestratorProvider, useNoteOrchestratorContext } from "@/contexts/NoteOrchestratorContext";

function PersistentLayoutContent() {
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

export function PersistentLayout() {
    return (
        <NoteOrchestratorProvider>
            <PersistentLayoutContent />
        </NoteOrchestratorProvider>
    );
}
