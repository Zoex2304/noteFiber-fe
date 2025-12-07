import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { CheckoutLayout } from "./components/CheckoutLayout";
import { OrderSummary } from "./components/OrderSummary";
import { BillingForm } from "./components/BillingForm";
import { useAuth } from "@/hooks/auth/useAuth";
import { useSubscriptionPlans, useCheckout, useOrderSummary } from "@/hooks/payment";
import { type CheckoutFormValues } from "./schema";

// Extend Window interface for Snap
declare global {
    interface Window {
        snap: any;
    }
}

export default function Checkout() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();

    // Redirect if not authenticated
    useEffect(() => {
        if (!isAuthenticated) {
            navigate("/signin?redirect=/checkout");
        }
    }, [isAuthenticated, navigate]);

    // Get Data
    const planSlug = searchParams.get("plan") || "pro";
    const { data: plansResponse, isLoading: isLoadingPlans } = useSubscriptionPlans();
    const checkoutMutation = useCheckout();

    // Derived State
    const plans = plansResponse?.data || [];

    // Improved matching logic: Try exact match first, then includes
    const selectedPlan = plans.find(p => p.slug === planSlug) ||
        plans.find(p => p.slug.includes(planSlug)) ||
        plans[0];

    // Redirect Free Plan to Dashboard
    useEffect(() => {
        if (!isLoadingPlans && selectedPlan) {
            // Check if it's a free plan (price 0 OR slug 'free')
            if (selectedPlan.price === 0 || selectedPlan.slug === 'free') {
                toast.info("Free plan selected. Redirecting to dashboard...");
                navigate("/app");
            }
        }
    }, [selectedPlan, isLoadingPlans, navigate]);

    // Fetch Order Summary from Backend (Source of Truth)
    const { data: orderSummaryResponse, isLoading: isLoadingSummary } = useOrderSummary(selectedPlan?.id);
    const orderSummary = orderSummaryResponse?.data;

    async function handleCheckout(data: CheckoutFormValues) {
        if (!selectedPlan?.id) {
            toast.error("Invalid plan selected");
            return;
        }

        const checkoutPayload = {
            plan_id: selectedPlan.id,
            ...data
        };

        checkoutMutation.mutate(checkoutPayload, {
            onSuccess: (response) => {
                if (response.success && response.data) {
                    const { snap_token, snap_redirect_url } = response.data;

                    if (window.snap) {
                        window.snap.pay(snap_token, {
                            onSuccess: function (_result: unknown) {
                                toast.success("Payment successful!");
                                navigate("/app");
                            },
                            onPending: function (_result: unknown) {
                                toast.info("Payment pending...");
                                navigate("/app");
                            },
                            onError: function (_result: unknown) {
                                toast.error("Payment failed");
                                console.error(_result);
                            },
                            onClose: function () {
                                toast.warning("Payment window closed");
                            }
                        });
                    } else if (snap_redirect_url) {
                        // Fallback
                        window.location.href = snap_redirect_url;
                    } else {
                        toast.error("Payment gateway not initialized");
                    }
                } else {
                    toast.error("Failed to initiate checkout");
                }
            },
            onError: (error) => {
                console.error("Checkout error:", error);
                toast.error(error.message || "An error occurred during checkout");
            }
        });
    }

    if (isLoadingPlans) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-royal-violet-base" />
            </div>
        );
    }

    return (
        <CheckoutLayout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Billing Form */}
                <div className="lg:col-span-2 space-y-8">
                    <BillingForm
                        user={user}
                        onSubmit={handleCheckout}
                        isPending={checkoutMutation.isPending}
                    />
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    <OrderSummary
                        isLoading={isLoadingSummary || isLoadingPlans}
                        planName={orderSummary?.plan_name}
                        billingPeriod={orderSummary?.billing_period}
                        pricePerUnit={orderSummary?.price_per_unit}
                        subtotal={orderSummary?.subtotal}
                        tax={orderSummary?.tax}
                        total={orderSummary?.total}
                        currency={orderSummary?.currency}
                    />

                    {/* Trust Badges */}
                    <div className="mt-6 flex flex-col gap-3 text-center text-sm text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                            <span>🔒 Secure SSL Payment</span>
                        </div>
                    </div>
                </div>
            </div>
        </CheckoutLayout>
    );
}
