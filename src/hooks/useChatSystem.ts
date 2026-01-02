import { useState, useCallback, useEffect } from "react";
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

    // Contexts
    const { tokenUsage, refreshSubscription } = useSubscription();
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
                        // Merge or replace? Replace is safer for now.
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

    const selectSession = useCallback(async (sessionId: string) => {
        setActiveSessionId(sessionId);
        // Only fetch if empty? Or always refresh? Always refresh for now to be safe.
        // Optimization: Check if messages exist?
        await fetchSessionHistory(sessionId);
    }, [fetchSessionHistory]);

    const createSession = useCallback(async () => {
        try {
            const res = await apiClient.post<BaseResponse<CreateSessionResponse>>(`/chatbot/v1/create-session`);
            await fetchSessions();
            await selectSession(res.data.data.id);
            return res.data.data.id;
        } catch (error) {
            console.error("Failed to create session", error);
        }
    }, [fetchSessions, selectSession]);

    const deleteSession = useCallback(async (sessionId: string) => {
        // Prevent deleting last session logic if handled by UI, but here we just execute.
        try {
            const data: DeleteSessionRequest = { chat_session_id: sessionId };
            await apiClient.delete(`/chatbot/v1/delete-session`, { data });

            await fetchSessions();
            // If deleted active, select another
            if (activeSessionId === sessionId) {
                setActiveSessionId(null); // Or select first in effect
            }
        } catch (error) {
            console.error("Failed to delete session", error);
        }
    }, [activeSessionId, fetchSessions]);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isLoading) return;

        let currentSessionId = activeSessionId;

        // Auto-create session if none exists
        if (!currentSessionId) {
            setIsLoading(true); // Start loading immediately
            const newId = await createSession();
            if (!newId) {
                setIsLoading(false);
                return;
            }
            currentSessionId = newId;
            // Note: createSession -> fetchSessions triggers a state update.
            // subsequent setSessions here will operate on the queue, so it should see the new session in 'prev'.
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
                    // Replace temp message and add reply
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
                    };

                    // Filter out our temp message (id starts with temp-)
                    const cleanMessages = s.messages.filter(m => !m.id.startsWith("temp-"));

                    return {
                        ...s,
                        name: res.data.data.title, // Update title if auto-generated
                        messages: [...cleanMessages, realUserMsg, replyMsg]
                    };
                }
                return s;
            }));

            await refreshSubscription();

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
            setIsLoading(false);
        }
    }, [activeSessionId, isLoading, createSession, refreshSubscription, showPricingModal]);


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
        // Actions
        fetchSessions,
        selectSession,
        createSession,
        deleteSession,
        sendMessage,
    };
}
