import prisma from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";

export const metadata: Metadata = {
  title: "All Brands - MobilePlatform",
  description: "Browse all smartphone brands and manufacturers with detailed profiles.",
};

async function getBrands() {
  return prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { phoneCount: "desc" },
  });
}

export default async function BrandsPage() {
  const brands = await getBrands();

  const totalPhones = brands.reduce((sum, b) => sum + b.phoneCount, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Page Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="absolute inset-0 grid-pattern" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Smartphone Brands
          </h1>
          <p className="text-blue-200/80 mt-3 text-lg max-w-xl mx-auto">
            Browse all {brands.length} brands with {totalPhones} phones in our database
          </p>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/phones?brand=${brand.slug}`}
              className="group"
            >
              <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:shadow-blue-600/5 hover:border-blue-200 hover:-translate-y-1 transition-all duration-300 h-full">
                {/* Brand Icon */}
                <div className="w-16 h-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center mb-4 group-hover:from-blue-50 group-hover:to-violet-50 transition-colors">
                  <span className="text-3xl font-black text-gray-300 group-hover:text-blue-400 transition-colors">
                    {brand.name.charAt(0)}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {brand.name}
                </h3>

                {brand.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{brand.description}</p>
                )}

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    <span className="font-semibold text-gray-700">{brand.phoneCount}</span> phones
                  </span>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    View
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      <Footer />
    </div>
  );
}
