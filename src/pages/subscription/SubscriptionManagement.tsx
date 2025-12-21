import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/shadui/card';
import { Button } from '@/components/shadui/button';
import { Badge } from '@/components/shadui/badge';
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
import { Check, CreditCard, Calendar, Zap, MoveLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';
import { RefundRequestModal } from './RefundRequestModal';
import { ActionTooltip } from '@/components/common/ActionTooltip';

export function SubscriptionManagement() {
    const { planName, isActive, features, tokenUsage, subscriptionId, refreshSubscription } = useSubscription();
    const navigate = useNavigate();
    const router = useRouter();
    const [refundModalOpen, setRefundModalOpen] = useState(false);

    const handleCancelSubscription = async () => {
        try {
            // TODO: Implement cancel subscription API call
            // await paymentService.cancelSubscription();
            toast.success('Cancellation request submitted. Our team will process it shortly.');
        } catch (error) {
            toast.error('Failed to submit cancellation request. Please contact support.');
        }
    };

    const handleRefundSuccess = () => {
        refreshSubscription();
    };

    return (
        <div className="container max-w-4xl mx-auto p-6 space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-4">
                <ActionTooltip label="Go Back">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => router.history.go(-1)}
                        className="h-10 w-10 shrink-0 rounded-full border-gray-200"
                    >
                        <MoveLeft className="h-5 w-5" />
                    </Button>
                </ActionTooltip>
                <div>
                    <h1 className="text-3xl font-bold">Subscription Management</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your subscription, billing, and plan details
                    </p>
                </div>
            </div>

            {/* Content Indented to Align with Title */}
            <div className="space-y-6 ml-14">
                {/* Current Plan */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-2xl">{planName}</CardTitle>
                                <CardDescription>
                                    {isActive ? 'Active Subscription' : 'No Active Subscription'}
                                </CardDescription>
                            </div>
                            <Badge variant={isActive ? 'default' : 'secondary'} className="text-sm px-3 py-1">
                                {isActive ? 'Active' : 'Inactive'}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* Features */}
                        <div>
                            <h3 className="font-semibold mb-3 flex items-center gap-2">
                                <Check className="h-5 w-5 text-green-600" />
                                Plan Features
                            </h3>
                            <ul className="space-y-2 ml-7">
                                <li className="flex items-center gap-2 text-sm">
                                    <Check className="h-4 w-4 text-green-600" />
                                    <span>
                                        {features.max_notes === 0
                                            ? 'Unlimited notes'
                                            : `Up to ${features.max_notes} notes`}
                                    </span>
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    {features.semantic_search ? (
                                        <>
                                            <Check className="h-4 w-4 text-green-600" />
                                            <span>Semantic search enabled</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="h-4 w-4" />
                                            <span className="text-muted-foreground">Semantic search not available</span>
                                        </>
                                    )}
                                </li>
                                <li className="flex items-center gap-2 text-sm">
                                    {features.ai_chat ? (
                                        <>
                                            <Check className="h-4 w-4 text-green-600" />
                                            <span>AI chat access</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="h-4 w-4" />
                                            <span className="text-muted-foreground">AI chat not available</span>
                                        </>
                                    )}
                                </li>
                                {features.daily_token_limit > 0 && (
                                    <li className="flex items-center gap-2 text-sm">
                                        <Zap className="h-4 w-4 text-yellow-600" />
                                        <span>
                                            {tokenUsage.dailyUsed} / {tokenUsage.dailyLimit} AI requests used today
                                        </span>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* Billing Info Placeholder */}
                        <div className="border-t pt-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>Billing cycle: Monthly</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                                <CreditCard className="h-4 w-4" />
                                <span>Next billing date: {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col sm:flex-row gap-3">
                        <Button
                            onClick={() => navigate({ to: '/pricing' })}
                            className="w-full sm:w-auto"
                        >
                            Upgrade Plan
                        </Button>
                        {isActive && planName !== 'Free Plan' && (
                            <>
                                <Button
                                    variant="outline"
                                    className="w-full sm:w-auto"
                                    onClick={() => setRefundModalOpen(true)}
                                >
                                    Request Refund
                                </Button>

                                <RefundRequestModal
                                    open={refundModalOpen}
                                    onOpenChange={setRefundModalOpen}
                                    subscriptionId={subscriptionId}
                                    planName={planName}
                                    onSuccess={handleRefundSuccess}
                                />

                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="destructive" className="w-full sm:w-auto">
                                            Cancel Subscription
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Cancel Subscription</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to cancel your subscription?
                                                You'll lose access to premium features at the end of your current billing period.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={handleCancelSubscription}
                                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                            >
                                                Yes, Cancel
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </>
                        )}
                    </CardFooter>
                </Card>

                {/* Help Card */}
                <Card>
                    <CardHeader>
                        <CardTitle>Need Help?</CardTitle>
                        <CardDescription>
                            Contact our support team for assistance
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            For billing questions, refund status, or subscription changes,
                            please contact us at{' '}
                            <a href="mailto:support@notefiber.com" className="text-primary hover:underline">
                                support@notefiber.com
                            </a>
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* DEBUG OVERLAY */}
            <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs z-50 font-mono">
                <p>Plan: {planName}</p>
                <p>Active: {String(isActive)}</p>
                <p>Sub ID: {subscriptionId || 'NULL'}</p>
            </div>
        </div>
    );
}
