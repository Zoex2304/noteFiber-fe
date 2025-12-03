import { Separator } from "@/components/shadui/separator";

interface OrderSummaryProps {
    planName?: string;
    price?: string;
    period?: string;
}

export function OrderSummary({
    planName = "Pro Plan",
    price = "$19",
    period = "/month"
}: OrderSummaryProps) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 h-fit">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>

            <div className="flex justify-between items-start mb-4">
                <div>
                    <h4 className="font-medium text-gray-900">{planName}</h4>
                    <p className="text-sm text-gray-500">Billed {period.replace('/', '')}</p>
                </div>
                <div className="text-right">
                    <span className="font-semibold text-gray-900">{price}</span>
                    <span className="text-sm text-gray-500">{period}</span>
                </div>
            </div>

            <Separator className="my-4" />

            <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium text-gray-900">{price}</span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium text-gray-900">$0.00</span>
                </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-900">Total</span>
                <div className="text-right">
                    <span className="text-xl font-bold text-royal-violet-base">{price}</span>
                    <span className="text-sm text-gray-500 block">due today</span>
                </div>
            </div>
        </div>
    );
}
