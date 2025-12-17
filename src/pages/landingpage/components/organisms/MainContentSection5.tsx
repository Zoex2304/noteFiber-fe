import { useState } from "react";
import { SectionHeader } from "@/components/shadui/SectionHeader";
import {
  SwitchPricing,
  type PricingPeriod,
} from "@/components/shadui/SwitchPricing";
// 1. Hapus import 'PricingCard' (sudah tidak diperlukan di sini)
// import { PricingCard, type PricingCardData } from '@/components/shadui/PricingCard';
//    Import 'PricingCardData' masih diperlukan untuk 'monthlyData'
import type { PricingCardData } from "@/components/shadui/PricingCard";

// 2. Impor "Trailer" reusable yang baru
import { PricingCardTrailer } from "@/components/shadui/PricingCardTrailer";
// 3. Hapus 'cn' (sudah tidak diperlukan di sini)
// import { cn } from '@/lib/utils';

// --- Data Placeholder (Tetap di sini) ---
const monthlyData: PricingCardData[] = [
  {
    title: "Free",
    price: "Rp 0",
    period: "/ month",
    description:
      "Try basic AI note-taking with limited credits",
    features: [
      "AI transcription: 20 notes/month",
      "Basic text search",
      "5GB storage",
      "Export to PDF/TXT",
      "Community support"
    ],
  },
  {
    title: "Pro",
    price: "Rp 350.000",
    period: "/ month",
    description:
      "More credits with semantic search and AI chatbot",
    features: [
      "AI transcription: 200 notes/month",
      "Semantic search (find by meaning)",
      "AI Chatbot for notes Q&A",
      "Smart summarization",
      "Priority support"
    ],
  },
  {
    title: "Business",
    price: "Rp 1.250.000",
    period: "/ month",
    description:
      "High volume credits for professional use",
    features: [
      "AI transcription: 1000 notes/month",
      "Advanced semantic search",
      "API access included",
      "200GB storage",
      "Dedicated support"
    ],
  },
];

const yearlyData: PricingCardData[] = [
  { 
    ...monthlyData[0], 
    title: "Free (Yearly)",
    price: "Rp 0", 
    period: "/ year",
    description: "Free forever with yearly commitment",
    features: [
      "AI transcription: 240 notes/year",
      "Basic text search",
      "5GB storage",
      "Export to PDF/TXT",
      "Community support"
    ]
  },
  { 
    ...monthlyData[1], 
    title: "Pro (Yearly)",
    price: "Rp 3.500.000", 
    period: "/ year",
    description: "Save Rp 700.000 with yearly billing",
    features: [
      "AI transcription: 2400 notes/year",
      "Semantic search (find by meaning)",
      "AI Chatbot for notes Q&A",
      "Smart summarization",
      "Priority support"
    ]
  },
  { 
    ...monthlyData[2], 
    title: "Business (Yearly)",
    price: "Rp 12.000.000", 
    period: "/ year",
    description: "Save Rp 3.000.000 with yearly billing",
    features: [
      "AI transcription: 12000 notes/year",
      "Advanced semantic search",
      "API access included",
      "200GB storage",
      "Dedicated support"
    ]
  },
];
// --------------------

/**
 * Ini adalah "Konten Murni" untuk Section 5.
 *
 * DIPERBARUI: Logic .map() telah diekstraksi
 * ke <PricingCardTrailer />
 */
export function MainContentSection5() {
  const [period, setPeriod] = useState<PricingPeriod>("monthly");
  const [isPulsing, setIsPulsing] = useState(false);

  const dataToDisplay = period === "monthly" ? monthlyData : yearlyData;

  const handleToggle = (newPeriod: PricingPeriod) => {
    if (newPeriod === period) return;
    setPeriod(newPeriod);
    setIsPulsing(true);
    setTimeout(() => setIsPulsing(false), 500);
  };

  return (
    <>
      {/* Container 'WrapperMainContent5' */}
      <div
        className="
          flex w-full flex-col items-center
          px-4 lg:px-[96.917px]
          gap-10 lg:gap-[53.979px]
        "
      >
        {/* 2. Instance Header (Varian Tengah) */}
        <SectionHeader
          align="center"
          tagText="Pricing"
          headerText="Experience simple and fully transparent pricing"
          highlightLastWord={true}
        />

        {/* 3. 'frame11' (Pricing Content) */}
        <div className="flex flex-col items-center gap-6 lg:gap-[26.99px]">
          {/* 3a. Switcher Pricing */}
          <SwitchPricing activePeriod={period} onToggle={handleToggle} />

          {/* 3b. 'MainContentPricing' (Card Container) */}
          {/* --- PERBAIKAN ARSITEKTUR --- */}
          {/* Logic .map() dan 'cn' dihapus dari sini */}
          {/* dan diganti dengan satu panggilan komponen reusable */}
          <PricingCardTrailer cardsData={dataToDisplay} isPulsing={isPulsing} />
          {/* --------------------------- */}
        </div>
      </div>
    </>
  );
}