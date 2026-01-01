/**
 * RefundDetail Page
 * 
 * Displays details of a specific refund request.
 * Accessed via notification deep linking.
 */

import { useEffect, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadui/card';
import { Button } from '@/components/shadui/button';
import { Badge } from '@/components/shadui/badge';
import { Skeleton } from '@/components/shadui/skeleton';
import { MoveLeft, Clock, CheckCircle, XCircle, DollarSign, Calendar, FileText } from 'lucide-react';
import { refundService } from '@/api/services/refund/refund.service';
import type { UserRefund } from '@/api/services/refund/refund.types';

const STATUS_CONFIG = {
    pending: {
        label: 'Pending',
        icon: Clock,
        variant: 'secondary' as const,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
    },
    approved: {
        label: 'Approved',
        icon: CheckCircle,
        variant: 'default' as const,
        color: 'text-green-600',
        bgColor: 'bg-green-50 dark:bg-green-900/20',
    },
    rejected: {
        label: 'Rejected',
        icon: XCircle,
        variant: 'destructive' as const,
        color: 'text-red-600',
        bgColor: 'bg-red-50 dark:bg-red-900/20',
    },
};

export function RefundDetail() {
    const { refundId } = useParams({ from: '/_authenticated/refunds/$refundId' });
    const [refund, setRefund] = useState<UserRefund | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchRefund = async () => {
            setIsLoading(true);
            try {
                const response = await refundService.getMyRefunds();
                if (response.success && response.data) {
                    const found = response.data.find(r => r.id === refundId);
                    if (found) {
                        setRefund(found);
                    } else {
                        setError('Refund request not found');
                    }
                } else {
                    setError('Failed to load refund details');
                }
            } catch {
                setError('Failed to load refund details');
            } finally {
                setIsLoading(false);
            }
        };
        fetchRefund();
    }, [refundId]);

    const handleBack = () => {
        // Use browser history back for natural navigation
        window.history.back();
    };

    if (isLoading) {
        return (
            <div className="container max-w-2xl py-8">
                <Skeleton className="h-8 w-32 mb-6" />
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-48" />
                        <Skeleton className="h-4 w-64 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-20 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error || !refund) {
        return (
            <div className="container max-w-2xl py-8">
                <Button variant="ghost" onClick={handleBack} className="mb-6">
                    <MoveLeft className="mr-2 h-4 w-4" />
                    Back to Subscription
                </Button>
                <Card>
                    <CardContent className="py-12 text-center">
                        <XCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">Refund Not Found</h3>
                        <p className="text-muted-foreground">
                            {error || 'The refund request you\'re looking for doesn\'t exist.'}
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const statusConfig = STATUS_CONFIG[refund.status];
    const StatusIcon = statusConfig.icon;

    return (
        <div className="container max-w-2xl py-8">
            <Button variant="ghost" onClick={handleBack} className="mb-6">
                <MoveLeft className="mr-2 h-4 w-4" />
                Back to Subscription
            </Button>

            <Card>
                <CardHeader className={statusConfig.bgColor}>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                Refund Request
                                <Badge variant={statusConfig.variant}>
                                    <StatusIcon className="mr-1 h-3 w-3" />
                                    {statusConfig.label}
                                </Badge>
                            </CardTitle>
                            <CardDescription className="mt-1">
                                Request ID: {refund.id.slice(0, 8)}...
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    {/* Status Message */}
                    <div className={`p-4 rounded-lg ${statusConfig.bgColor}`}>
                        <div className={`flex items-center gap-2 ${statusConfig.color} font-medium`}>
                            <StatusIcon className="h-5 w-5" />
                            {refund.status === 'pending' && 'Your refund request is being reviewed by our team.'}
                            {refund.status === 'approved' && 'Your refund has been approved. The amount will be credited shortly.'}
                            {refund.status === 'rejected' && 'Your refund request was not approved.'}
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Amount</p>
                                <p className="font-semibold">${refund.amount.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Plan</p>
                                <p className="font-semibold">{refund.plan_name}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 sm:col-span-2">
                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Requested On</p>
                                <p className="font-semibold">
                                    {new Date(refund.created_at).toLocaleDateString('en-US', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="border-t pt-4">
                        <h4 className="font-medium mb-2">Reason for Refund</h4>
                        <p className="text-muted-foreground bg-muted/50 p-3 rounded-lg">
                            {refund.reason}
                        </p>
                    </div>

                    {/* Help Text */}
                    {refund.status === 'pending' && (
                        <div className="border-t pt-4">
                            <p className="text-sm text-muted-foreground">
                                Refund requests are typically processed within 3-5 business days.
                                You'll receive a notification once your request has been reviewed.
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
