"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Eye, Edit, Save } from "lucide-react"
import { Editor } from "./organisms/Editor"
import type { Note } from "../types/note"
import { formatUpdatedAt } from "../lib/date"

interface NoteEditorProps {
    note: Note
    onUpdate: (noteId: string, updates: Partial<Note>) => void
}

export function NoteEditor({ note, onUpdate }: NoteEditorProps) {
    const [isPreview, setIsPreview] = useState(false)
    const [content, setContent] = useState(note.content)
    const [title, setTitle] = useState(note.title)
    const [hasChanges, setHasChanges] = useState(false)
    const [isSaving, setIsSaving] = useState(false)

    // Track last saved values to prevent race condition
    const lastSavedRef = useRef({ content: note.content, title: note.title })

    useEffect(() => {
        setContent(note.content)
        setTitle(note.title)
        setHasChanges(false)
        // Update ref when note changes from external source
        lastSavedRef.current = { content: note.content, title: note.title }
    }, [note.id, note.content, note.title])

    useEffect(() => {
        // Compare against last saved values, not note props (which may be stale during refetch)
        const saved = lastSavedRef.current
        setHasChanges(content !== saved.content || title !== saved.title)
    }, [content, title])

    const handleSave = async () => {
        // Prevent double-clicks
        if (isSaving) return

        setIsSaving(true)
        try {
            // Update the ref BEFORE the API call to prevent race condition
            lastSavedRef.current = { content, title }
            setHasChanges(false)

            await onUpdate(note.id, { content, title })
        } catch (error) {
            // Restore hasChanges if save failed
            setHasChanges(true)
            console.error("Failed to save note:", error)
        } finally {
            setIsSaving(false)
        }
    }



    return (
        <div className="flex-1 flex flex-col">
            {/* Header */}
            <div className="border-b border-gray-200 p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="text-lg font-semibold border-none p-0 h-auto focus-visible:ring-0"
                        placeholder="Note title..."
                    />
                    <div className="flex items-center gap-2">
                        {hasChanges && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleSave}
                                disabled={isSaving}
                                className="h-8 bg-transparent"
                            >
                                <Save className="h-4 w-4 mr-2" />
                                {isSaving ? 'Saving...' : 'Save'}
                            </Button>
                        )}
                        <Button variant="outline" size="sm" onClick={() => setIsPreview(!isPreview)} className="h-8">
                            {isPreview ? (
                                <>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </>
                            ) : (
                                <>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Preview
                                </>
                            )}
                        </Button>
                    </div>
                </div>
                <div className="text-xs text-gray-500">
                    {formatUpdatedAt(note.updatedAt)}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden flex flex-col">
                {isPreview ? (
                    <div className="h-full overflow-hidden flex flex-col bg-white">
                        <Editor
                            initialContent={content}
                            readOnly={true}
                        />
                    </div>
                ) : (
                    <div className="h-full flex flex-col p-6 bg-white">
                        <Editor
                            initialContent={note.content}
                            onChange={(markdown) => {
                                setContent(markdown);
                                setHasChanges(true);
                            }}
                        />
                    </div>
                )}
            </div>
        </div>
    )
}
