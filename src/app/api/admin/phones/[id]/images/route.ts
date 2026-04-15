import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
  "image/svg+xml",
  "image/heic",
  "image/heif",
];

const ALLOWED_EXTENSIONS = [
  ".jpg", ".jpeg", ".png", ".webp", ".avif", ".gif", ".svg", ".heic", ".heif",
];

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const phone = await prisma.phone.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        mainImage: true,
        images: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });

    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: phone });
  } catch (error) {
    console.error("Get phone images error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch images" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const phone = await prisma.phone.findUnique({
      where: { id: params.id },
      select: { id: true, name: true, slug: true },
    });

    if (!phone) {
      return NextResponse.json({ success: false, error: "Phone not found" }, { status: 404 });
    }

    const formData = await request.formData();
    const file = formData.get("image") as File | null;
    const isMain = formData.get("isMain") === "true";
    const altText = (formData.get("altText") as string) || phone.name;

    if (!file) {
      return NextResponse.json({ success: false, error: "No image file provided" }, { status: 400 });
    }

    // Validate file type
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return NextResponse.json({
        success: false,
        error: `Unsupported file format. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`,
      }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type) && file.type !== "application/octet-stream") {
      return NextResponse.json({
        success: false,
        error: `Unsupported MIME type: ${file.type}`,
      }, { status: 400 });
    }

    // Max file size: 10MB
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({
        success: false,
        error: "File size exceeds 10MB limit",
      }, { status: 400 });
    }

    // Create upload directory
    const uploadDir = path.join(process.cwd(), "public", "uploads", "phones", phone.slug);
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}${ext}`;
    const filepath = path.join(uploadDir, filename);
    const publicUrl = `/uploads/phones/${phone.slug}/${filename}`;

    // Write file
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filepath, buffer);

    if (isMain) {
      // Set as main image
      await prisma.phone.update({
        where: { id: params.id },
        data: { mainImage: publicUrl },
      });
    }

    // Create PhoneImage record
    const imageCount = await prisma.phoneImage.count({ where: { phoneId: params.id } });
    const phoneImage = await prisma.phoneImage.create({
      data: {
        phoneId: params.id,
        url: publicUrl,
        altText,
        sortOrder: imageCount,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        image: phoneImage,
        url: publicUrl,
        isMain,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Upload phone image error:", error);
    return NextResponse.json({ success: false, error: "Failed to upload image" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get("imageId");

    if (!imageId) {
      return NextResponse.json({ success: false, error: "imageId is required" }, { status: 400 });
    }

    const image = await prisma.phoneImage.findUnique({
      where: { id: imageId },
    });

    if (!image || image.phoneId !== params.id) {
      return NextResponse.json({ success: false, error: "Image not found" }, { status: 404 });
    }

    // If this was the main image, clear it
    const phone = await prisma.phone.findUnique({
      where: { id: params.id },
      select: { mainImage: true },
    });

    if (phone?.mainImage === image.url) {
      await prisma.phone.update({
        where: { id: params.id },
        data: { mainImage: null },
      });
    }

    await prisma.phoneImage.delete({ where: { id: imageId } });

    return NextResponse.json({ success: true, message: "Image deleted" });
  } catch (error) {
    console.error("Delete phone image error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete image" }, { status: 500 });
  }
}
