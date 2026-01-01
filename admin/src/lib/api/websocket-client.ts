
export interface WebSocketMessage {
    type: string;
    data: {
        id: string;
        type_code: string;
        title: string;
        message: string;
        metadata?: Record<string, unknown>;
    };
}

export interface WebSocketClientOptions {
    baseUrl: string;
    token: string;
    onNotification: (message: WebSocketMessage) => void;
    onOpen?: () => void;
    onClose?: () => void;
    onError?: (error: Event) => void;
    reconnectDelay?: number;
}

export class WebSocketClient {
    private ws: WebSocket | null = null;
    private options: WebSocketClientOptions;
    private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private isIntentionalClose = false;
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 10;

    constructor(options: WebSocketClientOptions) {
        this.options = {
            reconnectDelay: 5000,
            ...options,
        };
    }

    connect(): void {
        if (this.ws?.readyState === WebSocket.OPEN) {
            console.log('[Admin WS] Already connected');
            return;
        }

        this.isIntentionalClose = false;
        // Append token as query param
        const url = `${this.options.baseUrl}?token=${this.options.token}`;

        console.log('[Admin WS] Connecting to:', url.replace(/token=.*$/, 'token=***'));
        console.log('[Admin WS] Token length:', this.options.token?.length || 0);
        this.ws = new WebSocket(url);

        this.ws.onopen = () => {
            console.log('[Admin WS] Connected');
            this.reconnectAttempts = 0;
            this.options.onOpen?.();
        };

        this.ws.onmessage = (event) => {
            console.log('[Admin WS] Raw message received:', event.data);
            try {
                const parsed = JSON.parse(event.data);
                console.log('[Admin WS] Parsed message:', parsed);
                // Handle both {type, data} format and direct notification format
                if (parsed && (parsed.data || parsed.type_code)) {
                    // If it's wrapped in {type, data}, use parsed directly
                    // If it's a direct notification object, wrap it
                    const message = parsed.data ? parsed : { type: 'notification', data: parsed };
                    this.options.onNotification(message);
                } else {
                    console.warn('[Admin WS] Message missing expected fields:', parsed);
                }
            } catch (err) {
                console.error('[Admin WS] Parse error:', err, 'Raw:', event.data);
            }
        };

        this.ws.onclose = (event) => {
            console.log('[Admin WS] Closed:', event.code, event.reason);
            this.options.onClose?.();

            if (!this.isIntentionalClose) {
                this.scheduleReconnect();
            }
        };

        this.ws.onerror = (error) => {
            console.error('[Admin WS] Error:', error);
            this.options.onError?.(error);
        };
    }

    disconnect(): void {
        this.isIntentionalClose = true;
        this.clearReconnectTimer();

        const socket = this.ws;
        if (socket) {
            this.ws = null;
            if (socket.readyState === WebSocket.CONNECTING) {
                socket.onopen = () => socket.close(1000, 'Admin disconnect');
                socket.onmessage = null;
                socket.onerror = null;
            } else {
                socket.close(1000, 'Admin disconnect');
            }
        }
    }

    private scheduleReconnect(): void {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) return;

        this.clearReconnectTimer();
        this.reconnectAttempts++;
        const delay = this.options.reconnectDelay! * Math.min(this.reconnectAttempts, 5);

        console.log(`[Admin WS] Reconnecting in ${delay}ms...`);
        this.reconnectTimer = setTimeout(() => this.connect(), delay);
    }

    private clearReconnectTimer(): void {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }
}

export function getWebSocketUrl(): string {
    const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    try {
        const url = new URL(apiBaseUrl);
        const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
        // Ensure /api/ws path
        return `${protocol}//${url.host}/api/ws`;
    } catch {
        return 'ws://localhost:3000/api/ws';
    }
}
