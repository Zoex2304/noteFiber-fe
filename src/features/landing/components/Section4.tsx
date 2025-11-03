import { SectionContainer } from "@/components/shadui/SectionContainer.tsx";

/**
 * Section 4 (Frame 4)
 *
 * Specs:
 * - flex, flex-col, items-center
 * - w-full (Mobile)
 * - lg:max-w-[1766.593px] (Desktop)
 * - gap-3 (Mobile)
 * - lg:gap-[12.268px] (Desktop)
 * - px-4 (Mobile padding)
 * - lg:px-0 (Desktop no padding)
 */
export function Section4() {
  return (
    <SectionContainer>
      <section className="flex w-full flex-col items-center gap-3 px-4 lg:max-w-[1766.593px] lg:gap-[12.268px] lg:px-0">
        {/* Placeholder Content */}
        <div className="h-64 w-full rounded-lg bg-yellow-100 opacity-80 lg:h-96">
          <p className="p-4 text-body-base font-semibold text-yellow-800">
            Section 4 Placeholder
          </p>
        </div>
      </section>
    </SectionContainer>
  );
}
