import { NextRequest, NextResponse } from "next/server";
import { recordClick } from "@/lib/ad-engine";

// POST — record an ad click and redirect
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, creativeId, slotId, clickUrl } = body;

    if (!campaignId || !creativeId) {
      return NextResponse.json(
        { success: false, error: "campaignId and creativeId are required" },
        { status: 400 }
      );
    }

    const ipAddress =
      request.headers.get("x-forwarded-for") ||
      request.headers.get("x-real-ip") ||
      undefined;

    await recordClick({
      campaignId,
      creativeId,
      slotId: slotId || undefined,
      clickUrl: clickUrl || undefined,
      userFingerprint: body.fingerprint || undefined,
      ipAddress: ipAddress || undefined,
      country: body.country || undefined,
      deviceType: body.deviceType || undefined,
      pageUrl: body.pageUrl || undefined,
    });

    return NextResponse.json({ success: true, redirectUrl: clickUrl });
  } catch (error) {
    console.error("Click tracking error:", error);
    return NextResponse.json({ success: false });
  }
}
