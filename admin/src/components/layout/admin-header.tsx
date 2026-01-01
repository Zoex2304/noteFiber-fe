import { Search } from '@admin/components/search';
import { ThemeSwitch } from '@admin/components/theme-switch';
import { ConfigDrawer } from '@admin/components/config-drawer';
import { ProfileDropdown } from '@admin/components/profile-dropdown';
import { AdminNotificationBell } from '@admin/components/admin-notification-bell';
import { Header } from '@admin/components/layout/header';

interface AdminHeaderProps {
    /** Optional left-side content (like TopNav) */
    children?: React.ReactNode;
    /** Whether header should be fixed position */
    fixed?: boolean;
}

/**
 * Shared admin header with notification bell, theme switch, config drawer, and profile dropdown.
 * Use this component in all admin pages for consistent navigation.
 */
export function AdminHeader({ children, fixed }: AdminHeaderProps) {
    return (
        <Header fixed={fixed}>
            {children}
            {!children && <Search />}
            <div className="ms-auto flex items-center space-x-4">
                {children && <Search />}
                <AdminNotificationBell />
                <ThemeSwitch />
                <ConfigDrawer />
                <ProfileDropdown />
            </div>
        </Header>
    );
}
