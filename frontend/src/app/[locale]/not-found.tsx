import Link from 'next/link';
import { Icon } from '@iconify/react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-4">
      <div className="text-center max-w-md">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-brand-50 dark:bg-brand-900/20 flex items-center justify-center">
          <Icon icon="mdi:cellphone-off" width={48} className="text-brand-500" />
        </div>
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-2">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">Page Not Found</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/en" className="btn-primary">
            <Icon icon="mdi:home" width={18} />
            Go Home
          </Link>
          <Link href="/en/search" className="btn-secondary">
            <Icon icon="mdi:magnify" width={18} />
            Search Phones
          </Link>
        </div>
      </div>
    </div>
  );
}
