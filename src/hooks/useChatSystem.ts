import { useState, useCallback, useEffect, useRef } from "react";
import { apiClient } from "@/api/client/axios.client";
import type { BaseResponse } from "@/dto/base-response";
import type { ChatSession, Message } from "@/types/ai-chat";
import type {
    SendChatResponse,
    CreateSessionResponse,
    DeleteSessionRequest,
    GetAllSessionsResponse,
    GetChatHistoryResponse,
    SendChatRequest,
} from "@/dto/chatbot";
import { useUsageLimits, handleLimitExceededError } from "@/contexts/UsageLimitsContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

export function useChatSystem() {
    // const navigate = useNavigate(); // Unused

    // State
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showTokenLimitDialog, setShowTokenLimitDialog] = useState(false);

    // Contexts (Bridged to Zustand Store)
    const { tokenUsage, refreshSubscription, checkLimit } = useSubscription();
    const { showPricingModal } = useUsageLimits();

    const activeSession = sessions.find((s) => s.id === activeSessionId) || null;
    const messages = activeSession?.messages || [];

    // -- Actions --

    const fetchSessions = useCallback(async () => {
        try {
            const res = await apiClient.get<BaseResponse<GetAllSessionsResponse[]>>(`/chatbot/v1/sessions`);
            const apiData = res.data.data ?? [];

            const newSessions = apiData.map((d) => ({
                id: d.id,
                messages: [], // History fetches lazily
                name: d.title,
                createdAt: new Date(d.created_at),
                updatedAt: new Date(d.updated_at ?? d.created_at),
            }));

            setSessions(newSessions);
            return newSessions;
        } catch (error) {
            console.error("Failed to fetch sessions", error);
            return [];
        }
    }, []);

    const fetchSessionHistory = useCallback(async (sessionId: string) => {
        try {
            const res = await apiClient.get<BaseResponse<GetChatHistoryResponse[]>>(
                `/chatbot/v1/chat-history?chat_session_id=${sessionId}`
            );

            setSessions((prev) =>
                prev.map((session) => {
                    if (session.id === sessionId) {
                        return {
                            ...session,
                            messages: res.data.data.map<Message>((data) => ({
                                id: data.id,
                                content: data.chat,
                                role: data.role === "model" ? "assistant" : "user",
                                timestamp: new Date(data.created_at),
                                citations: data.citations?.map((c) => ({
                                    noteId: c.note_id,
                                    title: c.title,
                                })),
                                mode: data.mode,
                                nuanceKey: data.nuance_key,
                            })),
                        };
                    }
                    return session;
                })
            );
        } catch (error) {
            console.error("Failed to fetch history", error);
        }
    }, []);

    // Ref for sessions to allow stable callbacks
    const sessionsRef = useRef(sessions);
    useEffect(() => {
        sessionsRef.current = sessions;
    }, [sessions]);

    const selectSession = useCallback((sessionId: string) => {
        setActiveSessionId(sessionId);
        // If we don't have messages for this session, fetch them
        const session = sessionsRef.current.find((s) => s.id === sessionId);
        if (session && session.messages.length === 0) {
            fetchSessionHistory(sessionId);
        }
    }, [fetchSessionHistory]);

    const createSession = useCallback(async () => {
        try {
            const res = await apiClient.post<BaseResponse<CreateSessionResponse>>(`/chatbot/v1/create-session`);
            const newSession: ChatSession = {
                id: res.data.data.id,
                name: "New Chat",
                messages: [],
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setSessions((prev) => [newSession, ...prev]);
            setActiveSessionId(newSession.id);
            return newSession.id;
        } catch (error) {
            console.error("Failed to create session", error);
            return null;
        }
    }, []);

    const deleteSession = useCallback(async (sessionId: string) => {
        try {
            const request: DeleteSessionRequest = { chat_session_id: sessionId };
            await apiClient.delete(`/chatbot/v1/delete-session`, {
                data: request,
            });

            setSessions((prev) => prev.filter((s) => s.id !== sessionId));
            if (activeSessionId === sessionId) {
                setActiveSessionId(null);
            }
        } catch (error) {
            console.error("Failed to delete session", error);
        }
    }, [activeSessionId]);

    const sendMessage = useCallback(async (content: string, sessionId?: string) => {
        if (!content.trim() || isLoading) return;

        // 1. Strict Limit Check (Pre-flight)
        // Check local state immediately.
        const canSend = checkLimit('chat');
        if (!canSend) {
            setShowTokenLimitDialog(true);
            return;
        }

        let currentSessionId = sessionId || activeSessionId;

        // Auto-create session if none exists
        if (!currentSessionId) {
            setIsLoading(true);
            const newId = await createSession();
            if (!newId) {
                setIsLoading(false);
                return;
            }
            currentSessionId = newId;
        }

        setIsLoading(true);

        // Optimistic Update
        setSessions((prev) => prev.map(s => {
            if (s.id === currentSessionId) {
                return {
                    ...s,
                    messages: [...s.messages, {
                        id: "temp-" + Date.now(),
                        content,
                        role: "user",
                        timestamp: new Date()
                    }]
                };
            }
            return s;
        }));

        try {
            const request: SendChatRequest = {
                chat: content,
                chat_session_id: currentSessionId,
            };

            const res = await apiClient.post<BaseResponse<SendChatResponse>>(`/chatbot/v1/send-chat`, request);

            // Update with real response
            setSessions((prev) => prev.map(s => {
                if (s.id === currentSessionId) {
                    const realUserMsg = {
                        id: res.data.data.sent.id,
                        content: res.data.data.sent.chat,
                        role: "user" as const,
                        timestamp: new Date(res.data.data.sent.created_at)
                    };
                    const replyMsg = {
                        id: res.data.data.reply.id,
                        content: res.data.data.reply.chat,
                        role: "assistant" as const,
                        timestamp: new Date(res.data.data.reply.created_at),
                        citations: res.data.data.reply.citations?.map((c) => ({
                            noteId: c.note_id,
                            title: c.title,
                        })),
                        mode: res.data.data.mode,
                        nuanceKey: res.data.data.nuance_key,
                    };

                    const cleanMessages = s.messages.filter(m => !m.id.startsWith("temp-"));

                    return {
                        ...s,
                        name: res.data.data.title,
                        messages: [...cleanMessages, realUserMsg, replyMsg]
                    };
                }
                return s;
            }));
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            if (!handleLimitExceededError(err, showPricingModal)) {
                if (err.response?.status === 500 &&
                    err.response?.data?.message?.includes("daily AI usage limit exceeded")) {
                    setShowTokenLimitDialog(true);
                }
            }
            // Revert optimistic
            setSessions((prev) => prev.map(s => {
                if (s.id === currentSessionId) {
                    return { ...s, messages: s.messages.filter(m => !m.id.startsWith("temp-")) };
                }
                return s;
            }));
        } finally {
            // ALWAYS refresh subscription usage after a message attempt (success or fail)
            // This ensures the pills update immediately.
            await refreshSubscription();
            setIsLoading(false);
        }
    }, [activeSessionId, isLoading, createSession, refreshSubscription, showPricingModal, checkLimit]);


    // Initialization Effect
    useEffect(() => {
        // We might want to separate initialization from hook creation, 
        // to avoid fetching when the sidebar is closed.
        // The component can call fetchSessions() on mount.
    }, []);

    return {
        sessions,
        activeSession,
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
    };
}
