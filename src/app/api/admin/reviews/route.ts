import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { moderateReviewSchema } from "@/lib/validations/schemas";
import { ZodError } from "zod";
import { createAuditLog } from "@/lib/audit";

// GET — fetch reviews for moderation (admin only)
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

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { name: true, email: true, avatar: true } },
          phone: { select: { name: true, slug: true, mainImage: true } },
          ratings: {
            include: { category: { select: { name: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    // Stats
    const stats = await prisma.review.groupBy({
      by: ["status"],
      _count: true,
    });

    return NextResponse.json({
      success: true,
      data: reviews,
      stats: Object.fromEntries(stats.map((s) => [s.status, s._count])),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error("Admin reviews error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch reviews" }, { status: 500 });
  }
}

// POST — moderate a review (approve/reject/spam)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validated = moderateReviewSchema.parse(body);

    const review = await prisma.review.findUnique({
      where: { id: validated.reviewId },
      include: { phone: { select: { id: true, name: true } } },
    });
    if (!review) {
      return NextResponse.json({ success: false, error: "Review not found" }, { status: 404 });
    }

    const beforeState = {
      status: review.status,
      moderationNote: review.moderationNote,
    };

    const newStatus = validated.action === "approve" ? "approved"
      : validated.action === "reject" ? "rejected"
      : "spam";

    const updated = await prisma.review.update({
      where: { id: validated.reviewId },
      data: {
        status: newStatus,
        moderationNote: validated.moderationNote || null,
        moderatedAt: new Date(),
      },
    });

    // If approved, update phone review count and score
    if (newStatus === "approved" && review.overallScore) {
      const approvedReviews = await prisma.review.findMany({
        where: { phoneId: review.phoneId, status: "approved" },
        select: { overallScore: true },
      });
      const avgScore = approvedReviews.reduce((acc, r) => acc + (r.overallScore || 0), 0) / approvedReviews.length;
      await prisma.phone.update({
        where: { id: review.phoneId },
        data: { reviewScore: Math.round(avgScore * 10) / 10, reviewCount: approvedReviews.length },
      });
    }

    // Resolve any pending moderation reports for this review
    if (newStatus === "rejected" || newStatus === "spam") {
      await prisma.moderationReport.updateMany({
        where: { reviewId: validated.reviewId, status: "pending" },
        data: { status: "resolved", resolvedAt: new Date() },
      });
    }

    const userId = (session.user as unknown as { id: string }).id;
    await createAuditLog({
      userId,
      action: `review_${newStatus}`,
      entityType: "review",
      entityId: validated.reviewId,
      changes: `Review on ${review.phone.name} ${newStatus}`,
      beforeState,
      afterState: { status: newStatus, moderationNote: validated.moderationNote },
    });

    return NextResponse.json({
      success: true,
      message: `Review ${newStatus} successfully`,
      data: { id: updated.id, status: updated.status },
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ success: false, error: "Validation failed", details: error.issues }, { status: 400 });
    }
    console.error("Moderation error:", error);
    return NextResponse.json({ success: false, error: "Failed to moderate review" }, { status: 500 });
  }
}
