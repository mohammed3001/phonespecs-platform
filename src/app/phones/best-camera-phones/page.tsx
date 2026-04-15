import prisma from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import PhoneCard from "@/components/public/PhoneCard";
import { JsonLd, generateItemListJsonLd, generateBreadcrumbJsonLd, generateCollectionPageJsonLd } from "@/lib/json-ld";
import { getSiteUrl } from "@/lib/site-url";
import { Icon } from "@iconify/react";

export const metadata: Metadata = {
  title: "Best Camera Phones 2025 - Top Smartphone Cameras Ranked",
  description: "Discover the best camera phones available right now. Ranked by camera resolution, sensor quality, and photography capabilities. Expert picks updated regularly.",
  alternates: {
    canonical: `${getSiteUrl()}/phones/best-camera-phones`,
  },
  openGraph: {
    title: "Best Camera Phones 2025 | MobilePlatform",
    description: "Discover the best camera phones available right now, ranked by camera quality.",
    url: `${getSiteUrl()}/phones/best-camera-phones`,
    type: "website",
    siteName: "MobilePlatform",
  },
  twitter: {
    card: "summary_large_image",
    title: "Best Camera Phones 2025 | MobilePlatform",
    description: "Top smartphone cameras ranked by resolution, sensor quality, and capabilities.",
  },
};

async function getBestCameraPhones() {
  return prisma.phone.findMany({
    where: {
      isPublished: true,
      marketStatus: { in: ["available", "coming_soon"] },
      specs: {
        some: {
          spec: { key: "main_camera" },
        },
      },
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

export default async function BestCameraPhonesPage() {
  const phones = await getBestCameraPhones();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <JsonLd data={[
        generateItemListJsonLd(
          phones.map((p, i) => ({ name: p.name, slug: p.slug, position: i + 1 })),
          "Best Camera Phones 2025",
          "Top smartphones ranked by camera quality"
        ),
        generateBreadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Phones", href: "/phones" },
          { name: "Best Camera Phones", href: "/phones/best-camera-phones" },
        ]),
        generateCollectionPageJsonLd(
          "Best Camera Phones 2025",
          "Top smartphones ranked by camera quality, resolution, and photography capabilities.",
          "/phones/best-camera-phones"
        ),
      ]} />
      <Header />

      {/* Hero */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_60%)]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16">
          <nav className="flex items-center gap-2 text-sm text-blue-200/60 mb-6">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            <Link href="/phones" className="hover:text-white transition-colors">Phones</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            <span className="text-white">Best Camera Phones</span>
          </nav>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-blue-500/20 rounded-2xl flex items-center justify-center">
              <Icon icon="mdi:camera" className="w-7 h-7 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white">Best Camera Phones</h1>
              <p className="text-blue-200/70 mt-1">Top smartphones for photography enthusiasts</p>
            </div>
          </div>
          <p className="text-blue-100/60 max-w-2xl text-sm md:text-base leading-relaxed mt-4">
            Our curated ranking of the best camera phones available right now. Evaluated based on camera resolution, 
            sensor quality, image processing, and real-world photography performance.
          </p>
        </div>
      </section>

      {/* Phone Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex-1">
        {phones.length === 0 ? (
          <div className="text-center py-20">
            <Icon icon="mdi:camera-off" className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-600">No phones found</h2>
            <p className="text-gray-400 mt-2">Check back soon for updated rankings.</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">{phones.length} phones ranked</p>
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

        {/* SEO Content */}
        <section className="mt-16 bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Rank Camera Phones</h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 leading-relaxed">
              Our camera phone rankings are based on a comprehensive evaluation of multiple factors including 
              main camera resolution, sensor size, aperture, image stabilization, video capabilities, and 
              computational photography features. We consider both hardware specifications and real-world 
              performance to provide the most accurate rankings.
            </p>
            <h3 className="text-lg font-semibold text-gray-800 mt-6 mb-2">Key Factors We Consider</h3>
            <ul className="text-gray-600 space-y-1">
              <li>Main camera megapixel count and sensor technology</li>
              <li>Optical zoom capabilities and lens quality</li>
              <li>Night mode and low-light performance</li>
              <li>Video recording resolution and stabilization</li>
              <li>Front camera quality for selfies and video calls</li>
              <li>AI-powered photography features and processing</li>
            </ul>
          </div>
        </section>

        {/* Related Categories */}
        <section className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link href="/phones/best-battery-life" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
            <Icon icon="mdi:battery-high" className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Best Battery Life</p>
              <p className="text-xs text-gray-500">Longest lasting phones</p>
            </div>
          </Link>
          <Link href="/phones/best-performance" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
            <Icon icon="mdi:speedometer" className="w-6 h-6 text-red-500" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Best Performance</p>
              <p className="text-xs text-gray-500">Most powerful phones</p>
            </div>
          </Link>
          <Link href="/phones/best-display" className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
            <Icon icon="mdi:cellphone" className="w-6 h-6 text-purple-500" />
            <div>
              <p className="font-semibold text-gray-900 text-sm">Best Display</p>
              <p className="text-xs text-gray-500">Top screen quality</p>
            </div>
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
