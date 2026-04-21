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

    const articles = await prisma.article.findMany({
      include: {
        author: { select: { name: true } },
        category: { select: { id: true, name: true } },
        tags: { include: { tag: { select: { id: true, name: true, slug: true } } } },
      },
      orderBy: { createdAt: "desc" },
    });

    const data = articles.map((a) => ({
      ...a,
      tagList: a.tags.map((t) => t.tag),
      tags: undefined,
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error("Articles error:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch articles" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, slug, content, excerpt, status, categoryId, tagIds, featuredImage, metaTitle, metaDescription } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    const generatedSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const existing = await prisma.article.findUnique({ where: { slug: generatedSlug } });
    if (existing) {
      return NextResponse.json({ success: false, error: "An article with this slug already exists" }, { status: 409 });
    }

    const userId = (session.user as { id?: string })?.id;

    if (!userId) {
      return NextResponse.json({ success: false, error: "Unable to determine user ID" }, { status: 400 });
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug: generatedSlug,
        content: content || "",
        excerpt: excerpt || null,
        status: status || "draft",
        categoryId: categoryId || null,
        featuredImage: featuredImage || null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        authorId: userId,
        publishedAt: status === "published" ? new Date() : null,
      },
    });

    // Connect tags
    if (tagIds && tagIds.length > 0) {
      await prisma.articleTag.createMany({
        data: tagIds.map((tagId: string) => ({ articleId: article.id, tagId })),
        skipDuplicates: true,
      });
    }

    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action: "CREATE",
        entityType: "article",
        entityId: article.id,
        afterState: JSON.stringify({ id: article.id, title: article.title, status: article.status }),
      },
    });

    return NextResponse.json({ success: true, data: article }, { status: 201 });
  } catch (error) {
    console.error("Create article error:", error);
    return NextResponse.json({ success: false, error: "Failed to create article" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, slug, content, excerpt, status, categoryId, tagIds, featuredImage, metaTitle, metaDescription } = body;

    if (!id) {
      return NextResponse.json({ success: false, error: "Article ID is required" }, { status: 400 });
    }

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
    }

    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.article.findUnique({ where: { slug } });
      if (slugExists) {
        return NextResponse.json({ success: false, error: "An article with this slug already exists" }, { status: 409 });
      }
    }

    const wasPublished = existing.status === "published";
    const isNowPublished = (status || existing.status) === "published";

    const article = await prisma.article.update({
      where: { id },
      data: {
        title: title ?? existing.title,
        slug: slug ?? existing.slug,
        content: content !== undefined ? content : existing.content,
        excerpt: excerpt !== undefined ? excerpt : existing.excerpt,
        status: status ?? existing.status,
        categoryId: categoryId !== undefined ? categoryId || null : existing.categoryId,
        featuredImage: featuredImage !== undefined ? featuredImage : existing.featuredImage,
        metaTitle: metaTitle !== undefined ? metaTitle : existing.metaTitle,
        metaDescription: metaDescription !== undefined ? metaDescription : existing.metaDescription,
        publishedAt: !wasPublished && isNowPublished ? new Date() : existing.publishedAt,
      },
    });

    // Update tags if provided
    if (tagIds !== undefined) {
      await prisma.articleTag.deleteMany({ where: { articleId: id } });
      if (tagIds.length > 0) {
        await prisma.articleTag.createMany({
          data: tagIds.map((tagId: string) => ({ articleId: id, tagId })),
          skipDuplicates: true,
        });
      }
    }

    const userId = (session.user as { id?: string })?.id;
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action: "UPDATE",
        entityType: "article",
        entityId: article.id,
        beforeState: JSON.stringify({ title: existing.title, status: existing.status }),
        afterState: JSON.stringify({ title: article.title, status: article.status }),
      },
    });

    return NextResponse.json({ success: true, data: article });
  } catch (error) {
    console.error("Update article error:", error);
    return NextResponse.json({ success: false, error: "Failed to update article" }, { status: 500 });
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
      return NextResponse.json({ success: false, error: "Article ID is required" }, { status: 400 });
    }

    const existing = await prisma.article.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, error: "Article not found" }, { status: 404 });
    }

    // Remove tag associations
    await prisma.articleTag.deleteMany({ where: { articleId: id } });
    await prisma.article.delete({ where: { id } });

    const userId = (session.user as { id?: string })?.id;
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action: "DELETE",
        entityType: "article",
        entityId: id,
        beforeState: JSON.stringify({ title: existing.title }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete article error:", error);
    return NextResponse.json({ success: false, error: "Failed to delete article" }, { status: 500 });
  }
}
