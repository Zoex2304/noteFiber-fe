import { User, Bot, Copy, Check } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import type { Message } from "@/types/ai-chat";
import { cn } from "@/lib/utils";
import { Citation } from "./Citation";
import { ChatModeBadge } from "./ChatModeBadge";
import { useTypewriter } from "@/hooks/useTypewriter";
import { useState } from "react";
import { Button } from "@/components/shadui/button";

export interface ChatBubbleProps {
    /** The message to display */
    message: Message;
    /** Handler for citation clicks - navigates to the referenced note */
    onCitationClick?: (noteId: string) => void;
    /** Whether to render in a compact mode (e.g. for sidebar) */
    compact?: boolean;
    /** Whether to animate the text entry (typewriter effect) */
    animate?: boolean;
}

export function ChatBubble({ message, onCitationClick, compact, animate = false }: ChatBubbleProps) {
    const isUser = message.role === "user";
    const isAssistant = message.role === "assistant";
    const hasCitations = isAssistant && message.citations && message.citations.length > 0;
    const [copied, setCopied] = useState(false);

    // Only animate if requested AND it's the assistant
    const shouldAnimate = animate && isAssistant;
    const { displayedText } = useTypewriter(message.content, 10, shouldAnimate);

    const handleCopy = () => {
        navigator.clipboard.writeText(message.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div
            className={cn("flex gap-3", isUser ? "justify-end" : "justify-start", compact && "gap-2")}
        >
            <div
                className={cn(
                    "flex gap-3 max-w-[85%] min-w-0 group",
                    isUser ? "flex-row-reverse" : "flex-row",
                    compact && "gap-2"
                )}
            >
                {/* Avatar */}
                <div className="flex-shrink-0 mt-0.5">
                    {isUser ? (
                        <div className="w-7 h-7 bg-gradient-primary-violet rounded-full flex items-center justify-center shadow-sm ring-2 ring-white">
                            <User className="h-3.5 w-3.5 text-white" />
                        </div>
                    ) : (
                        <div className="w-7 h-7 bg-white border border-purple-100 rounded-full flex items-center justify-center shadow-sm">
                            <Bot className="h-4 w-4 text-purple-600" />
                        </div>
                    )}
                </div>

                {/* Message Content */}
                <div
                    className={cn(
                        "rounded-2xl px-4 py-3 shadow-sm min-w-0 overflow-hidden relative text-[13.5px] leading-relaxed",
                        isUser
                            ? "bg-gradient-primary-violet text-white rounded-tr-none"
                            : "bg-white border border-gray-100 text-gray-800 shadow-sm rounded-tl-none"
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
                        <div className="markdown-content break-words min-w-0">
                            <ReactMarkdown
                                components={{
                                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                                    li: ({ children }) => <li className="pl-1">{children}</li>,
                                    h1: ({ children }) => <h1 className="text-base font-bold mb-2 mt-4 first:mt-0">{children}</h1>,
                                    h2: ({ children }) => <h2 className="text-sm font-bold mb-2 mt-3 first:mt-0">{children}</h2>,
                                    h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 mt-2 first:mt-0">{children}</h3>,
                                    code: ({ node, className, children, ...props }) => {
                                        const match = /language-(\w+)/.exec(className || '');
                                        const isInline = !match && !String(children).includes('\n');
                                        return isInline ? (
                                            <code className="bg-gray-100 text-purple-700 px-1 py-0.5 rounded text-xs font-mono border border-gray-200" {...props}>
                                                {children}
                                            </code>
                                        ) : (
                                            <div className="relative my-2 rounded-md overflow-hidden bg-gray-50 border border-gray-200">
                                                <div className="px-3 py-1.5 bg-gray-100 border-b border-gray-200 text-xs text-gray-500 font-mono flex justify-between items-center">
                                                    <span>{match?.[1] || 'text'}</span>
                                                </div>
                                                <div className="p-3 overflow-x-auto">
                                                    <code className={cn("text-xs font-mono text-gray-800", className)} {...props}>
                                                        {children}
                                                    </code>
                                                </div>
                                            </div>
                                        );
                                    },
                                    blockquote: ({ children }) => (
                                        <blockquote className="border-l-2 border-purple-200 pl-3 italic text-gray-500 my-2">
                                            {children}
                                        </blockquote>
                                    ),
                                }}
                            >
                                {displayedText}
                            </ReactMarkdown>
                        </div>
                    ) : (
                        <div className="whitespace-pre-wrap break-words">
                            {message.content}
                        </div>
                    )}

                    {/* Copy Button (Hover) */}
                    {isAssistant && !compact && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 bg-white/50 hover:bg-white shadow-sm border border-gray-100"
                                onClick={handleCopy}
                            >
                                {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-gray-400" />}
                            </Button>
                        </div>
                    )}

                    {/* Citations - Only for assistant messages */}
                    {hasCitations && onCitationClick && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-400 mb-2">Sources</p>
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
                            "text-[10px] mt-1.5 flex justify-end",
                            isUser ? "text-purple-100" : "text-gray-400"
                        )}
                    >
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>
            </div>
        </div>
    );
}
