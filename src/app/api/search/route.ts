import { NextRequest, NextResponse } from "next/server";
import meiliClient, { PHONES_INDEX } from "@/lib/meilisearch";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);

  const q = searchParams.get("q") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10), 100);
  const sort = searchParams.get("sort") || "";
  const brand = searchParams.get("brand") || "";
  const status = searchParams.get("status") || "";
  const priceMin = searchParams.get("priceMin") || "";
  const priceMax = searchParams.get("priceMax") || "";
  const ramMin = searchParams.get("ramMin") || "";
  const batteryMin = searchParams.get("batteryMin") || "";
  const displayMin = searchParams.get("displayMin") || "";
  const storageMin = searchParams.get("storageMin") || "";

  try {
    // Build filter array
    const filters: string[] = [];
    if (brand) {
      const brands = brand.split(",").map((b) => `brandSlug = "${b.trim()}"`);
      filters.push(`(${brands.join(" OR ")})`);
    }
    if (status) {
      filters.push(`marketStatus = "${status}"`);
    }
    if (priceMin) filters.push(`priceNumeric >= ${parseFloat(priceMin)}`);
    if (priceMax) filters.push(`priceNumeric <= ${parseFloat(priceMax)}`);
    if (ramMin) filters.push(`ramNumeric >= ${parseFloat(ramMin)}`);
    if (batteryMin) filters.push(`batteryNumeric >= ${parseFloat(batteryMin)}`);
    if (displayMin) filters.push(`displaySizeNumeric >= ${parseFloat(displayMin)}`);
    if (storageMin) filters.push(`storageNumeric >= ${parseFloat(storageMin)}`);

    // Build sort array
    const sortRules: string[] = [];
    if (sort) {
      const sortMap: Record<string, string> = {
        "price_asc": "priceNumeric:asc",
        "price_desc": "priceNumeric:desc",
        "name_asc": "name:asc",
        "name_desc": "name:desc",
        "newest": "createdAt:desc",
        "battery": "batteryNumeric:desc",
        "display": "displaySizeNumeric:desc",
        "ram": "ramNumeric:desc",
        "storage": "storageNumeric:desc",
      };
      if (sortMap[sort]) sortRules.push(sortMap[sort]);
    }

    const index = meiliClient.index(PHONES_INDEX);
    const results = await index.search(q, {
      limit,
      offset: (page - 1) * limit,
      filter: filters.length > 0 ? filters.join(" AND ") : undefined,
      sort: sortRules.length > 0 ? sortRules : undefined,
      facets: [
        "brandName",
        "marketStatus",
        "ram",
        "storage",
        "os",
        "displayType",
      ],
      attributesToHighlight: ["name", "overview"],
      highlightPreTag: "<mark>",
      highlightPostTag: "</mark>",
      attributesToCrop: ["overview"],
      cropLength: 150,
    });

    const responseMs = Date.now() - startTime;

    // Log search query for analytics (fire and forget)
    prisma.searchQuery.create({
      data: {
        query: q,
        normalizedQuery: q.toLowerCase().trim(),
        resultCount: results.estimatedTotalHits || 0,
        filters: filters.length > 0 ? JSON.stringify(filters) : null,
        sortBy: sort || null,
        source: "web",
        responseMs,
      },
    }).catch(() => {/* ignore analytics errors */});

    return NextResponse.json({
      success: true,
      data: results.hits,
      facets: results.facetDistribution || {},
      pagination: {
        page,
        limit,
        total: results.estimatedTotalHits || 0,
        totalPages: Math.ceil((results.estimatedTotalHits || 0) / limit),
      },
      meta: {
        query: q,
        processingTimeMs: results.processingTimeMs,
        responseTimeMs: responseMs,
      },
    });
  } catch (error) {
    console.error("Search error:", error);

    // Fallback to PostgreSQL if Meilisearch is unavailable
    try {
      const where: Record<string, unknown> = {};
      if (q) where.name = { contains: q, mode: "insensitive" };
      if (brand) where.brand = { slug: brand.split(",")[0] };
      if (status) where.marketStatus = status;

      const [phones, total] = await Promise.all([
        prisma.phone.findMany({
          where: { ...where, isPublished: true },
          include: {
            brand: { select: { name: true, slug: true } },
            specs: { include: { spec: { select: { key: true, group: true } } } },
          },
          take: limit,
          skip: (page - 1) * limit,
          orderBy: { createdAt: "desc" },
        }),
        prisma.phone.count({ where: { ...where, isPublished: true } }),
      ]);

      return NextResponse.json({
        success: true,
        data: phones,
        facets: {},
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        meta: {
          query: q,
          processingTimeMs: 0,
          responseTimeMs: Date.now() - startTime,
          fallback: true,
        },
      });
    } catch {
      return NextResponse.json(
        { success: false, error: "Search service unavailable" },
        { status: 503 }
      );
    }
  }
}
