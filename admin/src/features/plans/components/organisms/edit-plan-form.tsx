import { useEffect } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Button } from '@admin/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@admin/components/ui/card'
import { useUpdatePlan } from '@admin/hooks/use-admin-api'
import { PlanNameInput } from '../atoms/plan-name-input'
import { PlanPriceInput } from '../atoms/plan-price-input'
import { TokenLimitInput } from '../atoms/token-limit-input'
import { PlanFeaturesEditor } from '../molecules/plan-features-editor'
import { updatePlanFormSchema, type UpdatePlanFormData, type SubscriptionPlan } from '../../data/schema'

interface EditPlanFormProps {
    plan: SubscriptionPlan
    onSuccess?: () => void
    onCancel?: () => void
}

export function EditPlanForm({ plan, onSuccess, onCancel }: EditPlanFormProps) {
    const { mutate: updatePlan, isPending } = useUpdatePlan()

    const {
        handleSubmit,
        watch,
        setValue,
        formState: { errors },
        reset,
    } = useForm<UpdatePlanFormData>({
        resolver: zodResolver(updatePlanFormSchema),
        defaultValues: {
            name: plan.name,
            price: plan.price,
            max_notes: plan.features.max_notes,
            semantic_search: plan.features.semantic_search,
            ai_chat: plan.features.ai_chat,
            daily_token_limit: plan.features.daily_token_limit,
        },
    })

    // Reset form when plan changes
    useEffect(() => {
        reset({
            name: plan.name,
            price: plan.price,
            max_notes: plan.features.max_notes,
            semantic_search: plan.features.semantic_search,
            ai_chat: plan.features.ai_chat,
            daily_token_limit: plan.features.daily_token_limit,
        })
    }, [plan, reset])

    const name = watch('name')
    const price = watch('price')
    const maxNotes = watch('max_notes')
    const semanticSearch = watch('semantic_search')
    const aiChat = watch('ai_chat')
    const dailyTokenLimit = watch('daily_token_limit')

    const onSubmit = (data: UpdatePlanFormData) => {
        updatePlan(
            {
                id: plan.id,
                data: {
                    name: data.name,
                    price: data.price,
                    features: {
                        max_notes: data.max_notes,
                        semantic_search: data.semantic_search,
                        ai_chat: data.ai_chat,
                        daily_token_limit: data.daily_token_limit,
                    },
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
                <CardTitle>Edit Subscription Plan</CardTitle>
                <p className='text-muted-foreground text-sm'>
                    Editing: {plan.name} ({plan.slug})
                </p>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className='space-y-6'>
                    {/* Basic Info */}
                    <div className='grid gap-4 md:grid-cols-2'>
                        <PlanNameInput
                            value={name || ''}
                            onChange={(value) => setValue('name', value)}
                            error={errors.name?.message}
                            disabled={isPending}
                        />
                        <PlanPriceInput
                            value={price || 0}
                            onChange={(value) => setValue('price', value)}
                            error={errors.price?.message}
                            disabled={isPending}
                        />
                    </div>

                    {/* Note: Slug and billing period cannot be changed after creation */}
                    <div className='text-muted-foreground rounded-md bg-muted p-3 text-sm'>
                        Note: Slug and billing period cannot be changed after plan creation.
                    </div>

                    {/* Features */}
                    <PlanFeaturesEditor
                        maxNotes={maxNotes || 0}
                        onMaxNotesChange={(value) => setValue('max_notes', value)}
                        semanticSearch={semanticSearch || false}
                        onSemanticSearchChange={(value) => setValue('semantic_search', value)}
                        aiChat={aiChat || false}
                        onAiChatChange={(value) => setValue('ai_chat', value)}
                        disabled={isPending}
                    />

                    {/* Token Limit */}
                    <TokenLimitInput
                        value={dailyTokenLimit || 0}
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
                            {isPending ? 'Updating...' : 'Update Plan'}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
