'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Icon } from '@iconify/react';

export function Footer() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href={`/${locale}`} className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-brand-600 rounded-xl flex items-center justify-center">
                <Icon icon="mdi:cellphone" className="text-white" width={22} />
              </div>
              <span className="text-xl font-bold text-white">
                Phone<span className="text-brand-400">Spec</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Your trusted source for detailed mobile phone specifications, comparisons, and reviews.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/search`} className="hover:text-brand-400 transition-colors">All Phones</Link></li>
              <li><Link href={`/${locale}/brands`} className="hover:text-brand-400 transition-colors">Brands</Link></li>
              <li><Link href={`/${locale}/compare`} className="hover:text-brand-400 transition-colors">Compare Phones</Link></li>
              <li><Link href={`/${locale}/search?sort=newest`} className="hover:text-brand-400 transition-colors">Latest Phones</Link></li>
            </ul>
          </div>

          {/* Popular Brands */}
          <div>
            <h3 className="text-white font-semibold mb-4">Popular Brands</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href={`/${locale}/brands/samsung`} className="hover:text-brand-400 transition-colors">Samsung</Link></li>
              <li><Link href={`/${locale}/brands/apple`} className="hover:text-brand-400 transition-colors">Apple</Link></li>
              <li><Link href={`/${locale}/brands/xiaomi`} className="hover:text-brand-400 transition-colors">Xiaomi</Link></li>
              <li><Link href={`/${locale}/brands/honor`} className="hover:text-brand-400 transition-colors">Honor</Link></li>
              <li><Link href={`/${locale}/brands/oneplus`} className="hover:text-brand-400 transition-colors">OnePlus</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Connect</h3>
            <div className="flex items-center gap-3 mb-4">
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-brand-600 rounded-lg flex items-center justify-center transition-colors">
                <Icon icon="mdi:facebook" width={18} />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-brand-600 rounded-lg flex items-center justify-center transition-colors">
                <Icon icon="mdi:twitter" width={18} />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-brand-600 rounded-lg flex items-center justify-center transition-colors">
                <Icon icon="mdi:youtube" width={18} />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-800 hover:bg-brand-600 rounded-lg flex items-center justify-center transition-colors">
                <Icon icon="mdi:instagram" width={18} />
              </a>
            </div>
            <p className="text-sm text-gray-400">
              <Icon icon="mdi:email-outline" width={14} className="inline mr-1" />
              contact@phonespec.com
            </p>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">
            &copy; {new Date().getFullYear()} PhoneSpec. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <Link href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-gray-300 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
