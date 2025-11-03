import { SectionContainer } from "@/components/shadui/SectionContainer.tsx";

/**
 * Section 6 (Frame 6)
 *
 * Specs:
 * - flex, flex-col, items-center
 * - w-full (Mobile)
 * - gap-3 (Mobile)
 * - lg:gap-[15.045px] (Desktop)
 * - px-4 (Mobile padding)
 * - lg:px-0 (Desktop no padding)
 */
export function Section6() {
  return (
    <SectionContainer>
      <section className="flex w-full flex-col items-center gap-3 px-4 lg:gap-[15.045px] lg:px-0">
        {/* Placeholder Content */}
        <div className="h-64 w-full rounded-lg bg-purple-100 opacity-80 lg:h-96">
          <p className="p-4 text-body-base font-semibold text-purple-800">
            Section 6 Placeholder
          </p>
        </div>
      </section>
    </SectionContainer>
  );
}
