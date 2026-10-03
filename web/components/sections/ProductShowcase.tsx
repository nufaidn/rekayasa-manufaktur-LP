"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  X,
} from "lucide-react";
import { products } from "@/lib/data";
import type { Product } from "@/lib/types";
import TiltCard from "@/components/3d/TiltCard";
import ScrollReveal from "@/components/shared/ScrollReveal";
import MaterialGradeInfo from "@/components/shared/MaterialGradeInfo";
import ProductWatermark from "@/components/shared/ProductWatermark";
import { scrollToSection } from "@/lib/scroll";
import { cn } from "@/lib/utils";
import { waUrlWithText } from "@/lib/contact";

function ProductCarousel({
  images,
  alt,
}: {
  images: string[];
  alt: string;
}) {
  const [index, setIndex] = useState(0);
  const touchX = useRef<number | null>(null);
  const count = images.length;

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count]
  );

  // Single image → plain image, no carousel chrome
  if (count <= 1) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={images[0]}
        alt={alt}
        loading="lazy"
        className="h-full w-full object-contain"
        style={{ transform: "translateZ(40px)" }}
      />
    );
  }

  return (
    <div
      className="absolute inset-0 touch-pan-y"
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
        touchX.current = null;
      }}
    >
      {/* Slides — pointer-events-none supaya klik tembus ke panah/dots */}
      <div
        className="pointer-events-none flex h-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt=""
            aria-hidden
            loading="lazy"
            draggable={false}
            className="h-full w-full shrink-0 select-none object-contain"
          />
        ))}
      </div>

      {/* Arrows */}
      <button
        type="button"
        aria-label={`Foto sebelumnya: ${alt}`}
        onClick={(e) => {
          e.stopPropagation();
          go(-1);
        }}
        className="absolute left-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy-800 opacity-100 shadow-sm transition-all hover:bg-white active:scale-90 md:opacity-0 md:group-hover:opacity-100"
      >
        <ChevronLeft className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        aria-label={`Foto berikutnya: ${alt}`}
        onClick={(e) => {
          e.stopPropagation();
          go(1);
        }}
        className="absolute right-2 top-1/2 z-10 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy-800 opacity-100 shadow-sm transition-all hover:bg-white active:scale-90 md:opacity-0 md:group-hover:opacity-100"
      >
        <ChevronRight className="h-4 w-4" aria-hidden />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
        {images.map((src, i) => (
          <button
            key={src}
            type="button"
            aria-label={`Ke foto ${i + 1} dari ${count}`}
            onClick={(e) => {
              e.stopPropagation();
              setIndex(i);
            }}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === index
                ? "w-4 bg-white"
                : "w-1.5 bg-white/60 hover:bg-white/80"
            )}
          />
        ))}
      </div>
    </div>
  );
}

