import { cn } from '@/lib/utils';
// 1. Impor "anak"-nya, PricingCard
import { PricingCard, type PricingCardData } from './PricingCard';

/**
 * Definisikan props untuk "Trailer"
 * Kita perlu meneruskan data card dan status animasi
 */
interface PricingCardTrailerProps {
  cardsData: PricingCardData[];
  isPulsing?: boolean;
}

/**
 * Komponen Reusable "Pricing Card Trailer"
 *
 * Ini adalah wrapper reusable yang Anda minta.
 * Isinya adalah layout 3-card (Basic, Pro, Enterprise).
 *
 * LOKASI: src/components/shadui/PricingCardTrailer.tsx
 */
export function PricingCardTrailer({
  cardsData,
  isPulsing,
}: PricingCardTrailerProps) {
  return (
    // 2. Ini adalah logic layout yang kita pindahkan
    //    dari MainContentSection5
    <div
      className={cn(
        'flex w-full flex-col items-center gap-4 lg:flex-row lg:items-stretch lg:gap-[16.064px]',
        isPulsing && 'animate-pulse' // Terapkan animasi pulse jika ada
      )}
    >
      {/* 3. Logic .map() sekarang ada di sini */}
      {cardsData.map((data) => (
        <PricingCard
          key={data.title}
          data={data}
          className="flex-1 basis-0 w-full" // Enforce equal width distribution
        />
      ))}
    </div>
  );
}
