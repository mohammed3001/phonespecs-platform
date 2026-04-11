'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import type { Phone } from '@/types/phone';
import { SPEC_ICONS } from '@/types/phone';

interface PhoneCardProps {
  phone: Phone;
  showSponsored?: boolean;
}

const PRIMARY_SPECS: { key: keyof Phone['keySpecs']; label: string }[] = [
  { key: 'storage', label: 'Storage' },
  { key: 'ram', label: 'RAM' },
  { key: 'mainCamera', label: 'Main Camera' },
  { key: 'frontCamera', label: 'Front Camera' },
  { key: 'display', label: 'Display' },
  { key: 'battery', label: 'Battery' },
];

const SECONDARY_SPECS: { key: keyof Phone['keySpecs']; label: string }[] = [
  { key: 'fingerprint', label: 'Fingerprint' },
  { key: 'charger', label: 'Charger' },
  { key: 'resistanceRating', label: 'Resistance' },
  { key: 'wifi', label: 'Wi-Fi' },
  { key: 'glassProtection', label: 'Glass' },
  { key: 'bluetooth', label: 'Bluetooth' },
];

export function PhoneCard({ phone, showSponsored = true }: PhoneCardProps) {
  const primaryImage = phone.images.find((i) => i.isPrimary) || phone.images[0];

  return (
    <Link
      href={`/en/phones/${phone.brand.slug}/${phone.slug}`}
      className="phone-card group block"
    >
      <div className="p-4">
        {/* Sponsored badge */}
        {phone.isSponsored && showSponsored && (
          <div className="mb-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-xs font-medium">
              <Icon icon="mdi:star-four-points" width={12} />
              Sponsored
            </span>
          </div>
        )}

        <div className="flex gap-4">
          {/* Phone Image */}
          <div className="shrink-0 w-28 h-36 relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800">
            {primaryImage ? (
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt || phone.name}
                fill
                className="object-contain p-2 group-hover:scale-105 transition-transform duration-300"
                sizes="112px"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon icon="mdi:cellphone" width={48} className="text-gray-300 dark:text-gray-600" />
              </div>
            )}
          </div>

          {/* Phone Info */}
          <div className="flex-1 min-w-0">
            {/* Brand */}
            <p className="text-xs font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wide">
              {phone.brand.name}
            </p>
            {/* Name */}
            <h3 className="mt-0.5 text-lg font-bold text-gray-900 dark:text-white truncate group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              {phone.name}
            </h3>

            {/* Price & Status */}
            <div className="mt-1.5 flex items-center gap-3">
              {phone.priceUsd && (
                <span className="text-lg font-bold text-gray-900 dark:text-white">
                  ${phone.priceUsd}
                </span>
              )}
              <StatusBadge status={phone.status} />
            </div>

            {/* Release date */}
            {phone.releaseDate && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Icon icon="mdi:calendar-outline" width={13} />
                {new Date(phone.releaseDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })}
              </p>
            )}
          </div>
        </div>

        {/* Primary Specs */}
        <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2">
          {PRIMARY_SPECS.map((spec) => {
            const value = phone.keySpecs[spec.key];
            if (!value) return null;
            return (
              <div key={spec.key} className="flex items-center gap-2 min-w-0">
                <Icon
                  icon={SPEC_ICONS[spec.key] || 'mdi:information-outline'}
                  width={16}
                  className="text-brand-500 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider leading-none">
                    {spec.label}
                  </p>
                  <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 truncate">
                    {value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-3 border-t border-gray-100 dark:border-gray-800" />

        {/* Secondary Specs */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {SECONDARY_SPECS.map((spec) => {
            const value = phone.keySpecs[spec.key];
            if (!value) return null;
            return (
              <div key={spec.key} className="flex items-center gap-2 min-w-0">
                <Icon
                  icon={SPEC_ICONS[spec.key] || 'mdi:information-outline'}
                  width={14}
                  className="text-gray-400 dark:text-gray-500 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase tracking-wider leading-none">
                    {spec.label}
                  </p>
                  <p className="text-[11px] font-medium text-gray-600 dark:text-gray-400 truncate">
                    {value}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    UPCOMING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    DISCONTINUED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };
  const labels: Record<string, string> = {
    AVAILABLE: 'In Stock',
    UPCOMING: 'Coming Soon',
    DISCONTINUED: 'Discontinued',
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${styles[status] || styles.AVAILABLE}`}>
      {labels[status] || status}
    </span>
  );
}
