/**
 * Search Request DTO Tests
 *
 * Tests validation, parsing, and edge cases for search request parameters.
 */

import { describe, it, expect } from "vitest";
import { parseSearchRequest, SearchValidationError, PAGINATION } from "../types/requests";

function params(obj: Record<string, string>): URLSearchParams {
  return new URLSearchParams(obj);
}

describe("parseSearchRequest", () => {
  describe("query parsing", () => {
    it("parses simple query", () => {
      const req = parseSearchRequest(params({ q: "samsung galaxy" }));
      expect(req.query).toBe("samsung galaxy");
    });

    it("defaults to empty string when no query", () => {
      const req = parseSearchRequest(params({}));
      expect(req.query).toBe("");
    });

    it("truncates query to max length", () => {
      const longQuery = "a".repeat(300);
      const req = parseSearchRequest(params({ q: longQuery }));
      expect(req.query.length).toBe(PAGINATION.MAX_QUERY_LENGTH);
    });
  });

  describe("pagination", () => {
    it("defaults to page 1 and limit 20", () => {
      const req = parseSearchRequest(params({}));
      expect(req.page).toBe(1);
      expect(req.limit).toBe(20);
    });

    it("parses explicit page and limit", () => {
      const req = parseSearchRequest(params({ page: "3", limit: "50" }));
      expect(req.page).toBe(3);
      expect(req.limit).toBe(50);
    });

    it("clamps page minimum to 1", () => {
      const req = parseSearchRequest(params({ page: "0" }));
      expect(req.page).toBe(1);
    });

    it("clamps limit to max 100", () => {
      const req = parseSearchRequest(params({ limit: "500" }));
      expect(req.limit).toBe(100);
    });

    it("handles non-numeric page gracefully", () => {
      const req = parseSearchRequest(params({ page: "abc" }));
      expect(req.page).toBe(1);
    });
  });

  describe("sort validation", () => {
    it("accepts valid sort keys", () => {
      const validKeys = ["price_asc", "price_desc", "name_asc", "name_desc", "newest", "battery", "display", "ram", "storage"];
      for (const key of validKeys) {
        const req = parseSearchRequest(params({ sort: key }));
        expect(req.sort).toBe(key);
      }
    });

    it("throws SearchValidationError for invalid sort key", () => {
      expect(() => parseSearchRequest(params({ sort: "invalid_sort" }))).toThrow(SearchValidationError);
    });

    it("allows empty sort (defaults to relevance)", () => {
      const req = parseSearchRequest(params({}));
      expect(req.sort).toBe("");
    });
  });

  describe("filter parsing", () => {
    it("parses brand filter", () => {
      const req = parseSearchRequest(params({ brand: "samsung,apple" }));
      expect(req.filters.brand).toBe("samsung,apple");
    });

    it("parses status filter", () => {
      const req = parseSearchRequest(params({ status: "available" }));
      expect(req.filters.status).toBe("available");
    });

    it("parses numeric range filters", () => {
      const req = parseSearchRequest(params({
        priceMin: "300",
        priceMax: "800",
        ramMin: "8",
        batteryMin: "4000",
        displayMin: "6.0",
        storageMin: "128",
      }));

      expect(req.filters.priceMin).toBe(300);
      expect(req.filters.priceMax).toBe(800);
      expect(req.filters.ramMin).toBe(8);
      expect(req.filters.batteryMin).toBe(4000);
      expect(req.filters.displayMin).toBe(6.0);
      expect(req.filters.storageMin).toBe(128);
    });

    it("ignores invalid numeric filter values", () => {
      const req = parseSearchRequest(params({ priceMin: "abc", ramMin: "-5" }));
      expect(req.filters.priceMin).toBeUndefined();
      // -5 is < 0, so it should be ignored
      expect(req.filters.ramMin).toBeUndefined();
    });

    it("returns empty filters when none provided", () => {
      const req = parseSearchRequest(params({}));
      expect(req.filters).toEqual({});
    });
  });
});
