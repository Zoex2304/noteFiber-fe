import { cn } from '@/lib/utils';
// 1. Import the child component, PricingCard
import { PricingCard, type PricingCardData } from './PricingCard';

/**
 * Define props for PricingSection
 * Pass card data and animation state
 */
interface PricingSectionProps {
  cardsData: PricingCardData[];
  isPulsing?: boolean;
}

/**
 * Reusable Pricing Section Component
 *
 * Generic, reusable wrapper for displaying pricing cards.
 * Can be used on landing pages, app pricing pages, or any pricing display.
 *
 * LOCATION: src/components/shadui/PricingSection.tsx
 */
export function PricingSection({
  cardsData,
  isPulsing,
}: PricingSectionProps) {
  return (
    // Layout logic for 3-card grid
    <div
      className={cn(
        'flex w-full flex-col items-center gap-4 lg:flex-row lg:items-stretch lg:gap-[16.064px]',
        isPulsing && 'animate-pulse' // Apply pulse animation if active
      )}
    >
      {/* Map through cards and render */}
      {cardsData.map((data) => (
        <PricingCard
          key={data.title}
          data={data}
          className="flex-1 basis-0 w-full" // Equal width distribution
        />
      ))}
    </div>
  );
}
