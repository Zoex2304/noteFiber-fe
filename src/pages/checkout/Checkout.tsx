import { useSearchParams } from "react-router-dom";
import { CheckoutLayout } from "./components/CheckoutLayout";
import { OrderSummary } from "./components/OrderSummary";
import { Input } from "@/components/shadui/input";
import { Label } from "@/components/shadui/label";
import { Button } from "@/components/shadui/button";

export default function Checkout() {
    const [searchParams] = useSearchParams();
    const plan = searchParams.get("plan") || "pro";
    const period = searchParams.get("period") || "monthly";

    // Dummy data mapping based on query params
    const planDetails = {
        name: plan === "pro" ? "Pro Plan" : "Starter Plan",
        price: plan === "pro" ? "$19" : "$9",
        period: period === "monthly" ? "/month" : "/year"
    };

    return (
        <CheckoutLayout>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Billing Form */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing Information</h2>
                        <form className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" placeholder="John" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" placeholder="Doe" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input id="email" type="email" placeholder="john@example.com" />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Address</Label>
                                <Input id="address" placeholder="123 Main St" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City</Label>
                                    <Input id="city" placeholder="New York" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <Input id="state" placeholder="NY" />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="zip">ZIP Code</Label>
                                    <Input id="zip" placeholder="10001" />
                                </div>
                            </div>
                        </form>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
                        <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500 bg-gray-50">
                            Payment integration will be implemented here (Midtrans).
                        </div>
                    </div>

                    <Button className="w-full h-12 text-lg bg-royal-violet-base hover:bg-royal-violet-dark text-white">
                        Complete Purchase
                    </Button>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    <OrderSummary
                        planName={planDetails.name}
                        price={planDetails.price}
                        period={planDetails.period}
                    />
                </div>
            </div>
        </CheckoutLayout>
    );
}
