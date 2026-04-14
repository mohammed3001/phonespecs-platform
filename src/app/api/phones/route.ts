import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") || "";
    const brand = searchParams.get("brand") || "";
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const status = searchParams.get("status") || "";
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {
      isPublished: true,
    };

    if (query) {
      where.name = { contains: query };
    }

    if (brand) {
      where.brand = { slug: brand };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      where.priceUsd = {};
      if (minPrice !== undefined) (where.priceUsd as Record<string, number>).gte = minPrice;
      if (maxPrice !== undefined) (where.priceUsd as Record<string, number>).lte = maxPrice;
    }

    if (status) {
      where.marketStatus = status;
    }

    let orderBy: Record<string, string> = {};
    switch (sort) {
      case "price_asc": orderBy = { priceUsd: "asc" }; break;
      case "price_desc": orderBy = { priceUsd: "desc" }; break;
      case "name": orderBy = { name: "asc" }; break;
      case "rating": orderBy = { reviewScore: "desc" }; break;
      case "popular": orderBy = { viewCount: "desc" }; break;
      default: orderBy = { createdAt: "desc" };
    }

    const [phones, total] = await Promise.all([
      prisma.phone.findMany({
        where,
        include: {
          brand: { select: { id: true, name: true, slug: true, logo: true } },
          specs: {
            include: {
              spec: {
                include: {
                  group: true,
                },
              },
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.phone.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: phones,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching phones:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch phones" },
      { status: 500 }
    );
  }
}
