"use client";

import { useEffect, useState, useMemo } from "react";
import { Clock, Plus, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Layout
import { SidebarLayout } from "./SidebarLayout";

// Components
import { Button } from "@/components/shadui/button";
import { Logo } from "@/components/shadui/Logo";
import { ActionTooltip } from "@/components/common/ActionTooltip";
import { TokenUsagePill } from "@/components/common/TokenUsagePill";
import { TokenLimitDialog } from "@/components/common/TokenLimitDialog";
import { NewSessionConfirmationModal } from "@/components/molecules/NewSessionConfirmationModal";
import { SessionHistoryList } from "@/components/molecules/SessionHistoryList";
import { ChatInterface } from "@/components/organisms/ChatInterface";

// Hooks
import { useChatSystem } from "@/hooks/useChatSystem";
import { useSidebarState } from "@/hooks/useSidebarState";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useNewSessionConfirmation } from "@/hooks/chat";

// -----------------------------------------------------------------------------
// Types
// -----------------------------------------------------------------------------

export interface RightSidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    onNavigateToNote: (noteId: string) => void;
}

type SidebarView = 'chat' | 'history';

// -----------------------------------------------------------------------------
// Component
// -----------------------------------------------------------------------------

/**
 * RightSidebar - Chat sidebar orchestrator.
 * 
 * This component is a pure orchestrator that:
 * - Manages view state (chat vs history)
 * - Wires up child components with appropriate data
 * - Handles sidebar-level interactions (collapse, view switching)
 * 
 * All business logic lives in hooks. All UI compositions live in organisms/molecules.
 */
export function RightSidebar({
    isOpen,
    onToggle: _onToggle,
    onNavigateToNote
}: RightSidebarProps) {
    // -------------------------------------------------------------------------
    // Hooks
    // -------------------------------------------------------------------------

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

    const { isCollapsed, setIsCollapsed, toggle } = useSidebarState();
    const { refreshSubscription } = useSubscription();
    const newSessionConfirmation = useNewSessionConfirmation();

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------

    const [view, setView] = useState<SidebarView>('chat');
    const [input, setInput] = useState("");

    // -------------------------------------------------------------------------
    // Effects
    // -------------------------------------------------------------------------

    // Fetch sessions when sidebar opens
    useEffect(() => {
        if (isOpen) {
            refreshSubscription();
            fetchSessions().then((s) => {
                if (s.length > 0 && !activeSessionId) {
                    selectSession(s[0].id);
                }
            });
        }
    }, [isOpen, fetchSessions, selectSession, refreshSubscription, activeSessionId]);

    // -------------------------------------------------------------------------
    // Derived State
    // -------------------------------------------------------------------------

    const hasWideContent = useMemo(() =>
        messages.some(m => m.role === 'assistant' && (m.content.includes('```') || m.content.includes('| -')))
        , [messages]);

    // -------------------------------------------------------------------------
    // Handlers
    // -------------------------------------------------------------------------

    const handleSendMessage = async (content: string) => {
        // Check if mode switch requires new session
        const currentSession = sessions.find(s => s.id === activeSessionId);
        const sessionDirty = (currentSession?.messages || []).length > 0;
        const mode = content.startsWith("/bypass") ? "bypass" :
            content.startsWith("/nuance") ? "nuance" : "rag";

        if ((mode === "bypass" || mode === "nuance") && sessionDirty) {
            newSessionConfirmation.requestConfirmation(content, mode);
            setInput("");
            return;
        }

        await sendMessage(content);
    };

    const handleConfirmNewSession = async () => {
        const { message } = newSessionConfirmation.confirm();

        try {
            const newSessionId = await createSession();
            if (newSessionId) {
                await sendMessage(message, newSessionId);
            }
        } catch (e) {
            console.error("Failed to sequence new session", e);
        }

        setView('chat');
    };

    const handleSessionSelect = (id: string) => {
        selectSession(id);
        setView('chat');
    };

    const handleNewChat = () => {
        createSession();
        setView('chat');
    };

    // -------------------------------------------------------------------------
    // Render
    // -------------------------------------------------------------------------

    if (!isOpen) return null;

    return (
        <SidebarLayout
            side="right"
            isCollapsed={isCollapsed}
            onToggle={toggle}
            width={hasWideContent ? 600 : 380}
            className="border-l border-gray-200 h-full shadow-xl z-30 flex flex-col"
        >
            {/* Header */}
            <div className="h-12 px-4 border-b border-gray-200 flex items-center justify-between shrink-0 bg-white relative">
                <div className="flex items-center gap-2">
                    {!isCollapsed && (
                        <>
                            {view === 'history' ? (
                                <div className="flex items-center gap-2.5">
                                    <motion.div
                                        initial={{ y: 10, opacity: 0, scale: 0.8 }}
                                        animate={{ y: 0, opacity: 1, scale: [1, 1.05, 1] }}
                                        transition={{
                                            y: { type: "spring", stiffness: 300, damping: 20 },
                                            scale: { duration: 0.4, delay: 0.1 }
                                        }}
                                        className="w-8 h-8 rounded-xl bg-gradient-primary-violet grid place-items-center shadow-md"
                                    >
                                        <Clock className="h-4 w-4 text-white" strokeWidth={2.5} />
                                    </motion.div>
                                    <span className="font-semibold text-gray-700">Chat History</span>
                                </div>
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

                {/* Token Usage Pill (centered) */}
                {!isCollapsed && view === 'chat' && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <TokenUsagePill type="chat" />
                    </div>
                )}

                {/* Header Actions */}
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
                                onClick={handleNewChat}
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
                            handleNewChat();
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
                    {/* History View */}
                    {view === 'history' && (
                        <div className="absolute inset-0 z-20 bg-white animate-in fade-in slide-in-from-right-4 duration-300">
                            <SessionHistoryList
                                sessions={sessions}
                                activeSessionId={activeSessionId}
                                onSelect={handleSessionSelect}
                                onDelete={deleteSession}
                            />
                        </div>
                    )}

                    {/* Chat View */}
                    <div className={cn(
                        "flex flex-col flex-1 h-full transition-opacity duration-300",
                        view === 'history' ? "opacity-0 pointer-events-none" : "opacity-100"
                    )}>
                        <ChatInterface
                            activeSessionId={activeSessionId}
                            sessions={sessions}
                            messages={messages}
                            isLoading={isLoading}
                            onSendMessage={handleSendMessage}
                            onCitationClick={onNavigateToNote}
                            inputValue={input}
                            onInputChange={setInput}
                        />
                    </div>
                </div>
            )}

            {/* Modals */}
            <NewSessionConfirmationModal
                open={newSessionConfirmation.isOpen}
                onOpenChange={(open) => !open && newSessionConfirmation.cancel()}
                mode={newSessionConfirmation.pendingMode}
                onConfirm={handleConfirmNewSession}
                onCancel={newSessionConfirmation.cancel}
            />

            <TokenLimitDialog
                open={showTokenLimitDialog}
                onOpenChange={setShowTokenLimitDialog}
                dailyLimit={tokenUsage.chat.limit}
            />
        </SidebarLayout>
    );
}
