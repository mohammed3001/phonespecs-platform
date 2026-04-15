import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createReportSchema } from "@/lib/validations/schemas";
import { ZodError } from "zod";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { success: false, error: "You must be logged in to report content" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validated = createReportSchema.parse(body);
    const userId = (session.user as unknown as { id: string }).id;

    // Check if user already reported this entity
    const existingReport = await prisma.moderationReport.findFirst({
      where: {
        entityType: validated.entityType,
        entityId: validated.entityId,
        reporterId: userId,
      },
    });
    if (existingReport) {
      return NextResponse.json(
        { success: false, error: "You have already reported this content" },
        { status: 409 }
      );
    }

    const report = await prisma.moderationReport.create({
      data: {
        entityType: validated.entityType,
        entityId: validated.entityId,
        reviewId: validated.entityType === "review" ? validated.entityId : null,
        reporterId: userId,
        reason: validated.reason,
        description: validated.description || null,
        status: "pending",
      },
    });

    // Increment report count on review if applicable
    if (validated.entityType === "review") {
      await prisma.review.update({
        where: { id: validated.entityId },
        data: { reportCount: { increment: 1 } },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for reporting. Our team will review this content.",
        data: { id: report.id },
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
    console.error("Report error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to submit report" },
      { status: 500 }
    );
  }
}
