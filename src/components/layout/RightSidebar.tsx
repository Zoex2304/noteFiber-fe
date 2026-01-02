"use client";

import { useEffect, useState } from "react";
import { SidebarLayout } from "./SidebarLayout";
import { Button } from "@/components/shadui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { TokenUsagePill } from "@/components/common/TokenUsagePill";
import { ChatBubble } from "@/components/molecules/ChatBubble";
import { PixelLoader } from "@/components/molecules/PixelLoader";
import { TokenLimitDialog } from "@/components/common/TokenLimitDialog";
import { useChatSystem } from "@/hooks/useChatSystem";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shadui/Logo";
import { ActionTooltip } from "@/components/common/ActionTooltip";
import { Clock, Plus, Trash2, Send, Bot, MessageSquare, ArrowLeft, Search as SearchIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";

import type { ChatSession } from "@/types/ai-chat";
import { useSidebarState } from "@/hooks/useSidebarState";

// Internal Component: Session History List
interface SessionHistoryListProps {
    sessions: ChatSession[];
    activeSessionId: string | null;
    onSelect: (id: string) => void;
    onDelete: (id: string) => void;
}

function SessionHistoryList({ sessions, activeSessionId, onSelect, onDelete }: SessionHistoryListProps) {
    const [search, setSearch] = useState("");

    const filteredSessions = sessions.filter(s =>
        s.name?.toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

    return (
        <div className="flex flex-col h-full bg-white">
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
                                    "group flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors border border-transparent",
                                    session.id === activeSessionId
                                        ? "bg-purple-50 border-purple-100"
                                        : "hover:bg-gray-50 hover:border-gray-200"
                                )}
                                onClick={() => onSelect(session.id)}
                            >
                                <div className={cn(
                                    "mt-0.5 shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
                                    session.id === activeSessionId ? "bg-purple-100 text-purple-600" : "bg-gray-100 text-gray-500"
                                )}>
                                    <MessageSquare className="h-4 w-4" />
                                </div>

                                <div className="flex-1 min-w-0 overflow-hidden">
                                    <div className="font-medium text-sm text-gray-900 truncate pr-6">
                                        {session.name || "Untitled Session"}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formatDistanceToNow(session.updatedAt, { addSuffix: true })}
                                    </div>
                                </div>

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

export interface RightSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    onNavigateToNote: (noteId: string) => void;
}

