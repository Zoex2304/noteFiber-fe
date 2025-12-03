import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router-dom";

import { Button } from "@/components/shadui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/shadui/form";
import { Input } from "@/components/shadui/input";
import { AuthLayout } from "./components/AuthLayout";

const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address." }),
});

export default function ForgotPassword() {
    const form = useForm<z.infer<typeof forgotPasswordSchema>>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    function onSubmit(values: z.infer<typeof forgotPasswordSchema>) {
        console.log(values);
        // Handle forgot password logic
    }

    return (
        <AuthLayout title="Forgot password?">
            <div className="flex flex-col gap-6">
                <p className="text-gray-600 text-sm">
                    Enter the email address you used when you created the account, and
                    we'll send you a code to reset your password
                </p>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Email</FormLabel>
                                    <FormControl>
                                        <Input placeholder="name@example.com" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button
                            type="submit"
                            className="w-full bg-royal-violet-base hover:bg-royal-violet-dark text-white h-12"
                        >
                            Submit
                        </Button>
                    </form>
                </Form>

                <div className="text-center text-sm text-gray-600">
                    <Link to="/signin" className="text-royal-violet-base hover:underline">
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
