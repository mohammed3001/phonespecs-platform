import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const [
      totalPhones,
      totalArticles,
      totalReviews,
      totalUsers,
      phoneViews,
      recentAuditLogs,
      adImpressions,
      adClicks,
    ] = await Promise.all([
      prisma.phone.count(),
      prisma.article.count(),
      prisma.review.count(),
      prisma.user.count(),
      prisma.phone.aggregate({ _sum: { viewCount: true } }),
      prisma.auditLog.findMany({
        where: { createdAt: { gte: thirtyDaysAgo } },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: { user: { select: { name: true } } },
      }),
      prisma.adImpression.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.adClick.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    ]);

    // Top viewed phones
    const topPhones = await prisma.phone.findMany({
      select: { id: true, name: true, slug: true, viewCount: true },
      orderBy: { viewCount: "desc" },
      take: 10,
    });

    // Activity by day (last 7 days)
    const dailyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(now);
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const count = await prisma.auditLog.count({
        where: { createdAt: { gte: dayStart, lt: dayEnd } },
      });

      dailyActivity.push({
        date: dayStart.toISOString().split("T")[0],
        actions: count,
      });
    }

    // Action type breakdown
    const actionBreakdown = recentAuditLogs.reduce((acc: Record<string, number>, log) => {
      acc[log.action] = (acc[log.action] || 0) + 1;
      return acc;
    }, {});

    // Entity type breakdown
    const entityBreakdown = recentAuditLogs.reduce((acc: Record<string, number>, log) => {
      acc[log.entityType] = (acc[log.entityType] || 0) + 1;
      return acc;
    }, {});

    // Recent searches from audit logs (if any search-related logs exist)
    const searchLogs = recentAuditLogs.filter((l) => l.entityType === "search" || l.action === "SEARCH");

    const totalPageViews = phoneViews._sum.viewCount || 0;
    const ctr = adImpressions > 0 ? ((adClicks / adImpressions) * 100).toFixed(2) : "0";

    return NextResponse.json({
      success: true,
      data: {
        overview: {
          totalPageViews,
          totalPhones,
          totalArticles,
          totalReviews,
          totalUsers,
          adImpressions,
          adClicks,
          ctr: parseFloat(ctr),
        },
        topPhones,
        dailyActivity,
        actionBreakdown,
        entityBreakdown,
        recentSearches: searchLogs.slice(0, 20),
      },
    });
  } catch (error) {
    console.error("Search analytics error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch analytics" }, { status: 500 });
  }
}
