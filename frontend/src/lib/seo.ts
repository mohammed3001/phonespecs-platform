// src/lib/seo.ts
export function generatePhoneJsonLd(phone: any, siteUrl: string, language: string) {
  const translation = phone.phoneTranslations?.find((t: any) => t.languageCode === language);
  const avgRating = phone.reviews?.length
    ? (phone.reviews.reduce((s: number, r: any) => s + Number(r.rating), 0) / phone.reviews.length).toFixed(1)
    : null;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: translation?.name || phone.name,
    description: translation?.description,
    brand: { '@type': 'Brand', name: phone.brand?.name },
    image: phone.images?.map((i: any) => i.url) || [],
    url: `${siteUrl}/${language}/phones/${phone.brand?.slug}/${phone.slug}`,
    ...(phone.priceUsd && {
      offers: {
        '@type': 'Offer',
        price: String(phone.priceUsd),
        priceCurrency: 'USD',
        availability: phone.status === 'AVAILABLE'
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
      },
    }),
    ...(avgRating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: avgRating,
        reviewCount: String(phone.reviews.length),
        bestRating: '10',
        worstRating: '1',
      },
    }),
    ...(phone.reviews?.length && {
      review: phone.reviews.slice(0, 3).map((r: any) => ({
        '@type': 'Review',
        name: r.title,
        reviewBody: r.content?.slice(0, 200),
        reviewRating: {
          '@type': 'Rating',
          ratingValue: String(r.rating),
          bestRating: '10',
        },
      })),
    }),
  };
}

export function generateBreadcrumbJsonLd(
  items: Array<{ name: string; url?: string }>,
  siteUrl: string,
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      ...(item.url && { item: `${siteUrl}${item.url}` }),
    })),
  };
}

export function generateOrganizationJsonLd(settings: Record<string, string>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.site_name || 'PhoneSpec',
    url: settings.site_url,
    logo: settings.logo_url,
    description: settings.site_description,
  };
}
