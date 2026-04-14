import prisma from "@/lib/prisma";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Phones - MobilePlatform",
  description: "Browse all smartphones with full specifications, prices, and reviews.",
};

const specIconMap: Record<string, string> = {
  storage: "💾", ram: "🧠", main_camera: "📷", front_camera: "🤳",
  display_size: "📺", battery: "🔋", fingerprint_sensor: "👆", charger: "⚡",
  resistance_rating: "💧", wifi: "📶", glass_protection: "🛡️", bluetooth: "📡",
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold">
              <span className="text-blue-600">Mobile</span>Platform
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/phones" className="text-sm font-medium text-blue-600">Phones</Link>
              <Link href="/compare" className="text-sm font-medium text-gray-700 hover:text-blue-600">Compare</Link>
              <Link href="/news" className="text-sm font-medium text-gray-700 hover:text-blue-600">News</Link>
              <Link href="/brands" className="text-sm font-medium text-gray-700 hover:text-blue-600">Brands</Link>
            </nav>
            <Link href="/admin" className="text-sm text-gray-500 hover:text-blue-600 hidden md:inline">Admin</Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {currentBrand
              ? `${brands.find((b) => b.slug === currentBrand)?.name || currentBrand} Phones`
              : "All Phones"}
          </h1>
          <p className="text-gray-500 mt-1">{total} phones found</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="bg-white rounded-xl border p-5 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-3">Brands</h3>
              <div className="space-y-1">
                <Link
                  href="/phones"
                  className={`block px-3 py-2 rounded-lg text-sm ${!currentBrand ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                >
                  All Brands
                </Link>
                {brands.map((brand) => (
                  <Link
                    key={brand.id}
                    href={`/phones?brand=${brand.slug}`}
                    className={`block px-3 py-2 rounded-lg text-sm ${currentBrand === brand.slug ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    {brand.name}
                    <span className="text-gray-400 ml-1">({brand.phoneCount})</span>
                  </Link>
                ))}
              </div>

              <h3 className="font-semibold text-gray-900 mt-6 mb-3">Sort By</h3>
              <div className="space-y-1">
                {[
                  { key: "newest", label: "Newest First" },
                  { key: "price_asc", label: "Price: Low to High" },
                  { key: "price_desc", label: "Price: High to Low" },
                  { key: "popular", label: "Most Popular" },
                  { key: "name", label: "Name A-Z" },
                ].map(({ key, label }) => (
                  <Link
                    key={key}
                    href={`/phones?${currentBrand ? `brand=${currentBrand}&` : ""}sort=${key}`}
                    className={`block px-3 py-2 rounded-lg text-sm ${currentSort === key ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </aside>

          {/* Phone Grid */}
          <div className="flex-1">
            {phones.length === 0 ? (
              <div className="bg-white rounded-xl border p-12 text-center">
                <p className="text-xl text-gray-400 mb-2">No phones found</p>
                <p className="text-sm text-gray-500">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {phones.map((phone) => {
                  const keySpecs = phone.specs
                    .filter((s) => s.spec.isHighlighted)
                    .sort((a, b) => a.spec.sortOrder - b.spec.sortOrder);
                  const extraSpecs = phone.specs
                    .filter((s) => s.spec.showInCard && !s.spec.isHighlighted)
                    .sort((a, b) => a.spec.sortOrder - b.spec.sortOrder);

                  return (
                    <Link key={phone.id} href={`/phones/${phone.slug}`} className="block">
                      <div className="bg-white rounded-2xl border hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden group">
                        <div className="p-5">
                          <div className="flex gap-4">
                            <div className="w-20 h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 group-hover:scale-105 transition-transform">
                              📱
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors">
                                {phone.name}
                              </h3>
                              <p className="text-lg font-bold text-blue-600 mt-1">
                                {phone.priceDisplay || (phone.priceUsd ? `$${phone.priceUsd.toLocaleString()}` : "TBA")}
                              </p>
                              <p className="text-xs text-gray-400 mt-1">
                                {phone.marketStatus.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                              </p>
                            </div>
                          </div>
                        </div>
                        {keySpecs.length > 0 && (
                          <div className="px-5 pb-3 border-t">
                            <div className="pt-3 grid grid-cols-3 gap-2">
                              {keySpecs.map((s) => (
                                <div key={s.spec.key} className="flex items-center gap-1 text-xs">
                                  <span>{specIconMap[s.spec.key] || "📌"}</span>
                                  <span className="text-gray-700 font-medium truncate">{s.value}{s.spec.unit || ""}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        {extraSpecs.length > 0 && (
                          <div className="px-5 pb-4 border-t">
                            <div className="pt-3 grid grid-cols-3 gap-2">
                              {extraSpecs.map((s) => (
                                <div key={s.spec.key} className="flex items-center gap-1 text-xs">
                                  <span className="text-sm">{specIconMap[s.spec.key] || "📌"}</span>
                                  <span className="text-gray-500 truncate">{s.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {page > 1 && (
                  <Link
                    href={`/phones?${currentBrand ? `brand=${currentBrand}&` : ""}sort=${currentSort}&page=${page - 1}`}
                    className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
                  >
                    Previous
                  </Link>
                )}
                <span className="px-4 py-2 text-sm text-gray-500">
                  Page {page} of {totalPages}
                </span>
                {page < totalPages && (
                  <Link
                    href={`/phones?${currentBrand ? `brand=${currentBrand}&` : ""}sort=${currentSort}&page=${page + 1}`}
                    className="px-4 py-2 bg-white border rounded-lg text-sm hover:bg-gray-50"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-gray-400 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} MobilePlatform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
