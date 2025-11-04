import { PotIcon } from "@/components/shadui/PotIcon";
import { Check } from "lucide-react"; // Menggunakan ikon Check

interface PriceAdvantageItemProps {
  text: string;
}

/**
 * Komponen Reusable "Price Advantage Item"
 *
 * Specs: flex, items-center, gap-[6.583px]
 */
export function PriceAdvantageItem({ text }: PriceAdvantageItemProps) {
  return (
    <div className="flex items-center gap-2 lg:gap-[6.583px]">
      {/* 1. Pot Icon (menggunakan varian 'xs' baru) */}
      <PotIcon icon={Check} size="xs" />

      {/* 2. Teks Fitur */}
      <p className="font-normal text-customFont-base text-body-base">{text}</p>
    </div>
  );
}
