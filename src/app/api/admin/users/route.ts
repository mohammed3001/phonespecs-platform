import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      include: {
        role: { select: { id: true, name: true, slug: true } },
        company: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    console.error("Users error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, password, userType, roleId, companyId, isActive } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: "Name, email, and password are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ success: false, error: "A user with this email already exists" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        userType: userType || "user",
        roleId: roleId || null,
        companyId: companyId || null,
        isActive: isActive !== false,
      },
      include: {
        role: { select: { id: true, name: true, slug: true } },
        company: { select: { id: true, name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "CREATE",
        entityType: "user",
        entityId: user.id,
        afterState: JSON.stringify({ id: user.id, name: user.name, email: user.email, userType: user.userType }),
      },
    });

    return NextResponse.json({ success: true, data: user }, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ success: false, error: "Failed to create user" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, name, email, password, userType, roleId, companyId, isActive } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    if (email && email !== existing.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        return NextResponse.json({ success: false, error: "A user with this email already exists" }, { status: 409 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (userType !== undefined) updateData.userType = userType;
    if (roleId !== undefined) updateData.roleId = roleId || null;
    if (companyId !== undefined) updateData.companyId = companyId || null;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (password) updateData.passwordHash = await bcrypt.hash(password, 12);

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: { select: { id: true, name: true, slug: true } },
        company: { select: { id: true, name: true } },
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "UPDATE",
        entityType: "user",
        entityId: user.id,
        beforeState: JSON.stringify({ id: existing.id, name: existing.name, email: existing.email, userType: existing.userType }),
        afterState: JSON.stringify({ id: user.id, name: user.name, email: user.email, userType: user.userType }),
      },
    });

    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json({ success: false, error: "Failed to update user" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "User ID is required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
    }

    // Prevent deleting the last admin
    if (existing.userType === "admin") {
      const adminCount = await prisma.user.count({ where: { userType: "admin" } });
      if (adminCount <= 1) {
        return NextResponse.json({ success: false, error: "Cannot delete the last admin user" }, { status: 409 });
      }
    }

    await prisma.user.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: (session.user as { id?: string })?.id || null,
        action: "DELETE",
        entityType: "user",
        entityId: id,
        beforeState: JSON.stringify({ id: existing.id, name: existing.name, email: existing.email }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete user" }, { status: 500 });
  }
}
