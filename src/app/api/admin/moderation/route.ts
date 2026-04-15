import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createAuditLog } from "@/lib/audit";

// GET — fetch moderation reports
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status") || "pending";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const where: Record<string, unknown> = {};
    if (status !== "all") where.status = status;

    const [reports, total] = await Promise.all([
      prisma.moderationReport.findMany({
        where,
        include: {
          reporter: { select: { name: true, email: true } },
          review: {
            select: { title: true, content: true, overallScore: true, user: { select: { name: true } } },
          },
          moderatedBy: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.moderationReport.count({ where }),
    ]);

    const stats = await prisma.moderationReport.groupBy({
      by: ["status"],
      _count: true,
    });

    return NextResponse.json({
      success: true,
      data: reports,
      stats: Object.fromEntries(stats.map((s) => [s.status, s._count])),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Moderation reports error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch reports" }, { status: 500 });
  }
}

// POST — resolve a moderation report
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { reportId, action, note } = body;

    if (!reportId || !action) {
      return NextResponse.json({ success: false, error: "reportId and action are required" }, { status: 400 });
    }

    const report = await prisma.moderationReport.findUnique({ where: { id: reportId } });
    if (!report) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 });
    }

    const userId = (session.user as unknown as { id: string }).id;
    const newStatus = action === "dismiss" ? "dismissed" : "resolved";

    await prisma.moderationReport.update({
      where: { id: reportId },
      data: {
        status: newStatus,
        moderatedById: userId,
        moderationNote: note || null,
        resolvedAt: new Date(),
      },
    });

    // If resolved (not dismissed), take action on the reported content
    if (action === "remove" && report.entityType === "review") {
      await prisma.review.update({
        where: { id: report.entityId },
        data: { status: "rejected", moderationNote: `Removed after report: ${note || "Policy violation"}` },
      });
    }

    await createAuditLog({
      userId,
      action: `report_${newStatus}`,
      entityType: "moderation_report",
      entityId: reportId,
      changes: `Report ${newStatus}: ${note || "No note"}`,
    });

    return NextResponse.json({
      success: true,
      message: `Report ${newStatus} successfully`,
    });
  } catch (error) {
    console.error("Moderation action error:", error);
    return NextResponse.json({ success: false, error: "Failed to process report" }, { status: 500 });
  }
}
