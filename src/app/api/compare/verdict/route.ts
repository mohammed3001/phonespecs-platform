import { NextRequest, NextResponse } from "next/server";
import { computeComparisonVerdict } from "@/lib/decision-engine";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phone1Id = searchParams.get("phone1");
    const phone2Id = searchParams.get("phone2");

    if (!phone1Id || !phone2Id) {
      return NextResponse.json(
        { success: false, error: "phone1 and phone2 are required (UUID or slug)" },
        { status: 400 }
      );
    }

    const verdict = await computeComparisonVerdict(phone1Id, phone2Id);

    if (!verdict) {
      return NextResponse.json(
        { success: false, error: "One or both phones not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: verdict,
    });
  } catch (error) {
    console.error("Comparison verdict error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to compute comparison verdict" },
      { status: 500 }
    );
  }
}
