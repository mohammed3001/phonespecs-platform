import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCampaignSchema } from "@/lib/validations/schemas";
import { ZodError } from "zod";
import { createAuditLog } from "@/lib/audit";
import { getCampaignAnalytics } from "@/lib/ad-engine";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "";
    const advertiserId = searchParams.get("advertiserId") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (advertiserId) where.advertiserId = advertiserId;

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          advertiser: { select: { name: true, company: { select: { name: true } } } },
          _count: { select: { creatives: true, impressions: true, clicks: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ]);

    // Stats
    const stats = await prisma.campaign.groupBy({
      by: ["status"],
      _count: true,
      _sum: { spentTotal: true, budgetTotal: true },
    });

    return NextResponse.json({
      success: true,
      data: campaigns,
      stats: Object.fromEntries(
        stats.map((s) => [s.status, { count: s._count, spent: s._sum.spentTotal || 0, budget: s._sum.budgetTotal || 0 }])
      ),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Campaigns error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch campaigns" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Handle analytics request
    if (body.action === "analytics") {
      const analytics = await getCampaignAnalytics(body.campaignId, body.days || 30);
      return NextResponse.json({ success: true, data: analytics });
    }

    // Handle status update
    if (body.action === "updateStatus") {
      const campaign = await prisma.campaign.findUnique({ where: { id: body.campaignId } });
      if (!campaign) {
        return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
      }

      const beforeState = { status: campaign.status };
      const updated = await prisma.campaign.update({
        where: { id: body.campaignId },
        data: { status: body.status },
      });

      const userId = (session.user as unknown as { id: string }).id;
      await createAuditLog({
        userId,
        action: "campaign_status_changed",
        entityType: "campaign",
        entityId: body.campaignId,
        changes: `Campaign "${campaign.name}" status: ${campaign.status} → ${body.status}`,
        beforeState,
        afterState: { status: body.status },
      });

      return NextResponse.json({ success: true, data: updated });
    }

    // Create new campaign
    const validated = createCampaignSchema.parse(body);

    const campaign = await prisma.campaign.create({
      data: {
        advertiserId: validated.advertiserId,
        name: validated.name,
        type: validated.type,
        pricingModel: validated.pricingModel,
        status: validated.status,
        budgetTotal: validated.budgetTotal || null,
        budgetDaily: validated.budgetDaily || null,
        bidAmount: validated.bidAmount || null,
        startDate: validated.startDate || null,
        endDate: validated.endDate || null,
        priority: validated.priority,
        frequencyCap: validated.frequencyCap || null,
        targeting: validated.targeting || null,
      },
      include: {
        advertiser: { select: { name: true } },
      },
    });

    const userId = (session.user as unknown as { id: string }).id;
    await createAuditLog({
      userId,
      action: "campaign_created",
      entityType: "campaign",
      entityId: campaign.id,
      changes: `Created campaign: ${campaign.name}`,
      afterState: {
        name: campaign.name,
        type: campaign.type,
        pricingModel: campaign.pricingModel,
        budgetTotal: campaign.budgetTotal,
        bidAmount: campaign.bidAmount,
      },
    });

    return NextResponse.json({ success: true, data: campaign }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("Create campaign error:", error);
    return NextResponse.json({ success: false, error: "Failed to create campaign" }, { status: 500 });
  }
}
