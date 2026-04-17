import { NextRequest, NextResponse } from "next/server";
import { autocomplete } from "@/lib/search";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q") || "";

  try {
    const result = await autocomplete({ query: q });
    return NextResponse.json(result);
  } catch (error) {
    console.error("Autocomplete route error:", error);
    return NextResponse.json({ success: true, phones: [], brands: [] });
  }
}
