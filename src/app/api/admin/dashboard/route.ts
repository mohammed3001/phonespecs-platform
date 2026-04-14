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

    const [
      phoneCount,
      brandCount,
      articleCount,
      userCount,
      reviewCount,
      campaignCount,
      recentPhones,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.phone.count(),
      prisma.brand.count(),
      prisma.article.count(),
      prisma.user.count(),
      prisma.review.count(),
      prisma.campaign.count(),
      prisma.phone.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { brand: { select: { name: true } } },
      }),
      prisma.auditLog.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          phones: phoneCount,
          brands: brandCount,
          articles: articleCount,
          users: userCount,
          reviews: reviewCount,
          campaigns: campaignCount,
        },
        recentPhones,
        recentAuditLogs,
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch dashboard" }, { status: 500 });
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

    await prisma.setting.upsert({
      where: { key },
      update: { value: JSON.stringify(value) },
      create: { key, value: JSON.stringify(value), group: group || "general" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json({ success: false, error: "Failed to update settings" }, { status: 500 });
  }
}
