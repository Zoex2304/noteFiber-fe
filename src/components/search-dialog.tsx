"use client"

import * as React from "react"
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/shadui/command"
import { FileText, Loader2, SearchX, Search, Clock } from "lucide-react"
import type { Note } from "../types/note"
import { apiClient } from "@/api/client/axios.client"
import type { BaseResponse } from "../dto/base-response"
import type { GetSemanticSearchResponse } from "../dto/note"
import { Badge } from "./shadui/badge"

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

    // Derived state for local search (when query is empty or short, show recent?)
    // Actually, local notes are passed in `notes` prop.
    const recentNotes = React.useMemo(() => {
        return [...notes].sort((a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        ).slice(0, 5);
    }, [notes]);

    React.useEffect(() => {
        if (!query.trim()) {
            setSemanticResults([])
            return
        }

        setIsSearching(true)

        // Debounced Semantic Search
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
        onNoteSelect(noteId)
        onOpenChange(false)
        setQuery("")
    }

    return (
        <CommandDialog
            open={open}
            onOpenChange={onOpenChange}
            shouldFilter={false} // CRITICAL: Disable client-side filtering since we do server-side/async search!
        >
            <CommandInput
                placeholder="Search notes (semantic & fuzzy)..."
                value={query}
                onValueChange={setQuery}
            />
            <CommandList className="max-h-[500px]">
                {/* Loading State */}
                {isSearching && (
                    <div className="flex flex-col items-center justify-center py-8 gap-2 bg-gradient-to-b from-transparent to-gray-50/50">
                        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                        <p className="text-xs font-medium text-purple-600/80 animate-pulse">Thinking...</p>
                    </div>
                )}

                {/* Empty State / No Results */}
                {!isSearching && query && semanticResults.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-10 text-center animate-in fade-in zoom-in-95 duration-200">
                        <div className="bg-gray-50 p-4 rounded-full mb-3 ring-1 ring-gray-100">
                            <SearchX className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-sm font-semibold text-gray-900">No matches found</h3>
                        <p className="text-xs text-gray-500 mt-1 max-w-[240px] mx-auto">
                            Try rephrasing your search or looking for specific keywords.
                        </p>
                    </div>
                )}

                {/* Semantic Results */}
                {!isSearching && semanticResults.length > 0 && (
                    <CommandGroup heading="Contextual Matches" className="text-purple-900">
                        {semanticResults.map((note) => (
                            <CommandItem
                                key={note.id}
                                value={note.id}
                                onSelect={() => handleSelect(note.id)}
                                className="flex flex-col items-start gap-1.5 py-3 px-4 m-1 rounded-lg cursor-pointer aria-selected:bg-purple-50 aria-selected:text-purple-900 border border-transparent aria-selected:border-purple-100/50 transition-all"
                            >
                                <div className="flex items-center gap-2 w-full justify-between">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div className="p-1 rounded bg-purple-100/50 text-purple-600 shrink-0">
                                            <FileText className="h-3.5 w-3.5" />
                                        </div>
                                        <span className="font-medium truncate text-sm">{note.title}</span>
                                    </div>
                                    <Badge variant="secondary" className="text-[10px] h-5 bg-purple-100 text-purple-700 hover:bg-purple-200 shadow-none border-0">
                                        AI Match
                                    </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 pl-7 leading-relaxed opacity-90">
                                    {note.content}
                                </p>
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}

                {/* Recent Items (shown when query is empty) */}
                {!query && recentNotes.length > 0 && (
                    <>
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <div className="bg-purple-50 p-3 rounded-full mb-3">
                                <Search className="w-5 h-5 text-purple-600" />
                            </div>
                            <p className="text-sm font-medium text-gray-800">Ready to search</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Type keywords or ask questions to find your notes
                            </p>
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
        </CommandDialog>
    )
}
