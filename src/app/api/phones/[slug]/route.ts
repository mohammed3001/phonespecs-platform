import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const phone = await prisma.phone.findUnique({
      where: { slug: params.slug },
      include: {
        brand: { select: { id: true, name: true, slug: true, logo: true, description: true } },
        images: { orderBy: { sortOrder: "asc" } },
        variants: { orderBy: { sortOrder: "asc" } },
        specs: {
          include: {
            spec: {
              include: {
                group: { select: { id: true, name: true, slug: true, icon: true, sortOrder: true } },
              },
            },
          },
          orderBy: { spec: { sortOrder: "asc" } },
        },
        faqs: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" },
        },
        reviews: {
          where: { isApproved: true },
          include: {
            user: { select: { id: true, name: true, avatar: true } },
            ratings: { include: { category: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        discussions: {
          include: {
            user: { select: { id: true, name: true, avatar: true } },
            _count: { select: { replies: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone not found" },
        { status: 404 }
      );
    }

    // Increment view count
    await prisma.phone.update({
      where: { id: phone.id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ success: true, data: phone });
  } catch (error) {
    console.error("Error fetching phone:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch phone" },
      { status: 500 }
    );
  }
}
