import prisma from "@/lib/prisma";
import Link from "next/link";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import PhoneCard from "@/components/public/PhoneCard";
import { SpecIcon } from "@/components/shared/SpecIcon";

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
    where: { isActive: true },
    orderBy: { phoneCount: "desc" },
    take: 8,
  });
}

async function getStats() {
  const [phoneCount, brandCount, specCount] = await Promise.all([
    prisma.phone.count({ where: { isPublished: true } }),
    prisma.brand.count({ where: { isActive: true } }),
    prisma.specDefinition.count(),
  ]);
  return { phoneCount, brandCount, specCount };
}

export default async function HomePage() {
  const [featuredPhones, latestPhones, brands, stats] = await Promise.all([
    getFeaturedPhones(),
    getLatestPhones(),
    getBrands(),
    getStats(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* ========== HERO SECTION ========== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950">
        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 mesh-gradient opacity-60" />
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-pattern" />
        {/* Floating decorative elements */}
        <div className="absolute top-20 right-[15%] w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-10 left-[10%] w-96 h-96 bg-violet-500/10 rounded-full blur-3xl animate-float-delayed" />
        <div className="absolute top-40 left-[30%] w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl animate-float-slow" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 md:py-28 lg:py-36">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-blue-200 text-sm mb-6">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Trusted by thousands of tech enthusiasts
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight">
              Your Ultimate{" "}
              <span className="bg-gradient-to-r from-blue-400 via-cyan-300 to-violet-400 bg-clip-text text-transparent">
                Smartphone
              </span>{" "}
              Resource
            </h1>
            <p className="mt-6 text-lg md:text-xl text-blue-100/80 max-w-xl leading-relaxed">
              Discover, compare, and choose the perfect smartphone. Full specifications, 
              expert reviews, and real user ratings — all in one place.
            </p>

            {/* Hero Search */}
            <div className="mt-10 max-w-xl">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
                <div className="relative flex items-center bg-white rounded-2xl shadow-2xl">
                  <svg className="w-5 h-5 text-gray-400 ml-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search any phone... (e.g., Galaxy S25, iPhone 16)"
                    className="flex-1 px-4 py-4 md:py-5 text-gray-900 placeholder-gray-400 bg-transparent outline-none text-base"
                    readOnly
                  />
                  <Link
                    href="/phones"
                    className="mr-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 text-white text-sm font-semibold rounded-xl hover:from-blue-700 hover:to-violet-700 transition-all shadow-lg shadow-blue-600/25"
                  >
                    Search
                  </Link>
                </div>
              </div>

              {/* Quick Filters */}
              <div className="flex flex-wrap gap-2 mt-5">
                {[
                  { label: "Flagship", href: "/phones?sort=price_desc" },
                  { label: "Best Camera", href: "/phones" },
                  { label: "Budget Picks", href: "/phones?sort=price_asc" },
                  { label: "Latest", href: "/phones?sort=newest" },
                ].map((filter) => (
                  <Link
                    key={filter.label}
                    href={filter.href}
                    className="px-4 py-1.5 rounded-full bg-white/10 border border-white/10 text-sm text-blue-100 hover:bg-white/20 hover:border-white/20 transition-all"
                  >
                    {filter.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== STATS BAR ========== */}
      <section className="relative -mt-6 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="bg-white rounded-2xl shadow-xl shadow-black/5 border border-gray-100 p-6 md:p-8">
            <div className="grid grid-cols-3 divide-x divide-gray-200">
              {[
                { value: `${stats.phoneCount}+`, label: "Phones Listed", icon: "mdi:cellphone" },
                { value: `${stats.brandCount}+`, label: "Global Brands", icon: "mdi:domain" },
                { value: `${stats.specCount}+`, label: "Spec Categories", icon: "mdi:format-list-checks" },
              ].map((stat) => (
                <div key={stat.label} className="text-center px-4">
                  <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-50 rounded-xl mb-2">
                    <SpecIcon specKey="" size={20} className="text-blue-600" />
                  </div>
                  <p className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                    {stat.value}
                  </p>
                  <p className="text-xs md:text-sm text-gray-500 mt-1 font-medium">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== BRANDS BAR ========== */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Browse by Brand</p>
          </div>
          <div className="flex items-center justify-center gap-3 md:gap-4 flex-wrap">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/phones?brand=${brand.slug}`}
                className="group flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-600/5 transition-all duration-300"
              >
                <div className="w-8 h-8 bg-gray-100 group-hover:bg-blue-50 rounded-lg flex items-center justify-center transition-colors">
                  <SpecIcon specKey="" size={18} className="text-gray-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{brand.name}</p>
                  <p className="text-[10px] text-gray-400">{brand.phoneCount} phones</p>
                </div>
              </Link>
            ))}
            <Link
              href="/brands"
              className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 text-sm font-medium text-gray-500 hover:text-blue-600 transition-all"
            >
              View All Brands
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ========== FEATURED PHONES ========== */}
      {featuredPhones.length > 0 && (
        <section className="py-12 md:py-16 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold mb-3">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Editor&apos;s Choice
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                  Featured Phones
                </h2>
                <p className="text-gray-500 mt-2 text-lg">Our top picks and recommendations</p>
              </div>
              <Link
                href="/phones"
                className="hidden md:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700 transition-colors"
              >
                View All
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredPhones.map((phone) => (
                <PhoneCard key={phone.id} phone={phone} variant="featured" />
              ))}
            </div>
            <div className="mt-8 text-center md:hidden">
              <Link href="/phones" className="inline-flex items-center gap-1.5 text-blue-600 font-semibold text-sm">
                View All Phones
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ========== LATEST PHONES ========== */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-xs font-semibold mb-3">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                Just Added
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Latest Phones
              </h2>
              <p className="text-gray-500 mt-2 text-lg">Recently added to our database</p>
            </div>
            <Link
              href="/phones?sort=newest"
              className="hidden md:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700 transition-colors"
            >
              View All
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {latestPhones.map((phone) => (
              <PhoneCard key={phone.id} phone={phone} />
            ))}
          </div>
        </div>
      </section>

      {/* ========== COMPARE CTA ========== */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-700 to-violet-700 p-8 md:p-14">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />

            <div className="relative flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Can&apos;t decide?
                  <br />
                  <span className="text-blue-200">Compare side by side.</span>
                </h2>
                <p className="mt-4 text-blue-100/80 text-lg max-w-lg">
                  Put up to 4 phones head-to-head and compare every specification 
                  to find the perfect match for your needs.
                </p>
                <Link
                  href="/compare"
                  className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-xl shadow-black/10"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Compare Phones Now
                </Link>
              </div>
              <div className="flex-shrink-0 hidden md:flex gap-4">
                <div className="w-40 h-52 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center text-5xl">
                  📱
                </div>
                <div className="w-6 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white/50">vs</span>
                </div>
                <div className="w-40 h-52 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 flex items-center justify-center text-5xl">
                  📱
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========== QUICK LINKS ========== */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              Explore the Platform
            </h2>
            <p className="text-gray-500 mt-2 text-lg">Everything you need, all in one place</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                title: "Full Specifications",
                desc: "Detailed specs for every phone with comparisons and filters",
                icon: "mdi:format-list-bulleted-square",
                href: "/phones",
                color: "from-blue-500 to-blue-600",
              },
              {
                title: "Compare Phones",
                desc: "Side-by-side comparison of up to 4 phones at once",
                icon: "mdi:compare",
                href: "/compare",
                color: "from-violet-500 to-violet-600",
              },
              {
                title: "Brand Directory",
                desc: "Browse phones by manufacturer with detailed brand profiles",
                icon: "mdi:domain",
                href: "/brands",
                color: "from-emerald-500 to-emerald-600",
              },
              {
                title: "News & Reviews",
                desc: "Latest smartphone news, expert reviews, and industry insights",
                icon: "mdi:newspaper-variant-outline",
                href: "/news",
                color: "from-amber-500 to-amber-600",
              },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="group">
                <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg mb-4`}>
                    <SpecIcon specKey="" size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 mt-2 leading-relaxed">{item.desc}</p>
                  <div className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-blue-600 group-hover:gap-2 transition-all">
                    Explore
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== NEWSLETTER CTA ========== */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-3xl p-8 md:p-14 text-center">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">
              Stay Updated with the Latest
            </h2>
            <p className="mt-3 text-gray-400 max-w-lg mx-auto">
              Get notified about new phone releases, price drops, and exclusive reviews 
              delivered straight to your inbox.
            </p>
            <div className="mt-8 max-w-md mx-auto flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3.5 rounded-xl bg-white/10 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <button className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/25">
                Subscribe
              </button>
            </div>
            <p className="mt-4 text-xs text-gray-500">No spam. Unsubscribe at any time.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
