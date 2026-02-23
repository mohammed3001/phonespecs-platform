// src/seo/seo.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class SeoService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private redis: RedisService,
  ) {}

  async getSeoMeta(entityType: string, entityId: string, languageCode: string) {
    return this.prisma.seoMeta.findUnique({
      where: { entityType_entityId_languageCode: { entityType, entityId, languageCode } },
    });
  }

  async upsertSeoMeta(data: {
    entityType: string;
    entityId: string;
    languageCode: string;
    title?: string;
    description?: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterTitle?: string;
    twitterDesc?: string;
    twitterImage?: string;
    canonicalUrl?: string;
    robotsIndex?: boolean;
    robotsFollow?: boolean;
    jsonLd?: any;
  }) {
    const { entityType, entityId, languageCode, ...rest } = data;
    return this.prisma.seoMeta.upsert({
      where: { entityType_entityId_languageCode: { entityType, entityId, languageCode } },
      create: { entityType, entityId, languageCode, ...rest },
      update: rest,
    });
  }

  async generateSitemap(): Promise<string> {
    const cached = await this.redis.get('sitemap:xml');
    if (cached) return cached;

    const siteUrl = await this.getSetting('site_url') || 'https://example.com';
    const languages = await this.prisma.language.findMany({
      where: { isActive: true },
    });
    const phones = await this.prisma.phone.findMany({
      where: { isActive: true },
      include: { brand: true },
      orderBy: { updatedAt: 'desc' },
    });
    const brands = await this.prisma.brand.findMany({ where: { isActive: true } });

    const urls: string[] = [];

    for (const lang of languages) {
      // Home
      urls.push(this.sitemapUrl(siteUrl, `/${lang.code}`, lang.code, languages));

      // Brand pages
      for (const brand of brands) {
        urls.push(
          this.sitemapUrl(siteUrl, `/${lang.code}/brands/${brand.slug}`, lang.code, languages),
        );
      }

      // Phone pages
      for (const phone of phones) {
        urls.push(
          this.sitemapUrl(
            siteUrl,
            `/${lang.code}/phones/${phone.brand.slug}/${phone.slug}`,
            lang.code,
            languages,
            phone.updatedAt.toISOString(),
          ),
        );
      }
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:xhtml="http://www.w3.org/1999/xhtml"
>
${urls.join('\n')}
</urlset>`;

    await this.redis.set('sitemap:xml', xml, 3600);
    return xml;
  }

  private sitemapUrl(
    siteUrl: string,
    path: string,
    currentLang: string,
    allLangs: any[],
    lastmod?: string,
  ) {
    const alternates = allLangs
      .map(
        (l) =>
          `  <xhtml:link rel="alternate" hreflang="${l.code}" href="${siteUrl}${path.replace(`/${currentLang}/`, `/${l.code}/`)}"/>`,
      )
      .join('\n');

    return `<url>
  <loc>${siteUrl}${path}</loc>
  ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
  <changefreq>weekly</changefreq>
  <priority>0.8</priority>
${alternates}
</url>`;
  }

  async generateRobotsTxt(): Promise<string> {
    const siteUrl = await this.getSetting('site_url') || 'https://example.com';
    const customRules = await this.getSetting('robots_custom_rules') || '';

    return `User-agent: *
Allow: /
Disallow: /admin*
Disallow: /api*

# Sitemaps
Sitemap: ${siteUrl}/sitemap.xml

${customRules}`;
  }

  generatePhoneJsonLd(phone: any, siteUrl: string, language: string) {
    const lang = language;
    const translation = phone.phoneTranslations?.find(
      (t: any) => t.languageCode === lang,
    );

    return {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: translation?.name || phone.name,
      description: translation?.description,
      brand: {
        '@type': 'Brand',
        name: phone.brand?.name,
      },
      image: phone.images?.map((img: any) => img.url) || [],
      offers: phone.priceUsd
        ? {
            '@type': 'Offer',
            price: phone.priceUsd,
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock',
          }
        : undefined,
      aggregateRating: phone.reviews?.length > 0
        ? {
            '@type': 'AggregateRating',
            ratingValue: (
              phone.reviews.reduce((sum: number, r: any) => sum + Number(r.rating), 0) /
              phone.reviews.length
            ).toFixed(1),
            reviewCount: phone.reviews.length,
          }
        : undefined,
    };
  }

  private async getSetting(key: string): Promise<string | null> {
    const setting = await this.prisma.systemSettings.findUnique({ where: { key } });
    return setting?.value || null;
  }

  async invalidateSitemapCache() {
    await this.redis.del('sitemap:xml');
  }
}
