import * as React from "react";

interface HeaderRegularProps {
  subject: string;
  description: string;
}

/**
 * Komponen Reusable "Header Regular"
 * Digunakan di dalam card (seperti BlogCard)
 *
 * Specs:
 * - Container: flex-col, gap-[14.547px]
 * - Subject: 28.367px (text-display-h5)
 * - Description: 18.184px (text-body-1)
 */
export function HeaderRegular({ subject, description }: HeaderRegularProps) {
  return (
    <div
      className="
        flex flex-col items-start self-stretch
        gap-3 lg:gap-[14.547px]
      "
    >
      {/* 1. Subject (Judul) */}
      <h3
        className="
          font-normal text-customFont-dark-base
          text-display-h5
          leading-[1.4]
        "
      >
        {subject}
      </h3>

      {/* 2. Description (Deskripsi) */}
      <p
        className="
          font-normal text-customFont-base
          text-body-1
          leading-[1.4]
          self-stretch
        "
      >
        {description}
      </p>
    </div>
  );
}
