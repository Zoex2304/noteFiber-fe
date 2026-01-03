import { Link } from "@tanstack/react-router";
import { Button } from "./button";
import { PriceAdvantageItem } from "./PriceAdvantageItem";
import { cn } from "@/lib/utils";
import { ArrowRight } from "lucide-react";
import type { ReactNode } from "react";

// Define the type for data to be displayed
export interface PricingCardData {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  slug?: string;
  // Optional button customization (for modal usage)
  onClick?: () => void;
  buttonText?: string;
  isDisabled?: boolean;
  // Optional tier badge (icon/badge next to title)
  tierBadge?: ReactNode;
}

interface PricingCardProps {
  data: PricingCardData;
  className?: string;
  /**
   * Context determines button behavior:
   * - 'landing': Always show "Get Started" → links to signup
   * - 'app': Show "Current plan" / "Upgrade to X" based on plan
   */
  context?: 'landing' | 'app';
}

/**
 * Reusable Pricing Card Component
 *
 * LOCATION: src/components/shadui/PricingCard.tsx
 *
 * Layout Structure (Mistral-style):
 * 1. Header: Tier Badge + Plan Title
 * 2. Description
 * 3. Features List (with checkmarks)
 * 4. Price + Period
 * 5. CTA Button
 *
 * Fixed dimensions: 320px width × 480px height on desktop
 * Light card background (existing theme preserved)
 */
export function PricingCard({ data, className, context = 'app' }: PricingCardProps) {
  const {
    title,
    price,
    period,
    description,
    features,
    isPopular,
    slug,
    onClick,
    buttonText,
    isDisabled,
    tierBadge,
  } = data;

  // Determine the target URL
  const isFree = slug === 'free' || price === '$0.00' || price === 'Rp0';
  const planSlug = slug || title.toLowerCase().replace(/\s+/g, "-");

  // Render button based on context
  const renderButton = () => {
    // Custom onClick handler (modal usage)
    if (onClick) {
      return (
        <Button
          variant={isDisabled ? "secondary" : "default"}
          size="lg"
          className={cn(
            "w-full rounded-xl font-medium",
            isDisabled
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-royal-violet-base hover:bg-royal-violet-base/90 text-white"
          )}
          onClick={onClick}
          disabled={isDisabled}
        >
          <span>{buttonText || "Get Started"}</span>
          {!isDisabled && <ArrowRight className="w-4 h-4 ml-2" />}
        </Button>
      );
    }

    // Landing context: Always "Get Started" → signup
    if (context === 'landing') {
      return (
        <Link to="/signup" className="w-full">
          <Button
            variant="default"
            size="lg"
            className="w-full rounded-xl font-medium bg-royal-violet-base hover:bg-royal-violet-base/90 text-white"
          >
            <span>Get Started</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      );
    }

    // App context: Free plan = "Current plan", others = "Upgrade"
    if (isFree) {
      return (
        <Link to="/app" className="w-full">
          <Button
            variant="secondary"
            size="lg"
            className="w-full rounded-xl font-medium bg-gray-200 text-gray-600"
          >
            <span>Current plan</span>
          </Button>
        </Link>
      );
    }

    // App context: Paid plans
    return (
      <Link
        to="/checkout"
        search={{
          plan: planSlug,
          price: price.replace("$", "").replace("Rp", "").replace(/,/g, ""),
          period: period.includes("month") ? "monthly" : "yearly"
        }}
        className="w-full"
      >
        <Button
          variant="default"
          size="lg"
          className="w-full rounded-xl font-medium bg-royal-violet-base hover:bg-royal-violet-base/90 text-white"
        >
          <span>Upgrade to {title}</span>
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </Link>
    );
  };

  return (
    // Card Container - Light background (existing theme), fixed dimensions, rounded corners
    <div
      className={cn(
        // Base layout
        "flex flex-col items-start",
        // Sizing: Fixed 320px width, fixed 480px height for deterministic sizing
        "w-full lg:w-[320px] h-auto lg:h-[480px]",
        // Spacing: 24px padding, 20px gap between sections
        "p-6 gap-5",
        // Style: Light background (existing), rounded corners
        "bg-white rounded-2xl",
        // Border & shadow
        isPopular
          ? "border-2 border-royal-violet-base shadow-lg"
          : "border border-customBorder-primary",
        className
      )}
    >
      {/* 1. Header Section: Badge + Title */}
      <div className="flex items-center gap-3 w-full">
        {/* Tier Badge (optional) */}
        {tierBadge && (
          <div className="flex-shrink-0">
            {tierBadge}
          </div>
        )}
        {/* Plan Title */}
        <h3 className="text-[20px] leading-[28px] font-medium text-customFont-dark-base">
          {title}
        </h3>
        {/* Popular indicator */}
        {isPopular && (
          <span className="ml-auto text-[12px] font-medium text-royal-violet-base bg-royal-violet-base/10 px-2 py-0.5 rounded-full">
            Popular
          </span>
        )}
      </div>

      {/* 2. Description Section */}
      <p className="text-[14px] leading-[20px] text-customFont-base w-full">
        {description}
      </p>

      {/* 3. Features List Section */}
      <div className="flex flex-col items-start gap-3 w-full flex-grow">
        {features.map((feature) => (
          <PriceAdvantageItem key={feature} text={feature} />
        ))}
      </div>

      {/* 4. Price Section */}
      <div className="flex items-baseline gap-1 w-full pt-2">
        <span className="text-[36px] leading-[44px] font-semibold text-customFont-dark-base">
          {price}
        </span>
        <span className="text-[14px] leading-[20px] text-customFont-base">
          {period}
        </span>
      </div>

      {/* 5. CTA Button Section */}
      {renderButton()}
    </div>
  );
}
