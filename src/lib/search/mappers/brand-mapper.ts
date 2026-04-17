/**
 * Brand Mapper
 *
 * Transforms Prisma Brand entities into BrandSearchDocument.
 * This is the SINGLE source of truth for the brand document shape.
 */

import type { BrandSearchDocument } from "../types/documents";

/** Prisma Brand with required relations for mapping */
export interface BrandWithRelations {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  updatedAt: Date;
  _count: { phones: number };
}

/** Prisma include/select clause needed to fetch a brand with all mapper dependencies */
export const BRAND_INCLUDE_FOR_SEARCH = {
  _count: { select: { phones: true } },
} as const;

/**
 * Map a Prisma Brand entity to a Meilisearch BrandSearchDocument.
 * Pure function — no side effects, no DB calls, no SDK calls.
 */
export function mapBrandToDocument(brand: BrandWithRelations): BrandSearchDocument {
  return {
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    phoneCount: brand._count.phones,
    updatedAt: brand.updatedAt.getTime(),
  };
}
