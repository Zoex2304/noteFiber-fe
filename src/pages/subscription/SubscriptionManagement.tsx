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
import { Check, Calendar, Zap, MoveLeft, Database, Search, Crown, HardDrive, Sparkles, Book, X, RotateCcw } from 'lucide-react';

import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { RefundRequestModal } from './RefundRequestModal';
import { CancellationRequestModal } from './CancellationRequestModal';
import { CancellationHistorySection } from './CancellationHistorySection';
import { GradientPill } from '@/components/common/GradientPill';
import { ActionTooltip } from '@/components/common/ActionTooltip';
import { refundService } from '@/api/services/refund/refund.service';
import { cn } from '@/lib/utils';
import { TokenUsageIndicator } from '@/components/common/TokenUsageIndicator';
import { Progress } from '@/components/shadui/progress';
import HeaderGradient from '@/assets/images/common/header gradient_v2.svg';
import { motion } from 'framer-motion';
import { useSubscriptionStore } from '@/stores/useSubscriptionStore';
import { AnimatedCounter } from "@/components/common/AnimatedCounter";
import { getPlanDisplayFeatures, findPlanByName } from '@/utils/planUtils';

export function SubscriptionManagement() {
    const { planName, isActive, tokenUsage, subscriptionId, refreshSubscription, isLoading, validateSubscription, validationStatus } = useSubscription();
    // Access global plans
    const publicPlans = useSubscriptionStore(state => state.publicPlans);
    const fetchPublicPlans = useSubscriptionStore(state => state.fetchPublicPlans);

    const navigate = useNavigate();
    const router = useRouter();
    const [refundModalOpen, setRefundModalOpen] = useState(false);
    const [cancellationModalOpen, setCancellationModalOpen] = useState(false);
    const [hasPendingRefund, setHasPendingRefund] = useState(false);

    useEffect(() => {
        fetchPublicPlans();
        validateSubscription();
    }, [fetchPublicPlans, validateSubscription]);

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

    const handleCancelClick = () => {
        setCancellationModalOpen(true);
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
    const isCanceledButValid = validationStatus?.is_valid && validationStatus?.status === 'canceled';
    const displayActive = isActive || isCanceledButValid;

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
                    <p className="text-gray-500 mt-1">Manage your plan usage and details</p>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-soft-purple shadow-sm">
                <img
                    src={HeaderGradient}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
                />

                <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Badge variant={displayActive ? 'default' : 'secondary'} className={cn(
                                "uppercase tracking-wider text-[10px] font-bold px-2 py-0.5 rounded-sm",
                                displayActive ? "bg-royal-violet-base hover:bg-royal-violet-base" : "bg-gray-100 text-gray-500",
                                isCanceledButValid && "bg-orange-500 hover:bg-orange-600"
                            )}>
                                {isCanceledButValid ? 'Active (Canceled)' : (displayActive ? 'Active' : 'Inactive')}
                            </Badge>
                            {hasPendingRefund && (
                                <Badge variant="outline" className="text-yellow-600 border-yellow-200">
                                    Refund Pending
                                </Badge>
                            )}
                        </div>
                        <h2 className="text-4xl font-bold text-[#0F0538] mb-2 flex items-center gap-3">
                            {planName}
                            {isPaidPlan && <Crown className="h-6 w-6 text-yellow-500 fill-yellow-100" />}
                        </h2>
                        <p className="text-[#4B3E8E] max-w-md font-medium">
                            {isPaidPlan
                                ? "You have access to all premium features including advanced AI chat and semantic search."
                                : "Upgrade to Pro to unlock advanced AI capabilities and unlimited notes."}
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <GradientPill
                            onClick={() => navigate({ to: '/pricing' })}
                            className="w-full sm:w-auto min-w-[140px]"
                            icon={(!displayActive || !isPaidPlan) ? <Crown className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                            size="lg"
                        >
                            {(!displayActive || !isPaidPlan) ? "Upgrade Plan" : (isCanceledButValid ? "Renew Plan" : "Change Plan")}
                        </GradientPill>
                        {isPaidPlan && (
                            <GradientPill
                                onClick={handleRefundClick}
                                variant="invert"
                                animation="none"
                                className="w-full sm:w-auto"
                                showGlow={false}
                                icon={<RotateCcw className="h-4 w-4" />}
                                size="lg"
                            >
                                Request Refund
                            </GradientPill>
                        )}
                    </div>
                </div>
            </div>

            {/* SECTION 1: Usage KPIs (Usage & Limits) */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <HardDrive className="h-5 w-5 text-gray-500" />
                    Usage & Limits
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

                    {/* AI Chat Tokens */}
                    <Card className="shadow-sm border-gray-100 bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <Zap className="h-4 w-4" />
                                AI Chat Tokens
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-baseline justify-between">
                                    <AnimatedCounter
                                        value={tokenUsage.chat?.percentage || 0}
                                        initialValue={100}
                                        formatter={(v) => `${v}%`}
                                        className="text-2xl font-bold text-gray-900"
                                    />
                                    <span className="text-sm text-gray-500">daily used</span>
                                </div>
                                <TokenUsageIndicator
                                    dailyLimit={tokenUsage.chat.limit}
                                    dailyUsed={tokenUsage.chat.used}
                                    percentage={tokenUsage.chat.percentage}
                                    showLabel={false}
                                />
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>{tokenUsage.chat.used.toLocaleString()} used</span>
                                    <span>{tokenUsage.chat.limit === -1 ? '∞' : tokenUsage.chat.limit.toLocaleString()} limit</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Search Tokens */}
                    <Card className="shadow-sm border-gray-100 bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <Search className="h-4 w-4" />
                                Search Tokens
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-baseline justify-between">
                                    <AnimatedCounter
                                        value={tokenUsage.search?.percentage || 0}
                                        initialValue={100}
                                        formatter={(v) => `${v}%`}
                                        className="text-2xl font-bold text-gray-900"
                                    />
                                    <span className="text-sm text-gray-500">daily used</span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-blue-500 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.min(100, tokenUsage.search?.percentage || 0)}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>{tokenUsage.search?.used?.toLocaleString() || 0} used</span>
                                    <span>{tokenUsage.search?.limit === -1 ? '∞' : (tokenUsage.search?.limit?.toLocaleString() || 0)} limit</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Note Storage */}
                    <Card className="shadow-sm border-gray-100 bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <Database className="h-4 w-4" />
                                Note Storage
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-baseline justify-between">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {tokenUsage.storage?.notes?.limit === -1 || tokenUsage.storage?.notes?.limit > 9000 ? (
                                            "Active"
                                        ) : (
                                            <AnimatedCounter
                                                value={tokenUsage.storage?.notes?.percentage || 0}
                                                initialValue={100}
                                                formatter={(v) => `${v}%`}
                                            />
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {tokenUsage.storage?.notes?.limit > 9000 ? "Unlimited" : "used"}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        className={cn("h-full rounded-full", tokenUsage.storage?.notes?.limit > 9000 ? "bg-green-500" : "bg-purple-500")}
                                        initial={{ width: 0 }}
                                        animate={{ width: tokenUsage.storage?.notes?.limit > 9000 ? "100%" : `${Math.min(100, tokenUsage.storage?.notes?.percentage || 0)}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>{tokenUsage.storage?.notes?.used?.toLocaleString() || 0} notes</span>
                                    <span>{tokenUsage.storage?.notes?.limit === -1 || tokenUsage.storage?.notes?.limit > 9000 ? '∞' : tokenUsage.storage?.notes?.limit?.toLocaleString()} limit</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Notebook Storage */}
                    <Card className="shadow-sm border-gray-100 bg-white">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                <Book className="h-4 w-4" />
                                Notebooks
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-baseline justify-between">
                                    <div className="text-2xl font-bold text-gray-900">
                                        {tokenUsage.storage?.notebooks?.limit === -1 || tokenUsage.storage?.notebooks?.limit > 9000 ? (
                                            "Active"
                                        ) : (
                                            <AnimatedCounter
                                                value={tokenUsage.storage?.notebooks?.percentage || 0}
                                                initialValue={100}
                                                formatter={(v) => `${v}%`}
                                            />
                                        )}
                                    </div>
                                    <span className="text-sm text-gray-500">
                                        {tokenUsage.storage?.notebooks?.limit > 9000 ? "Unlimited" : "used"}
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                                    <motion.div
                                        className={cn("h-full rounded-full", tokenUsage.storage?.notebooks?.limit > 9000 ? "bg-green-500" : "bg-orange-500")}
                                        initial={{ width: 0 }}
                                        animate={{ width: tokenUsage.storage?.notebooks?.limit > 9000 ? "100%" : `${Math.min(100, tokenUsage.storage?.notebooks?.percentage || 0)}%` }}
                                        transition={{ duration: 1, ease: "easeOut" }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>{tokenUsage.storage?.notebooks?.used?.toLocaleString() || 0} notebooks</span>
                                    <span>{tokenUsage.storage?.notebooks?.limit === -1 || tokenUsage.storage?.notebooks?.limit > 9000 ? '∞' : tokenUsage.storage?.notebooks?.limit?.toLocaleString()} limit</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </div>
            </div>


            {/* SECTION 2: Included in Plan (Static Features) */}
            <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    Included in {planName}
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-4 gap-x-8">
                    {publicPlans.length === 0 ? (
                        // Loading State
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <div className="space-y-1">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                        ))
                    ) : (
                        // Real Data
                        (findPlanByName(publicPlans, planName)
                            ? getPlanDisplayFeatures(findPlanByName(publicPlans, planName)!)
                            : []
                        ).map((text, idx) => (
                            <div key={idx} className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-green-50 text-green-600">
                                    <Check className="h-4 w-4" />
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900">{text}</p>
                                    <p className="text-xs text-gray-500">Included</p>
                                </div>
                            </div>
                        ))
                    )}

                    {/* Fallback if no matching plan found */}
                    {publicPlans.length > 0 && !findPlanByName(publicPlans, planName) && (
                        <div className="col-span-full text-center text-gray-500 py-4">
                            <p>Plan details not available for {planName}.</p>
                        </div>
                    )}
                </div>
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
                                        Request to cancel your subscription. Your request will be reviewed.
                                    </p>
                                    <Button
                                        variant="destructive"
                                        onClick={handleCancelClick}
                                        className="w-full bg-white text-red-600 border border-red-200 hover:bg-red-50 hover:text-red-700 shadow-sm"
                                    >
                                        Request Cancellation
                                    </Button>
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
                    <CancellationRequestModal
                        open={cancellationModalOpen}
                        onOpenChange={setCancellationModalOpen}
                        subscriptionId={subscriptionId}
                        planName={planName}
                        onSuccess={() => {
                            refreshSubscription();
                        }}
                    />
                </div>
            </div>

            {/* Cancellation History */}
            <CancellationHistorySection />
        </div>
    );
}
