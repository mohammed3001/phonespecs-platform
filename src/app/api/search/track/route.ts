import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

/** Track when a user clicks a search result */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, slug } = body;

    if (!query || !slug) {
      return NextResponse.json(
        { success: false, error: "query and slug required" },
        { status: 400 }
      );
    }

    await prisma.searchQuery.create({
      data: {
        query,
        normalizedQuery: query.toLowerCase().trim(),
        resultCount: 1,
        clickedSlug: slug,
        source: "click",
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Click tracking error:", error);
    return NextResponse.json({ success: true }); // Don't fail on tracking errors
  }
}
