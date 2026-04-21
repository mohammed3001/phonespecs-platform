import { Meilisearch } from "meilisearch";

const meiliClient = new Meilisearch({
  host: process.env.MEILISEARCH_URL || "http://localhost:7700",
  apiKey: process.env.MEILISEARCH_MASTER_KEY || "mp_dev_master_key_change_in_production",
});

export default meiliClient;

// Index names
export const PHONES_INDEX = "phones";
export const BRANDS_INDEX = "brands";

/**
 * Phone document shape in Meilisearch.
 * Designed for expansion: Spec IQ, Decision Engine, Living Comparisons.
 */
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
  // Flattened specs for filtering and display
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
  // For faceted filtering
  specValues: string[];
  // Timestamp for sorting
  updatedAt: number;
  createdAt: number;
}

export interface BrandSearchDocument {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  phoneCount: number;
  updatedAt: number;
}
