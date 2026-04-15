import Link from "next/link";
import { Icon } from "@iconify/react";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-violet-100 rounded-2xl flex items-center justify-center">
          <Icon icon="mdi:alert-circle-outline" className="w-10 h-10 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-3">404</h1>
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Page Not Found</h2>
        <p className="text-gray-500 mb-8">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-blue-600/25 transition-all"
          >
            <Icon icon="mdi:home" className="w-5 h-5" />
            Go Home
          </Link>
          <Link
            href="/phones"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-all"
          >
            <Icon icon="mdi:cellphone" className="w-5 h-5" />
            Browse Phones
          </Link>
        </div>
      </div>
    </div>
  );
}
