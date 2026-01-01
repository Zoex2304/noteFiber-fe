/**
 * Admin Notification Types
 * 
 * Type definitions for the admin notification feature.
 * Single source of truth for notification data structures.
 */

/**
 * Individual notification item from the API
 */
export interface AdminNotification {
    id: string;
    type_code: AdminNotificationTypeCode;
    title: string;
    message: string;
    is_read: boolean;
    created_at: string;
    metadata?: Record<string, unknown>;
}

/**
 * Known notification type codes for admin
 */
export type AdminNotificationTypeCode =
    | 'USER_REGISTERED'
    | 'SUBSCRIPTION_CREATED'
    | 'REFUND_REQUESTED'
    | 'REFUND_APPROVED'
    | 'REFUND_REJECTED'
    | 'USER_DELETED'
    | string; // Allow unknown types for forward compatibility

/**
 * API response for fetching notifications list
 */
export interface AdminNotificationListResponse {
    data: AdminNotification[];
    total: number;
}

/**
 * API response for unread count
 */
export interface AdminUnreadCountResponse {
    count: number;
}

/**
 * Props for notification item component
 */
export interface NotificationItemProps {
    notification: AdminNotification;
    onMarkAsRead: (id: string) => void;
}

/**
 * Map notification type to display icon
 */
export const NOTIFICATION_TYPE_ICONS: Record<string, string> = {
    USER_REGISTERED: '👤',
    SUBSCRIPTION_CREATED: '💳',
    REFUND_REQUESTED: '↩️',
    REFUND_APPROVED: '✅',
    REFUND_REJECTED: '❌',
    USER_DELETED: '🗑️',
} as const;

/**
 * Get icon for notification type, with fallback
 */
export function getNotificationIcon(typeCode: string): string {
    return NOTIFICATION_TYPE_ICONS[typeCode] ?? '🔔';
}
