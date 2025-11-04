import { useRef } from "react";
import { BlogCard, type BlogCardData } from "./BlogCard";
import { Button } from "./button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// --- Data Placeholder ---
const DUMMY_BLOG_DATA: BlogCardData[] = [
  {
    id: "1",
    imageUrl: "https://placehold.co/400x225/e0e7f5/573dc1?text=Blog+Post+1",
    labels: ["Financial", "Technology"],
    subject:
      "How real-time analytics can revolutionize your financial strategy",
    description:
      "Perfect for small businesses or startups, our Starter Plan gives you the essential tools.",
  },
  {
    id: "2",
    imageUrl: "https://placehold.co/400x225/e0e7f5/573dc1?text=Blog+Post+2",
    labels: ["Investment", "SaaS"],
    subject: "The 5 SaaS metrics every investor needs to track in 2026",
    description:
      "Gain valuable insights with powerful, real-time analytics and customizable reports.",
  },
  {
    id: "3",
    imageUrl: "https://placehold.co/400x225/e0e7f5/573dc1?text=Blog+Post+3",
    labels: ["Productivity"],
    subject: "Streamlining Your Workflow: A Guide to NoteFiber Features",
    description:
      "Create your account in minutes and tailor the platform to meet your company's unique needs.",
  },
  {
    id: "4",
    imageUrl: "https://placehold.co/400x225/e0e7f5/573dc1?text=Blog+Post+4",
    labels: ["Financial", "Startups"],
    subject: "Another amazing blog post about financial management",
    description:
      "Our expert support team is available 24/7 to assist with any questions you might have.",
  },
  // ... (bisa ditambahkan 6 lagi, tapi 4 cukup untuk demo scroll)
];
// --------------------

/**
 * Komponen Reusable "Blog Carousel"
 *
 * Ini adalah "trailer" yang berisi 3+ card
 * dengan scroll horizontal dan tombol glass.
 */
export function BlogCarousel() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Fungsi untuk menggeser carousel
  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.8; // Geser 80%
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    // Container Carousel (relative untuk menampung tombol absolute)
    <div className="relative w-full">
      {/* Tombol Kiri (Glass) */}
      <Button
        variant="glass"
        size="icon"
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex"
        onClick={() => scroll("left")}
      >
        <ChevronLeft />
      </Button>

      {/* Viewport (Trailer) */}
      <div
        ref={scrollContainerRef}
        className="
          flex w-full items-stretch 
          gap-4 lg:gap-[16.064px]
          overflow-x-auto 
          scroll-smooth 
          snap-x snap-mandatory
          pb-4 
        "
        style={{ scrollbarWidth: "none" }} // Sembunyikan scrollbar
      >
        {DUMMY_BLOG_DATA.map((blogPost) => (
          // 'snap-start' penting untuk carousel
          <div key={blogPost.id} className="snap-start">
            <BlogCard data={blogPost} />
          </div>
        ))}
      </div>

      {/* Tombol Kanan (Glass) */}
      <Button
        variant="glass"
        size="icon"
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex"
        onClick={() => scroll("right")}
      >
        <ChevronRight />
      </Button>
    </div>
  );
}
