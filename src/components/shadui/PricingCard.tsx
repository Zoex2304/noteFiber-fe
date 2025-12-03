
import { Button } from "./button";
import { PriceAdvantageItem } from "./PriceAdvantageItem";

// Definisikan tipe untuk data yang akan ditampilkan
export interface PricingCardData {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
}

interface PricingCardProps {
  data: PricingCardData;
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
export function PricingCard({ data }: PricingCardProps) {
  const { title, price, period, description, features } = data;

  return (
    // Container Card
    <div
      className="
        flex w-full flex-col items-start
        rounded-[26.332px] border-[0.439px] border-customFont-base
        p-5 lg:w-auto lg:p-[28.526px] 
        gap-4 lg:gap-[21.943px]
        bg-white
      "
    >
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
          {period}
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
      <Button
        variant="custom-outline"
        size="card-outline"
        className="relative overflow-hidden group transition-all duration-300 hover:border-royal-violet-base hover:shadow-[0_0_20px_rgba(112,80,240,0.3)]"
      >
        <span className="relative z-10">Get Started</span>
        <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-royal-violet-base/20 to-transparent z-0" />
      </Button>

      {/* 5. Frame List Fitur */}
      <div className="flex flex-col items-start gap-2 lg:gap-[8.762px]">
        {features.map((feature) => (
          <PriceAdvantageItem key={feature} text={feature} />
        ))}
      </div>
    </div>
  );
}
