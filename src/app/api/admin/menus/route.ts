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

    const menus = await prisma.menu.findMany({
      include: {
        items: {
          where: { parentId: null },
          orderBy: { sortOrder: "asc" },
          include: {
            children: { orderBy: { sortOrder: "asc" } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: menus });
  } catch (error) {
    console.error("Menus error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch menus" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { type } = body;

    if (type === "item") {
      const { menuId, title, url, target, icon, sortOrder, parentId } = body;
      if (!menuId || !title) {
        return NextResponse.json({ success: false, error: "Menu ID and title are required" }, { status: 400 });
      }

      const item = await prisma.menuItem.create({
        data: {
          menuId,
          title,
          url: url || null,
          target: target || "_self",
          icon: icon || null,
          sortOrder: sortOrder ?? 0,
          parentId: parentId || null,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: (session.user as { id?: string })?.id || null,
          action: "CREATE",
          entityType: "menuItem",
          entityId: item.id,
          afterState: JSON.stringify({ title: item.title, menuId }),
        },
      });

      return NextResponse.json({ success: true, data: item }, { status: 201 });
    }

    // Create menu
    const { name, slug, location } = body;
    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    const menuSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const existing = await prisma.menu.findUnique({ where: { slug: menuSlug } });
    if (existing) {
      return NextResponse.json({ success: false, error: "A menu with this slug already exists" }, { status: 409 });
    }

    const menu = await prisma.menu.create({
      data: { name, slug: menuSlug, location: location || null },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "CREATE",
        entityType: "menu",
        entityId: menu.id,
        afterState: JSON.stringify({ name: menu.name }),
      },
    });

    return NextResponse.json({ success: true, data: menu }, { status: 201 });
  } catch (error) {
    console.error("Create menu error:", error);
    return NextResponse.json({ success: false, error: "Failed to create" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, type } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    if (type === "item") {
      const { title, url, target, icon, sortOrder, parentId } = body;
      const item = await prisma.menuItem.update({
        where: { id },
        data: {
          title: title ?? undefined,
          url: url !== undefined ? url : undefined,
          target: target ?? undefined,
          icon: icon !== undefined ? icon : undefined,
          sortOrder: sortOrder ?? undefined,
          parentId: parentId !== undefined ? parentId || null : undefined,
        },
      });

      return NextResponse.json({ success: true, data: item });
    }

    // Update menu
    const { name, slug, location } = body;
    const menu = await prisma.menu.update({
      where: { id },
      data: {
        name: name ?? undefined,
        slug: slug ?? undefined,
        location: location !== undefined ? location : undefined,
      },
    });

    return NextResponse.json({ success: true, data: menu });
  } catch (error) {
    console.error("Update menu error:", error);
    return NextResponse.json({ success: false, error: "Failed to update" }, { status: 500 });
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
    const type = searchParams.get("type") || "menu";

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    if (type === "item") {
      // Delete children first
      await prisma.menuItem.deleteMany({ where: { parentId: id } });
      await prisma.menuItem.delete({ where: { id } });
    } else {
      // Delete all items first, then menu (cascade should handle this but be explicit)
      await prisma.menuItem.deleteMany({ where: { menuId: id } });
      await prisma.menu.delete({ where: { id } });
    }

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "DELETE",
        entityType: type === "item" ? "menuItem" : "menu",
        entityId: id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete menu error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}
