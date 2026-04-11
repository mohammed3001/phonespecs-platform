'use client';

import { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { phones } from '@/data/mock-phones';
import { SPEC_ICONS } from '@/types/phone';
import type { Phone } from '@/types/phone';

const COMPARE_SPECS: { key: keyof Phone['keySpecs']; label: string }[] = [
  { key: 'os', label: 'Operating System' },
  { key: 'display', label: 'Display' },
  { key: 'ram', label: 'RAM' },
  { key: 'storage', label: 'Storage' },
  { key: 'mainCamera', label: 'Main Camera' },
  { key: 'frontCamera', label: 'Front Camera' },
  { key: 'battery', label: 'Battery' },
  { key: 'charger', label: 'Charging' },
  { key: 'fingerprint', label: 'Fingerprint' },
  { key: 'resistanceRating', label: 'Resistance' },
  { key: 'wifi', label: 'Wi-Fi' },
  { key: 'bluetooth', label: 'Bluetooth' },
  { key: 'glassProtection', label: 'Glass Protection' },
];

export default function ComparePage() {
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('compare_phones');
    if (saved) {
      try {
        setCompareIds(JSON.parse(saved));
      } catch {
        // ignore
      }
    }
  }, []);

  const comparePhones = useMemo(
    () => compareIds.map((id) => phones.find((p) => p.id === id)).filter(Boolean) as Phone[],
    [compareIds]
  );

  const filteredPhones = useMemo(() => {
    if (!searchQuery) return [];
    const q = searchQuery.toLowerCase();
    return phones
      .filter((p) => !compareIds.includes(p.id))
      .filter((p) => p.name.toLowerCase().includes(q) || p.brand.name.toLowerCase().includes(q))
      .slice(0, 5);
  }, [searchQuery, compareIds]);

  const addPhone = (id: string) => {
    if (compareIds.length >= 4) return;
    const newIds = [...compareIds, id];
    setCompareIds(newIds);
    localStorage.setItem('compare_phones', JSON.stringify(newIds));
    setSearchQuery('');
  };

  const removePhone = (id: string) => {
    const newIds = compareIds.filter((i) => i !== id);
    setCompareIds(newIds);
    localStorage.setItem('compare_phones', JSON.stringify(newIds));
  };

  const clearAll = () => {
    setCompareIds([]);
    localStorage.removeItem('compare_phones');
  };

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Compare Phones</h1>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              Select up to 4 phones to compare side by side
            </p>
          </div>
          {comparePhones.length > 0 && (
            <button onClick={clearAll} className="btn-secondary text-sm">
              <Icon icon="mdi:delete-outline" width={16} />
              Clear All
            </button>
          )}
        </div>

        {comparePhones.length < 4 && (
          <div className="mb-8 relative max-w-md">
            <div className="relative">
              <Icon icon="mdi:magnify" width={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search phones to compare..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
              />
            </div>
            {filteredPhones.length > 0 && (
              <div className="absolute z-10 top-full left-0 right-0 mt-1 card shadow-xl max-h-60 overflow-y-auto">
                {filteredPhones.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => addPhone(p.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    <div className="w-10 h-12 relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                      {p.images[0] && (
                        <Image src={p.images[0].url} alt={p.name} fill className="object-contain p-1" sizes="40px" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{p.brand.name}</p>
                    </div>
                    <Icon icon="mdi:plus-circle" width={20} className="ml-auto text-brand-500" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {comparePhones.length === 0 ? (
          <div className="text-center py-20 card">
            <Icon icon="mdi:compare" width={64} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No phones selected</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Search above or add phones from their detail pages to start comparing.
            </p>
            <Link href="/en/search" className="btn-primary inline-flex">
              <Icon icon="mdi:magnify" width={18} />
              Browse Phones
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr>
                  <th className="w-40 p-3"></th>
                  {comparePhones.map((phone) => (
                    <th key={phone.id} className="p-3 text-center min-w-[180px]">
                      <div className="card p-4 relative">
                        <button
                          onClick={() => removePhone(phone.id)}
                          className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Icon icon="mdi:close" width={16} />
                        </button>
                        <Link href={'/en/phones/' + phone.brand.slug + '/' + phone.slug}>
                          <div className="w-20 h-24 relative mx-auto mb-3">
                            {phone.images[0] && (
                              <Image src={phone.images[0].url} alt={phone.name} fill className="object-contain" sizes="80px" />
                            )}
                          </div>
                          <p className="text-xs text-brand-600 dark:text-brand-400 uppercase tracking-wide">{phone.brand.name}</p>
                          <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                            {phone.name}
                          </p>
                          {phone.priceUsd && (
                            <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">${phone.priceUsd}</p>
                          )}
                        </Link>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE_SPECS.map((spec, idx) => (
                  <tr key={spec.key} className={idx % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/20' : ''}>
                    <td className="p-3 text-sm font-medium text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <Icon icon={SPEC_ICONS[spec.key] || 'mdi:information-outline'} width={16} className="text-brand-500" />
                        {spec.label}
                      </div>
                    </td>
                    {comparePhones.map((phone) => (
                      <td key={phone.id} className="p-3 text-sm text-center text-gray-900 dark:text-gray-100 font-medium">
                        {phone.keySpecs[spec.key] || '\u2014'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
