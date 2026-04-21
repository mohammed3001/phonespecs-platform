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

    const templates = await prisma.seoTemplate.findMany({
      orderBy: { contentType: "asc" },
    });

    return NextResponse.json({ success: true, data: templates });
  } catch (error) {
    console.error("SEO templates error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch SEO templates" }, { status: 500 });
  }
}
