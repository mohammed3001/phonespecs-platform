"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Phone {
  id: string;
  name: string;
  slug: string;
  mainImage: string | null;
  marketStatus: string;
  priceUsd: number | null;
  priceDisplay: string | null;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  reviewScore: number;
  createdAt: string;
  brand: { id: string; name: string; slug: string };
  _count: { reviews: number; specs: number };
}

export default function AdminPhonesPage() {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: "20" });
    if (search) params.set("search", search);

    fetch(`/api/admin/phones?${params}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setPhones(data.data);
          setTotalPages(data.pagination.totalPages);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [page, search]);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      available: "bg-green-100 text-green-700",
      coming_soon: "bg-amber-100 text-amber-700",
      discontinued: "bg-gray-100 text-gray-600",
    };
    return map[status] || "bg-gray-100 text-gray-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Phones</h1>
        <Link
          href="/admin/phones/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Phone
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search phones..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full px-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Phone</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Brand</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Price</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Published</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Views</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Specs</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-12"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-8"></div></td>
                    <td className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div></td>
                  </tr>
                ))
              ) : phones.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                    No phones found
                  </td>
                </tr>
              ) : (
                phones.map((phone) => (
                  <tr key={phone.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg">
                          📱
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{phone.name}</p>
                          <p className="text-xs text-gray-500">/{phone.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{phone.brand.name}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusBadge(phone.marketStatus)}`}>
                        {phone.marketStatus.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {phone.priceDisplay || (phone.priceUsd ? `$${phone.priceUsd}` : "—")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`w-2.5 h-2.5 rounded-full inline-block ${phone.isPublished ? "bg-green-500" : "bg-gray-300"}`} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{phone.viewCount.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{phone._count.specs}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/admin/phones/${phone.id}/specifications`}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium"
                        >
                          Specs
                        </Link>
                        <Link
                          href={`/admin/phones/${phone.id}/images`}
                          className="text-purple-600 hover:text-purple-800 text-xs font-medium"
                        >
                          Images
                        </Link>
                        <Link
                          href={`/admin/phones/${phone.id}`}
                          className="text-gray-600 hover:text-gray-800 text-xs font-medium"
                        >
                          Edit
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="border-t px-4 py-3 flex items-center justify-between">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-500">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="text-sm text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
