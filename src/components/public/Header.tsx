"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";

const navItems = [
  { name: "Phones", href: "/phones", icon: "mdi:cellphone" },
  { name: "Compare", href: "/compare", icon: "mdi:compare" },
  { name: "Brands", href: "/brands", icon: "mdi:domain" },
  { name: "News", href: "/news", icon: "mdi:newspaper-variant-outline" },
];

export default function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Array<{
    id: string; name: string; slug: string; brand: { name: string };
    priceUsd: number | null; priceDisplay: string | null;
  }>>([]);
  const [scrolled, setScrolled] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    if (!query.trim()) { setSearchResults([]); return; }
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/phones?q=${encodeURIComponent(query)}&limit=6`);
        const data = await res.json();
        if (data.success) setSearchResults(data.data);
      } catch { setSearchResults([]); }
    }, 250);
  };

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-lg shadow-black/[0.03] border-b border-gray-200/50"
            : "bg-white border-b border-gray-100"
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
                <span className="text-gray-900">Platform</span>
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
                        ? "text-blue-600 bg-blue-50"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
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
                className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                aria-label="Search"
              >
                <Icon icon="mdi:magnify" width={20} />
              </button>

              {/* Admin Link */}
              <Link
                href="/admin"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
              >
                <Icon icon="mdi:shield-crown-outline" width={16} />
                Admin
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2.5 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
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
          <div className="px-4 py-3 space-y-1 bg-white">
            {navItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  <Icon icon={item.icon} width={20} />
                  {item.name}
                </Link>
              );
            })}
            <Link
              href="/admin"
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50"
            >
              <Icon icon="mdi:shield-crown-outline" width={20} />
              Admin Panel
            </Link>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60]">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }}
          />
          <div className="relative max-w-2xl mx-auto mt-20 px-4">
            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border">
              <div className="flex items-center gap-3 px-5 py-4 border-b">
                <Icon icon="mdi:magnify" width={22} className="text-gray-400 flex-shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search for any phone..."
                  className="flex-1 text-lg outline-none placeholder-gray-400"
                />
                <button
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Icon icon="mdi:close" width={18} className="text-gray-400" />
                </button>
              </div>

              {searchResults.length > 0 && (
                <div className="max-h-80 overflow-y-auto">
                  {searchResults.map((phone) => (
                    <Link
                      key={phone.id}
                      href={`/phones/${phone.slug}`}
                      onClick={() => { setSearchOpen(false); setSearchQuery(""); setSearchResults([]); }}
                      className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon icon="mdi:cellphone" width={24} className="text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{phone.name}</p>
                        <p className="text-sm text-gray-500">{phone.brand?.name}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-blue-600">
                          {phone.priceDisplay || (phone.priceUsd ? `$${phone.priceUsd.toLocaleString()}` : "")}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {searchQuery && searchResults.length === 0 && (
                <div className="px-5 py-8 text-center text-gray-500">
                  <Icon icon="mdi:cellphone-off" width={40} className="mx-auto mb-2 text-gray-300" />
                  <p className="font-medium">No phones found</p>
                  <p className="text-sm mt-1">Try a different search term</p>
                </div>
              )}

              {!searchQuery && (
                <div className="px-5 py-6 text-center text-gray-400">
                  <p className="text-sm">Start typing to search phones, brands, or specs</p>
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <kbd className="px-2 py-0.5 bg-gray-100 rounded text-xs font-mono text-gray-500">ESC</kbd>
                    <span className="text-xs">to close</span>
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
