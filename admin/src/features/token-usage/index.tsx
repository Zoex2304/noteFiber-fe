/**
 * Token Usage Feature - Main Page
 * 
 * Admin page for viewing and managing user AI token usage.
 * Integrates table, dialogs, and bulk actions.
 */

import { Main } from '@admin/components/layout/main';
import { TokenUsageTable } from './components/token-usage-table';
import { EditLimitDialog } from './components/edit-limit-dialog';
import { BulkActionsBar } from './components/bulk-actions-bar';
import { useTokenUsage } from './hooks/use-token-usage';
import { useAiLimitManagement } from './hooks/use-ai-limit-management';
import { Activity } from 'lucide-react';

export function TokenUsage() {
    const { data: tokenUsage = [], isLoading } = useTokenUsage();

    const {
        selectedUsers,
        toggleUserSelection,
        selectAll,
        clearSelection,
        updateLimit,
        resetLimit,
        bulkUpdateLimits,
        bulkResetLimits,
        isUpdating,
        editDialog,
        openEditDialog,
        closeEditDialog,
    } = useAiLimitManagement();

    return (
        <Main className="flex flex-1 flex-col gap-4 sm:gap-6">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Activity className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold tracking-tight">Token Usage</h2>
                        <p className="text-muted-foreground">
                            Monitor and manage AI usage across all users
                        </p>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            <BulkActionsBar
                selectedCount={selectedUsers.length}
                onEditClick={() => {
                    // For bulk edit, we'll use a simplified approach
                    const limit = prompt('Enter new limit (-1 = unlimited, 0 = disabled):');
                    if (limit !== null) {
                        const limitNum = parseInt(limit, 10);
                        if (!isNaN(limitNum)) {
                            bulkUpdateLimits(limitNum);
                        }
                    }
                }}
                onResetClick={bulkResetLimits}
                onClearClick={clearSelection}
                isLoading={isUpdating}
            />

            {/* Table */}
            <TokenUsageTable
                data={tokenUsage}
                isLoading={isLoading}
                selectedUsers={selectedUsers}
                onToggleSelection={toggleUserSelection}
                onSelectAll={() => selectAll(tokenUsage)}
                onClearSelection={clearSelection}
                onEditUser={openEditDialog}
                onResetUser={resetLimit}
            />

            {/* Edit Dialog */}
            <EditLimitDialog
                open={editDialog.open}
                onClose={closeEditDialog}
                user={editDialog.user}
                onSave={updateLimit}
                onReset={resetLimit}
                isLoading={isUpdating}
            />
        </Main>
    );
}
