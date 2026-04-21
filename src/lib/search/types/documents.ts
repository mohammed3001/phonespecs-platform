/**
 * Search Document Types
 *
 * Defines the shape of documents stored in Meilisearch indexes.
 * These are the contracts between Prisma entities and the search engine.
 *
 * IMPORTANT: If you change a document shape, you must run a full reindex
 * to update all existing documents.
 */

/** Phone document stored in the "phones" Meilisearch index */
export interface PhoneSearchDocument {
  id: string;
  name: string;
  slug: string;
  brandName: string;
  brandSlug: string;
  marketStatus: string;
  priceUsd: number | null;
  priceDisplay: string | null;
  releaseDate: string | null;
  overview: string | null;
  mainImage: string | null;
  isFeatured: boolean;
  // Flattened specs for search and display
  displaySize: string | null;
  displayType: string | null;
  ram: string | null;
  storage: string | null;
  mainCamera: string | null;
  frontCamera: string | null;
  battery: string | null;
  processor: string | null;
  os: string | null;
  // Numeric specs for range filtering
  priceNumeric: number;
  batteryNumeric: number;
  displaySizeNumeric: number;
  ramNumeric: number;
  storageNumeric: number;
  // Faceted filtering
  specValues: string[];
  // Timestamps (epoch ms for sorting)
  updatedAt: number;
  createdAt: number;
}

/** Brand document stored in the "brands" Meilisearch index */
export interface BrandSearchDocument {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phoneCount: number;
  updatedAt: number;
}

/** Index names — single source of truth */
export const INDEX_NAMES = {
  PHONES: "phones",
  BRANDS: "brands",
} as const;

export type IndexName = (typeof INDEX_NAMES)[keyof typeof INDEX_NAMES];
