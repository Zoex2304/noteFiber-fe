"use client"

import * as React from "react"
import type { Note } from "@/types/note"
import { apiClient } from "@/api/client/axios.client"
import type { BaseResponse } from "@/dto/base-response"
import type { GetSemanticSearchResponse } from "@/dto/note"
import { useChatStore } from "@/stores/useChatStore"
import { Checkbox } from "@/components/shadui/checkbox"
import { Button } from "@/components/shadui/button"
import { Badge } from "@/components/shadui/badge"
import {
    Command,
    CommandDialog,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/shadui/command"
import {
    FileText,
    Loader2,
    SearchX,
    Search,
    Clock,
    MessageSquarePlus
} from "lucide-react"

interface SearchDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    notes: Note[]
    onNoteSelect: (noteId: string) => void
}

export function SearchDialog({ open, onOpenChange, onNoteSelect, notes }: SearchDialogProps) {
    const [query, setQuery] = React.useState("")
    const [semanticResults, setSemanticResults] = React.useState<Note[]>([])
    const [isSearching, setIsSearching] = React.useState(false)
    // Store access for export
    const setPreloadedReferences = useChatStore(state => state.setPreloadedReferences)
    // Removed direct sidebar control in favor of event dispatch

    // Selection state
    const [selectedNotes, setSelectedNotes] = React.useState<Set<string>>(new Set())

    const handleExportToChat = () => {
        const selected = semanticResults.filter(n => selectedNotes.has(n.id))
        setPreloadedReferences(selected)
        onOpenChange(false)

        // Dispatch a custom event that RightSidebar can listen to? 
        // Or simply relying on the user opening it. 
        // Ideally we should open it. 
        // Let's try emitting a window event for now as a quick fix or just rely on manual opening.
        // Actually, let's keep it clean. Just set data and close.
        // Provide visual feedback?

        // Let's dispatch a custom event 'open-chat-sidebar' that `MainApp.tsx` or `PersistentLayout` might listen to.
        window.dispatchEvent(new CustomEvent('open-chat-sidebar'))
    }

    // Derived state for local search
    const recentNotes = React.useMemo(() => {
        return [...notes].sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ).slice(0, 5);
    }, [notes]);

    React.useEffect(() => {
        // Clear selection when query changes significantly or dialog closes? 
        // Maybe keep selection while searching different terms? 
        // Let's keep selection to allow multi-query gathering!
    }, [query])

    React.useEffect(() => {
        if (!open) {
            setSemanticResults([])
            setQuery("")
            setSelectedNotes(new Set())
        }
    }, [open])

    /* ... existing search effect ... */
    React.useEffect(() => {
        if (!query.trim()) {
            setSemanticResults([])
            return
        }

        setIsSearching(true)

        const searchTimeout = setTimeout(async () => {
            try {
                const res = await apiClient.get<BaseResponse<GetSemanticSearchResponse[]>>(
                    `/note/v1/semantic-search?q=${query}`
                )
                const apiData = res.data.data ?? []
                const data: Note[] = apiData.map(note => ({
                    id: note.id,
                    content: note.content,
                    notebookId: note.notebook_id,
                    title: note.title,
                    createdAt: new Date(note.created_at),
                    updatedAt: new Date(note.updated_at ?? note.created_at)
                }))

                setSemanticResults(data)
            } catch (error) {
                console.error("Search failed:", error)
                setSemanticResults([])
            } finally {
                setIsSearching(false)
            }
        }, 300)

        return () => clearTimeout(searchTimeout)
    }, [query])

    const handleSelect = (noteId: string) => {
        if (selectedNotes.size > 0) {
            // If in selection mode, clicking row acts as toggle
            // But we need to pass event to stop propagation? 
            // Let's simplify: if selecting, separate click areas?
            // User behavior: Click text -> Go to note. Click checkbox -> Select.
            // So handleSelect should remain "Go to note".
            // We'll wrap checkbox in stopPropagation.
        }

        onNoteSelect(noteId)
        onOpenChange(false)
        setQuery("")
    }

    return (
        <CommandDialog
            open={open}
            onOpenChange={onOpenChange}
        >
            <Command shouldFilter={false}>
                <div className="flex flex-col h-full max-h-[600px]">
                    <CommandInput
                        placeholder="Search notes (semantic & fuzzy)..."
                        value={query}
                        onValueChange={setQuery}
                    />
                    <CommandList className="flex-1 overflow-y-auto">
                        {/* Loading State */}
                        {isSearching && (
                            <div className="flex flex-col items-center justify-center py-8 gap-2 bg-gradient-to-b from-transparent to-gray-50/50">
                                <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                                <p className="text-xs font-medium text-purple-600/80 animate-pulse">Thinking...</p>
                            </div>
                        )}

                        {/* Empty State */}
                        {!isSearching && query && semanticResults.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in-95 duration-200">
                                <div className="bg-gray-50 p-4 rounded-full mb-3 ring-1 ring-gray-100">
                                    <SearchX className="h-6 w-6 text-gray-400" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-900">No matches found</h3>
                            </div>
                        )}

                        {/* Semantic Results */}
                        {!isSearching && semanticResults.length > 0 && (
                            <CommandGroup heading="Contextual Matches" className="text-purple-900">
                                {semanticResults.map((note) => (
                                    <div
                                        key={note.id}
                                        className="flex items-start gap-2 px-2 m-1 rounded-lg hover:bg-gray-100/50 transition-colors group"
                                    >
                                        <div className="pt-4 shrink-0">
                                            <Checkbox
                                                checked={selectedNotes.has(note.id)}
                                                onCheckedChange={(checked) => {
                                                    const newSelected = new Set(selectedNotes)
                                                    if (checked) {
                                                        if (newSelected.size >= 5) return
                                                        newSelected.add(note.id)
                                                    } else {
                                                        newSelected.delete(note.id)
                                                    }
                                                    setSelectedNotes(newSelected)
                                                }}
                                                className="data-[state=checked]:bg-purple-600 data-[state=checked]:border-purple-600"
                                            />
                                        </div>
                                        <CommandItem
                                            value={note.id}
                                            onSelect={() => handleSelect(note.id)}
                                            className="flex-1 flex flex-col items-start gap-1.5 py-3 px-2 cursor-pointer !bg-transparent aria-selected:bg-transparent"
                                        >
                                            <div className="flex items-center gap-2 w-full justify-between">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="p-1 rounded bg-purple-100/50 text-purple-600 shrink-0">
                                                        <FileText className="h-3.5 w-3.5" />
                                                    </div>
                                                    <span className="font-medium truncate text-sm">{note.title}</span>
                                                </div>
                                                <Badge variant="secondary" className="text-[10px] h-5 bg-purple-100 text-purple-700 shadow-none border-0">
                                                    AI Match
                                                </Badge>
                                            </div>
                                            <p className="text-xs text-muted-foreground line-clamp-2 pl-7 leading-relaxed opacity-90">
                                                {note.content}
                                            </p>
                                        </CommandItem>
                                    </div>
                                ))}
                            </CommandGroup>
                        )}

                        {/* Recent Items */}
                        {!query && recentNotes.length > 0 && (
                            <>
                                <div className="flex flex-col items-center justify-center py-10 text-center">
                                    <div className="bg-purple-50 p-3 rounded-full mb-3">
                                        <Search className="w-5 h-5 text-purple-600" />
                                    </div>
                                    <p className="text-sm font-medium text-gray-800">Ready to search</p>
                                </div>
                                <CommandSeparator className="my-2" />
                                <CommandGroup heading="Recent Notes">
                                    {recentNotes.map((note) => (
                                        <CommandItem
                                            key={note.id}
                                            value={note.id}
                                            onSelect={() => handleSelect(note.id)}
                                            className="flex items-center gap-2 py-2.5 px-4 cursor-pointer m-1 rounded-md"
                                        >
                                            <Clock className="h-3.5 w-3.5 text-gray-400" />
                                            <span className="text-sm text-gray-700">{note.title}</span>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </>
                        )}
                    </CommandList>

                    {/* Export Footer */}
                    {selectedNotes.size > 0 && (
                        <div className="p-3 border-t bg-gray-50 flex items-center justify-between animate-in slide-in-from-bottom-2">
                            <span className="text-xs text-gray-500 font-medium ml-2">
                                {selectedNotes.size} note{selectedNotes.size !== 1 ? 's' : ''} selected
                            </span>
                            <Button
                                onClick={handleExportToChat}
                                size="sm"
                                className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                            >
                                <MessageSquarePlus className="h-4 w-4" />
                                Continue to Chat
                            </Button>
                        </div>
                    )}
                </div>
            </Command>
        </CommandDialog>
    )
}
