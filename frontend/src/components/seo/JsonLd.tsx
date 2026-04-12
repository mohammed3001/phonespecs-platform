'use client';

interface JsonLdProps {
  data: Record<string, unknown>;
}

export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteJsonLd({ name, url }: { name: string; url: string }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name,
        url,
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${url}/en/search?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      }}
    />
  );
}

export function PhoneJsonLd({
  name,
  brand,
  image,
  description,
  price,
  currency,
  url,
  releaseDate,
  status,
}: {
  name: string;
  brand: string;
  image: string;
  description: string;
  price?: number;
  currency?: string;
  url: string;
  releaseDate?: string;
  status: string;
}) {
  const availability =
    status === 'AVAILABLE'
      ? 'https://schema.org/InStock'
      : status === 'UPCOMING'
      ? 'https://schema.org/PreOrder'
      : 'https://schema.org/Discontinued';

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name,
        brand: { '@type': 'Brand', name: brand },
        image,
        description,
        url,
        ...(releaseDate && { releaseDate }),
        ...(price && {
          offers: {
            '@type': 'Offer',
            price,
            priceCurrency: currency || 'USD',
            availability,
          },
        }),
      }}
    />
  );
}

export function ArticleJsonLd({
  title,
  description,
  image,
  author,
  publishedAt,
  url,
}: {
  title: string;
  description: string;
  image: string;
  author: string;
  publishedAt: string;
  url: string;
}) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        image,
        author: { '@type': 'Person', name: author },
        datePublished: publishedAt,
        url,
        publisher: {
          '@type': 'Organization',
          name: 'PhoneSpec',
        },
      }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url?: string }[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, idx) => ({
          '@type': 'ListItem',
          position: idx + 1,
          name: item.name,
          ...(item.url && { item: item.url }),
        })),
      }}
    />
  );
}
