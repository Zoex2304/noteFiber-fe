import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, MessageSquare } from "lucide-react";

import { ChatBubble } from "@/components/molecules/ChatBubble";
import { PixelLoader } from "@/components/molecules/PixelLoader";
import { ChatEmptyState } from "@/components/molecules/ChatEmptyState";
import { ChatInputArea } from "@/components/molecules/ChatInputArea";

import type { Message, ChatSession } from "@/types/ai-chat";

export interface ChatInterfaceProps {
    /** Active session ID */
    activeSessionId: string | null;
    /** List of sessions for session name lookup */
    sessions: ChatSession[];
    /** Messages in the active session */
    messages: Message[];
    /** Whether AI is currently generating */
    isLoading: boolean;
    /** Handler for sending messages */
    onSendMessage: (content: string) => void;
    /** Handler for citation clicks */
    onCitationClick?: (noteId: string) => void;
    /** Current input value (controlled) */
    inputValue: string;
    /** Input change handler (controlled) */
    onInputChange: (value: string) => void;
}

/**
 * Complete chat interface organism.
 * Composes: session header, message list, empty state, loading state, and input area.
 */
export function ChatInterface({
    activeSessionId,
    sessions,
    messages,
    isLoading,
    onSendMessage,
    onCitationClick,
    inputValue,
    onInputChange
}: ChatInterfaceProps) {
    const currentSession = sessions.find(s => s.id === activeSessionId);

    return (
        <div className="flex flex-col flex-1 h-full">
            {/* Content Container - strictly bounded */}
            <div className="flex-1 flex flex-col min-h-0 w-full overflow-hidden">
                {/* Session Header */}
                {activeSessionId && (
                    <div className="px-4 py-2 border-b border-gray-100 bg-white/50 flex items-center justify-between shrink-0">
                        <div className="text-xs font-medium text-gray-500 truncate max-w-[200px] flex items-center gap-1.5">
                            <MessageSquare className="h-3 w-3" />
                            {currentSession?.name || "New Chat"}
                        </div>
                    </div>
                )}

                {/* Message List */}
                <ScrollArea className="flex-1 p-4 w-full">
                    <div className="space-y-4 pb-2 w-full overflow-hidden">
                        {messages.map((message, index) => (
                            <ChatBubble
                                key={message.id}
                                message={message}
                                onCitationClick={onCitationClick}
                                compact
                                animate={index === messages.length - 1}
                            />
                        ))}

                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex gap-2 items-center text-gray-400 text-sm py-2">
                                <Bot className="h-4 w-4 animate-pulse text-purple-500" />
                                <PixelLoader />
                            </div>
                        )}

                        {/* Empty State */}
                        {messages.length === 0 && !isLoading && (
                            <ChatEmptyState />
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* Input Area */}
            <ChatInputArea
                value={inputValue}
                onChange={onInputChange}
                onSend={onSendMessage}
                disabled={isLoading}
            />
        </div>
    );
}
