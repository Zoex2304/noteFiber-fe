import { useEffect, useState } from 'react';
import type { UseFormReturn } from 'react-hook-form';
import { Input } from '@/components/shadui/input';
import { Combobox } from '@/components/shadui/combobox';
import {
    FormField,
    FormItem,
    FormLabel,
    FormControl,
    FormMessage,
} from '@/components/shadui/form';
import { useStates, useCities, useZipcodes } from '@/hooks/location/useLocation';
import { useDebounce } from '@/hooks/useDebounce';

// Standard list of countries (using ISO codes)
const COUNTRIES = [
    { value: 'ID', label: 'Indonesia' },
    { value: 'US', label: 'United States' },
    { value: 'SG', label: 'Singapore' },
    { value: 'MY', label: 'Malaysia' },
];

interface LocationFieldsProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    form: UseFormReturn<any>;
    fieldNames?: {
        country: string;
        state: string;
        city: string;
        postal_code: string;
    };
    defaultCountry?: string;
}

const defaultFieldNames = {
    country: 'country',
    state: 'state',
    city: 'city',
    postal_code: 'postal_code',
};

export function LocationFields({
    form,
    fieldNames = defaultFieldNames,
    defaultCountry = 'ID',
}: LocationFieldsProps) {
    const fields = { ...defaultFieldNames, ...fieldNames };

    // Watch values for cascading dropdowns
    const selectedCountry = form.watch(fields.country) || defaultCountry;
    const selectedState = form.watch(fields.state);
    const selectedCity = form.watch(fields.city);

    // City Search State
    const [citySearch, setCitySearch] = useState('');
    const debouncedCitySearch = useDebounce(citySearch, 500);

    // Manual Input States (Fallback)
    const [isManualState, setIsManualState] = useState(false);
    const [isManualCity, setIsManualCity] = useState(false);
    const [isManualZip, setIsManualZip] = useState(false);

    // --- Location Data Hooks ---

    // 1. States
    const { data: statesData, isLoading: isLoadingStates } = useStates(
        { country: selectedCountry, city: 'dummy' },
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
        form.setValue(fields.state, '');
        form.setValue(fields.city, '');
        form.setValue(fields.postal_code, '');
        setIsManualState(false);
        setIsManualCity(false);
        setIsManualZip(false);
    }, [selectedCountry, form, fields.state, fields.city, fields.postal_code]);

    useEffect(() => {
        form.setValue(fields.city, '');
        form.setValue(fields.postal_code, '');
        setIsManualCity(false);
        setIsManualZip(false);
        setCitySearch('');
    }, [selectedState, form, fields.city, fields.postal_code]);

    useEffect(() => {
        form.setValue(fields.postal_code, '');
        setIsManualZip(false);
    }, [selectedCity, form, fields.postal_code]);

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
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Country */}
                <FormField
                    control={form.control}
                    name={fields.country}
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
                    name={fields.state}
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
                                        emptyMessage={isLoadingStates ? 'Loading...' : 'No states found.'}
                                    />
                                )}
                            </FormControl>
                            <FormMessage />
                            {!isManualState && isLoadingStates && (
                                <span className="text-xs text-muted-foreground">Loading states...</span>
                            )}
                            {!isManualState && selectedCountry && !isLoadingStates && statesData?.states && statesData.states.length === 0 && (
                                <button
                                    type="button"
                                    className="text-xs text-primary hover:underline"
                                    onClick={() => setIsManualState(true)}
                                >
                                    State not listed? Enter manually.
                                </button>
                            )}
                        </FormItem>
                    )}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* City */}
                <FormField
                    control={form.control}
                    name={fields.city}
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
                                                ? 'Searching...'
                                                : citySearch.length < 2
                                                    ? 'Type to search...'
                                                    : 'No cities found matching your state.'
                                        }
                                    />
                                )}
                            </FormControl>
                            <FormMessage />
                            {!isManualCity && isLoadingCities && (
                                <span className="text-xs text-muted-foreground">Searching cities...</span>
                            )}
                            {!isManualCity && selectedState && !isLoadingCities && citySearch.length >= 2 && filteredCities.length === 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    City not found?{' '}
                                    <button
                                        type="button"
                                        className="text-primary hover:underline"
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
                    name={fields.postal_code}
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
                                        emptyMessage={isLoadingZipcodes ? 'Loading...' : 'No Zip Codes found.'}
                                    />
                                )}
                            </FormControl>
                            <FormMessage />
                            {!isManualZip && isLoadingZipcodes && (
                                <span className="text-xs text-muted-foreground">Loading zip codes...</span>
                            )}
                            {!isManualZip && selectedCity && !isLoadingZipcodes && zipcodesData?.zipcodes.length === 0 && (
                                <p className="text-xs text-muted-foreground mt-1">
                                    Code not found?{' '}
                                    <button
                                        type="button"
                                        className="text-primary hover:underline"
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
        </>
    );
}
