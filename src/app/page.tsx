import prisma from "@/lib/prisma";
import Link from "next/link";

async function getFeaturedPhones() {
  return prisma.phone.findMany({
    where: { isPublished: true, isFeatured: true },
    include: {
      brand: { select: { name: true, slug: true } },
      specs: {
        include: { spec: { include: { group: true } } },
        where: { spec: { showInCard: true } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 6,
  });
}

async function getLatestPhones() {
  return prisma.phone.findMany({
    where: { isPublished: true },
    include: {
      brand: { select: { name: true, slug: true } },
      specs: {
        include: { spec: { include: { group: true } } },
        where: { spec: { showInCard: true } },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 8,
  });
}

async function getBrands() {
  return prisma.brand.findMany({
    where: { isActive: true, phoneCount: { gt: 0 } },
    orderBy: { phoneCount: "desc" },
    take: 8,
  });
}

const specIconMap: Record<string, string> = {
  storage: "💾",
  ram: "🧠",
  main_camera: "📷",
  front_camera: "🤳",
  display_size: "📺",
  battery: "🔋",
  fingerprint_sensor: "👆",
  charger: "⚡",
  resistance_rating: "💧",
  wifi: "📶",
  glass_protection: "🛡️",
  bluetooth: "📡",
};

function PhoneCard({ phone }: { phone: Awaited<ReturnType<typeof getFeaturedPhones>>[0] }) {
  const keySpecs = phone.specs
    .filter((s) => s.spec.isHighlighted)
    .sort((a, b) => a.spec.sortOrder - b.spec.sortOrder);

  const extraSpecs = phone.specs
    .filter((s) => s.spec.showInCard && !s.spec.isHighlighted)
    .sort((a, b) => a.spec.sortOrder - b.spec.sortOrder);

  const statusColors: Record<string, string> = {
    available: "text-green-600 bg-green-50",
    coming_soon: "text-amber-600 bg-amber-50",
    discontinued: "text-gray-500 bg-gray-100",
  };

  return (
    <Link href={`/phones/${phone.slug}`} className="block">
      <div className="bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 overflow-hidden group">
        {/* Header */}
        <div className="p-5">
          <div className="flex gap-4">
            {/* Phone Image Placeholder */}
            <div className="w-24 h-32 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center text-4xl flex-shrink-0 group-hover:scale-105 transition-transform">
              📱
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-gray-900 text-lg leading-tight group-hover:text-blue-600 transition-colors">
                {phone.name}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="text-lg font-bold text-blue-600">
                  {phone.priceDisplay || (phone.priceUsd ? `$${phone.priceUsd.toLocaleString()}` : "TBA")}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[phone.marketStatus] || "text-gray-500 bg-gray-100"}`}>
                  {phone.marketStatus.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                </span>
              </div>
              {phone.reviewScore > 0 && (
                <div className="mt-1 flex items-center gap-1">
                  <span className="text-yellow-500 text-sm">⭐</span>
                  <span className="text-sm font-semibold text-gray-700">{phone.reviewScore.toFixed(1)}</span>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">
                Updated: {new Date(phone.updatedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        {/* Key Specs */}
        {keySpecs.length > 0 && (
          <div className="px-5 pb-3">
            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Key Specs</p>
              <div className="grid grid-cols-3 gap-2">
                {keySpecs.map((s) => (
                  <div key={s.spec.key} className="flex items-center gap-1.5 text-sm">
                    <span className="text-base">{specIconMap[s.spec.key] || "📌"}</span>
                    <span className="text-gray-700 font-medium truncate">
                      {s.value}{s.spec.unit ? s.spec.unit : ""}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Extra Specs */}
        {extraSpecs.length > 0 && (
          <div className="px-5 pb-4">
            <div className="border-t pt-3">
              <div className="grid grid-cols-3 gap-2">
                {extraSpecs.map((s) => (
                  <div key={s.spec.key} className="flex items-center gap-1.5 text-xs">
                    <span className="text-sm">{specIconMap[s.spec.key] || "📌"}</span>
                    <span className="text-gray-600 truncate">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const [featuredPhones, latestPhones, brands] = await Promise.all([
    getFeaturedPhones(),
    getLatestPhones(),
    getBrands(),
  ]);

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
              <Link href="/phones" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Phones</Link>
              <Link href="/compare" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Compare</Link>
              <Link href="/news" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">News</Link>
              <Link href="/brands" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors">Brands</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/search" className="p-2 text-gray-500 hover:text-blue-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </Link>
              <Link href="/admin" className="text-sm text-gray-500 hover:text-blue-600 hidden md:inline">Admin</Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-4">
              Your Ultimate Smartphone Resource
            </h1>
            <p className="text-lg text-blue-100 mb-8">
              Discover, compare, and choose the perfect smartphone. Full specifications, expert reviews, and real user ratings.
            </p>
            {/* Search Bar */}
            <div className="relative max-w-xl">
              <input
                type="text"
                placeholder="Search phones... (e.g., Samsung Galaxy S24)"
                className="w-full px-5 py-4 pr-12 rounded-2xl text-gray-900 bg-white shadow-lg placeholder-gray-400 focus:outline-none focus:ring-4 focus:ring-blue-300"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Bar */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/phones?brand=${brand.slug}`}
                className="flex-shrink-0 px-4 py-2 rounded-full border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                {brand.name}
                <span className="ml-1 text-gray-400 text-xs">({brand.phoneCount})</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Phones */}
      {featuredPhones.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Featured Phones</h2>
              <p className="text-gray-500 mt-1">Top picks and editor&apos;s choice</p>
            </div>
            <Link href="/phones" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredPhones.map((phone) => (
              <PhoneCard key={phone.id} phone={phone} />
            ))}
          </div>
        </section>
      )}

      {/* Latest Phones */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Latest Phones</h2>
              <p className="text-gray-500 mt-1">Recently added to our database</p>
            </div>
            <Link href="/phones" className="text-sm font-medium text-blue-600 hover:text-blue-800">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {latestPhones.map((phone) => (
              <PhoneCard key={phone.id} phone={phone} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold text-white mb-4">
                <span className="text-blue-400">Mobile</span>Platform
              </h3>
              <p className="text-sm">Your ultimate destination for smartphone specifications, reviews, and comparisons.</p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">Explore</h4>
              <ul className="space-y-2">
                <li><Link href="/phones" className="text-sm hover:text-white transition-colors">All Phones</Link></li>
                <li><Link href="/brands" className="text-sm hover:text-white transition-colors">Brands</Link></li>
                <li><Link href="/compare" className="text-sm hover:text-white transition-colors">Compare</Link></li>
                <li><Link href="/news" className="text-sm hover:text-white transition-colors">News</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-sm hover:text-white transition-colors">About Us</Link></li>
                <li><Link href="/contact" className="text-sm hover:text-white transition-colors">Contact</Link></li>
                <li><Link href="/advertise" className="text-sm hover:text-white transition-colors">Advertise</Link></li>
                <li><Link href="/privacy" className="text-sm hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">For Business</h4>
              <ul className="space-y-2">
                <li><Link href="/company" className="text-sm hover:text-white transition-colors">Company Portal</Link></li>
                <li><Link href="/advertise" className="text-sm hover:text-white transition-colors">Advertising</Link></li>
                <li><Link href="/api-docs" className="text-sm hover:text-white transition-colors">API Access</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; {new Date().getFullYear()} MobilePlatform. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
