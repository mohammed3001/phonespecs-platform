"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Phone {
  id: string;
  name: string;
  slug: string;
  brand: { name: string };
  basePrice: number | null;
  specs: { definition: { name: string; key: string; groupId: string; group: { name: string } }; value: string }[];
}

export default function ComparePage() {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [search, setSearch] = useState("");
  const [results, setResults] = useState<Phone[]>([]);
  const [showSearch, setShowSearch] = useState(false);

  const searchPhones = useCallback(async (query: string) => {
    if (!query.trim()) { setResults([]); return; }
    try {
      const res = await fetch(`/api/phones?query=${encodeURIComponent(query)}&limit=5`);
      const data = await res.json();
      if (data.success) setResults(data.data);
    } catch { setResults([]); }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => searchPhones(search), 300);
    return () => clearTimeout(timeout);
  }, [search, searchPhones]);

  const addPhone = (phone: Phone) => {
    if (phones.length >= 4) return;
    if (phones.find((p) => p.id === phone.id)) return;
    setPhones([...phones, phone]);
    setSearch("");
    setResults([]);
    setShowSearch(false);
  };

  const removePhone = (id: string) => {
    setPhones(phones.filter((p) => p.id !== id));
  };

  // Get all unique spec groups and keys from selected phones
  const specGroups: Record<string, { name: string; specs: Record<string, string[]> }> = {};
  phones.forEach((phone) => {
    phone.specs?.forEach((spec) => {
      const groupName = spec.definition.group?.name || "Other";
      const groupId = spec.definition.groupId;
      if (!specGroups[groupId]) {
        specGroups[groupId] = { name: groupName, specs: {} };
      }
      if (!specGroups[groupId].specs[spec.definition.key]) {
        specGroups[groupId].specs[spec.definition.key] = Array(phones.length).fill("—");
      }
    });
  });

  // Fill in values
  phones.forEach((phone, idx) => {
    phone.specs?.forEach((spec) => {
      const groupId = spec.definition.groupId;
      if (specGroups[groupId]?.specs[spec.definition.key]) {
        specGroups[groupId].specs[spec.definition.key][idx] = spec.value;
      }
    });
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold">
              <span className="text-blue-600">Mobile</span>Platform
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/phones" className="text-gray-600 hover:text-blue-600">Phones</Link>
              <Link href="/brands" className="text-gray-600 hover:text-blue-600">Brands</Link>
              <Link href="/compare" className="text-blue-600 font-medium">Compare</Link>
              <Link href="/news" className="text-gray-600 hover:text-blue-600">News</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Compare Phones</h1>
          <p className="text-gray-500 mt-2">Select up to 4 phones to compare their specifications side by side</p>
        </div>

        {/* Phone selection cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {phones.map((phone) => (
            <div key={phone.id} className="bg-white rounded-xl border p-4 relative">
              <button
                onClick={() => removePhone(phone.id)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-xs hover:bg-red-200"
              >
                &times;
              </button>
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl mx-auto mb-3">
                📱
              </div>
              <h3 className="text-sm font-bold text-gray-900 text-center truncate">{phone.name}</h3>
              <p className="text-xs text-gray-500 text-center">{phone.brand?.name}</p>
              {phone.basePrice && (
                <p className="text-sm font-bold text-blue-600 text-center mt-1">${phone.basePrice}</p>
              )}
            </div>
          ))}

          {phones.length < 4 && (
            <div className="relative">
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="w-full bg-white rounded-xl border-2 border-dashed border-gray-300 p-4 hover:border-blue-400 hover:bg-blue-50 transition-colors flex flex-col items-center justify-center min-h-[160px]"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-xl mb-2">+</div>
                <span className="text-sm text-gray-500">Add Phone</span>
              </button>

              {showSearch && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border z-20 p-3">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search phones..."
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  {results.length > 0 && (
                    <div className="mt-2 max-h-48 overflow-y-auto">
                      {results.map((phone) => (
                        <button
                          key={phone.id}
                          onClick={() => addPhone(phone)}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg flex items-center gap-3"
                        >
                          <span className="text-lg">📱</span>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{phone.name}</p>
                            <p className="text-xs text-gray-500">{phone.brand?.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Comparison table */}
        {phones.length >= 2 && (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500 w-48">Specification</th>
                    {phones.map((phone) => (
                      <th key={phone.id} className="text-center px-4 py-3 text-sm font-medium text-gray-900">
                        {phone.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {/* Price row */}
                  <tr className="border-b bg-blue-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-700">Price</td>
                    {phones.map((phone) => (
                      <td key={phone.id} className="px-4 py-3 text-center text-sm font-bold text-blue-600">
                        {phone.basePrice ? `$${phone.basePrice}` : "—"}
                      </td>
                    ))}
                  </tr>

                  {/* Spec groups */}
                  {Object.entries(specGroups).map(([groupId, group]) => (
                    <>
                      <tr key={`group-${groupId}`} className="bg-gray-50">
                        <td colSpan={phones.length + 1} className="px-4 py-2 text-xs font-bold text-gray-600 uppercase tracking-wide">
                          {group.name}
                        </td>
                      </tr>
                      {Object.entries(group.specs).map(([key, values]) => (
                        <tr key={key} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-700 capitalize">{key.replace(/_/g, " ")}</td>
                          {values.map((value, idx) => (
                            <td key={idx} className="px-4 py-3 text-center text-sm text-gray-900">
                              {value}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {phones.length < 2 && (
          <div className="bg-white rounded-xl border p-12 text-center">
            <div className="text-4xl mb-4">⚖️</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Select phones to compare</h3>
            <p className="text-sm text-gray-500">Add at least 2 phones to see a side-by-side comparison of their specifications</p>
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} MobilePlatform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
