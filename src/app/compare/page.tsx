"use client";

import { useState } from "react";
import Image from "next/image";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { SpecIcon, GroupIcon } from "@/components/shared/SpecIcon";

interface Phone {
  id: string;
  name: string;
  slug: string;
  mainImage: string | null;
  marketStatus: string;
  priceUsd: number | null;
  priceDisplay: string | null;
  reviewScore: number;
  brand: { name: string; slug: string };
  specs: {
    value: string;
    spec: {
      name: string;
      key: string;
      unit: string | null;
      showInCompare: boolean;
      sortOrder: number;
      groupId: string;
      group: { name: string; slug: string; sortOrder: number };
    };
  }[];
}

export default function ComparePage() {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Phone[]>([]);

  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const searchPhones = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults([]); return; }
    try {
      const res = await fetch(`/api/phones?q=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      if (data.success) setSearchResults(data.data);
    } catch { setSearchResults([]); }
  };

  const addPhone = (phone: Phone) => {
    if (phones.length >= 4) return;
    if (phones.find((p) => p.id === phone.id)) return;
    setPhones([...phones, phone]);
    setSearchQuery("");
    setSearchResults([]);
    setActiveSlot(null);
  };

  const removePhone = (id: string) => {
    setPhones(phones.filter((p) => p.id !== id));
  };

  // Gather all spec groups across phones
  const allGroups: Record<string, { name: string; slug: string; sortOrder: number; specs: Record<string, { name: string; key: string; unit: string | null; sortOrder: number }> }> = {};

  for (const phone of phones) {
    for (const ps of phone.specs) {
      if (!ps.spec.showInCompare) continue;
      const groupSlug = ps.spec.group.slug;
      if (!allGroups[groupSlug]) {
        allGroups[groupSlug] = {
          name: ps.spec.group.name,
          slug: groupSlug,
          sortOrder: ps.spec.group.sortOrder,
          specs: {},
        };
      }
      if (!allGroups[groupSlug].specs[ps.spec.key]) {
        allGroups[groupSlug].specs[ps.spec.key] = {
          name: ps.spec.name,
          key: ps.spec.key,
          unit: ps.spec.unit,
          sortOrder: ps.spec.sortOrder,
        };
      }
    }
  }

  const sortedGroups = Object.values(allGroups).sort((a, b) => a.sortOrder - b.sortOrder);

  const emptySlots = Math.max(0, 2 - phones.length);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Page Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="absolute inset-0 grid-pattern" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            Compare Phones
          </h1>
          <p className="text-blue-200/80 mt-3 text-lg max-w-xl mx-auto">
            Put up to 4 phones side by side to find the best match for your needs
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full">
        {/* Phone Selector Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {phones.map((phone) => (
            <div key={phone.id} className="bg-white rounded-2xl border border-gray-200 p-4 relative group">
              <button
                onClick={() => removePhone(phone.id)}
                className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
              >
                &times;
              </button>
              <div className="w-full h-28 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center mb-3 overflow-hidden">
                {phone.mainImage ? (
                  <Image src={phone.mainImage} alt={phone.name} width={80} height={112} className="h-full w-auto object-contain" />
                ) : (
                  <span className="text-4xl">📱</span>
                )}
              </div>
              <p className="text-xs text-gray-400 font-medium">{phone.brand.name}</p>
              <h3 className="text-sm font-bold text-gray-900 truncate">{phone.name}</h3>
              <p className="text-sm font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mt-1">
                {phone.priceDisplay || (phone.priceUsd ? `$${phone.priceUsd.toLocaleString()}` : "TBA")}
              </p>
            </div>
          ))}

          {/* Empty Slots */}
          {Array.from({ length: Math.max(emptySlots, 4 - phones.length) }).slice(0, 4 - phones.length).map((_, i) => (
            <button
              key={`empty-${i}`}
              onClick={() => setActiveSlot(phones.length + i)}
              className={`bg-white rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center min-h-[180px] transition-all ${
                activeSlot === phones.length + i
                  ? "border-blue-400 bg-blue-50"
                  : "border-gray-300 hover:border-blue-400 hover:bg-blue-50/50"
              }`}
            >
              <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mb-2">
                <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <p className="text-sm font-medium text-gray-500">Add Phone</p>
            </button>
          ))}
        </div>

        {/* Search */}
        {phones.length < 4 && (
          <div className="max-w-lg mx-auto mb-10">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => searchPhones(e.target.value)}
                placeholder="Search for a phone to compare..."
                className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
              />
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="mt-2 bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
                {searchResults.map((phone) => (
                  <button
                    key={phone.id}
                    onClick={() => addPhone(phone)}
                    disabled={!!phones.find((p) => p.id === phone.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed border-b last:border-0"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                      {phone.mainImage ? (
                        <Image src={phone.mainImage} alt={phone.name} width={40} height={40} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-xl">📱</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{phone.name}</p>
                      <p className="text-xs text-gray-500">{phone.brand?.name}</p>
                    </div>
                    <span className="text-sm font-bold text-blue-600 flex-shrink-0">
                      {phone.priceDisplay || (phone.priceUsd ? `$${phone.priceUsd.toLocaleString()}` : "")}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comparison Table */}
        {phones.length >= 2 && (
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
            {sortedGroups.map((group) => (
              <div key={group.slug}>
                {/* Group Header */}
                <div className="flex items-center gap-2.5 px-4 sm:px-6 py-4 bg-gray-50 border-b border-t first:border-t-0">
                  <GroupIcon groupSlug={group.slug} size={18} className="text-blue-600" />
                  <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider">{group.name}</h3>
                </div>

                {/* Specs Rows */}
                {Object.values(group.specs)
                  .sort((a, b) => a.sortOrder - b.sortOrder)
                  .map((spec) => (
                    <div
                      key={spec.key}
                      className="flex border-b border-gray-100 hover:bg-blue-50/30 transition-colors"
                    >
                      {/* Spec Name */}
                      <div className="w-32 sm:w-48 flex-shrink-0 flex items-center gap-2 sm:gap-2.5 px-3 sm:px-6 py-3.5 border-r border-gray-100 bg-gray-50/50">
                        <SpecIcon specKey={spec.key} size={14} className="text-gray-400 flex-shrink-0" />
                        <span className="text-xs sm:text-sm text-gray-600 font-medium">{spec.name}</span>
                      </div>

                      {/* Values */}
                      <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${phones.length}, minmax(100px, 1fr))` }}>
                        {phones.map((phone) => {
                          const phoneSpec = phone.specs.find((s) => s.spec.key === spec.key);
                          return (
                            <div
                              key={phone.id}
                              className="px-3 sm:px-4 py-3.5 text-xs sm:text-sm font-medium text-gray-900 border-r last:border-0 border-gray-100 flex items-center"
                            >
                              {phoneSpec ? (
                                <span>{phoneSpec.value}{spec.unit ? ` ${spec.unit}` : ""}</span>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {phones.length < 2 && (
          <div className="text-center py-16">
            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="w-24 h-32 bg-white rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center text-4xl text-gray-300">
                📱
              </div>
              <span className="text-2xl font-bold text-gray-300">vs</span>
              <div className="w-24 h-32 bg-white rounded-2xl border-2 border-dashed border-gray-300 flex items-center justify-center text-4xl text-gray-300">
                📱
              </div>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">
              {phones.length === 0 ? "Add phones to compare" : "Add one more phone"}
            </h3>
            <p className="text-sm text-gray-500 max-w-md mx-auto">
              Search and select {phones.length === 0 ? "at least 2" : "1 more"} phone to start comparing specifications side by side
            </p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
