import { useState } from 'react'
import { Header } from '@admin/components/layout/header'
import { Main } from '@admin/components/layout/main'
import { ProfileDropdown } from '@admin/components/profile-dropdown'
import { ThemeSwitch } from '@admin/components/theme-switch'
import { ConfigDrawer } from '@admin/components/config-drawer'
import { RefundsProvider } from './components/refunds-provider'
import { RefundsTable } from './components/refunds-table'
import { RefundsDialogs } from './components/refunds-dialogs'
import { useRefunds } from './hooks/use-refunds'
import type { RefundStatus } from '@admin/lib/types/admin-api'

export default function RefundsPage() {
    const [statusFilter, setStatusFilter] = useState<RefundStatus | 'all'>('pending')

    const queryParams = statusFilter === 'all' ? undefined : { status: statusFilter }
    const { data: refunds = [], isLoading, error } = useRefunds(queryParams)

    if (error) {
        console.error('Failed to fetch refunds:', error)
    }

    return (
        <RefundsProvider>
            <Header fixed>
                <div className="ms-auto flex items-center space-x-4">
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
                <div className="flex flex-wrap items-end justify-between gap-2">
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Refund Requests</h2>
                        <p className="text-muted-foreground">
                            Manage and process user refund requests. Remember to manually transfer refund amounts.
                        </p>
                    </div>
                </div>

                <RefundsTable
                    data={refunds}
                    isLoading={isLoading}
                    statusFilter={statusFilter}
                    onStatusFilterChange={setStatusFilter}
                />
            </Main>

            <RefundsDialogs />
        </RefundsProvider>
    )
}
