/**
 * Search Service
 *
 * Orchestrates search queries and autocomplete.
 * Responsibilities:
 * - Build Meilisearch filter/sort expressions from typed DTOs
 * - Execute search queries via SearchClient
 * - Handle fallback to PostgreSQL when Meilisearch is unavailable
 * - Return typed response DTOs
 *
 * This service does NOT handle indexing — that's SearchIndexer's job.
 */

import prisma from "@/lib/prisma";
import { searchClient } from "./search-client";
import { INDEX_NAMES, type PhoneSearchDocument, type BrandSearchDocument } from "./types/documents";
import { VALID_SORT_KEYS, type SearchRequest, type AutocompleteRequest } from "./types/requests";
import type { SearchResponse, AutocompleteResponse } from "./types/responses";
import { searchLogger } from "./search-logger";

/**
 * Execute a full phone search with filters, sorting, pagination, and facets.
 * Falls back to PostgreSQL if Meilisearch is unavailable.
 */
export async function searchPhones(request: SearchRequest): Promise<SearchResponse> {
  const startTime = Date.now();
  const { query, page, limit, sort, filters } = request;

  try {
    // Build Meilisearch filter expression
    const filterParts: string[] = [];

    if (filters.brand) {
      const brands = filters.brand.split(",").map((b) => `brandSlug = "${b.trim()}"`);
      filterParts.push(`(${brands.join(" OR ")})`);
    }
    if (filters.status) {
      filterParts.push(`marketStatus = "${filters.status}"`);
    }
    if (filters.priceMin !== undefined) filterParts.push(`priceNumeric >= ${filters.priceMin}`);
    if (filters.priceMax !== undefined) filterParts.push(`priceNumeric <= ${filters.priceMax}`);
    if (filters.ramMin !== undefined) filterParts.push(`ramNumeric >= ${filters.ramMin}`);
    if (filters.batteryMin !== undefined) filterParts.push(`batteryNumeric >= ${filters.batteryMin}`);
    if (filters.displayMin !== undefined) filterParts.push(`displaySizeNumeric >= ${filters.displayMin}`);
    if (filters.storageMin !== undefined) filterParts.push(`storageNumeric >= ${filters.storageMin}`);

    // Build sort expression
    const sortRules: string[] = [];
    if (sort && VALID_SORT_KEYS[sort]) {
      sortRules.push(VALID_SORT_KEYS[sort]);
    }

    // Execute Meilisearch query
    const results = await searchClient.search<PhoneSearchDocument>(
      INDEX_NAMES.PHONES,
      query,
      {
        limit,
        offset: (page - 1) * limit,
        filter: filterParts.length > 0 ? filterParts.join(" AND ") : undefined,
        sort: sortRules.length > 0 ? sortRules : undefined,
        facets: ["brandName", "marketStatus", "ram", "storage", "os", "displayType"],
        attributesToHighlight: ["name", "overview"],
        highlightPreTag: "<mark>",
        highlightPostTag: "</mark>",
        attributesToCrop: ["overview"],
        cropLength: 150,
      }
    );

    const responseTimeMs = Date.now() - startTime;
    const totalHits = results.estimatedTotalHits || 0;

    searchLogger.querySuccess(query, totalHits, responseTimeMs);

    // Log analytics (fire and forget)
    logSearchAnalytics(query, totalHits, filterParts, sort, responseTimeMs);

    return {
      success: true,
      data: results.hits as PhoneSearchDocument[],
      facets: (results.facetDistribution || {}) as Record<string, Record<string, number>>,
      pagination: {
        page,
        limit,
        total: totalHits,
        totalPages: Math.ceil(totalHits / limit),
      },
      meta: {
        query,
        processingTimeMs: results.processingTimeMs,
        responseTimeMs,
      },
    };
  } catch (error) {
    // Meilisearch unavailable — fallback to PostgreSQL
    searchLogger.serviceUnavailable("query", error);
    return searchPhonesFallback(request, startTime);
  }
}

/**
 * PostgreSQL fallback for phone search.
 * Provides basic search functionality when Meilisearch is unavailable.
 * Limited: no facets, no highlighting, no typo tolerance, basic text matching only.
 */
