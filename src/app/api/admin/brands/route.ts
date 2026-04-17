import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { indexBrand, removeBrand } from "@/lib/search";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const brands = await prisma.brand.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { phones: true } },
      },
    });

    const data = brands.map((b) => ({
      ...b,
      phoneCount: b._count.phones,
      _count: undefined,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Admin brands error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch brands" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, logo, description, website, isActive, sortOrder, metaTitle, metaDescription } = body;

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: "Name and slug are required" }, { status: 400 });
    }

    const existing = await prisma.brand.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ success: false, error: "A brand with this slug already exists" }, { status: 409 });
    }

    const brand = await prisma.brand.create({
      data: {
        name,
        slug,
        logo: logo || null,
        description: description || null,
        website: website || null,
        isActive: isActive !== false,
        sortOrder: sortOrder || 0,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "CREATE",
        entityType: "brand",
        entityId: brand.id,
        afterState: JSON.stringify(brand),
      },
    });

    // Sync to search index (fire-and-forget — DB is source of truth)
    indexBrand(brand.id).catch(() => {});

    return NextResponse.json({ success: true, data: brand }, { status: 201 });
  } catch (error) {
    console.error("Create brand error:", error);
    return NextResponse.json({ success: false, error: "Failed to create brand" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, slug, logo, description, website, isActive, sortOrder, metaTitle, metaDescription } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Brand ID is required" }, { status: 400 });
    }

    const existing = await prisma.brand.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
    }

    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.brand.findUnique({ where: { slug } });
      if (slugExists) {
        return NextResponse.json({ success: false, error: "A brand with this slug already exists" }, { status: 409 });
      }
    }

    const brand = await prisma.brand.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        slug: slug ?? existing.slug,
        logo: logo !== undefined ? logo : existing.logo,
        description: description !== undefined ? description : existing.description,
        website: website !== undefined ? website : existing.website,
        isActive: isActive !== undefined ? isActive : existing.isActive,
        sortOrder: sortOrder !== undefined ? sortOrder : existing.sortOrder,
        metaTitle: metaTitle !== undefined ? metaTitle : existing.metaTitle,
        metaDescription: metaDescription !== undefined ? metaDescription : existing.metaDescription,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "UPDATE",
        entityType: "brand",
        entityId: brand.id,
        beforeState: JSON.stringify(existing),
        afterState: JSON.stringify(brand),
      },
    });

    // Sync to search index (fire-and-forget — DB is source of truth)
    indexBrand(brand.id).catch(() => {});

    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    console.error("Update brand error:", error);
    return NextResponse.json({ success: false, error: "Failed to update brand" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Brand ID is required" }, { status: 400 });
    }

    const existing = await prisma.brand.findUnique({
      where: { id },
      include: { _count: { select: { phones: true } } },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Brand not found" }, { status: 404 });
    }

    if (existing._count.phones > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete brand with ${existing._count.phones} associated phones` },
        { status: 409 }
      );
    }

    await prisma.brand.delete({ where: { id } });

    // Remove from search index (fire-and-forget)
    removeBrand(id).catch(() => {});

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "DELETE",
        entityType: "brand",
        entityId: id,
        beforeState: JSON.stringify(existing),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete brand error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete brand" }, { status: 500 });
  }
}
