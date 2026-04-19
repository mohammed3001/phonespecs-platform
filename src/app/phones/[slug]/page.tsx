import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { SpecIcon, GroupIcon } from "@/components/shared/SpecIcon";
import PhoneCard from "@/components/public/PhoneCard";
import Breadcrumb from "@/components/public/Breadcrumb";
import { JsonLd, generatePhoneProductJsonLd, generateBreadcrumbJsonLd, generateFaqJsonLd } from "@/lib/json-ld";
import { getSiteUrl } from "@/lib/site-url";
import ReviewsSection from "@/components/public/ReviewsSection";
import AdSlot from "@/components/ads/AdSlot";
import SpecIQPanel from "@/components/public/SpecIQPanel";
import { calculateSpecScore, getScoreColor, getCategoryScoreColor } from "@/lib/spec-score";
import VariantSelector from "@/components/public/VariantSelector";
import QuickSpecsDropdown from "@/components/public/QuickSpecsDropdown";
import PhoneImageGallery from "@/components/public/PhoneImageGallery";

/* ─── Data fetching ─────────────────────────────────────────────── */

async function getPhone(slug: string) {
  return prisma.phone.findUnique({
    where: { slug },
    include: {
      brand: true,
      specs: { include: { spec: { include: { group: true } } } },
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
      faqs: { orderBy: { sortOrder: "asc" } },
    },
  });
}

async function getRelatedPhones(brandId: string, phoneId: string) {
  return prisma.phone.findMany({
    where: { brandId, isPublished: true, id: { not: phoneId } },
    include: {
      brand: { select: { name: true, slug: true } },
      specs: {
        include: { spec: { include: { group: true } } },
        where: { spec: { showInCard: true } },
      },
    },
    take: 4,
  });
}

/* ─── Metadata ──────────────────────────────────────────────────── */

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const phone = await getPhone(params.slug);
  if (!phone) return { title: "Phone Not Found" };

  const baseUrl = getSiteUrl();
  const title = phone.metaTitle || `${phone.name} Specifications, Price & Review`;
  const description =
    phone.metaDescription ||
    phone.overview ||
    `Full specifications, price, and review of ${phone.name}. Compare ${phone.name} with other smartphones.`;
  const url = `${baseUrl}/phones/${phone.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${phone.name} - Full Specs & Price | MobilePlatform`,
      description,
      url,
      type: "website",
      siteName: "MobilePlatform",
      images: phone.mainImage ? [{ url: phone.mainImage, alt: phone.name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: `${phone.name} Specs & Price`,
      description,
      images: phone.mainImage ? [phone.mainImage] : undefined,
    },
  };
}

/* ─── Helpers ───────────────────────────────────────────────────── */

const STATUS_MAP: Record<string, { label: string; light: string; dark: string }> = {
  available: {
    label: "Available",
    light: "text-emerald-700 bg-emerald-50 ring-emerald-200",
    dark: "dark:text-emerald-400 dark:bg-emerald-500/10 dark:ring-emerald-500/30",
  },
  coming_soon: {
    label: "Coming Soon",
    light: "text-amber-700 bg-amber-50 ring-amber-200",
    dark: "dark:text-amber-400 dark:bg-amber-500/10 dark:ring-amber-500/30",
  },
  discontinued: {
    label: "Discontinued",
    light: "text-gray-600 bg-gray-100 ring-gray-200",
    dark: "dark:text-gray-400 dark:bg-gray-700 dark:ring-gray-600",
  },
  rumored: {
    label: "Rumored",
    light: "text-violet-700 bg-violet-50 ring-violet-200",
    dark: "dark:text-violet-400 dark:bg-violet-500/10 dark:ring-violet-500/30",
  },
};

/* ─── Page ──────────────────────────────────────────────────────── */

