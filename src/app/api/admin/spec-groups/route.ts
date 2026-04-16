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

    const groups = await prisma.specGroup.findMany({
      include: {
        definitions: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, data: groups });
  } catch (error) {
    console.error("Spec groups error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch spec groups" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, slug, icon, sortOrder, type } = body;

    // type: "group" or "spec"
    if (type === "spec") {
      // Create a spec definition within a group
      const { groupId, key, unit, dataType, showInCard, showInDetail, showInCompare, isFilterable, isHighlighted, subSection } = body;
      if (!name || !groupId) {
        return NextResponse.json({ success: false, error: "Name and groupId are required" }, { status: 400 });
      }

      const specSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      const specKey = key || specSlug.replace(/-/g, "_");

      const existing = await prisma.specDefinition.findFirst({
        where: { OR: [{ slug: specSlug }, { key: specKey }] },
      });
      if (existing) {
        return NextResponse.json({ success: false, error: "A spec with this slug or key already exists" }, { status: 409 });
      }

      const spec = await prisma.specDefinition.create({
        data: {
          name,
          slug: specSlug,
          key: specKey,
          groupId,
          icon: icon || null,
          unit: unit || null,
          dataType: dataType || "text",
          showInCard: showInCard ?? false,
          showInDetail: showInDetail ?? true,
          showInCompare: showInCompare ?? true,
          isFilterable: isFilterable ?? false,
          isHighlighted: isHighlighted ?? false,
          subSection: subSection || null,
          sortOrder: sortOrder ?? 0,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: (session.user as { id?: string })?.id || null,
          action: "CREATE",
          entityType: "specDefinition",
          entityId: spec.id,
          afterState: JSON.stringify({ name: spec.name, groupId: spec.groupId }),
        },
      });

      return NextResponse.json({ success: true, data: spec }, { status: 201 });
    }

    // Create a spec group
    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    const groupSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const existingGroup = await prisma.specGroup.findUnique({ where: { slug: groupSlug } });
    if (existingGroup) {
      return NextResponse.json({ success: false, error: "A group with this slug already exists" }, { status: 409 });
    }

    const group = await prisma.specGroup.create({
      data: {
        name,
        slug: groupSlug,
        icon: icon || null,
        sortOrder: sortOrder ?? 0,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "CREATE",
        entityType: "specGroup",
        entityId: group.id,
        afterState: JSON.stringify({ name: group.name }),
      },
    });

    return NextResponse.json({ success: true, data: group }, { status: 201 });
  } catch (error) {
    console.error("Create spec error:", error);
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
    const { id, type, name, slug, icon, sortOrder } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    if (type === "spec") {
      const { key, unit, dataType, showInCard, showInDetail, showInCompare, isFilterable, isHighlighted, subSection, groupId } = body;
      const existing = await prisma.specDefinition.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ success: false, error: "Spec not found" }, { status: 404 });
      }

      const spec = await prisma.specDefinition.update({
        where: { id },
        data: {
          name: name ?? existing.name,
          slug: slug ?? existing.slug,
          key: key ?? existing.key,
          groupId: groupId ?? existing.groupId,
          icon: icon !== undefined ? icon : existing.icon,
          unit: unit !== undefined ? unit : existing.unit,
          dataType: dataType ?? existing.dataType,
          showInCard: showInCard ?? existing.showInCard,
          showInDetail: showInDetail ?? existing.showInDetail,
          showInCompare: showInCompare ?? existing.showInCompare,
          isFilterable: isFilterable ?? existing.isFilterable,
          isHighlighted: isHighlighted ?? existing.isHighlighted,
          subSection: subSection !== undefined ? subSection : existing.subSection,
          sortOrder: sortOrder ?? existing.sortOrder,
        },
      });

      await prisma.auditLog.create({
        data: {
          userId: (session.user as { id?: string })?.id || null,
          action: "UPDATE",
          entityType: "specDefinition",
          entityId: spec.id,
          beforeState: JSON.stringify({ name: existing.name }),
          afterState: JSON.stringify({ name: spec.name }),
        },
      });

      return NextResponse.json({ success: true, data: spec });
    }

    // Update group
    const existing = await prisma.specGroup.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Group not found" }, { status: 404 });
    }

    const group = await prisma.specGroup.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        slug: slug ?? existing.slug,
        icon: icon !== undefined ? icon : existing.icon,
        sortOrder: sortOrder ?? existing.sortOrder,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "UPDATE",
        entityType: "specGroup",
        entityId: group.id,
        beforeState: JSON.stringify({ name: existing.name }),
        afterState: JSON.stringify({ name: group.name }),
      },
    });

    return NextResponse.json({ success: true, data: group });
  } catch (error) {
    console.error("Update spec error:", error);
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
    const type = searchParams.get("type") || "group";

    if (!id) {
      return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });
    }

    if (type === "spec") {
      const existing = await prisma.specDefinition.findUnique({ where: { id } });
      if (!existing) {
        return NextResponse.json({ success: false, error: "Spec not found" }, { status: 404 });
      }

      // Delete phone spec values for this spec definition
      await prisma.phoneSpec.deleteMany({ where: { specId: id } });
      await prisma.specDefinition.delete({ where: { id } });

      await prisma.auditLog.create({
        data: {
          userId: (session.user as { id?: string })?.id || null,
          action: "DELETE",
          entityType: "specDefinition",
          entityId: id,
          beforeState: JSON.stringify({ name: existing.name }),
        },
      });

      return NextResponse.json({ success: true });
    }

    // Delete group
    const existing = await prisma.specGroup.findUnique({
      where: { id },
      include: { definitions: true },
    });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Group not found" }, { status: 404 });
    }

    if (existing.definitions.length > 0) {
      return NextResponse.json({ success: false, error: `Cannot delete group with ${existing.definitions.length} specs. Remove specs first.` }, { status: 400 });
    }

    await prisma.specGroup.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "DELETE",
        entityType: "specGroup",
        entityId: id,
        beforeState: JSON.stringify({ name: existing.name }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete spec error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete" }, { status: 500 });
  }
}
