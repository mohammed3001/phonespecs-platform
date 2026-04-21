import { NextRequest, NextResponse } from "next/server";
import { serveAd } from "@/lib/ad-engine";

// GET — serve an ad for a given slot
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slotSlug = searchParams.get("slot");
    const pageType = searchParams.get("pageType");

    if (!slotSlug || !pageType) {
      return NextResponse.json(
        { success: false, error: "slot and pageType are required" },
        { status: 400 }
      );
    }

    const result = await serveAd({
      slotSlug,
      pageType,
      pageUrl: searchParams.get("pageUrl") || undefined,
      phoneId: searchParams.get("phoneId") || undefined,
      brandId: searchParams.get("brandId") || undefined,
      deviceType: searchParams.get("deviceType") || undefined,
      country: searchParams.get("country") || undefined,
      userFingerprint: searchParams.get("fp") || undefined,
    });

    // Set cache headers — ads should not be heavily cached
    const headers = new Headers();
    headers.set("Cache-Control", "no-store, max-age=0");

    return NextResponse.json({ success: true, data: result }, { headers });
  } catch (error) {
    console.error("Ad serve error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to serve ad" },
      { status: 500 }
    );
  }
}
