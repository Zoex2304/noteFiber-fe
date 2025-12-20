import { getRouteApi } from '@tanstack/react-router'
import { ConfigDrawer } from '@admin/components/config-drawer'
import { Header } from '@admin/components/layout/header'
import { Main } from '@admin/components/layout/main'
import { ProfileDropdown } from '@admin/components/profile-dropdown'
import { Search } from '@admin/components/search'
import { ThemeSwitch } from '@admin/components/theme-switch'
import { LogsTable } from './components/logs-table'
import { useLogs } from './hooks/use-logs'
import { LogListParams } from '@admin/lib/types/admin-api'
import { NavigateFn } from '@admin/hooks/use-table-url-state'

// @ts-expect-error Route generation might be stale
const route = getRouteApi('/_authenticated/logs/')

export function Logs() {
    // @ts-expect-error Search params are verified but type inference fails if route is stale
    const search = route.useSearch() as LogListParams
    const navigate = route.useNavigate() as NavigateFn

    // safely cast search params
    const queryParams: LogListParams = {
        page: search.page || 1,
        limit: search.limit || 10,
        level: search.level,
    }

    const { data: logs = [], isLoading, error } = useLogs(queryParams)

    if (error) {
        console.error("Failed to fetch logs", error)
    }

    return (
        <>
            <Header fixed>
                <Search />
                <div className='ms-auto flex items-center space-x-4'>
                    <ThemeSwitch />
                    <ConfigDrawer />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main className='flex flex-1 flex-col gap-4 sm:gap-6'>
                <div className='flex items-center justify-between'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>System Logs</h2>
                        <p className='text-muted-foreground'>
                            View system activity and audit logs.
                        </p>
                    </div>
                </div>
                <LogsTable data={logs} isLoading={isLoading} search={search} navigate={navigate} />
            </Main>
        </>
    )
}
