/**
 * Token Usage Table Component
 * 
 * Table for displaying and managing user AI usage.
 * Supports selection, actions, and integrates with useAiLimitManagement hook.
 */

import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
} from '@tanstack/react-table';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@admin/components/ui/table';
import { Skeleton } from '@admin/components/ui/skeleton';
import { Badge } from '@admin/components/ui/badge';
import { Button } from '@admin/components/ui/button';
import { Checkbox } from '@admin/components/ui/checkbox';
import { Progress } from '@admin/components/ui/progress';
import { MoreHorizontal, Pencil, RotateCcw } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@admin/components/ui/dropdown-menu';
import type { TokenUsageItem } from '../types';
import { getLimitDescription } from '../types';

interface TokenUsageTableProps {
    data: TokenUsageItem[];
    isLoading?: boolean;
    selectedUsers: string[];
    onToggleSelection: (userId: string) => void;
    onSelectAll: () => void;
    onClearSelection: () => void;
    onEditUser: (user: TokenUsageItem) => void;
    onResetUser: (userId: string) => void;
}

export function TokenUsageTable({
    data,
    isLoading,
    selectedUsers,
    onToggleSelection,
    onSelectAll,
    onClearSelection,
    onEditUser,
    onResetUser,
}: TokenUsageTableProps) {
    const allSelected = data.length > 0 && selectedUsers.length === data.length;
    const someSelected = selectedUsers.length > 0 && selectedUsers.length < data.length;

    const columns: ColumnDef<TokenUsageItem>[] = [
        {
            id: 'select',
            header: () => (
                <Checkbox
                    checked={allSelected}
                    // @ts-expect-error - indeterminate is valid
                    indeterminate={someSelected}
                    onCheckedChange={(checked) => {
                        if (checked) onSelectAll();
                        else onClearSelection();
                    }}
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={selectedUsers.includes(row.original.user_id)}
                    onCheckedChange={() => onToggleSelection(row.original.user_id)}
                />
            ),
            size: 40,
        },
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
                const isOverLimit = used >= limit && limit > 0;

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
            accessorKey: 'ai_daily_remaining',
            header: 'Remaining',
            cell: ({ row }) => {
                const remaining = row.original.ai_daily_remaining;
                const limit = row.original.ai_daily_credit_limit;

                // Unlimited
                if (remaining === -1 || limit === -1) {
                    return <span className="text-green-600 font-medium">Unlimited</span>;
                }
                // Disabled or depleted
                if (remaining <= 0) {
                    return <span className="text-red-500 font-medium">0</span>;
                }
                // Low remaining
                if (limit > 0 && remaining < limit * 0.2) {
                    return <span className="text-yellow-600 font-medium">{remaining.toLocaleString()}</span>;
                }
                // Normal
                return <span className="text-muted-foreground">{remaining.toLocaleString()}</span>;
            },
        },
        {
            id: 'limit_status',
            header: 'Limit Status',
            cell: ({ row }) => {
                const limit = row.original.ai_daily_credit_limit;
                return (
                    <span className="text-sm text-muted-foreground">
                        {getLimitDescription(limit)}
                    </span>
                );
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
        {
            id: 'actions',
            cell: ({ row }) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEditUser(row.original)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit Limit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onResetUser(row.original.user_id)}>
                            <RotateCcw className="mr-2 h-4 w-4" />
                            Reset to Default
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
            size: 50,
        },
    ];

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    if (isLoading) {
        return (
            <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                ))}
            </div>
        );
    }

    return (
        <div className="rounded-md border">
            <Table>
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead key={header.id}>
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow
                                key={row.id}
                                data-state={selectedUsers.includes(row.original.user_id) && 'selected'}
                            >
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}>
                                        {flexRender(
                                            cell.column.columnDef.cell,
                                            cell.getContext()
                                        )}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell
                                colSpan={columns.length}
                                className="h-24 text-center"
                            >
                                No token usage data found.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
