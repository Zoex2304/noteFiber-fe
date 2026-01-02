import { Bell } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { cn } from '@/lib/utils';

interface NotificationBellProps {
    /** Click handler (typically opens dropdown) */
    onClick?: () => void;
    /** Additional class names */
    className?: string;
}

/**
 * NotificationBell - Bell icon with unread count badge
 * 
 * Displays the notification bell icon with a badge showing
 * the number of unread notifications.
 */
export function NotificationBell({ onClick, className }: NotificationBellProps) {
    const { unreadCount, isConnected } = useNotifications();

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'relative inline-flex items-center justify-center',
                'h-8 w-8 rounded-full', // Fixed size to match TopBar icons
                'text-muted-foreground hover:text-foreground',
                'hover:bg-accent transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                className
            )}
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
            <Bell className="h-4 w-4" /> {/* Standard icon size */}

            {/* Unread badge */}
            {unreadCount > 0 && (
                <span
                    className={cn(
                        'absolute -top-0.5 -right-0.5',
                        'min-w-[1.125rem] h-[1.125rem]',
                        'flex items-center justify-center',
                        'text-[0.625rem] font-semibold',
                        'bg-destructive text-destructive-foreground',
                        'rounded-full px-1',
                        'animate-in zoom-in-50 duration-200'
                    )}
                >
                    {unreadCount > 99 ? '99+' : unreadCount}
                </span>
            )}

            {/* Connection indicator */}
            {!isConnected && (
                <span
                    className="absolute bottom-0 right-0 w-2 h-2 bg-yellow-500 rounded-full"
                    title="Reconnecting..."
                />
            )}
        </button>
    );
}
