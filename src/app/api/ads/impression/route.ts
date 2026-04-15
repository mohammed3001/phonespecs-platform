import { NextRequest, NextResponse } from "next/server";
import { recordImpression } from "@/lib/ad-engine";

// POST — record an ad impression
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, creativeId, slotId } = body;

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

    await recordImpression({
      campaignId,
      creativeId,
      slotId: slotId || undefined,
      userFingerprint: body.fingerprint || undefined,
      ipAddress: ipAddress || undefined,
      country: body.country || undefined,
      deviceType: body.deviceType || undefined,
      pageUrl: body.pageUrl || undefined,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Impression tracking error:", error);
    // Return 200 even on error to not break the client
    return NextResponse.json({ success: false });
  }
}
