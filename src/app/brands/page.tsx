import Link from "next/link";
import prisma from "@/lib/prisma";

async function getBrands() {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { phoneCount: "desc" },
  });
  return brands;
}

export const metadata = {
  title: "All Brands - MobilePlatform",
  description: "Browse all smartphone brands and manufacturers. Find phones by brand.",
};

export default async function BrandsPage() {
  const brands = await getBrands();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold">
              <span className="text-blue-600">Mobile</span>Platform
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/phones" className="text-gray-600 hover:text-blue-600">Phones</Link>
              <Link href="/brands" className="text-blue-600 font-medium">Brands</Link>
              <Link href="/compare" className="text-gray-600 hover:text-blue-600">Compare</Link>
              <Link href="/news" className="text-gray-600 hover:text-blue-600">News</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">All Brands</h1>
          <p className="text-gray-500 mt-2">Browse {brands.length} smartphone brands and manufacturers</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {brands.map((brand) => (
            <Link
              key={brand.id}
              href={`/phones?brand=${brand.slug}`}
              className="bg-white rounded-xl border p-6 hover:shadow-lg transition-all hover:-translate-y-0.5 group text-center"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4 group-hover:bg-blue-50 transition-colors">
                🏢
              </div>
              <h3 className="font-bold text-gray-900 text-lg group-hover:text-blue-600 transition-colors">{brand.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{brand.phoneCount} phones</p>
              {brand.description && (
                <p className="text-xs text-gray-400 mt-2 line-clamp-2">{brand.description}</p>
              )}
            </Link>
          ))}
        </div>
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} MobilePlatform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
