import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const brand = await prisma.brand.findUnique({
      where: { slug: params.slug },
      include: {
        phones: {
          where: { isPublished: true },
          include: {
            specs: {
              include: {
                spec: {
                  include: { group: true },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { phones: { where: { isPublished: true } } },
        },
      },
    });

    if (!brand) {
      return NextResponse.json(
        { success: false, error: "Brand not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: brand });
  } catch (error) {
    console.error("Brand detail error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch brand" },
      { status: 500 }
    );
  }
}
