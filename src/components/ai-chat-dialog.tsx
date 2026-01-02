"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { ScrollArea } from "./ui/scroll-area";
import { Send, Plus, Trash2, Bot } from "lucide-react";
import type { Note } from "../types/note";
import type { ChatSession, Message } from "@/types/ai-chat";
import { apiClient } from "@/api/client/axios.client";
import type { BaseResponse } from "../dto/base-response";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useUsageLimits, handleLimitExceededError } from "@/contexts/UsageLimitsContext";
import { TokenLimitDialog } from "@/components/common/TokenLimitDialog";
import { ChatBubble, PixelLoader } from "@/components/molecules";
import { TokenUsagePill } from "@/components/common/TokenUsagePill";
import { useNavigate } from "@tanstack/react-router";
import type {
  SendChatResponse,
  CreateSessionResponse,
  DeleteSessionRequest,
  GetAllSessionsResponse,
  GetChatHistoryResponse,
  SendChatRequest,
} from "../dto/chatbot";

interface AIChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  notes: Note[];
}

export function AIChatDialog({ open, onOpenChange }: AIChatDialogProps) {
  const navigate = useNavigate();
  const [input, setInput] = useState("");
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [activeSessionId, setActiveSessionId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTokenLimitDialog, setShowTokenLimitDialog] = useState(false);

  const { tokenUsage, refreshSubscription } = useSubscription();
  const { showPricingModal } = useUsageLimits();

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const messages = activeSession?.messages || [];

  // const fetchData = async (): Promise<ChatSession[]> => {
  //     const res = await axios.get<BaseResponse<GetAllSessionsResponse[]>>(
  //         `${AppConfig.baseUrl}/api/chatbot/v1/sessions`
  //     )

  //     const newSessions = res.data.data.map(d => ({
  //         id: d.id,
  //         messages: [],
  //         name: d.title,
  //         createdAt: new Date(d.created_at),
  //         updatedAt: new Date(d.updated_at ?? d.created_at),
  //     }));
  //     setSessions(newSessions)
  //     return newSessions
  // }

  const fetchData = async (): Promise<ChatSession[]> => {
    const res = await apiClient.get<BaseResponse<GetAllSessionsResponse[]>>(
      `/chatbot/v1/sessions`
    );

    // SOLUSI: Pastikan res.data.data adalah array atau array kosong ([]),
    // sebelum memanggil .map().
    const apiData = res.data.data ?? [];

    const newSessions = apiData.map((d) => ({
      id: d.id,
      messages: [],
      name: d.title,
      createdAt: new Date(d.created_at),
      updatedAt: new Date(d.updated_at ?? d.created_at),
    }));

    setSessions(newSessions);
    return newSessions;
  };

  const sessionClickHandler = async (sessionId: string) => {
    setActiveSessionId(sessionId);

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
            })),
          };
        }
        return { ...session };
      })
    );
  };

  const createNewSession = async () => {
    const res = await apiClient.post<BaseResponse<CreateSessionResponse>>(
      `/chatbot/v1/create-session`
    );

    await fetchData();

    sessionClickHandler(res.data.data.id);
  };

  const deleteSession = async (sessionId: string) => {
    if (sessions.length <= 1) return;

    const data: DeleteSessionRequest = {
      chat_session_id: sessionId,
    };
    await apiClient.delete(`/chatbot/v1/delete-session`, {
      data,
    });

    await fetchData();

    if (activeSessionId === sessionId) {
      const remainingSessions = sessions.filter((s) => s.id !== sessionId);
      sessionClickHandler(remainingSessions[0]?.id ?? "");
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !activeSession) return;

    setInput("");
    setIsLoading(true);

    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          return {
            ...s,
            messages: [
              ...s.messages,
              {
                id: "test",
                content: input,
                role: "user",
                timestamp: new Date(),
              },
            ],
          };
        }
        return { ...s };
      })
    );

    const request: SendChatRequest = {
      chat: input,
      chat_session_id: activeSessionId,
    };

    try {
      const res = await apiClient.post<BaseResponse<SendChatResponse>>(
        `/chatbot/v1/send-chat`,
        request
      );

      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              name: res.data.data.title,
              messages: [
                ...s.messages.slice(0, -1),
                {
                  id: res.data.data.sent.id,
                  content: res.data.data.sent.chat,
                  role:
                    res.data.data.sent.role === "model" ? "assistant" : "user",
                  timestamp: new Date(res.data.data.sent.created_at),
                },
                {
                  id: res.data.data.reply.id,
                  content: res.data.data.reply.chat,
                  role:
                    res.data.data.reply.role === "model" ? "assistant" : "user",
                  timestamp: new Date(res.data.data.reply.created_at),
                  citations: res.data.data.reply.citations?.map((c) => ({
                    noteId: c.note_id,
                    title: c.title,
                  })),
                },
              ],
            };
          }
          return { ...s };
        })
      );

      // Refresh subscription to get updated token usage
      await refreshSubscription();
    } catch (error: any) {
      // Handle limit exceeded error (429) with pricing modal
      if (!handleLimitExceededError(error, showPricingModal)) {
        // Handle legacy token limit error (500)
        if (error.response?.status === 500 &&
          error.response?.data?.message?.includes("daily AI usage limit exceeded")) {
          setShowTokenLimitDialog(true);
        }
      }
      // Remove optimistic user message on error
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: s.messages.slice(0, -1),
            };
          }
          return { ...s };
        })
      );
      console.error("Failed to send chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    const fetchList = async () => {
      const newSessions = await fetchData();
      if (newSessions.length > 0) {
        sessionClickHandler(newSessions[0].id);
      }
    };
    if (open) {
      fetchList();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[700px] flex flex-col bg-gradient-to-br from-white to-gray-50">
        <DialogHeader className="bg-gradient-to-r from-white to-gray-50 border-b border-gray-200 pb-4">
          <div className="flex items-center justify-between pr-8">
            <DialogTitle className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Ask AI
            </DialogTitle>
            <div className="flex items-center gap-4">
              <TokenUsagePill type="chat" />
              <Button
                variant="outline"
                size="sm"
                onClick={createNewSession}
                className="bg-transparent hover:bg-blue-50"
              >
                <Plus className="h-4 w-4 mr-2" />
                New Chat
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 gap-4 min-h-0">
          {/* Session Sidebar */}
          <div className="w-48 border-r border-gray-200 pr-4 bg-gradient-to-b from-gray-50 to-white flex flex-col">
            <h4 className="text-sm font-semibold text-gray-800 mb-3 px-2 py-1 bg-gray-100 rounded-md flex-shrink-0">
              Chat Sessions
            </h4>
            <ScrollArea className="flex-1">
              <div className="space-y-1 pr-2">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center gap-1">
                    <Button
                      variant={
                        activeSessionId === session.id ? "secondary" : "ghost"
                      }
                      size="sm"
                      className={`flex-1 justify-start h-auto py-2 px-2 text-left flex-col items-start transition-all duration-200 ${activeSessionId === session.id
                        ? "bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 shadow-sm border-l-2 border-blue-500"
                        : "hover:bg-gray-50 hover:shadow-sm"
                        }`}
                      onClick={() => sessionClickHandler(session.id)}
                    >
                      <span className="truncate w-full text-xs font-medium">
                        {session.name.length > 18
                          ? `${session.name.slice(0, 18)}...`
                          : session.name}
                      </span>
                      <span className="text-[10px] text-gray-500 w-full mt-0.5">
                        {session.createdAt.toLocaleDateString()}
                      </span>
                    </Button>
                    {sessions.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 opacity-50 hover:opacity-100 hover:bg-red-50 flex-shrink-0"
                        onClick={() => deleteSession(session.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-gradient-to-b from-white to-gray-50">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 p-4 overflow-hidden">
                {messages.map((message) => (
                  <ChatBubble
                    key={message.id}
                    message={message}
                    onCitationClick={(noteId) => {
                      onOpenChange(false);
                      navigate({ to: '/app/note/$noteId', params: { noteId } });
                    }}
                  />
                ))}

                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-600 rounded-full flex items-center justify-center shadow-sm">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200 shadow-sm">
                      <PixelLoader />
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            <div className="flex gap-2 pt-4 border-t border-gray-200 bg-gradient-to-r from-white to-gray-50 px-4 pb-4">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything about your notes..."
                className="flex-1 min-h-[40px] max-h-[120px] bg-white border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="self-end bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-sm"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <TokenLimitDialog
          open={showTokenLimitDialog}
          onOpenChange={setShowTokenLimitDialog}
          dailyLimit={tokenUsage.chat.limit}
        />
      </DialogContent>
    </Dialog>
  );
}
