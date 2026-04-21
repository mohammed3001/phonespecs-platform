/**
 * Search Indexer
 *
 * Responsible for all document lifecycle operations:
 * - Upsert (add/update) documents when entities change
 * - Remove documents when entities are deleted/unpublished
 * - Full reindex (clear + rebuild) for recovery
 *
 * Design principles:
 * - DB is always source of truth
 * - Indexing failures are logged but never block DB operations
 * - All operations are idempotent and safe to retry
 * - Full reindex is always available as a recovery mechanism
 */

import prisma from "@/lib/prisma";
import { searchClient } from "./search-client";
import { INDEX_NAMES } from "./types/documents";
import { mapPhoneToDocument, PHONE_INCLUDE_FOR_SEARCH } from "./mappers/phone-mapper";
import { mapBrandToDocument, BRAND_INCLUDE_FOR_SEARCH } from "./mappers/brand-mapper";
import { configureAllIndexes } from "./search-config";
import { searchLogger } from "./search-logger";

/**
 * Upsert a single phone in the search index.
 * If the phone doesn't exist or is unpublished, removes it from the index.
 *
 * Fire-and-forget safe: call without awaiting from CRUD operations.
 */
export async function indexPhone(phoneId: string): Promise<void> {
  try {
    const phone = await prisma.phone.findUnique({
      where: { id: phoneId },
      include: PHONE_INCLUDE_FOR_SEARCH,
    });

    if (!phone || !phone.isPublished) {
      // Phone doesn't exist or is unpublished — remove from index
      try {
        await searchClient.deleteDocument(INDEX_NAMES.PHONES, phoneId);
        searchLogger.indexSuccess(INDEX_NAMES.PHONES, phoneId, "delete");
      } catch {
        // Document may not exist in index — that's fine
      }
      return;
    }

    const document = mapPhoneToDocument(phone);
    await searchClient.addDocuments(INDEX_NAMES.PHONES, [document as unknown as Record<string, unknown>]);
    searchLogger.indexSuccess(INDEX_NAMES.PHONES, phoneId, "upsert");
  } catch (error) {
    searchLogger.indexFailure(INDEX_NAMES.PHONES, phoneId, "upsert", error);
    // Do NOT rethrow — indexing failure must not block the calling operation
  }
}

/**
 * Remove a phone from the search index.
 * Fire-and-forget safe.
 */
export async function removePhone(phoneId: string): Promise<void> {
  try {
    await searchClient.deleteDocument(INDEX_NAMES.PHONES, phoneId);
    searchLogger.indexSuccess(INDEX_NAMES.PHONES, phoneId, "delete");
  } catch (error) {
    searchLogger.indexFailure(INDEX_NAMES.PHONES, phoneId, "delete", error);
  }
}

/**
 * Upsert a single brand in the search index.
 * If the brand doesn't exist or is inactive, removes it from the index.
 *
 * Fire-and-forget safe.
 */
export async function indexBrand(brandId: string): Promise<void> {
  try {
    const brand = await prisma.brand.findUnique({
      where: { id: brandId },
      include: BRAND_INCLUDE_FOR_SEARCH,
    });

    if (!brand || !brand.isActive) {
      try {
        await searchClient.deleteDocument(INDEX_NAMES.BRANDS, brandId);
        searchLogger.indexSuccess(INDEX_NAMES.BRANDS, brandId, "delete");
      } catch {
        // Document may not exist — that's fine
      }
      return;
    }

    const document = mapBrandToDocument(brand);
    await searchClient.addDocuments(INDEX_NAMES.BRANDS, [document as unknown as Record<string, unknown>]);
    searchLogger.indexSuccess(INDEX_NAMES.BRANDS, brandId, "upsert");
  } catch (error) {
    searchLogger.indexFailure(INDEX_NAMES.BRANDS, brandId, "upsert", error);
  }
}

/**
 * Remove a brand from the search index.
 * Fire-and-forget safe.
 */
export async function removeBrand(brandId: string): Promise<void> {
  try {
    await searchClient.deleteDocument(INDEX_NAMES.BRANDS, brandId);
    searchLogger.indexSuccess(INDEX_NAMES.BRANDS, brandId, "delete");
  } catch (error) {
    searchLogger.indexFailure(INDEX_NAMES.BRANDS, brandId, "delete", error);
  }
}

/**
 * Full reindex of all phones.
 * Clears the index and rebuilds from DB (source of truth).
 * Only indexes published phones.
 */
export async function reindexAllPhones(): Promise<number> {
  const phones = await prisma.phone.findMany({
    where: { isPublished: true },
    include: PHONE_INCLUDE_FOR_SEARCH,
  });

  const documents = phones.map(mapPhoneToDocument);
  
  await searchClient.deleteAllDocuments(INDEX_NAMES.PHONES);
  
  if (documents.length > 0) {
    const task = await searchClient.addDocuments(INDEX_NAMES.PHONES, documents as unknown as Record<string, unknown>[]);
    await searchClient.waitForTask(task.taskUid);
  }

  searchLogger.info(`Reindexed ${documents.length} phones`, {
    operation: "reindex",
    index: INDEX_NAMES.PHONES,
    documentCount: documents.length,
  });

  return documents.length;
}

/**
 * Full reindex of all brands.
 * Clears the index and rebuilds from DB (source of truth).
 * Only indexes active brands.
 */
export async function reindexAllBrands(): Promise<number> {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    include: BRAND_INCLUDE_FOR_SEARCH,
  });

  const documents = brands.map(mapBrandToDocument);

  await searchClient.deleteAllDocuments(INDEX_NAMES.BRANDS);

  if (documents.length > 0) {
    const task = await searchClient.addDocuments(INDEX_NAMES.BRANDS, documents as unknown as Record<string, unknown>[]);
    await searchClient.waitForTask(task.taskUid);
  }

  searchLogger.info(`Reindexed ${documents.length} brands`, {
    operation: "reindex",
    index: INDEX_NAMES.BRANDS,
    documentCount: documents.length,
  });

  return documents.length;
}

/**
 * Full reindex of everything: configure indexes + rebuild all documents.
 * This is the recovery mechanism — safe to run at any time.
 */
export async function fullReindex(): Promise<{ phones: number; brands: number }> {
  const startTime = Date.now();

  searchLogger.info("Starting full reindex...", { operation: "reindex" });

  await configureAllIndexes();
  const phones = await reindexAllPhones();
  const brands = await reindexAllBrands();

  const durationMs = Date.now() - startTime;
  searchLogger.reindexComplete(phones, brands, durationMs);

  return { phones, brands };
}
