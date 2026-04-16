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

    const tags = await prisma.tag.findMany({
      orderBy: { name: "asc" },
      include: {
        _count: { select: { articles: true } },
      },
    });

    const data = tags.map((t) => ({
      ...t,
      articleCount: t._count.articles,
      _count: undefined,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Admin tags error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch tags" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug } = body;

    if (!name || !slug) {
      return NextResponse.json({ success: false, error: "Name and slug are required" }, { status: 400 });
    }

    const existing = await prisma.tag.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ success: false, error: "A tag with this slug already exists" }, { status: 409 });
    }

    const tag = await prisma.tag.create({ data: { name, slug } });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "CREATE",
        entityType: "tag",
        entityId: tag.id,
        afterState: JSON.stringify(tag),
      },
    });

    return NextResponse.json({ success: true, data: tag }, { status: 201 });
  } catch (error) {
    console.error("Create tag error:", error);
    return NextResponse.json({ success: false, error: "Failed to create tag" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, slug } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Tag ID is required" }, { status: 400 });
    }

    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Tag not found" }, { status: 404 });
    }

    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.tag.findUnique({ where: { slug } });
      if (slugExists) {
        return NextResponse.json({ success: false, error: "A tag with this slug already exists" }, { status: 409 });
      }
    }

    const tag = await prisma.tag.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        slug: slug ?? existing.slug,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "UPDATE",
        entityType: "tag",
        entityId: tag.id,
        beforeState: JSON.stringify(existing),
        afterState: JSON.stringify(tag),
      },
    });

    return NextResponse.json({ success: true, data: tag });
  } catch (error) {
    console.error("Update tag error:", error);
    return NextResponse.json({ success: false, error: "Failed to update tag" }, { status: 500 });
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
      return NextResponse.json({ success: false, error: "Tag ID is required" }, { status: 400 });
    }

    const existing = await prisma.tag.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Tag not found" }, { status: 404 });
    }

    // Remove tag associations first
    await prisma.articleTag.deleteMany({ where: { tagId: id } });
    await prisma.tag.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "DELETE",
        entityType: "tag",
        entityId: id,
        beforeState: JSON.stringify(existing),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete tag error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete tag" }, { status: 500 });
  }
}
