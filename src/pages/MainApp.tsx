"use client";

// ... imports
import { AppSidebar } from "@/components/layout/AppSidebar";
import { NoteEditor } from "@/components/note-editor";
import { SearchDialog } from "@/components/search-dialog";
// AIChatDialog removed
import { RightSidebar } from "@/components/layout/RightSidebar";
import { TopBar } from "@/components/common/TopBar";
import { DotLottieReact } from '@lottiefiles/dotlottie-react'; // Preserved
import "@/App.css";
// Removed duplicate DTO imports as they are handled by hooks now
import { useNoteOrchestrator } from "@/hooks/useNoteOrchestrator"; // New hook

export default function MainApp() {
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

  // MainApp specific: Dashboard content when no note is active
  // NotePage handles "Note not found" or "Loading", but MainApp is the root view.
  // If activeNote.currentNote is null, we show the Dashboard.

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

        {/* Content Area */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
          {activeNote.currentNote ? (
            <div className="absolute inset-0 flex flex-col overflow-y-auto overflow-x-hidden">
              {/* We re-use NoteBreadcrumb here if we want consistency? 
                    NotePage has it. MainApp didn't have it in old code, only Editor.
                    Let's match NotePage logic if a note IS selected (e.g. via deep link but rendered by MainApp?)
                    Wait, MainApp is likely the dashboard root. If URL has noteId, NotePage should be mounted?
                    If we are at /app, activeNote.currentNote is null.
                */}
              <NoteEditor note={activeNote.currentNote} onUpdate={handleNoteUpdate} />
            </div>
          ) : (
            /* Dashboard Empty State (Lottie) */
            <div className="flex-1 flex flex-col items-center justify-center bg-white p-8 overflow-auto">
              <div className="w-full max-w-[400px] mb-6">
                <DotLottieReact
                  src="https://lottie.host/d670d9d5-55ad-47ab-9def-49702f7c7e49/KrwUHw5kwJ.lottie"
                  loop
                  autoplay
                  className="w-full h-auto"
                />
              </div>
              <div className="text-center space-y-2 max-w-md">
                <h2 className="text-2xl font-semibold text-gray-800 tracking-tight">
                  Select a note to start editing
                </h2>
                <p className="text-gray-500 text-base">
                  Choose a note from the sidebar or create a new one to begin capturing your thoughts.
                </p>
              </div>
            </div>
          )}
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
      {/* AIChatDialog removed */}
    </div>
  );
}
