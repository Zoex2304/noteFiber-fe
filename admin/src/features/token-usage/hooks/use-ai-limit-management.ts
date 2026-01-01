/**
 * useAiLimitManagement Hook
 * 
 * Custom hook for AI limit management state and actions.
 * Single responsibility: Orchestrates API calls and UI state.
 */

import { useState, useCallback } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { aiLimitService } from '../services/ai-limit.service';
import type { TokenUsageItem } from '../types';

interface UseAiLimitManagementResult {
    /** Currently selected users for bulk operations */
    selectedUsers: string[];
    /** Toggle user selection */
    toggleUserSelection: (userId: string) => void;
    /** Select all users */
    selectAll: (users: TokenUsageItem[]) => void;
    /** Clear selection */
    clearSelection: () => void;
    /** Update single user limit */
    updateLimit: (userId: string, limit: number) => Promise<void>;
    /** Reset single user to plan default */
    resetLimit: (userId: string) => Promise<void>;
    /** Bulk update selected users */
    bulkUpdateLimits: (limit: number) => Promise<void>;
    /** Bulk reset selected users to plan default */
    bulkResetLimits: () => Promise<void>;
    /** Whether any mutation is in progress */
    isUpdating: boolean;
    /** Edit dialog state */
    editDialog: {
        open: boolean;
        user: TokenUsageItem | null;
    };
    /** Open edit dialog for user */
    openEditDialog: (user: TokenUsageItem) => void;
    /** Close edit dialog */
    closeEditDialog: () => void;
    /** Bulk edit dialog state */
    bulkDialog: {
        open: boolean;
    };
    /** Open bulk edit dialog */
    openBulkDialog: () => void;
    /** Close bulk edit dialog */
    closeBulkDialog: () => void;
}

export function useAiLimitManagement(): UseAiLimitManagementResult {
    const queryClient = useQueryClient();

    // Selection state
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

    // Dialog states
    const [editDialog, setEditDialog] = useState<{ open: boolean; user: TokenUsageItem | null }>({
        open: false,
        user: null,
    });
    const [bulkDialog, setBulkDialog] = useState({ open: false });

    // Query key for invalidation
    const queryKey = ['admin', 'token-usage'];

    // ========== Selection Handlers ==========
    const toggleUserSelection = useCallback((userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    }, []);

    const selectAll = useCallback((users: TokenUsageItem[]) => {
        setSelectedUsers(users.map(u => u.user_id));
    }, []);

    const clearSelection = useCallback(() => {
        setSelectedUsers([]);
    }, []);

    // ========== Dialog Handlers ==========
    const openEditDialog = useCallback((user: TokenUsageItem) => {
        setEditDialog({ open: true, user });
    }, []);

    const closeEditDialog = useCallback(() => {
        setEditDialog({ open: false, user: null });
    }, []);

    const openBulkDialog = useCallback(() => {
        setBulkDialog({ open: true });
    }, []);

    const closeBulkDialog = useCallback(() => {
        setBulkDialog({ open: false });
    }, []);

    // ========== Mutations ==========
    const updateMutation = useMutation({
        mutationFn: ({ userId, limit }: { userId: string; limit: number }) =>
            aiLimitService.updateUserLimit(userId, limit),
        onSuccess: (data) => {
            toast.success(`AI limit updated for ${data.user_email}`);
            queryClient.invalidateQueries({ queryKey });
            closeEditDialog();
        },
        onError: () => {
            toast.error('Failed to update AI limit');
        },
    });

    const resetMutation = useMutation({
        mutationFn: (userId: string) => aiLimitService.resetUserLimit(userId),
        onSuccess: () => {
            toast.success('AI limit reset to plan default');
            queryClient.invalidateQueries({ queryKey });
        },
        onError: () => {
            toast.error('Failed to reset AI limit');
        },
    });

    const bulkUpdateMutation = useMutation({
        mutationFn: (limit: number) => aiLimitService.bulkUpdateLimits(selectedUsers, limit),
        onSuccess: (data) => {
            toast.success(`Updated ${data.total_updated} users`);
            if (data.failed_user_ids.length > 0) {
                toast.warning(`Failed for ${data.failed_user_ids.length} users`);
            }
            queryClient.invalidateQueries({ queryKey });
            clearSelection();
            closeBulkDialog();
        },
        onError: () => {
            toast.error('Bulk update failed');
        },
    });

    const bulkResetMutation = useMutation({
        mutationFn: () => aiLimitService.bulkResetLimits(selectedUsers),
        onSuccess: (data) => {
            toast.success(`Reset ${data.total_updated} users to plan default`);
            queryClient.invalidateQueries({ queryKey });
            clearSelection();
        },
        onError: () => {
            toast.error('Bulk reset failed');
        },
    });

    // ========== Action Wrappers ==========
    const updateLimit = useCallback(async (userId: string, limit: number) => {
        await updateMutation.mutateAsync({ userId, limit });
    }, [updateMutation]);

    const resetLimit = useCallback(async (userId: string) => {
        await resetMutation.mutateAsync(userId);
    }, [resetMutation]);

    const bulkUpdateLimits = useCallback(async (limit: number) => {
        await bulkUpdateMutation.mutateAsync(limit);
    }, [bulkUpdateMutation]);

    const bulkResetLimits = useCallback(async () => {
        await bulkResetMutation.mutateAsync();
    }, [bulkResetMutation]);

    const isUpdating =
        updateMutation.isPending ||
        resetMutation.isPending ||
        bulkUpdateMutation.isPending ||
        bulkResetMutation.isPending;

    return {
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
        bulkDialog,
        openBulkDialog,
        closeBulkDialog,
    };
}
