import { Separator } from "@/components/shadui/separator";

export interface OrderSummaryProps {
    planName?: string;
    billingPeriod?: string;
    pricePerUnit?: string;
    subtotal?: number;
    tax?: number;
    total?: number;
    currency?: string;
    isLoading?: boolean;
}

export function OrderSummary({
    planName = "Pro Plan",
    billingPeriod = "month",
    pricePerUnit = "$19.00/month",
    subtotal = 19.00,
    tax = 0,
    total = 19.00,
    currency = "USD",
    isLoading = false
}: OrderSummaryProps) {
    if (isLoading) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-medium text-gray-900">{planName}</h4>
                    <p className="text-sm text-gray-500">Billed {billingPeriod}</p>
                </div>
                <div className="text-right">
                    <span className="font-semibold text-gray-900">{pricePerUnit}</span>
                </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-gray-900">{formatCurrency(tax)}</span>
                </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <div className="text-right">
                    <span className="text-xl font-bold text-royal-violet-base">{formatCurrency(total)}</span>
                    <span className="text-sm text-gray-500 block">due today</span>
                </div>
            </div>
        </div>
    );
}
