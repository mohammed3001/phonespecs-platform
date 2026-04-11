'use client';

import { notFound } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PhoneCard } from '@/components/phone/PhoneCard';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { getBrandBySlug, getPhonesByBrand } from '@/data/mock-phones';

interface Props {
  params: { locale: string; slug: string };
}

export default function BrandPage({ params }: Props) {
  const brand = getBrandBySlug(params.slug);

  if (!brand) {
    notFound();
  }

  const brandPhones = getPhonesByBrand(params.slug);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <BreadcrumbNav
          items={[
            { label: 'Brands', href: '/en/brands' },
            { label: brand.name },
          ]}
        />

        <div className="mt-6 card p-6 flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
            <Icon icon="mdi:domain" width={40} className="text-gray-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{brand.name}</h1>
            {brand.description && (
              <p className="mt-2 text-gray-600 dark:text-gray-400 max-w-2xl">{brand.description}</p>
            )}
            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <Icon icon="mdi:cellphone" width={16} />
                {brandPhones.length} phone{brandPhones.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            {brand.name} Phones
          </h2>
          {brandPhones.length > 0 ? (
            <div className="space-y-4">
              {brandPhones.map((phone) => (
                <PhoneCard key={phone.id} phone={phone} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 card">
              <Icon icon="mdi:cellphone-off" width={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No phones yet</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Check back soon for {brand.name} phones!
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
