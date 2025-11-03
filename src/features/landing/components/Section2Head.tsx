import { BridgingHeader } from "@/components/shadui/BridgingHeader";
import { CompanyLogoMarquee } from "./CompanyLogoMarquee";

/**
 * Konten untuk bagian atas Section 2.
 * Berisi 'company-sec' dan 'BridgingHeader'.
 */
export function Section2Head() {
  return (
    <div className="flex w-full flex-col items-center gap-10 lg:gap-[100px]">
      {/* 1. company-sec */}
      <div className="flex w-full flex-col items-center gap-[36px] ">
        {/* _company-sec-head */}
        <div className="w-full max-w-4xl px-4 lg:px-0">
          <p
            className="
              text-customFont-dark-base 
              font-normal 
              text-center
              text-display-h5
              lg:text-display-h4
            "
          >
            Trusted over 2k+ Company
          </p>
        </div>

        {/* 2. WRAPPER untuk Marquee dengan styling spesifik */}
        <div
          className="
            flex w-full flex-col items-center justify-center self-stretch
            px-4 py-5
            lg:px-[181.566px] lg:py-[19.629px]
          "
          style={{
            gap: "39.258px",
          }}
        >
          <CompanyLogoMarquee />
        </div>
      </div>

      {/* 3. Bridging-header-section2 (Komponen Reusable) */}
      <BridgingHeader
        tagText="Our workflow"
        headerText="How our platform makes your workflow easier"
      />
    </div>
  );
}
