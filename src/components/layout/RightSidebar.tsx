"use client";

import { useEffect, useState, useRef } from "react";
import { SidebarLayout } from "./SidebarLayout";
import { Button } from "@/components/shadui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { TokenUsagePill } from "@/components/common/TokenUsagePill";
import { ChatBubble } from "@/components/molecules/ChatBubble";
import { PixelLoader } from "@/components/molecules/PixelLoader";
import { TokenLimitDialog } from "@/components/common/TokenLimitDialog";
import { useChatSystem } from "@/hooks/useChatSystem";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shadui/Logo";
import { ActionTooltip } from "@/components/common/ActionTooltip";
import { Clock, Plus, Trash2, Send, Bot, MessageSquare, ArrowLeft, Search as SearchIcon, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import { motion } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { NewSessionConfirmationModal } from "@/components/molecules/NewSessionConfirmationModal";
import { PrefixHelper, CHAT_COMMANDS } from "@/components/molecules/PrefixHelper";

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
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Unified sidebar state
    const { isCollapsed, setIsCollapsed, toggle } = useSidebarState();
    const { refreshSubscription } = useSubscription();

    const [view, setView] = useState<'chat' | 'history'>('chat');

    // New Session Confirmation State
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [pendingMode, setPendingMode] = useState("");
    const [pendingMessage, setPendingMessage] = useState("");

    // Slash Command State
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [slashFilter, setSlashFilter] = useState("");
    const [activeCmdIndex, setActiveCmdIndex] = useState(0);
    // Active Modes (Pills)
    const [activeModes, setActiveModes] = useState<string[]>([]);

    const filteredCommands = CHAT_COMMANDS.filter(c =>
        c.cmd.toLowerCase().startsWith(slashFilter.toLowerCase()) ||
        c.desc.toLowerCase().includes(slashFilter.toLowerCase())
    );

    useEffect(() => {
        if (isOpen) {
            refreshSubscription();
            fetchSessions().then((s) => {
                if (s.length > 0 && !activeSessionId) {
                    selectSession(s[0].id);
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, fetchSessions, selectSession, refreshSubscription]);

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
        }
    }, [input]);

    /**
     * Parse input for slash commands (Suggestions menu)
     */
    useEffect(() => {
        // Only show if we are NOT in the middle of a word or if it starts with /
        // Simple logic: if last token starts with /, show menu
        const lastWord = input.split(/(\s+)/).pop() || "";
        if (lastWord.startsWith("/")) {
            setShowSlashMenu(true);
            setSlashFilter(lastWord);
            setActiveCmdIndex(0);
        } else {
            setShowSlashMenu(false);
        }
    }, [input]);

    const handlePrefixSelect = (prefix: string) => {
        // If the prefix is a mode command, add it as a pill
        if (prefix === "/bypass" || prefix === "/nuance") {
            if (!activeModes.includes(prefix.replace("/", ""))) {
                setActiveModes(prev => [...prev, prefix.replace("/", "")]);
            }
        } else {
            setInput((prev) => prefix + prev);
        }
    };

    const applyCommand = (cmd: string) => {
        // If it's a mode command, turn into pill
        const cleanCmd = cmd.replace("/", "");
        if (cleanCmd === "bypass" || cleanCmd === "nuance") {
            if (!activeModes.includes(cleanCmd)) {
                setActiveModes(prev => [...prev, cleanCmd]);
            }
            // Clear the typed command from input
            const parts = input.split(/(\s+)/);
            parts.pop(); // Remove the partial command
            setInput(parts.join(""));
        } else {
            // Regular replacement
            const parts = input.split(/(\s+)/);
            parts.pop();
            const newValue = parts.join("") + cmd + " ";
            setInput(newValue);
        }

        setShowSlashMenu(false);
        textareaRef.current?.focus();
    };

    const handleConfirmNewSession = async () => {
        setConfirmModalOpen(false);

        try {
            const newSessionId = await createSession();
            if (newSessionId) {
                // If we had active modes, we might want to respect them here too, 
                // but checking `pendingMode` is enough as it came from state.
                await sendMessage(pendingMessage, newSessionId);
            }
        } catch (e) {
            console.error("Failed to sequence new session", e);
        } finally {
            setPendingMessage("");
            setPendingMode("");
            setView('chat');
        }
    };

    const handleSend = async () => {
        if (!input.trim() && activeModes.length === 0) return;

        // Command Logic
        // Prefer activeModes pill, fallback to text check if user pasted it
        let mode = activeModes[0] || (input.startsWith("/bypass") ? "bypass" : (input.startsWith("/nuance") ? "nuance" : "rag"));

        const currentSession = sessions.find(s => s.id === activeSessionId);
        const sessionDirty = (currentSession?.messages || []).length > 0;

        if ((mode === "bypass" || mode === "nuance") && sessionDirty) {
            setPendingMessage(input);
            setPendingMode(mode);
            setConfirmModalOpen(true);
            setInput("");
            setActiveModes([]); // Clear pills on "send" attempt (even if confirming)
            return;
        }

        // Send message (sendMessage hook might need mode update? 
        // Currently sendMessage just takes content. The `mode` is usually inferred by backend or passed in request headers/body?
        // Wait, `sendMessage` in `useChatSystem` doesn't accept `mode` arg!
        // The previous implementation relied on the TEXT content starting with /bypass.
        // If I strip the pill, the backend won't see "/bypass".
        // FIX: I must prepend the mode to the content if it's a pill!
        let contentToSend = input;
        if (activeModes.length > 0) {
            contentToSend = `/${activeModes[0]} ${input}`;
        }

        await sendMessage(contentToSend);
        setInput("");
        setActiveModes([]); // Clear pills

        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        // 1. Slash Menu Navigation
        if (showSlashMenu && filteredCommands.length > 0) {
            if (e.key === "Tab" || e.key === "Enter") {
                e.preventDefault();
                applyCommand(filteredCommands[activeCmdIndex].cmd);
                return;
            }
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setActiveCmdIndex(prev => Math.max(0, prev - 1));
                return;
            }
            if (e.key === "ArrowDown") {
                e.preventDefault();
                setActiveCmdIndex(prev => Math.min(filteredCommands.length - 1, prev + 1));
                return;
            }
            if (e.key === "Escape") {
                e.preventDefault();
                setShowSlashMenu(false);
                return;
            }
        }

        // 2. Spacebar to confirm pill
        if (e.key === " " && !showSlashMenu) {
            const lastWord = input.split(/(\s+)/).pop() || "";
            if (lastWord === "/bypass" || lastWord === "/nuance") {
                e.preventDefault();
                applyCommand(lastWord);
                return;
            }
        }

        // 3. Backspace to remove pill
        if (e.key === "Backspace" && input === "" && activeModes.length > 0) {
            e.preventDefault();
            setActiveModes(prev => prev.slice(0, -1));
            return;
        }

        // 4. Send Message
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const removeMode = (mode: string) => {
        setActiveModes(prev => prev.filter(m => m !== mode));
    };

    if (!isOpen) return null;

    return (
        <SidebarLayout
            side="right"
            isCollapsed={isCollapsed}
            onToggle={toggle}
            width={380}
            className="border-l border-gray-200 h-full shadow-xl z-30 flex flex-col"
        >
            {/* Header */}
            <div className="h-12 px-4 border-b border-gray-200 flex items-center justify-between shrink-0 bg-white relative">
                <div className="flex items-center gap-2">
                    {!isCollapsed && (
                        <>
                            {view === 'history' ? (
                                <span className="font-semibold text-gray-700">Chat History</span>
                            ) : (
                                <>
                                    <Logo variant="symbol" className="h-6 w-6" />
                                    <span className="font-semibold text-gray-700 whitespace-nowrap">Ask AI</span>
                                </>
                            )}
                        </>
                    )}
                    {isCollapsed && <Logo variant="symbol" className="h-6 w-6 mx-auto" />}
                </div>

                {/* Centered Pill with key to force animate on re-render if needed? 
                    Actually, we rely on internal useEffect of TokenUsagePill.
                */}
                {!isCollapsed && view === 'chat' && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <TokenUsagePill type="chat" />
                    </div>
                )}

                {!isCollapsed && (
                    <div className="flex items-center gap-1">
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
                                    setView('chat');
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
                        <div className="absolute inset-0 z-20 bg-white animate-in fade-in slide-in-from-right-4 duration-300">
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
                                    {messages.map((message, index) => (
                                        <ChatBubble
                                            key={message.id}
                                            message={message}
                                            onCitationClick={onNavigateToNote}
                                            compact
                                            animate={index === messages.length - 1}
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
                                            <motion.div
                                                initial={{ scale: 0.5, opacity: 0 }}
                                                animate={{ scale: 1, opacity: 1 }}
                                                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                                                className="rounded-full overflow-hidden mb-4"
                                            >
                                                <div className="w-64 h-64">
                                                    <DotLottieReact
                                                        src="https://lottie.host/b00c932e-94d9-407f-9893-8e00ce7a55f3/hanmwXSGzz.lottie"
                                                        loop
                                                        autoplay
                                                    />
                                                </div>
                                            </motion.div>
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
                        <div className="p-4 border-t border-gray-200 bg-white shrink-0 relative">
                            {/* Slash Command Suggestions */}
                            {showSlashMenu && filteredCommands.length > 0 && (
                                <div className="absolute bottom-full left-4 mb-2 w-72 bg-white rounded-lg border border-gray-200 shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-2 z-50">
                                    <div className="p-1">
                                        <div className="px-2 py-1.5 text-xs font-medium text-gray-500 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
                                            <span>Commands</span>
                                            <span className="text-[10px] uppercase tracking-wider">Tab to select</span>
                                        </div>
                                        {filteredCommands.map((cmd, index) => (
                                            <button
                                                key={cmd.cmd}
                                                className={cn(
                                                    "w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors",
                                                    index === activeCmdIndex ? "bg-purple-50 text-royal-violet-base" : "hover:bg-gray-50 text-gray-700"
                                                )}
                                                onClick={() => applyCommand(cmd.cmd)}
                                            >
                                                <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">{cmd.cmd}</code>
                                                <span className="text-xs text-gray-500">{cmd.desc}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Input Container */}
                            <div className="flex flex-col gap-2 bg-white border border-gray-200 rounded-2xl p-2 shadow-sm focus-within:border-royal-violet-base focus-within:ring-1 focus-within:ring-royal-violet-base transition-all">

                                <div className="flex items-end gap-1 w-full">
                                    {/* Prefix Helper (only show if no modes?) - Actually it's just a button. Keep it. */}
                                    <div className="mb-1 ml-1 self-center">
                                        <PrefixHelper onSelect={handlePrefixSelect} />
                                    </div>

                                    <div className="flex-1 flex flex-wrap items-center gap-1.5 min-w-0">
                                        {/* Active Mode Pills */}
                                        {activeModes.map(mode => (
                                            <div key={mode} className="flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-md text-xs font-medium animate-in zoom-in-50 duration-200">
                                                <span>{mode}</span>
                                                <button
                                                    onClick={() => removeMode(mode)}
                                                    className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
                                                >
                                                    <X className="h-3 w-3" />
                                                </button>
                                            </div>
                                        ))}

                                        <Textarea
                                            ref={textareaRef}
                                            value={input}
                                            onChange={(e) => setInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder={activeModes.length > 0 ? "Type your prompt..." : "Ask anything..."}
                                            className="flex-1 min-w-[50px] min-h-[40px] max-h-[200px] resize-none border-none shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 py-2.5 px-2 bg-transparent text-sm placeholder:text-gray-400 overflow-y-auto"
                                            disabled={isLoading}
                                            rows={1}
                                        />
                                    </div>

                                    {/* Send Button */}
                                    <Button
                                        size="icon"
                                        onClick={handleSend}
                                        disabled={(!input.trim() && activeModes.length === 0) || isLoading}
                                        className={cn(
                                            "h-10 w-10 rounded-full transition-all shrink-0 mb-0.5",
                                            (input.trim() || activeModes.length > 0)
                                                ? "bg-gradient-primary-violet text-white hover:opacity-90 shadow-md"
                                                : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                                        )}
                                    >
                                        <Send className="h-5 w-5" />
                                    </Button>
                                </div>
                            </div>

                            <div className="text-[10px] text-gray-400 text-center mt-2 font-medium">
                                AI can make mistakes. Please verify important information.
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <NewSessionConfirmationModal
                open={confirmModalOpen}
                onOpenChange={setConfirmModalOpen}
                mode={pendingMode}
                onConfirm={handleConfirmNewSession}
                onCancel={() => {
                    setConfirmModalOpen(false);
                    setPendingMode("");
                    setPendingMessage("");
                }}
            />

            <TokenLimitDialog
                open={showTokenLimitDialog}
                onOpenChange={setShowTokenLimitDialog}
                dailyLimit={tokenUsage.chat.limit}
            />
        </SidebarLayout>
    );
}
