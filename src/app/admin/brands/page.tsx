"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/shared/Icon";

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
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchBrands = () => {
    setLoading(true);
    fetch("/api/admin/brands")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setBrands(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchBrands(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/brands?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        fetchBrands();
      } else {
        alert(data.error || "Failed to delete brand");
      }
    } catch {
      alert("Network error");
    }
    setDeleting(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Brands</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{brands.length} brands</p>
        </div>
        <Link
          href="/admin/brands/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
        >
          <Icon icon="mdi:plus" width={18} />
          Add Brand
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          [...Array(8)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border p-5 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-5 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-32"></div>
            </div>
          ))
        ) : brands.length === 0 ? (
          <div className="col-span-full bg-white dark:bg-gray-800 rounded-xl border p-12 text-center">
            <Icon icon="mdi:domain" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No brands yet</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Create your first brand to get started</p>
            <Link href="/admin/brands/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 inline-flex items-center gap-2">
              <Icon icon="mdi:plus" width={18} />
              Add Brand
            </Link>
          </div>
        ) : (
          brands.map((brand) => (
            <div key={brand.id} className="bg-white dark:bg-gray-800 rounded-xl border p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-xl">
                  {brand.logo ? (
                    <img src={brand.logo} alt={brand.name} className="w-8 h-8 object-contain" />
                  ) : (
                    <Icon icon="mdi:domain" width={24} className="text-gray-400" />
                  )}
                </div>
                <span className={`w-2.5 h-2.5 rounded-full ${brand.isActive ? "bg-green-500" : "bg-gray-300"}`} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">{brand.name}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{brand.phoneCount} phones</p>
              {brand.description && (
                <p className="text-xs text-gray-400 mt-2 line-clamp-2">{brand.description}</p>
              )}
              <div className="mt-3 pt-3 border-t flex items-center justify-between">
                <span className="text-xs text-gray-400">/{brand.slug}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDelete(brand.id, brand.name)}
                    disabled={deleting === brand.id}
                    className="text-sm text-red-500 hover:text-red-700 font-medium disabled:opacity-50"
                  >
                    {deleting === brand.id ? "..." : "Delete"}
                  </button>
                  <Link href={`/admin/brands/${brand.id}/edit`} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Edit
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
