import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@admin/components/ui/badge';
import { Progress } from '@admin/components/ui/progress';
import type { TokenUsageItem } from '../types';

export const tokenUsageColumns: ColumnDef<TokenUsageItem>[] = [
    {
        accessorKey: 'email',
        header: 'User',
        cell: ({ row }) => (
            <div>
                <p className="font-medium">{row.original.full_name || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">{row.original.email}</p>
            </div>
        ),
    },
    {
        accessorKey: 'plan_name',
        header: 'Plan',
        cell: ({ row }) => (
            <Badge variant="outline">{row.original.plan_name}</Badge>
        ),
    },
    {
        accessorKey: 'used_today',
        header: 'Usage Today',
        cell: ({ row }) => {
            const { used_today, daily_limit } = row.original;
            const percentage = daily_limit > 0 ? (used_today / daily_limit) * 100 : 0;
            const isOverLimit = used_today >= daily_limit;

            return (
                <div className="w-32">
                    <div className="flex justify-between text-sm mb-1">
                        <span>{used_today}</span>
                        <span className="text-muted-foreground">/ {daily_limit === -1 ? '∞' : daily_limit}</span>
                    </div>
                    {daily_limit > 0 && (
                        <Progress
                            value={Math.min(percentage, 100)}
                            className={isOverLimit ? 'bg-red-100' : ''}
                        />
                    )}
                </div>
            );
        },
    },
    {
        accessorKey: 'remaining',
        header: 'Remaining',
        cell: ({ row }) => {
            const remaining = row.original.remaining;
            const isUnlimited = row.original.daily_limit === -1;

            if (isUnlimited) return <span className="text-green-600">Unlimited</span>;
            if (remaining <= 0) return <span className="text-red-600">0</span>;
            return <span>{remaining}</span>;
        },
    },
    {
        accessorKey: 'last_reset',
        header: 'Last Reset',
        cell: ({ row }) => {
            const date = new Date(row.original.last_reset);
            return <span className="text-sm text-muted-foreground">{date.toLocaleString()}</span>;
        },
    },
];
