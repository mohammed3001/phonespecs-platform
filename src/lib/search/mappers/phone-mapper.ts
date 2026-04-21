/**
 * Phone Mapper
 *
 * Transforms Prisma Phone entities into PhoneSearchDocument.
 * This is the SINGLE source of truth for the phone document shape.
 *
 * If you change the document shape, update PhoneSearchDocument in types/documents.ts
 * and run a full reindex.
 */

import type { PhoneSearchDocument } from "../types/documents";

/** Prisma Phone with required relations for mapping */
export interface PhoneWithRelations {
  id: string;
  name: string;
  slug: string;
  brand: { name: string; slug: string };
  marketStatus: string;
  priceUsd: number | null;
  priceDisplay: string | null;
  releaseDate: string | null;
  overview: string | null;
  mainImage: string | null;
  isFeatured: boolean;
  updatedAt: Date;
  createdAt: Date;
  specs: Array<{
    spec: {
      key: string;
      group: { id: string; name: string; slug: string; sortOrder: number; createdAt: Date; icon: string | null };
    };
    value: string;
  }>;
}

/** Prisma include clause needed to fetch a phone with all mapper dependencies */
export const PHONE_INCLUDE_FOR_SEARCH = {
  brand: { select: { name: true, slug: true } },
  specs: {
    include: {
      spec: { select: { key: true, group: true } },
    },
  },
} as const;

/** Extract numeric value from spec string like "6.8 inches" → 6.8, "5000 mAh" → 5000 */
export function extractNumeric(value: string | null | undefined): number {
  if (!value) return 0;
  const match = value.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

/** Get spec value by key from phone specs array */
function getSpecValue(
  specs: PhoneWithRelations["specs"],
  key: string
): string | null {
  const found = specs.find((s) => s.spec.key === key);
  return found?.value || null;
}

/**
 * Map a Prisma Phone entity to a Meilisearch PhoneSearchDocument.
 * Pure function — no side effects, no DB calls, no SDK calls.
 */
export function mapPhoneToDocument(phone: PhoneWithRelations): PhoneSearchDocument {
  const specValues = phone.specs.map(
    (s) => `${s.spec.group.slug}:${s.spec.key}:${s.value}`
  );

  return {
    id: phone.id,
    name: phone.name,
    slug: phone.slug,
    brandName: phone.brand.name,
    brandSlug: phone.brand.slug,
    marketStatus: phone.marketStatus,
    priceUsd: phone.priceUsd,
    priceDisplay: phone.priceDisplay,
    releaseDate: phone.releaseDate ? String(phone.releaseDate) : null,
    overview: phone.overview,
    mainImage: phone.mainImage,
    isFeatured: phone.isFeatured,
    // Flattened specs
    displaySize: getSpecValue(phone.specs, "display_size"),
    displayType: getSpecValue(phone.specs, "display_type"),
    ram: getSpecValue(phone.specs, "ram"),
    storage: getSpecValue(phone.specs, "storage"),
    mainCamera: getSpecValue(phone.specs, "main_camera"),
    frontCamera: getSpecValue(phone.specs, "front_camera"),
    battery: getSpecValue(phone.specs, "battery_capacity"),
    processor: getSpecValue(phone.specs, "processor"),
    os: getSpecValue(phone.specs, "os"),
    // Numeric specs for range filtering
    priceNumeric: phone.priceUsd || 0,
    batteryNumeric: extractNumeric(getSpecValue(phone.specs, "battery_capacity")),
    displaySizeNumeric: extractNumeric(getSpecValue(phone.specs, "display_size")),
    ramNumeric: extractNumeric(getSpecValue(phone.specs, "ram")),
    storageNumeric: extractNumeric(getSpecValue(phone.specs, "storage")),
    // Faceted values
    specValues,
    // Timestamps
    updatedAt: phone.updatedAt.getTime(),
    createdAt: phone.createdAt.getTime(),
  };
}
