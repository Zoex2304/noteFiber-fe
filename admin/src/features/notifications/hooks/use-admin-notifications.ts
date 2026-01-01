/**
 * useAdminNotifications Hook
 * 
 * Custom hook for admin notification state and actions.
 * Encapsulates all business logic: WebSocket, API calls, and state management.
 * UI components should consume this hook and remain pure.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { WebSocketClient, getWebSocketUrl, type WebSocketMessage } from '@admin/lib/api/websocket-client';
import { adminNotificationService } from '../services/admin-notification.service';
import type { AdminNotification } from '@admin/lib/types/notification.types';

interface UseAdminNotificationsResult {
    /** List of notifications */
    notifications: AdminNotification[];
    /** Number of unread notifications */
    unreadCount: number;
    /** Whether notifications are being fetched */
    isLoading: boolean;
    /** Whether dropdown is open */
    isOpen: boolean;
    /** Toggle dropdown open state */
    setIsOpen: (open: boolean) => void;
    /** Mark a single notification as read */
    markAsRead: (id: string) => Promise<void>;
    /** Mark all notifications as read */
    markAllAsRead: () => Promise<void>;
}

/**
 * Hook for managing admin notifications
 * 
 * Handles:
 * - WebSocket connection for real-time updates
 * - REST API calls for fetching and updating notifications
 * - State management for notifications list and unread count
 * - Toast notifications for new messages
 */
export function useAdminNotifications(): UseAdminNotificationsResult {
    // State
    const [notifications, setNotifications] = useState<AdminNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Refs
    const wsClientRef = useRef<WebSocketClient | null>(null);

    // ========== API Methods ==========
    const fetchNotifications = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await adminNotificationService.getNotifications(20, 0);
            setNotifications(data);
        } catch {
            // Silent error - notifications are non-critical
        } finally {
            setIsLoading(false);
        }
    }, []);

    const fetchUnreadCount = useCallback(async () => {
        try {
            const count = await adminNotificationService.getUnreadCount();
            setUnreadCount(count);
        } catch {
            // Silent error
        }
    }, []);

    const markAsRead = useCallback(async (id: string) => {
        try {
            await adminNotificationService.markAsRead(id);
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch {
            // Silent error
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        try {
            await adminNotificationService.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch {
            // Silent error
        }
    }, []);

    // ========== WebSocket Handler ==========
    const handleNotification = useCallback((message: WebSocketMessage) => {
        // Increment unread count
        setUnreadCount(prev => prev + 1);

        // Prepend to notifications list
        const newNotification: AdminNotification = {
            id: message.data.id,
            type_code: message.data.type_code,
            title: message.data.title,
            message: message.data.message,
            is_read: false,
            created_at: new Date().toISOString(),
            metadata: message.data.metadata,
        };

        setNotifications(prev => [newNotification, ...prev.slice(0, 49)]);

        // Show toast notification
        toast(message.data.title, {
            description: message.data.message,
            duration: 5000,
        });
    }, []);

    // ========== WebSocket Lifecycle ==========
    useEffect(() => {
        // Fetch initial unread count
        fetchUnreadCount();

        // Setup WebSocket
        let client: WebSocketClient | null = null;
        const token = localStorage.getItem('admin_token');

        if (token) {
            const wsUrl = getWebSocketUrl();
            client = new WebSocketClient({
                baseUrl: wsUrl,
                token,
                onNotification: handleNotification,
            });
            wsClientRef.current = client;
            client.connect();
        }

        // Cleanup
        return () => {
            if (client) {
                client.disconnect();
            }
            wsClientRef.current = null;
        };
    }, [fetchUnreadCount, handleNotification]);

    // ========== Fetch on Dropdown Open ==========
    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen, fetchNotifications]);

    return {
        notifications,
        unreadCount,
        isLoading,
        isOpen,
        setIsOpen,
        markAsRead,
        markAllAsRead,
    };
}
