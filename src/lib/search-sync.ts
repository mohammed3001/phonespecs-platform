/**
 * Search Sync Pipeline
 * 
 * Syncs PostgreSQL data to Meilisearch indexes.
 * Supports full reindex and incremental updates.
 */
import prisma from "./prisma";
import meiliClient, {
  PHONES_INDEX,
  BRANDS_INDEX,
  type PhoneSearchDocument,
  type BrandSearchDocument,
} from "./meilisearch";
import { configureAllIndexes } from "./search-config";

/** Extract numeric value from spec string like "6.8 inches" → 6.8 */
function extractNumeric(value: string | null | undefined): number {
  if (!value) return 0;
  const match = value.match(/[\d.]+/);
  return match ? parseFloat(match[0]) : 0;
}

/** Get spec value by key from phone specs array */
function getSpecValue(
  specs: Array<{ spec: { key: string }; value: string }>,
  key: string
): string | null {
  const found = specs.find((s) => s.spec.key === key);
  return found?.value || null;
}

/** Transform a Prisma phone record into a Meilisearch document */
function phoneToDocument(
  phone: {
    id: string;
    name: string;
    slug: string;
    brand: { name: string; slug: string };
    marketStatus: string;
    priceUsd: number | null;
    priceDisplay: string | null;
    releaseDate: string | null;
    overview: string | null;
    mainImage: string | null;
    isFeatured: boolean;
    updatedAt: Date;
    createdAt: Date;
    specs: Array<{ spec: { key: string; group: { id: string; name: string; slug: string; sortOrder: number; createdAt: Date; icon: string | null } }; value: string }>;
  }
): PhoneSearchDocument {
  const specValues = phone.specs.map(
    (s) => `${s.spec.group.slug}:${s.spec.key}:${s.value}`
  );

  return {
    id: phone.id,
    name: phone.name,
    slug: phone.slug,
    brandName: phone.brand.name,
    brandSlug: phone.brand.slug,
    marketStatus: phone.marketStatus,
    priceUsd: phone.priceUsd,
    priceDisplay: phone.priceDisplay,
    releaseDate: phone.releaseDate ? String(phone.releaseDate) : null,
    overview: phone.overview,
    mainImage: phone.mainImage,
    isFeatured: phone.isFeatured,
    // Flattened specs
    displaySize: getSpecValue(phone.specs, "display_size"),
    displayType: getSpecValue(phone.specs, "display_type"),
    ram: getSpecValue(phone.specs, "ram"),
    storage: getSpecValue(phone.specs, "storage"),
    mainCamera: getSpecValue(phone.specs, "main_camera"),
    frontCamera: getSpecValue(phone.specs, "front_camera"),
    battery: getSpecValue(phone.specs, "battery_capacity"),
    processor: getSpecValue(phone.specs, "processor"),
    os: getSpecValue(phone.specs, "os"),
    // Numeric specs for range filtering
    priceNumeric: phone.priceUsd || 0,
    batteryNumeric: extractNumeric(getSpecValue(phone.specs, "battery_capacity")),
    displaySizeNumeric: extractNumeric(getSpecValue(phone.specs, "display_size")),
    ramNumeric: extractNumeric(getSpecValue(phone.specs, "ram")),
    storageNumeric: extractNumeric(getSpecValue(phone.specs, "storage")),
    // Faceted values
    specValues,
    // Timestamps
    updatedAt: phone.updatedAt.getTime(),
    createdAt: phone.createdAt.getTime(),
  };
}

/** Full reindex: clear and rebuild all phone documents */
export async function syncAllPhones(): Promise<number> {
  const phones = await prisma.phone.findMany({
    where: { isPublished: true },
    include: {
      brand: { select: { name: true, slug: true } },
      specs: {
        include: {
          spec: { select: { key: true, group: true } },
        },
      },
    },
  });

  const documents = phones.map(phoneToDocument);
  const index = meiliClient.index(PHONES_INDEX);

  // Delete all existing documents and add fresh ones
  await index.deleteAllDocuments();
  if (documents.length > 0) {
    const task = await index.addDocuments(documents);
    await meiliClient.tasks.waitForTask(task.taskUid, { timeout: 30000 });
  }

  console.log(`✅ Synced ${documents.length} phones to Meilisearch`);
  return documents.length;
}

/** Sync a single phone (for incremental updates) */
export async function syncPhone(phoneId: string): Promise<void> {
  const phone = await prisma.phone.findUnique({
    where: { id: phoneId },
    include: {
      brand: { select: { name: true, slug: true } },
      specs: {
        include: {
          spec: { select: { key: true, group: true } },
        },
      },
    },
  });

  const index = meiliClient.index(PHONES_INDEX);

  if (!phone || !phone.isPublished) {
    try {
      await index.deleteDocument(phoneId);
    } catch {
      // Document may not exist — ignore
    }
    return;
  }

  const document = phoneToDocument(phone);
  await index.addDocuments([document]);
}

/** Full reindex: clear and rebuild all brand documents */
export async function syncAllBrands(): Promise<number> {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { phones: true } },
    },
  });

  const documents: BrandSearchDocument[] = brands.map((brand) => ({
    id: brand.id,
    name: brand.name,
    slug: brand.slug,
    description: brand.description,
    phoneCount: brand._count.phones,
    updatedAt: brand.updatedAt.getTime(),
  }));

  const index = meiliClient.index(BRANDS_INDEX);
  await index.deleteAllDocuments();
  if (documents.length > 0) {
    const task = await index.addDocuments(documents);
    await meiliClient.tasks.waitForTask(task.taskUid, { timeout: 30000 });
  }

  console.log(`✅ Synced ${documents.length} brands to Meilisearch`);
  return documents.length;
}

/** Full reindex of everything + configure indexes */
export async function fullReindex(): Promise<{ phones: number; brands: number }> {
  console.log("🔄 Starting full reindex...");
  await configureAllIndexes();
  const phones = await syncAllPhones();
  const brands = await syncAllBrands();
  console.log(`✅ Full reindex complete: ${phones} phones, ${brands} brands`);
  return { phones, brands };
}
