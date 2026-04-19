"use client";

import { useState } from "react";
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
  // Build gallery: main image first, then additional images
  const allImages: { url: string; alt: string }[] = [];
  if (mainImage) {
    allImages.push({ url: mainImage, alt: phoneName });
  }
  for (const img of images) {
    // Avoid duplicating main image
    if (img.url !== mainImage) {
      allImages.push({ url: img.url, alt: img.altText || phoneName });
    }
  }

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

  const currentImage = allImages[selectedIndex] || null;
  const hasMultiple = allImages.length > 1;

  if (!currentImage) {
    return (
      <div className="flex-shrink-0 flex justify-center">
        <div className="w-64 md:w-72 aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl flex items-center justify-center border border-gray-200 dark:border-gray-700">
          <span className="text-8xl">📱</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 flex flex-col items-center gap-3">
      {/* Main Image */}
      <div
        className="relative w-64 md:w-72 aspect-[3/4] bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-3xl flex items-center justify-center border border-gray-200 dark:border-gray-700 overflow-hidden cursor-zoom-in group"
        onClick={() => setIsZoomed(true)}
      >
        <Image
          src={currentImage.url}
          alt={currentImage.alt}
          fill
          className="object-contain p-3 transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 256px, 288px"
          priority
        />
        {/* Zoom hint */}
        <div className="absolute bottom-2 right-2 bg-black/40 backdrop-blur-sm text-white rounded-lg px-2 py-1 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          Zoom
        </div>
      </div>

      {/* Thumbnail Strip */}
      {hasMultiple && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-[288px]">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setSelectedIndex(i)}
              className={`relative w-14 h-14 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                i === selectedIndex
                  ? "border-teal-500 ring-2 ring-teal-500/20 shadow-md"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt}
                fill
                className="object-contain p-0.5"
                sizes="56px"
              />
            </button>
          ))}
        </div>
      )}

      {/* Image count indicator */}
      {hasMultiple && (
        <p className="text-xs text-gray-400 font-medium">
          {selectedIndex + 1} / {allImages.length} images
        </p>
      )}

      {/* Fullscreen Zoom Modal */}
      {isZoomed && (
        <div
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center"
          onClick={() => setIsZoomed(false)}
        >
          {/* Close button */}
          <button
            onClick={() => setIsZoomed(false)}
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Navigation arrows */}
          {hasMultiple && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((selectedIndex - 1 + allImages.length) % allImages.length);
                }}
                className="absolute left-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedIndex((selectedIndex + 1) % allImages.length);
                }}
                className="absolute right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-colors z-10"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}

          {/* Full-size image */}
          <div
            className="relative w-[85vw] h-[85vh] max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentImage.url}
              alt={currentImage.alt}
              fill
              className="object-contain"
              sizes="85vw"
              priority
            />
          </div>

          {/* Image counter */}
          {hasMultiple && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-sm text-white rounded-full px-4 py-1.5 text-sm font-medium">
              {selectedIndex + 1} / {allImages.length}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
