import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const slots = await prisma.adSlot.findMany({
      orderBy: [{ pageType: "asc" }, { sortOrder: "asc" }],
    });

    return NextResponse.json({ success: true, data: slots });
  } catch (error) {
    console.error("Ad slots error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch ad slots" }, { status: 500 });
  }
}