export default async function PhoneDetailPage({ params }: { params: { slug: string } }) {
  const phone = await getPhone(params.slug);
  if (!phone) notFound();

  const relatedPhones = await getRelatedPhones(phone.brandId, phone.id);

  // Group specs by category
  const groupedSpecs: Record<
    string,
    { group: { name: string; slug: string; icon: string | null; sortOrder: number }; specs: typeof phone.specs }
  > = {};

  for (const ps of phone.specs) {
    const slug = ps.spec.group.slug;
    if (!groupedSpecs[slug]) groupedSpecs[slug] = { group: ps.spec.group, specs: [] };
    groupedSpecs[slug].specs.push(ps);
  }

  const sortedGroups = Object.values(groupedSpecs).sort((a, b) => a.group.sortOrder - b.group.sortOrder);

  const keySpecs = phone.specs
    .filter((s) => s.spec.isHighlighted)
    .sort((a, b) => a.spec.sortOrder - b.spec.sortOrder);

  const phoneStatus = STATUS_MAP[phone.marketStatus] ?? STATUS_MAP.available;

  const specScore = calculateSpecScore(
    phone.specs.map((s) => ({
      key: s.spec.key,
      value: s.value,
      numericValue: s.numericValue,
      group: s.spec.group,
    }))
  );

  const priceLabel =
    phone.marketStatus === "available"
      ? "Official Price"
      : phone.marketStatus === "coming_soon"
        ? "Expected Price"
        : null;

  const displayPrice = phone.priceDisplay || (phone.priceUsd ? `$${phone.priceUsd.toLocaleString()}` : "Price TBA");

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 flex flex-col">
      <JsonLd
        data={[
          generatePhoneProductJsonLd(phone),
          generateBreadcrumbJsonLd([
            { name: "Home", href: "/" },
            { name: "Phones", href: "/phones" },
            { name: phone.brand.name, href: `/brands/${phone.brand.slug}` },
            { name: phone.name, href: `/phones/${phone.slug}` },
          ]),
          ...(phone.faqs?.length ? [generateFaqJsonLd(phone.faqs)] : []),
        ]}
      />
      <Header />

      {/* ── Breadcrumbs ─────────────────────────────────────────── */}
      <nav className="border-b border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <Breadcrumb
            items={[
              { label: "Home", href: "/" },
              { label: "Phones", href: "/phones" },
              { label: phone.brand.name, href: `/brands/${phone.brand.slug}` },
              { label: phone.name },
            ]}
          />
        </div>
      </nav>

      {/* ── Phone Header ────────────────────────────────────────── */}
      <section className="bg-white dark:bg-gray-950 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <div className="flex flex-col md:flex-row gap-10 md:gap-14">
            {/* Left — Image Gallery */}
            <PhoneImageGallery mainImage={phone.mainImage} images={phone.images} phoneName={phone.name} />

            {/* Right — Phone Info */}
            <div className="flex-1 min-w-0">
              {/* Brand + Status */}
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <Link
                  href={`/phones?brand=${phone.brand.slug}`}
                  className="text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
                >
                  {phone.brand.name}
                </Link>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ring-1 ring-inset ${phoneStatus.light} ${phoneStatus.dark}`}
                >
                  {phoneStatus.label}
                </span>
              </div>

              {/* Phone Name */}
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight leading-tight">
                {phone.name}
              </h1>

              {/* Price + Score Row */}
              <div className="flex flex-wrap items-center gap-5 mt-5">
                {/* Price */}
                <div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-3xl font-extrabold text-teal-600 dark:text-teal-400">
                      {displayPrice}
                    </span>
                    {priceLabel && (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ring-1 ring-inset ${
                          phone.marketStatus === "available"
                            ? "text-emerald-700 bg-emerald-50 ring-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:ring-emerald-500/30"
                            : "text-amber-700 bg-amber-50 ring-amber-200 dark:text-amber-400 dark:bg-amber-500/10 dark:ring-amber-500/30"
                        }`}
                      >
                        {priceLabel}
                      </span>
                    )}
                  </div>
                </div>

                {/* Spec Score */}
                {specScore.overall > 0 && (
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl ring-1 ring-inset ${getScoreColor(specScore.overall)}`}>
                    <span className="text-lg font-extrabold">{specScore.overall}%</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">Spec Score</span>
                  </div>
                )}

                {/* Review Score */}
                {phone.reviewScore > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 dark:bg-amber-500/10 rounded-lg">
                    <svg className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-lg font-bold text-amber-700 dark:text-amber-400">{phone.reviewScore.toFixed(1)}</span>
                    <span className="text-xs text-amber-600 dark:text-amber-500">/10</span>
                  </div>
                )}
              </div>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-400 dark:text-gray-500">
                {phone.releaseDate && (
                  <span className="flex items-center gap-1.5">
                    <SpecIcon specKey="" size={14} className="text-gray-300 dark:text-gray-600" />
                    Released {phone.releaseDate}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <SpecIcon specKey="" size={14} className="text-gray-300 dark:text-gray-600" />
                  Updated{" "}
                  {new Date(phone.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                {phone.lastVerifiedAt && (
                  <span className="flex items-center gap-1.5 text-emerald-500">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Verified{" "}
                    {new Date(phone.lastVerifiedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                )}
                {phone.dataSource && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full text-xs font-medium">
                    Source: {phone.dataSource}
                  </span>
                )}
              </div>

              {/* Key Specs Grid */}
              {keySpecs.length > 0 && (
                <div className="mt-7">
                  <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                    Key Specifications
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {keySpecs.map((s) => (
                      <div
                        key={s.spec.key}
                        className="flex items-center gap-3 px-3.5 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800"
                      >
                        <SpecIcon specKey={s.spec.key} size={20} className="text-teal-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] text-gray-400 dark:text-gray-500 font-medium">{s.spec.name}</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                            {s.value}
                            {s.spec.unit ? ` ${s.spec.unit}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Variant Selector */}
              {phone.variants && phone.variants.length > 1 && (
                <VariantSelector variants={phone.variants} defaultPrice={phone.priceUsd} />
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 mt-7">
                <Link
                  href="#specifications"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors shadow-sm"
                >
                  <SpecIcon specKey="" size={16} className="text-white" />
                  See Full Specs
                </Link>
                <Link
                  href={`/compare?phones=${phone.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-all"
                >
                  <SpecIcon specKey="" size={16} className="text-gray-400" />
                  Compare
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Main Content ────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Column */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Overview */}
            {phone.overview && (
              <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Overview</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">{phone.overview}</p>
              </section>
            )}

            {/* Spec Score Breakdown */}
            {specScore.overall > 0 && specScore.categories.length > 0 && (
              <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Spec Score Breakdown</h2>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl ring-1 ring-inset ${getScoreColor(specScore.overall)}`}>
                    <span className="text-2xl font-extrabold">{specScore.overall}%</span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">Overall</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {specScore.categories.map((cat) => (
                    <div key={cat.slug} className="flex items-center gap-4">
                      <div className="w-32 flex-shrink-0">
                        <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{cat.name}</p>
                      </div>
                      <div className="flex-1">
                        <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              cat.score >= 8
                                ? "bg-emerald-500"
                                : cat.score >= 6
                                  ? "bg-teal-500"
                                  : cat.score >= 4
                                    ? "bg-amber-500"
                                    : "bg-red-500"
                            }`}
                            style={{ width: `${(cat.score / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className={`text-sm font-bold w-10 text-right ${getCategoryScoreColor(cat.score)}`}>
                        {cat.score}/10
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Pros & Cons */}
            {((phone.pros as string[] | null)?.length || (phone.cons as string[] | null)?.length) ? (
              <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Pros & Cons</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(phone.pros as string[] | null)?.length ? (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-600 uppercase tracking-wider mb-3">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Pros
                      </h3>
                      <ul className="space-y-2">
                        {(phone.pros as string[]).map((pro, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {(phone.cons as string[] | null)?.length ? (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-red-600 uppercase tracking-wider mb-3">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Cons
                      </h3>
                      <ul className="space-y-2">
                        {(phone.cons as string[]).map((con, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                            {con}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              </section>
            ) : null}

            {/* Full Specifications */}
            <section id="specifications" className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-6 md:px-8 py-5 border-b border-gray-100 dark:border-gray-800">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {phone.name} Full Specifications
                </h2>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Complete technical specifications</p>
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {sortedGroups.map(({ group, specs }) => {
                  const sortedSpecs = [...specs].sort((a, b) => a.spec.sortOrder - b.spec.sortOrder);

                  // Separate specs by subSection
                  const subSections: Record<string, typeof sortedSpecs> = {};
                  const noSubSection: typeof sortedSpecs = [];
                  for (const ps of sortedSpecs) {
                    if (ps.spec.subSection) {
                      if (!subSections[ps.spec.subSection]) subSections[ps.spec.subSection] = [];
                      subSections[ps.spec.subSection].push(ps);
                    } else {
                      noSubSection.push(ps);
                    }
                  }

                  return (
                    <div key={group.slug}>
                      {/* Group Header */}
                      <div className="px-6 md:px-8 py-3.5 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-2.5">
                        <GroupIcon groupSlug={group.slug} size={18} className="text-teal-600 dark:text-teal-400" />
                        <h3 className="font-bold text-gray-800 dark:text-gray-200 text-sm uppercase tracking-wider">
                          {group.name}
                        </h3>
                      </div>

                      {/* Specs without subSection */}
                      {noSubSection.length > 0 && (
                        <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                          {noSubSection.map((ps) => (
                            <div
                              key={ps.spec.key}
                              className="flex items-center px-6 md:px-8 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                            >
                              <div className="flex items-center gap-2.5 w-48 flex-shrink-0">
                                <SpecIcon specKey={ps.spec.key} size={16} className="text-gray-400 dark:text-gray-500" />
                                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{ps.spec.name}</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {ps.value}
                                {ps.spec.unit ? ` ${ps.spec.unit}` : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Specs grouped by subSection */}
                      {Object.entries(subSections).map(([subName, subSpecs]) => (
                        <div key={subName}>
                          <div className="px-6 md:px-8 py-2.5 bg-teal-50 dark:bg-teal-900/10 border-t border-gray-100 dark:border-gray-800">
                            <h4 className="text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider">
                              {subName}
                            </h4>
                          </div>
                          <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                            {subSpecs.map((ps) => (
                              <div
                                key={ps.spec.key}
                                className="flex items-center px-6 md:px-8 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                              >
                                <div className="flex items-center gap-2.5 w-48 flex-shrink-0">
                                  <SpecIcon specKey={ps.spec.key} size={16} className="text-gray-400 dark:text-gray-500" />
                                  <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">{ps.spec.name}</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                  {ps.value}
                                  {ps.spec.unit ? ` ${ps.spec.unit}` : ""}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* User Reviews */}
            <ReviewsSection phoneId={phone.id} phoneName={phone.name} phoneSlug={phone.slug} />

            {/* FAQ */}
            <section className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Frequently Asked Questions</h2>
              <div className="space-y-3">
                {[
                  {
                    q: `What is the price of ${phone.name}?`,
                    a: phone.priceDisplay
                      ? `The ${phone.name} is priced at ${phone.priceDisplay}.`
                      : `The official price of ${phone.name} has not been announced yet.`,
                  },
                  {
                    q: `When was ${phone.name} released?`,
                    a: phone.releaseDate
                      ? `The ${phone.name} was released on ${phone.releaseDate}.`
                      : `The release date for ${phone.name} has not been announced yet.`,
                  },
                  {
                    q: `What are the key specs of ${phone.name}?`,
                    a:
                      keySpecs.length > 0
                        ? `Key specifications include: ${keySpecs.map((s) => `${s.spec.name}: ${s.value}${s.spec.unit ? ` ${s.spec.unit}` : ""}`).join(", ")}.`
                        : `Detailed specifications are available in the specifications section above.`,
                  },
                ].map((faq, i) => (
                  <details
                    key={i}
                    className="group rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden"
                  >
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors font-semibold text-gray-800 dark:text-gray-200 text-sm">
                      {faq.q}
                      <svg
                        className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</div>
                  </details>
                ))}
              </div>
            </section>
          </div>

          {/* ── Sidebar ───────────────────────────────────────────── */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-thin">
              {/* Quick Specs Dropdown */}
              <QuickSpecsDropdown
                specs={phone.specs
                  .filter((s) => s.spec.showInCard)
                  .sort((a, b) => a.spec.sortOrder - b.spec.sortOrder)
                  .map((s) => ({
                    key: s.spec.key,
                    name: s.spec.name,
                    value: s.value,
                    unit: s.spec.unit,
                    groupName: s.spec.group.name,
                    groupSlug: s.spec.group.slug,
                  }))}
                phoneName={phone.name}
                brandName={phone.brand.name}
                price={phone.priceDisplay || (phone.priceUsd ? `$${phone.priceUsd.toLocaleString()}` : null)}
                specScore={specScore.overall}
                preGeneratedPost={phone.socialMediaPost}
              />

              {/* Sidebar Actions */}
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 space-y-3">
                <Link
                  href={`/compare?phones=${phone.slug}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors"
                >
                  Compare This Phone
                </Link>
                <Link
                  href={`/phones?brand=${phone.brand.slug}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-sm font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                >
                  More {phone.brand.name} Phones
                </Link>
              </div>

              {/* Spec IQ */}
              <SpecIQPanel phoneId={phone.id} />

              {/* Sidebar Ad Slot */}
              <AdSlot
                slotSlug="phone-sidebar"
                pageType="phone_detail"
                phoneId={phone.id}
                brandId={phone.brandId}
                variant="native"
              />
            </div>
          </aside>
        </div>

        {/* Related Phones */}
        {relatedPhones.length > 0 && (
          <section className="mt-12">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  More from {phone.brand.name}
                </h2>
                <p className="text-gray-400 dark:text-gray-500 mt-1">Other phones by {phone.brand.name}</p>
              </div>
              <Link
                href={`/brands/${phone.brand.slug}`}
                className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300"
              >
                View All
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedPhones.map((rp) => (
                <PhoneCard key={rp.id} phone={rp} />
              ))}
            </div>
          </section>
        )}

        {/* Explore More */}
        <section className="mt-12 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Explore More</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <Link
              href="/phones/best-camera-phones"
              className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-teal-200 dark:hover:border-teal-800 hover:bg-teal-50 dark:hover:bg-teal-900/20 transition-all text-sm"
            >
              <SpecIcon specKey="main_camera" size={18} className="text-teal-500 flex-shrink-0" />
              <span className="font-medium text-gray-700 dark:text-gray-200">Best Camera</span>
            </Link>
            <Link
              href="/phones/best-battery-life"
              className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-emerald-200 dark:hover:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all text-sm"
            >
              <SpecIcon specKey="battery" size={18} className="text-emerald-500 flex-shrink-0" />
              <span className="font-medium text-gray-700 dark:text-gray-200">Best Battery</span>
            </Link>
            <Link
              href="/phones/best-performance"
              className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all text-sm"
            >
              <SpecIcon specKey="processor" size={18} className="text-red-500 flex-shrink-0" />
              <span className="font-medium text-gray-700 dark:text-gray-200">Best Performance</span>
            </Link>
            <Link
              href="/phones/best-display"
              className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-purple-200 dark:hover:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all text-sm"
            >
              <SpecIcon specKey="display_size" size={18} className="text-purple-500 flex-shrink-0" />
              <span className="font-medium text-gray-700 dark:text-gray-200">Best Display</span>
            </Link>
            <Link
              href="/phones/flagship"
              className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-amber-200 dark:hover:border-amber-800 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-all text-sm"
            >
              <SpecIcon specKey="" size={18} className="text-amber-500 flex-shrink-0" />
              <span className="font-medium text-gray-700 dark:text-gray-200">Flagship</span>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
