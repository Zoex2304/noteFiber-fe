"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "@tanstack/react-router";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { NoteEditor } from "@/components/note-editor";
import { SearchDialog } from "@/components/search-dialog";
import { AIChatDialog } from "@/components/ai-chat-dialog";
import { NoteBreadcrumb } from "@/components/NoteBreadcrumb";
import { ArrowLeft, Loader2 } from "lucide-react";
import type { Note } from "@/types/note";
import type { Notebook } from "@/types/notebook";
import { TopBar } from "@/components/common/TopBar";
import "@/App.css";
import type { BaseResponse } from "@/dto/base-response";
import type {
    MoveNotebookResponse,
    CreateNotebookRequest,
    CreateNotebookResponse,
    GetAllNotebookResponse,
    MoveNotebookRequest,
} from "@/dto/notebook";
import { apiClient } from "@/api/client/axios.client";
import type {
    UpdateNoteResponse,
    CreateNoteRequest,
    CreateNoteResponse,
    UpdateNoteRequest,
    MoveNoteResponse,
    MoveNoteRequest,
    ShowNoteResponse,
} from "@/dto/note";

import { UPGRADE_EVENT } from "@/api/client/axios.client";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useUsageLimits } from "@/contexts/UsageLimitsContext";

export default function NotePage() {
    const { noteId } = useParams({ from: "/_authenticated/app/note/$noteId" });
    const navigate = useNavigate();

    const { checkPermission } = useSubscription();
    const { checkCanCreateNotebook, checkCanCreateNote, checkCanUseAiChat, checkCanUseSemanticSearch } = useUsageLimits();

    const [notebooks, setNotebooks] = useState<Notebook[]>([]);
    const [notes, setNotes] = useState<Note[]>([]);
    const [currentNote, setCurrentNote] = useState<Note | null>(null);
    const [isLoadingNote, setIsLoadingNote] = useState(true);
    const [noteError, setNoteError] = useState<string | null>(null);
    const [selectedNotebook, setSelectedNotebook] = useState<string | null>(null);
    const [selectedNote, setSelectedNote] = useState<string | null>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [chatOpen, setChatOpen] = useState(false);
    const [expandedNotebooks, setExpandedNotebooks] = useState<Set<string>>(
        new Set()
    );
    const [isCreatingNote, setIsCreatingNote] = useState(false);
    const [isCreatingNotebook, setIsCreatingNotebook] = useState(false);
    const [isProcessingMove, setIsProcessingMove] = useState(false);
    const [isDeletingNotebook, setIsDeletingNotebook] = useState<string | null>(null);
    const [isDeletingNote, setIsDeletingNote] = useState<string | null>(null);

    // Fetch single note by ID with breadcrumb
    const fetchNote = async (id: string) => {
        setIsLoadingNote(true);
        setNoteError(null);
        try {
            const response = await apiClient.get<BaseResponse<ShowNoteResponse>>(
                `/note/v1/${id}`
            );
            const noteData = response.data.data;
            const note: Note = {
                id: noteData.id,
                title: noteData.title,
                content: noteData.content,
                notebookId: noteData.notebook_id,
                breadcrumb: noteData.breadcrumb,
                createdAt: new Date(noteData.created_at),
                updatedAt: new Date(noteData.updated_at ?? noteData.created_at),
            };
            setCurrentNote(note);
            setSelectedNote(note.id);
            setSelectedNotebook(note.notebookId);

            // Auto-expand sidebar based on breadcrumb
            if (noteData.breadcrumb?.length) {
                const ancestorIds = noteData.breadcrumb.map((b) => b.id);
                setExpandedNotebooks((prev) => new Set([...prev, ...ancestorIds]));
            }
        } catch (error) {
            console.error("Failed to fetch note:", error);
            setNoteError("Note not found or you don't have permission to view it.");
        } finally {
            setIsLoadingNote(false);
        }
    };

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

    useEffect(() => {
        if (noteId) {
            fetchNote(noteId);
        }
    }, [noteId]);

    const handleNoteUpdate = async (noteIdToUpdate: string, updates: Partial<Note>) => {
        const request: UpdateNoteRequest = {
            title: updates.title ?? "",
            content: updates.content ?? "",
        };
        await apiClient.put<BaseResponse<UpdateNoteResponse>>(
            `/note/v1/${noteIdToUpdate}`,
            request
        );

        await fetchAllNotebooks();
        // Refresh the current note
        if (noteId) {
            await fetchNote(noteId);
        }
    };

    const handleNotebookUpdate = () => {
        fetchAllNotebooks();
    };

    const handleDeleteNotebook = async (notebookId: string) => {
        if (isDeletingNotebook === notebookId) return;

        setIsDeletingNotebook(notebookId);
        await apiClient.delete(`/notebook/v1/${notebookId}`);
        await fetchAllNotebooks();

        if (selectedNotebook === notebookId) {
            setSelectedNotebook(null);
            setSelectedNote(null);
        }

        setIsDeletingNotebook(null);
    };

    const handleDeleteNote = async (noteIdToDelete: string) => {
        if (isDeletingNote === noteIdToDelete) return;

        setIsDeletingNote(noteIdToDelete);
        await apiClient.delete(`/note/v1/${noteIdToDelete}`);
        await fetchAllNotebooks();

        if (noteIdToDelete === noteId) {
            // Navigate back to main app if current note is deleted
            navigate({ to: "/app" });
        }

        setIsDeletingNote(null);
    };

    const getAllChildNotebooks = (parentId: string): string[] => {
        const children = notebooks.filter((nb) => nb.parentId === parentId);
        const allIds = [parentId];

        children.forEach((child) => {
            allIds.push(...getAllChildNotebooks(child.id));
        });

        return allIds;
    };

    const handleMoveNote = async (noteIdToMove: string, targetNotebookId: string) => {
        setIsProcessingMove(true);
        await new Promise((resolve) => setTimeout(resolve, 800));

        setNotes((prev) =>
            prev.map((note) =>
                note.id === noteIdToMove
                    ? { ...note, notebookId: targetNotebookId, updatedAt: new Date() }
                    : note
            )
        );

        const request: MoveNoteRequest = {
            notebook_id: targetNotebookId,
        };
        await apiClient.put<BaseResponse<MoveNoteResponse>>(
            `/note/v1/${noteIdToMove}/move`,
            request
        );

        await fetchAllNotebooks();
        setExpandedNotebooks((prev) => new Set([...prev, targetNotebookId]));
        setIsProcessingMove(false);
    };

    const handleMoveNotebook = async (
        notebookId: string,
        targetParentId: string | null
    ) => {
        const childIds = getAllChildNotebooks(notebookId);
        if (targetParentId && childIds.includes(targetParentId)) {
            return;
        }

        setIsProcessingMove(true);
        await new Promise((resolve) => setTimeout(resolve, 1000));

        const request: MoveNotebookRequest = {
            parent_id: targetParentId,
        };
        await apiClient.put<BaseResponse<MoveNotebookResponse>>(
            `/notebook/v1/${notebookId}/move`,
            request
        );

        await fetchAllNotebooks();

        if (targetParentId) {
            setExpandedNotebooks((prev) => new Set([...prev, targetParentId]));
        }
        setIsProcessingMove(false);
    };

    const handleCreateNote = async () => {
        if (!selectedNotebook || isCreatingNote) return;

        const canCreate = await checkCanCreateNote();
        if (!canCreate) return;

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

        // Navigate to the new note
        navigate({ to: "/app/note/$noteId", params: { noteId: res.data.data.id } });

        setExpandedNotebooks((prev) => new Set([...prev, selectedNotebook]));
        setIsCreatingNote(false);
    };

    const handleCreateNotebook = async () => {
        if (isCreatingNotebook) return;

        const canCreate = await checkCanCreateNotebook();
        if (!canCreate) return;

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

        if (selectedNotebook) {
            setExpandedNotebooks((prev) => new Set([...prev, selectedNotebook]));
        }

        setIsCreatingNotebook(false);
    };

    const handleClearSelection = () => {
        navigate({ to: "/app" });
    };

    const handleNoteSelect = (selectedNoteId: string) => {
        navigate({ to: "/app/note/$noteId", params: { noteId: selectedNoteId } });
    };

    const handleSearchClick = async () => {
        const canUse = await checkCanUseSemanticSearch();
        if (!canUse) return;

        if (checkPermission("semantic_search")) {
            setSearchOpen(true);
        } else {
            window.dispatchEvent(new Event(UPGRADE_EVENT));
        }
    };

    const handleChatClick = async () => {
        const canUse = await checkCanUseAiChat();
        if (!canUse) return;

        if (checkPermission("ai_chat")) {
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
                onNoteSelect={handleNoteSelect}
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
                {/* TopBar belongs to workspace */}
                <TopBar
                    onSearchClick={handleSearchClick}
                    onChatClick={handleChatClick}
                />

                {/* Main Content */}
                <div className="flex-1 flex flex-col bg-white overflow-x-hidden">
                    {isLoadingNote ? (
                        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                            <div className="text-center">
                                <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
                                <p className="text-gray-600">Loading note...</p>
                            </div>
                        </div>
                    ) : noteError ? (
                        <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-gray-50 to-white">
                            <div className="text-center">
                                <div className="text-6xl mb-4">❌</div>
                                <h2 className="text-xl font-medium mb-2 text-red-600">
                                    {noteError}
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
                    ) : currentNote ? (
                        <>
                            <NoteBreadcrumb
                                note={currentNote}
                                onFolderClick={(folderId) => setExpandedNotebooks(prev => {
                                    const next = new Set(prev);

                                    // 1. Find ancestors to ensure they are visible
                                    const crumbIndex = currentNote.breadcrumb?.findIndex(b => b.id === folderId) ?? -1;
                                    if (crumbIndex > 0) {
                                        // Add all parents (items before this one)
                                        currentNote.breadcrumb?.slice(0, crumbIndex).forEach(crumb => {
                                            next.add(crumb.id);
                                        });
                                    }

                                    // 2. Toggle the clicked folder itself
                                    if (next.has(folderId)) {
                                        next.delete(folderId);
                                    } else {
                                        next.add(folderId);
                                    }

                                    return next;
                                })}
                            />
                            <NoteEditor note={currentNote} onUpdate={handleNoteUpdate} />
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

            {/* Dialogs */}
            <SearchDialog
                open={searchOpen}
                onOpenChange={setSearchOpen}
                notes={notes}
                onNoteSelect={(selectedNoteId) => {
                    navigate({ to: "/app/note/$noteId", params: { noteId: selectedNoteId } });
                    setSearchOpen(false);
                }}
            />

            <AIChatDialog open={chatOpen} onOpenChange={setChatOpen} notes={notes} />
        </div>
    );
}
