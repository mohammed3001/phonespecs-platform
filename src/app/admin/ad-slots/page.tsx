"use client";

import { useEffect, useState } from "react";

interface AdSlot {
  id: string;
  name: string;
  slug: string;
  pageType: string;
  position: string;
  dimensions: string | null;
  isActive: boolean;
  sortOrder: number;
}

export default function AdminAdSlotsPage() {
  const [slots, setSlots] = useState<AdSlot[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/ad-slots")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSlots(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ad Slots</h1>
          <p className="text-sm text-gray-500 mt-1">Manage advertising placement zones across the site. New page types auto-resolve slots.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Slot
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Slug</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Page Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Position</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Dimensions</th>
                <th className="text-center px-4 py-3 text-xs font-medium text-gray-500 uppercase">Active</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(7)].map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20"></div></td>
                    ))}
                  </tr>
                ))
              ) : slots.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">No ad slots configured</td>
                </tr>
              ) : (
                slots.map((slot) => (
                  <tr key={slot.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900 text-sm">{slot.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 font-mono">{slot.slug}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs px-2 py-1 rounded-full bg-purple-50 text-purple-700">{slot.pageType}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 capitalize">{slot.position.replace("_", " ")}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{slot.dimensions || "—"}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`w-2.5 h-2.5 rounded-full inline-block ${slot.isActive ? "bg-green-500" : "bg-gray-300"}`} />
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
