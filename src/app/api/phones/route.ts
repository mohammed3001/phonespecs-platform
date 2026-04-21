import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { phoneQuerySchema } from "@/lib/validations/schemas";
import { ZodError } from "zod";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = phoneQuerySchema.parse({
      q: searchParams.get("q") || undefined,
      brand: searchParams.get("brand") || undefined,
      minPrice: searchParams.get("minPrice") || undefined,
      maxPrice: searchParams.get("maxPrice") || undefined,
      status: searchParams.get("status") || undefined,
      sort: searchParams.get("sort") || "newest",
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "12",
    });

    const skip = (params.page - 1) * params.limit;

    const where: Record<string, unknown> = {
      isPublished: true,
    };

    if (params.q) {
      where.name = { contains: params.q, mode: "insensitive" };
    }

    if (params.brand) {
      where.brand = { slug: params.brand };
    }

    if (params.minPrice !== undefined || params.maxPrice !== undefined) {
      where.priceUsd = {};
      if (params.minPrice !== undefined) (where.priceUsd as Record<string, number>).gte = params.minPrice;
      if (params.maxPrice !== undefined) (where.priceUsd as Record<string, number>).lte = params.maxPrice;
    }

    if (params.status) {
      where.marketStatus = params.status;
    }

    let orderBy: Record<string, string> = {};
    switch (params.sort) {
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
        take: params.limit,
      }),
      prisma.phone.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: phones,
      pagination: {
        page: params.page,
        limit: params.limit,
        total,
        totalPages: Math.ceil(total / params.limit),
      },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, error: "Invalid query parameters", details: error.issues }, { status: 400 });
    }
    console.error("Error fetching phones:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch phones" },
      { status: 500 }
    );
  }
}
