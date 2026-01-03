import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/shadui/card';
import { Button } from '@/components/shadui/button';
import { Badge } from '@/components/shadui/badge';
import { Skeleton } from '@/components/shadui/skeleton';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/shadui/alert-dialog';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { useNavigate, useRouter } from '@tanstack/react-router';
import { Check, Calendar, Zap, MoveLeft, Database, Search, Crown } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { RefundRequestModal } from './RefundRequestModal';
import { ActionTooltip } from '@/components/common/ActionTooltip';
import { refundService } from '@/api/services/refund/refund.service';
import { cn } from '@/lib/utils';
import { TokenUsageIndicator } from '@/components/common/TokenUsageIndicator';
import { Progress } from '@/components/shadui/progress';

export function SubscriptionManagement() {
    const { planName, isActive, features, tokenUsage, subscriptionId, refreshSubscription, isLoading } = useSubscription();
    const navigate = useNavigate();
    const router = useRouter();
    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [hasPendingRefund, setHasPendingRefund] = useState(false);

    // Check for pending refund
    useEffect(() => {
        const checkPendingRefund = async () => {
            try {
                const response = await refundService.getMyRefunds();
                if (response.success && response.data) {
                    const pending = response.data.some(r => r.status === 'pending');
                    setHasPendingRefund(pending);
                }
            } catch {
                // Silent error
            }
        };

        if (subscriptionId) {
            checkPendingRefund();
        }

        const handleRefundStatusChange = () => {
            checkPendingRefund();
        };
        window.addEventListener('refund:status_changed', handleRefundStatusChange);
        return () => window.removeEventListener('refund:status_changed', handleRefundStatusChange);
    }, [subscriptionId]);

    const handleCancelSubscription = async () => {
        try {
            // Placeholder: await paymentService.cancelSubscription();
            toast.success('Cancellation request submitted.');
        } catch {
            toast.error('Failed to submit cancellation request.');
        }
    };

    const handleRefundClick = () => {
        if (hasPendingRefund) {
            toast.info('Refund pending approval.');
            return;
        }
        setRefundModalOpen(true);
    };

    if (isLoading) {
        return <div className="p-8 space-y-4 max-w-5xl mx-auto"><Skeleton className="h-48 w-full" /><Skeleton className="h-32 w-full" /></div>;
    }

    const isPaidPlan = planName.toLowerCase().includes('pro') || planName.toLowerCase().includes('enterprise');

    return (
        <div className="container max-w-5xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center gap-4">
                <ActionTooltip label="Go Back">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.history.go(-1)}
                        className="h-10 w-10 shrink-0 rounded-full hover:bg-gray-100"
                    >
                        <MoveLeft className="h-5 w-5 text-gray-600" />
                    </Button>
                </ActionTooltip>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Subscription</h1>
                    <p className="text-gray-500 mt-1">Manage your plan and billing details</p>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
                <div className={cn(
                    "absolute top-0 left-0 w-full h-1.5",
                    isActive ? "bg-gradient-primary-violet" : "bg-gray-200"
                )} />
                <div className="p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge variant={isActive ? 'default' : 'secondary'} className={cn(
                                "uppercase tracking-wider text-[10px] font-bold px-2 py-0.5 rounded-sm",
                                isActive ? "bg-royal-violet-base hover:bg-royal-violet-base" : "bg-gray-100 text-gray-500"
                            )}>
                                {isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            {hasPendingRefund && (
                                <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                                    Refund Pending
                                </Badge>
                            )}
                        </div>
                        <h2 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                            {planName}
                            {isPaidPlan && <Crown className="h-6 w-6 text-yellow-500 fill-yellow-100" />}
                        </h2>
                        <p className="text-gray-500 max-w-md">
                            {isPaidPlan
                                ? "You have access to all premium features including advanced AI chat and semantic search."
                                : "Upgrade to Pro to unlock advanced AI capabilities and unlimited notes."}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <Button
                            onClick={() => navigate({ to: '/pricing' })}
                            className="w-full sm:w-auto min-w-[140px] font-medium"
                        >
                            {(!isActive || !isPaidPlan) ? "Upgrade Plan" : "Change Plan"}
                        </Button>
                        {isPaidPlan && (
                            <Button
                                variant="outline"
                                onClick={handleRefundClick}
                                disabled={hasPendingRefund}
                                className="w-full sm:w-auto border-gray-200 text-gray-600 hover:text-gray-900"
                            >
                                Request Refund
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Usage Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Note Usage */}
                <Card className="shadow-sm border-gray-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            Note Storage
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-baseline justify-between">
                                <span className="text-2xl font-bold text-gray-900">
                                    {features.max_notes === 0 || features.max_notes > 9000 ? "Unlimited" : features.max_notes}
                                </span>
                                {features.max_notes > 0 && features.max_notes < 9000 && (
                                    <span className="text-sm text-gray-500">notes limit</span>
                                )}
                            </div>
                            {features.max_notes > 0 && features.max_notes < 9000 ? (
                                <Progress value={0} className="h-1.5" /> // We assume 0 used for now as per data limitation
                            ) : (
                                <div className="h-1.5 bg-green-100 rounded-full w-full overflow-hidden">
                                    <div className="bg-green-500 h-full w-full" />
                                </div>
                            )}
                            <p className="text-xs text-gray-400">
                                {features.max_notes > 9000 ? "Create as many notes as you need." : "Upgrade for more storage."}
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Chat Usage */}
                <Card className="shadow-sm border-gray-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Zap className="h-4 w-4" />
                            AI Chat Usage
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-baseline justify-between">
                                <span className="text-2xl font-bold text-gray-900">
                                    {tokenUsage.chat.percentage.toFixed(0)}%
                                </span>
                                <span className="text-sm text-gray-500">daily limit used</span>
                            </div>
                            <TokenUsageIndicator
                                dailyLimit={tokenUsage.chat.limit}
                                dailyUsed={tokenUsage.chat.used}
                                percentage={tokenUsage.chat.percentage}
                                showLabel={false}
                            />
                            <p className="text-xs text-gray-400">
                                Resets daily. Used {tokenUsage.chat.used} / {tokenUsage.chat.limit} tokens.
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Semantic Search */}
                <Card className="shadow-sm border-gray-100">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                            <Search className="h-4 w-4" />
                            Semantic Search
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "text-2xl font-bold",
                                    features.semantic_search ? "text-green-600" : "text-gray-400"
                                )}>
                                    {features.semantic_search ? "Active" : "Locked"}
                                </span>
                            </div>
                            <div className="h-1.5 w-full bg-gray-100 rounded-full">
                                {features.semantic_search && <div className="h-full bg-green-500 rounded-full w-full" />}
                            </div>
                            <p className="text-xs text-gray-400">
                                {features.semantic_search ? "Smart search is enabled." : "Upgrade to Pro to enable."}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Billing & Danger Zone */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-4">
                <div className="lg:col-span-2 space-y-6">
                    {/* Billing Info */}
                    <Card className="shadow-none border-0 bg-transparent">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h3>
                        <div className="bg-white border border-gray-100 rounded-xl p-6">
                            <div className="flex items-start gap-4">
                                <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                                    <Calendar className="h-5 w-5 text-orange-500" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900">Next Invoice</h4>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {isPaidPlan
                                            ? `Your next bill is scheduled for ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}.`
                                            : "You are on the Free plan. No upcoming charges."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="space-y-6">
                    {isPaidPlan && (
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Danger Zone</h3>
                            <Card className="border-red-100 bg-red-50/50 shadow-none">
                                <CardContent className="p-6">
                                    <h4 className="font-medium text-red-900 mb-2">Cancel Subscription</h4>
                                    <p className="text-sm text-red-700/80 mb-4">
                                        Lose access to premium features at the end of billing period.
                                    </p>
                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button variant="destructive" className="w-full bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:text-red-700 shadow-sm">
                                                Cancel Subscription
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Are you sure? You will lose access to premium features.
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                                                <AlertDialogAction onClick={handleCancelSubscription} className="bg-red-600 hover:bg-red-700">Yes, Cancel</AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                    <RefundRequestModal
                        open={refundModalOpen}
                        onOpenChange={setRefundModalOpen}
                        subscriptionId={subscriptionId}
                        planName={planName}
                        onSuccess={() => {
                            setHasPendingRefund(true);
                            refreshSubscription();
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
