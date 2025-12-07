import { Link } from "react-router-dom";
import { Button } from "./button";
import { PriceAdvantageItem } from "./PriceAdvantageItem";
import { cn } from "@/lib/utils";

// Definisikan tipe untuk data yang akan ditampilkan
export interface PricingCardData {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  slug?: string; // Added slug property
}

interface PricingCardProps {
  data: PricingCardData;
  className?: string; // Add optional className prop
}

/**
 * Komponen Reusable "Pricing Card"
 *
 * LOKASI: src/components/shadui/PricingCard.tsx
 *
 * Fitur:
 * 1. Deskripsi <p> diberi 'min-h-[8rem]' untuk meratakan tombol.
 * 2. Auto-wrap menggunakan max-width CSS (lebih natural dan responsive).
 */
export function PricingCard({ data, className }: PricingCardProps) {
  const { title, price, period, description, features, isPopular, slug } = data;

  // Determine the target URL
  // If slug is explicitly 'free' or price indicates free, redirect to dashboard
  const isFree = slug === 'free' || price === '$0.00' || price === 'Rp0';

  // Use slug if available, otherwise fallback to title-based slug (for backward compatibility)
  const planSlug = slug || title.toLowerCase().replace(/\s+/g, "-");

  const targetUrl = isFree
    ? "/app/dashboard"
    : `/checkout?plan=${planSlug}&price=${price.replace("$", "").replace("Rp", "").replace(/,/g, "")}&period=${period.includes("month") ? "monthly" : "yearly"}`;

  return (
    // Container Card
    <div
      className={cn(
        "flex w-full flex-col items-start rounded-[26.332px] border-[0.439px] p-5 lg:w-auto lg:p-[28.526px] gap-4 lg:gap-[21.943px] bg-white transition-all duration-300 relative",
        isPopular ? "border-royal-violet-base shadow-lg scale-105 z-10" : "border-customFont-base",
        className // Merge external className
      )}
    >
      {isPopular && (
        <div className="absolute top-0 right-0 overflow-hidden w-[100px] h-[100px] pointer-events-none rounded-tr-[26.332px] z-20">
          <div className="absolute top-[22px] -right-[30px] rotate-45 bg-royal-violet-base text-white w-[140px] text-center font-bold text-[10px] py-1 shadow-md tracking-wider uppercase">
            Most Popular
          </div>
        </div>
      )}

      {/* 1. Judul Plan */}
      <h3
        className="
          self-stretch font-normal text-customFont-dark-base
          text-display-h5
        "
      >
        {title}
      </h3>

      {/* 2. Frame Harga */}
      <div className="flex items-center gap-2 lg:gap-[10.971px]">
        {/* Harga */}
        <span
          className="
            font-normal text-customFont-dark-base
            text-display-h3
          "
        >
          {price}
        </span>
        {/* Periode */}
        <span
          className="
            font-normal text-customFont-base
            text-body-base
          "
        >
          {period ? period.toLowerCase().startsWith('month') ? '/ month' : '/ year' : ''}
        </span>
      </div>

      {/* 3. Deskripsi dengan auto-wrap natural */}
      <p
        className="
          self-stretch font-normal text-customFont-base
          text-body-1
          min-h-[8rem]
          max-w-[50ch]
        "
      >
        {description}
      </p>

      {/* 4. Tombol */}
      <Link to={targetUrl} className="w-full">
        <Button
          variant="custom-outline"
          size="card-outline"
          className="relative overflow-hidden group transition-all duration-300 hover:border-royal-violet-base hover:shadow-[0_0_20px_rgba(112,80,240,0.3)] w-full"
        >
          <span className="relative z-10">Get Started</span>
          <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-royal-violet-base/20 to-transparent z-0" />
        </Button>
      </Link>

      {/* 5. Frame List Fitur */}
      <div className="flex flex-col items-start gap-2 lg:gap-[8.762px]">
        {features.map((feature) => (
          <PriceAdvantageItem key={feature} text={feature} />
        ))}
      </div>
    </div>
  );
}
