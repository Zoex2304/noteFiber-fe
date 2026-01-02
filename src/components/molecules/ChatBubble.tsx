import { User, Bot } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import type { Message } from "@/types/ai-chat";
import { cn } from "@/lib/utils";
import { Citation } from "./Citation";

export interface ChatBubbleProps {
    /** The message to display */
    message: Message;
    /** Handler for citation clicks - navigates to the referenced note */
    onCitationClick?: (noteId: string) => void;
    /** Whether to render in a compact mode (e.g. for sidebar) */
    compact?: boolean;
}

import { ChatModeBadge } from "./ChatModeBadge";

// ... (props interface unchanged) ...

export function ChatBubble({ message, onCitationClick, compact }: ChatBubbleProps) {
    const isUser = message.role === "user";
    const isAssistant = message.role === "assistant";
    const hasCitations = isAssistant && message.citations && message.citations.length > 0;

    return (
        <div
            className={cn("flex gap-3", isUser ? "justify-end" : "justify-start", compact && "gap-2")}
        >
            <div
                className={cn(
                    "flex gap-3 max-w-[80%] min-w-0",
                    isUser ? "flex-row-reverse" : "flex-row",
                    compact && "gap-2"
                )}
            >
                {/* Avatar */}
                <div className="flex-shrink-0">
                    {isUser ? (
                        <div className="w-8 h-8 bg-gradient-primary-violet rounded-full flex items-center justify-center shadow-sm">
                            <User className="h-4 w-4 text-white" />
                        </div>
                    ) : (
                        <div className="w-8 h-8 bg-gradient-primary-violet rounded-full flex items-center justify-center shadow-sm">
                            <Bot className="h-4 w-4 text-white" />
                        </div>
                    )}
                </div>

                {/* Message Content */}
                <div
                    className={cn(
                        "rounded-lg p-3 shadow-sm min-w-0 overflow-hidden relative",
                        isUser
                            ? "bg-gradient-primary-violet text-white"
                            : "bg-white border border-gray-200 text-gray-900 shadow-sm"
                    )}
                >
                    {/* Mode Badge - Only for assistant */}
                    {isAssistant && (message.mode === "bypass" || message.mode === "nuance") && (
                        <div className="mb-2">
                            <ChatModeBadge mode={message.mode} nuanceKey={message.nuanceKey} />
                        </div>
                    )}

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
                        className={cn(
                            "text-xs mt-2",
                            isUser ? "opacity-70" : "opacity-60"
                        )}
                    >
                        {message.timestamp.toLocaleTimeString()}
                    </div>
                </div>
            </div>
        </div>
    );
}
