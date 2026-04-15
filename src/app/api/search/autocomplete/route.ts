import { NextRequest, NextResponse } from "next/server";
import meiliClient, { PHONES_INDEX, BRANDS_INDEX } from "@/lib/meilisearch";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  if (!q || q.length < 1) {
    return NextResponse.json({ success: true, phones: [], brands: [] });
  }

  try {
    // Search phones and brands in parallel
    const [phoneResults, brandResults] = await Promise.all([
      meiliClient.index(PHONES_INDEX).search(q, {
        limit: 5,
        attributesToRetrieve: [
          "name", "slug", "brandName", "priceDisplay", "priceUsd",
          "imagePath", "marketStatus",
        ],
        attributesToHighlight: ["name"],
        highlightPreTag: "<mark>",
        highlightPostTag: "</mark>",
      }),
      meiliClient.index(BRANDS_INDEX).search(q, {
        limit: 3,
        attributesToRetrieve: ["name", "slug", "phoneCount"],
        attributesToHighlight: ["name"],
        highlightPreTag: "<mark>",
        highlightPostTag: "</mark>",
      }),
    ]);

    const responseMs = Date.now() - startTime;

    // Log autocomplete query (fire and forget)
    prisma.searchQuery.create({
      data: {
        query: q,
        normalizedQuery: q.toLowerCase().trim(),
        resultCount: (phoneResults.estimatedTotalHits || 0) + (brandResults.estimatedTotalHits || 0),
        source: "autocomplete",
        responseMs,
      },
    }).catch(() => {/* ignore */});

    return NextResponse.json({
      success: true,
      phones: phoneResults.hits,
      brands: brandResults.hits,
      meta: {
        processingTimeMs: Math.max(
          phoneResults.processingTimeMs,
          brandResults.processingTimeMs
        ),
        responseTimeMs: responseMs,
      },
    });
  } catch (error) {
    console.error("Autocomplete error:", error);
    // Fallback to simple PostgreSQL query
    try {
      const phones = await prisma.phone.findMany({
        where: {
          isPublished: true,
          name: { contains: q, mode: "insensitive" },
        },
        select: {
          name: true, slug: true, priceDisplay: true, priceUsd: true,
          mainImage: true, marketStatus: true,
          brand: { select: { name: true } },
        },
        take: 5,
      });

      return NextResponse.json({
        success: true,
        phones: phones.map((p) => ({
          ...p,
          brandName: p.brand.name,
        })),
        brands: [],
        meta: { processingTimeMs: 0, responseTimeMs: Date.now() - startTime, fallback: true },
      });
    } catch {
      return NextResponse.json({ success: true, phones: [], brands: [] });
    }
  }
}
