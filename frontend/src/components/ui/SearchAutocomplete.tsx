'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { phones } from '@/data/mock-phones';

interface SearchAutocompleteProps {
  className?: string;
  placeholder?: string;
  size?: 'sm' | 'lg';
}

export function SearchAutocomplete({ className = '', placeholder = 'Search phones, brands, specs...', size = 'sm' }: SearchAutocompleteProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const ref = useRef<HTMLDivElement>(null);

  const suggestions = query.length >= 2
    ? phones
        .filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase()) ||
          p.brand.name.toLowerCase().includes(query.toLowerCase()) ||
          p.keySpecs.ram?.toLowerCase().includes(query.toLowerCase()) ||
          p.keySpecs.storage?.toLowerCase().includes(query.toLowerCase())
        )
        .slice(0, 6)
    : [];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/${locale}/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
    }
  };

  const goToPhone = (brandSlug: string, phoneSlug: string) => {
    router.push(`/${locale}/phones/${brandSlug}/${phoneSlug}`);
    setOpen(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((prev) => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' && activeIdx >= 0 && suggestions[activeIdx]) {
      e.preventDefault();
      const s = suggestions[activeIdx];
      goToPhone(s.brand.slug, s.slug);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const isLarge = size === 'lg';

  return (
    <div ref={ref} className={`relative ${className}`}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Icon
            icon="mdi:magnify"
            className={`absolute left-3 top-1/2 -translate-y-1/2 ${isLarge ? 'text-white/50' : 'text-gray-400'}`}
            width={isLarge ? 24 : 20}
          />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIdx(-1); }}
            onFocus={() => query.length >= 2 && setOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={isLarge
              ? 'w-full pl-12 pr-32 py-4 rounded-xl bg-white/10 text-white placeholder:text-white/40 text-base focus:outline-none focus:ring-2 focus:ring-white/30'
              : 'w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent text-gray-900 dark:text-white'
            }
          />
          <button
            type="submit"
            className={isLarge
              ? 'absolute right-2 top-1/2 -translate-y-1/2 bg-white text-brand-700 hover:bg-brand-50 px-6 py-2.5 rounded-lg font-semibold text-sm transition-colors'
              : 'absolute right-2 top-1/2 -translate-y-1/2 bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors'
            }
          >
            Search
          </button>
        </div>
      </form>

      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden max-h-80 overflow-y-auto">
          {suggestions.map((phone, idx) => (
            <button
              key={phone.id}
              onClick={() => goToPhone(phone.brand.slug, phone.slug)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${idx === activeIdx ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <div className="w-10 h-12 relative rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                {phone.images[0] && (
                  <Image src={phone.images[0].url} alt={phone.name} fill className="object-contain p-1" sizes="40px" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{phone.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{phone.brand.name} &middot; {phone.priceUsd ? `$${phone.priceUsd}` : ''}</p>
              </div>
              <Icon icon="mdi:arrow-top-right" width={16} className="text-gray-400 shrink-0" />
            </button>
          ))}
          <button
            onClick={handleSubmit}
            className="w-full px-4 py-3 text-left text-sm font-medium text-brand-600 dark:text-brand-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors border-t border-gray-100 dark:border-gray-800 flex items-center gap-2"
          >
            <Icon icon="mdi:magnify" width={16} />
            Search for &ldquo;{query}&rdquo;
          </button>
        </div>
      )}
    </div>
  );
}
