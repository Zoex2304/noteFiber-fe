import { SectionContainer } from "@/components/shadui/SectionContainer.tsx";

/**
 * Section 8 (Frame 8)
 *
 * Specs:
 * - flex, flex-col, items-center
 * - w-full (Mobile)
 * - gap-5 (Mobile)
 * - lg:gap-[22.629px] (Desktop)
 * - px-4 (Mobile padding)
 * - lg:px-0 (Desktop no padding)
 */
export function Section8() {
  return (
    <SectionContainer>
      <section className="flex w-full flex-col items-center gap-5 px-4 lg:gap-[22.629px] lg:px-0">
        {/* Placeholder Content */}
        <div className="h-64 w-full rounded-lg bg-gray-200 opacity-80 lg:h-96">
          <p className="p-4 text-body-base font-semibold text-gray-800">
            Section 8 Placeholder
          </p>
        </div>
      </section>
    </SectionContainer>
  );
}
