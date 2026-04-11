'use client';

import { useState } from 'react';
import { notFound } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { PhoneImageGallery } from '@/components/phone/PhoneImageGallery';
import { PhoneSpecTable } from '@/components/phone/PhoneSpecTable';
import { PhoneReviews } from '@/components/phone/PhoneReviews';
import { RelatedPhones } from '@/components/phone/RelatedPhones';
import { AddToCompare } from '@/components/phone/AddToCompare';
import { ShareButtons } from '@/components/ui/ShareButtons';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { SidebarAd } from '@/components/ads/SponsoredBanner';
import { getPhoneBySlug, sponsoredAds, getLatestPhones } from '@/data/mock-phones';
import { SPEC_ICONS } from '@/types/phone';
import type { Phone } from '@/types/phone';

interface Props {
  params: { locale: string; brand: string; slug: string };
}

const KEY_SPEC_LIST: { key: keyof Phone['keySpecs']; label: string }[] = [
  { key: 'os', label: 'OS' },
  { key: 'storage', label: 'Storage' },
  { key: 'ram', label: 'RAM' },
  { key: 'mainCamera', label: 'Main Camera' },
  { key: 'frontCamera', label: 'Front Camera' },
  { key: 'display', label: 'Display' },
  { key: 'battery', label: 'Battery' },
  { key: 'fingerprint', label: 'Fingerprint' },
  { key: 'charger', label: 'Charging' },
  { key: 'resistanceRating', label: 'Resistance' },
  { key: 'wifi', label: 'Wi-Fi' },
  { key: 'glassProtection', label: 'Glass Protection' },
  { key: 'bluetooth', label: 'Bluetooth' },
];

const TABS = [
  { id: 'overview', label: 'Overview', icon: 'mdi:information-outline' },
  { id: 'specs', label: 'Specifications', icon: 'mdi:format-list-bulleted' },
  { id: 'review', label: 'Review', icon: 'mdi:star-outline' },
];

export default function PhonePage({ params }: Props) {
  const phone = getPhoneBySlug(params.brand, params.slug);
  const [activeTab, setActiveTab] = useState('overview');

  if (!phone) {
    notFound();
  }

  const sidebarAds = sponsoredAds.filter((a) => a.type === 'sidebar');
  const latestPhones = getLatestPhones(4);
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <BreadcrumbNav
          items={[
            { label: 'Brands', href: '/en/brands' },
            { label: phone.brand.name, href: '/en/brands/' + phone.brand.slug },
            { label: phone.name },
          ]}
        />

        <div className="mt-6 flex gap-8">
          <div className="flex-1 min-w-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <PhoneImageGallery images={phone.images} phoneName={phone.name} />
              <div className="space-y-6">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-brand-600 dark:text-brand-400 uppercase tracking-wide">
                        {phone.brand.name}
                      </p>
                      <h1 className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">
                        {phone.name}
                      </h1>
                    </div>
                    <AddToCompare phoneId={phone.id} phoneName={phone.name} />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-4">
                    <StatusBadge status={phone.status} />
                    {phone.priceUsd && (
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">
                        ${phone.priceUsd}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    {phone.releaseDate && (
                      <span className="flex items-center gap-1">
                        <Icon icon="mdi:calendar-outline" width={16} />
                        {phone.releaseDate}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Icon icon="mdi:eye-outline" width={16} />
                      {phone.viewCount.toLocaleString()} views
                    </span>
                  </div>
                </div>

                <div className="card p-5">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Icon icon="mdi:clipboard-list-outline" width={20} className="text-brand-500" />
                    Key Specifications
                  </h3>
                  <div className="space-y-2.5">
                    {KEY_SPEC_LIST.map((spec) => {
                      const value = phone.keySpecs[spec.key];
                      if (!value) return null;
                      return (
                        <div key={spec.key} className="flex items-center gap-3">
                          <Icon icon={SPEC_ICONS[spec.key] || 'mdi:information-outline'} width={18} className="text-brand-500 shrink-0" />
                          <span className="text-sm text-gray-500 dark:text-gray-400 min-w-[100px] shrink-0">{spec.label}</span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</span>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => { setActiveTab('specs'); document.getElementById('specs-section')?.scrollIntoView({ behavior: 'smooth' }); }}
                    className="mt-4 btn-primary w-full justify-center"
                  >
                    <Icon icon="mdi:format-list-bulleted" width={18} />
                    See Full Specs
                  </button>
                </div>

                <ShareButtons url={siteUrl + '/en/phones/' + params.brand + '/' + params.slug} title={phone.name} />
              </div>
            </div>

            {/* Sticky Tabs */}
            <div className="sticky top-[65px] z-30 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 -mx-4 px-4 mb-8">
              <nav className="flex gap-0 overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={'flex items-center gap-2 px-5 py-3.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ' + (activeTab === tab.id ? 'border-brand-600 text-brand-600 dark:text-brand-400 dark:border-brand-400' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300')}
                  >
                    <Icon icon={tab.icon} width={18} />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="card p-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About {phone.name}</h2>
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    The {phone.name} by {phone.brand.name} features a {phone.keySpecs.display} display,
                    powered by {phone.keySpecs.ram} of RAM and {phone.keySpecs.storage} storage.
                  </p>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: 'mdi:cellphone', label: 'Display', value: phone.keySpecs.display },
                    { icon: 'mdi:camera-outline', label: 'Camera', value: phone.keySpecs.mainCamera },
                    { icon: 'mdi:battery-high', label: 'Battery', value: phone.keySpecs.battery },
                    { icon: 'mdi:memory', label: 'RAM', value: phone.keySpecs.ram },
                  ].map((item) => item.value ? (
                    <div key={item.label} className="card p-4 text-center">
                      <Icon icon={item.icon} width={28} className="mx-auto text-brand-500 mb-2" />
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">{item.label}</p>
                      <p className="mt-1 text-sm font-bold text-gray-900 dark:text-white">{item.value}</p>
                    </div>
                  ) : null)}
                </div>
              </div>
            )}

            {activeTab === 'specs' && (
              <div id="specs-section">
                <PhoneSpecTable specGroups={phone.specGroups} />
              </div>
            )}

            {activeTab === 'review' && (
              <div>
                {phone.reviews.length > 0 ? (
                  <PhoneReviews reviews={phone.reviews} />
                ) : (
                  <div className="text-center py-16 card">
                    <Icon icon="mdi:star-outline" width={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Reviews Yet</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Be the first to review the {phone.name}.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mt-12">
              <RelatedPhones brandId={phone.brandId} currentPhoneId={phone.id} />
            </div>
          </div>

          <aside className="hidden xl:block w-72 shrink-0">
            <div className="sticky top-24 space-y-4">
              {sidebarAds.map((ad) => (<SidebarAd key={ad.id} ad={ad} />))}
              <div className="card p-4">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Icon icon="mdi:clock-outline" width={16} className="text-brand-500" />
                  Latest Phones
                </h4>
                <div className="space-y-2">
                  {latestPhones.slice(0, 4).map((p) => (
                    <a key={p.id} href={'/en/phones/' + p.brand.slug + '/' + p.slug} className="block p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{p.brand.name}</p>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    AVAILABLE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    UPCOMING: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    DISCONTINUED: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  };
  const labels: Record<string, string> = { AVAILABLE: 'In Stock', UPCOMING: 'Coming Soon', DISCONTINUED: 'Discontinued' };
  return (
    <span className={'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ' + (styles[status] || styles.AVAILABLE)}>
      {labels[status] || status}
    </span>
  );
}
