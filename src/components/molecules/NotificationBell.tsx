import { Bell } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { RingingIcon } from '@/components/common/RingingIcon';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface NotificationBellProps {
    /** Click handler (typically opens dropdown) */
    onClick?: () => void;
    /** Additional class names */
    className?: string;
}

/**
 * NotificationBell - Bell icon with unread count badge and ring animation
 * 
 * Displays the notification bell icon with a badge showing
 * the number of unread notifications. Animates when new
 * notifications arrive.
 */
export function NotificationBell({ onClick, className }: NotificationBellProps) {
    const { unreadCount, isConnected } = useNotifications();
    const [isRinging, setIsRinging] = useState(false);
    const [prevUnreadCount, setPrevUnreadCount] = useState(unreadCount);

    // Trigger ring animation when unreadCount increases
    useEffect(() => {
        if (unreadCount > prevUnreadCount) {
            setIsRinging(true);
            // Stop ringing after animation completes
            const timer = setTimeout(() => setIsRinging(false), 1000);
            return () => clearTimeout(timer);
        }
        setPrevUnreadCount(unreadCount);
    }, [unreadCount, prevUnreadCount]);

    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                'relative inline-flex items-center justify-center',
                'h-8 w-8 rounded-full',
                'text-muted-foreground hover:text-foreground',
                'hover:bg-accent transition-colors',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                className
            )}
            aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ''}`}
        >
            <RingingIcon
                isRinging={isRinging}
                intensity="expressive"
                highlightOnRing
                highlightClassName="text-amber-500"
            >
                <Bell className="h-4 w-4" />
            </RingingIcon>

            {/* Unread badge */}
            {unreadCount > 0 && (
                <span
                    className={cn(
                        'absolute -top-0.5 -right-0.5',
                        'min-w-[1.125rem] h-[1.125rem]',
                        'flex items-center justify-center',
                        'text-[0.625rem] font-semibold',
                        'bg-gradient-to-r from-amber-500 to-orange-500 text-white',
                        'rounded-full px-1',
                        'animate-in zoom-in-50 duration-200',
                        'shadow-sm'
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
