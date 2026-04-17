import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import slugify from "slugify";
import { createPhoneSchema, paginationSchema } from "@/lib/validations/schemas";
import { ZodError } from "zod";
import { createAuditLog } from "@/lib/audit";
import { indexPhone, indexBrand } from "@/lib/search";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const params = paginationSchema.parse({
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
    });
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";
    const brand = searchParams.get("brand") || "";
    const skip = (params.page - 1) * params.limit;

    const where: Record<string, unknown> = {};
    if (search) where.name = { contains: search, mode: "insensitive" };
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
        take: params.limit,
      }),
      prisma.phone.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: phones,
      pagination: { page: params.page, limit: params.limit, total, totalPages: Math.ceil(total / params.limit) },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, error: "Invalid query parameters", details: error.issues }, { status: 400 });
    }
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
    const validated = createPhoneSchema.parse(body);
    const slug = slugify(validated.name, { lower: true, strict: true });

    // Check for duplicate slug
    const existing = await prisma.phone.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ success: false, error: "A phone with this name already exists" }, { status: 409 });
    }

    const phone = await prisma.phone.create({
      data: {
        name: validated.name,
        slug,
        brandId: validated.brandId,
        marketStatus: validated.marketStatus,
        releaseDate: validated.releaseDate || null,
        priceUsd: validated.priceUsd ? Number(validated.priceUsd) : null,
        priceDisplay: validated.priceDisplay || null,
        overview: validated.overview || null,
        mainImage: validated.mainImage || null,
        isFeatured: validated.isFeatured,
        isPublished: validated.isPublished,
        publishedAt: validated.isPublished ? new Date() : null,
      },
      include: {
        brand: { select: { id: true, name: true, slug: true } },
      },
    });

    // Create specs if provided
    if (validated.specs && validated.specs.length > 0) {
      await prisma.phoneSpec.createMany({
        data: validated.specs.map((spec) => ({
          phoneId: phone.id,
          specId: spec.specId,
          value: spec.value,
          numericValue: spec.numericValue || null,
        })),
      });
    }

    // Update brand phone count
    await prisma.brand.update({
      where: { id: validated.brandId },
      data: { phoneCount: { increment: 1 } },
    });

    // Audit log with after state
    const userId = (session.user as unknown as { id: string }).id;
    await createAuditLog({
      userId,
      action: "phone_created",
      entityType: "phone",
      entityId: phone.id,
      changes: `Created phone: ${phone.name}`,
      afterState: {
        name: phone.name,
        slug: phone.slug,
        brandId: phone.brandId,
        marketStatus: phone.marketStatus,
        priceUsd: phone.priceUsd,
        isPublished: phone.isPublished,
      },
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
    });

    // Sync to search index (fire-and-forget — DB is source of truth)
    indexPhone(phone.id).catch(() => {});
    // Brand phone count changed — reindex brand too
    indexBrand(validated.brandId).catch(() => {});

    return NextResponse.json({ success: true, data: phone }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("Create phone error:", error);
    return NextResponse.json({ success: false, error: "Failed to create phone" }, { status: 500 });
  }
}
