export interface Citation {
    noteId: string;
    title: string;
}

export interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    timestamp: Date
    citations?: Citation[]
    mode?: "rag" | "bypass" | "nuance"
    nuanceKey?: string
}

export interface ChatSession {
    id: string
    name: string
    messages: Message[]
    createdAt: Date
    updatedAt: Date
}