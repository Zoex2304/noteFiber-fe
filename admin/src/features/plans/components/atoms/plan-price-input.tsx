import { Label } from '@admin/components/ui/label'
import { Input } from '@admin/components/ui/input'
import { cn } from '@admin/lib/utils'
import { DollarSign } from 'lucide-react'

interface PlanPriceInputProps {
    value: number
    onChange: (value: number) => void
    error?: string
    disabled?: boolean
    className?: string
}

export function PlanPriceInput({
    value,
    onChange,
    error,
    disabled,
    className,
}: PlanPriceInputProps) {
    return (
        <div className={cn('space-y-2', className)}>
            <Label htmlFor='plan-price'>Price (USD)</Label>
            <div className='relative'>
                <DollarSign className='text-muted-foreground absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2' />
                <Input
                    id='plan-price'
                    type='number'
                    step='0.01'
                    min='0'
                    placeholder='0.00'
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
                    disabled={disabled}
                    className={cn('pl-9', error && 'border-destructive')}
                />
            </div>
            {error && <p className='text-destructive text-sm'>{error}</p>}
        </div>
    )
}
