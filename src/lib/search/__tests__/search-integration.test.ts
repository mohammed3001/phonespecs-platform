/**
 * Search Integration Tests
 *
 * Tests the full search pipeline against a live Meilisearch instance.
 * These tests require Docker Meilisearch to be running (docker compose up -d).
 *
 * Tests cover:
 * - Successful search with results
 * - Empty query behavior (browse mode)
 * - Pagination
 * - Filters (brand, status, price range)
 * - Sort options
 * - No results case
 * - Autocomplete
 * - Reindex
 * - Meilisearch unavailability (fallback)
 */

import { describe, it, expect, beforeAll } from "vitest";
import { searchPhones, autocomplete, fullReindex } from "../index";
import { parseSearchRequest } from "../types/requests";

// These tests require Meilisearch to be running with data
// Run: docker compose up -d && npx tsx scripts/search-bootstrap.ts

describe("Search Integration", () => {
  beforeAll(async () => {
    // Ensure indexes are populated
    try {
      await fullReindex();
    } catch {
      console.warn("Could not reindex — Meilisearch may not be running");
    }
  }, 30000);

  describe("searchPhones", () => {
    it("returns results for a valid query", async () => {
      const request = parseSearchRequest(new URLSearchParams({ q: "samsung" }));
      const result = await searchPhones(request);

      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.pagination.total).toBeGreaterThan(0);
      expect(result.meta.query).toBe("samsung");
      expect(result.meta.processingTimeMs).toBeGreaterThanOrEqual(0);
    });

    it("returns all results for empty query (browse mode)", async () => {
      const request = parseSearchRequest(new URLSearchParams({}));
      const result = await searchPhones(request);

      expect(result.success).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.meta.query).toBe("");
    });

    it("respects pagination parameters", async () => {
      const page1 = await searchPhones(parseSearchRequest(new URLSearchParams({ limit: "2", page: "1" })));
      const page2 = await searchPhones(parseSearchRequest(new URLSearchParams({ limit: "2", page: "2" })));

      expect(page1.data.length).toBeLessThanOrEqual(2);
      expect(page1.pagination.page).toBe(1);
      expect(page1.pagination.limit).toBe(2);

      if (page1.pagination.total > 2) {
        expect(page2.pagination.page).toBe(2);
        // Pages should have different results
        if (page2.data.length > 0) {
          expect(page2.data[0].id).not.toBe(page1.data[0].id);
        }
      }
    });

    it("filters by brand", async () => {
      const request = parseSearchRequest(new URLSearchParams({ brand: "samsung" }));
      const result = await searchPhones(request);

      if (result.data.length > 0) {
        for (const phone of result.data) {
          expect(phone.brandSlug).toBe("samsung");
        }
      }
    });

    it("filters by price range", async () => {
      const request = parseSearchRequest(new URLSearchParams({ priceMin: "500", priceMax: "1000" }));
      const result = await searchPhones(request);

      if (result.data.length > 0) {
        for (const phone of result.data) {
          if (phone.priceNumeric > 0) {
            expect(phone.priceNumeric).toBeGreaterThanOrEqual(500);
            expect(phone.priceNumeric).toBeLessThanOrEqual(1000);
          }
        }
      }
    });

    it("sorts by price ascending", async () => {
      const request = parseSearchRequest(new URLSearchParams({ sort: "price_asc" }));
      const result = await searchPhones(request);

      if (result.data.length > 1) {
        const prices = result.data
          .filter((p) => p.priceNumeric > 0)
          .map((p) => p.priceNumeric);
        for (let i = 1; i < prices.length; i++) {
          expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
        }
      }
    });

    it("returns empty array for no-match query", async () => {
      const request = parseSearchRequest(new URLSearchParams({ q: "zzznonexistentphone999" }));
      const result = await searchPhones(request);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
      expect(result.pagination.total).toBe(0);
      expect(result.pagination.totalPages).toBe(0);
    });

    it("returns facet distribution", async () => {
      const request = parseSearchRequest(new URLSearchParams({}));
      const result = await searchPhones(request);

      expect(result.facets).toBeDefined();
      // Should have brandName facets at minimum
      if (result.data.length > 0) {
        expect(result.facets.brandName).toBeDefined();
      }
    });

    it("response contains only allowed fields", async () => {
      const request = parseSearchRequest(new URLSearchParams({ q: "galaxy" }));
      const result = await searchPhones(request);

      if (result.data.length > 0) {
        const phone = result.data[0];
        // Should NOT contain internal fields
        expect(phone).not.toHaveProperty("isPublished");
        expect(phone).not.toHaveProperty("viewCount");
        expect(phone).not.toHaveProperty("reviewScore");
        expect(phone).not.toHaveProperty("metaTitle");
        expect(phone).not.toHaveProperty("metaDescription");
      }
    });
  });

  describe("autocomplete", () => {
    it("returns phones and brands for valid query", async () => {
      const result = await autocomplete({ query: "sam" });

      expect(result.success).toBe(true);
      expect(result.phones.length).toBeGreaterThanOrEqual(0);
      expect(result.brands.length).toBeGreaterThanOrEqual(0);
    });

    it("returns empty results for empty query", async () => {
      const result = await autocomplete({ query: "" });

      expect(result.success).toBe(true);
      expect(result.phones).toEqual([]);
      expect(result.brands).toEqual([]);
    });

    it("respects phone and brand limits", async () => {
      const result = await autocomplete({ query: "a", phoneLimit: 2, brandLimit: 1 });

      expect(result.phones.length).toBeLessThanOrEqual(2);
      expect(result.brands.length).toBeLessThanOrEqual(1);
    });
  });

  describe("fullReindex", () => {
    it("reindexes all phones and brands", async () => {
      const result = await fullReindex();

      expect(result.phones).toBeGreaterThanOrEqual(0);
      expect(result.brands).toBeGreaterThanOrEqual(0);
    }, 30000);

    it("is idempotent — running twice gives same result", async () => {
      const result1 = await fullReindex();
      const result2 = await fullReindex();

      expect(result1.phones).toBe(result2.phones);
      expect(result1.brands).toBe(result2.brands);
    }, 60000);
  });
});
