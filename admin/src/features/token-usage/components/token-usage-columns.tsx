import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@admin/components/ui/badge';
import { Progress } from '@admin/components/ui/progress';
import type { TokenUsageItem } from '../types';

export const tokenUsageColumns: ColumnDef<TokenUsageItem>[] = [
    {
        accessorKey: 'email',
        header: 'User',
        cell: ({ row }) => (
            <div className="min-w-[180px]">
                <p className="font-medium">{row.original.full_name || 'N/A'}</p>
                <p className="text-sm text-muted-foreground">{row.original.email}</p>
            </div>
        ),
    },
    {
        accessorKey: 'plan_name',
        header: 'Plan',
        cell: ({ row }) => (
            <Badge variant="outline" className="whitespace-nowrap">
                {row.original.plan_name}
            </Badge>
        ),
    },
    {
        accessorKey: 'ai_daily_usage',
        header: 'Usage Today',
        cell: ({ row }) => {
            const used = row.original.ai_daily_usage;
            const limit = row.original.ai_daily_credit_limit;
            const percentage = limit > 0 ? (used / limit) * 100 : 0;
            const isHigh = percentage >= 80;
            const isOverLimit = used >= limit;

            return (
                <div className="min-w-[140px]">
                    <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className={isOverLimit ? 'text-red-500 font-medium' : ''}>
                            {used.toLocaleString()}
                        </span>
                        <span className="text-muted-foreground">
                            / {limit === -1 || limit === 0 ? '∞' : limit.toLocaleString()}
                        </span>
                    </div>
                    {limit > 0 && (
                        <Progress
                            value={Math.min(percentage, 100)}
                            className="h-2"
                            indicatorClassName={
                                isOverLimit
                                    ? 'bg-red-500'
                                    : isHigh
                                        ? 'bg-yellow-500'
                                        : 'bg-green-500'
                            }
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
            const limit = row.original.ai_daily_credit_limit;
            const used = row.original.ai_daily_usage;
            const remaining = limit - used;

            if (limit === -1 || limit === 0) {
                return <span className="text-green-500 font-medium">Unlimited</span>;
            }
            if (remaining <= 0) {
                return <span className="text-red-500 font-medium">0</span>;
            }
            if (remaining < 100) {
                return <span className="text-yellow-500 font-medium">{remaining.toLocaleString()}</span>;
            }
            return <span className="text-muted-foreground">{remaining.toLocaleString()}</span>;
        },
    },
    {
        accessorKey: 'ai_daily_usage_last_reset',
        header: 'Last Reset',
        cell: ({ row }) => {
            const dateStr = row.original.ai_daily_usage_last_reset;
            if (!dateStr) return <span className="text-muted-foreground">—</span>;

            const date = new Date(dateStr);
            return (
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {date.toLocaleDateString()} {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
            );
        },
    },
];
