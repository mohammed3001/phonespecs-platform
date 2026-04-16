import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const companies = await prisma.company.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { users: true, advertisers: true, showrooms: true } },
      },
    });

    const data = companies.map((c) => ({
      ...c,
      userCount: c._count.users,
      advertiserCount: c._count.advertisers,
      showroomCount: c._count.showrooms,
      _count: undefined,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Admin companies error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch companies" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, logo, description, website, type, isVerified, isActive } = body;

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: "Name and slug are required" }, { status: 400 });
    }

    const existing = await prisma.company.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ success: false, error: "A company with this slug already exists" }, { status: 409 });
    }

    const company = await prisma.company.create({
      data: {
        name,
        slug,
        logo: logo || null,
        description: description || null,
        website: website || null,
        type: type || "brand",
        isVerified: isVerified || false,
        isActive: isActive !== false,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "CREATE",
        entityType: "company",
        entityId: company.id,
        afterState: JSON.stringify(company),
      },
    });

    return NextResponse.json({ success: true, data: company }, { status: 201 });
  } catch (error) {
    console.error("Create company error:", error);
    return NextResponse.json({ success: false, error: "Failed to create company" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, slug, logo, description, website, type, isVerified, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Company ID is required" }, { status: 400 });
    }

    const existing = await prisma.company.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Company not found" }, { status: 404 });
    }

    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.company.findUnique({ where: { slug } });
      if (slugExists) {
        return NextResponse.json({ success: false, error: "A company with this slug already exists" }, { status: 409 });
      }
    }

    const company = await prisma.company.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        slug: slug ?? existing.slug,
        logo: logo !== undefined ? logo : existing.logo,
        description: description !== undefined ? description : existing.description,
        website: website !== undefined ? website : existing.website,
        type: type ?? existing.type,
        isVerified: isVerified !== undefined ? isVerified : existing.isVerified,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "UPDATE",
        entityType: "company",
        entityId: company.id,
        beforeState: JSON.stringify(existing),
        afterState: JSON.stringify(company),
      },
    });

    return NextResponse.json({ success: true, data: company });
  } catch (error) {
    console.error("Update company error:", error);
    return NextResponse.json({ success: false, error: "Failed to update company" }, { status: 500 });
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
      return NextResponse.json({ success: false, error: "Company ID is required" }, { status: 400 });
    }

    const existing = await prisma.company.findUnique({
      where: { id },
      include: { _count: { select: { users: true } } },
    });

    if (!existing) {
      return NextResponse.json({ success: false, error: "Company not found" }, { status: 404 });
    }

    if (existing._count.users > 0) {
      return NextResponse.json(
        { success: false, error: `Cannot delete company with ${existing._count.users} associated users` },
        { status: 409 }
      );
    }

    await prisma.company.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "DELETE",
        entityType: "company",
        entityId: id,
        beforeState: JSON.stringify(existing),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete company error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete company" }, { status: 500 });
  }
}
