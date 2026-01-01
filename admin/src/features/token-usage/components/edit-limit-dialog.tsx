/**
 * EditLimitDialog Component
 * 
 * Dialog for editing a single user's AI daily limit.
 * Pure UI component - receives state via props.
 */

import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@admin/components/ui/dialog';
import { Button } from '@admin/components/ui/button';
import { Input } from '@admin/components/ui/input';
import { Label } from '@admin/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@admin/components/ui/radio-group';
import { Loader2 } from 'lucide-react';
import type { TokenUsageItem, LimitType } from '../types';
import { getLimitType } from '../types';

interface EditLimitDialogProps {
    open: boolean;
    onClose: () => void;
    user: TokenUsageItem | null;
    onSave: (userId: string, limit: number) => Promise<void>;
    onReset: (userId: string) => Promise<void>;
    isLoading: boolean;
}

export function EditLimitDialog({
    open,
    onClose,
    user,
    onSave,
    onReset,
    isLoading,
}: EditLimitDialogProps) {
    const [limitType, setLimitType] = useState<LimitType>('plan_default');
    const [customLimit, setCustomLimit] = useState('50');

    // Initialize from user's current limit
    useEffect(() => {
        if (user) {
            const currentType = getLimitType(user.ai_daily_credit_limit);
            setLimitType(currentType);
            if (currentType === 'custom') {
                setCustomLimit(String(user.ai_daily_credit_limit));
            }
        }
    }, [user]);

    const handleSave = async () => {
        if (!user) return;

        let limitValue: number;
        switch (limitType) {
            case 'unlimited':
                limitValue = -1;
                break;
            case 'disabled':
                limitValue = 0;
                break;
            case 'plan_default':
                // Reset to plan default
                await onReset(user.user_id);
                return;
            case 'custom':
                limitValue = parseInt(customLimit, 10);
                if (isNaN(limitValue) || limitValue < 1) {
                    return; // Invalid input
                }
                break;
            default:
                return;
        }

        await onSave(user.user_id, limitValue);
    };

    if (!user) return null;

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit AI Limit</DialogTitle>
                    <DialogDescription>
                        Set AI daily limit for <strong>{user.email}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <div className="text-sm text-muted-foreground">
                        Current plan: <strong>{user.plan_name}</strong>
                        <br />
                        Current usage: <strong>{user.ai_daily_usage}</strong> / {user.ai_daily_credit_limit === -1 ? '∞' : user.ai_daily_credit_limit}
                    </div>

                    <RadioGroup value={limitType} onValueChange={(v) => setLimitType(v as LimitType)}>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="plan_default" id="plan_default" />
                            <Label htmlFor="plan_default">Plan Default</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="unlimited" id="unlimited" />
                            <Label htmlFor="unlimited">Unlimited</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="disabled" id="disabled" />
                            <Label htmlFor="disabled">Disabled (0)</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <RadioGroupItem value="custom" id="custom" />
                            <Label htmlFor="custom">Custom Limit</Label>
                        </div>
                    </RadioGroup>

                    {limitType === 'custom' && (
                        <div className="space-y-2">
                            <Label htmlFor="customLimit">Daily Limit</Label>
                            <Input
                                id="customLimit"
                                type="number"
                                min="1"
                                value={customLimit}
                                onChange={(e) => setCustomLimit(e.target.value)}
                                placeholder="e.g., 100"
                            />
                        </div>
                    )}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
