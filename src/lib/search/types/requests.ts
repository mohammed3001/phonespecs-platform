/**
 * Search Request DTOs
 *
 * Defines validated, typed request parameters for search operations.
 * These DTOs are the contract between API routes and the SearchService.
 */

/** Validated search request parameters */
export interface SearchRequest {
  query: string;
  page: number;
  limit: number;
  sort: string;
  filters: SearchFilters;
}

/** Available search filters */
export interface SearchFilters {
  brand?: string;       // Comma-separated brand slugs
  status?: string;      // Market status
  priceMin?: number;
  priceMax?: number;
  ramMin?: number;
  batteryMin?: number;
  displayMin?: number;
  storageMin?: number;
}

/** Autocomplete request */
export interface AutocompleteRequest {
  query: string;
  phoneLimit?: number;
  brandLimit?: number;
}

/** Reindex request (admin only) */
export interface ReindexRequest {
  indexes?: ("phones" | "brands")[];  // If empty, reindex all
}

/** Valid sort keys — whitelist of allowed sort values */
export const VALID_SORT_KEYS: Record<string, string> = {
  price_asc: "priceNumeric:asc",
  price_desc: "priceNumeric:desc",
  name_asc: "name:asc",
  name_desc: "name:desc",
  newest: "createdAt:desc",
  battery: "batteryNumeric:desc",
  display: "displaySizeNumeric:desc",
  ram: "ramNumeric:desc",
  storage: "storageNumeric:desc",
};

/** Pagination constraints */
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  MAX_QUERY_LENGTH: 200,
} as const;

/**
 * Parse and validate search request from URL search params.
 * Returns a validated SearchRequest or throws with a descriptive message.
 */
export function parseSearchRequest(params: URLSearchParams): SearchRequest {
  const rawQuery = params.get("q") || "";
  const query = rawQuery.slice(0, PAGINATION.MAX_QUERY_LENGTH);

  const page = Math.max(1, parseInt(params.get("page") || "1", 10) || 1);
  const limit = Math.min(
    PAGINATION.MAX_LIMIT,
    Math.max(1, parseInt(params.get("limit") || String(PAGINATION.DEFAULT_LIMIT), 10) || PAGINATION.DEFAULT_LIMIT)
  );

  const sort = params.get("sort") || "";
  if (sort && !VALID_SORT_KEYS[sort]) {
    throw new SearchValidationError(
      `Invalid sort key: "${sort}". Valid options: ${Object.keys(VALID_SORT_KEYS).join(", ")}`
    );
  }

  const filters: SearchFilters = {};
  const brand = params.get("brand");
  if (brand) filters.brand = brand;

  const status = params.get("status");
  if (status) filters.status = status;

  const priceMin = params.get("priceMin");
  if (priceMin) {
    const val = parseFloat(priceMin);
    if (!isNaN(val) && val >= 0) filters.priceMin = val;
  }

  const priceMax = params.get("priceMax");
  if (priceMax) {
    const val = parseFloat(priceMax);
    if (!isNaN(val) && val >= 0) filters.priceMax = val;
  }

  const ramMin = params.get("ramMin");
  if (ramMin) {
    const val = parseFloat(ramMin);
    if (!isNaN(val) && val >= 0) filters.ramMin = val;
  }

  const batteryMin = params.get("batteryMin");
  if (batteryMin) {
    const val = parseFloat(batteryMin);
    if (!isNaN(val) && val >= 0) filters.batteryMin = val;
  }

  const displayMin = params.get("displayMin");
  if (displayMin) {
    const val = parseFloat(displayMin);
    if (!isNaN(val) && val >= 0) filters.displayMin = val;
  }

  const storageMin = params.get("storageMin");
  if (storageMin) {
    const val = parseFloat(storageMin);
    if (!isNaN(val) && val >= 0) filters.storageMin = val;
  }

  return { query, page, limit, sort, filters };
}

/** Custom error for search validation failures */
export class SearchValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SearchValidationError";
  }
}
