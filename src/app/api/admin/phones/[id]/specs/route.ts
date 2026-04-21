import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";
import { indexPhone } from "@/lib/search";
import { generateAndSaveSocialMediaPost } from "@/lib/social-media-post";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const phone = await prisma.phone.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, slug: true },
    });

    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone not found" }, { status: 404 });
    }

    // Get all spec groups with definitions (ordered)
    const groups = await prisma.specGroup.findMany({
      include: {
        definitions: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    // Get existing phone specs
    const phoneSpecs = await prisma.phoneSpec.findMany({
      where: { phoneId: params.id },
      select: { specId: true, value: true, numericValue: true },
    });

    const specValues: Record<string, { value: string; numericValue: number | null }> = {};
    for (const ps of phoneSpecs) {
      specValues[ps.specId] = { value: ps.value, numericValue: ps.numericValue };
    }

    return NextResponse.json({
      success: true,
      data: {
        phone,
        groups,
        specValues,
      },
    });
  } catch (error) {
    console.error("Get phone specs error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch specs" }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const phone = await prisma.phone.findUnique({
      where: { id: params.id },
      select: { id: true, name: true },
    });

    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone not found" }, { status: 404 });
    }

    const body = await request.json();
    const specs: Array<{ specId: string; value: string; numericValue?: number | null }> = body.specs || [];

    // Get existing specs for audit
    const existingSpecs = await prisma.phoneSpec.findMany({
      where: { phoneId: params.id },
      include: { spec: { select: { key: true, name: true } } },
    });

    const beforeState: Record<string, string> = {};
    for (const es of existingSpecs) {
      beforeState[es.spec.key] = es.value;
    }

    // Delete all existing specs and recreate
    await prisma.phoneSpec.deleteMany({ where: { phoneId: params.id } });

    // Create new specs
    if (specs.length > 0) {
      await prisma.phoneSpec.createMany({
        data: specs
          .filter((s) => s.value.trim() !== "")
          .map((s) => ({
            phoneId: params.id,
            specId: s.specId,
            value: s.value,
            numericValue: s.numericValue ?? null,
          })),
      });
    }

    // Build after state
    const afterState: Record<string, string> = {};
    for (const s of specs) {
      if (s.value.trim()) {
        // Look up spec key from definitions
        const def = await prisma.specDefinition.findUnique({
          where: { id: s.specId },
          select: { key: true },
        });
        if (def) afterState[def.key] = s.value;
      }
    }

    // Audit log
    const userId = (session.user as unknown as { id: string }).id;
    await createAuditLog({
      userId,
      action: "phone_specs_updated",
      entityType: "phone",
      entityId: params.id,
      changes: `Updated specifications for: ${phone.name}`,
      beforeState,
      afterState,
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
    });

    // Specs changed — reindex phone in search (fire-and-forget)
    indexPhone(params.id).catch(() => {});
    // Specs changed — regenerate social media post
    generateAndSaveSocialMediaPost(params.id).catch(() => {});

    return NextResponse.json({ success: true, message: "Specifications updated successfully" });
  } catch (error) {
    console.error("Update phone specs error:", error);
    return NextResponse.json({ success: false, error: "Failed to update specs" }, { status: 500 });
  }
}
