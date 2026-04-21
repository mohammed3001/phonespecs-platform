import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const slots = await prisma.adSlot.findMany({
      include: {
        _count: { select: { impressions: true, clicks: true } },
      },
      orderBy: [{ pageType: "asc" }, { sortOrder: "asc" }],
    });

    return NextResponse.json({ success: true, data: slots });
  } catch (error) {
    console.error("Ad slots error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch ad slots" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Handle toggle active
    if (body.action === "toggleActive") {
      const slot = await prisma.adSlot.findUnique({ where: { id: body.slotId } });
      if (!slot) {
        return NextResponse.json({ success: false, error: "Slot not found" }, { status: 404 });
      }
      const updated = await prisma.adSlot.update({
        where: { id: body.slotId },
        data: { isActive: !slot.isActive },
      });
      return NextResponse.json({ success: true, data: updated });
    }

    // Create new slot
    const { name, slug, pageType, position, dimensions, fallbackHtml, sortOrder } = body;

    if (!name || !slug || !pageType || !position) {
      return NextResponse.json(
        { success: false, error: "name, slug, pageType, and position are required" },
        { status: 400 }
      );
    }

    const existing = await prisma.adSlot.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ success: false, error: "Slug already exists" }, { status: 409 });
    }

    const slot = await prisma.adSlot.create({
      data: {
        name,
        slug,
        pageType,
        position,
        dimensions: dimensions || null,
        fallbackHtml: fallbackHtml || null,
        sortOrder: sortOrder || 0,
      },
    });

    const userId = (session.user as unknown as { id: string }).id;
    await createAuditLog({
      userId,
      action: "ad_slot_created",
      entityType: "ad_slot",
      entityId: slot.id,
      changes: `Created ad slot: ${slot.name} (${slot.pageType}/${slot.position})`,
      afterState: { name, slug, pageType, position },
    });

    return NextResponse.json({ success: true, data: slot }, { status: 201 });
  } catch (error) {
    console.error("Create ad slot error:", error);
    return NextResponse.json({ success: false, error: "Failed to create ad slot" }, { status: 500 });
  }
}
