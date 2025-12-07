"use client";

import { useEffect, useState } from "react";
import { Sidebar } from "@/components/sidebar"; // Updated path
import { NoteEditor } from "@/components/note-editor"; // Updated path
import { SearchDialog } from "@/components/search-dialog"; // Updated path
import { AIChatDialog } from "@/components/ai-chat-dialog"; // Updated path
import { Button } from "@/components/ui/button"; // Updated path
import { Plus, FolderPlus, XCircle } from "lucide-react"; // Import XCircle for clear button
import type { Note } from "@/types/note"; // Updated path
import type { Notebook } from "@/types/notebook"; // Updated path
import { TopBar } from "@/components/common/TopBar";
import { ActionTooltip } from "@/components/common/ActionTooltip";
import "@/App.css"; // Updated path
import axios from "axios";
import type { BaseResponse } from "@/dto/base-response"; // Updated path
import type {
  MoveNotebookResponse,
  CreateNotebookRequest,
  CreateNotebookResponse,
  GetAllNotebookResponse,
  MoveNotebookRequest,
} from "@/dto/notebook"; // Updated path
import { AppConfig } from "@/config/config"; // Updated path
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

export default function MainApp() { // Renamed from App to MainApp
  const { checkPermission } = useSubscription();
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
    const data = await axios.get<BaseResponse<GetAllNotebookResponse[]>>(
      `${AppConfig.baseUrl}/api/notebook/v1`
    );

    setNotebooks(
      data.data.data.map((notebook) => ({
        id: notebook.id,
        name: notebook.name,
        parentId: notebook.parent_id,
        createdAt: new Date(notebook.created_at),
        updatedAt: new Date(notebook.updated_at ?? notebook.created_at),
      }))
    );

    const notes = data.data.data.reduce<Note[]>((currentNotes, notebook) => {
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
    await axios.put<BaseResponse<UpdateNoteResponse>>(
      `${AppConfig.baseUrl}/api/note/v1/${noteId}`,
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

    await axios.delete(`${AppConfig.baseUrl}/api/notebook/v1/${notebookId}`);

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

    await axios.delete(`${AppConfig.baseUrl}/api/note/v1/${noteId}`);

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
    await axios.put<BaseResponse<MoveNoteResponse>>(
      `${AppConfig.baseUrl}/api/note/v1/${noteId}/move`,
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
    await axios.put<BaseResponse<MoveNotebookResponse>>(
      `${AppConfig.baseUrl}/api/notebook/v1/${notebookId}/move`,
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

    setIsCreatingNote(true);

    const request: CreateNoteRequest = {
      title: "Untitled Note",
      content: "# Untitled Note\n\nStart writing...",
      notebook_id: selectedNotebook,
    };
    const res = await axios.post<BaseResponse<CreateNoteResponse>>(
      `${AppConfig.baseUrl}/api/note/v1`,
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

    setIsCreatingNotebook(true);

    const request: CreateNotebookRequest = {
      name: "New Notebook",
      parent_id: selectedNotebook ?? null,
    };
    await axios.post<BaseResponse<CreateNotebookResponse>>(
      `${AppConfig.baseUrl}/api/notebook/v1`,
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

  const handleSearchClick = () => {
    if (checkPermission('semantic_search')) {
      setSearchOpen(true);
    } else {
      window.dispatchEvent(new Event(UPGRADE_EVENT));
    }
  };

  const handleChatClick = () => {
    if (checkPermission('ai_chat')) {
      setChatOpen(true);
    } else {
      window.dispatchEvent(new Event(UPGRADE_EVENT));
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Global Top Bar */}
      <TopBar
        onSearchClick={handleSearchClick}
        onChatClick={handleChatClick}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col shadow-sm">
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50">
            {/* New Note/Notebook Buttons moved here directly */}
            <div className="flex gap-2 mb-2">
              <ActionTooltip label="Create Notebook">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateNotebook}
                  disabled={isCreatingNotebook}
                  className="flex-1 bg-transparent"
                >
                  {isCreatingNotebook ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FolderPlus className="h-4 w-4 mr-2" />
                      New Notebook
                    </>
                  )}
                </Button>
              </ActionTooltip>

              <ActionTooltip label={!selectedNotebook ? "Select a notebook first" : "Create Note"}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCreateNote}
                  disabled={!selectedNotebook || isCreatingNote}
                  className="flex-1 bg-transparent"
                >
                  {isCreatingNote ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      New Note
                    </>
                  )}
                </Button>
              </ActionTooltip>
            </div>
            {(selectedNotebook || selectedNote) && (
              <ActionTooltip label="Clear Selection">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="w-full justify-center text-gray-600 hover:bg-gray-100"
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Clear Selection
                </Button>
              </ActionTooltip>
            )}
          </div>

          <Sidebar
            notebooks={notebooks}
            notes={notes}
            selectedNotebook={selectedNotebook}
            selectedNote={selectedNote}
            onNotebookSelect={setSelectedNotebook}
            onNoteSelect={setSelectedNote}
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
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col bg-white overflow-x-hidden">
          {currentNote ? (
            <NoteEditor note={currentNote} onUpdate={handleNoteUpdate} />
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

      {/* Dialogs */}
      <SearchDialog
        open={searchOpen}
        onOpenChange={setSearchOpen}
        notes={notes}
        onNoteSelect={(noteId) => {
          setSelectedNote(noteId);
          const note = notes.find((n) => n.id === noteId);
          if (note) {
            setSelectedNotebook(note.notebookId);
          }
          setSearchOpen(false);
        }}
      />

      <AIChatDialog open={chatOpen} onOpenChange={setChatOpen} notes={notes} />
    </div>
  );
}
