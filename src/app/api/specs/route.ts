import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const groups = await prisma.specGroup.findMany({
      include: {
        definitions: {
          orderBy: { sortOrder: "asc" },
        },
      },
      orderBy: { sortOrder: "asc" },
    });

    return NextResponse.json({ success: true, data: groups });
  } catch (error) {
    console.error("Specs error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch specs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    if (body.type === "group") {
      const group = await prisma.specGroup.create({
        data: {
          name: body.name,
          slug: body.slug,
          icon: body.icon || null,
          sortOrder: body.sortOrder || 0,
        },
      });
      return NextResponse.json({ success: true, data: group }, { status: 201 });
    }

    if (body.type === "definition") {
      const definition = await prisma.specDefinition.create({
        data: {
          groupId: body.groupId,
          name: body.name,
          slug: body.slug,
          key: body.key,
          icon: body.icon || null,
          unit: body.unit || null,
          dataType: body.dataType || "text",
          showInCard: body.showInCard || false,
          showInDetail: body.showInDetail !== false,
          showInCompare: body.showInCompare !== false,
          isFilterable: body.isFilterable || false,
          isHighlighted: body.isHighlighted || false,
          sortOrder: body.sortOrder || 0,
        },
      });
      return NextResponse.json({ success: true, data: definition }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Create spec error:", error);
    return NextResponse.json({ success: false, error: "Failed to create spec" }, { status: 500 });
  }
}
