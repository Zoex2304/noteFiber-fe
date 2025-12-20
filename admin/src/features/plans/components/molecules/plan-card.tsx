import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@admin/components/ui/card'
import { Badge } from '@admin/components/ui/badge'
import { Button } from '@admin/components/ui/button'
import { CurrencyDisplay } from '@admin/components/ui/currency-display'
import { Check, X, Edit, Trash2 } from 'lucide-react'
import { cn } from '@admin/lib/utils'
import type { SubscriptionPlan } from '../../data/schema'

interface PlanCardProps {
    plan: SubscriptionPlan
    onEdit?: (plan: SubscriptionPlan) => void
    onDelete?: (plan: SubscriptionPlan) => void
    className?: string
}

export function PlanCard({ plan, onEdit, onDelete, className }: PlanCardProps) {
    return (
        <Card className={cn(className)}>
            <CardHeader>
                <div className='flex items-start justify-between'>
                    <div className='space-y-1'>
                        <CardTitle>{plan.name}</CardTitle>
                        <CardDescription className='font-mono text-xs'>
                            /{plan.slug}
                        </CardDescription>
                    </div>
                    <Badge variant='outline' className='capitalize'>
                        {plan.billing_period}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className='space-y-4'>
                {/* Price */}
                <div>
                    <p className='text-3xl font-bold'>
                        <CurrencyDisplay amount={plan.price} />
                    </p>
                    <p className='text-muted-foreground text-sm'>per {plan.billing_period}</p>
                </div>

                {/* Features */}
                <div className='space-y-2'>
                    <p className='text-sm font-medium'>Features:</p>
                    <ul className='space-y-2'>
                        <li className='flex items-center gap-2 text-sm'>
                            <Check className='h-4 w-4 text-green-600' />
                            {plan.features.max_notes === 0
                                ? 'Unlimited notes'
                                : `${plan.features.max_notes} notes`}
                        </li>
                        <li className='flex items-center gap-2 text-sm'>
                            {plan.features.semantic_search ? (
                                <Check className='h-4 w-4 text-green-600' />
                            ) : (
                                <X className='text-muted-foreground h-4 w-4' />
                            )}
                            Semantic Search
                        </li>
                        <li className='flex items-center gap-2 text-sm'>
                            {plan.features.ai_chat ? (
                                <Check className='h-4 w-4 text-green-600' />
                            ) : (
                                <X className='text-muted-foreground h-4 w-4' />
                            )}
                            AI Chat
                        </li>
                        <li className='flex items-center gap-2 text-sm'>
                            <Check className='h-4 w-4 text-green-600' />
                            {plan.features.daily_token_limit === 0
                                ? 'Unlimited AI tokens'
                                : `${plan.features.daily_token_limit} AI tokens/day`}
                        </li>
                    </ul>
                </div>

                {/* Actions */}
                {(onEdit || onDelete) && (
                    <div className='flex gap-2 pt-2'>
                        {onEdit && (
                            <Button
                                variant='outline'
                                size='sm'
                                onClick={() => onEdit(plan)}
                                className='flex-1'
                            >
                                <Edit className='mr-2 h-4 w-4' />
                                Edit
                            </Button>
                        )}
                        {onDelete && (
                            <Button
                                variant='destructive'
                                size='sm'
                                onClick={() => onDelete(plan)}
                            >
                                <Trash2 className='h-4 w-4' />
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
