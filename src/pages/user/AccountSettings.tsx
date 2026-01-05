import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUpdateProfile } from "@/hooks/user/useUpdateProfile";
import { useDeleteAccount } from "@/hooks/user/useDeleteAccount";
import { useAuth } from "@/hooks/auth/useAuth";
import { apiClient } from "@/api/client/axios.client";
import { userService } from "@/api/services/user/user.service";
import { Button } from "@/components/shadui/button";
import { ActionTooltip } from "@/components/common/ActionTooltip";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/shadui/form";
import { Input } from "@/components/shadui/input";
import { Skeleton } from "@/components/shadui/skeleton";
import { Loader2, MoveLeft, User, Shield, AlertTriangle, Copy, Check, Eye, EyeOff, Sparkles } from "lucide-react";
import { useRouter, Link } from "@tanstack/react-router";
import { AvatarUploader } from "@/components/common/AvatarUploader";
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
} from "@/components/shadui/alert-dialog";
import { PlanStatusPill } from "@/components/common/PlanStatusPill";
import { TokenUsagePill } from "@/components/common/TokenUsagePill";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shadui/card";
import { BillingInfoCard } from "@/components/user/BillingInfoCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/shadui/tabs";
import HeaderGradient from '@/assets/images/common/header gradient_v2.svg';
import { toast } from "sonner"; // Fixed: imported toast
import { useSubscriptionStore } from "@/stores/useSubscriptionStore";

