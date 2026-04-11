'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import type { SponsoredAd } from '@/types/phone';

interface SponsoredBannerProps {
  ad: SponsoredAd;
}

export function SponsoredBanner({ ad }: SponsoredBannerProps) {
  return (
    <Link
      href={ad.targetUrl || '#'}
      className="block relative rounded-2xl overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 group"
    >
      <div className="flex items-center justify-between p-4 md:p-6">
        <div className="flex-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-white/10 text-white/70 mb-2">
            <Icon icon="mdi:star-four-points" width={10} />
            Sponsored
          </span>
          <h3 className="text-lg md:text-xl font-bold text-white group-hover:text-brand-300 transition-colors">
            {ad.title}
          </h3>
          <p className="text-sm text-gray-300 mt-1 max-w-md">{ad.description}</p>
          <span className="inline-flex items-center gap-1 mt-3 text-sm font-medium text-brand-400 group-hover:text-brand-300 transition-colors">
            Learn more <Icon icon="mdi:arrow-right" width={16} />
          </span>
        </div>
        {ad.imageUrl && (
          <div className="hidden md:block relative w-40 h-24 shrink-0">
            <Image
              src={ad.imageUrl}
              alt={ad.title || 'Ad'}
              fill
              className="object-contain"
              sizes="160px"
            />
          </div>
        )}
      </div>
    </Link>
  );
}

export function SidebarAd({ ad }: SponsoredBannerProps) {
  return (
    <Link
      href={ad.targetUrl || '#'}
      className="block card overflow-hidden group"
    >
      <div className="relative">
        {ad.imageUrl && (
          <div className="relative w-full aspect-[4/3] bg-gray-100 dark:bg-gray-800">
            <Image
              src={ad.imageUrl}
              alt={ad.title || 'Ad'}
              fill
              className="object-cover"
              sizes="300px"
            />
          </div>
        )}
        <span className="absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-black/50 text-white/80 backdrop-blur-sm">
          <Icon icon="mdi:star-four-points" width={10} />
          Sponsored
        </span>
      </div>
      <div className="p-3">
        <h4 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
          {ad.title}
        </h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{ad.description}</p>
      </div>
    </Link>
  );
}