function ProductModal({
  product,
  onClose,
}: {
  product: Product;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(0);
  const closeRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const images = product.gallery.length > 0 ? product.gallery : [product.image];
  const count = images.length;
  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + count) % count),
    [count]
  );

  useEffect(() => {
    const prevFocus = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab") {
        const dialog = dialogRef.current;
        if (!dialog) return;
        const focusables = Array.from(
          dialog.querySelectorAll<HTMLElement>(
            'button, a[href], [tabindex]:not([tabindex="-1"])'
          )
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    window.__lenis?.stop();
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    return () => {
      window.removeEventListener("keydown", onKey);
      window.__lenis?.start();
      document.body.style.overflow = "";
      prevFocus?.focus();
    };
  }, [onClose]);

  // Harga sengaja tidak ikut karena masih bisa berubah (PPN & negosiasi).
  const waHref = waUrlWithText(
    `Halo Min!, saya tertarik dengan produk ${product.name}. Mohon info lebih lanjut.`
  );

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Detail ${product.name}`}
      className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4"
    >
      {/* Backdrop */}
      <div
        aria-hidden
        onClick={onClose}
        className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm"
      />
      <div
        ref={dialogRef}
        className="relative flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:overflow-hidden sm:rounded-2xl"
      >
        <button
          ref={closeRef}
          type="button"
          aria-label="Tutup detail produk"
          onClick={onClose}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-navy-800 shadow-sm transition-colors hover:bg-white"
        >
          <X className="h-5 w-5" aria-hidden />
        </button>

        <div className="grid sm:grid-cols-2">
          {/* Galeri — DESKTOP (sm+): kolom kiri & kanan sama tinggi (grid stretch
              default). Wrapper sm:h-full → ikut tinggi kolom kanan (max-h-[90vh]);
              img h-full + object-contain → mengisi penuh wrapper, letterbox
              dengan bg-gray-100 muncul rapi di sisi yang kosong, tanpa crop.
              MOBILE: tidak berubah (aspect-[4/5] fixed, tanpa sm:). */}
          <div className="relative w-full aspect-[4/5] overflow-hidden bg-gray-100 ring-1 ring-inset ring-gray-900/5 sm:h-full sm:max-h-[90vh]">
            <div
              className="flex h-full transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
              style={{ transform: `translateX(-${index * 100}%)` }}
            >
              {images.map((src) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={src}
                  src={src}
                  alt=""
                  aria-hidden
                  loading="lazy"
                  draggable={false}
                  className="h-full w-full shrink-0 select-none object-contain sm:h-full"
                />
              ))}
            </div>
            {count > 1 && (
              <>
                <button
                  type="button"
                  aria-label={`Foto sebelumnya: ${product.name}`}
                  onClick={() => go(-1)}
                  className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy-800 shadow-sm transition-all hover:bg-white active:scale-90"
                >
                  <ChevronLeft className="h-5 w-5" aria-hidden />
                </button>
                <button
                  type="button"
                  aria-label={`Foto berikutnya: ${product.name}`}
                  onClick={() => go(1)}
                  className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-navy-800 shadow-sm transition-all hover:bg-white active:scale-90"
                >
                  <ChevronRight className="h-5 w-5" aria-hidden />
                </button>
                <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5">
                  {images.map((src, i) => (
                    <button
                      key={src}
                      type="button"
                      aria-label={`Ke foto ${i + 1} dari ${count}`}
                      onClick={() => setIndex(i)}
                      className={cn(
                        "h-1.5 rounded-full transition-all duration-300",
                        i === index
                          ? "w-4 bg-white"
                          : "w-1.5 bg-white/60 hover:bg-white/80"
                      )}
                    />
                  ))}
                </div>
              </>
            )}
            <ProductWatermark />
          </div>

          {/* Detail — panel kanan scroll independen di desktop (sm+),
              ikut scroll seluruh modal di mobile */}
          <div className="flex flex-col p-5 sm:max-h-[90vh] sm:overflow-y-auto sm:p-7">
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-brand">
              {product.categoryName}
            </span>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-navy-800 sm:text-2xl">
              {product.name}
            </h3>
            {/* Harga disembunyikan sementara (belum final) — kartu hanya
                "Lihat Detail". Saat harga sudah fix, balikkan jadi:
                <p className="mt-2 text-lg font-bold tracking-tight text-navy-700">
                  {product.price}
                </p> */}
            <h4 className="mt-2 text-lg font-bold tracking-tight text-navy-700">
              Lihat Detail
            </h4>
            <p className="mt-1 text-xs font-medium uppercase tracking-wider text-gray-400">
              {product.sku}
            </p>
            <ul className="mt-4 space-y-1.5">
              {product.highlights.map((highlight) => (
                <li
                  key={highlight}
                  className="flex items-start gap-2 text-sm leading-relaxed text-gray-600"
                >
                  <span
                    className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-brand"
                    aria-hidden
                  />
                  {highlight}
                </li>
              ))}
            </ul>
            <p className="mt-4 border-t border-gray-100 pt-4 text-sm leading-relaxed text-gray-600">
              {product.description}
            </p>
            <MaterialGradeInfo
              grade={product.materialGrade}
              defaultOpen
              className="mt-4"
            />
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-[#25D366] px-6 py-3 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:brightness-105 active:scale-[0.98]"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              Pesan via WhatsApp
            </a>
            <p className="mt-2.5 text-xs text-gray-400">
              Konsultasi gratis & penawaran harga — tim kami merespons dalam
              1x24 jam.
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default function ProductShowcase() {
  const showcase = products.filter((p) => p.featured).slice(0, 8);
  const [selected, setSelected] = useState<Product | null>(null);

  const scrollTo = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    scrollToSection(href, e);
  };

  return (
    <section id="showcase" className="bg-white py-16 sm:py-20 md:py-28">
      <div className="container-brand">
        <ScrollReveal className="mb-10 max-w-2xl sm:mb-12 md:mb-14">
          <p className="text-[13px] font-semibold uppercase tracking-[0.18em] text-brand">
            Koleksi Unggulan
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-navy-800 md:text-4xl">
            Produk Pilihan Kami
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-500 md:text-lg">
            Dirancang dengan presisi dan material premium — setiap produk
            melalui proses engineering yang ketat.
          </p>
        </ScrollReveal>

        <ScrollReveal stagger>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {showcase.map((product) => (
              <TiltCard key={product.id} className="h-full">
                <article
                  role="button"
                  tabIndex={0}
                  aria-label={`Lihat detail ${product.name}`}
                  onClick={() => setSelected(product)}
                  onKeyDown={(e) => {
                    if (e.key !== "Enter" && e.key !== " ") return;
                    if (e.target !== e.currentTarget) return;
                    e.preventDefault();
                    setSelected(product);
                  }}
                  className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm transition-colors duration-150 hover:border-brand/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/60"
                >
                  <div className="relative aspect-[4/5] overflow-hidden bg-gray-100 ring-1 ring-inset ring-black/5">
                    <ProductCarousel
                      images={
                        product.gallery.length > 0
                          ? product.gallery
                          : [product.image]
                      }
                      alt={product.name}
                    />
                    <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-medium tracking-wide text-navy-700 shadow-sm">
                      {product.categoryName}
                    </span>
                    <ProductWatermark />
                  </div>
                  <div className="flex flex-1 flex-col p-4 sm:p-5">
                    <h3 className="text-sm font-semibold leading-snug text-navy-800 sm:text-[15px]">
                      {product.name}
                    </h3>
                    <ul className="mt-2 space-y-1">
                      {product.highlights.slice(0, 2).map((highlight) => (
                        <li
                          key={highlight}
                          className="flex items-start gap-1.5 text-xs leading-relaxed text-gray-500"
                        >
                          <span
                            className="mt-[5px] h-1 w-1 shrink-0 rounded-full bg-brand"
                            aria-hidden
                          />
                          {highlight}
                        </li>
                      ))}
                    </ul>
                    <MaterialGradeInfo
                      grade={product.materialGrade}
                      className="mt-3"
                    />
                    <div className="mt-auto flex justify-end pt-3">
                      {/* Harga disembunyikan sementara — nanti dimunculkan lagi saat
                          harga final sudah fix. Buka komentar blok ini utk menampilkannya:
                      <p className="text-sm font-bold tracking-tight text-navy-700">
                        {product.price}
                      </p> */}
                      <button
                        type="button"
                        onClick={() => setSelected(product)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-brand transition-colors hover:text-brand-dark"
                      >
                        Lihat Detail
                        <ArrowUpRight className="h-3 w-3" aria-hidden />
                      </button>
                    </div>
                  </div>
                </article>
              </TiltCard>
            ))}
          </div>
        </ScrollReveal>

        <div className="mt-12 text-center">
          <a
            href="#cta"
            onClick={(e) => scrollTo(e, "#cta")}
            className="group inline-flex items-center gap-2 rounded-full bg-navy-800 px-8 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-navy-700 active:scale-[0.98]"
          >
            Minta Katalog Lengkap
            <ArrowRight
              className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
              aria-hidden
            />
          </a>
        </div>
      </div>

      {selected && (
        <ProductModal
          key={selected.id}
          product={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </section>
  );
}