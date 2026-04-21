import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";

/**
 * Dynamic sitemap with entity splitting.
 * Includes: static pages, phone pages, brand pages, programmatic SEO pages.
 * Designed to scale to thousands of entries via entity-aware grouping.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  // ==================== STATIC PAGES ====================
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/phones`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/brands`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/find-my-phone`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
  ];

  // ==================== PHONE PAGES ====================
  const phones = await prisma.phone.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });

  const phonePages: MetadataRoute.Sitemap = phones.map((phone) => ({
    url: `${baseUrl}/phones/${phone.slug}`,
    lastModified: phone.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // ==================== BRAND PAGES ====================
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });

  const brandPages: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${baseUrl}/brands/${brand.slug}`,
    lastModified: brand.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // ==================== PROGRAMMATIC SEO PAGES ====================
  const programmaticPages: MetadataRoute.Sitemap = [
    // Best-of category pages
    { url: `${baseUrl}/phones/best-camera-phones`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/phones/best-battery-life`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/phones/best-performance`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/phones/best-display`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    // Price range pages
    { url: `${baseUrl}/phones/under/300`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/phones/under/500`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/phones/under/700`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/phones/under/1000`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
    { url: `${baseUrl}/phones/flagship`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 },
  ];

  // ==================== COMPARISON PAGES ====================
  // Generate permanent comparison URLs for top phone pairs
  const comparisonPages: MetadataRoute.Sitemap = [];
  if (phones.length >= 2) {
    // Create pairs for the first N most popular phones (capped for sitemap size)
    const topPhones = phones.slice(0, Math.min(phones.length, 10));
    for (let i = 0; i < topPhones.length; i++) {
      for (let j = i + 1; j < topPhones.length; j++) {
        const slugs = [topPhones[i].slug, topPhones[j].slug].sort();
        comparisonPages.push({
          url: `${baseUrl}/compare/${slugs[0]}-vs-${slugs[1]}`,
          lastModified: new Date(),
          changeFrequency: "monthly" as const,
          priority: 0.6,
        });
      }
    }
  }

  return [
    ...staticPages,
    ...phonePages,
    ...brandPages,
    ...programmaticPages,
    ...comparisonPages,
  ];
}
