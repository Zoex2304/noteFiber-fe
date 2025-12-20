import { useState } from 'react'
import { Button } from '@admin/components/ui/button'
import { Header } from '@admin/components/layout/header'
import { Main } from '@admin/components/layout/main'
import { TopNav } from '@admin/components/layout/top-nav'
import { ProfileDropdown } from '@admin/components/profile-dropdown'
import { Search } from '@admin/components/search'
import { ThemeSwitch } from '@admin/components/theme-switch'
import { PlansList } from './components/organisms/plans-list'
import { CreatePlanForm } from './components/organisms/create-plan-form'
import { EditPlanForm } from './components/organisms/edit-plan-form'
import { Plus, ArrowLeft } from 'lucide-react'
import type { SubscriptionPlan } from './data/schema'

type ViewMode = 'list' | 'create' | 'edit'

export function PlansManagement() {
    const [viewMode, setViewMode] = useState<ViewMode>('list')
    const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null)

    const handleCreateNew = () => {
        setViewMode('create')
    }

    const handleEdit = (plan: SubscriptionPlan) => {
        setSelectedPlan(plan)
        setViewMode('edit')
    }

    const handleBack = () => {
        setViewMode('list')
        setSelectedPlan(null)
    }

    return (
        <>
            <Header>
                <TopNav links={topNav} />
                <div className='ms-auto flex items-center space-x-4'>
                    <Search />
                    <ThemeSwitch />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main>
                <div className='mb-6 flex items-center justify-between'>
                    {viewMode === 'list' ? (
                        <>
                            <div>
                                <h1 className='text-2xl font-bold tracking-tight'>
                                    Subscription Plans
                                </h1>
                                <p className='text-muted-foreground'>
                                    Manage subscription plans and pricing
                                </p>
                            </div>
                            <Button onClick={handleCreateNew}>
                                <Plus className='mr-2 h-4 w-4' />
                                Create Plan
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button variant='ghost' onClick={handleBack}>
                                <ArrowLeft className='mr-2 h-4 w-4' />
                                Back to Plans
                            </Button>
                        </>
                    )}
                </div>

                {viewMode === 'list' && (
                    <PlansList onCreateNew={handleCreateNew} onEdit={handleEdit} />
                )}

                {viewMode === 'create' && (
                    <CreatePlanForm onSuccess={handleBack} onCancel={handleBack} />
                )}

                {viewMode === 'edit' && selectedPlan && (
                    <EditPlanForm
                        plan={selectedPlan}
                        onSuccess={handleBack}
                        onCancel={handleBack}
                    />
                )}
            </Main>
        </>
    )
}

const topNav = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        isActive: false,
        disabled: false,
    },
    {
        title: 'Plans',
        href: '/plans',
        isActive: true,
        disabled: false,
    },
    {
        title: 'Users',
        href: '/users',
        isActive: false,
        disabled: false,
    },
]
