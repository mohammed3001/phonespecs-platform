import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import PhoneCard from "@/components/public/PhoneCard";
import { JsonLd, generateItemListJsonLd, generateBreadcrumbJsonLd, generateCollectionPageJsonLd } from "@/lib/json-ld";
import { getSiteUrl } from "@/lib/site-url";
import { Icon } from "@iconify/react";

// Valid price thresholds
const VALID_PRICES: Record<string, { price: number; label: string; description: string }> = {
  "300": {
    price: 300,
    label: "Under $300",
    description: "Best budget smartphones under $300. Affordable phones with great features, solid cameras, and reliable performance without breaking the bank.",
  },
  "500": {
    price: 500,
    label: "Under $500",
    description: "Best mid-range smartphones under $500. Premium features at a reasonable price — excellent cameras, fast processors, and quality displays.",
  },
  "700": {
    price: 700,
    label: "Under $700",
    description: "Best smartphones under $700. Near-flagship quality with top-tier cameras, powerful processors, and premium build quality.",
  },
  "1000": {
    price: 1000,
    label: "Under $1000",
    description: "Best smartphones under $1000. Flagship-level performance and features without crossing the four-figure mark.",
  },
};

export async function generateStaticParams() {
  return Object.keys(VALID_PRICES).map((price) => ({ price }));
}

export async function generateMetadata({ params }: { params: { price: string } }): Promise<Metadata> {
  const config = VALID_PRICES[params.price];
  if (!config) return { title: "Not Found" };

  const baseUrl = getSiteUrl();
  const url = `${baseUrl}/phones/under/${params.price}`;

  return {
    title: `Best Phones ${config.label} in 2025 - Top Budget Picks`,
    description: config.description,
    alternates: { canonical: url },
    openGraph: {
      title: `Best Phones ${config.label} | MobilePlatform`,
      description: config.description,
      url,
      type: "website",
      siteName: "MobilePlatform",
    },
    twitter: {
      card: "summary_large_image",
      title: `Best Phones ${config.label} | MobilePlatform`,
      description: config.description,
    },
  };
}

async function getPhonesUnderPrice(maxPrice: number) {
  return prisma.phone.findMany({
    where: {
      isPublished: true,
      marketStatus: { in: ["available", "coming_soon"] },
      priceUsd: { gt: 0, lte: maxPrice },
    },
    include: {
      brand: { select: { name: true, slug: true } },
      specs: {
        include: { spec: { include: { group: true } } },
        where: { spec: { showInCard: true } },
      },
    },
    orderBy: [{ reviewScore: "desc" }, { priceUsd: "desc" }],
    take: 30,
  });
}

export default async function UnderPricePage({ params }: { params: { price: string } }) {
  const config = VALID_PRICES[params.price];
  if (!config) notFound();

  const phones = await getPhonesUnderPrice(config.price);

  const priceRanges = Object.entries(VALID_PRICES)
    .filter(([key]) => key !== params.price)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <JsonLd data={[
        generateItemListJsonLd(
          phones.map((p, i) => ({ name: p.name, slug: p.slug, position: i + 1 })),
          `Best Phones ${config.label}`,
          config.description
        ),
        generateBreadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Phones", href: "/phones" },
          { name: config.label, href: `/phones/under/${params.price}` },
        ]),
        generateCollectionPageJsonLd(
          `Best Phones ${config.label} in 2025`,
          config.description,
          `/phones/under/${params.price}`
        ),
      ]} />
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-emerald-950 to-teal-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.15),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <nav className="flex items-center gap-2 text-sm text-emerald-200/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            <Link href="/phones" className="hover:text-white transition-colors">Phones</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            <span className="text-white">{config.label}</span>
          </nav>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-emerald-500/20 rounded-2xl flex items-center justify-center">
              <Icon icon="mdi:tag-outline" className="w-7 h-7 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">Best Phones {config.label}</h1>
              <p className="text-emerald-200/70 mt-1">Top picks that deliver great value</p>
            </div>
          </div>
          <p className="text-emerald-100/60 max-w-2xl text-sm md:text-base leading-relaxed mt-4">
            {config.description}
          </p>
        </div>
      </section>

      {/* Phone Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex-1">
        {phones.length === 0 ? (
          <div className="text-center py-20">
            <Icon icon="mdi:tag-off" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600">No phones found {config.label}</h2>
            <p className="text-gray-400 mt-2">Try a different price range or check back soon.</p>
            <Link href="/phones" className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors text-sm font-semibold">
              Browse All Phones
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">{phones.length} phones {config.label}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {phones.map((phone, index) => (
                <div key={phone.id} className="relative">
                  {index < 3 && (
                    <div className={`absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${
                      index === 0 ? "bg-emerald-500" : index === 1 ? "bg-gray-400" : "bg-emerald-700"
                    }`}>
                      #{index + 1}
                    </div>
                  )}
                  <PhoneCard phone={phone} variant="default" />
                </div>
              ))}
            </div>
          </>
        )}

        {/* Other Price Ranges */}
        <section className="mt-12">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Other Price Ranges</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {priceRanges.map(([key, cfg]) => (
              <Link key={key} href={`/phones/under/${key}`} className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-emerald-300 hover:shadow-sm transition-all">
                <Icon icon="mdi:currency-usd" className="w-6 h-6 text-emerald-500" />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{cfg.label}</p>
                  <p className="text-xs text-gray-500">Best value picks</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Related Categories */}
        <section className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/phones/best-camera-phones" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
            <Icon icon="mdi:camera" className="w-6 h-6 text-blue-500" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Best Camera</p>
              <p className="text-xs text-gray-500">Top photography phones</p>
            </div>
          </Link>
          <Link href="/phones/best-battery-life" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
            <Icon icon="mdi:battery-high" className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Best Battery</p>
              <p className="text-xs text-gray-500">Longest lasting phones</p>
            </div>
          </Link>
          <Link href="/phones/flagship" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
            <Icon icon="mdi:star" className="w-6 h-6 text-amber-500" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Flagship Phones</p>
              <p className="text-xs text-gray-500">Premium devices $1000+</p>
            </div>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
