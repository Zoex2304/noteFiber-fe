import { useParams } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shadui/card';
import { Button } from '@/components/shadui/button';
import { Badge } from '@/components/shadui/badge';
import { Skeleton } from '@/components/shadui/skeleton';
import { MoveLeft, Zap, CheckCircle, Calendar, FileText, User } from 'lucide-react';
import { useSubscription } from '@/contexts/SubscriptionContext';

export function UserLimitDetail() {
    const { userId } = useParams({ from: '/_authenticated/users/$userId' });
    const { isActive, planName, tokenUsage, isLoading } = useSubscription();

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

    // Determine limit status
    const isUnlimited = tokenUsage.dailyLimit === -1;
    const limitDisplay = isUnlimited ? 'Unlimited' : tokenUsage.dailyLimit.toLocaleString();
    const usedDisplay = tokenUsage.dailyUsed.toLocaleString();

    return (
        <div className="container max-w-2xl py-8">
            <Button variant="ghost" onClick={handleBack} className="mb-6">
                <MoveLeft className="mr-2 h-4 w-4" />
                Back
            </Button>

            <Card>
                <CardHeader className="bg-purple-50 dark:bg-purple-900/20">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                AI Limit Status
                                <Badge variant={isActive ? 'default' : 'secondary'} className={isActive ? "bg-emerald-600 hover:bg-emerald-700" : ""}>
                                    <CheckCircle className="mr-1 h-3 w-3" />
                                    {isActive ? 'Active' : 'Inactive'}
                                </Badge>
                            </CardTitle>
                            <CardDescription className="mt-1">
                                User ID: {userId}
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6 space-y-6">
                    {/* Status Message */}
                    <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                        <div className="flex items-center gap-2 text-purple-700 dark:text-purple-300 font-medium">
                            <Zap className="h-5 w-5" />
                            Your AI daily limit has been updated.
                        </div>
                    </div>

                    {/* Details Grid */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Daily Token Limit</p>
                                <p className="font-semibold text-2xl">{limitDisplay}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Current Plan</p>
                                <p className="font-semibold capitalize">{planName}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Last Usage</p>
                                <p className="font-semibold">{usedDisplay} tokens used today</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                            <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                            <div>
                                <p className="text-sm text-muted-foreground">Account Status</p>
                                <p className="font-semibold">{isActive ? 'Good Standing' : 'Inactive'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Help Text */}
                    <div className="border-t pt-4">
                        <p className="text-sm text-muted-foreground">
                            Limits reset daily at midnight. If you need more tokens, consider upgrading your plan.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
