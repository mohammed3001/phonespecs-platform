'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PhoneCard } from '@/components/phone/PhoneCard';
import { SearchFiltersPanel } from '@/components/search/SearchFilters';
import { SponsoredBanner } from '@/components/ads/SponsoredBanner';
import { SidebarAd } from '@/components/ads/SponsoredBanner';
import { searchPhones, sponsoredAds } from '@/data/mock-phones';
import type { SearchFilters, Phone } from '@/types/phone';

const SORT_OPTIONS = [
  { value: 'relevance', label: 'Relevance' },
  { value: 'newest', label: 'Newest First' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'popularity', label: 'Most Popular' },
];

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [filters, setFilters] = useState<SearchFilters>({
    sortBy: (searchParams.get('sort') as SearchFilters['sortBy']) || 'relevance',
    brand: searchParams.get('brand') || undefined,
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const results = useMemo(() => searchPhones(query, filters), [query, filters]);
  const sidebarAds = sponsoredAds.filter((a) => a.type === 'sidebar');
  const bannerAd = sponsoredAds.find((a) => a.type === 'banner');

  return (
    <>
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Search header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            {query ? (
              <>Search results for &ldquo;{query}&rdquo;</>
            ) : (
              'All Phones'
            )}
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {results.total} phone{results.total !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="flex gap-6">
          {/* Filters sidebar - Desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 card p-4">
              <SearchFiltersPanel filters={filters} onFilterChange={setFilters} />
            </div>
          </aside>

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Sort & filter controls */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setFiltersOpen(true)}
                className="lg:hidden btn-secondary"
              >
                <Icon icon="mdi:filter-variant" width={18} />
                Filters
              </button>

              <div className="flex items-center gap-2 ml-auto">
                <label className="text-sm text-gray-500 dark:text-gray-400">Sort by:</label>
                <select
                  value={filters.sortBy || 'relevance'}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value as SearchFilters['sortBy'] })}
                  className="admin-input w-auto"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Sponsored banner between results */}
            {bannerAd && results.phones.length > 0 && (
              <div className="mb-4">
                <SponsoredBanner ad={bannerAd} />
              </div>
            )}

            {/* Phone cards grid */}
            {results.phones.length > 0 ? (
              <div className="space-y-4">
                {results.phones.map((phone: Phone, idx: number) => (
                  <div key={phone.id}>
                    <PhoneCard phone={phone} />
                    {/* Insert a sidebar ad after every 3rd result on mobile */}
                    {idx === 2 && sidebarAds[0] && (
                      <div className="lg:hidden mt-4">
                        <SidebarAd ad={sidebarAds[0]} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <Icon icon="mdi:phone-search" width={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No phones found</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filters to find what you&apos;re looking for.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar ads - Desktop */}
          <aside className="hidden xl:block w-72 shrink-0 space-y-4">
            <div className="sticky top-24 space-y-4">
              {sidebarAds.map((ad) => (
                <SidebarAd key={ad.id} ad={ad} />
              ))}
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile filters overlay */}
      {filtersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setFiltersOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-full bg-white dark:bg-gray-950 p-6 overflow-y-auto animate-slide-up">
            <SearchFiltersPanel
              filters={filters}
              onFilterChange={(f) => { setFilters(f); setFiltersOpen(false); }}
              onClose={() => setFiltersOpen(false)}
            />
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
