import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createReviewSchema } from "@/lib/validations/schemas";
import { ZodError } from "zod";
import { createAuditLog } from "@/lib/audit";
import { shouldAutoFlag, sanitizeContent, getSpamScore } from "@/lib/moderation";

// GET — fetch approved reviews for a phone
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const phoneId = searchParams.get("phoneId");
    const phoneSlug = searchParams.get("slug");

    if (!phoneId && !phoneSlug) {
      return NextResponse.json(
        { success: false, error: "phoneId or slug is required" },
        { status: 400 }
      );
    }

    const where: Record<string, unknown> = { status: "approved" };
    if (phoneId) {
      where.phoneId = phoneId;
    } else if (phoneSlug) {
      where.phone = { slug: phoneSlug };
    }

    const reviews = await prisma.review.findMany({
      where,
      include: {
        user: { select: { name: true, avatar: true } },
        ratings: {
          include: { category: { select: { name: true, slug: true, icon: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Aggregate stats
    const stats = {
      total: reviews.length,
      averageScore: reviews.length > 0
        ? reviews.reduce((acc, r) => acc + (r.overallScore || 0), 0) / reviews.length
        : 0,
    };

    return NextResponse.json({ success: true, data: reviews, stats });
  } catch (error) {
    console.error("Reviews fetch error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST — submit a new review (requires auth)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "You must be logged in to submit a review" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = createReviewSchema.parse(body);

    const userId = (session.user as unknown as { id: string }).id;

    // Check if user already reviewed this phone
    const existingReview = await prisma.review.findFirst({
      where: { phoneId: validated.phoneId, userId },
    });
    if (existingReview) {
      return NextResponse.json(
        { success: false, error: "You have already reviewed this phone" },
        { status: 409 }
      );
    }

    // Verify phone exists
    const phone = await prisma.phone.findUnique({ where: { id: validated.phoneId } });
    if (!phone) {
      return NextResponse.json(
        { success: false, error: "Phone not found" },
        { status: 404 }
      );
    }

    // Sanitize content
    const sanitizedContent = sanitizeContent(validated.content);
    const sanitizedTitle = sanitizeContent(validated.title, 200);

    // Spam check
    const fullText = `${sanitizedTitle} ${sanitizedContent} ${validated.pros || ""} ${validated.cons || ""}`;
    const autoFlag = shouldAutoFlag(fullText);
    const spamScore = getSpamScore(fullText);

    let status = "pending";
    let moderationNote: string | null = null;
    if (spamScore >= 0.8) {
      status = "spam";
      moderationNote = `Auto-flagged as spam (score: ${spamScore.toFixed(2)})`;
    } else if (autoFlag.flag) {
      moderationNote = `Auto-flagged: ${autoFlag.reason}`;
    }

    const review = await prisma.review.create({
      data: {
        phoneId: validated.phoneId,
        userId,
        title: sanitizedTitle,
        content: sanitizedContent,
        overallScore: validated.overallScore,
        pros: validated.pros ? sanitizeContent(validated.pros, 1000) : null,
        cons: validated.cons ? sanitizeContent(validated.cons, 1000) : null,
        status,
        moderationNote,
        type: "user",
      },
      include: {
        user: { select: { name: true } },
      },
    });

    // Create category ratings if provided
    if (validated.ratings && validated.ratings.length > 0) {
      await prisma.reviewRating.createMany({
        data: validated.ratings.map((r) => ({
          reviewId: review.id,
          categoryId: r.categoryId,
          score: r.score,
        })),
      });
    }

    await createAuditLog({
      userId,
      action: "review_submitted",
      entityType: "review",
      entityId: review.id,
      changes: `Phone: ${phone.name}, Score: ${validated.overallScore}/10, Status: ${status}`,
      afterState: { title: review.title, overallScore: review.overallScore, status },
    });

    return NextResponse.json(
      {
        success: true,
        message: status === "spam"
          ? "Your review has been flagged for review by our moderation team."
          : "Your review has been submitted and is pending approval.",
        data: { id: review.id, status },
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { success: false, error: "Validation failed", details: error.issues },
        { status: 400 }
      );
    }
    console.error("Review submission error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit review" },
      { status: 500 }
    );
  }
}
