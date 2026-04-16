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

    const pages = await prisma.page.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: pages });
  } catch (error) {
    console.error("Pages error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch pages" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, content, template, status, metaTitle, metaDescription } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    const pageSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const existing = await prisma.page.findUnique({ where: { slug: pageSlug } });
    if (existing) {
      return NextResponse.json({ success: false, error: "A page with this slug already exists" }, { status: 409 });
    }

    const page = await prisma.page.create({
      data: {
        title,
        slug: pageSlug,
        content: content || null,
        template: template || "default",
        status: status || "draft",
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "CREATE",
        entityType: "page",
        entityId: page.id,
        afterState: JSON.stringify({ title: page.title, slug: page.slug }),
      },
    });

    return NextResponse.json({ success: true, data: page }, { status: 201 });
  } catch (error) {
    console.error("Create page error:", error);
    return NextResponse.json({ success: false, error: "Failed to create page" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, slug, content, template, status, metaTitle, metaDescription } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Page ID is required" }, { status: 400 });
    }

    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 });
    }

    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.page.findUnique({ where: { slug } });
      if (slugExists) {
        return NextResponse.json({ success: false, error: "A page with this slug already exists" }, { status: 409 });
      }
    }

    const page = await prisma.page.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        slug: slug ?? existing.slug,
        content: content !== undefined ? content : existing.content,
        template: template ?? existing.template,
        status: status ?? existing.status,
        metaTitle: metaTitle !== undefined ? metaTitle : existing.metaTitle,
        metaDescription: metaDescription !== undefined ? metaDescription : existing.metaDescription,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "UPDATE",
        entityType: "page",
        entityId: page.id,
        beforeState: JSON.stringify({ title: existing.title }),
        afterState: JSON.stringify({ title: page.title }),
      },
    });

    return NextResponse.json({ success: true, data: page });
  } catch (error) {
    console.error("Update page error:", error);
    return NextResponse.json({ success: false, error: "Failed to update page" }, { status: 500 });
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
      return NextResponse.json({ success: false, error: "Page ID is required" }, { status: 400 });
    }

    const existing = await prisma.page.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Page not found" }, { status: 404 });
    }

    await prisma.page.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "DELETE",
        entityType: "page",
        entityId: id,
        beforeState: JSON.stringify({ title: existing.title }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete page error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete page" }, { status: 500 });
  }
}
