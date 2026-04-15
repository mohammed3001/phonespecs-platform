import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

// GET — fetch ad creatives for a campaign
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const campaignId = searchParams.get("campaignId");

    if (!campaignId) {
      return NextResponse.json({ success: false, error: "campaignId is required" }, { status: 400 });
    }

    const creatives = await prisma.adCreative.findMany({
      where: { campaignId },
      include: {
        phone: { select: { name: true, slug: true, mainImage: true } },
        _count: { select: { impressions: true, clicks: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: creatives });
  } catch (error) {
    console.error("Creatives error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch creatives" }, { status: 500 });
  }
}

// POST — create a new ad creative
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { campaignId, title, description, image, clickUrl, phoneId } = body;

    if (!campaignId) {
      return NextResponse.json({ success: false, error: "campaignId is required" }, { status: 400 });
    }

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) {
      return NextResponse.json({ success: false, error: "Campaign not found" }, { status: 404 });
    }

    const creative = await prisma.adCreative.create({
      data: {
        campaignId,
        title: title || null,
        description: description || null,
        image: image || null,
        clickUrl: clickUrl || null,
        phoneId: phoneId || null,
      },
      include: {
        phone: { select: { name: true, slug: true } },
      },
    });

    const userId = (session.user as unknown as { id: string }).id;
    await createAuditLog({
      userId,
      action: "creative_created",
      entityType: "ad_creative",
      entityId: creative.id,
      changes: `Created creative for campaign: ${campaign.name}`,
      afterState: { title, campaignId, phoneId },
    });

    return NextResponse.json({ success: true, data: creative }, { status: 201 });
  } catch (error) {
    console.error("Create creative error:", error);
    return NextResponse.json({ success: false, error: "Failed to create creative" }, { status: 500 });
  }
}
