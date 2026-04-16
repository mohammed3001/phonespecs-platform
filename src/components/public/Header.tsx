"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import { Icon } from "@/components/shared/Icon";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

const navItems = [
  { name: "Phones", href: "/phones", icon: "mdi:cellphone" },
  { name: "Compare", href: "/compare", icon: "mdi:compare" },
  { name: "Find My Phone", href: "/find-my-phone", icon: "mdi:compass-outline" },
  { name: "Brands", href: "/brands", icon: "mdi:domain" },
  { name: "News", href: "/news", icon: "mdi:newspaper-variant-outline" },
];

interface AutocompletePhone {
  name: string;
  slug: string;
  brandName: string;
  priceDisplay: string | null;
  priceUsd: number | null;
  marketStatus: string;
  _formatted?: { name: string };
}

interface AutocompleteBrand {
  name: string;
  slug: string;
  phoneCount: number;
  _formatted?: { name: string };
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [phones, setPhones] = useState<AutocompletePhone[]>([]);
  const [brands, setBrands] = useState<AutocompleteBrand[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout>();
  const overlayRef = useRef<HTMLDivElement>(null);

  // Total selectable items count
  const totalItems = phones.length + brands.length + (searchQuery.trim() ? 1 : 0); // +1 for "View all results"

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [searchOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
    setSearchQuery("");
    setPhones([]);
    setBrands([]);
  }, [pathname]);

  const closeSearch = useCallback(() => {
    setSearchOpen(false);
    setSearchQuery("");
    setPhones([]);
    setBrands([]);
    setSelectedIndex(-1);
    setLoading(false);
  }, []);

