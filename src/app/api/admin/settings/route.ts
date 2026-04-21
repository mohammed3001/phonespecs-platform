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

    const settings = await prisma.setting.findMany({
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });

    // Group settings by group name
    const grouped: Record<string, Array<{ id: string; key: string; value: string; group: string }>> = {};
    for (const s of settings) {
      if (!grouped[s.group]) grouped[s.group] = [];
      grouped[s.group].push({
        id: s.id,
        key: s.key,
        value: s.value,
        group: s.group,
      });
    }

    return NextResponse.json({ success: true, data: settings, grouped });
  } catch (error) {
    console.error("Settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { key, value, group } = body;

    if (!key) {
      return NextResponse.json({ success: false, error: "Setting key is required" }, { status: 400 });
    }

    const setting = await prisma.setting.upsert({
      where: { key },
      update: { value: typeof value === "string" ? value : JSON.stringify(value) },
      create: { key, value: typeof value === "string" ? value : JSON.stringify(value), group: group || "general" },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "UPDATE",
        entityType: "setting",
        entityId: setting.id,
        afterState: JSON.stringify({ key: setting.key, value: setting.value }),
      },
    });

    return NextResponse.json({ success: true, data: setting });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update setting" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { settings } = body;

    if (!settings || !Array.isArray(settings)) {
      return NextResponse.json({ success: false, error: "Settings array is required" }, { status: 400 });
    }

    for (const s of settings) {
      await prisma.setting.upsert({
        where: { key: s.key },
        update: { value: typeof s.value === "string" ? s.value : JSON.stringify(s.value) },
        create: { key: s.key, value: typeof s.value === "string" ? s.value : JSON.stringify(s.value), group: s.group || "general" },
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "UPDATE",
        entityType: "settings",
        entityId: "bulk",
        afterState: JSON.stringify({ count: settings.length }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Bulk settings error:", error);
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json({ success: false, error: "Setting key is required" }, { status: 400 });
    }

    const existing = await prisma.setting.findUnique({ where: { key } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Setting not found" }, { status: 404 });
    }

    await prisma.setting.delete({ where: { key } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete setting error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete setting" }, { status: 500 });
  }
}
