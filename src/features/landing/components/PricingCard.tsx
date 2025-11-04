import { Button } from '@/components/shadui/button';
import { PriceAdvantageItem } from './PriceAdvantageItem';

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
 * Specs: w-[427.887px], p-[28.526px], flex-col, gap-[21.943px], rounded, border
 */
export function PricingCard({ data }: PricingCardProps) {
  const { title, price, period, description, features } = data;

  return (
    // Container Card
    <div
      className="
        flex w-full flex-col items-start
        rounded-[26.332px] border-[0.439px] border-customFont-base
        p-5 lg:w-[427.887px] lg:p-[28.526px] 
        gap-4 lg:gap-[21.943px]
      "
    >
      {/* 1. Judul Plan (Specs: 26.311px) */}
      <h3
        className="
          self-stretch font-normal text-customFont-dark-base
          text-display-h5
        "
      >
        {title}
      </h3>

      {/* 2. Frame Harga (Specs: flex, items-center, gap-[10.971px]) */}
      <div className="flex items-center gap-2 lg:gap-[10.971px]">
        {/* Harga (Specs: 36.867px) */}
        <span
          className="
            font-normal text-customFont-dark-base
            text-display-h3
          "
        >
          {price}
        </span>
        {/* Periode (Specs: 17.554px) */}
        <span
          className="
            font-normal text-customFont-base
            text-body-base
          "
        >
          {period}
        </span>
      </div>

      {/* 3. Deskripsi (Specs: 21.943px) */}
      <p
        className="
          self-stretch font-normal text-customFont-base
          text-body-1
        "
      >
        {description}
      </p>

      {/* 4. Tombol (menggunakan size 'card-outline' baru) */}
      <Button variant="outline" size="card-outline">
        Get Started
      </Button>

      {/* 5. Frame List Fitur (Specs: flex-col, gap-[8.762px]) */}
      <div className="flex flex-col items-start gap-2 lg:gap-[8.762px]">
        {features.map((feature) => (
          <PriceAdvantageItem key={feature} text={feature} />
        ))}
      </div>
    </div>
  );
}