export function RightSidebar({ isOpen, onToggle: _onToggle, onNavigateToNote }: RightSidebarProps) {
    const {
        sessions,
        activeSessionId,
        messages,
        isLoading,
        showTokenLimitDialog,
        setShowTokenLimitDialog,
        tokenUsage,
        fetchSessions,
        selectSession,
        createSession,
        deleteSession,
        sendMessage,
    } = useChatSystem();

    const [input, setInput] = useState("");

    // Unified sidebar state
    const { isCollapsed, setIsCollapsed, toggle } = useSidebarState();

    const [view, setView] = useState<'chat' | 'history'>('chat');

    useEffect(() => {
        if (isOpen) {
            fetchSessions().then((s) => {
                if (s.length > 0 && !activeSessionId) {
                    selectSession(s[0].id);
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, fetchSessions, selectSession]); // Removed activeSessionId to prevent loop

    const handleSend = () => {
        if (!input.trim()) return;
        sendMessage(input);
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    if (!isOpen) return null;

    return (
        <SidebarLayout
            side="right"
            isCollapsed={isCollapsed}
            onToggle={toggle}
            width={380} // Slightly wider for better history view
            className="border-l border-gray-200 h-full shadow-xl z-30"
        >
            {/* Header */}
            <div className="h-12 px-4 border-b border-gray-200 flex items-center justify-between shrink-0 bg-white">
                <div className="flex items-center gap-2 overflow-hidden">
                    {!isCollapsed && (
                        <>
                            {view === 'history' ? (
                                <span className="font-semibold text-gray-700">Chat History</span>
                            ) : (
                                <>
                                    <Logo variant="symbol" className="h-6 w-6" />
                                    <span className="font-semibold text-gray-700 whitespace-nowrap">Ask AI</span>
                                    <TokenUsagePill type="chat" compact />
                                </>
                            )}
                        </>
                    )}
                    {isCollapsed && <Logo variant="symbol" className="h-6 w-6 mx-auto" />}
                </div>

                {!isCollapsed && (
                    <div className="flex items-center gap-1">
                        {/* Toggle History View */}
                        <ActionTooltip label={view === 'history' ? "Back to Chat" : "History"}>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setView(view === 'chat' ? 'history' : 'chat')}
                                className={cn("h-8 w-8", view === 'history' && "text-purple-600 bg-purple-50")}
                            >
                                {view === 'history' ? <ArrowLeft className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
                            </Button>
                        </ActionTooltip>

                        <ActionTooltip label="New Chat">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                    createSession();
                                    setView('chat'); // Switch back to chat on new session
                                }}
                                className="h-8 w-8"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </ActionTooltip>
                    </div>
                )}
            </div>

            {/* Content Area */}
            {isCollapsed ? (
                <div className="flex flex-col items-center py-4 gap-2">
                    <ActionTooltip label="New Chat" side="left">
                        <Button variant="ghost" size="icon" onClick={() => {
                            setIsCollapsed(false);
                            createSession();
                            setView('chat');
                        }}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </ActionTooltip>

                    {/* Collapse Mode History Toggle */}
                    <ActionTooltip label="History" side="left">
                        <Button variant="ghost" size="icon" onClick={() => {
                            setIsCollapsed(false);
                            setView('history');
                        }}>
                            <Clock className="h-4 w-4 text-gray-500" />
                        </Button>
                    </ActionTooltip>
                </div>
            ) : (
                <div className="flex flex-col flex-1 min-h-0 bg-gray-50/50 relative overflow-hidden">

                    {/* View: History */}
                    {view === 'history' && (
                        <div className="absolute inset-0 z-20 animate-in fade-in slide-in-from-right-4 duration-300">
                            <SessionHistoryList
                                sessions={sessions}
                                activeSessionId={activeSessionId}
                                onSelect={(id) => {
                                    selectSession(id);
                                    setView('chat');
                                }}
                                onDelete={deleteSession}
                            />
                        </div>
                    )}

                    {/* View: Chat Interface */}
                    <div className={cn(
                        "flex flex-col flex-1 h-full transition-opacity duration-300",
                        view === 'history' ? "opacity-0 pointer-events-none" : "opacity-100"
                    )}>
                        <div className="flex-1 overflow-hidden relative flex flex-col">
                            {/* Session Title Bar */}
                            {/* Only show if we have an active session and it has a name */}
                            {activeSessionId && (
                                <div className="px-4 py-2 border-b border-gray-100 bg-white/50 flex items-center justify-between shrink-0">
                                    <div className="text-xs font-medium text-gray-500 truncate max-w-[200px] flex items-center gap-1.5">
                                        <MessageSquare className="h-3 w-3" />
                                        {sessions.find(s => s.id === activeSessionId)?.name || "New Chat"}
                                    </div>
                                </div>
                            )}

                            <ScrollArea className="flex-1 p-4">
                                <div className="space-y-4 pb-2">
                                    {messages.map((message) => (
                                        <ChatBubble
                                            key={message.id}
                                            message={message}
                                            onCitationClick={onNavigateToNote}
                                            compact
                                        />
                                    ))}
                                    {isLoading && (
                                        <div className="flex gap-2 items-center text-gray-400 text-sm py-2">
                                            <Bot className="h-4 w-4 animate-pulse text-purple-500" />
                                            <PixelLoader />
                                        </div>
                                    )}
                                    {messages.length === 0 && !isLoading && (
                                        <div className="flex flex-col items-center justify-center h-[50vh] text-center text-gray-400 p-8 space-y-4">
                                            <div className="rounded-full bg-white p-4 shadow-sm">
                                                <Bot className="h-10 w-10 text-purple-200" />
                                            </div>
                                            <div>
                                                <h3 className="text-gray-900 font-medium mb-1">How can I help you?</h3>
                                                <p className="text-sm max-w-[200px] mx-auto">Ask questions about your notes or generate new ideas.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </div>
                        {/* Input Area */}
                        <div className="p-4 border-t border-gray-200 bg-white shrink-0">
                            {/* Container Utama: Border dan Shadow ada di sini */}
                            <div className="flex items-end gap-2 bg-white border border-gray-200 rounded-2xl p-2 shadow-sm focus-within:border-royal-violet-base focus-within:ring-1 focus-within:ring-royal-violet-base transition-all">


                                {/* Textarea */}
                                <Textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="Ask anything..."
                                    className="flex-1 min-h-[44px] max-h-[140px] resize-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 py-3 px-3 bg-transparent text-sm placeholder:text-gray-400"
                                    disabled={isLoading}
                                    rows={1}
                                />

                                {/* Tombol Send */}
                                <Button
                                    size="icon"
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className={cn(
                                        "h-10 w-10 rounded-full transition-all shrink-0 mb-0.5",
                                        input.trim()
                                            ? "bg-gradient-primary-violet text-white hover:opacity-90 shadow-md"
                                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                    )}
                                >
                                    <Send className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="text-[10px] text-gray-400 text-center mt-2 font-medium">
                                AI can make mistakes. Please verify important information.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <TokenLimitDialog
                open={showTokenLimitDialog}
                onOpenChange={setShowTokenLimitDialog}
                dailyLimit={tokenUsage.chat.limit}
            />
        </SidebarLayout>
    );
}
