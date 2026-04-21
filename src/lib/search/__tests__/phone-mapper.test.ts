/**
 * Phone Mapper Tests
 *
 * Tests the pure transformation from Prisma Phone entity to PhoneSearchDocument.
 * These are unit tests — no DB, no Meilisearch, no side effects.
 */

import { describe, it, expect } from "vitest";
import { mapPhoneToDocument, extractNumeric } from "../mappers/phone-mapper";
import type { PhoneWithRelations } from "../mappers/phone-mapper";

/** Factory for creating test phone entities */
function createTestPhone(overrides: Partial<PhoneWithRelations> = {}): PhoneWithRelations {
  return {
    id: "phone-1",
    name: "Samsung Galaxy S24 Ultra",
    slug: "samsung-galaxy-s24-ultra",
    brand: { name: "Samsung", slug: "samsung" },
    marketStatus: "available",
    priceUsd: 1299.99,
    priceDisplay: "$1,299",
    releaseDate: "2024-01-17",
    overview: "The ultimate premium smartphone with titanium frame.",
    mainImage: "/images/s24-ultra.jpg",
    isFeatured: true,
    updatedAt: new Date("2024-06-01T00:00:00Z"),
    createdAt: new Date("2024-01-17T00:00:00Z"),
    specs: [
      { spec: { key: "display_size", group: { id: "g1", name: "Display", slug: "display", sortOrder: 1, createdAt: new Date(), icon: null } }, value: "6.8 inches" },
      { spec: { key: "display_type", group: { id: "g1", name: "Display", slug: "display", sortOrder: 1, createdAt: new Date(), icon: null } }, value: "Dynamic AMOLED 2X" },
      { spec: { key: "ram", group: { id: "g2", name: "Performance", slug: "performance", sortOrder: 2, createdAt: new Date(), icon: null } }, value: "12 GB" },
      { spec: { key: "storage", group: { id: "g2", name: "Performance", slug: "performance", sortOrder: 2, createdAt: new Date(), icon: null } }, value: "256 GB" },
      { spec: { key: "main_camera", group: { id: "g3", name: "Camera", slug: "camera", sortOrder: 3, createdAt: new Date(), icon: null } }, value: "200 MP" },
      { spec: { key: "front_camera", group: { id: "g3", name: "Camera", slug: "camera", sortOrder: 3, createdAt: new Date(), icon: null } }, value: "12 MP" },
      { spec: { key: "battery_capacity", group: { id: "g4", name: "Battery", slug: "battery", sortOrder: 4, createdAt: new Date(), icon: null } }, value: "5000 mAh" },
      { spec: { key: "processor", group: { id: "g2", name: "Performance", slug: "performance", sortOrder: 2, createdAt: new Date(), icon: null } }, value: "Snapdragon 8 Gen 3" },
      { spec: { key: "os", group: { id: "g5", name: "Software", slug: "software", sortOrder: 5, createdAt: new Date(), icon: null } }, value: "Android 14" },
    ],
    ...overrides,
  };
}

describe("extractNumeric", () => {
  it("extracts number from string with units", () => {
    expect(extractNumeric("6.8 inches")).toBe(6.8);
    expect(extractNumeric("5000 mAh")).toBe(5000);
    expect(extractNumeric("12 GB")).toBe(12);
    expect(extractNumeric("256 GB")).toBe(256);
    expect(extractNumeric("200 MP")).toBe(200);
  });

  it("returns 0 for null/undefined/empty", () => {
    expect(extractNumeric(null)).toBe(0);
    expect(extractNumeric(undefined)).toBe(0);
    expect(extractNumeric("")).toBe(0);
  });

  it("returns 0 for non-numeric strings", () => {
    expect(extractNumeric("No data")).toBe(0);
    expect(extractNumeric("N/A")).toBe(0);
  });

  it("extracts first number from complex strings", () => {
    expect(extractNumeric("12 + 2 GB")).toBe(12);
    expect(extractNumeric("Snapdragon 8 Gen 3")).toBe(8);
  });
});

