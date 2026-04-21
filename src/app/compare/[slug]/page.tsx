import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { SpecIcon, GroupIcon } from "@/components/shared/SpecIcon";
import { JsonLd, generateBreadcrumbJsonLd, generateCollectionPageJsonLd } from "@/lib/json-ld";
import { getSiteUrl } from "@/lib/site-url";
import { Icon } from "@/components/shared/Icon";
import ComparisonVerdict from "@/components/public/ComparisonVerdict";

async function getComparisonPhones(slug: string) {
  // Parse "phone1-slug-vs-phone2-slug" format
  const parts = slug.split("-vs-");
  if (parts.length !== 2) return null;

  const [slug1, slug2] = parts;
  const [phone1, phone2] = await Promise.all([
    prisma.phone.findUnique({
      where: { slug: slug1 },
      include: {
        brand: { select: { name: true, slug: true } },
        specs: {
          include: { spec: { include: { group: true } } },
        },
      },
    }),
    prisma.phone.findUnique({
      where: { slug: slug2 },
      include: {
        brand: { select: { name: true, slug: true } },
        specs: {
          include: { spec: { include: { group: true } } },
        },
      },
    }),
  ]);

  if (!phone1 || !phone2) return null;
  return { phone1, phone2 };
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getComparisonPhones(params.slug);
  if (!data) return { title: "Comparison Not Found" };

  const { phone1, phone2 } = data;
  const baseUrl = getSiteUrl();
  const title = `${phone1.name} vs ${phone2.name} - Full Specs Comparison`;
  const description = `Compare ${phone1.name} and ${phone2.name} side by side. Detailed specification comparison including display, camera, battery, performance, and price.`;
  const url = `${baseUrl}/compare/${params.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${phone1.name} vs ${phone2.name} | MobilePlatform`,
      description,
      url,
      type: "website",
      siteName: "MobilePlatform",
    },
    twitter: {
      card: "summary_large_image",
      title: `${phone1.name} vs ${phone2.name}`,
      description,
    },
  };
}