  // Keyboard shortcuts: Ctrl+K or / to open search, ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "/" && !searchOpen && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape" && searchOpen) {
        e.preventDefault();
        closeSearch();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [searchOpen, closeSearch]);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    setSelectedIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setPhones([]);
      setBrands([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search/autocomplete?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.success) {
          setPhones(data.phones || []);
          setBrands(data.brands || []);
        }
      } catch {
        setPhones([]);
        setBrands([]);
      } finally {
        setLoading(false);
      }
    }, 150);
  }, []);

  const handleKeyNav = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalItems - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalItems - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex === -1 || selectedIndex === phones.length + brands.length) {
        // Go to full search
        if (searchQuery.trim()) {
          router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
          closeSearch();
        }
      } else if (selectedIndex < phones.length) {
        router.push(`/phones/${phones[selectedIndex].slug}`);
        trackClick(searchQuery, phones[selectedIndex].slug);
        closeSearch();
      } else {
        const brandIdx = selectedIndex - phones.length;
        router.push(`/brands/${brands[brandIdx].slug}`);
        closeSearch();
      }
    }
  };

  const trackClick = (query: string, slug: string) => {
    fetch("/api/search/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query, slug }),
    }).catch(() => {});
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white dark:bg-gray-800/95 backdrop-blur-xl shadow-lg shadow-black/[0.03] border-b border-gray-200 dark:border-gray-700/50"
            : "bg-white dark:bg-gray-800 border-b border-gray-100"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 group">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:shadow-blue-600/40 transition-shadow">
                <Icon icon="mdi:cellphone" className="text-white" width={18} />
              </div>
              <span className="text-xl font-bold">
                <span className="bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Mobile</span>
                <span className="text-gray-900 dark:text-white">Platform</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    <Icon icon={item.icon} width={16} />
                    {item.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <button
                onClick={() => setSearchOpen(true)}
                className="flex items-center gap-2 px-3 py-2 text-gray-400 hover:text-blue-600 bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all border border-gray-200 dark:border-gray-700 hover:border-blue-200"
                aria-label="Search"
              >
                <Icon icon="mdi:magnify" width={18} />
                <span className="hidden sm:inline text-sm">Search...</span>
                <kbd className="hidden lg:inline-flex items-center px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded text-[10px] font-mono text-gray-400 border border-gray-200 dark:border-gray-700 ml-2">
                  ⌘K
                </kbd>
              </button>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Admin Link */}
              <Link
                href="/admin"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
              >
                <Icon icon="mdi:shield-crown-outline" width={16} />
                Admin
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-xl transition-all"
                aria-label="Menu"
              >
                <Icon icon={mobileMenuOpen ? "mdi:close" : "mdi:menu"} width={22} />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <div
          className={`md:hidden transition-all duration-300 overflow-hidden ${
            mobileMenuOpen ? "max-h-96 border-t" : "max-h-0"
          }`}
        >
          <div className="px-4 py-3 space-y-1 bg-white dark:bg-gray-800">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  }`}
                >
                  <Icon icon={item.icon} width={20} />
                  {item.name}
                </Link>
              );
            })}
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50"
            >
              <Icon icon="mdi:shield-crown-outline" width={20} />
              Admin Panel
            </Link>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60]" ref={overlayRef}>
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeSearch}
          />
          <div className="relative max-w-2xl mx-auto mt-16 sm:mt-20 px-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700 animate-in fade-in slide-in-from-top-4 duration-200">
              {/* Search Input */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
                <Icon icon="mdi:magnify" width={22} className="text-blue-500 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyDown={handleKeyNav}
                  placeholder="Search phones, brands, specs..."
                  className="flex-1 text-lg outline-none placeholder-gray-400 bg-transparent dark:text-white"
                  autoComplete="off"
                />
                {loading && (
                  <div className="w-5 h-5 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin flex-shrink-0" />
                )}
                <button
                  onClick={closeSearch}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors flex-shrink-0"
                >
                  <Icon icon="mdi:close" width={18} className="text-gray-400" />
                </button>
              </div>

              {/* Results */}
              {(phones.length > 0 || brands.length > 0) && (
                <div className="max-h-[60vh] overflow-y-auto">
                  {/* Phones */}
                  {phones.length > 0 && (
                    <div>
                      <div className="px-5 pt-3 pb-1">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Phones</p>
                      </div>
                      {phones.map((phone, i) => (
                        <Link
                          key={phone.slug}
                          href={`/phones/${phone.slug}`}
                          onClick={() => { trackClick(searchQuery, phone.slug); closeSearch(); }}
                          className={`flex items-center gap-4 px-5 py-3 transition-colors ${
                            selectedIndex === i ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          }`}
                        >
                          <div className="w-11 h-11 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Icon icon="mdi:cellphone" width={22} className="text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-semibold text-gray-900 dark:text-white truncate text-sm"
                              dangerouslySetInnerHTML={{
                                __html: phone._formatted?.name || phone.name,
                              }}
                            />
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-gray-500 dark:text-gray-400">{phone.brandName}</span>
                              {phone.marketStatus === "available" && (
                                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-blue-600 text-sm">
                              {phone.priceDisplay || (phone.priceUsd ? `$${Number(phone.priceUsd).toLocaleString()}` : "")}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Brands */}
                  {brands.length > 0 && (
                    <div>
                      <div className="px-5 pt-3 pb-1 border-t border-gray-100">
                        <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Brands</p>
                      </div>
                      {brands.map((brand, i) => (
                        <Link
                          key={brand.slug}
                          href={`/brands/${brand.slug}`}
                          onClick={closeSearch}
                          className={`flex items-center gap-4 px-5 py-3 transition-colors ${
                            selectedIndex === phones.length + i ? "bg-blue-50 dark:bg-blue-900/20" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                          }`}
                        >
                          <div className="w-11 h-11 bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl flex items-center justify-center flex-shrink-0">
                            <Icon icon="mdi:domain" width={22} className="text-violet-500" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p
                              className="font-semibold text-gray-900 dark:text-white truncate text-sm"
                              dangerouslySetInnerHTML={{
                                __html: brand._formatted?.name || brand.name,
                              }}
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{brand.phoneCount} phones</p>
                          </div>
                          <Icon icon="mdi:chevron-right" width={18} className="text-gray-300" />
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* View all results */}
                  {searchQuery.trim() && (
                    <div className="border-t border-gray-100">
                      <Link
                        href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                        onClick={closeSearch}
                        className={`flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-medium transition-colors ${
                          selectedIndex === phones.length + brands.length
                            ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700"
                            : "text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        }`}
                      >
                        <Icon icon="mdi:magnify" width={16} />
                        View all results for &ldquo;{searchQuery.trim()}&rdquo;
                        <Icon icon="mdi:arrow-right" width={16} />
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Loading state */}
              {loading && phones.length === 0 && brands.length === 0 && (
                <div className="px-5 py-8 text-center">
                  <div className="w-8 h-8 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto" />
                  <p className="text-sm text-gray-400 mt-3">Searching...</p>
                </div>
              )}

              {/* No results */}
              {!loading && searchQuery.trim() && phones.length === 0 && brands.length === 0 && (
                <div className="px-5 py-8 text-center text-gray-500 dark:text-gray-400">
                  <Icon icon="mdi:cellphone-off" width={40} className="mx-auto mb-2 text-gray-300" />
                  <p className="font-medium">No results found</p>
                  <p className="text-sm mt-1">Try a different search term or check your spelling</p>
                  <Link
                    href={`/search?q=${encodeURIComponent(searchQuery.trim())}`}
                    onClick={closeSearch}
                    className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-3"
                  >
                    Advanced search
                    <Icon icon="mdi:arrow-right" width={14} />
                  </Link>
                </div>
              )}

              {/* Empty state */}
              {!searchQuery && (
                <div className="px-5 py-6">
                  <p className="text-center text-sm text-gray-400 mb-4">
                    Search phones, brands, or specs
                  </p>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    {["Samsung Galaxy", "iPhone 15", "Pixel 8", "Xiaomi 14", "OnePlus 12"].map((term) => (
                      <button
                        key={term}
                        onClick={() => handleSearch(term)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-900 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 rounded-lg transition-colors border border-gray-200 dark:border-gray-700 hover:border-blue-200"
                      >
                        {term}
                      </button>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-4 mt-4 text-[11px] text-gray-400">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono border border-gray-200 dark:border-gray-700">↑↓</kbd>
                      navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono border border-gray-200 dark:border-gray-700">↵</kbd>
                      select
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-gray-100 rounded font-mono border border-gray-200 dark:border-gray-700">esc</kbd>
                      close
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-16" />
    </>
  );
}
