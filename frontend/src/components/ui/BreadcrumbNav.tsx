'use client';

import Link from 'next/link';
import { Icon } from '@iconify/react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbNavProps {
  items: BreadcrumbItem[];
}

export function BreadcrumbNav({ items }: BreadcrumbNavProps) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
      <Link href="/en" className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
        <Icon icon="mdi:home-outline" width={16} />
      </Link>
      {items.map((item, idx) => (
        <span key={idx} className="flex items-center gap-1">
          <Icon icon="mdi:chevron-right" width={16} className="text-gray-300 dark:text-gray-600" />
          {item.href ? (
            <Link
              href={item.href}
              className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-white font-medium">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
