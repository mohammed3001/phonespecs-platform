// src/app/[locale]/phones/[brand]/[slug]/page.tsx
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getTranslations } from 'next-intl/server';
import { PhoneSpecTable } from '@/components/phone/PhoneSpecTable';
import { PhoneImageGallery } from '@/components/phone/PhoneImageGallery';
import { PhoneVideoPlayer } from '@/components/phone/PhoneVideoPlayer';
import { PhoneReviews } from '@/components/phone/PhoneReviews';
import { RelatedPhones } from '@/components/phone/RelatedPhones';
import { AddToCompare } from '@/components/phone/AddToCompare';
import { ShareButtons } from '@/components/ui/ShareButtons';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { api } from '@/lib/api';
import { generatePhoneJsonLd } from '@/lib/seo';

interface Props {
  params: { locale: string; brand: string; slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const phone = await api.phones.getBySlug(params.brand, params.slug, params.locale);
    const seo = phone.seoMeta?.[0];

    return {
      title: seo?.title || phone.name,
      description: seo?.description || phone.translation?.description,
      keywords: seo?.keywords,
      openGraph: {
        title: seo?.ogTitle || phone.name,
        description: seo?.ogDescription,
        images: seo?.ogImage ? [seo.ogImage] : phone.images?.map((i: any) => i.url) || [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: seo?.twitterTitle || phone.name,
        description: seo?.twitterDesc,
        images: seo?.twitterImage ? [seo.twitterImage] : undefined,
      },
      robots: {
        index: seo?.robotsIndex ?? true,
        follow: seo?.robotsFollow ?? true,
      },
      alternates: {
        canonical: seo?.canonicalUrl,
      },
    };
  } catch {
    return { title: 'Phone Not Found' };
  }
}

export default async function PhonePage({ params }: Props) {
  let phone;
  try {
    phone = await api.phones.getBySlug(params.brand, params.slug, params.locale);
  } catch {
    notFound();
  }

  const t = await getTranslations('phone');
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!;
  const jsonLd = generatePhoneJsonLd(phone, siteUrl, params.locale);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <BreadcrumbNav
          items={[
            { label: t('brands'), href: `/${params.locale}/brands` },
            {
              label: phone.brand.name,
              href: `/${params.locale}/brands/${phone.brand.slug}`,
            },
            { label: phone.name },
          ]}
        />

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left: Images & Video */}
          <div className="space-y-4">
            <PhoneImageGallery images={phone.images} phoneName={phone.name} />
            {phone.videos?.length > 0 && (
              <PhoneVideoPlayer videos={phone.videos} />
            )}
          </div>

          {/* Right: Core Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
                    {phone.brand.name}
                  </p>
                  <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                    {phone.translation?.name || phone.name}
                  </h1>
                </div>
                <AddToCompare phoneId={phone.id} phoneName={phone.name} />
              </div>

              {/* Status & Price */}
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <PhoneStatusBadge status={phone.status} />
                {phone.priceUsd && (
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${phone.priceUsd}
                  </div>
                )}
              </div>
            </div>

            {/* Highlight specs */}
            <PhoneHighlights specs={phone.specs} />

            <ShareButtons
              url={`${siteUrl}/${params.locale}/phones/${params.brand}/${params.slug}`}
              title={phone.name}
            />
          </div>
        </div>

        {/* Full Specs Table */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">{t('fullSpecs')}</h2>
          <PhoneSpecTable
            specs={phone.specs}
            locale={params.locale}
          />
        </div>

        {/* Reviews */}
        {phone.reviews?.length > 0 && (
          <div className="mt-12">
            <PhoneReviews reviews={phone.reviews} locale={params.locale} />
          </div>
        )}

        {/* Related phones */}
        <div className="mt-12">
          <RelatedPhones
            brandId={phone.brandId}
            currentPhoneId={phone.id}
            locale={params.locale}
          />
        </div>
      </div>
    </>
  );
}

function PhoneStatusBadge({ status }: { status: string }) {
  const styles = {
    AVAILABLE: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    UPCOMING: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    DISCONTINUED: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
  };
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles] || styles.AVAILABLE}`}>
      {status}
    </span>
  );
}

function PhoneHighlights({ specs }: { specs: any[] }) {
  const highlights = specs?.filter((s) => s.attribute?.isHighlight) || [];
  if (!highlights.length) return null;

  return (
    <div className="grid grid-cols-2 gap-3">
      {highlights.slice(0, 6).map((spec) => (
        <div
          key={spec.id}
          className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3"
        >
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {spec.attribute.name}
          </p>
          <p className="mt-0.5 font-semibold text-gray-900 dark:text-white">
            {spec.displayValue || spec.value}
          </p>
        </div>
      ))}
    </div>
  );
}
