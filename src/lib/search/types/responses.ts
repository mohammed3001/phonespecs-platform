/**
 * Search Response DTOs
 *
 * Defines the shape of responses returned by the SearchService.
 * These are the contracts between the SearchService and API routes.
 */

import type { PhoneSearchDocument, BrandSearchDocument } from "./documents";

/** Facet distribution from Meilisearch */
export interface FacetDistribution {
  [facetName: string]: Record<string, number>;
}

/** Pagination metadata */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/** Search response metadata */
export interface SearchMeta {
  query: string;
  processingTimeMs: number;
  responseTimeMs: number;
  /** True when results came from PostgreSQL fallback instead of Meilisearch */
  fallback?: boolean;
}

/** Full search response */
export interface SearchResponse {
  success: true;
  data: PhoneSearchDocument[];
  facets: FacetDistribution;
  pagination: PaginationMeta;
  meta: SearchMeta;
}

/** Autocomplete response */
export interface AutocompleteResponse {
  success: true;
  phones: Partial<PhoneSearchDocument>[];
  brands: Partial<BrandSearchDocument>[];
  meta: {
    processingTimeMs: number;
    responseTimeMs: number;
    fallback?: boolean;
  };
}

/** Reindex response */
export interface ReindexResponse {
  success: true;
  data: {
    phones: number;
    brands: number;
  };
  message: string;
}

/** Search error response */
export interface SearchErrorResponse {
  success: false;
  error: string;
  code?: string;
}
