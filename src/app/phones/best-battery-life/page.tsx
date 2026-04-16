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
  title: "Best Battery Life Phones 2025 - Longest Lasting Smartphones",
  description: "Discover smartphones with the best battery life. Ranked by battery capacity, efficiency, and real-world endurance. Find phones that last all day and beyond.",
  alternates: {
    canonical: `${getSiteUrl()}/phones/best-battery-life`,
  },
  openGraph: {
    title: "Best Battery Life Phones 2025 | MobilePlatform",
    description: "Smartphones with the longest battery life, ranked by capacity and endurance.",
    url: `${getSiteUrl()}/phones/best-battery-life`,
    type: "website",
    siteName: "MobilePlatform",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Battery Life Phones 2025 | MobilePlatform",
    description: "Longest lasting smartphones ranked by battery capacity and efficiency.",
  },
};

async function getBestBatteryPhones() {
  const phones = await prisma.phone.findMany({
    where: {
      isPublished: true,
      marketStatus: { in: ["available", "coming_soon"] },
    },
    include: {
      brand: { select: { name: true, slug: true } },
      specs: {
        include: { spec: { include: { group: true } } },
      },
    },
  });

  // Sort by battery spec numeric value
  return phones
    .map((phone) => {
      const batterySpec = phone.specs.find((s) => s.spec.key === "battery");
      const batteryValue = batterySpec?.numericValue || 0;
      return { ...phone, batteryValue, specs: phone.specs.filter((s) => s.spec.showInCard) };
    })
    .sort((a, b) => b.batteryValue - a.batteryValue)
    .slice(0, 20);
}

export default async function BestBatteryLifePage() {
  const phones = await getBestBatteryPhones();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <JsonLd data={[
        generateItemListJsonLd(
          phones.map((p, i) => ({ name: p.name, slug: p.slug, position: i + 1 })),
          "Best Battery Life Phones 2025",
          "Smartphones with the longest battery life"
        ),
        generateBreadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Phones", href: "/phones" },
          { name: "Best Battery Life", href: "/phones/best-battery-life" },
        ]),
        generateCollectionPageJsonLd(
          "Best Battery Life Phones 2025",
          "Smartphones with the longest battery life, ranked by capacity and efficiency.",
          "/phones/best-battery-life"
        ),
      ]} />
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-green-950 to-emerald-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(34,197,94,0.15),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <nav className="flex items-center gap-2 text-sm text-green-200/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            <Link href="/phones" className="hover:text-white transition-colors">Phones</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            <span className="text-white">Best Battery Life</span>
          </nav>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-green-500/20 rounded-2xl flex items-center justify-center">
              <Icon icon="mdi:battery-high" className="w-7 h-7 text-green-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">Best Battery Life Phones</h1>
              <p className="text-green-200/70 mt-1">Smartphones that last all day and beyond</p>
            </div>
          </div>
          <p className="text-green-100/60 max-w-2xl text-sm md:text-base leading-relaxed mt-4">
            Ranked by battery capacity, power efficiency, and real-world endurance. Find the smartphone 
            that won&apos;t leave you searching for a charger.
          </p>
        </div>
      </section>

      {/* Phone Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex-1">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500">{phones.length} phones ranked by battery capacity</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {phones.map((phone, index) => (
            <div key={phone.id} className="relative">
              {index < 3 && (
                <div className={`absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${
                  index === 0 ? "bg-green-500" : index === 1 ? "bg-gray-400" : "bg-green-700"
                }`}>
                  #{index + 1}
                </div>
              )}
              <PhoneCard phone={phone} variant="default" />
            </div>
          ))}
        </div>

        {/* SEO Content */}
        <section className="mt-16 bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Rank Battery Life</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed">
              Our battery life rankings consider battery capacity (mAh), processor efficiency, 
              display power consumption, and charging speed. A larger battery doesn&apos;t always mean 
              longer life — efficient processors and optimized software play crucial roles.
            </p>
          </div>
        </section>

        {/* Related Categories */}
        <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/phones/best-camera-phones" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
            <Icon icon="mdi:camera" className="w-6 h-6 text-blue-500" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Best Camera</p>
              <p className="text-xs text-gray-500">Top photography phones</p>
            </div>
          </Link>
          <Link href="/phones/best-performance" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
            <Icon icon="mdi:speedometer" className="w-6 h-6 text-red-500" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Best Performance</p>
              <p className="text-xs text-gray-500">Most powerful phones</p>
            </div>
          </Link>
          <Link href="/phones/under/500" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
            <Icon icon="mdi:currency-usd" className="w-6 h-6 text-emerald-500" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Under $500</p>
              <p className="text-xs text-gray-500">Best value phones</p>
            </div>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
