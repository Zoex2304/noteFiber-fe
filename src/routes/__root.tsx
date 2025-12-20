import { type QueryClient } from '@tanstack/react-query'
import { createRootRouteWithContext, Outlet, useRouterState } from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { Toaster } from 'sonner'
import { TopLoader } from '@/components/shadui/TopLoader'
import { useState, useEffect } from 'react'
import { SubscriptionProvider } from '@/contexts/SubscriptionContext'
import { UpgradeModal } from '@/components/modals/UpgradeModal'

import { type User } from '@/api/services/auth/auth.types';

// Define the router context type
export interface RouterContext {
    queryClient: QueryClient
    auth?: {
        isAuthenticated: boolean
        user: User | null
    }
}

export const Route = createRootRouteWithContext<RouterContext>()({
    component: RootComponent,
})

function RootComponent() {
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);

    useEffect(() => {
        const UPGRADE_EVENT = 'show-upgrade-modal';
        const handleUpgradeTrigger = () => setShowUpgradeModal(true);
        window.addEventListener(UPGRADE_EVENT, handleUpgradeTrigger);
        return () => window.removeEventListener(UPGRADE_EVENT, handleUpgradeTrigger);
    }, []);

    const router = useRouterState();
    const isAdmin = router.location.pathname.startsWith('/admin');

    return (
        <SubscriptionProvider>
            <div className="min-h-screen bg-background font-sans antialiased">
                <Outlet />
                <Toaster position="top-right" richColors duration={5000} />
                <TopLoader color={isAdmin ? "#E5E7EB" : undefined} />
                <UpgradeModal
                    isOpen={showUpgradeModal}
                    onClose={() => setShowUpgradeModal(false)}
                    featureName="This pro feature"
                />
                {import.meta.env.DEV && (
                    <>
                        <ReactQueryDevtools buttonPosition="bottom-left" />
                        <TanStackRouterDevtools position="bottom-right" />
                    </>
                )}
            </div>
        </SubscriptionProvider>
    )
}
