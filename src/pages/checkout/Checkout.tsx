import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckoutLayout } from "./components/CheckoutLayout";
import { OrderSummary } from "./components/OrderSummary";
import { Input } from "@/components/shadui/input";
import { Button } from "@/components/shadui/button";
import { useAuth } from "@/hooks/auth/useAuth";
import { useCities, useStates, useZipcodes } from "@/hooks/location/useLocation";
import { useSubscriptionPlans, useCheckout } from "@/hooks/payment";
import { useDebounce } from "@/hooks/useDebounce";
import { Combobox } from "@/components/shadui/combobox";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/shadui/form";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// Standard list of countries (using ISO codes)
const COUNTRIES = [
    { value: "ID", label: "Indonesia" },
    { value: "US", label: "United States" },
    { value: "SG", label: "Singapore" },
    { value: "MY", label: "Malaysia" },
];

const checkoutSchema = z.object({
    first_name: z.string().min(2, "First name is required"),
    last_name: z.string().min(2, "Last name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().min(10, "Phone number is required"),
    address_line1: z.string().min(5, "Address is required"),
    address_line2: z.string().optional(),
    country: z.string().min(1, "Country is required"),
    city: z.string().min(1, "City is required"),
    state: z.string().min(1, "State is required"),
    postal_code: z.string().min(1, "ZIP Code is required"),
});

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

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

    // Get Query Params
    const planSlug = searchParams.get("plan") || "pro";

    // Hooks
    const { data: plansResponse, isLoading: isLoadingPlans } = useSubscriptionPlans();
    const checkoutMutation = useCheckout();

    // Form Setup
    const form = useForm<CheckoutFormValues>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            first_name: user?.full_name?.split(" ")[0] || "",
            last_name: user?.full_name?.split(" ").slice(1).join(" ") || "",
            email: user?.email || "",
            phone: "",
            address_line1: "",
            address_line2: "",
            country: "ID", // Default
            city: "",
            state: "",
            postal_code: "",
        },
    });

    // Watch values for cascading dropdowns
    const selectedCountry = form.watch("country");
    const selectedCity = form.watch("city");
    const selectedState = form.watch("state");

    // City Search State
    const [citySearch, setCitySearch] = useState("");
    const debouncedCitySearch = useDebounce(citySearch, 500);

    // Location Data Hooks
    const { data: citiesData, isLoading: isLoadingCities } = useCities(
        { country: selectedCountry, query: debouncedCitySearch },
        !!(selectedCountry && debouncedCitySearch.length >= 2)
    );

    const { data: statesData, isLoading: isLoadingStates } = useStates(
        { country: selectedCountry, city: selectedCity },
        !!(selectedCountry && selectedCity)
    );

    const { data: zipcodesData, isLoading: isLoadingZipcodes } = useZipcodes(
        { country: selectedCountry, city: selectedCity, state: selectedState },
        !!(selectedCountry && selectedCity && selectedState)
    );

    // Derived State
    const plans = plansResponse?.data || [];
    const selectedPlan = plans.find(p => p.slug.includes(planSlug)) || plans[0];

    // Clear downstream fields when upstream changes
    useEffect(() => {
        form.setValue("city", "");
        form.setValue("state", "");
        form.setValue("postal_code", "");
    }, [selectedCountry, form]);

    useEffect(() => {
        form.setValue("state", "");
        form.setValue("postal_code", "");
    }, [selectedCity, form]);

    useEffect(() => {
        form.setValue("postal_code", "");
    }, [selectedState, form]);


    async function onSubmit(data: CheckoutFormValues) {
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
                                navigate("/app/dashboard");
                            },
                            onPending: function (_result: unknown) {
                                toast.info("Payment pending...");
                                navigate("/app/dashboard");
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
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Billing Information</h2>

                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="first_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>First Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="John" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="last_name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Last Name</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="Doe" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Email Address</FormLabel>
                                            <FormControl>
                                                <Input type="email" placeholder="john@example.com" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Phone Number</FormLabel>
                                            <FormControl>
                                                <Input placeholder="08123456789" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="address_line1"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Address</FormLabel>
                                            <FormControl>
                                                <Input placeholder="123 Main St" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="country"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Country</FormLabel>
                                                <FormControl>
                                                    <Combobox
                                                        options={COUNTRIES}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="Select Country"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="city"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City</FormLabel>
                                                <FormControl>
                                                    <Combobox
                                                        options={citiesData?.cities.map(c => ({ value: c.name, label: c.name })) || []}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="Select City"
                                                        searchPlaceholder="Search city (min 2 chars)..."
                                                        onSearchChange={setCitySearch}
                                                        searchValue={citySearch}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                                {isLoadingCities && <span className="text-xs text-muted-foreground">Searching cities...</span>}
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="state"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>State</FormLabel>
                                                <FormControl>
                                                    <Combobox
                                                        options={statesData?.states.map(s => ({ value: s.name, label: s.name })) || []}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="Select State"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                                {isLoadingStates && <span className="text-xs text-muted-foreground">Loading states...</span>}
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="postal_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>ZIP Code</FormLabel>
                                                <FormControl>
                                                    <Combobox
                                                        options={zipcodesData?.zipcodes.map(z => ({ value: z.code, label: `${z.code} - ${z.area}` })) || []}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="Select ZIP Code"
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                                {isLoadingZipcodes && <span className="text-xs text-muted-foreground">Loading zip codes...</span>}
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-lg bg-royal-violet-base hover:bg-royal-violet-dark text-white mt-6"
                                    disabled={checkoutMutation.isPending}
                                >
                                    {checkoutMutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                                    {checkoutMutation.isPending ? "Processing..." : "Complete Purchase"}
                                </Button>
                            </form>
                        </Form>
                    </div>
                </div>

                {/* Right Column: Order Summary */}
                <div className="lg:col-span-1">
                    {selectedPlan ? (
                        <OrderSummary
                            planName={selectedPlan.name}
                            price={`$${(selectedPlan.price / 100).toFixed(2)}`} // Assuming price is in cents
                            period={`/${selectedPlan.billing_period}`}
                        />
                    ) : (
                        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                            <p className="text-center text-gray-500">Plan not found.</p>
                        </div>
                    )}
                </div>
            </div>
        </CheckoutLayout>
    );
}
