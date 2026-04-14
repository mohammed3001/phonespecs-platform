"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  isActive: boolean;
  phoneCount: number;
}

export default function AdminBrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/brands")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setBrands(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Brand
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-5 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          ))
        ) : (
          brands.map((brand) => (
            <div key={brand.id} className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                  🏢
                </div>
                <span className={`w-2.5 h-2.5 rounded-full ${brand.isActive ? "bg-green-500" : "bg-gray-300"}`} />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">{brand.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{brand.phoneCount} phones</p>
              {brand.description && (
                <p className="text-xs text-gray-400 mt-2 line-clamp-2">{brand.description}</p>
              )}
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <span className="text-xs text-gray-400">/{brand.slug}</span>
                <Link href={`/admin/brands/${brand.id}`} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Edit
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
