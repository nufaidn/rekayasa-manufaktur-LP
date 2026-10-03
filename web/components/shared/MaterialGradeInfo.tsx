"use client";

import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import { cn } from "@/lib/utils";

type MaterialGrade = "SS 304" | "SS 201" | "Mild Steel" | "Stainless Steel";

const GRADE_INFO: Record<MaterialGrade, { title: string; points: string[] }> = {
  "SS 304": {
    title: "SS 304",
    points: [
      "Lebih tahan korosi dibanding SS 201",
      "Food-grade safe, aman untuk kontak makanan",
      "Cocok untuk area lembap, outdoor, atau paparan cairan — grade premium",
    ],
  },
  "SS 201": {
    title: "SS 201",
    points: [
      "Lebih ekonomis dengan kekuatan struktural baik",
      "Cocok untuk kebutuhan indoor & umum non-food-contact",
    ],
  },
  "Mild Steel": {
    title: "Mild Steel",
    points: [
      "Treatment anti karat + finishing powder coating",
      "Kekuatan tinggi dengan biaya lebih efisien",
    ],
  },
  "Stainless Steel": {
    title: "Stainless Steel",
    points: [
      "Tahan karat & mudah dibersihkan",
      "Tersedia grade SS 304 (premium) & SS 201 (ekonomis)",
    ],
  },
};

export default function MaterialGradeInfo({
  grade = "Stainless Steel",
  defaultOpen = false,
  className,
}: {
  grade?: MaterialGrade | string;
  defaultOpen?: boolean;
  className?: string;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const info = GRADE_INFO[grade as MaterialGrade] ?? GRADE_INFO["Stainless Steel"];

  return (
    <div className={cn("relative isolate", className)}>
      <button
        type="button"
        aria-expanded={open}
        aria-label={`Info grade ${info.title}`}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[11px] font-medium text-navy-600 transition-colors hover:border-brand/30 hover:text-brand"
      >
        {info.title}
        <ChevronDown
          className={cn(
            "h-3 w-3 transition-transform duration-200",
            open && "rotate-180"
          )}
          aria-hidden
        />
      </button>
      {open && (
        <div className="relative z-10 mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3 shadow-sm">
          <p className="flex items-center gap-1 text-xs font-semibold text-navy-700">
            <Info className="h-3 w-3 text-brand" aria-hidden />
            {info.title}
          </p>
          <ul className="mt-1.5 space-y-1 text-xs leading-relaxed text-gray-600">
            {info.points.map((point) => (
              <li key={point} className="flex gap-1.5">
                <span
                  className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand"
                  aria-hidden
                />
                {point}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}