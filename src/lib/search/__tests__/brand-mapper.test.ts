/**
 * Brand Mapper Tests
 *
 * Tests the pure transformation from Prisma Brand entity to BrandSearchDocument.
 */

import { describe, it, expect } from "vitest";
import { mapBrandToDocument } from "../mappers/brand-mapper";
import type { BrandWithRelations } from "../mappers/brand-mapper";

function createTestBrand(overrides: Partial<BrandWithRelations> = {}): BrandWithRelations {
  return {
    id: "brand-1",
    name: "Samsung",
    slug: "samsung",
    description: "South Korean electronics giant",
    updatedAt: new Date("2024-06-01T00:00:00Z"),
    _count: { phones: 15 },
    ...overrides,
  };
}

describe("mapBrandToDocument", () => {
  it("maps all required fields correctly", () => {
    const doc = mapBrandToDocument(createTestBrand());

    expect(doc.id).toBe("brand-1");
    expect(doc.name).toBe("Samsung");
    expect(doc.slug).toBe("samsung");
    expect(doc.description).toBe("South Korean electronics giant");
    expect(doc.phoneCount).toBe(15);
  });

  it("handles null description", () => {
    const doc = mapBrandToDocument(createTestBrand({ description: null }));
    expect(doc.description).toBeNull();
  });

  it("handles brand with zero phones", () => {
    const doc = mapBrandToDocument(createTestBrand({ _count: { phones: 0 } }));
    expect(doc.phoneCount).toBe(0);
  });

  it("converts timestamp to epoch ms", () => {
    const doc = mapBrandToDocument(createTestBrand({
      updatedAt: new Date("2024-06-01T00:00:00Z"),
    }));
    expect(doc.updatedAt).toBe(new Date("2024-06-01T00:00:00Z").getTime());
  });

  it("document shape matches BrandSearchDocument interface", () => {
    const doc = mapBrandToDocument(createTestBrand());
    const requiredKeys = ["id", "name", "slug", "description", "phoneCount", "updatedAt"];

    for (const key of requiredKeys) {
      expect(doc).toHaveProperty(key);
    }
    expect(Object.keys(doc).sort()).toEqual(requiredKeys.sort());
  });
});
