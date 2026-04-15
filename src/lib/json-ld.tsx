import { getSiteUrl } from "./site-url";

// ==================== TYPES ====================

interface BreadcrumbItem {
  name: string;
  href: string;
}

interface PhoneForJsonLd {
  name: string;
  slug: string;
  overview: string | null;
  mainImage: string | null;
  priceUsd: number | null;
  priceDisplay: string | null;
  marketStatus: string;
  releaseDate: string | null;
  reviewScore: number;
  reviewCount: number;
  updatedAt: Date;
  brand: { name: string; slug: string };
  specs: Array<{
    value: string;
    spec: { key: string; name: string; group: { name: string; slug: string } };
  }>;
  faqs?: Array<{ question: string; answer: string }>;
}

interface BrandForJsonLd {
  name: string;
  slug: string;
  description: string | null;
  logo: string | null;
  website: string | null;
  phoneCount: number;
}

interface ArticleForJsonLd {
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  date: string;
  readTime: string;
  author?: string;
}

// ==================== HELPERS ====================

function escapeJsonLd(text: string): string {
  return text.replace(/</g, "\\u003c").replace(/>/g, "\\u003e");
}

// ==================== SCHEMAS ====================

/**
 * Website + SearchAction schema for the homepage.
 * Enables Google Sitelinks Searchbox.
 */
export function generateWebsiteJsonLd() {
  const baseUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "MobilePlatform",
    url: baseUrl,
    description:
      "Discover smartphone specifications, reviews, comparisons, and news. Find the perfect phone with detailed specs, expert reviews, and price comparisons.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${baseUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    publisher: {
      "@type": "Organization",
      name: "MobilePlatform",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icon.png`,
      },
    },
  };
}

/**
 * Organization schema for the platform itself.
 */
export function generateOrganizationJsonLd() {
  const baseUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MobilePlatform",
    url: baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${baseUrl}/icon.png`,
    },
    sameAs: [],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      url: `${baseUrl}/contact`,
    },
  };
}

/**
 * Product schema for phone detail pages.
 * Uses MobilePhone subtype for richer results.
 */
export function generatePhoneProductJsonLd(phone: PhoneForJsonLd) {
  const baseUrl = getSiteUrl();
  const url = `${baseUrl}/phones/${phone.slug}`;

  // Extract key specs
  const getSpec = (key: string) =>
    phone.specs.find((s) => s.spec.key === key)?.value;

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: phone.name,
    url,
    description: phone.overview
      ? escapeJsonLd(phone.overview)
      : `${phone.name} specifications, price, and review.`,
    brand: {
      "@type": "Brand",
      name: phone.brand.name,
      url: `${baseUrl}/brands/${phone.brand.slug}`,
    },
    category: "Smartphones",
    sku: phone.slug,
    mpn: phone.slug,
    image: phone.mainImage || `${baseUrl}/icon.png`,
    dateModified: phone.updatedAt.toISOString(),
  };

  // Add release date
  if (phone.releaseDate) {
    schema.releaseDate = phone.releaseDate;
  }

  // Add offers (price)
  if (phone.priceUsd && phone.priceUsd > 0) {
    schema.offers = {
      "@type": "Offer",
      price: phone.priceUsd,
      priceCurrency: "USD",
      availability:
        phone.marketStatus === "available"
          ? "https://schema.org/InStock"
          : phone.marketStatus === "coming_soon"
            ? "https://schema.org/PreOrder"
            : phone.marketStatus === "discontinued"
              ? "https://schema.org/Discontinued"
              : "https://schema.org/OutOfStock",
      url,
      seller: {
        "@type": "Organization",
        name: phone.brand.name,
      },
    };
  }

  // Add aggregate rating
  if (phone.reviewScore > 0 && phone.reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: phone.reviewScore.toFixed(1),
      bestRating: "10",
      worstRating: "0",
      ratingCount: phone.reviewCount,
    };
  }

  // Add additional properties from specs
  const additionalProperties: Array<{ "@type": string; name: string; value: string }> = [];
  const specMappings = [
    { key: "display_size", name: "Display Size" },
    { key: "display_type", name: "Display Type" },
    { key: "processor", name: "Processor" },
    { key: "ram", name: "RAM" },
    { key: "storage", name: "Storage" },
    { key: "main_camera", name: "Main Camera" },
    { key: "front_camera", name: "Front Camera" },
    { key: "battery", name: "Battery Capacity" },
    { key: "os", name: "Operating System" },
    { key: "connectivity", name: "Connectivity" },
    { key: "weight", name: "Weight" },
    { key: "dimensions", name: "Dimensions" },
  ];

  for (const mapping of specMappings) {
    const value = getSpec(mapping.key);
    if (value) {
      additionalProperties.push({
        "@type": "PropertyValue",
        name: mapping.name,
        value: escapeJsonLd(value),
      });
    }
  }

  if (additionalProperties.length > 0) {
    schema.additionalProperty = additionalProperties;
  }

  return schema;
}

