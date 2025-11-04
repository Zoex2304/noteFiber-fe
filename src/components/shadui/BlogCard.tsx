import { Tag } from "./Tag";
import { HeaderRegular } from "./HeaderRegular";
import { Button } from "./button";

// Definisikan data untuk satu blog card
export interface BlogCardData {
  id: string;
  imageUrl: string;
  labels: string[];
  subject: string;
  description: string;
}

interface BlogCardProps {
  data: BlogCardData;
}

/**
 * Komponen Reusable "Blog Card"
 */
export function BlogCard({ data }: BlogCardProps) {
  return (
    // Container Card (Dibuat agar 'flex-shrink: 0' untuk carousel)
    <div className="flex w-[300px] flex-shrink-0 flex-col gap-4 lg:w-[400px]">
      {/* === Frame 20 (Gambar + Label) === */}
      <div className="flex flex-col items-start gap-2 lg:gap-[7.274px]">
        {/* 1. Gambar */}
        <img
          src={data.imageUrl}
          alt={data.subject}
          className="aspect-video w-full rounded-lg object-cover"
        />

        {/* 2. 'frame 22' (Label Trailer) */}
        <div className="flex flex-wrap items-start gap-2 lg:gap-[7.274px]">
          {data.labels.map((label) => (
            // Menggunakan Tag reusable, 'size="small"', dan 'iconSrc' opsional
            <Tag key={label} size="small">
              {label}
            </Tag>
          ))}
        </div>
      </div>

      {/* === Frame 19 (Teks + Tombol) === */}
      <div className="flex flex-col items-start gap-4 lg:gap-[14.547px]">
        {/* 3. Header Regular (Reusable) */}
        <HeaderRegular subject={data.subject} description={data.description} />

        {/* 4. Tombol "Read More" */}
        <Button variant="outline" size="card-outline" className="w-auto">
          Read More
        </Button>
      </div>
    </div>
  );
}
