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

async function getPhone(slug: string) {
  const phone = await prisma.phone.findUnique({
    where: { slug },
    include: {
      brand: true,
      specs: {
        include: { spec: { include: { group: true } } },
      },
      faqs: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });
  return phone;
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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const phone = await getPhone(params.slug);
  if (!phone) return { title: "Phone Not Found" };

  const baseUrl = getSiteUrl();
  const title = phone.metaTitle || `${phone.name} Specifications, Price & Review`;
  const description = phone.metaDescription || phone.overview || `Full specifications, price, and review of ${phone.name}. Compare ${phone.name} with other smartphones.`;
  const url = `${baseUrl}/phones/${phone.slug}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
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

export default async function PhoneDetailPage({ params }: { params: { slug: string } }) {
  const phone = await getPhone(params.slug);
  if (!phone) notFound();

  const relatedPhones = await getRelatedPhones(phone.brandId, phone.id);

  // Group specs by category
  const groupedSpecs: Record<string, {
    group: { name: string; slug: string; icon: string | null; sortOrder: number };
    specs: typeof phone.specs;
  }> = {};

  for (const ps of phone.specs) {
    const groupSlug = ps.spec.group.slug;
    if (!groupedSpecs[groupSlug]) {
      groupedSpecs[groupSlug] = { group: ps.spec.group, specs: [] };
    }
    groupedSpecs[groupSlug].specs.push(ps);
  }

  const sortedGroups = Object.values(groupedSpecs).sort(
    (a, b) => a.group.sortOrder - b.group.sortOrder
  );

  const keySpecs = phone.specs
    .filter((s) => s.spec.isHighlighted)
    .sort((a, b) => a.spec.sortOrder - b.spec.sortOrder);

  const status: Record<string, { label: string; color: string }> = {
    available: { label: "Available", color: "text-emerald-700 bg-emerald-50 ring-emerald-600/20" },
    coming_soon: { label: "Coming Soon", color: "text-amber-700 bg-amber-50 ring-amber-600/20" },
    discontinued: { label: "Discontinued", color: "text-gray-600 bg-gray-100 ring-gray-500/20" },
    rumored: { label: "Rumored", color: "text-violet-700 bg-violet-50 ring-violet-600/20" },
  };

  const phoneStatus = status[phone.marketStatus] || status.available;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <JsonLd data={[
        generatePhoneProductJsonLd(phone),
        generateBreadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Phones", href: "/phones" },
          { name: phone.brand.name, href: `/brands/${phone.brand.slug}` },
          { name: phone.name, href: `/phones/${phone.slug}` },
        ]),
        ...(phone.faqs && phone.faqs.length > 0 ? [generateFaqJsonLd(phone.faqs)] : []),
      ]} />
      <Header />

      {/* Breadcrumbs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
          <Breadcrumb items={[
            { label: "Home", href: "/" },
            { label: "Phones", href: "/phones" },
            { label: phone.brand.name, href: `/brands/${phone.brand.slug}` },
            { label: phone.name },
          ]} />
        </div>
      </div>

      {/* Phone Header */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 md:py-12">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12">
            {/* Phone Image */}
            <div className="flex-shrink-0 flex justify-center">
              <div className="w-56 h-72 md:w-64 md:h-80 bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl flex items-center justify-center border border-gray-200">
                <span className="text-8xl">📱</span>
              </div>
            </div>

            {/* Phone Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Link
                  href={`/phones?brand=${phone.brand.slug}`}
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  {phone.brand.name}
                </Link>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ring-1 ring-inset ${phoneStatus.color}`}>
                  {phoneStatus.label}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                {phone.name}
              </h1>

              <div className="flex flex-wrap items-center gap-4 mt-4">
                <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  {phone.priceDisplay || (phone.priceUsd ? `$${phone.priceUsd.toLocaleString()}` : "Price TBA")}
                </span>
                {phone.reviewScore > 0 && (
                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg">
                    <svg className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-lg font-bold text-amber-700">{phone.reviewScore.toFixed(1)}</span>
                    <span className="text-xs text-amber-600">/10</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-gray-500">
                {phone.releaseDate && (
                  <span className="flex items-center gap-1.5">
                    <SpecIcon specKey="" size={14} className="text-gray-400" />
                    Released {phone.releaseDate}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <SpecIcon specKey="" size={14} className="text-gray-400" />
                  Updated {new Date(phone.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </span>
                {phone.lastVerifiedAt && (
                  <span className="flex items-center gap-1.5 text-emerald-600">
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.403 12.652a3 3 0 010-5.304 3 3 0 00-3.75-3.751 3 3 0 00-5.305 0 3 3 0 00-3.751 3.75 3 3 0 000 5.305 3 3 0 003.75 3.751 3 3 0 005.305 0 3 3 0 003.751-3.75zm-2.546-4.46a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                    Verified {new Date(phone.lastVerifiedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                )}
                {phone.dataSource && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Source: {phone.dataSource}
                  </span>
                )}
              </div>

              {/* Key Specs Grid */}
              {keySpecs.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Key Specifications</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {keySpecs.map((s) => (
                      <div key={s.spec.key} className="flex items-center gap-2.5 px-3.5 py-3 bg-gray-50 rounded-xl border border-gray-100">
                        <SpecIcon specKey={s.spec.key} size={20} className="text-blue-500 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-[11px] text-gray-400 font-medium">{s.spec.name}</p>
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {s.value}{s.spec.unit ? ` ${s.spec.unit}` : ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 mt-6">
                <Link
                  href="#specifications"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
                >
                  <SpecIcon specKey="" size={16} className="text-white" />
                  See Full Specs
                </Link>
                <Link
                  href={`/compare?phones=${phone.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-700 text-sm font-semibold rounded-xl border border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all"
                >
                  <SpecIcon specKey="" size={16} className="text-gray-400" />
                  Compare
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="flex-1 min-w-0 space-y-8">
            {/* Overview */}
            {phone.overview && (
              <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Overview</h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{phone.overview}</p>
              </section>
            )}

            {/* Pros & Cons */}
            {((phone.pros as string[] | null)?.length || (phone.cons as string[] | null)?.length) ? (
              <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
                <h2 className="text-xl font-bold text-gray-900 mb-5">Pros & Cons</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(phone.pros as string[] | null)?.length ? (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-700 uppercase tracking-wider mb-3">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" /></svg>
                        Pros
                      </h3>
                      <ul className="space-y-2">
                        {(phone.pros as string[]).map((pro, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                            {pro}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {(phone.cons as string[] | null)?.length ? (
                    <div>
                      <h3 className="flex items-center gap-2 text-sm font-bold text-red-700 uppercase tracking-wider mb-3">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" /></svg>
                        Cons
                      </h3>
                      <ul className="space-y-2">
                        {(phone.cons as string[]).map((con, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                            <span className="mt-1 w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
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
            <section id="specifications" className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className="px-6 md:px-8 py-6 border-b bg-gray-50">
                <h2 className="text-xl font-bold text-gray-900">{phone.name} Full Specifications</h2>
                <p className="text-sm text-gray-500 mt-1">Complete technical specifications</p>
              </div>
              <div className="divide-y divide-gray-100">
                {sortedGroups.map(({ group, specs }) => {
                  // Group specs by subSection for sub-section rendering (e.g. Primary Camera / Selfie Camera)
                  const sortedSpecs = specs.sort((a, b) => a.spec.sortOrder - b.spec.sortOrder);
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
                  const hasSubSections = Object.keys(subSections).length > 0;

                  return (
                    <div key={group.slug}>
                      <div className="px-6 md:px-8 py-4 bg-gray-50/50 flex items-center gap-2.5">
                        <GroupIcon groupSlug={group.slug} size={18} className="text-blue-600" />
                        <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">{group.name}</h3>
                      </div>
                      {/* Specs without subSection */}
                      {noSubSection.length > 0 && (
                        <div className="divide-y divide-gray-50">
                          {noSubSection.map((ps) => (
                            <div key={ps.spec.key} className="flex items-center px-6 md:px-8 py-3.5 hover:bg-blue-50/30 transition-colors">
                              <div className="flex items-center gap-2.5 w-48 flex-shrink-0">
                                <SpecIcon specKey={ps.spec.key} size={16} className="text-gray-400" />
                                <span className="text-sm text-gray-500 font-medium">{ps.spec.name}</span>
                              </div>
                              <span className="text-sm font-semibold text-gray-900">
                                {ps.value}{ps.spec.unit ? ` ${ps.spec.unit}` : ""}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                      {/* Specs grouped by subSection */}
                      {hasSubSections && Object.entries(subSections).map(([subName, subSpecs]) => (
                        <div key={subName}>
                          <div className="px-6 md:px-8 py-3 bg-blue-50/40 border-t border-gray-100">
                            <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider">{subName}</h4>
                          </div>
                          <div className="divide-y divide-gray-50">
                            {subSpecs.map((ps) => (
                              <div key={ps.spec.key} className="flex items-center px-6 md:px-8 py-3.5 hover:bg-blue-50/30 transition-colors">
                                <div className="flex items-center gap-2.5 w-48 flex-shrink-0">
                                  <SpecIcon specKey={ps.spec.key} size={16} className="text-gray-400" />
                                  <span className="text-sm text-gray-500 font-medium">{ps.spec.name}</span>
                                </div>
                                <span className="text-sm font-semibold text-gray-900">
                                  {ps.value}{ps.spec.unit ? ` ${ps.spec.unit}` : ""}
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

            {/* FAQ Section */}
            <section className="bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
              <div className="space-y-4">
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
                    a: keySpecs.length > 0
                      ? `Key specifications include: ${keySpecs.map((s) => `${s.spec.name}: ${s.value}${s.spec.unit ? ` ${s.spec.unit}` : ""}`).join(", ")}.`
                      : `Detailed specifications are available in the specifications section above.`,
                  },
                ].map((faq, i) => (
                  <details
                    key={i}
                    className="group rounded-xl border border-gray-200 overflow-hidden"
                  >
                    <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-gray-50 transition-colors font-semibold text-gray-900 text-sm">
                      {faq.q}
                      <svg className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform flex-shrink-0 ml-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>
                    <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">{faq.a}</div>
                  </details>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:w-80 flex-shrink-0">
            <div className="sticky top-24 space-y-6 max-h-[calc(100vh-7rem)] overflow-y-auto scrollbar-thin">
            {/* Quick Specs Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-5">
              <h3 className="font-bold text-gray-900 text-sm mb-4">Quick Specs</h3>
              <div className="space-y-3">
                {phone.specs
                  .filter((s) => s.spec.showInCard)
                  .sort((a, b) => a.spec.sortOrder - b.spec.sortOrder)
                  .map((s) => (
                    <div key={s.spec.key} className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <SpecIcon specKey={s.spec.key} size={14} className="text-gray-400" />
                        {s.spec.name}
                      </div>
                      <span className="text-sm font-semibold text-gray-900 text-right truncate max-w-[140px]">
                        {s.value}{s.spec.unit ? ` ${s.spec.unit}` : ""}
                      </span>
                    </div>
                  ))}
              </div>

              <div className="mt-5 pt-5 border-t space-y-3">
                <Link
                  href={`/compare?phones=${phone.slug}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Compare This Phone
                </Link>
                <Link
                  href={`/phones?brand=${phone.brand.slug}`}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  More {phone.brand.name} Phones
                </Link>
              </div>
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
              className="mt-4"
            />
            </div>
          </aside>
        </div>

        {/* Related Phones */}
        {relatedPhones.length > 0 && (
          <section className="mt-12">
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">More from {phone.brand.name}</h2>
                <p className="text-gray-500 mt-1">Other phones by {phone.brand.name}</p>
              </div>
              <Link href={`/brands/${phone.brand.slug}`} className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 hover:text-blue-700">
                View All
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {relatedPhones.map((rp) => (
                <PhoneCard key={rp.id} phone={rp} />
              ))}
            </div>
          </section>
        )}

        {/* Smart Internal Links — Category Pages */}
        <section className="mt-12 bg-white rounded-2xl border border-gray-200 p-6 md:p-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Explore More</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <Link href="/phones/best-camera-phones" className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all text-sm">
              <SpecIcon specKey="main_camera" size={18} className="text-blue-500 flex-shrink-0" />
              <span className="font-medium text-gray-700">Best Camera</span>
            </Link>
            <Link href="/phones/best-battery-life" className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 hover:border-green-200 hover:bg-green-50/50 transition-all text-sm">
              <SpecIcon specKey="battery" size={18} className="text-green-500 flex-shrink-0" />
              <span className="font-medium text-gray-700">Best Battery</span>
            </Link>
            <Link href="/phones/best-performance" className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50/50 transition-all text-sm">
              <SpecIcon specKey="processor" size={18} className="text-red-500 flex-shrink-0" />
              <span className="font-medium text-gray-700">Best Performance</span>
            </Link>
            <Link href="/phones/best-display" className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50/50 transition-all text-sm">
              <SpecIcon specKey="display_size" size={18} className="text-purple-500 flex-shrink-0" />
              <span className="font-medium text-gray-700">Best Display</span>
            </Link>
            <Link href="/phones/flagship" className="flex items-center gap-2.5 p-3 rounded-xl border border-gray-100 hover:border-amber-200 hover:bg-amber-50/50 transition-all text-sm">
              <SpecIcon specKey="" size={18} className="text-amber-500 flex-shrink-0" />
              <span className="font-medium text-gray-700">Flagship</span>
            </Link>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
