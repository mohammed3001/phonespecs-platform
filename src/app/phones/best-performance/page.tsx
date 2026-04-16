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
  title: "Best Performance Phones 2025 - Most Powerful Smartphones",
  description: "Discover the most powerful smartphones with top-tier processors, maximum RAM, and blazing-fast performance. Ranked for gaming, multitasking, and power users.",
  alternates: {
    canonical: `${getSiteUrl()}/phones/best-performance`,
  },
  openGraph: {
    title: "Best Performance Phones 2025 | MobilePlatform",
    description: "Most powerful smartphones ranked by processor, RAM, and real-world performance.",
    url: `${getSiteUrl()}/phones/best-performance`,
    type: "website",
    siteName: "MobilePlatform",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Performance Phones 2025 | MobilePlatform",
    description: "Most powerful smartphones ranked for gaming and multitasking.",
  },
};

async function getBestPerformancePhones() {
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
      const ramSpec = phone.specs.find((s) => s.spec.key === "ram");
      const ramValue = ramSpec?.numericValue || 0;
      return { ...phone, ramValue, specs: phone.specs.filter((s) => s.spec.showInCard) };
    })
    .sort((a, b) => b.ramValue - a.ramValue || b.reviewScore - a.reviewScore)
    .slice(0, 20);
}

export default async function BestPerformancePage() {
  const phones = await getBestPerformancePhones();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <JsonLd data={[
        generateItemListJsonLd(
          phones.map((p, i) => ({ name: p.name, slug: p.slug, position: i + 1 })),
          "Best Performance Phones 2025",
          "Most powerful smartphones for gaming and multitasking"
        ),
        generateBreadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Phones", href: "/phones" },
          { name: "Best Performance", href: "/phones/best-performance" },
        ]),
        generateCollectionPageJsonLd(
          "Best Performance Phones 2025",
          "Most powerful smartphones ranked by processor, RAM, and performance.",
          "/phones/best-performance"
        ),
      ]} />
      <Header />

      <section className="bg-gradient-to-br from-slate-900 via-red-950 to-rose-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(239,68,68,0.15),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <nav className="flex items-center gap-2 text-sm text-red-200/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            <Link href="/phones" className="hover:text-white transition-colors">Phones</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            <span className="text-white">Best Performance</span>
          </nav>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center">
              <Icon icon="mdi:speedometer" className="w-7 h-7 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">Best Performance Phones</h1>
              <p className="text-red-200/70 mt-1">Maximum power for demanding users</p>
            </div>
          </div>
          <p className="text-red-100/60 max-w-2xl text-sm md:text-base leading-relaxed mt-4">
            Ranked by processor capability, RAM capacity, and real-world benchmark performance.
            Ideal for gaming, video editing, and heavy multitasking.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex-1">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm text-gray-500 dark:text-gray-400">{phones.length} phones ranked by performance</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {phones.map((phone, index) => (
            <div key={phone.id} className="relative">
              {index < 3 && (
                <div className={`absolute -top-2 -left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg ${
                  index === 0 ? "bg-red-500" : index === 1 ? "bg-gray-400" : "bg-red-700"
                }`}>
                  #{index + 1}
                </div>
              )}
              <PhoneCard phone={phone} variant="default" />
            </div>
          ))}
        </div>

        <section className="mt-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">How We Rank Performance</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              Performance rankings consider processor generation and architecture, RAM capacity,
              storage speed (UFS version), GPU capabilities, and thermal management. We prioritize
              sustained performance over peak benchmarks.
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
          <Link href="/phones/best-battery-life" className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-sm dark:shadow-gray-900/30 transition-all">
            <Icon icon="mdi:battery-high" className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Best Battery</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Longest lasting phones</p>
            </div>
          </Link>
          <Link href="/phones/flagship" className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 hover:shadow-sm dark:shadow-gray-900/30 transition-all">
            <Icon icon="mdi:star" className="w-6 h-6 text-amber-500" />
            <div>
              <p className="font-semibold text-gray-900 dark:text-white text-sm">Flagship Phones</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Premium devices $1000+</p>
            </div>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
