import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { MessageSquare, Trash2, Search as SearchIcon } from "lucide-react";
import type { ChatSession } from "@/types/ai-chat";

export interface SessionHistoryListProps {
    sessions: ChatSession[];
    activeSessionId: string | null;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}

/**
 * Displays a searchable list of chat sessions with selection and delete actions.
 * Used in the chat sidebar's history view.
 */
export function SessionHistoryList({
    sessions,
    activeSessionId,
    onSelect,
    onDelete
}: SessionHistoryListProps) {
    const [search, setSearch] = useState("");

    const filteredSessions = sessions
        .filter(s => s.name?.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Search Input */}
            <div className="p-3 border-b border-gray-100">
                <div className="relative">
                    <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Search history..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 h-9 bg-gray-50/50 border-gray-200 focus-visible:ring-royal-violet-base"
                    />
                </div>
            </div>

            {/* Session List */}
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-1">
                    {filteredSessions.length === 0 ? (
                        <div className="text-center text-gray-400 text-sm py-8">
                            No sessions found
                        </div>
                    ) : (
                        filteredSessions.map((session) => (
                            <div
                                key={session.id}
                                className={cn(
                                    "group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border border-transparent relative",
                                    session.id === activeSessionId
                                        ? "bg-purple-50 border-purple-100"
                                        : "hover:bg-gray-50 hover:border-gray-200"
                                )}
                                onClick={() => onSelect(session.id)}
                            >
                                {/* Session Icon */}
                                <div className={cn(
                                    "mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                                    session.id === activeSessionId
                                        ? "bg-purple-100 text-purple-600"
                                        : "bg-gray-100 text-gray-500"
                                )}>
                                    <MessageSquare className="h-4 w-4" />
                                </div>

                                {/* Session Info */}
                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <div className="font-medium text-sm text-gray-900 truncate pr-6">
                                        {session.name || "Untitled Session"}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formatDistanceToNow(session.updatedAt, { addSuffix: true })}
                                    </div>
                                </div>

                                {/* Delete Button */}
                                <button
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-all absolute right-2 top-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDelete(session.id);
                                    }}
                                    title="Delete session"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            </ScrollArea>
        </div>
    );
}