const profileSchema = z.object({
    full_name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

function UserIdDisplay({ id }: { id: string }) {
    const [showFull, setShowFull] = React.useState(false);
    const [copied, setCopied] = React.useState(false);

    const handleCopy = (e: React.MouseEvent) => {
        e.stopPropagation();
        navigator.clipboard.writeText(id);
        setCopied(true);
        toast.success("ID copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const toggleShow = () => setShowFull(!showFull);

    return (
        <div className="flex items-center gap-1 bg-gray-50 border border-gray-100 rounded-lg px-2 py-0.5 shadow-sm hover:shadow-md transition-shadow">
            <div
                className="font-mono text-xs text-gray-600 cursor-pointer select-all min-w-[80px]"
                onClick={toggleShow}
                title={showFull ? "Click to hide" : "Click to reveal"}
            >
                {showFull ? id : `${id.slice(0, 8)}••••`}
            </div>

            <div className="flex items-center border-l border-gray-200 pl-1 ml-1 space-x-0.5">
                <ActionTooltip label={showFull ? "Hide ID" : "Show ID"}>
                    <button
                        onClick={toggleShow}
                        className="p-1 hover:bg-gray-200 rounded-md transition-colors text-gray-400 hover:text-gray-700"
                    >
                        {showFull ? (
                            <EyeOff className="h-3 w-3" />
                        ) : (
                            <Eye className="h-3 w-3" />
                        )}
                    </button>
                </ActionTooltip>

                <ActionTooltip label="Copy ID">
                    <button
                        onClick={handleCopy}
                        className="p-1 hover:bg-gray-200 rounded-md transition-colors text-gray-400 hover:text-gray-700"
                    >
                        {copied ? (
                            <Check className="h-3 w-3 text-green-600" />
                        ) : (
                            <Copy className="h-3 w-3" />
                        )}
                    </button>
                </ActionTooltip>
            </div>
        </div>
    );
}

export default function AccountSettings() {
    const { user, updateUser } = useAuth();
    const router = useRouter();
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
    const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();
    const { checkPermission } = useSubscriptionStore();

    const canUseChat = checkPermission('ai_chat');
    const canUseSearch = checkPermission('semantic_search');

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: user?.full_name || "",
        },
    });

    function onSubmit(data: ProfileFormValues) {
        updateProfile(data, {
            onSuccess: () => {
                toast.success("Profile updated successfully");
            },
            onError: () => {
                toast.error("Failed to update profile");
            }
        });
    }

    const handleAvatarUpload = async (blob: Blob) => {
        const formData = new FormData();
        formData.append('avatar', blob, 'avatar.jpg');

        try {
            const response = await apiClient.post(`/user/avatar`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (response.data && response.data.user) {
                updateUser(response.data.user);
            } else {
                const profileResponse = await userService.getProfile();
                if (profileResponse.success && profileResponse.data) {
                    updateUser(profileResponse.data);
                }
            }
            toast.success("Avatar updated successfully");
        } catch (error) {
            console.error(error);
            toast.error("Failed to upload avatar");
        }
    };

    return (
        <div className="min-h-screen bg-transparent pb-10">
            {/* Header Hero */}
            <div className="relative h-48 sm:h-64 w-full">
                <div className="absolute inset-0 bg-soft-purple overflow-hidden">
                    <img
                        src={HeaderGradient}
                        alt="Profile Banner"
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>

            <div className="container max-w-6xl mx-auto px-4 sm:px-6">
                {/* Profile Identity Section (Overlapping) */}
                <div className="relative -mt-16 sm:-mt-20 mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6 text-center sm:text-left">
                        {/* Avatar with Ring */}
                        <div className="relative group shrink-0">
                            <div className="h-32 w-32 sm:h-40 sm:w-40 rounded-full ring-4 ring-white shadow-lg bg-white overflow-hidden flex items-center justify-center">
                                <AvatarUploader
                                    currentAvatarUrl={user?.avatar_url}
                                    onUpload={handleAvatarUpload}
                                    className="w-full h-full"
                                />
                            </div>
                        </div>

                        {/* Actions (Right Aligned) - Now in same row as Avatar */}
                        <div className="pb-4 flex items-center gap-2">
                            <ActionTooltip label="Go Back">
                                <Button variant="outline" size="sm" onClick={() => router.history.go(-1)}>
                                    <MoveLeft className="h-4 w-4 mr-2" />
                                    Back
                                </Button>
                            </ActionTooltip>
                        </div>
                    </div>

                    {/* User Info - New Row Below Avatar */}
                    <div className="mt-4 pb-4 space-y-2 text-center sm:text-left">
                        {user ? (
                            <>
                                <h1 className="text-3xl font-bold text-gray-900 leading-tight">{user.full_name}</h1>
                                <p className="text-muted-foreground font-medium">{user.email}</p>
                            </>
                        ) : (
                            <div className="space-y-2 flex flex-col items-center sm:items-start">
                                <Skeleton className="h-9 w-48" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                        )}

                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                            <PlanStatusPill />

                            {/* Divider - only visible if user is loaded to avoid jumping */}
                            {user && <span className="text-gray-300 hidden sm:inline">|</span>}

                            {/* User ID Section */}
                            {user ? (
                                <div className="flex items-center text-sm font-medium text-gray-500">
                                    <span className="mr-2 font-mono">ID:</span>
                                    <UserIdDisplay id={user.id} />
                                </div>
                            ) : (
                                <Skeleton className="h-6 w-32 ml-2" />
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs Navigation */}
                <Tabs defaultValue="profile" className="w-full space-y-8">
                    <TabsList className="w-full sm:w-auto grid grid-cols-3 h-auto p-1 bg-gray-100/80 backdrop-blur-sm rounded-xl">
                        <TabsTrigger value="profile" className="py-2.5 data-[state=active]:bg-gradient-primary-violet data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all">
                            <User className="h-4 w-4 mr-2" />
                            Profile
                        </TabsTrigger>
                        <TabsTrigger value="billing" className="py-2.5 data-[state=active]:bg-gradient-primary-violet data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all">
                            <Shield className="h-4 w-4 mr-2" />
                            Billing
                        </TabsTrigger>
                        <TabsTrigger value="account" className="py-2.5 data-[state=active]:bg-gradient-primary-violet data-[state=active]:text-white data-[state=active]:shadow-md rounded-lg transition-all">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Account
                        </TabsTrigger>
                    </TabsList>

                    {/* Content Area */}

                    {/* ... (Keep existing content structure) ... */}

                    {/* Sidebar Usage Update */}
                    {/* Replacing the entire Tabs content block isn't efficient, I'll targeting just the Grid Layout or Sidebar part if I can match it, but context is large. 
                           I will target the usage sidebar specifically if I can find unique context.
                           Actually I will reuse "grid grid-cols-1 lg:grid-cols-3 gap-8" as anchor.
                        */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content (2 cols) */}
                        <div className="lg:col-span-2 space-y-6">

                            {/* TAB: PROFILE */}
                            <TabsContent value="profile" className="space-y-6 m-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Card className="shadow-sm border-gray-100">
                                    <CardHeader>
                                        <CardTitle>Personal Information</CardTitle>
                                        <CardDescription>Update your public profile details.</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <Form {...form}>
                                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                                                <FormField
                                                    control={form.control}
                                                    name="full_name"
                                                    render={({ field }) => (
                                                        <FormItem>
                                                            <FormLabel>Full Name</FormLabel>
                                                            <FormControl>
                                                                <Input placeholder="Your name" {...field} className="max-w-md" />
                                                            </FormControl>
                                                            <FormDescription>This name will be displayed on your profile.</FormDescription>
                                                            <FormMessage />
                                                        </FormItem>
                                                    )}
                                                />
                                                <div className="flex justify-start">
                                                    <Button type="submit" disabled={isUpdating}>
                                                        {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                                        Save Changes
                                                    </Button>
                                                </div>
                                            </form>
                                        </Form>
                                    </CardContent>
                                </Card>
                            </TabsContent>

                            {/* TAB: BILLING */}
                            <TabsContent value="billing" className="space-y-6 m-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <BillingInfoCard />
                            </TabsContent>

                            {/* TAB: ACCOUNT */}
                            <TabsContent value="account" className="space-y-6 m-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <Card className="border-red-100 bg-red-50/30 shadow-none">
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2 text-red-700 text-lg">
                                            <AlertTriangle className="h-5 w-5" />
                                            Danger Zone
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <h4 className="font-medium text-gray-900">Delete Account</h4>
                                                <p className="text-sm text-gray-500">Permanently delete your account and all data.</p>
                                            </div>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">Delete Account</Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete your
                                                            account and remove your data from our servers.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => deleteAccount()}
                                                            className="bg-red-600 hover:bg-red-700 disabled:opacity-50"
                                                            disabled={isDeleting}
                                                        >
                                                            {isDeleting ? "Deleting..." : "Delete Account"}
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>

                        {/* Sidebar Column */}
                        <div className="space-y-6">
                            <Card className="shadow-sm border-gray-100 bg-gray-50/50 sticky top-6">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-lg">
                                        <Shield className="h-5 w-5 text-royal-violet-base" />
                                        Usage Overview
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-4">
                                        {/* Storage Usage (Available for all plans) */}
                                        <div>
                                            <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Storage</label>
                                            <div className="space-y-2 mt-1.5">
                                                <TokenUsagePill type="notes" className="w-full" />
                                                <TokenUsagePill type="notebooks" className="w-full" />
                                            </div>
                                        </div>

                                        {/* AI Features (Pro only) */}
                                        {(canUseChat || canUseSearch) && (
                                            <div className="pt-2">
                                                <label className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">AI Capabilities</label>
                                                <div className="space-y-2 mt-1.5">
                                                    {canUseChat && <TokenUsagePill type="chat" className="w-full" />}
                                                    {canUseSearch && <TokenUsagePill type="search" className="w-full" />}
                                                </div>
                                            </div>
                                        )}

                                        {!canUseChat && !canUseSearch && (
                                            <div className="py-3 px-3 mt-2 text-xs text-gray-500 bg-violet-50/50 rounded-lg border border-violet-100 flex items-center gap-2">
                                                <Sparkles className="h-3.5 w-3.5 text-royal-violet-500" />
                                                <span>Upgrade to unlock AI features</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="pt-4 border-t border-gray-100">
                                        <Link to="/app/subscription" className="text-sm text-royal-violet-600 hover:text-royal-violet-800 font-medium flex items-center gap-1 group">
                                            Manage Subscription
                                            <MoveLeft className="h-3 w-3 rotate-180 transition-transform group-hover:translate-x-1" />
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </Tabs>
            </div>
        </div>
    );
}
