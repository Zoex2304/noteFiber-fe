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
import { Loader2, MoveLeft, User, Shield, AlertTriangle } from "lucide-react";
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

const profileSchema = z.object({
    full_name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function AccountSettings() {
    const { user, updateUser } = useAuth();
    const router = useRouter();
    const { mutate: updateProfile, isPending: isUpdating } = useUpdateProfile();
    const { mutate: deleteAccount, isPending: isDeleting } = useDeleteAccount();

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            full_name: user?.full_name || "",
        },
    });

    function onSubmit(data: ProfileFormValues) {
        updateProfile(data, {
            onSuccess: () => {
                toaster.success("Profile updated successfully");
            },
            onError: () => {
                toaster.error("Failed to update profile");
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
            toaster.success("Avatar updated successfully");
        } catch (error) {
            console.error(error);
            toaster.error("Failed to upload avatar");
        }
    };

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
                    <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
                    <p className="text-gray-500 mt-1">Manage your account preferences</p>
                </div>
            </div>

            {/* Layout Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column: Profile Edit */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Profile Information Card */}
                    <Card className="shadow-sm border-gray-100">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <User className="h-5 w-5 text-royal-violet-base" />
                                Personal Information
                            </CardTitle>
                            <CardDescription>
                                Update your public profile details.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-8">
                            {/* Avatar Section */}
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                <AvatarUploader
                                    currentAvatarUrl={user?.avatar_url}
                                    onUpload={handleAvatarUpload}
                                />
                                <div className="space-y-1 text-center sm:text-left">
                                    <h4 className="font-medium text-gray-900">Profile Photo</h4>
                                    <p className="text-sm text-gray-500 max-w-xs">
                                        Upload a new avatar to personalize your profile. JPG, GIF or PNG.
                                    </p>
                                </div>
                            </div>

                            {/* Form Section */}
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
                                                <FormDescription>
                                                    This name will be displayed on your profile.
                                                </FormDescription>
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

                    {/* Billing Information Card */}
                    <BillingInfoCard />

                    {/* Danger Zone Card */}
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
                                    <p className="text-sm text-gray-500">
                                        Permanently delete your account and all data.
                                    </p>
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
                </div>

                {/* Right Column: Account Status & Read-only info */}
                <div className="space-y-6">
                    <Card className="shadow-sm border-gray-100 bg-gray-50/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Shield className="h-5 w-5 text-gray-500" />
                                Account Details
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</label>
                                <p className="text-sm font-medium text-gray-900 mt-0.5">{user?.email}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">User ID</label>
                                <p className="text-xs font-mono text-gray-600 mt-0.5 break-all">{user?.id}</p>
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</label>
                                <div className="mt-1 flex items-center justify-between">
                                    <PlanStatusPill className="w-fit" />
                                    <Link to="/app/subscription" className="text-xs text-blue-600 hover:underline">Manage</Link>
                                </div>
                            </div>
                            <div className="pt-2">
                                <div className="grid grid-cols-2 gap-2">
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase">AI Chat Used</label>
                                        <TokenUsagePill type="chat" className="w-full mt-1" />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 uppercase">Search Used</label>
                                        <TokenUsagePill type="search" className="w-full mt-1" />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

            </div>
        </div>
    );
}
