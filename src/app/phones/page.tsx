import prisma from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import PhoneCard from "@/components/public/PhoneCard";
import { JsonLd, generateCollectionPageJsonLd, generateBreadcrumbJsonLd } from "@/lib/json-ld";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "All Phones - Compare Specifications & Prices",
  description: "Browse all smartphones with full specifications, prices, and reviews. Filter by brand, sort by price, and find the perfect phone.",
  alternates: {
    canonical: `${getSiteUrl()}/phones`,
  },
  openGraph: {
    title: "All Phones - Compare Specifications & Prices | MobilePlatform",
    description: "Browse all smartphones with full specifications, prices, and reviews.",
    url: `${getSiteUrl()}/phones`,
    type: "website",
    siteName: "MobilePlatform",
  },
  twitter: {
    card: "summary",
    title: "All Phones | MobilePlatform",
    description: "Browse all smartphones with full specifications, prices, and reviews.",
  },
};

async function getPhones(searchParams: Record<string, string | undefined>) {
  const page = parseInt(searchParams.page || "1");
  const limit = 12;
  const skip = (page - 1) * limit;
  const brand = searchParams.brand;
  const sort = searchParams.sort || "newest";
  const q = searchParams.q;

  const where: Record<string, unknown> = { isPublished: true };
  if (brand) where.brand = { slug: brand };
  if (q) where.name = { contains: q };

  let orderBy: Record<string, string> = {};
  switch (sort) {
    case "price_asc": orderBy = { priceUsd: "asc" }; break;
    case "price_desc": orderBy = { priceUsd: "desc" }; break;
    case "name": orderBy = { name: "asc" }; break;
    case "popular": orderBy = { viewCount: "desc" }; break;
    default: orderBy = { createdAt: "desc" };
  }

  const [phones, total] = await Promise.all([
    prisma.phone.findMany({
      where,
      include: {
        brand: { select: { name: true, slug: true } },
        specs: {
          include: { spec: { include: { group: true } } },
          where: { spec: { showInCard: true } },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.phone.count({ where }),
  ]);

  return { phones, total, page, totalPages: Math.ceil(total / limit) };
}

async function getBrands() {
  return prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { phoneCount: "desc" },
  });
}

export default async function PhonesPage({
  searchParams,
}: {
  searchParams: Record<string, string | undefined>;
}) {
  const [{ phones, total, page, totalPages }, brands] = await Promise.all([
    getPhones(searchParams),
    getBrands(),
  ]);

  const currentBrand = searchParams.brand;
  const currentSort = searchParams.sort || "newest";
  const currentQ = searchParams.q || "";

  const sortOptions = [
    { key: "newest", label: "Newest First", icon: "mdi:clock-outline" },
    { key: "price_asc", label: "Price: Low to High", icon: "mdi:sort-ascending" },
    { key: "price_desc", label: "Price: High to Low", icon: "mdi:sort-descending" },
    { key: "popular", label: "Most Popular", icon: "mdi:trending-up" },
    { key: "name", label: "Name A-Z", icon: "mdi:sort-alphabetical-ascending" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <JsonLd data={[
        generateCollectionPageJsonLd("All Smartphones", "Browse all smartphones with full specifications, prices, and reviews.", "/phones"),
        generateBreadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "Phones", href: "/phones" },
        ]),
      ]} />
      <Header />

      {/* Page Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
          <nav className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            {currentBrand ? (
              <>
                <Link href="/phones" className="hover:text-blue-600 transition-colors">Phones</Link>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                <span className="text-gray-900 font-medium capitalize">{brands.find((b) => b.slug === currentBrand)?.name || currentBrand}</span>
              </>
            ) : (
              <span className="text-gray-900 font-medium">All Phones</span>
            )}
          </nav>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                {currentBrand
                  ? `${brands.find((b) => b.slug === currentBrand)?.name || currentBrand} Phones`
                  : currentQ ? `Search: "${currentQ}"` : "All Phones"}
              </h1>
              <p className="text-gray-500 mt-1.5 text-base">{total} phones found</p>
            </div>
            {/* Search */}
            <div className="max-w-sm w-full">
              <form action="/phones" method="get" className="relative">
                {currentBrand && <input type="hidden" name="brand" value={currentBrand} />}
                <input type="hidden" name="sort" value={currentSort} />
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  name="q"
                  defaultValue={currentQ}
                  placeholder="Search phones..."
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm sticky top-24 overflow-hidden">
              {/* Brands */}
              <div className="p-5 border-b">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-3">Brands</h3>
                <div className="space-y-0.5">
                  <Link
                    href={`/phones?sort=${currentSort}${currentQ ? `&q=${currentQ}` : ""}`}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${!currentBrand ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                  >
                    <span>All Brands</span>
                    {!currentBrand && (
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                    )}
                  </Link>
                  {brands.filter(b => b.phoneCount > 0).map((brand) => (
                    <Link
                      key={brand.id}
                      href={`/phones?brand=${brand.slug}&sort=${currentSort}${currentQ ? `&q=${currentQ}` : ""}`}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${currentBrand === brand.slug ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                    >
                      <span>{brand.name}</span>
                      <span className="text-xs text-gray-400 tabular-nums">{brand.phoneCount}</span>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Sort By */}
              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-3">Sort By</h3>
                <div className="space-y-0.5">
                  {sortOptions.map(({ key, label }) => (
                    <Link
                      key={key}
                      href={`/phones?${currentBrand ? `brand=${currentBrand}&` : ""}sort=${key}${currentQ ? `&q=${currentQ}` : ""}`}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all ${currentSort === key ? "bg-blue-50 text-blue-700 font-semibold" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"}`}
                    >
                      <span>{label}</span>
                      {currentSort === key && (
                        <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Phone Grid */}
          <div className="flex-1">
            {phones.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                  📱
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">No phones found</h3>
                <p className="text-sm text-gray-500 mb-6">Try adjusting your filters or search query</p>
                <Link href="/phones" className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                  Clear Filters
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {phones.map((phone) => (
                  <PhoneCard key={phone.id} phone={phone} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                {page > 1 && (
                  <Link
                    href={`/phones?${currentBrand ? `brand=${currentBrand}&` : ""}sort=${currentSort}&page=${page - 1}${currentQ ? `&q=${currentQ}` : ""}`}
                    className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                  >
                    Previous
                  </Link>
                )}
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const p = i + 1;
                  return (
                    <Link
                      key={p}
                      href={`/phones?${currentBrand ? `brand=${currentBrand}&` : ""}sort=${currentSort}&page=${p}${currentQ ? `&q=${currentQ}` : ""}`}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl text-sm font-medium transition-all ${
                        page === p
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25"
                          : "bg-white border border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {p}
                    </Link>
                  );
                })}
                {page < totalPages && (
                  <Link
                    href={`/phones?${currentBrand ? `brand=${currentBrand}&` : ""}sort=${currentSort}&page=${page + 1}${currentQ ? `&q=${currentQ}` : ""}`}
                    className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
