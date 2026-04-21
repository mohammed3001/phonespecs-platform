import { NextRequest, NextResponse } from "next/server";
import { computeSpecIQ } from "@/lib/spec-iq";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneId = searchParams.get("phoneId");

    if (!phoneId) {
      return NextResponse.json(
        { success: false, error: "phoneId is required" },
        { status: 400 }
      );
    }

    const specIQ = await computeSpecIQ(phoneId);

    if (!specIQ) {
      return NextResponse.json(
        { success: false, error: "Phone not found or insufficient data" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: specIQ,
    });
  } catch (error) {
    console.error("Spec IQ error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to compute Spec IQ" },
      { status: 500 }
    );
  }
}
