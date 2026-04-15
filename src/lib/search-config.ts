/**
 * Meilisearch Index Configuration
 * 
 * Configures indexes with searchable attributes, filterable attributes,
 * sortable attributes, ranking rules, typo tolerance, and synonyms.
 * 
 * Design principle: optimized for phone discovery with expansion hooks
 * for Spec IQ, Decision Engine, and Living Comparisons.
 */
import meiliClient, { PHONES_INDEX, BRANDS_INDEX } from "./meilisearch";

export async function configurePhoneIndex() {
  const index = meiliClient.index(PHONES_INDEX);

  // Searchable attributes — order matters for relevance ranking
  await index.updateSearchableAttributes([
    "name",           // Highest priority: "Samsung Galaxy S24 Ultra"
    "brandName",      // "Samsung", "Apple"
    "overview",       // Description text
    "processor",      // "Snapdragon 8 Gen 3"
    "displayType",    // "Dynamic AMOLED 2X"
    "os",             // "Android 14"
    "mainCamera",     // "200 MP"
    "ram",            // "12 GB"
    "storage",        // "256 GB"
  ]);

  // Filterable attributes — used for faceted search
  await index.updateFilterableAttributes([
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
  ]);

  // Sortable attributes
  await index.updateSortableAttributes([
    "priceNumeric",
    "name",
    "batteryNumeric",
    "displaySizeNumeric",
    "ramNumeric",
    "storageNumeric",
    "updatedAt",
    "createdAt",
  ]);

  // Ranking rules — customized for phone search
  await index.updateRankingRules([
    "words",        // All search terms present
    "typo",         // Fewer typos ranked higher
    "proximity",    // Search terms closer together
    "attribute",    // Match in name > brandName > overview
    "sort",         // User-specified sort
    "exactness",    // Exact matches first
  ]);

  // Typo tolerance configuration
  await index.updateTypoTolerance({
    enabled: true,
    minWordSizeForTypos: {
      oneTypo: 4,
      twoTypos: 8,
    },
    disableOnAttributes: ["brandSlug", "marketStatus"],
  });

  // Synonyms for common search patterns
  await index.updateSynonyms({
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
  });

  // Pagination settings
  await index.updatePagination({ maxTotalHits: 10000 });

  // Faceting settings
  await index.updateFaceting({ maxValuesPerFacet: 100 });

  console.log(`✅ Phone index "${PHONES_INDEX}" configured`);
}

export async function configureBrandIndex() {
  const index = meiliClient.index(BRANDS_INDEX);

  await index.updateSearchableAttributes([
    "name",
    "description",
    "country",
  ]);

  await index.updateFilterableAttributes([
    "country",
    "phoneCount",
  ]);

  await index.updateSortableAttributes([
    "name",
    "phoneCount",
    "updatedAt",
  ]);

  await index.updateTypoTolerance({
    enabled: true,
    minWordSizeForTypos: { oneTypo: 3, twoTypos: 6 },
  });

  console.log(`✅ Brand index "${BRANDS_INDEX}" configured`);
}

export async function configureAllIndexes() {
  await configurePhoneIndex();
  await configureBrandIndex();
  console.log("✅ All Meilisearch indexes configured");
}
