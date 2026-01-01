import { useState, useEffect, useCallback, useRef } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@admin/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@admin/components/ui/dropdown-menu';
import { Badge } from '@admin/components/ui/badge';
import { ScrollArea } from '@admin/components/ui/scroll-area';
import { cn } from '@admin/lib/utils';
import axios from 'axios';
import { toast } from 'sonner';
import { WebSocketClient, getWebSocketUrl, type WebSocketMessage } from '@admin/lib/api/websocket-client';

// Create admin API client
const envUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
const API_BASE_URL = envUrl.endsWith('/api') ? envUrl : `${envUrl}/api`;

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('admin_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

interface AdminNotification {
    id: string;
    type_code: string;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    metadata?: Record<string, unknown>;
}

interface NotificationResponse {
    data: AdminNotification[];
    total: number;
}

export function AdminNotificationBell() {
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // WS Ref
    const wsClientRef = useRef<WebSocketClient | null>(null);

    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await apiClient.get<NotificationResponse>('/notifications', {
                params: { limit: 20, offset: 0 }
            });
            setNotifications(response.data.data || []);
        } catch (error) {
            console.error('Failed to fetch admin notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const response = await apiClient.get<{ count: number }>('/notifications/unread-count');
            setUnreadCount(response.data.count);
        } catch (error) {
            // silent error
        }
    }, []);

    const markAsRead = async (id: string) => {
        try {
            await apiClient.patch(`/notifications/${id}/read`);
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await apiClient.patch('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    // WebSocket Handler
    const handleNotification = useCallback((message: WebSocketMessage) => {
        console.log('[Admin Notification] Received:', message);

        // Update count
        setUnreadCount(prev => prev + 1);

        // Update list if we have it loaded (prepend)
        const newNotification: AdminNotification = {
            id: message.data.id,
            type_code: message.data.type_code,
            title: message.data.title,
            message: message.data.message,
            is_read: false,
            created_at: new Date().toISOString(),
            metadata: message.data.metadata
        };

        setNotifications(prev => [newNotification, ...prev]);

        // Show toast
        toast(message.data.title, {
            description: message.data.message,
            duration: 5000,
        });
    }, []);

    // Initial Fetch & WS Connection
    useEffect(() => {
        fetchUnreadCount();

        let client: WebSocketClient | null = null;
        const token = localStorage.getItem('admin_token');

        if (token) {
            // Decode and log token payload (for debugging)
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                console.log('[Admin WS] Token payload:', payload);
                console.log('[Admin WS] Admin User ID:', payload.user_id);
                console.log('[Admin WS] Role:', payload.role);
            } catch (e) {
                console.error('[Admin WS] Failed to decode token:', e);
            }

            const wsUrl = getWebSocketUrl();
            client = new WebSocketClient({
                baseUrl: wsUrl,
                token,
                onNotification: handleNotification,
                onOpen: () => console.log('[Admin] WS Connected'),
                onClose: () => console.log('[Admin] WS Closed'),
            });
            wsClientRef.current = client;
            client.connect();
        }

        return () => {
            if (client) {
                client.disconnect();
            }
            wsClientRef.current = null;
        };
    }, [fetchUnreadCount, handleNotification]);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    const getTypeIcon = (typeCode: string) => {
        switch (typeCode) {
            case 'USER_REGISTERED': return '👤';
            case 'SUBSCRIPTION_CREATED': return '💳';
            case 'REFUND_REQUESTED': return '↩️';
            case 'USER_DELETED': return '🗑️';
            default: return '🔔';
        }
    };

    return (
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                            variant="destructive"
                        >
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
                <div className="flex items-center justify-between p-3 border-b">
                    <h4 className="font-semibold">Notifications</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs"
                            onClick={markAllAsRead}
                        >
                            Mark all read
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {isLoading ? (
                        <div className="p-4 text-center text-muted-foreground">Loading...</div>
                    ) : notifications.length === 0 ? (
                        <div className="p-4 text-center text-muted-foreground">
                            No notifications yet
                        </div>
                    ) : (
                        <div className="py-1">
                            {notifications.map((notification) => (
                                <button
                                    key={notification.id}
                                    onClick={() => !notification.is_read && markAsRead(notification.id)}
                                    className={cn(
                                        "w-full text-left px-3 py-2 hover:bg-muted/50 transition-colors border-l-2",
                                        !notification.is_read && "bg-muted/30",
                                        notification.type_code === 'REFUND_REQUESTED'
                                            ? "border-l-red-500 bg-red-50/50 dark:bg-red-900/10"
                                            : "border-l-transparent"
                                    )}
                                >
                                    <div className="flex gap-2">
                                        <span className="text-lg">{getTypeIcon(notification.type_code)}</span>
                                        <div className="flex-1 min-w-0">
                                            <p className={cn(
                                                "text-sm truncate",
                                                !notification.is_read && "font-medium"
                                            )}>
                                                {notification.title}
                                            </p>
                                            <p className="text-xs text-muted-foreground truncate">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {new Date(notification.created_at).toLocaleString()}
                                            </p>
                                        </div>
                                        {!notification.is_read && (
                                            <div className="w-2 h-2 rounded-full bg-primary mt-1" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
