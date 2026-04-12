'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PhoneCard } from '@/components/phone/PhoneCard';
import { SponsoredBanner } from '@/components/ads/SponsoredBanner';
import { brands, getFeaturedPhones, getLatestPhones, sponsoredAds } from '@/data/mock-phones';

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const featuredPhones = getFeaturedPhones();
  const latestPhones = getLatestPhones(6);
  const bannerAd = sponsoredAds.find((a) => a.type === 'banner');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-brand-300 rounded-full blur-3xl" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-balance">
            Find Your Perfect <br className="hidden sm:block" />
            <span className="text-brand-200">Smartphone</span>
          </h1>
          <p className="text-lg text-brand-100 mb-8 max-w-2xl mx-auto">
            Search, compare, and discover detailed specifications for thousands of mobile phones from all major brands.
          </p>

          {/* Search bar */}
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-1.5 border border-white/20">
              <div className="relative">
                <Icon
                  icon="mdi:magnify"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50"
                  width={24}
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search phones, brands, specs... (e.g. Honor X8d, 108MP camera)"
                  className="w-full pl-12 pr-32 py-4 rounded-xl bg-white/10 text-white placeholder:text-white/40 text-base focus:outline-none focus:ring-2 focus:ring-white/30"
                />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-white text-brand-700 hover:bg-brand-50 px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors"
                >
                  Search
                </button>
              </div>
            </div>
          </form>

          {/* Quick search suggestions */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <span className="text-sm text-brand-200">Popular:</span>
            {['Samsung Galaxy S25', 'iPhone 16', 'Honor X8d', 'Xiaomi 14'].map((term) => (
              <Link
                key={term}
                href={`/${locale}/search?q=${encodeURIComponent(term)}`}
                className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-sm text-white/80 hover:text-white transition-colors border border-white/10"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4">
        {/* Top Brands */}
        <section className="py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Top Brands</h2>
            <Link href={`/${locale}/brands`} className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View All <Icon icon="mdi:arrow-right" width={16} />
            </Link>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/${locale}/brands/${brand.slug}`}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-brand-50 dark:group-hover:bg-brand-900/20 transition-colors">
                  {brand.logoUrl ? (
                    <Image src={brand.logoUrl} alt={brand.name} width={32} height={32} className="object-contain" />
                  ) : (
                    <span className="text-lg font-bold text-gray-400 dark:text-gray-500 group-hover:text-brand-600">
                      {brand.name.charAt(0)}
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {brand.name}
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* Sponsored Banner */}
        {bannerAd && (
          <section className="pb-8">
            <SponsoredBanner ad={bannerAd} />
          </section>
        )}

        {/* Featured Phones */}
        <section className="pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Icon icon="mdi:star-outline" width={24} className="text-amber-500" />
              Featured Phones
            </h2>
            <Link href={`/${locale}/search?featured=true`} className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View All <Icon icon="mdi:arrow-right" width={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredPhones.slice(0, 6).map((phone) => (
              <PhoneCard key={phone.id} phone={phone} />
            ))}
          </div>
        </section>

        {/* Latest Phones */}
        <section className="pb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Icon icon="mdi:clock-outline" width={24} className="text-brand-500" />
              Latest Phones
            </h2>
            <Link href={`/${locale}/search?sort=newest`} className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1">
              View All <Icon icon="mdi:arrow-right" width={16} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestPhones.map((phone) => (
              <PhoneCard key={phone.id} phone={phone} />
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="pb-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { icon: 'mdi:currency-usd', label: 'Budget', query: 'priceMax=300' },
              { icon: 'mdi:star-shooting', label: 'Flagship', query: 'priceMin=800' },
              { icon: 'mdi:camera', label: 'Best Camera', query: 'sort=camera' },
              { icon: 'mdi:battery-charging', label: 'Best Battery', query: 'sort=battery' },
              { icon: 'mdi:signal-5g', label: '5G Phones', query: 'network=5g' },
              { icon: 'mdi:trending-up', label: 'Most Popular', query: 'sort=popularity' },
            ].map((cat) => (
              <Link
                key={cat.label}
                href={`/${locale}/search?${cat.query}`}
                className="flex flex-col items-center gap-3 p-5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-md transition-all group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center group-hover:bg-brand-100 dark:group-hover:bg-brand-900/40 transition-colors">
                  <Icon icon={cat.icon} width={24} className="text-brand-600 dark:text-brand-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors text-center">
                  {cat.label}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
