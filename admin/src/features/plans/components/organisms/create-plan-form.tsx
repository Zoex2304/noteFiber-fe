import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@admin/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@admin/components/ui/card'
import { useCreatePlan } from '@admin/hooks/use-admin-api'
import { PlanNameInput } from '../atoms/plan-name-input'
import { PlanSlugInput } from '../atoms/plan-slug-input'
import { PlanPriceInput } from '../atoms/plan-price-input'
import { BillingPeriodSelect } from '@admin/features/plans/components/atoms/billing-period-select'
import { TokenLimitInput } from '../atoms/token-limit-input'
import { PlanFeaturesEditor } from '../molecules/plan-features-editor'
import { createPlanFormSchema, type CreatePlanFormData, type BillingPeriod } from '../../data/schema'

interface CreatePlanFormProps {
    onSuccess?: () => void
    onCancel?: () => void
}

export function CreatePlanForm({ onSuccess, onCancel }: CreatePlanFormProps) {
    const { mutate: createPlan, isPending } = useCreatePlan()

    const {
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
    } = useForm<CreatePlanFormData>({
        resolver: zodResolver(createPlanFormSchema),
        defaultValues: {
            name: '',
            slug: '',
            price: 0,
            tax_rate: 0,
            billing_period: 'monthly',
            max_notes: 0,
            semantic_search: false,
            ai_chat: false,
            daily_token_limit: 0,
        },
    })

    const name = watch('name')
    const slug = watch('slug')
    const price = watch('price')
    const billingPeriod = watch('billing_period')
    const maxNotes = watch('max_notes')
    const semanticSearch = watch('semantic_search')
    const aiChat = watch('ai_chat')
    const dailyTokenLimit = watch('daily_token_limit')

    // Auto-generate slug from name
    const handleNameChange = (value: string) => {
        setValue('name', value)
        if (!slug) {
            const autoSlug = value
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '')
            setValue('slug', autoSlug)
        }
    }

    const onSubmit = (data: CreatePlanFormData) => {
        createPlan(
            {
                name: data.name,
                slug: data.slug,
                price: data.price,
                tax_rate: data.tax_rate,
                billing_period: data.billing_period,
                features: {
                    max_notes: data.max_notes,
                    semantic_search: data.semantic_search,
                    ai_chat: data.ai_chat,
                    daily_token_limit: data.daily_token_limit,
                },
            },
            {
                onSuccess: () => {
                    onSuccess?.()
                },
            }
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Create New Subscription Plan</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    {/* Basic Info */}
                    <div className='grid gap-4 md:grid-cols-2'>
                        <PlanNameInput
                            value={name}
                            onChange={handleNameChange}
                            error={errors.name?.message}
                            disabled={isPending}
                        />
                        <PlanSlugInput
                            value={slug}
                            onChange={(value) => setValue('slug', value)}
                            error={errors.slug?.message}
                            disabled={isPending}
                        />
                    </div>

                    <div className='grid gap-4 md:grid-cols-2'>
                        <PlanPriceInput
                            value={price}
                            onChange={(value) => setValue('price', value)}
                            error={errors.price?.message}
                            disabled={isPending}
                        />
                        <BillingPeriodSelect
                            value={billingPeriod}
                            onChange={(value) => setValue('billing_period', value as BillingPeriod)}
                            error={errors.billing_period?.message}
                            disabled={isPending}
                        />
                    </div>

                    {/* Features */}
                    <PlanFeaturesEditor
                        maxNotes={maxNotes}
                        onMaxNotesChange={(value) => setValue('max_notes', value)}
                        semanticSearch={semanticSearch}
                        onSemanticSearchChange={(value) => setValue('semantic_search', value)}
                        aiChat={aiChat}
                        onAiChatChange={(value) => setValue('ai_chat', value)}
                        disabled={isPending}
                    />

                    {/* Token Limit */}
                    <TokenLimitInput
                        value={dailyTokenLimit}
                        onChange={(value) => setValue('daily_token_limit', value)}
                        error={errors.daily_token_limit?.message}
                        disabled={isPending}
                    />

                    {/* Actions */}
                    <div className='flex justify-end gap-3'>
                        {onCancel && (
                            <Button
                                type='button'
                                variant='outline'
                                onClick={onCancel}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                        )}
                        <Button type='submit' disabled={isPending}>
                            {isPending ? 'Creating...' : 'Create Plan'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