describe("mapPhoneToDocument", () => {
  it("maps all required fields correctly", () => {
    const phone = createTestPhone();
    const doc = mapPhoneToDocument(phone);

    expect(doc.id).toBe("phone-1");
    expect(doc.name).toBe("Samsung Galaxy S24 Ultra");
    expect(doc.slug).toBe("samsung-galaxy-s24-ultra");
    expect(doc.brandName).toBe("Samsung");
    expect(doc.brandSlug).toBe("samsung");
    expect(doc.marketStatus).toBe("available");
    expect(doc.priceUsd).toBe(1299.99);
    expect(doc.priceDisplay).toBe("$1,299");
    expect(doc.releaseDate).toBe("2024-01-17");
    expect(doc.overview).toBe("The ultimate premium smartphone with titanium frame.");
    expect(doc.mainImage).toBe("/images/s24-ultra.jpg");
    expect(doc.isFeatured).toBe(true);
  });

  it("maps spec values from specs array", () => {
    const doc = mapPhoneToDocument(createTestPhone());

    expect(doc.displaySize).toBe("6.8 inches");
    expect(doc.displayType).toBe("Dynamic AMOLED 2X");
    expect(doc.ram).toBe("12 GB");
    expect(doc.storage).toBe("256 GB");
    expect(doc.mainCamera).toBe("200 MP");
    expect(doc.frontCamera).toBe("12 MP");
    expect(doc.battery).toBe("5000 mAh");
    expect(doc.processor).toBe("Snapdragon 8 Gen 3");
    expect(doc.os).toBe("Android 14");
  });

  it("computes numeric values for filtering", () => {
    const doc = mapPhoneToDocument(createTestPhone());

    expect(doc.priceNumeric).toBe(1299.99);
    expect(doc.batteryNumeric).toBe(5000);
    expect(doc.displaySizeNumeric).toBe(6.8);
    expect(doc.ramNumeric).toBe(12);
    expect(doc.storageNumeric).toBe(256);
  });

  it("handles null price correctly", () => {
    const doc = mapPhoneToDocument(createTestPhone({ priceUsd: null }));
    expect(doc.priceUsd).toBeNull();
    expect(doc.priceNumeric).toBe(0);
  });

  it("handles phone with no specs", () => {
    const doc = mapPhoneToDocument(createTestPhone({ specs: [] }));

    expect(doc.displaySize).toBeNull();
    expect(doc.ram).toBeNull();
    expect(doc.battery).toBeNull();
    expect(doc.processor).toBeNull();
    expect(doc.batteryNumeric).toBe(0);
    expect(doc.ramNumeric).toBe(0);
    expect(doc.storageNumeric).toBe(0);
    expect(doc.specValues).toEqual([]);
  });

  it("converts timestamps to epoch ms", () => {
    const phone = createTestPhone({
      createdAt: new Date("2024-01-17T00:00:00Z"),
      updatedAt: new Date("2024-06-01T00:00:00Z"),
    });
    const doc = mapPhoneToDocument(phone);

    expect(doc.createdAt).toBe(new Date("2024-01-17T00:00:00Z").getTime());
    expect(doc.updatedAt).toBe(new Date("2024-06-01T00:00:00Z").getTime());
  });

  it("builds specValues array for faceted search", () => {
    const doc = mapPhoneToDocument(createTestPhone());

    expect(doc.specValues).toContain("display:display_size:6.8 inches");
    expect(doc.specValues).toContain("performance:ram:12 GB");
    expect(doc.specValues).toContain("camera:main_camera:200 MP");
    expect(doc.specValues.length).toBe(9);
  });

  it("document shape matches PhoneSearchDocument interface", () => {
    const doc = mapPhoneToDocument(createTestPhone());

    // Verify all required keys are present
    const requiredKeys = [
      "id", "name", "slug", "brandName", "brandSlug", "marketStatus",
      "priceUsd", "priceDisplay", "releaseDate", "overview", "mainImage",
      "isFeatured", "displaySize", "displayType", "ram", "storage",
      "mainCamera", "frontCamera", "battery", "processor", "os",
      "priceNumeric", "batteryNumeric", "displaySizeNumeric", "ramNumeric",
      "storageNumeric", "specValues", "updatedAt", "createdAt",
    ];

    for (const key of requiredKeys) {
      expect(doc).toHaveProperty(key);
    }

    // Verify no extra keys (document shape is controlled)
    expect(Object.keys(doc).sort()).toEqual(requiredKeys.sort());
  });
});
