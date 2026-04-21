/**
 * Search Index Configuration
 *
 * Defines the Meilisearch index settings for each entity.
 * Configures searchable attributes, filterable attributes,
 * sortable attributes, ranking rules, typo tolerance, and synonyms.
 *
 * IMPORTANT: Attribute order in searchableAttributes matters for relevance ranking.
 * The first attribute has the highest weight.
 */

import { searchClient } from "./search-client";
import { INDEX_NAMES } from "./types/documents";
import { searchLogger } from "./search-logger";

/** Configure the phones index */
export async function configurePhoneIndex(): Promise<void> {
  const indexName = INDEX_NAMES.PHONES;

  await searchClient.configureIndex(indexName, {
    // Searchable attributes — order determines relevance weight
    searchableAttributes: [
      "name",           // Highest priority: "Samsung Galaxy S24 Ultra"
      "brandName",      // "Samsung", "Apple"
      "overview",       // Description text
      "processor",      // "Snapdragon 8 Gen 3"
      "displayType",    // "Dynamic AMOLED 2X"
      "os",             // "Android 14"
      "mainCamera",     // "200 MP"
      "ram",            // "12 GB"
      "storage",        // "256 GB"
    ],

    // Filterable attributes — used in filter expressions and faceted search
    filterableAttributes: [
      "brandSlug",
      "brandName",
      "marketStatus",
      "priceNumeric",
      "batteryNumeric",
      "displaySizeNumeric",
      "ramNumeric",
      "storageNumeric",
      "isFeatured",
      "ram",
      "storage",
      "os",
      "displayType",
      "specValues",
    ],

    // Sortable attributes — used in sort expressions
    sortableAttributes: [
      "priceNumeric",
      "name",
      "batteryNumeric",
      "displaySizeNumeric",
      "ramNumeric",
      "storageNumeric",
      "updatedAt",
      "createdAt",
    ],

    // Ranking rules — customized for phone search
    rankingRules: [
      "words",        // All search terms present
      "typo",         // Fewer typos ranked higher
      "proximity",    // Search terms closer together
      "attribute",    // Match in name > brandName > overview
      "sort",         // User-specified sort
      "exactness",    // Exact matches first
    ],

    // Typo tolerance
    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: {
        oneTypo: 4,
        twoTypos: 8,
      },
      disableOnAttributes: ["brandSlug", "marketStatus"],
    },

    // Synonyms for common search patterns
    synonyms: {
      phone: ["smartphone", "mobile", "device", "handset"],
      smartphone: ["phone", "mobile"],
      camera: ["cam", "lens"],
      battery: ["batt", "mah"],
      display: ["screen", "panel"],
      storage: ["memory", "rom", "internal"],
      ram: ["memory"],
      samsung: ["galaxy"],
      iphone: ["apple"],
      pixel: ["google"],
    },

    // Pagination settings
    pagination: { maxTotalHits: 10000 },

    // Faceting settings
    faceting: { maxValuesPerFacet: 100 },
  });

  searchLogger.info("Phone index configured", { operation: "config", index: indexName });
}

/** Configure the brands index */
export async function configureBrandIndex(): Promise<void> {
  const indexName = INDEX_NAMES.BRANDS;

  await searchClient.configureIndex(indexName, {
    searchableAttributes: [
      "name",
      "description",
    ],

    filterableAttributes: [
      "phoneCount",
    ],

    sortableAttributes: [
      "name",
      "phoneCount",
      "updatedAt",
    ],

    typoTolerance: {
      enabled: true,
      minWordSizeForTypos: { oneTypo: 3, twoTypos: 6 },
    },
  });

  searchLogger.info("Brand index configured", { operation: "config", index: indexName });
}

/** Configure all indexes */
export async function configureAllIndexes(): Promise<void> {
  await configurePhoneIndex();
  await configureBrandIndex();
  searchLogger.info("All indexes configured", { operation: "config" });
}
