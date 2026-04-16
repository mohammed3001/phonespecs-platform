import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { registerSchema } from "@/lib/validations/schemas";
import { ZodError } from "zod";
import { createAuditLog } from "@/lib/audit";
import { checkRateLimit, getClientIdentifier } from "@/lib/rate-limit";

export async function POST(request: NextRequest) {
  try {
    // Rate limit: 5 registration attempts per minute per IP
    const clientId = getClientIdentifier(request);
    const rateLimit = checkRateLimit(`register:${clientId}`, { maxRequests: 5, windowSeconds: 60 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { success: false, error: "Too many registration attempts. Please try again later." },
        { status: 429, headers: { "Retry-After": String(Math.ceil((rateLimit.resetAt - Date.now()) / 1000)) } }
      );
    }

    const body = await request.json();
    const validated = registerSchema.parse(body);

    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: validated.email.toLowerCase() },
    });
    if (existing) {
      return NextResponse.json(
        { success: false, error: "An account with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await bcrypt.hash(validated.password, 12);

    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString("hex");
    const emailVerificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Get default "user" role
    let userRole = await prisma.role.findUnique({ where: { slug: "user" } });
    if (!userRole) {
      userRole = await prisma.role.create({
        data: { name: "User", slug: "user", description: "Regular user", isSystem: true },
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validated.email.toLowerCase(),
        name: validated.name,
        passwordHash,
        userType: "user",
        roleId: userRole.id,
        emailVerificationToken,
        emailVerificationExpiry,
        emailVerified: false,
        isActive: true,
      },
    });

    // Audit log
    await createAuditLog({
      userId: user.id,
      action: "user_registered",
      entityType: "user",
      entityId: user.id,
      afterState: { email: user.email, name: user.name },
      ipAddress: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip"),
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully. Please check your email to verify your account.",
        data: {
          id: user.id,
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified,
          // In production, don't return token — send via email
          verificationToken: emailVerificationToken,
        },
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
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create account" },
      { status: 500 }
    );
  }
}