/**
 * FAQ schema for phone pages with FAQs.
 */
export function generateFaqJsonLd(
  faqs: Array<{ question: string; answer: string }>
) {
  if (!faqs || faqs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: escapeJsonLd(faq.question),
      acceptedAnswer: {
        "@type": "Answer",
        text: escapeJsonLd(faq.answer),
      },
    })),
  };
}

/**
 * BreadcrumbList schema.
 */
export function generateBreadcrumbJsonLd(items: BreadcrumbItem[]) {
  const baseUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.href.startsWith("http") ? item.href : `${baseUrl}${item.href}`,
    })),
  };
}

/**
 * Organization schema for brand detail pages.
 */
export function generateBrandOrganizationJsonLd(brand: BrandForJsonLd) {
  const baseUrl = getSiteUrl();
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: brand.name,
    url: brand.website || `${baseUrl}/brands/${brand.slug}`,
    description: brand.description
      ? escapeJsonLd(brand.description)
      : `${brand.name} smartphones — browse ${brand.phoneCount} phones with full specifications and prices.`,
  };

  if (brand.logo) {
    schema.logo = {
      "@type": "ImageObject",
      url: brand.logo.startsWith("http") ? brand.logo : `${baseUrl}${brand.logo}`,
    };
  }

  if (brand.website) {
    schema.sameAs = [brand.website];
  }

  return schema;
}

/**
 * ItemList schema for phone listing / category pages.
 * Used for programmatic SEO pages and listings.
 */
export function generateItemListJsonLd(
  phones: Array<{ name: string; slug: string; position?: number }>,
  listName: string,
  listDescription: string
) {
  const baseUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: listName,
    description: listDescription,
    numberOfItems: phones.length,
    itemListElement: phones.map((phone, index) => ({
      "@type": "ListItem",
      position: phone.position || index + 1,
      url: `${baseUrl}/phones/${phone.slug}`,
      name: phone.name,
    })),
  };
}

/**
 * Article / NewsArticle schema for news pages.
 */
export function generateArticleJsonLd(article: ArticleForJsonLd) {
  const baseUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: escapeJsonLd(article.title),
    description: article.excerpt ? escapeJsonLd(article.excerpt) : undefined,
    url: `${baseUrl}/news/${article.slug}`,
    datePublished: article.date,
    dateModified: article.date,
    author: {
      "@type": "Person",
      name: article.author || "MobilePlatform Editorial",
    },
    publisher: {
      "@type": "Organization",
      name: "MobilePlatform",
      url: baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/icon.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${baseUrl}/news/${article.slug}`,
    },
    articleSection: article.category,
  };
}

/**
 * CollectionPage schema for listing pages (phones, brands).
 */
export function generateCollectionPageJsonLd(
  name: string,
  description: string,
  path: string
) {
  const baseUrl = getSiteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: `${baseUrl}${path}`,
    isPartOf: {
      "@type": "WebSite",
      name: "MobilePlatform",
      url: baseUrl,
    },
  };
}

// ==================== RENDER HELPER ====================

/**
 * Renders one or more JSON-LD schemas as <script> tags.
 * Use in Server Components only.
 */
export function JsonLd({
  data,
}: {
  data: Record<string, unknown> | Array<Record<string, unknown> | null>;
}) {
  const schemas = Array.isArray(data)
    ? data.filter(Boolean)
    : [data];

  if (schemas.length === 0) return null;

  return (
    <>
      {schemas.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}