export default async function ComparisonPage({ params }: { params: { slug: string } }) {
  const data = await getComparisonPhones(params.slug);
  if (!data) notFound();

  const { phone1, phone2 } = data;

  // Group all specs by category
  const allSpecKeys = new Set<string>();
  const specMap1 = new Map<string, { value: string; spec: typeof phone1.specs[0]["spec"] }>();
  const specMap2 = new Map<string, { value: string; spec: typeof phone2.specs[0]["spec"] }>();

  for (const ps of phone1.specs) {
    specMap1.set(ps.spec.key, { value: ps.value, spec: ps.spec });
    allSpecKeys.add(ps.spec.key);
  }
  for (const ps of phone2.specs) {
    specMap2.set(ps.spec.key, { value: ps.value, spec: ps.spec });
    allSpecKeys.add(ps.spec.key);
  }

  // Group specs by spec group
  const groupedSpecs: Record<string, {
    group: { name: string; slug: string; sortOrder: number };
    specs: Array<{ key: string; name: string; value1: string | null; value2: string | null; sortOrder: number }>;
  }> = {};

  for (const key of Array.from(allSpecKeys)) {
    const s1 = specMap1.get(key);
    const s2 = specMap2.get(key);
    const spec = s1?.spec || s2?.spec;
    if (!spec) continue;

    const groupSlug = spec.group.slug;
    if (!groupedSpecs[groupSlug]) {
      groupedSpecs[groupSlug] = {
        group: { name: spec.group.name, slug: spec.group.slug, sortOrder: spec.group.sortOrder },
        specs: [],
      };
    }
    groupedSpecs[groupSlug].specs.push({
      key: spec.key,
      name: spec.name,
      value1: s1?.value || null,
      value2: s2?.value || null,
      sortOrder: spec.sortOrder,
    });
  }

  const sortedGroups = Object.values(groupedSpecs)
    .sort((a, b) => a.group.sortOrder - b.group.sortOrder)
    .map((g) => ({
      ...g,
      specs: g.specs.sort((a, b) => a.sortOrder - b.sortOrder),
    }));

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <JsonLd data={[
        generateBreadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Compare", href: "/compare" },
          { name: `${phone1.name} vs ${phone2.name}`, href: `/compare/${params.slug}` },
        ]),
        generateCollectionPageJsonLd(
          `${phone1.name} vs ${phone2.name}`,
          `Detailed specification comparison between ${phone1.name} and ${phone2.name}.`,
          `/compare/${params.slug}`
        ),
      ]} />
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 md:py-14">
          <nav className="flex items-center gap-2 text-sm text-blue-200/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            <Link href="/compare" className="hover:text-white transition-colors">Compare</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            <span className="text-white">{phone1.name} vs {phone2.name}</span>
          </nav>

          <h1 className="text-2xl md:text-4xl font-extrabold text-white mb-6">
            {phone1.name} <span className="text-blue-400">vs</span> {phone2.name}
          </h1>

          {/* Phone Headers */}
          <div className="grid grid-cols-2 gap-6">
            {[phone1, phone2].map((phone) => (
              <div key={phone.id} className="bg-white dark:bg-gray-800/5 backdrop-blur-sm rounded-xl p-5 border border-white/10">
                <Link href={`/phones/${phone.slug}`} className="group">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white dark:bg-gray-800/10 rounded-xl flex items-center justify-center text-2xl overflow-hidden">
                      {phone.mainImage ? (
                        <Image src={phone.mainImage} alt={phone.name} width={48} height={48} className="w-full h-full object-contain" />
                      ) : (
                        <span>📱</span>
                      )}
                    </div>
                    <div>
                      <p className="text-xs text-blue-200/60">{phone.brand.name}</p>
                      <h2 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">{phone.name}</h2>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xl font-bold text-blue-300">
                      {phone.priceDisplay || (phone.priceUsd ? `$${phone.priceUsd.toLocaleString()}` : "TBA")}
                    </span>
                    {phone.reviewScore > 0 && (
                      <span className="text-sm text-amber-300">{phone.reviewScore.toFixed(1)}/10</span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verdict */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10">
        <ComparisonVerdict
          phone1Id={phone1.id}
          phone2Id={phone2.id}
          phone1Name={phone1.name}
          phone2Name={phone2.name}
        />
      </div>

      {/* Comparison Table */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-[1fr_1fr_1fr] bg-gray-50 dark:bg-gray-900 border-b text-sm font-semibold">
            <div className="px-6 py-4 text-gray-500 dark:text-gray-400">Specification</div>
            <div className="px-4 py-4 text-gray-900 dark:text-white text-center border-l">{phone1.name}</div>
            <div className="px-4 py-4 text-gray-900 dark:text-white text-center border-l">{phone2.name}</div>
          </div>

          {/* Price Row */}
          <div className="grid grid-cols-[1fr_1fr_1fr] border-b bg-blue-50 dark:bg-blue-900/20/30">
            <div className="px-6 py-3 text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
              <Icon icon="mdi:currency-usd" className="w-4 h-4 text-gray-400" />
              Price
            </div>
            <div className="px-4 py-3 text-sm text-center border-l font-semibold text-blue-700">
              {phone1.priceDisplay || (phone1.priceUsd ? `$${phone1.priceUsd.toLocaleString()}` : "—")}
            </div>
            <div className="px-4 py-3 text-sm text-center border-l font-semibold text-blue-700">
              {phone2.priceDisplay || (phone2.priceUsd ? `$${phone2.priceUsd.toLocaleString()}` : "—")}
            </div>
          </div>

          {/* Grouped Specs */}
          {sortedGroups.map(({ group, specs }) => (
            <div key={group.slug}>
              <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900/80 border-b flex items-center gap-2">
                <GroupIcon groupSlug={group.slug} size={16} className="text-blue-600" />
                <span className="text-xs font-bold text-gray-700 dark:text-gray-200 uppercase tracking-wider">{group.name}</span>
              </div>
              {specs.map((spec) => {
                const isDifferent = spec.value1 !== spec.value2 && spec.value1 && spec.value2;
                return (
                  <div
                    key={spec.key}
                    className={`grid grid-cols-[1fr_1fr_1fr] border-b last:border-b-0 ${
                      isDifferent ? "bg-amber-50/20" : ""
                    }`}
                  >
                    <div className="px-6 py-2.5 text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
                      <SpecIcon specKey={spec.key} size={14} className="text-gray-400 flex-shrink-0" />
                      {spec.name}
                    </div>
                    <div className="px-4 py-2.5 text-sm text-center border-l text-gray-900 dark:text-white">
                      {spec.value1 || "—"}
                    </div>
                    <div className="px-4 py-2.5 text-sm text-center border-l text-gray-900 dark:text-white">
                      {spec.value2 || "—"}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href={`/phones/${phone1.slug}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold text-sm"
          >
            View {phone1.name} Details
          </Link>
          <Link
            href={`/phones/${phone2.slug}`}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors font-semibold text-sm"
          >
            View {phone2.name} Details
          </Link>
          <Link
            href="/compare"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors font-semibold text-sm"
          >
            <Icon icon="mdi:compare" className="w-4 h-4" />
            Compare Other Phones
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
