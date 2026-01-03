/* eslint-disable react-refresh/only-export-components */
import {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
    type ReactNode,
} from 'react';
import { toast } from 'sonner';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/hooks/auth/useAuth';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { notificationService } from '@/api/services/notification/notification.service';
import { WebSocketClient, getWebSocketUrl } from '@/api/client/websocket.client';
import { NotificationTypeCode } from '@/api/services/notification/notification.schemas';
import type {
    Notification,
    WebSocketMessage,
    SocialProofMetadata,
} from '@/api/services/notification/notification.types';
import { SocialProofToast } from '@/components/molecules';

// ========== Constants ==========
import { playNotificationSound } from '@/utils/sound';

// ========== Constants ==========
const SOCIAL_PROOF_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes
// NOTIFICATION_SOUND_URL moved to utils


// ========== Context Type ==========
interface NotificationContextType {
    /** Total unread notification count */
    unreadCount: number;
    /** List of notifications for dropdown */
    notifications: Notification[];
    /** Loading state for notifications */
    isLoading: boolean;
    /** WebSocket connection status */
    isConnected: boolean;
    /** Mark a single notification as read */
    markAsRead: (id: string) => Promise<void>;
    /** Mark all notifications as read */
    markAllAsRead: () => Promise<void>;
    /** Refresh notifications from server */
    refreshNotifications: () => Promise<void>;
    /** Refresh unread count */
    refreshUnreadCount: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// ========== Provider Component ==========
export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const navigate = useNavigate();
    const { isAuthenticated, user, isLoading: isAuthLoading } = useAuth();
    const { isActive: isSubscribed, refreshSubscription } = useSubscription();

    // State
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);

    // Refs
    const wsClientRef = useRef<WebSocketClient | null>(null);
    const lastSocialProofTimeRef = useRef<number>(0);

    // ========== REST API Methods ==========
    const refreshUnreadCount = useCallback(async () => {
        try {
            const response = await notificationService.getUnreadCount();
            if (response.success && response.data) {
                setUnreadCount(response.data.count);
            }
        } catch (error) {
            console.error('Failed to fetch unread count:', error);
        }
    }, []);

    const refreshNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await notificationService.getNotifications(20, 0);

            // Handle both wrapped (ApiResponse) and unwrapped (PaginationResponse) formats
            let items: Notification[] = [];

            if (response.success && response.data?.data) {
                // Wrapped: { success: true, data: { data: [...] } }
                items = response.data.data;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } else if (Array.isArray((response as any).data)) {
                // Unwrapped: { data: [...], limit: ... }
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                items = (response as any).data;
            }

            setNotifications(items);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const markAsRead = useCallback(async (id: string) => {
        try {
            const response = await notificationService.markAsRead(id);
            if (response.success) {
                setNotifications(prev =>
                    prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            const response = await notificationService.markAllAsRead();
            if (response.success) {
                setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
                setUnreadCount(0);
            }
        } catch (error) {
            console.error('Failed to mark all notifications as read:', error);
        }
    }, []);

    // ========== Social Proof Handler ==========
    const handleSocialProof = useCallback(
        (message: WebSocketMessage) => {
            // Don't show to subscribed users
            if (isSubscribed) {
                return;
            }

            // Rate limit: max 1 per 5 minutes
            const now = Date.now();
            if (now - lastSocialProofTimeRef.current < SOCIAL_PROOF_COOLDOWN_MS) {
                return;
            }

            lastSocialProofTimeRef.current = now;

            const metadata = message.data.metadata as SocialProofMetadata | undefined;

            toast.custom(
                (t) => (
                    <SocialProofToast
                        title={message.data.title}
                        message={message.data.message}
                        avatarUrl={metadata?.avatar_url}
                        planName={metadata?.plan_name}
                        onUpgradeClick={() => {
                            toast.dismiss(t);
                            navigate({ to: '/pricing' });
                        }}
                        onDismiss={() => toast.dismiss(t)}
                    />
                ),
                {
                    duration: 7000,
                    position: 'bottom-right',
                }
            );
        },
        [isSubscribed, navigate]
    );

    // ========== WebSocket Message Handler ==========
    const handleNotification = useCallback(
        (message: WebSocketMessage) => {
            // Play notification sound
            playNotificationSound();

            // Increment unread count
            setUnreadCount(prev => prev + 1);

            // Prepend to notifications list
            const newNotification: Notification = {
                id: message.data.id,
                type_code: message.data.type_code,
                title: message.data.title,
                message: message.data.message,
                is_read: false,
                created_at: new Date().toISOString(),
                metadata: message.data.metadata,
            };
            setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);

            // Handle special notification types
            if (message.data.type_code === NotificationTypeCode.SOCIAL_PROOF) {
                handleSocialProof(message);
                return;
            }

            if (message.data.type_code === NotificationTypeCode.AI_LIMIT_UPDATED) {
                refreshSubscription();
            }

            // Handle refund status changes
            if (
                message.data.type_code === NotificationTypeCode.REFUND_APPROVED ||
                message.data.type_code === NotificationTypeCode.REFUND_REJECTED
            ) {
                // Dispatch event for components to react (e.g., SubscriptionManagement)
                window.dispatchEvent(new CustomEvent('refund:status_changed'));
            }

            // Regular toast notification with action_url support
            const actionUrl = message.data.metadata?.action_url as string | undefined;
            toast(message.data.title, {
                description: message.data.message,
                duration: 5000,
                action: actionUrl ? {
                    label: 'View',
                    onClick: () => {
                        // Normalize specific backend paths to frontend routes
                        const targetUrl = actionUrl === '/settings' ? '/app/settings' : actionUrl;
                        navigate({ to: targetUrl });
                    },
                } : undefined,
            });
        },
        [handleSocialProof, navigate, refreshSubscription]
    );

    // ========== WebSocket Lifecycle ==========
    useEffect(() => {
        // Wait for auth to finish loading before connecting
        if (isAuthLoading) {
            return;
        }

        if (!isAuthenticated || !user?.id) {
            // Disconnect if logged out
            if (wsClientRef.current) {
                wsClientRef.current.disconnect();
                wsClientRef.current = null;
                setIsConnected(false);
            }
            return;
        }

        // Get JWT token for WebSocket auth
        const accessToken = localStorage.getItem('access_token');
        if (!accessToken) {
            console.error('[NotificationContext] No access token for WebSocket');
            return;
        }

        // Connect WebSocket
        const wsUrl = getWebSocketUrl();
        wsClientRef.current = new WebSocketClient({
            baseUrl: wsUrl,
            token: accessToken,
            onNotification: handleNotification,
            onOpen: () => {
                setIsConnected(true);
                // Sync on connect/reconnect: Fetch missed notifications from DB
                refreshUnreadCount();
                refreshNotifications();
            },
            onClose: () => setIsConnected(false),
        });

        wsClientRef.current.connect();

        // Cleanup on unmount
        return () => {
            if (wsClientRef.current) {
                wsClientRef.current.disconnect();
                wsClientRef.current = null;
            }
        };
    }, [isAuthLoading, isAuthenticated, user?.id, handleNotification, refreshUnreadCount, refreshNotifications]);

    return (
        <NotificationContext.Provider
            value={{
                unreadCount,
                notifications,
                isLoading,
                isConnected,
                markAsRead,
                markAllAsRead,
                refreshNotifications,
                refreshUnreadCount,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

// ========== Hook ==========
export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
