"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback, Suspense } from "react";
import Link from "next/link";
import { Icon } from "@/components/shared/Icon";

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  brandName: string;
  brandSlug: string;
  marketStatus: string;
  priceUsd: number | null;
  priceDisplay: string | null;
  imagePath: string | null;
  displaySize: string | null;
  ram: string | null;
  storage: string | null;
  mainCamera: string | null;
  battery: string | null;
  processor: string | null;
  os: string | null;
  overview: string | null;
  _formatted?: {
    name?: string;
    overview?: string;
  };
}

interface FacetDistribution {
  [key: string]: Record<string, number>;
}

interface SearchState {
  q: string;
  page: string;
  sort: string;
  brand: string;
  status: string;
  priceMin: string;
  priceMax: string;
  ramMin: string;
  batteryMin: string;
}

const sortOptions = [
  { value: "", label: "Most Relevant" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "name_asc", label: "Name: A-Z" },
  { value: "name_desc", label: "Name: Z-A" },
  { value: "battery", label: "Best Battery" },
  { value: "display", label: "Largest Display" },
  { value: "ram", label: "Most RAM" },
  { value: "storage", label: "Most Storage" },
];

const statusLabels: Record<string, { label: string; icon: string; color: string }> = {
  available: { label: "Available", icon: "mdi:check-circle", color: "text-emerald-600" },
  coming_soon: { label: "Coming Soon", icon: "mdi:clock-outline", color: "text-amber-600" },
  discontinued: { label: "Discontinued", icon: "mdi:close-circle", color: "text-gray-500" },
  rumored: { label: "Rumored", icon: "mdi:help-circle", color: "text-violet-600" },
};

const priceRanges = [
  { label: "Under $300", min: "0", max: "300" },
  { label: "$300 - $500", min: "300", max: "500" },
  { label: "$500 - $800", min: "500", max: "800" },
  { label: "$800 - $1000", min: "800", max: "1000" },
  { label: "Over $1000", min: "1000", max: "" },
];

function SearchPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [results, setResults] = useState<SearchResult[]>([]);
  const [facets, setFacets] = useState<FacetDistribution>({});
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ query: "", processingTimeMs: 0, responseTimeMs: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Read state from URL
  const state: SearchState = {
    q: searchParams.get("q") || "",
    page: searchParams.get("page") || "1",
    sort: searchParams.get("sort") || "",
    brand: searchParams.get("brand") || "",
    status: searchParams.get("status") || "",
    priceMin: searchParams.get("priceMin") || "",
    priceMax: searchParams.get("priceMax") || "",
    ramMin: searchParams.get("ramMin") || "",
    batteryMin: searchParams.get("batteryMin") || "",
  };

  // Update URL with new state
  const updateUrl = useCallback((updates: Partial<SearchState>) => {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([key, value]) => {
      if (value) {
        params.set(key, String(value));
      } else {
        params.delete(key);
      }
    });
    // Reset to page 1 when filters change (unless page is being explicitly set)
    if (!("page" in updates)) {
      params.delete("page");
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname]);

  // Fetch search results
  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (state.q) params.set("q", state.q);
        if (parseInt(state.page) > 1) params.set("page", state.page);
        if (state.sort) params.set("sort", state.sort);
        if (state.brand) params.set("brand", state.brand);
        if (state.status) params.set("status", state.status);
        if (state.priceMin) params.set("priceMin", state.priceMin);
        if (state.priceMax) params.set("priceMax", state.priceMax);
        if (state.ramMin) params.set("ramMin", state.ramMin);
        if (state.batteryMin) params.set("batteryMin", state.batteryMin);

        const res = await fetch(`/api/search?${params.toString()}`);
        const data = await res.json();

        if (data.success) {
          setResults(data.data);
          setFacets(data.facets || {});
          setPagination(data.pagination);
          setMeta(data.meta);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeFilterCount = [state.brand, state.status, state.priceMin, state.priceMax, state.ramMin, state.batteryMin]
    .filter(Boolean).length;

  const clearFilters = () => {
    updateUrl({ brand: "", status: "", priceMin: "", priceMax: "", ramMin: "", batteryMin: "" });
  };

  const trackClick = (slug: string) => {
    if (state.q) {
      fetch("/api/search/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: state.q, slug }),
      }).catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-1 w-full">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  updateUrl({ q: formData.get("q") as string });
                }}
                className="relative"
              >
                <Icon icon="mdi:magnify" width={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  name="q"
                  type="text"
                  defaultValue={state.q}
                  placeholder="Search phones, brands, specs..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-base outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all"
                />
              </form>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {/* Sort Dropdown */}
              <select
                value={state.sort}
                onChange={(e) => updateUrl({ sort: e.target.value })}
                className="flex-1 sm:flex-none px-3 py-3 border border-gray-200 rounded-xl text-sm bg-white outline-none focus:border-blue-300 cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>

              {/* Filter toggle (mobile) */}
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="lg:hidden flex items-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-sm bg-white hover:bg-gray-50 transition-colors"
              >
                <Icon icon="mdi:filter-variant" width={18} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="w-5 h-5 bg-blue-600 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Result count & meta */}
          {!loading && (
            <div className="mt-3 flex items-center gap-3 text-sm text-gray-500">
              <span>
                {pagination.total} {pagination.total === 1 ? "result" : "results"}
                {state.q && <> for &ldquo;<span className="font-medium text-gray-700">{state.q}</span>&rdquo;</>}
              </span>
              <span className="text-gray-300">·</span>
              <span>{meta.processingTimeMs}ms</span>
              {activeFilterCount > 0 && (
                <>
                  <span className="text-gray-300">·</span>
                  <button onClick={clearFilters} className="text-blue-600 hover:text-blue-700 font-medium">
                    Clear filters
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          <aside className={`${filtersOpen ? "fixed inset-0 z-50 bg-white overflow-y-auto p-6 lg:relative lg:inset-auto lg:z-auto lg:bg-transparent lg:p-0" : "hidden"} lg:block lg:w-64 flex-shrink-0`}>
            {/* Mobile close button */}
            <div className="flex items-center justify-between mb-4 lg:hidden">
              <h2 className="text-lg font-bold">Filters</h2>
              <button onClick={() => setFiltersOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <Icon icon="mdi:close" width={20} />
              </button>
            </div>

            <div className="space-y-5">
              {/* Brand filter */}
              <FilterSection title="Brand" icon="mdi:domain">
                {Object.entries(facets.brandName || {})
                  .sort(([, a], [, b]) => b - a)
                  .map(([brand, count]) => {
                    const brandSlug = brand.toLowerCase().replace(/\s+/g, "-");
                    const isActive = state.brand.split(",").includes(brandSlug);
                    return (
                      <button
                        key={brand}
                        onClick={() => {
                          const currentBrands = state.brand ? state.brand.split(",") : [];
                          const newBrands = isActive
                            ? currentBrands.filter((b) => b !== brandSlug)
                            : [...currentBrands, brandSlug];
                          updateUrl({ brand: newBrands.filter(Boolean).join(",") });
                        }}
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {isActive ? (
                            <Icon icon="mdi:checkbox-marked" width={18} className="text-blue-600" />
                          ) : (
                            <Icon icon="mdi:checkbox-blank-outline" width={18} className="text-gray-400" />
                          )}
                          {brand}
                        </span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{count}</span>
                      </button>
                    );
                  })}
              </FilterSection>

              {/* Market Status filter */}
              <FilterSection title="Status" icon="mdi:information-outline">
                {Object.entries(facets.marketStatus || {}).map(([statusKey, count]) => {
                  const info = statusLabels[statusKey] || { label: statusKey, icon: "mdi:help", color: "text-gray-500" };
                  const isActive = state.status === statusKey;
                  return (
                    <button
                      key={statusKey}
                      onClick={() => updateUrl({ status: isActive ? "" : statusKey })}
                      className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Icon icon={info.icon} width={16} className={isActive ? "text-blue-600" : info.color} />
                        {info.label}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{count}</span>
                    </button>
                  );
                })}
              </FilterSection>

              {/* Price Range filter */}
              <FilterSection title="Price Range" icon="mdi:currency-usd">
                {priceRanges.map((range) => {
                  const isActive = state.priceMin === range.min && state.priceMax === range.max;
                  return (
                    <button
                      key={range.label}
                      onClick={() => {
                        if (isActive) {
                          updateUrl({ priceMin: "", priceMax: "" });
                        } else {
                          updateUrl({ priceMin: range.min, priceMax: range.max });
                        }
                      }}
                      className={`flex items-center w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                        isActive ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <Icon
                        icon={isActive ? "mdi:radiobox-marked" : "mdi:radiobox-blank"}
                        width={16}
                        className={isActive ? "text-blue-600 mr-2" : "text-gray-400 mr-2"}
                      />
                      {range.label}
                    </button>
                  );
                })}
              </FilterSection>

              {/* RAM filter */}
              <FilterSection title="RAM" icon="mdi:memory">
                {Object.entries(facets.ram || {})
                  .sort(([a], [b]) => {
                    const numA = parseFloat(a) || 0;
                    const numB = parseFloat(b) || 0;
                    return numB - numA;
                  })
                  .map(([ram, count]) => {
                    const isActive = state.ramMin === String(parseFloat(ram) || 0);
                    return (
                      <button
                        key={ram}
                        onClick={() => updateUrl({ ramMin: isActive ? "" : String(parseFloat(ram) || 0) })}
                        className={`flex items-center justify-between w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <span>{ram}</span>
                        <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{count}</span>
                      </button>
                    );
                  })}
              </FilterSection>

              {/* OS filter */}
              {facets.os && Object.keys(facets.os).length > 0 && (
                <FilterSection title="Operating System" icon="mdi:cog">
                  {Object.entries(facets.os).map(([os, count]) => (
                    <div key={os} className="flex items-center justify-between px-3 py-2 text-sm text-gray-700">
                      <span>{os}</span>
                      <span className="text-xs text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">{count}</span>
                    </div>
                  ))}
                </FilterSection>
              )}
            </div>

            {/* Mobile apply button */}
            <div className="mt-6 lg:hidden">
              <button
                onClick={() => setFiltersOpen(false)}
                className="w-full py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Show {pagination.total} results
              </button>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1 min-w-0">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse">
                    <div className="flex gap-4">
                      <div className="w-20 h-24 bg-gray-200 rounded-xl" />
                      <div className="flex-1 space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-16" />
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-5 bg-gray-200 rounded w-20" />
                      </div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {Array.from({ length: 4 }).map((_, j) => (
                        <div key={j} className="h-3 bg-gray-100 rounded" />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : results.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {results.map((phone) => (
                    <SearchResultCard key={phone.id} phone={phone} onClickTrack={trackClick} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="mt-8 flex items-center justify-center gap-2">
                    <button
                      disabled={pagination.page <= 1}
                      onClick={() => updateUrl({ page: String(pagination.page - 1) })}
                      className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      <Icon icon="mdi:chevron-left" width={18} />
                      Previous
                    </button>

                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(pagination.totalPages, 7) }).map((_, i) => {
                        let pageNum: number;
                        if (pagination.totalPages <= 7) {
                          pageNum = i + 1;
                        } else if (pagination.page <= 4) {
                          pageNum = i + 1;
                        } else if (pagination.page >= pagination.totalPages - 3) {
                          pageNum = pagination.totalPages - 6 + i;
                        } else {
                          pageNum = pagination.page - 3 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => updateUrl({ page: String(pageNum) })}
                            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                              pageNum === pagination.page
                                ? "bg-blue-600 text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      disabled={pagination.page >= pagination.totalPages}
                      onClick={() => updateUrl({ page: String(pagination.page + 1) })}
                      className="flex items-center gap-1 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
                    >
                      Next
                      <Icon icon="mdi:chevron-right" width={18} />
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-16">
                <Icon icon="mdi:magnify-close" width={64} className="mx-auto mb-4 text-gray-300" />
                <h2 className="text-xl font-bold text-gray-900 mb-2">No results found</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  {state.q
                    ? `We couldn't find any phones matching "${state.q}". Try adjusting your search or filters.`
                    : "Try searching for a phone name, brand, or specification."}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3">
                  {activeFilterCount > 0 && (
                    <button
                      onClick={clearFilters}
                      className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                    >
                      <Icon icon="mdi:filter-off" width={16} />
                      Clear all filters
                    </button>
                  )}
                  <Link
                    href="/phones"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Icon icon="mdi:cellphone" width={16} />
                    Browse all phones
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function FilterSection({ title, icon, children }: { title: string; icon: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span className="flex items-center gap-2">
          <Icon icon={icon} width={16} className="text-gray-500" />
          {title}
        </span>
        <Icon icon={open ? "mdi:chevron-up" : "mdi:chevron-down"} width={18} className="text-gray-400" />
      </button>
      {open && <div className="px-1 pb-2">{children}</div>}
    </div>
  );
}

function SearchResultCard({
  phone,
  onClickTrack,
}: {
  phone: SearchResult;
  onClickTrack: (slug: string) => void;
}) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    available: { label: "Available", color: "text-emerald-700 bg-emerald-50 ring-emerald-600/20" },
    coming_soon: { label: "Coming Soon", color: "text-amber-700 bg-amber-50 ring-amber-600/20" },
    discontinued: { label: "Discontinued", color: "text-gray-600 bg-gray-100 ring-gray-500/20" },
    rumored: { label: "Rumored", color: "text-violet-700 bg-violet-50 ring-violet-600/20" },
  };

  const status = statusConfig[phone.marketStatus] || statusConfig.available;

  const specs = [
    { key: "display", icon: "mdi:cellphone-screenshot", value: phone.displaySize },
    { key: "ram", icon: "mdi:memory", value: phone.ram },
    { key: "camera", icon: "mdi:camera-outline", value: phone.mainCamera },
    { key: "battery", icon: "mdi:battery-high", value: phone.battery },
    { key: "storage", icon: "mdi:harddisk", value: phone.storage },
    { key: "processor", icon: "mdi:chip", value: phone.processor },
  ].filter((s) => s.value);

  return (
    <Link
      href={`/phones/${phone.slug}`}
      onClick={() => onClickTrack(phone.slug)}
      className="block group"
    >
      <div className="bg-white rounded-2xl border border-gray-200 hover:border-blue-200 hover:shadow-lg hover:shadow-blue-600/5 transition-all duration-300 overflow-hidden h-full">
        <div className="p-5">
          <div className="flex gap-4">
            <div className="w-20 h-24 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:from-blue-50 group-hover:to-violet-50 transition-colors">
              <Icon icon="mdi:cellphone" width={36} className="text-gray-300 group-hover:text-blue-400 transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{phone.brandName}</p>
              <h3
                className="font-bold text-gray-900 leading-tight group-hover:text-blue-600 transition-colors mt-0.5 text-sm"
                dangerouslySetInnerHTML={{
                  __html: phone._formatted?.name || phone.name,
                }}
              />
              <div className="mt-2 flex items-center gap-2">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
                  {phone.priceDisplay || (phone.priceUsd ? `$${Number(phone.priceUsd).toLocaleString()}` : "TBA")}
                </span>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold ring-1 ring-inset mt-1 ${status.color}`}>
                {status.label}
              </span>
            </div>
          </div>

          {/* Key specs grid */}
          {specs.length > 0 && (
            <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-1.5">
              {specs.slice(0, 4).map((spec) => (
                <div key={spec.key} className="flex items-center gap-1.5 text-xs text-gray-600">
                  <Icon icon={spec.icon} width={13} className="text-gray-400 flex-shrink-0" />
                  <span className="truncate">{spec.value}</span>
                </div>
              ))}
            </div>
          )}

          {/* Overview snippet */}
          {phone._formatted?.overview && (
            <p
              className="mt-3 text-xs text-gray-500 line-clamp-2"
              dangerouslySetInnerHTML={{ __html: phone._formatted.overview }}
            />
          )}
        </div>
      </div>
    </Link>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
        </div>
      }
    >
      <SearchPageContent />
    </Suspense>
  );
}
