import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET — fetch company portal dashboard data
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session.user as unknown as { id: string }).id;

    // Get user's company
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { companyId: true, company: { select: { id: true, name: true, slug: true, logo: true, isVerified: true } } },
    });

    if (!user?.companyId || !user.company) {
      return NextResponse.json({ success: false, error: "No company associated with this account" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section") || "overview";

    const company = user.company;

    if (section === "overview") {
      // Get company's advertisers and campaigns
      const advertisers = await prisma.advertiser.findMany({
        where: { companyId: company.id },
        select: { id: true },
      });

      const advertiserIds = advertisers.map((a) => a.id);

      const [campaigns, totalImpressions, totalClicks, totalSpent] = await Promise.all([
        prisma.campaign.findMany({
          where: { advertiserId: { in: advertiserIds } },
          include: {
            _count: { select: { impressions: true, clicks: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
        prisma.adImpression.count({
          where: { campaign: { advertiserId: { in: advertiserIds } } },
        }),
        prisma.adClick.count({
          where: { campaign: { advertiserId: { in: advertiserIds } } },
        }),
        prisma.campaign.aggregate({
          where: { advertiserId: { in: advertiserIds } },
          _sum: { spentTotal: true },
        }),
      ]);

      const activeCampaigns = campaigns.filter((c) => c.status === "active").length;

      return NextResponse.json({
        success: true,
        data: {
          company,
          stats: {
            totalCampaigns: campaigns.length,
            activeCampaigns,
            totalImpressions,
            totalClicks,
            totalSpent: totalSpent._sum.spentTotal || 0,
            ctr: totalImpressions > 0 ? parseFloat(((totalClicks / totalImpressions) * 100).toFixed(2)) : 0,
          },
          recentCampaigns: campaigns.map((c) => ({
            id: c.id,
            name: c.name,
            status: c.status,
            type: c.type,
            spentTotal: c.spentTotal,
            budgetTotal: c.budgetTotal,
            impressions: c._count.impressions,
            clicks: c._count.clicks,
          })),
        },
      });
    }

    if (section === "campaigns") {
      const advertisers = await prisma.advertiser.findMany({
        where: { companyId: company.id },
        select: { id: true, name: true },
      });
      const advertiserIds = advertisers.map((a) => a.id);

      const campaigns = await prisma.campaign.findMany({
        where: { advertiserId: { in: advertiserIds } },
        include: {
          advertiser: { select: { name: true } },
          _count: { select: { creatives: true, impressions: true, clicks: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      return NextResponse.json({ success: true, data: { company, campaigns, advertisers } });
    }

    if (section === "analytics") {
      const advertisers = await prisma.advertiser.findMany({
        where: { companyId: company.id },
        select: { id: true },
      });
      const advertiserIds = advertisers.map((a) => a.id);

      const days = parseInt(searchParams.get("days") || "30");
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      const startDateStr = startDate.toISOString().split("T")[0];

      const dailyStats = await prisma.adDailyStat.findMany({
        where: {
          campaign: { advertiserId: { in: advertiserIds } },
          date: { gte: startDateStr },
        },
        orderBy: { date: "asc" },
      });

      // Aggregate by date
      const byDate: Record<string, { impressions: number; clicks: number; spent: number }> = {};
      for (const stat of dailyStats) {
        if (!byDate[stat.date]) byDate[stat.date] = { impressions: 0, clicks: 0, spent: 0 };
        byDate[stat.date].impressions += stat.impressions;
        byDate[stat.date].clicks += stat.clicks;
        byDate[stat.date].spent += stat.spent;
      }

      return NextResponse.json({
        success: true,
        data: {
          company,
          dailyStats: Object.entries(byDate).map(([date, stats]) => ({ date, ...stats })),
        },
      });
    }

    return NextResponse.json({ success: false, error: "Invalid section" }, { status: 400 });
  } catch (error) {
    console.error("Company portal error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch portal data" }, { status: 500 });
  }
}
