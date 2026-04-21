"use client";

import { useState, useCallback } from "react";
import Image from "next/image";

interface PhoneImage {
  id: string;
  url: string;
  altText: string | null;
}

interface PhoneImageGalleryProps {
  mainImage: string | null;
  images: PhoneImage[];
  phoneName: string;
}

export default function PhoneImageGallery({
  mainImage,
  images,
  phoneName,
}: PhoneImageGalleryProps) {
  const allImages: { url: string; alt: string }[] = [];
  if (mainImage) allImages.push({ url: mainImage, alt: phoneName });
  for (const img of images) {
    if (img.url !== mainImage) allImages.push({ url: img.url, alt: img.altText || phoneName });
  }

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isFading, setIsFading] = useState(false);

  const currentImage = allImages[selectedIndex] || null;
  const hasMultiple = allImages.length > 1;

  const switchImage = useCallback(
    (newIndex: number) => {
      if (newIndex === selectedIndex) return;
      setIsFading(true);
      setTimeout(() => {
        setSelectedIndex(newIndex);
        setIsFading(false);
      }, 150);
    },
    [selectedIndex]
  );

  const goNext = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      switchImage((selectedIndex + 1) % allImages.length);
    },
    [selectedIndex, allImages.length, switchImage]
  );

  const goPrev = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      switchImage((selectedIndex - 1 + allImages.length) % allImages.length);
    },
    [selectedIndex, allImages.length, switchImage]
  );

  /* ── Empty state ───────────────────────────────────────── */
  if (!currentImage) {
    return (
      <div className="flex-shrink-0">
        <div className="w-72 md:w-80 lg:w-[22rem] aspect-[3/4] rounded-2xl bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center border border-gray-100 dark:border-gray-800">
          <div className="text-center">
            <span className="text-7xl block mb-2">📱</span>
            <span className="text-xs text-gray-400 font-medium">No image</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-4">
      {/* ── Main Image Card ─────────────────────────────── */}
      <div className="relative w-72 md:w-80 lg:w-[22rem] group">
        {/* Image container */}
        <div
          className="relative rounded-2xl overflow-hidden bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-850 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow duration-300 cursor-zoom-in"
          onClick={() => setIsZoomed(true)}
        >
          <Image
            src={currentImage.url}
            alt={currentImage.alt}
            width={352}
            height={440}
            className={`w-full h-auto transition-all duration-300 group-hover:scale-[1.03] ${
              isFading ? "opacity-0 scale-95" : "opacity-100 scale-100"
            }`}
            sizes="(max-width: 768px) 288px, (max-width: 1024px) 320px, 352px"
            priority
          />

          {/* Zoom overlay on hover */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-white/5 transition-colors duration-300" />

          {/* Zoom badge */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md text-gray-600 dark:text-gray-300 rounded-full px-3 py-1.5 text-xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0 shadow-sm">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            Click to zoom
          </div>
        </div>

        {/* Navigation arrows on main image */}
        {hasMultiple && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); goPrev(e); }}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white dark:hover:bg-gray-800 hover:scale-110 z-10"
              aria-label="Previous image"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); goNext(e); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full flex items-center justify-center text-gray-600 dark:text-gray-300 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white dark:hover:bg-gray-800 hover:scale-110 z-10"
              aria-label="Next image"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}

        {/* Image counter pill */}
        {hasMultiple && (
          <div className="absolute top-3 left-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md text-gray-600 dark:text-gray-300 rounded-full px-2.5 py-1 text-[11px] font-semibold shadow-sm">
            {selectedIndex + 1} / {allImages.length}
          </div>
        )}
      </div>

      {/* ── Thumbnail Strip ─────────────────────────────── */}
      {hasMultiple && (
        <div className="flex items-center justify-center gap-2.5 px-1">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => switchImage(i)}
              className={`relative flex-shrink-0 rounded-xl overflow-hidden transition-all duration-200 ${
                i === selectedIndex
                  ? "w-16 h-16 ring-2 ring-teal-500 ring-offset-2 ring-offset-white dark:ring-offset-gray-950 shadow-lg shadow-teal-500/10"
                  : "w-14 h-14 border-2 border-gray-100 dark:border-gray-800 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-md hover:scale-105"
              }`}
              aria-label={`View image ${i + 1}`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                className={`object-cover transition-all duration-200 ${
                  i === selectedIndex ? "opacity-100" : "opacity-70 hover:opacity-100"
                }`}
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}

      {/* ── Fullscreen Zoom Modal ───────────────────────── */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center"
          onClick={() => setIsZoomed(false)}
        >
          {/* Close */}
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-5 right-5 w-11 h-11 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 z-10"
            aria-label="Close zoom"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation */}
          {hasMultiple && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-5 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 z-10"
                aria-label="Previous image"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={goNext}
                className="absolute right-5 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all duration-200 hover:scale-110 z-10"
                aria-label="Next image"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Full-size image */}
          <div className="relative w-[85vw] h-[85vh] max-w-3xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={currentImage.url}
              alt={currentImage.alt}
              fill
              className="object-contain"
              sizes="85vw"
              priority
            />
          </div>

          {/* Bottom thumbnails in modal */}
          {hasMultiple && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-black/40 backdrop-blur-md rounded-full px-4 py-2.5">
              {allImages.map((img, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); switchImage(i); }}
                  className={`relative flex-shrink-0 rounded-lg overflow-hidden transition-all duration-200 ${
                    i === selectedIndex
                      ? "w-12 h-12 ring-2 ring-white shadow-lg"
                      : "w-10 h-10 opacity-50 hover:opacity-100 hover:scale-105"
                  }`}
                >
                  <Image src={img.url} alt={img.alt} fill className="object-cover" sizes="48px" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
