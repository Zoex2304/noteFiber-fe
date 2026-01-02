"use client";

import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { NoteEditor } from "@/components/note-editor";
import { SearchDialog } from "@/components/search-dialog";
import { AIChatDialog } from "@/components/ai-chat-dialog";
import type { Note } from "@/types/note";
import type { Notebook } from "@/types/notebook";
import { TopBar } from "@/components/common/TopBar";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import "@/App.css"; // Updated path
import type { BaseResponse } from "@/dto/base-response"; // Updated path
import type {
  MoveNotebookResponse,
  CreateNotebookRequest,
  CreateNotebookResponse,
  GetAllNotebookResponse,
  MoveNotebookRequest,
} from "@/dto/notebook"; // Updated path
import { apiClient } from "@/api/client/axios.client";
import type {
  UpdateNoteResponse,
  CreateNoteRequest,
  CreateNoteResponse,
  UpdateNoteRequest,
  MoveNoteResponse,
  MoveNoteRequest,
} from "@/dto/note"; // Updated path

import { UPGRADE_EVENT } from "@/api/client/axios.client";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useUsageLimits } from "@/contexts/UsageLimitsContext";

export default function MainApp() { // Renamed from App to MainApp
  const navigate = useNavigate();
  const { checkPermission } = useSubscription();
  const { checkCanCreateNotebook, checkCanCreateNote, checkCanUseAiChat, checkCanUseSemanticSearch } = useUsageLimits();
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(
    new Set()
  );
  const [isCreatingNote, setIsCreatingNote] = useState(false);
  const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
  const [isProcessingMove, setIsProcessingMove] = useState(false); // State for move operations
  const [isDeletingNotebook, setIsDeletingNotebook] = useState<string | null>(
    null
  ); // State for deleting notebook
  const [isDeletingNote, setIsDeletingNote] = useState<string | null>(null); // State for deleting note

  const currentNote = notes.find((note) => note.id === selectedNote);

  const fetchAllNotebooks = async () => {
    const data = await apiClient.get<BaseResponse<GetAllNotebookResponse[]>>(
      `/notebook/v1`
    );

    const notebooksData = data.data.data ?? [];
    setNotebooks(
      notebooksData.map((notebook) => ({
        id: notebook.id,
        name: notebook.name,
        parentId: notebook.parent_id,
        createdAt: new Date(notebook.created_at),
        updatedAt: new Date(notebook.updated_at ?? notebook.created_at),
      }))
    );

    const notes = notebooksData.reduce<Note[]>((currentNotes, notebook) => {
      return [
        ...currentNotes,
        ...notebook.notes.map<Note>((n) => ({
          id: n.id,
          title: n.title,
          content: n.content,
          createdAt: new Date(n.created_at),
          notebookId: notebook.id,
          updatedAt: new Date(n.updated_at ?? n.created_at),
        })),
      ];
    }, []);
    setNotes(notes);
  };

  useEffect(() => {
    fetchAllNotebooks();
  }, []);

  const handleNoteUpdate = async (noteId: string, updates: Partial<Note>) => {
    const request: UpdateNoteRequest = {
      title: updates.title ?? "",
      content: updates.content ?? "",
    };
    await apiClient.put<BaseResponse<UpdateNoteResponse>>(
      `/note/v1/${noteId}`,
      request
    );

    await fetchAllNotebooks();
  };

  const handleNotebookUpdate = () => {
    fetchAllNotebooks();
  };

  const handleDeleteNotebook = async (notebookId: string) => {
    if (isDeletingNotebook === notebookId) return; // Prevent double deletion

    setIsDeletingNotebook(notebookId); // Set loading for this specific notebook

    await apiClient.delete(`/notebook/v1/${notebookId}`);

    await fetchAllNotebooks();

    // Clear selection if deleted
    if (selectedNotebook === notebookId) {
      setSelectedNotebook(null);
      setSelectedNote(null);
    }

    setIsDeletingNotebook(null); // Clear loading
  };

  const handleDeleteNote = async (noteId: string) => {
    if (isDeletingNote === noteId) return; // Prevent double deletion

    setIsDeletingNote(noteId); // Set loading for this specific note

    await apiClient.delete(`/note/v1/${noteId}`);

    await fetchAllNotebooks();

    // Clear selection if deleted
    if (selectedNote === noteId) {
      setSelectedNote(null);
    }

    setIsDeletingNote(null); // Clear loading
  };

  const getAllChildNotebooks = (parentId: string): string[] => {
    const children = notebooks.filter((nb) => nb.parentId === parentId);
    const allIds = [parentId];

    children.forEach((child) => {
      allIds.push(...getAllChildNotebooks(child.id));
    });

    return allIds;
  };

  const handleMoveNote = async (noteId: string, targetNotebookId: string) => {
    setIsProcessingMove(true); // Start global loading for move
    await new Promise((resolve) => setTimeout(resolve, 800)); // Dummy delay

    setNotes((prev) =>
      prev.map((note) =>
        note.id === noteId
          ? { ...note, notebookId: targetNotebookId, updatedAt: new Date() }
          : note
      )
    );

    const request: MoveNoteRequest = {
      notebook_id: targetNotebookId,
    };
    await apiClient.put<BaseResponse<MoveNoteResponse>>(
      `/note/v1/${noteId}/move`,
      request
    );

    await fetchAllNotebooks();

    // Auto-expand target notebook
    setExpandedNotebooks((prev) => new Set([...prev, targetNotebookId]));
    setIsProcessingMove(false); // End global loading
  };

  const handleMoveNotebook = async (
    notebookId: string,
    targetParentId: string | null
  ) => {
    // Prevent moving a notebook into itself or its children
    const childIds = getAllChildNotebooks(notebookId);
    if (targetParentId && childIds.includes(targetParentId)) {
      return;
    }

    setIsProcessingMove(true); // Start global loading for move
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Dummy delay

    const request: MoveNotebookRequest = {
      parent_id: targetParentId,
    };
    await apiClient.put<BaseResponse<MoveNotebookResponse>>(
      `/notebook/v1/${notebookId}/move`,
      request
    );

    await fetchAllNotebooks();

    // Auto-expand target parent if it exists
    if (targetParentId) {
      setExpandedNotebooks((prev) => new Set([...prev, targetParentId]));
    }
    setIsProcessingMove(false); // End global loading
  };

  const handleCreateNote = async () => {
    if (!selectedNotebook || isCreatingNote) return;

    // Check usage limit before creating
    const canCreate = await checkCanCreateNote();
    if (!canCreate) return; // Modal auto-shows if limit exceeded

    setIsCreatingNote(true);

    const request: CreateNoteRequest = {
      title: "Untitled Note",
      content: "# Untitled Note\n\nStart writing...",
      notebook_id: selectedNotebook,
    };
    const res = await apiClient.post<BaseResponse<CreateNoteResponse>>(
      `/note/v1`,
      request
    );

    await fetchAllNotebooks();

    setSelectedNote(res.data.data.id);

    // Auto-expand the notebook when adding a note
    setExpandedNotebooks((prev) => new Set([...prev, selectedNotebook]));

    setIsCreatingNote(false);
  };

  const handleCreateNotebook = async () => {
    if (isCreatingNotebook) return;

    // Check usage limit before creating
    const canCreate = await checkCanCreateNotebook();
    if (!canCreate) return; // Modal auto-shows if limit exceeded

    setIsCreatingNotebook(true);

    const request: CreateNotebookRequest = {
      name: "New Notebook",
      parent_id: selectedNotebook ?? null,
    };
    await apiClient.post<BaseResponse<CreateNotebookResponse>>(
      `/notebook/v1`,
      request
    );

    await fetchAllNotebooks();

    // Auto-expand parent notebook when adding a child notebook
    if (selectedNotebook) {
      setExpandedNotebooks((prev) => new Set([...prev, selectedNotebook]));
    }

    setIsCreatingNotebook(false);
  };



  const handleClearSelection = () => {
    setSelectedNotebook(null);
    setSelectedNote(null);
  };

  const handleSearchClick = async () => {
    // First check daily limit for semantic search
    const canUse = await checkCanUseSemanticSearch();
    if (!canUse) return; // Modal auto-shows if limit exceeded

    // Then check if feature is enabled for plan
    if (checkPermission('semantic_search')) {
      setSearchOpen(true);
    } else {
      window.dispatchEvent(new Event(UPGRADE_EVENT));
    }
  };

  const handleChatClick = async () => {
    // First check daily limit for AI chat
    const canUse = await checkCanUseAiChat();
    if (!canUse) return; // Modal auto-shows if limit exceeded

    // Then check if feature is enabled for plan
    if (checkPermission('ai_chat')) {
      setChatOpen(true);
    } else {
      window.dispatchEvent(new Event(UPGRADE_EVENT));
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <AppSidebar
        notebooks={notebooks}
        notes={notes}
        selectedNotebook={selectedNotebook}
        selectedNote={selectedNote}
        onNotebookSelect={setSelectedNotebook}
        onNoteSelect={(noteId) => {
          navigate({ to: '/app/note/$noteId', params: { noteId } });
        }}
        onNotebookUpdate={handleNotebookUpdate}
        onDeleteNotebook={handleDeleteNotebook}
        onDeleteNote={handleDeleteNote}
        onMoveNote={handleMoveNote}
        onMoveNotebook={handleMoveNotebook}
        expandedNotebooks={expandedNotebooks}
        setExpandedNotebooks={setExpandedNotebooks}
        isProcessingMove={isProcessingMove}
        isDeletingNotebook={isDeletingNotebook}
        isDeletingNote={isDeletingNote}
        onCreateNotebook={handleCreateNotebook}
        onCreateNote={handleCreateNote}
        isCreatingNotebook={isCreatingNotebook}
        isCreatingNote={isCreatingNote}
        onClearSelection={handleClearSelection}
      />

      {/* Workspace (with embedded TopBar) */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TopBar now belongs to workspace */}
        <TopBar
          onSearchClick={handleSearchClick}
          onChatClick={handleChatClick}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-white overflow-x-hidden">
          {currentNote ? (
            <NoteEditor note={currentNote} onUpdate={handleNoteUpdate} />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center bg-white p-8">
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

      {/* Dialogs */}
      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        notes={notes}
        onNoteSelect={(noteId) => {
          navigate({ to: '/app/note/$noteId', params: { noteId } });
          setSearchOpen(false);
        }}
      />

      <AIChatDialog open={chatOpen} onOpenChange={setChatOpen} notes={notes} />
    </div>
  );
}
