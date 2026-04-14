import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import slugify from "slugify";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const brand = searchParams.get("brand") || "";
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) where.name = { contains: search };
    if (status) where.marketStatus = status;
    if (brand) where.brand = { slug: brand };

    const [phones, total] = await Promise.all([
      prisma.phone.findMany({
        where,
        include: {
          brand: { select: { id: true, name: true, slug: true } },
          _count: { select: { reviews: true, specs: true } },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.phone.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: phones,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Admin phones error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch phones" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const slug = slugify(body.name, { lower: true, strict: true });

    const phone = await prisma.phone.create({
      data: {
        name: body.name,
        slug,
        brandId: body.brandId,
        marketStatus: body.marketStatus || "available",
        releaseDate: body.releaseDate || null,
        priceUsd: body.priceUsd ? parseFloat(body.priceUsd) : null,
        priceDisplay: body.priceDisplay || null,
        overview: body.overview || null,
        mainImage: body.mainImage || null,
        isFeatured: body.isFeatured || false,
        isPublished: body.isPublished || false,
        publishedAt: body.isPublished ? new Date() : null,
      },
      include: {
        brand: { select: { id: true, name: true, slug: true } },
      },
    });

    // Create specs if provided
    if (body.specs && Array.isArray(body.specs)) {
      for (const spec of body.specs) {
        await prisma.phoneSpec.create({
          data: {
            phoneId: phone.id,
            specId: spec.specId,
            value: spec.value,
            numericValue: spec.numericValue || null,
          },
        });
      }
    }

    // Update brand phone count
    await prisma.brand.update({
      where: { id: body.brandId },
      data: { phoneCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, data: phone }, { status: 201 });
  } catch (error) {
    console.error("Create phone error:", error);
    return NextResponse.json({ success: false, error: "Failed to create phone" }, { status: 500 });
  }
}
