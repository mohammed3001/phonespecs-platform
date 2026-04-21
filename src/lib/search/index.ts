/**
 * Search Module — Public API
 *
 * This is the main entry point for the search module.
 * All search-related functionality should be imported from here.
 *
 * Usage:
 *   import { searchPhones, indexPhone, fullReindex } from "@/lib/search";
 *
 * Module structure:
 *   search-client.ts     — Meilisearch SDK adapter
 *   search-service.ts    — Query orchestration (search, autocomplete)
 *   search-indexer.ts    — Document lifecycle (upsert, delete, reindex)
 *   search-config.ts     — Index configuration
 *   search-logger.ts     — Structured logging
 *   mappers/             — Entity → Document transformers
 *   types/               — TypeScript interfaces and DTOs
 */

// === Query Operations ===
export { searchPhones, autocomplete } from "./search-service";

// === Indexing Operations ===
export {
  indexPhone,
  removePhone,
  indexBrand,
  removeBrand,
  reindexAllPhones,
  reindexAllBrands,
  fullReindex,
} from "./search-indexer";

// === Types ===
export type {
  PhoneSearchDocument,
  BrandSearchDocument,
  IndexName,
} from "./types/documents";
export { INDEX_NAMES } from "./types/documents";

export type {
  SearchRequest,
  SearchFilters,
  AutocompleteRequest,
  ReindexRequest,
} from "./types/requests";
export {
  parseSearchRequest,
  SearchValidationError,
  VALID_SORT_KEYS,
  PAGINATION,
} from "./types/requests";

export type {
  SearchResponse,
  AutocompleteResponse,
  ReindexResponse,
  SearchErrorResponse,
  FacetDistribution,
  PaginationMeta,
  SearchMeta,
} from "./types/responses";

// === Health Check ===
export { searchClient } from "./search-client";
