import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

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
      select: { id: true, name: true, pros: true, cons: true },
    });

    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        pros: (phone.pros as string[] | null) || [],
        cons: (phone.cons as string[] | null) || [],
      },
    });
  } catch (error) {
    console.error("Get pros/cons error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch pros/cons" }, { status: 500 });
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
      select: { id: true, name: true, pros: true, cons: true },
    });

    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone not found" }, { status: 404 });
    }

    const body = await request.json();
    const pros: string[] = (body.pros || []).filter((p: string) => p.trim() !== "");
    const cons: string[] = (body.cons || []).filter((c: string) => c.trim() !== "");

    await prisma.phone.update({
      where: { id: params.id },
      data: {
        pros: pros.length > 0 ? pros : Prisma.JsonNull,
        cons: cons.length > 0 ? cons : Prisma.JsonNull,
      },
    });

    const userId = (session.user as unknown as { id: string }).id;
    await createAuditLog({
      userId,
      action: "phone_pros_cons_updated",
      entityType: "phone",
      entityId: params.id,
      changes: `Updated pros/cons for: ${phone.name}`,
      beforeState: { pros: phone.pros, cons: phone.cons },
      afterState: { pros, cons },
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
    });

    return NextResponse.json({ success: true, message: "Pros & Cons updated successfully" });
  } catch (error) {
    console.error("Update pros/cons error:", error);
    return NextResponse.json({ success: false, error: "Failed to update pros/cons" }, { status: 500 });
  }
}
