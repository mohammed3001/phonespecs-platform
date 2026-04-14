"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Brand {
  id: string;
  name: string;
  slug: string;
}

interface SpecDefinition {
  id: string;
  name: string;
  key: string;
  unit: string | null;
  dataType: string;
  selectOptions: string | null;
  showInCard: boolean;
  showInDetail: boolean;
  showInCompare: boolean;
  isHighlighted: boolean;
  sortOrder: number;
}

interface SpecGroup {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
  definitions: SpecDefinition[];
}

export default function AddPhonePage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [specGroups, setSpecGroups] = useState<SpecGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Phone form fields
  const [name, setName] = useState("");
  const [brandId, setBrandId] = useState("");
  const [marketStatus, setMarketStatus] = useState("available");
  const [releaseDate, setReleaseDate] = useState("");
  const [priceUsd, setPriceUsd] = useState("");
  const [priceDisplay, setPriceDisplay] = useState("");
  const [overview, setOverview] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // Spec values: { [specDefinitionId]: string }
  const [specValues, setSpecValues] = useState<Record<string, string>>({});

  // Load brands and spec groups
  useEffect(() => {
    Promise.all([
      fetch("/api/brands").then((r) => r.json()),
      fetch("/api/specs").then((r) => r.json()),
    ])
      .then(([brandsData, specsData]) => {
        if (brandsData.success) setBrands(brandsData.data);
        if (specsData.success) setSpecGroups(specsData.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSpecChange = (specId: string, value: string) => {
    setSpecValues((prev) => ({ ...prev, [specId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Phone name is required");
      return;
    }
    if (!brandId) {
      setError("Please select a brand");
      return;
    }

    setSaving(true);

    // Build specs array from filled values
    const specs = Object.entries(specValues)
      .filter(([, value]) => value.trim() !== "")
      .map(([specId, value]) => {
        const numericValue = parseFloat(value);
        return {
          specId,
          value,
          numericValue: isNaN(numericValue) ? null : numericValue,
        };
      });

    try {
      const res = await fetch("/api/admin/phones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          brandId,
          marketStatus,
          releaseDate: releaseDate || null,
          priceUsd: priceUsd || null,
          priceDisplay: priceDisplay || null,
          overview: overview || null,
          isFeatured,
          isPublished,
          specs,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess("Phone created successfully!");
        setTimeout(() => router.push("/admin/phones"), 1500);
      } else {
        setError(data.error || "Failed to create phone");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/phones" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Add New Phone</h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="animate-pulse space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded w-full"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/admin/phones" className="text-gray-400 hover:text-gray-600">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Add New Phone</h1>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
            <p className="text-sm text-gray-500 mt-0.5">General details about the phone</p>
          </div>
          <div className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Samsung Galaxy S25 Ultra"
                className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Brand <span className="text-red-500">*</span>
              </label>
              <select
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                required
              >
                <option value="">Select a brand...</option>
                {brands.map((brand) => (
                  <option key={brand.id} value={brand.id}>
                    {brand.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Market Status & Release Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Market Status</label>
                <select
                  value={marketStatus}
                  onChange={(e) => setMarketStatus(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                >
                  <option value="available">Available</option>
                  <option value="coming_soon">Coming Soon</option>
                  <option value="discontinued">Discontinued</option>
                  <option value="rumored">Rumored</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Release Date</label>
                <input
                  type="text"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  placeholder="e.g. 2024-01-17"
                  className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Price */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={priceUsd}
                  onChange={(e) => setPriceUsd(e.target.value)}
                  placeholder="e.g. 1299.99"
                  className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Display Price</label>
                <input
                  type="text"
                  value={priceDisplay}
                  onChange={(e) => setPriceDisplay(e.target.value)}
                  placeholder="e.g. $1,299"
                  className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Overview */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Overview</label>
              <textarea
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                placeholder="Write a brief overview of the phone..."
                rows={4}
                className="w-full px-4 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              />
            </div>

            {/* Toggles */}
            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Featured Phone</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPublished}
                  onChange={(e) => setIsPublished(e.target.checked)}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Published</span>
              </label>
            </div>
          </div>
        </div>

        {/* Specifications */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="px-6 py-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold text-gray-900">Specifications</h2>
            <p className="text-sm text-gray-500 mt-0.5">Fill in the specs you want — leave blank to skip</p>
          </div>
          <div className="divide-y">
            {specGroups.map((group) => (
              <div key={group.id} className="p-6">
                <h3 className="text-sm font-bold text-gray-600 uppercase tracking-wide mb-4">
                  {group.name}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.definitions.map((def) => (
                    <div key={def.id}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {def.name}
                        {def.unit && (
                          <span className="text-gray-400 font-normal ml-1">({def.unit})</span>
                        )}
                        {def.isHighlighted && (
                          <span className="ml-1 text-amber-500 text-xs">★</span>
                        )}
                      </label>
                      {def.dataType === "select" && def.selectOptions ? (
                        <select
                          value={specValues[def.id] || ""}
                          onChange={(e) => handleSpecChange(def.id, e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="">Select...</option>
                          {def.selectOptions.split(",").map((opt) => (
                            <option key={opt.trim()} value={opt.trim()}>
                              {opt.trim()}
                            </option>
                          ))}
                        </select>
                      ) : def.dataType === "boolean" ? (
                        <select
                          value={specValues[def.id] || ""}
                          onChange={(e) => handleSpecChange(def.id, e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="">Select...</option>
                          <option value="Yes">Yes</option>
                          <option value="No">No</option>
                        </select>
                      ) : (
                        <input
                          type={def.dataType === "number" ? "number" : "text"}
                          step={def.dataType === "number" ? "any" : undefined}
                          value={specValues[def.id] || ""}
                          onChange={(e) => handleSpecChange(def.id, e.target.value)}
                          placeholder={`Enter ${def.name.toLowerCase()}${def.unit ? ` in ${def.unit}` : ""}...`}
                          className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      )}
                      <div className="flex gap-2 mt-1">
                        {def.showInCard && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded">Card</span>
                        )}
                        {def.showInDetail && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded">Detail</span>
                        )}
                        {def.showInCompare && (
                          <span className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded">Compare</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border px-6 py-4">
          <Link
            href="/admin/phones"
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Cancel
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Saving...
                </>
              ) : (
                "Create Phone"
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
