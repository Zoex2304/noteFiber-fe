import { SectionContainer } from "@/components/shadui/SectionContainer.tsx";

/**
 * Section 7 (Frame 7)
 *
 * Specs:
 * - flex, flex-col, items-center
 * - w-full (Mobile)
 * - gap-4 (Mobile)
 * - lg:gap-[18.451px] (Desktop)
 * - px-4 (Mobile padding)
 * - lg:px-0 (Desktop no padding)
 */
export function Section7() {
  return (
    <SectionContainer>
      <section className="flex w-full flex-col items-center gap-4 px-4 lg:gap-[18.451px] lg:px-0">
        {/* Placeholder Content */}
        <div className="h-64 w-full rounded-lg bg-pink-100 opacity-80 lg:h-96">
          <p className="p-4 text-body-base font-semibold text-pink-800">
            Section 7 Placeholder
          </p>
        </div>
      </section>
    </SectionContainer>
  );
}
