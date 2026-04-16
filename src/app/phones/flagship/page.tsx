import prisma from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import PhoneCard from "@/components/public/PhoneCard";
import { JsonLd, generateItemListJsonLd, generateBreadcrumbJsonLd, generateCollectionPageJsonLd } from "@/lib/json-ld";
import { getSiteUrl } from "@/lib/site-url";
import { Icon } from "@/components/shared/Icon";

export const metadata: Metadata = {
  title: "Flagship Phones 2025 - Premium Smartphones $1000+",
  description: "Discover the best flagship smartphones over $1000. Premium devices with cutting-edge technology, the best cameras, and uncompromising performance.",
  alternates: {
    canonical: `${getSiteUrl()}/phones/flagship`,
  },
  openGraph: {
    title: "Flagship Phones 2025 | MobilePlatform",
    description: "Premium smartphones with cutting-edge technology and uncompromising performance.",
    url: `${getSiteUrl()}/phones/flagship`,
    type: "website",
    siteName: "MobilePlatform",
  },
  twitter: {
    card: "summary_large_image",
    title: "Flagship Phones 2025 | MobilePlatform",
    description: "Premium smartphones with the best cameras, displays, and performance.",
  },
};

async function getFlagshipPhones() {
  return prisma.phone.findMany({
    where: {
      isPublished: true,
      marketStatus: { in: ["available", "coming_soon"] },
      priceUsd: { gte: 1000 },
    },
    include: {
      brand: { select: { name: true, slug: true } },
      specs: {
        include: { spec: { include: { group: true } } },
        where: { spec: { showInCard: true } },
      },
    },
    orderBy: [{ reviewScore: "desc" }, { priceUsd: "desc" }],
    take: 20,
  });
}

export default async function FlagshipPhonesPage() {
  const phones = await getFlagshipPhones();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <JsonLd data={[
        generateItemListJsonLd(
          phones.map((p, i) => ({ name: p.name, slug: p.slug, position: i + 1 })),
          "Flagship Phones 2025",
          "Premium smartphones with cutting-edge technology"
        ),
        generateBreadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Phones", href: "/phones" },
          { name: "Flagship Phones", href: "/phones/flagship" },
        ]),
        generateCollectionPageJsonLd(
          "Flagship Phones 2025",
          "Premium smartphones over $1000 with the best cameras, displays, and performance.",
          "/phones/flagship"
        ),
      ]} />
      <Header />

      <section className="bg-gradient-to-br from-slate-900 via-amber-950 to-yellow-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(245,158,11,0.15),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <nav className="flex items-center gap-2 text-sm text-amber-200/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            <Link href="/phones" className="hover:text-white transition-colors">Phones</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            <span className="text-white">Flagship Phones</span>
          </nav>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-amber-500/20 rounded-2xl flex items-center justify-center">
              <Icon icon="mdi:star" className="w-7 h-7 text-amber-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">Flagship Phones</h1>
              <p className="text-amber-200/70 mt-1">Premium devices with no compromises</p>
            </div>
          </div>
          <p className="text-amber-100/60 max-w-2xl text-sm md:text-base leading-relaxed mt-4">
            The very best smartphones money can buy. Cutting-edge processors, revolutionary cameras, 
            stunning displays, and premium materials. For those who demand the absolute best.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex-1">
        {phones.length === 0 ? (
          <div className="text-center py-20">
            <Icon icon="mdi:star-off" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600 dark:text-gray-300">No flagship phones found</h2>
            <p className="text-gray-400 mt-2">Check back soon for updated listings.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">{phones.length} flagship phones from $1,000+</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {phones.map((phone, index) => (
                <div key={phone.id} className="relative">
                  {index < 3 && (
                    <div className={`absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${
                      index === 0 ? "bg-amber-500" : index === 1 ? "bg-gray-400" : "bg-amber-700"
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

        <section className="mt-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Why Choose a Flagship Phone?</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Flagship phones represent the pinnacle of smartphone technology. They feature the latest 
              processors for blazing performance, the most advanced camera systems with computational 
              photography, premium display technologies like LTPO AMOLED with 120Hz+ refresh rates, 
              and premium build materials like titanium and ceramic. If you want the best experience 
              possible, flagship phones deliver.
            </p>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/phones/under/500" className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-sm dark:shadow-gray-900/30 transition-all">
            <Icon icon="mdi:currency-usd" className="w-6 h-6 text-emerald-500" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Under $500</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Great value mid-range</p>
            </div>
          </Link>
          <Link href="/phones/best-camera-phones" className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-sm dark:shadow-gray-900/30 transition-all">
            <Icon icon="mdi:camera" className="w-6 h-6 text-blue-500" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Best Camera</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Top photography phones</p>
            </div>
          </Link>
          <Link href="/phones/best-performance" className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-sm dark:shadow-gray-900/30 transition-all">
            <Icon icon="mdi:speedometer" className="w-6 h-6 text-red-500" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Best Performance</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Most powerful phones</p>
            </div>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
