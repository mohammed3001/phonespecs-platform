import { MetadataRoute } from "next";
import prisma from "@/lib/prisma";
import { getSiteUrl } from "@/lib/site-url";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/phones`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/brands`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/news`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
  ];

  // Dynamic phone pages
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

  // Dynamic brand pages
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

  return [...staticPages, ...phonePages, ...brandPages];
}
