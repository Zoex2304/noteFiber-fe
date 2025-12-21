import { Button } from "@/components/shadui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { PricingDisplay } from "@/pages/landingpage/components/organisms/PricingDisplay";

export default function AppPricing() {
    const navigate = useNavigate();

    return (
        // Wrapper: min-h-screen for full height, flex-col for layout.
        <div className="min-h-screen bg-gray-50 flex flex-col py-12">

            {/* Inner Content Wrapper: Centered with mx-auto and max-width */}
            <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10 flex flex-col items-center">

                {/* Header Section */}
                <div className="w-full flex justify-center items-center relative">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => navigate({ to: '/app' })}
                        className="absolute left-0 rounded-full hover:bg-gray-200"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-gray-900">Subscription Plans</h1>
                        <p className="text-gray-500 mt-1">Choose the perfect plan for your needs</p>
                    </div>
                </div>

                {/* Pricing Display - Reusable Organism */}
                <PricingDisplay showSwitcher={true} />
            </div>
        </div>
    );
}
