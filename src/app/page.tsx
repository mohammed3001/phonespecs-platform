import prisma from "@/lib/prisma";
import Link from "next/link";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import PhoneCard from "@/components/public/PhoneCard";
import { SpecIcon } from "@/components/shared/SpecIcon";
import { JsonLd, generateWebsiteJsonLd, generateOrganizationJsonLd } from "@/lib/json-ld";

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <JsonLd data={[generateWebsiteJsonLd(), generateOrganizationJsonLd()]} />
      <Header />

      {/* ========== HERO SECTION ========== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50 via-white to-gray-50 dark:from-[#0a0e1a] dark:via-[#0d1224] dark:to-[#0a0e1a]">
        {/* Subtle dot grid — light mode */}
        <div className="absolute inset-0 hero-dots dark:hidden" />
        {/* Dark mode glass mesh */}
        <div className="absolute inset-0 hidden dark:block">
          <div className="absolute inset-0 hero-grid-dark" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-b from-cyan-500/[0.07] via-teal-500/[0.04] to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[300px] bg-gradient-to-tl from-emerald-500/[0.05] to-transparent rounded-full blur-3xl" />
        </div>
        {/* Light mode accent glow */}
        <div className="absolute top-0 right-1/4 w-[500px] h-[400px] bg-gradient-to-b from-teal-100/40 to-transparent rounded-full blur-3xl dark:hidden" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 md:pt-24 md:pb-28 lg:pt-32 lg:pb-36">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Column — Content */}
            <div className="max-w-xl lg:max-w-none">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-white/[0.05] dark:backdrop-blur-md border border-teal-200/60 dark:border-white/[0.08] text-teal-700 dark:text-teal-300 text-xs font-medium mb-6">
                <span className="w-1.5 h-1.5 bg-teal-500 dark:bg-teal-400 rounded-full animate-pulse" />
                Trusted by tech enthusiasts worldwide
              </div>

              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.08] tracking-tight text-gray-900 dark:text-white">
                Every Spec.{" "}
                <span className="hero-gradient-text">
                  Every Phone.
                </span>
                <br />
                One Platform.
              </h1>

              {/* Subtitle */}
              <p className="mt-5 text-base md:text-lg text-gray-500 dark:text-gray-400 leading-relaxed max-w-lg">
                Full specifications, side-by-side comparisons, and expert reviews for every smartphone on the market.
              </p>

              {/* Search Bar */}
              <div className="mt-8 max-w-lg">
                <Link href="/search" className="block group">
                  <div className="relative">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-cyan-400 dark:from-teal-500/30 dark:to-cyan-500/30 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                    <div className="relative flex items-center bg-white dark:bg-white/[0.06] dark:backdrop-blur-xl border border-gray-200 dark:border-white/[0.1] rounded-2xl shadow-sm dark:shadow-none px-5 py-4 transition-all group-hover:border-teal-300 dark:group-hover:border-white/[0.15]">
                      <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <span className="text-gray-400 dark:text-gray-500 text-sm md:text-base">Search phones, brands, specs...</span>
                      <div className="ml-auto flex items-center gap-1.5">
                        <kbd className="hidden sm:inline-flex px-2 py-0.5 bg-gray-100 dark:bg-white/[0.08] border border-gray-200 dark:border-white/[0.1] rounded-md text-[11px] text-gray-400 dark:text-gray-500 font-mono">Ctrl</kbd>
                        <kbd className="hidden sm:inline-flex px-2 py-0.5 bg-gray-100 dark:bg-white/[0.08] border border-gray-200 dark:border-white/[0.1] rounded-md text-[11px] text-gray-400 dark:text-gray-500 font-mono">K</kbd>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {[
                    { label: "Flagship", href: "/phones?sort=price_desc", icon: "M13 10V3L4 14h7v7l9-11h-7z" },
                    { label: "Best Camera", href: "/phones", icon: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" },
                    { label: "Under $300", href: "/phones/under/300", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
                    { label: "Newest", href: "/phones?sort=newest", icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" },
                  ].map((filter) => (
                    <Link
                      key={filter.label}
                      href={filter.href}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-100 dark:bg-white/[0.05] border border-gray-200/60 dark:border-white/[0.08] text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-teal-50 hover:text-teal-700 hover:border-teal-200 dark:hover:bg-white/[0.08] dark:hover:text-teal-300 dark:hover:border-white/[0.12] transition-all"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d={filter.icon} />
                      </svg>
                      {filter.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column — Stats Cards (glassmorphism) */}
            <div className="hidden lg:grid grid-cols-2 gap-4">
              {[
                { value: `${stats.phoneCount}+`, label: "Phones Listed", icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z", accent: "from-teal-500 to-cyan-500" },
                { value: `${stats.brandCount}+`, label: "Global Brands", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4", accent: "from-emerald-500 to-teal-500" },
                { value: `${stats.specCount}+`, label: "Spec Points", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4", accent: "from-cyan-500 to-blue-500" },
                { value: "Free", label: "Always Free", icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z", accent: "from-rose-400 to-pink-500" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="group relative bg-white/80 dark:bg-white/[0.04] backdrop-blur-lg border border-gray-200/60 dark:border-white/[0.08] rounded-2xl p-5 hover:border-gray-300 dark:hover:border-white/[0.14] transition-all duration-300"
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.accent} flex items-center justify-center mb-3 shadow-lg shadow-teal-500/10 dark:shadow-none`}>
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={stat.icon} />
                    </svg>
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{stat.value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Stats Row */}
          <div className="grid grid-cols-3 gap-3 mt-12 lg:hidden">
            {[
              { value: `${stats.phoneCount}+`, label: "Phones" },
              { value: `${stats.brandCount}+`, label: "Brands" },
              { value: `${stats.specCount}+`, label: "Specs" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="text-center py-4 px-3 bg-white/80 dark:bg-white/[0.04] backdrop-blur-lg border border-gray-200/60 dark:border-white/[0.08] rounded-xl"
              >
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
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
                className="group flex items-center gap-2.5 px-5 py-3 rounded-xl bg-white dark:bg-white/[0.04] dark:backdrop-blur-lg border border-gray-200 dark:border-white/[0.08] hover:border-teal-300 dark:hover:border-white/[0.14] hover:shadow-lg hover:shadow-teal-600/5 transition-all duration-300"
              >
                <div className="w-8 h-8 bg-gray-100 dark:bg-white/[0.06] group-hover:bg-teal-50 dark:group-hover:bg-teal-500/10 rounded-lg flex items-center justify-center transition-colors">
                  <SpecIcon specKey="" size={18} className="text-gray-400 group-hover:text-teal-500 transition-colors" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">{brand.name}</p>
                  <p className="text-[10px] text-gray-400">{brand.phoneCount} phones</p>
                </div>
              </Link>
            ))}
            <Link
              href="/brands"
              className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-teal-400 dark:hover:border-teal-500/40 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-teal-600 dark:hover:text-teal-400 transition-all"
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
        <section className="py-12 md:py-16 bg-white dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold mb-3">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  Editor&apos;s Choice
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                  Featured Phones
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Our top picks and recommendations</p>
              </div>
              <Link
                href="/phones"
                className="hidden md:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors"
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
              <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                Latest Phones
              </h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Recently added to our database</p>
            </div>
            <Link
              href="/phones?sort=newest"
              className="hidden md:inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-sm font-semibold text-gray-700 dark:text-gray-200 transition-colors"
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
      <section className="py-12 md:py-16 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-cyan-800 dark:from-white/[0.05] dark:via-white/[0.03] dark:to-white/[0.02] dark:backdrop-blur-xl dark:border dark:border-white/[0.08] p-8 md:p-14">
            {/* Decorative */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-white dark:bg-gray-800/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white dark:bg-gray-800/5 rounded-full translate-y-1/2 -translate-x-1/3" />

            <div className="relative flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                  Can&apos;t decide?
                  <br />
                  <span className="text-teal-200 dark:text-teal-400">Compare side by side.</span>
                </h2>
                <p className="mt-4 text-teal-100/80 dark:text-gray-400 text-lg max-w-lg">
                  Put up to 4 phones head-to-head and compare every specification 
                  to find the perfect match for your needs.
                </p>
                <Link
                  href="/compare"
                  className="mt-8 inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-white/[0.08] dark:backdrop-blur-lg text-teal-700 dark:text-teal-300 font-bold rounded-xl hover:bg-teal-50 dark:hover:bg-white/[0.12] transition-colors shadow-xl shadow-black/10 dark:shadow-none dark:border dark:border-white/[0.1]"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Compare Phones Now
                </Link>
              </div>
              <div className="flex-shrink-0 hidden md:flex gap-4">
                <div className="w-40 h-52 bg-white/10 dark:bg-white/[0.05] backdrop-blur-sm rounded-2xl border border-white/20 dark:border-white/[0.08] flex items-center justify-center text-5xl">
                  📱
                </div>
                <div className="w-6 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white/50 dark:text-gray-600">vs</span>
                </div>
                <div className="w-40 h-52 bg-white/10 dark:bg-white/[0.05] backdrop-blur-sm rounded-2xl border border-white/20 dark:border-white/[0.08] flex items-center justify-center text-5xl">
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
            <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
              Explore the Platform
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2 text-lg">Everything you need, all in one place</p>
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
                <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-xl hover:shadow-black/5 hover:-translate-y-1 transition-all duration-300 h-full">
                  <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-lg mb-4`}>
                    <SpecIcon specKey="" size={24} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 leading-relaxed">{item.desc}</p>
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
      <section className="py-12 md:py-16 bg-white dark:bg-gray-800">
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
                className="flex-1 px-5 py-3.5 rounded-xl bg-white dark:bg-gray-800/10 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <button className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-600/25">
                Subscribe
              </button>
            </div>
            <p className="mt-4 text-xs text-gray-500 dark:text-gray-400">No spam. Unsubscribe at any time.</p>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
