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

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      phoneCount,
      brandCount,
      articleCount,
      userCount,
      reviewCount,
      campaignCount,
      categoryCount,
      tagCount,
      companyCount,
      mediaCount,
      // Recent items
      recentPhones,
      recentAuditLogs,
      // Review stats
      pendingReviews,
      approvedReviews,
      rejectedReviews,
      // Article stats
      publishedArticles,
      draftArticles,
      // Ad stats
      totalImpressions,
      totalClicks,
      activeCampaigns,
      // Moderation
      pendingReports,
      // Content growth (last 30 days)
      newPhonesThisMonth,
      newUsersThisMonth,
      newReviewsThisMonth,
      newArticlesThisMonth,
      // Recent errors/warnings from audit log
      recentErrors,
      // Phone view stats
      totalPhoneViews,
      // Recent 7 days audit activity by day
      recentActivity,
    ] = await Promise.all([
      prisma.phone.count(),
      prisma.brand.count(),
      prisma.article.count(),
      prisma.user.count(),
      prisma.review.count(),
      prisma.campaign.count(),
      prisma.category.count(),
      prisma.tag.count(),
      prisma.company.count(),
      prisma.media.count(),
      // Recent phones
      prisma.phone.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { brand: { select: { name: true } } },
      }),
      // Recent audit logs
      prisma.auditLog.findMany({
        take: 15,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      // Review stats
      prisma.review.count({ where: { status: "pending" } }),
      prisma.review.count({ where: { status: "approved" } }),
      prisma.review.count({ where: { status: "rejected" } }),
      // Article stats
      prisma.article.count({ where: { status: "published" } }),
      prisma.article.count({ where: { status: "draft" } }),
      // Ad stats
      prisma.adImpression.count(),
      prisma.adClick.count(),
      prisma.campaign.count({ where: { status: "active" } }),
      // Moderation
      prisma.moderationReport.count({ where: { status: "pending" } }),
      // Growth (last 30 days)
      prisma.phone.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.review.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.article.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      // Recent errors (DELETE actions and failed items)
      prisma.auditLog.findMany({
        where: {
          OR: [
            { action: "DELETE" },
            { action: { contains: "ERROR" } },
            { action: { contains: "FAIL" } },
          ],
          createdAt: { gte: sevenDaysAgo },
        },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true } } },
      }),
      // Total phone views
      prisma.phone.aggregate({ _sum: { viewCount: true } }),
      // Activity per day (last 7 days)
      prisma.auditLog.groupBy({
        by: ["action"],
        where: { createdAt: { gte: sevenDaysAgo } },
        _count: true,
      }),
    ]);

    const ctr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(2) : "0.00";

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
          categories: categoryCount,
          tags: tagCount,
          companies: companyCount,
          media: mediaCount,
        },
        reviewStats: {
          pending: pendingReviews,
          approved: approvedReviews,
          rejected: rejectedReviews,
          total: reviewCount,
        },
        articleStats: {
          published: publishedArticles,
          draft: draftArticles,
          total: articleCount,
        },
        adStats: {
          impressions: totalImpressions,
          clicks: totalClicks,
          ctr,
          activeCampaigns,
        },
        moderationStats: {
          pendingReports,
        },
        growth: {
          phones: newPhonesThisMonth,
          users: newUsersThisMonth,
          reviews: newReviewsThisMonth,
          articles: newArticlesThisMonth,
        },
        totalPhoneViews: totalPhoneViews._sum.viewCount || 0,
        recentPhones,
        recentAuditLogs,
        recentErrors,
        activityBreakdown: recentActivity,
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
