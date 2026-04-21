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

    const redirects = await prisma.redirect.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: redirects });
  } catch (error) {
    console.error("Redirects error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch redirects" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { sourcePath, targetPath, type, isActive } = body;

    if (!sourcePath || !targetPath) {
      return NextResponse.json({ success: false, error: "Source and target paths are required" }, { status: 400 });
    }

    const redirect = await prisma.redirect.create({
      data: {
        sourcePath,
        targetPath,
        type: type || 301,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "CREATE",
        entityType: "redirect",
        entityId: redirect.id,
        afterState: JSON.stringify({ sourcePath, targetPath, type: redirect.type }),
      },
    });

    return NextResponse.json({ success: true, data: redirect }, { status: 201 });
  } catch (error) {
    console.error("Create redirect error:", error);
    return NextResponse.json({ success: false, error: "Failed to create redirect" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, sourcePath, targetPath, type, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Redirect ID is required" }, { status: 400 });
    }

    const existing = await prisma.redirect.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Redirect not found" }, { status: 404 });
    }

    const redirect = await prisma.redirect.update({
      where: { id },
      data: {
        sourcePath: sourcePath ?? existing.sourcePath,
        targetPath: targetPath ?? existing.targetPath,
        type: type ?? existing.type,
        isActive: isActive !== undefined ? isActive : existing.isActive,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "UPDATE",
        entityType: "redirect",
        entityId: redirect.id,
        beforeState: JSON.stringify({ sourcePath: existing.sourcePath, targetPath: existing.targetPath }),
        afterState: JSON.stringify({ sourcePath: redirect.sourcePath, targetPath: redirect.targetPath }),
      },
    });

    return NextResponse.json({ success: true, data: redirect });
  } catch (error) {
    console.error("Update redirect error:", error);
    return NextResponse.json({ success: false, error: "Failed to update redirect" }, { status: 500 });
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
      return NextResponse.json({ success: false, error: "Redirect ID is required" }, { status: 400 });
    }

    const existing = await prisma.redirect.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Redirect not found" }, { status: 404 });
    }

    await prisma.redirect.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "DELETE",
        entityType: "redirect",
        entityId: id,
        beforeState: JSON.stringify({ sourcePath: existing.sourcePath }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete redirect error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete redirect" }, { status: 500 });
  }
}
