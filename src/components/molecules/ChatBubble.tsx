import ReactMarkdown from "react-markdown";
import { Bot, User } from "lucide-react";
import type { Message } from "@/types/ai-chat";
import { Citation } from "./Citation";

export interface ChatBubbleProps {
    /** The message to display */
    message: Message;
    /** Handler for citation clicks - navigates to the referenced note */
    onCitationClick?: (noteId: string) => void;
}

/**
 * ChatBubble - Single source of truth for chat message display
 * 
 * Supports both user and assistant roles with:
 * - Role-based styling (gradient backgrounds)
 * - Avatar icons
 * - Markdown rendering for assistant messages
 * - Optional citations for assistant messages
 * - Fixed width with overflow handling
 */
export function ChatBubble({ message, onCitationClick }: ChatBubbleProps) {
    const isUser = message.role === "user";
    const isAssistant = message.role === "assistant";
    const hasCitations = isAssistant && message.citations && message.citations.length > 0;

    return (
        <div
            className={`flex gap-3 ${isUser ? "justify-end" : "justify-start"}`}
        >
            <div
                className={`flex gap-3 max-w-[80%] min-w-0 ${isUser ? "flex-row-reverse" : "flex-row"
                    }`}
            >
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {isUser ? (
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-sm">
                            <User className="h-4 w-4 text-white" />
                        </div>
                    ) : (
                        <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center shadow-sm">
                            <Bot className="h-4 w-4 text-white" />
                        </div>
                    )}
                </div>

                {/* Message Content */}
                <div
                    className={`rounded-lg p-3 shadow-sm min-w-0 overflow-hidden ${isUser
                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white"
                            : "bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 border border-gray-200"
                        }`}
                >
                    {/* Message Text */}
                    {isAssistant ? (
                        <div className="prose prose-sm max-w-none break-words overflow-hidden 
                                        [&>*]:break-words [&_pre]:overflow-x-auto [&_pre]:max-w-full
                                        [&_code]:break-all [&_p]:break-words">
                            <ReactMarkdown>{message.content}</ReactMarkdown>
                        </div>
                    ) : (
                        <div className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                        </div>
                    )}

                    {/* Citations - Only for assistant messages */}
                    {hasCitations && onCitationClick && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-500 mb-2">References:</p>
                            <div className="flex flex-wrap gap-2">
                                {message.citations!.map((citation, index) => (
                                    <Citation
                                        key={citation.noteId}
                                        noteId={citation.noteId}
                                        title={citation.title}
                                        index={index + 1}
                                        onClick={onCitationClick}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Timestamp */}
                    <div
                        className={`text-xs mt-2 ${isUser ? "opacity-70" : "opacity-60"
                            }`}
                    >
                        {message.timestamp.toLocaleTimeString()}
                    </div>
                </div>
            </div>
        </div>
    );
}
