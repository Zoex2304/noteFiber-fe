import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Logo } from "@/components/shadui/Logo";

interface CheckoutLayoutProps {
    children: ReactNode;
}

export function CheckoutLayout({ children }: CheckoutLayoutProps) {
    return (
        <div className="min-h-screen w-full bg-gray-50">
            {/* Header */}
            <header className="w-full bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
                <Link to="/">
                    <Logo variant="horizontal" size="sm" />
                </Link>
                <div className="text-sm text-gray-500">
                    Secure Checkout
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8 max-w-6xl">
                {children}
            </main>
        </div>
    );
}
