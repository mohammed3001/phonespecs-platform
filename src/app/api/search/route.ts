import { NextRequest, NextResponse } from "next/server";
import { searchPhones, parseSearchRequest, SearchValidationError } from "@/lib/search";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {
    const searchRequest = parseSearchRequest(searchParams);
    const result = await searchPhones(searchRequest);
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof SearchValidationError) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 }
      );
    }

    console.error("Search route error:", error);
    return NextResponse.json(
      { success: false, error: "Search service unavailable" },
      { status: 503 }
    );
  }
}
