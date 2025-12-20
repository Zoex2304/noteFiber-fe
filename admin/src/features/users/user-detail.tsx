import { useParams } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@admin/components/ui/card';
import { Skeleton } from '@admin/components/ui/skeleton';
import { Badge } from '@admin/components/ui/badge';
import { Progress } from '@admin/components/ui/progress';
import { adminUsersApi } from '@admin/lib/api/admin-api';
import { useQuery } from '@tanstack/react-query';
import { User, Calendar, Mail, Shield, Activity } from 'lucide-react';
import { cn } from '@admin/lib/utils';

export function UserDetail() {
    const { userId } = useParams({ strict: false });

    const { data: user, isLoading, error } = useQuery({
        queryKey: ['admin', 'user', userId],
        queryFn: () => adminUsersApi.getUserDetail(userId as string),
        enabled: !!userId,
    });

    if (isLoading) {
        return (
            <div className="space-y-4 p-6">
                <Skeleton className="h-8 w-64" />
                <div className="grid gap-4 md:grid-cols-2">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32" />
                    ))}
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="flex h-96 items-center justify-center">
                <div className="text-center">
                    <h3 className="text-lg font-semibold">User not found</h3>
                    <p className="text-muted-foreground">
                        Unable to load user details. Please try again.
                    </p>
                </div>
            </div>
        );
    }

    const tokenPercentage = user.ai_daily_usage > 0
        ? Math.min((user.ai_daily_usage / 100) * 100, 100)
        : 0;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active':
                return 'bg-green-500';
            case 'pending':
                return 'bg-yellow-500';
            case 'blocked':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">{user.full_name}</h1>
                    <p className="text-muted-foreground">{user.email}</p>
                </div>
                <Badge className={cn('capitalize', getStatusColor(user.status))}>
                    {user.status}
                </Badge>
            </div>

            {/* User Info Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Email</CardTitle>
                        <Mail className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm">{user.email}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Role</CardTitle>
                        <Shield className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm capitalize">{user.role}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Status</CardTitle>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm capitalize">{user.status}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Joined</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm">
                            {new Date(user.created_at).toLocaleDateString()}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* AI Token Usage */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                AI Token Usage
                            </CardTitle>
                            <CardDescription>
                                Daily AI request usage tracking
                            </CardDescription>
                        </div>
                        <Badge variant="outline" className="text-lg">
                            {user.ai_daily_usage} requests today
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Usage Progress</span>
                            <span className="font-medium">{tokenPercentage.toFixed(1)}%</span>
                        </div>
                        <Progress value={tokenPercentage} className="h-2" />
                    </div>
                    <div className="grid gap-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Requests today:</span>
                            <span className="font-medium">{user.ai_daily_usage}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            Note: Token limit depends on user's subscription plan
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