async function searchPhonesFallback(request: SearchRequest, startTime: number): Promise<SearchResponse> {
  const { query, page, limit, filters } = request;

  try {
    const where: Record<string, unknown> = { isPublished: true };
    if (query) where.name = { contains: query, mode: "insensitive" };
    if (filters.brand) where.brand = { slug: filters.brand.split(",")[0] };
    if (filters.status) where.marketStatus = filters.status;

    const [phones, total] = await Promise.all([
      prisma.phone.findMany({
        where,
        include: {
          brand: { select: { name: true, slug: true } },
          specs: { include: { spec: { select: { key: true, group: true } } } },
        },
        take: limit,
        skip: (page - 1) * limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.phone.count({ where }),
    ]);

    const responseTimeMs = Date.now() - startTime;
    searchLogger.querySuccess(query, total, responseTimeMs, true);

    return {
      success: true,
      data: phones as unknown as PhoneSearchDocument[],
      facets: {},
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      meta: {
        query,
        processingTimeMs: 0,
        responseTimeMs,
        fallback: true,
      },
    };
  } catch (fallbackError) {
    searchLogger.queryFailure(query, fallbackError);
    throw fallbackError;
  }
}

/**
 * Autocomplete search across phones and brands.
 * Falls back to PostgreSQL if Meilisearch is unavailable.
 */
export async function autocomplete(request: AutocompleteRequest): Promise<AutocompleteResponse> {
  const startTime = Date.now();
  const { query, phoneLimit = 5, brandLimit = 3 } = request;

  if (!query || query.length < 1) {
    return {
      success: true,
      phones: [],
      brands: [],
      meta: { processingTimeMs: 0, responseTimeMs: 0 },
    };
  }

  try {
    const [phoneResults, brandResults] = await Promise.all([
      searchClient.search<PhoneSearchDocument>(INDEX_NAMES.PHONES, query, {
        limit: phoneLimit,
        attributesToRetrieve: [
          "name", "slug", "brandName", "priceDisplay", "priceUsd",
          "mainImage", "marketStatus",
        ],
        attributesToHighlight: ["name"],
        highlightPreTag: "<mark>",
        highlightPostTag: "</mark>",
      }),
      searchClient.search<BrandSearchDocument>(INDEX_NAMES.BRANDS, query, {
        limit: brandLimit,
        attributesToRetrieve: ["name", "slug", "phoneCount"],
        attributesToHighlight: ["name"],
        highlightPreTag: "<mark>",
        highlightPostTag: "</mark>",
      }),
    ]);

    const responseTimeMs = Date.now() - startTime;

    // Log analytics (fire and forget)
    const totalHits = (phoneResults.estimatedTotalHits || 0) + (brandResults.estimatedTotalHits || 0);
    logAutocompleteAnalytics(query, totalHits, responseTimeMs);

    return {
      success: true,
      phones: phoneResults.hits as Partial<PhoneSearchDocument>[],
      brands: brandResults.hits as Partial<BrandSearchDocument>[],
      meta: {
        processingTimeMs: Math.max(phoneResults.processingTimeMs, brandResults.processingTimeMs),
        responseTimeMs,
      },
    };
  } catch (error) {
    searchLogger.serviceUnavailable("autocomplete", error);
    return autocompleteFallback(query, phoneLimit, startTime);
  }
}

/**
 * PostgreSQL fallback for autocomplete.
 */
async function autocompleteFallback(
  query: string,
  phoneLimit: number,
  startTime: number
): Promise<AutocompleteResponse> {
  try {
    const phones = await prisma.phone.findMany({
      where: {
        isPublished: true,
        name: { contains: query, mode: "insensitive" },
      },
      select: {
        name: true, slug: true, priceDisplay: true, priceUsd: true,
        mainImage: true, marketStatus: true,
        brand: { select: { name: true } },
      },
      take: phoneLimit,
    });

    return {
      success: true,
      phones: phones.map((p) => ({
        ...p,
        brandName: p.brand.name,
      })) as Partial<PhoneSearchDocument>[],
      brands: [],
      meta: { processingTimeMs: 0, responseTimeMs: Date.now() - startTime, fallback: true },
    };
  } catch {
    return {
      success: true,
      phones: [],
      brands: [],
      meta: { processingTimeMs: 0, responseTimeMs: Date.now() - startTime, fallback: true },
    };
  }
}

/** Fire-and-forget analytics logging for search queries */
function logSearchAnalytics(
  query: string,
  resultCount: number,
  filters: string[],
  sort: string,
  responseMs: number
): void {
  prisma.searchQuery.create({
    data: {
      query,
      normalizedQuery: query.toLowerCase().trim(),
      resultCount,
      filters: filters.length > 0 ? JSON.stringify(filters) : null,
      sortBy: sort || null,
      source: "web",
      responseMs,
    },
  }).catch(() => { /* ignore analytics errors */ });
}

/** Fire-and-forget analytics logging for autocomplete queries */
function logAutocompleteAnalytics(
  query: string,
  resultCount: number,
  responseMs: number
): void {
  prisma.searchQuery.create({
    data: {
      query,
      normalizedQuery: query.toLowerCase().trim(),
      resultCount,
      source: "autocomplete",
      responseMs,
    },
  }).catch(() => { /* ignore analytics errors */ });
}
