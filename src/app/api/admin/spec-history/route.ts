import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const phoneId = searchParams.get("phoneId") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");

    const where: Record<string, unknown> = {};
    if (phoneId) {
      where.phoneSpec = { phoneId };
    }

    const [history, total] = await Promise.all([
      prisma.phoneSpecHistory.findMany({
        where,
        include: {
          phoneSpec: {
            include: {
              spec: { select: { name: true, key: true, unit: true } },
              phone: { select: { name: true, slug: true } },
            },
          },
          changedBy: { select: { name: true, email: true } },
        },
        orderBy: { changedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.phoneSpecHistory.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: history,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Spec history error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch spec history" }, { status: 500 });
  }
}
