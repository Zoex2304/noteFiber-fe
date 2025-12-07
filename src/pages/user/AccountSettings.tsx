import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useUpdateProfile } from "@/hooks/user/useUpdateProfile";
import { useDeleteAccount } from "@/hooks/user/useDeleteAccount";
import { useAuth } from "@/hooks/auth/useAuth";
import axios from "axios";
import { AppConfig } from "@/config/config";
import { tokenStorage } from "@/utils/storage/token.storage";
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
import { Separator } from "@/components/shadui/separator";
import { Loader2, MoveLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { AvatarUploader } from "@/components/common/AvatarUploader";
import { toast } from "sonner";
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

const profileSchema = z.object({
    full_name: z.string().min(2, {
        message: "Name must be at least 2 characters.",
    }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function AccountSettings() {
    const { user, updateUser } = useAuth();
    const navigate = useNavigate();
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
                toast.success("Profile updated successfully");
            },
            onError: () => {
                toast.error("Failed to update profile");
            }
        });
    }

    const handleAvatarUpload = async (blob: Blob) => {
        // Create FormData
        const formData = new FormData();
        formData.append('avatar', blob, 'avatar.jpg');

        try {
            const response = await axios.post(`${AppConfig.baseUrl}/api/user/avatar`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${tokenStorage.getToken()}`
                }
            });

            if (response.data && response.data.user) {
                // Assume backend returns updated user or we fetch it again
                // For now, let's fetch profile again to be sure or update if response has it
                updateUser(response.data.user);
            } else {
                // Fallback: fetch profile
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
        <div className="p-10 pb-16 max-w-5xl mx-auto">
            {/* Header with Back Button outside the main content flow */}
            <div className="flex items-center gap-4 mb-8">
                <ActionTooltip label="Go Back">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(-1)}
                        className="h-10 w-10 shrink-0 rounded-full border-gray-200"
                    >
                        <MoveLeft className="h-5 w-5" />
                    </Button>
                </ActionTooltip>
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
                    <p className="text-muted-foreground">
                        Manage your account settings and preferences.
                    </p>
                </div>
            </div>

            <Separator className="mb-8" />

            <div className="space-y-6 max-w-4xl ml-14">
                {/* Profile Section */}
                <div className="grid gap-4">
                    <div>
                        <h3 className="text-lg font-medium">Profile</h3>
                        <p className="text-sm text-muted-foreground">
                            Update your personal information.
                        </p>
                    </div>

                    <div className="flex justify-center sm:justify-start mb-6">
                        <AvatarUploader
                            currentAvatarUrl={user?.avatar_url}
                            onUpload={handleAvatarUpload}
                        // isUploading state could be added here
                        />
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
                            <div className="flex flex-col sm:flex-row gap-4 items-start">
                                <FormField
                                    control={form.control as any}
                                    name="full_name"
                                    render={({ field }) => (
                                        <FormItem className="flex-1">
                                            <FormLabel>Full Name</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Your name" {...field} />
                                            </FormControl>
                                            <FormDescription>
                                                This is the name that will be displayed on your profile and in emails.
                                            </FormDescription>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <Button type="submit" disabled={isUpdating} className="mt-8">
                                    {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>

                <Separator />

                {/* Account Details (ReadOnly) */}
                <div className="grid gap-4">
                    <div>
                        <h3 className="text-lg font-medium">Account Details</h3>
                        <p className="text-sm text-muted-foreground">
                            Review your account information.
                        </p>
                    </div>
                    <div className="grid gap-4 max-w-xl text-sm">
                        <div className="grid grid-cols-3 items-center">
                            <span className="font-medium">Plan</span>
                            <div className="col-span-2">
                                <PlanStatusPill className="w-fit" />
                            </div>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <span className="font-medium">Email</span>
                            <span className="col-span-2 text-muted-foreground">{user?.email}</span>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <span className="font-medium">User ID</span>
                            <span className="col-span-2 text-muted-foreground font-mono text-xs">{user?.id}</span>
                        </div>
                        <div className="grid grid-cols-3 items-center">
                            <span className="font-medium">Role</span>
                            <span className="col-span-2 text-muted-foreground capitalize">{user?.role}</span>
                        </div>
                    </div>
                </div>

                <Separator />

                {/* Danger Zone */}
                <div className="grid gap-4">
                    <div>
                        <h3 className="text-lg font-medium text-red-600">Danger Zone</h3>
                        <p className="text-sm text-muted-foreground">
                            Irreversible actions for your account.
                        </p>
                    </div>

                    <div className="rounded-md border border-red-200 p-4 max-w-xl bg-red-50">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h4 className="font-medium text-red-900">Delete Account</h4>
                                <p className="text-sm text-red-700">
                                    Permanently delete your account and all contents.
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
                                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? "Deleting..." : "Delete Account"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
