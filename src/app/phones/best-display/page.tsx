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
  title: "Best Display Phones 2025 - Top Screen Quality Smartphones",
  description: "Discover smartphones with the best displays. Ranked by screen size, resolution, refresh rate, and panel technology. AMOLED, LTPO, and more.",
  alternates: {
    canonical: `${getSiteUrl()}/phones/best-display`,
  },
  openGraph: {
    title: "Best Display Phones 2025 | MobilePlatform",
    description: "Smartphones with the best screen quality, ranked by resolution and panel technology.",
    url: `${getSiteUrl()}/phones/best-display`,
    type: "website",
    siteName: "MobilePlatform",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Display Phones 2025 | MobilePlatform",
    description: "Top smartphones ranked by screen quality and display technology.",
  },
};

async function getBestDisplayPhones() {
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

  return phones
    .map((phone) => {
      const displaySpec = phone.specs.find((s) => s.spec.key === "display_size");
      const displayValue = displaySpec?.numericValue || 0;
      return { ...phone, displayValue, specs: phone.specs.filter((s) => s.spec.showInCard) };
    })
    .sort((a, b) => b.displayValue - a.displayValue || b.reviewScore - a.reviewScore)
    .slice(0, 20);
}

export default async function BestDisplayPage() {
  const phones = await getBestDisplayPhones();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <JsonLd data={[
        generateItemListJsonLd(
          phones.map((p, i) => ({ name: p.name, slug: p.slug, position: i + 1 })),
          "Best Display Phones 2025",
          "Smartphones with the best screen quality"
        ),
        generateBreadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Phones", href: "/phones" },
          { name: "Best Display", href: "/phones/best-display" },
        ]),
        generateCollectionPageJsonLd(
          "Best Display Phones 2025",
          "Smartphones with the best displays ranked by resolution, refresh rate, and panel technology.",
          "/phones/best-display"
        ),
      ]} />
      <Header />

      <section className="bg-gradient-to-br from-slate-900 via-purple-950 to-violet-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(168,85,247,0.15),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <nav className="flex items-center gap-2 text-sm text-purple-200/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            <Link href="/phones" className="hover:text-white transition-colors">Phones</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            <span className="text-white">Best Display</span>
          </nav>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-purple-500/20 rounded-2xl flex items-center justify-center">
              <Icon icon="mdi:cellphone" className="w-7 h-7 text-purple-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">Best Display Phones</h1>
              <p className="text-purple-200/70 mt-1">Stunning screens for the best visual experience</p>
            </div>
          </div>
          <p className="text-purple-100/60 max-w-2xl text-sm md:text-base leading-relaxed mt-4">
            Ranked by display size, resolution, refresh rate, and panel technology. From vibrant 
            AMOLED to efficient LTPO — find the phone with the best screen.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex-1">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">{phones.length} phones ranked by display quality</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {phones.map((phone, index) => (
            <div key={phone.id} className="relative">
              {index < 3 && (
                <div className={`absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${
                  index === 0 ? "bg-purple-500" : index === 1 ? "bg-gray-400" : "bg-purple-700"
                }`}>
                  #{index + 1}
                </div>
              )}
              <PhoneCard phone={phone} variant="default" />
            </div>
          ))}
        </div>

        <section className="mt-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How We Rank Displays</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Display rankings consider screen size, pixel density, panel type (AMOLED, IPS LCD, LTPO),
              refresh rate, peak brightness, color accuracy, and HDR support. We value a balance of 
              size, quality, and power efficiency.
            </p>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
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
          <Link href="/phones/best-battery-life" className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-sm dark:shadow-gray-900/30 transition-all">
            <Icon icon="mdi:battery-high" className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Best Battery</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Longest lasting phones</p>
            </div>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
