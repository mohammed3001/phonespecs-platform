'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Icon } from '@iconify/react';
import { SearchAutocomplete } from '@/components/ui/SearchAutocomplete';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const locale = (params?.locale as string) || 'en';
  const { theme, setTheme } = useTheme();

  const toggleLocale = () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar';
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      {/* Top bar */}
      <div className="bg-brand-600 text-white text-xs py-1.5">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <span>Your trusted mobile phone specifications platform</span>
          <div className="hidden sm:flex items-center gap-4">
            <Link href={`/${locale}/articles`} className="hover:text-brand-200 transition-colors flex items-center gap-1">
              <Icon icon="mdi:newspaper-variant-outline" width={14} />
              News
            </Link>
            <Link href={`/${locale}/compare`} className="hover:text-brand-200 transition-colors flex items-center gap-1">
              <Icon icon="mdi:compare" width={14} />
              Compare
            </Link>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
              <Icon icon="mdi:cellphone" className="text-white" width={22} />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white hidden sm:block">
              Phone<span className="text-brand-600">Spec</span>
            </span>
          </Link>

          {/* Search bar with autocomplete */}
          <SearchAutocomplete className="flex-1 max-w-xl" />

          {/* Nav + Controls */}
          <div className="flex items-center gap-1">
            <nav className="hidden lg:flex items-center gap-1">
              <Link
                href={`/${locale}/brands`}
                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Brands
              </Link>
              <Link
                href={`/${locale}/search`}
                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Phones
              </Link>
              <Link
                href={`/${locale}/articles`}
                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                News
              </Link>
              <Link
                href={`/${locale}/compare`}
                className="px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Compare
              </Link>
            </nav>

            {/* Dark mode toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              <Icon icon={theme === 'dark' ? 'mdi:weather-sunny' : 'mdi:weather-night'} width={20} />
            </button>

            {/* Language switcher */}
            <button
              onClick={toggleLocale}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-xs font-bold"
              aria-label="Switch language"
            >
              {locale === 'ar' ? 'EN' : 'AR'}
            </button>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-300"
            >
              <Icon icon={mobileMenuOpen ? 'mdi:close' : 'mdi:menu'} width={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 animate-fade-in">
          <nav className="max-w-7xl mx-auto px-4 py-3 space-y-1">
            <Link href={`/${locale}/brands`} className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              Brands
            </Link>
            <Link href={`/${locale}/search`} className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              Phones
            </Link>
            <Link href={`/${locale}/articles`} className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              News
            </Link>
            <Link href={`/${locale}/compare`} className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              Compare
            </Link>
            <Link href={`/${locale}/admin`} className="block px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg" onClick={() => setMobileMenuOpen(false)}>
              Admin
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
