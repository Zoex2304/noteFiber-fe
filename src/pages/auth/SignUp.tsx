import { useState } from "react";
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
import { Checkbox } from "@/components/shadui/checkbox";
import { AuthLayout } from "./components/AuthLayout";
import { GoogleSignInButton } from "./components/GoogleSignInButton";
import { PasswordInput } from "./components/PasswordInput";
import { PasswordStrengthMeter } from "./components/PasswordStrengthMeter";

const signUpSchema = z
    .object({
        email: z.string().email({ message: "Please enter a valid email address." }),
        password: z
            .string()
            .min(8, { message: "Password must be at least 8 characters." }),
        confirmPassword: z.string(),
        agreeTerms: z.boolean().refine((val) => val === true, {
            message: "You must agree to the terms and privacy policy.",
        }),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export default function SignUp() {
    const [password, setPassword] = useState("");

    const form = useForm<z.infer<typeof signUpSchema>>({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            agreeTerms: false,
        },
    });

    function onSubmit(values: z.infer<typeof signUpSchema>) {
        console.log(values);
        // Handle sign up logic
    }

    return (
        <AuthLayout title="Sign Up">
            <div className="flex flex-col gap-6">
                <GoogleSignInButton />

                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">Or</span>
                    </div>
                </div>

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
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <div className="flex flex-col gap-1">
                                            <PasswordInput
                                                placeholder="********"
                                                {...field}
                                                showToggle={false}
                                                onChange={(e) => {
                                                    field.onChange(e);
                                                    setPassword(e.target.value);
                                                }}
                                            />
                                            <PasswordStrengthMeter password={password} />
                                        </div>
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm password</FormLabel>
                                    <FormControl>
                                        <PasswordInput placeholder="********" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="agreeTerms"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel className="text-sm font-normal text-gray-600">
                                            I agree with{" "}
                                            <Link to="#" className="text-royal-violet-base hover:underline">
                                                Terms
                                            </Link>{" "}
                                            and{" "}
                                            <Link to="#" className="text-royal-violet-base hover:underline">
                                                Privacy
                                            </Link>
                                        </FormLabel>
                                        <FormMessage />
                                    </div>
                                </FormItem>
                            )}
                        />
                        <Button
                            type="submit"
                            className="w-full bg-royal-violet-base hover:bg-royal-violet-dark text-white h-12"
                        >
                            Create account
                        </Button>
                    </form>
                </Form>

                <div className="text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link to="/signin" className="text-royal-violet-base hover:underline">
                        Sign In
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
