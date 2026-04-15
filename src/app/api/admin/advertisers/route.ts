import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

// GET — fetch advertisers
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const [advertisers, total] = await Promise.all([
      prisma.advertiser.findMany({
        include: {
          company: { select: { name: true, logo: true } },
          _count: { select: { campaigns: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.advertiser.count(),
    ]);

    return NextResponse.json({
      success: true,
      data: advertisers,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Advertisers error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch advertisers" }, { status: 500 });
  }
}

// POST — create a new advertiser
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, contactPerson, companyId, balance } = body;

    if (!name) {
      return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });
    }

    const advertiser = await prisma.advertiser.create({
      data: {
        name,
        email: email || null,
        contactPerson: contactPerson || null,
        companyId: companyId || null,
        balance: balance || 0,
      },
      include: {
        company: { select: { name: true } },
      },
    });

    const userId = (session.user as unknown as { id: string }).id;
    await createAuditLog({
      userId,
      action: "advertiser_created",
      entityType: "advertiser",
      entityId: advertiser.id,
      changes: `Created advertiser: ${advertiser.name}`,
      afterState: { name, email, companyId },
    });

    return NextResponse.json({ success: true, data: advertiser }, { status: 201 });
  } catch (error) {
    console.error("Create advertiser error:", error);
    return NextResponse.json({ success: false, error: "Failed to create advertiser" }, { status: 500 });
  }
}
