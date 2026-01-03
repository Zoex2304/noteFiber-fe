"use client";

import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import "@/App.css";
import { useNoteOrchestratorContext } from "@/contexts/NoteOrchestratorContext";
import { NoteEditor } from "@/components/note-editor";

export default function MainApp() {
  const {
    activeNote,
    handleNoteUpdate,
  } = useNoteOrchestratorContext();

  // If there's an active note (e.g. from deep link but rendered here), show editor.
  // Otherwise show dashboard empty state.
  if (activeNote.currentNote) {
    return (
      <div className="absolute inset-0 flex flex-col overflow-y-auto overflow-x-hidden">
        <NoteEditor note={activeNote.currentNote} onUpdate={handleNoteUpdate} />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-white p-8 overflow-auto h-full">
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
  );
}
