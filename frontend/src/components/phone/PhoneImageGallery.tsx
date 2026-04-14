'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import type { PhoneImage } from '@/types/phone';

interface PhoneImageGalleryProps {
  images: PhoneImage[];
  phoneName: string;
}

export function PhoneImageGallery({ images, phoneName }: PhoneImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedImage = images[selectedIndex] || images[0];

  if (!images.length) {
    return (
      <div className="aspect-[3/4] bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center">
        <Icon icon="mdi:cellphone" width={80} className="text-gray-300 dark:text-gray-600" />
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <div className="relative aspect-[3/4] bg-gray-50 dark:bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800">
        <Image
          src={selectedImage.url}
          alt={selectedImage.alt || phoneName}
          fill
          className="object-contain p-6"
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setSelectedIndex(idx)}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                idx === selectedIndex
                  ? 'border-brand-500 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
              }`}
            >
              <Image
                src={img.thumbUrl || img.url}
                alt={img.alt || `${phoneName} ${idx + 1}`}
                width={64}
                height={64}
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
