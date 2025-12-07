import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner"; // Assuming toast is used here or passed down? We'll handle generic errors here or let parent handle submit errors.
// Parent handles submit logic, but form handles validation UI.

import { Input } from "@/components/shadui/input";
import { Button } from "@/components/shadui/button";
import { Combobox } from "@/components/shadui/combobox";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/shadui/form";

import { useStates, useCities, useZipcodes } from "@/hooks/location/useLocation";
import { useDebounce } from "@/hooks/useDebounce";
import { checkoutSchema, CheckoutFormValues } from "../schema";
import { User } from "@/types/auth"; // You might need to adjust this import based on where User type is defined

// Standard list of countries (using ISO codes)
const COUNTRIES = [
    { value: "ID", label: "Indonesia" },
    { value: "US", label: "United States" },
    { value: "SG", label: "Singapore" },
    { value: "MY", label: "Malaysia" },
];

interface BillingFormProps {
    user: User | null;
    onSubmit: (data: CheckoutFormValues) => void;
    isPending: boolean;
}

export function BillingForm({ user, onSubmit, isPending }: BillingFormProps) {
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

    // Manual Input States (Fallback)
    const [isManualState, setIsManualState] = useState(false);
    const [isManualCity, setIsManualCity] = useState(false);
    const [isManualZip, setIsManualZip] = useState(false);

    // --- Location Data Hooks ---

    // 1. States
    const { data: statesData, isLoading: isLoadingStates } = useStates(
        { country: selectedCountry, city: "dummy" },
        !!selectedCountry
    );

    // Find the State Code based on the selected State Name
    const selectedStateObj = statesData?.states.find(s => s.name === selectedState);
    const selectedStateCode = selectedStateObj?.code;

    // 2. Cities
    const { data: citiesData, isLoading: isLoadingCities } = useCities(
        {
            country: selectedCountry,
            query: debouncedCitySearch,
            state: selectedStateCode
        },
        !!(selectedCountry && (debouncedCitySearch.length >= 2 || !!selectedStateCode))
    );

    // 3. Zipcodes
    const { data: zipcodesData, isLoading: isLoadingZipcodes } = useZipcodes(
        { country: selectedCountry, city: selectedCity, state: selectedState },
        !!(selectedCountry && selectedCity && selectedState)
    );

    const filteredCities = citiesData?.cities || [];

    // --- Reset Logic ---
    useEffect(() => {
        form.setValue("state", "");
        form.setValue("city", "");
        form.setValue("postal_code", "");
        setIsManualState(false);
        setIsManualCity(false);
        setIsManualZip(false);
    }, [selectedCountry, form]);

    useEffect(() => {
        form.setValue("city", "");
        form.setValue("postal_code", "");
        setIsManualCity(false);
        setIsManualZip(false);
        setCitySearch("");
    }, [selectedState, form]);

    useEffect(() => {
        form.setValue("postal_code", "");
        setIsManualZip(false);
    }, [selectedCity, form]);

    // --- Automatic Manual Fallback Logic ---
    useEffect(() => {
        if (!isLoadingStates && statesData && statesData.states.length === 0 && selectedCountry) {
            setIsManualState(true);
            setIsManualCity(true);
            setIsManualZip(true);
        }
    }, [isLoadingStates, statesData, selectedCountry]);

    useEffect(() => {
        if (!isLoadingCities && citiesData && citiesData.cities.length === 0 && selectedState && !isManualState) {
            setIsManualCity(true);
        }
    }, [isLoadingCities, citiesData, selectedState, isManualState]);

    useEffect(() => {
        if (!isLoadingZipcodes && zipcodesData && zipcodesData.zipcodes.length === 0 && selectedCity && !isManualCity) {
            setIsManualZip(true);
        }
    }, [isLoadingZipcodes, zipcodesData, selectedCity, isManualCity]);

    return (
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
                        {/* Country */}
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

                        {/* State */}
                        <FormField
                            control={form.control}
                            name="state"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>State / Province</FormLabel>
                                    <FormControl>
                                        {isManualState ? (
                                            <Input placeholder="Enter state manually" {...field} />
                                        ) : (
                                            <Combobox
                                                options={statesData?.states.map(s => ({ value: s.name, label: s.name })) || []}
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select State"
                                                disabled={!selectedCountry}
                                                emptyMessage={isLoadingStates ? "Loading..." : "No states found."}
                                            />
                                        )}
                                    </FormControl>
                                    <FormMessage />
                                    {!isManualState && isLoadingStates && <span className="text-xs text-muted-foreground">Loading states...</span>}
                                    {!isManualState && selectedCountry && !isLoadingStates && statesData?.states && statesData.states.length === 0 && (
                                        <span className="text-xs text-red-500 cursor-pointer" onClick={() => setIsManualState(true)}>
                                            State not listed? Enter manually.
                                        </span>
                                    )}
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* City */}
                        <FormField
                            control={form.control}
                            name="city"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>City</FormLabel>
                                    <FormControl>
                                        {isManualCity ? (
                                            <Input placeholder="Enter city manually" {...field} />
                                        ) : (
                                            <Combobox
                                                options={filteredCities.map(c => ({ value: c.name, label: c.name }))}
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select City"
                                                searchPlaceholder="Search city (min 2 chars)..."
                                                onSearchChange={setCitySearch}
                                                searchValue={citySearch}
                                                disabled={!selectedState}
                                                emptyMessage={
                                                    isLoadingCities
                                                        ? "Searching..."
                                                        : citySearch.length < 2
                                                            ? "Type to search..."
                                                            : "No cities found matching your state."
                                                }
                                            />
                                        )}
                                    </FormControl>
                                    <FormMessage />
                                    {!isManualCity && isLoadingCities && <span className="text-xs text-muted-foreground">Searching cities...</span>}
                                    {!isManualCity && selectedState && !isLoadingCities && citySearch.length >= 2 && filteredCities.length === 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            City not found? {" "}
                                            <button
                                                type="button"
                                                className="text-royal-violet-base hover:underline"
                                                onClick={() => setIsManualCity(true)}
                                            >
                                                Enter manually
                                            </button>
                                        </p>
                                    )}
                                </FormItem>
                            )}
                        />

                        {/* Zipcode */}
                        <FormField
                            control={form.control}
                            name="postal_code"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ZIP Code</FormLabel>
                                    <FormControl>
                                        {isManualZip ? (
                                            <Input placeholder="Enter ZIP Code" {...field} />
                                        ) : (
                                            <Combobox
                                                options={zipcodesData?.zipcodes.map(z => ({ value: z.code, label: `${z.code} - ${z.area}` })) || []}
                                                value={field.value}
                                                onChange={field.onChange}
                                                placeholder="Select ZIP Code"
                                                disabled={!selectedCity}
                                                emptyMessage={isLoadingZipcodes ? "Loading..." : "No Zip Codes found."}
                                            />
                                        )}
                                    </FormControl>
                                    <FormMessage />
                                    {!isManualZip && isLoadingZipcodes && <span className="text-xs text-muted-foreground">Loading zip codes...</span>}
                                    {!isManualZip && selectedCity && !isLoadingZipcodes && zipcodesData?.zipcodes.length === 0 && (
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Code not found? {" "}
                                            <button
                                                type="button"
                                                className="text-royal-violet-base hover:underline"
                                                onClick={() => setIsManualZip(true)}
                                            >
                                                Enter manually
                                            </button>
                                        </p>
                                    )}
                                </FormItem>
                            )}
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full h-12 text-lg bg-royal-violet-base hover:bg-royal-violet-dark text-white mt-6"
                        disabled={isPending}
                    >
                        {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {isPending ? "Processing..." : "Complete Purchase"}
                    </Button>
                </form>
            </Form>
        </div>
    );
}
