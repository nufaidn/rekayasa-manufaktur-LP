"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
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

const GAP = 8;
const MARGIN = 12;

type PanelPosition = { top: number; left: number; width: number };

function layoutLeft(el: HTMLElement): number {
  let total = 0;
  let node: HTMLElement | null = el;
  while (node) {
    total += node.offsetLeft;
    node = node.offsetParent as HTMLElement | null;
  }
  return total - window.scrollX;
}

function layoutTop(el: HTMLElement): number {
  let total = 0;
  let node: HTMLElement | null = el;
  while (node) {
    total += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return total - window.scrollY;
}

export default function MaterialGradeInfo({
  grade = "Stainless Steel",
  defaultOpen = false,
  className,
  variant = "inline",
  containerRef,
}: {
  grade?: MaterialGrade | string;
  defaultOpen?: boolean;
  className?: string;
  variant?: "inline" | "popover";
  containerRef?: React.RefObject<HTMLElement | null>;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [mounted, setMounted] = useState(false);
  const [position, setPosition] = useState<PanelPosition | null>(null);
  const [panelEl, setPanelEl] = useState<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const anchorRef = useRef<HTMLDivElement>(null);
  const info = GRADE_INFO[grade as MaterialGrade] ?? GRADE_INFO["Stainless Steel"];
  const overlay = variant === "popover";

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (panelEl?.contains(target)) return;
      setOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, panelEl]);

  useEffect(() => {
    if (!open || !overlay) return;
    const update = () => {
      const trigger = triggerRef.current;
      if (!trigger) return;
      const container = containerRef?.current ?? anchorRef.current ?? trigger;
      const width = Math.min(
        container.offsetWidth,
        Math.max(MARGIN, window.innerWidth - MARGIN * 2)
      );
      const left = Math.min(
        Math.max(layoutLeft(container), MARGIN),
        Math.max(MARGIN, window.innerWidth - width - MARGIN)
      );
      const panelHeight = panelEl?.offsetHeight ?? 0;
      const triggerTop = layoutTop(trigger);
      const triggerBottom = triggerTop + trigger.offsetHeight;
      const roomBelow = window.innerHeight - triggerBottom - GAP;
      const roomAbove = triggerTop - GAP;
      const flip =
        panelHeight > 0 && roomBelow < panelHeight && roomAbove > roomBelow;
      const rawTop = flip
        ? triggerTop - panelHeight - GAP
        : triggerBottom + GAP;
      const top = panelHeight
        ? Math.min(
            Math.max(rawTop, MARGIN),
            Math.max(MARGIN, window.innerHeight - panelHeight - MARGIN)
          )
        : rawTop;
      setPosition({ top, left, width });
    };
    update();
    const observer = new ResizeObserver(() => update());
    if (panelEl) observer.observe(panelEl);
    window.addEventListener("scroll", update, true);
    window.addEventListener("resize", update);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", update, true);
      window.removeEventListener("resize", update);
    };
  }, [open, overlay, containerRef, panelEl]);

  const panelContent = (
    <>
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
    </>
  );

  return (
    <div ref={anchorRef} className={cn(className)}>
      <button
        ref={triggerRef}
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

      {open && !overlay && (
        <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
          {panelContent}
        </div>
      )}

      {open && overlay && mounted && position
        ? createPortal(
            <div
              ref={setPanelEl}
              style={{
                top: position.top,
                left: position.left,
                width: position.width,
              }}
              className="fixed z-[60] animate-in fade-in slide-in-from-top-2 rounded-lg border border-gray-200 bg-white p-3 shadow-lg shadow-navy-900/10 duration-150"
            >
              {panelContent}
            </div>,
            document.body
          )
        : null}
    </div>
  );
}