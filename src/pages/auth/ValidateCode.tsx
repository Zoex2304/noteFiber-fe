import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { Button } from "@/components/shadui/button";
import { AuthLayout } from "./components/AuthLayout";
import { OtpInput } from "./components/OtpInput";

export default function ValidateCode() {
    const [searchParams] = useSearchParams();
    const email = searchParams.get("email") || "your email";
    const [otp, setOtp] = useState("");

    const handleValidate = () => {
        console.log("Validating OTP:", otp);
        // Handle OTP validation logic
    };

    return (
        <AuthLayout title="Validate code">
            <div className="flex flex-col gap-6">
                <p className="text-gray-600 text-sm">
                    Enter below the 6-digit code you received on{" "}
                    <span className="font-medium text-gray-900">{email}</span>
                </p>

                <div className="space-y-6">
                    <OtpInput value={otp} onChange={setOtp} length={6} />

                    <Button
                        type="button"
                        className="w-full bg-royal-violet-base hover:bg-royal-violet-dark text-white h-12"
                        onClick={handleValidate}
                        disabled={otp.length !== 6}
                    >
                        Validate code
                    </Button>
                </div>

                <div className="text-center text-sm text-gray-600">
                    <Link to="/signin" className="text-royal-violet-base hover:underline">
                        Back to Sign In
                    </Link>
                </div>
            </div>
        </AuthLayout>
    );
}
