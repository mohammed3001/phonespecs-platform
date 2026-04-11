'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { brands, phones } from '@/data/mock-phones';

export default function BrandsPage() {
  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Phone Brands</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Browse phones by manufacturer</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {brands.map((brand) => {
            const brandPhones = phones.filter((p) => p.brandId === brand.id);
            const avgPrice = brandPhones.length > 0
              ? Math.round(brandPhones.reduce((sum, p) => sum + (p.priceUsd || 0), 0) / brandPhones.length)
              : 0;

            return (
              <Link
                key={brand.id}
                href={'/en/brands/' + brand.slug}
                className="card p-5 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
                    <Icon icon="mdi:domain" width={28} className="text-gray-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {brand.name}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {brandPhones.length} phone{brandPhones.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                </div>

                {brand.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
                    {brand.description}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <span className="flex items-center gap-1">
                    <Icon icon="mdi:tag-outline" width={14} />
                    Avg. ${avgPrice}
                  </span>
                  <span className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-medium">
                    View phones <Icon icon="mdi:arrow-right" width={14} />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </main>
      <Footer />
    </>
  );
}
