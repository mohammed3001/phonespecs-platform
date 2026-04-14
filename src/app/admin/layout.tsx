"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const sidebarItems = [
  { name: "Dashboard", href: "/admin", icon: "📊" },
  { name: "Phones", href: "/admin/phones", icon: "📱" },
  { name: "Brands", href: "/admin/brands", icon: "🏢" },
  { name: "Articles", href: "/admin/articles", icon: "📝" },
  { name: "Categories", href: "/admin/categories", icon: "📁" },
  { name: "Tags", href: "/admin/tags", icon: "🏷️" },
  { name: "Media Library", href: "/admin/media", icon: "🖼️" },
  { name: "Users", href: "/admin/users", icon: "👥" },
  { name: "Companies", href: "/admin/companies", icon: "🏭" },
  { name: "Advertisers", href: "/admin/advertisers", icon: "📢" },
  { name: "Campaigns", href: "/admin/campaigns", icon: "🎯" },
  { name: "Ad Slots", href: "/admin/ad-slots", icon: "🧩" },
  { name: "Specifications", href: "/admin/specs", icon: "⚙️" },
  { name: "Homepage", href: "/admin/homepage", icon: "🏠" },
  { name: "Menus", href: "/admin/menus", icon: "📋" },
  { name: "Pages", href: "/admin/pages", icon: "📄" },
  { name: "SEO Settings", href: "/admin/seo", icon: "🔍" },
  { name: "Redirects", href: "/admin/redirects", icon: "↪️" },
  { name: "Settings", href: "/admin/settings", icon: "⚙️" },
  { name: "Roles & Permissions", href: "/admin/roles", icon: "🔐" },
  { name: "Audit Log", href: "/admin/audit-log", icon: "📜" },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white h-14 flex items-center px-4 shadow-lg">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-700 rounded-lg mr-3 lg:hidden"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <Link href="/admin" className="text-lg font-bold flex items-center gap-2">
          <span className="text-blue-400">Mobile</span>Platform
          <span className="text-xs bg-blue-600 px-2 py-0.5 rounded-full">Admin</span>
        </Link>
        <div className="ml-auto flex items-center gap-3">
          <Link href="/" target="_blank" className="text-sm text-gray-300 hover:text-white flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Site
          </Link>
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
            A
          </div>
        </div>
      </header>

      <div className="flex pt-14">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-14 bottom-0 bg-gray-900 text-gray-300 transition-all duration-300 overflow-y-auto z-40 ${
            sidebarOpen ? "w-64" : "w-0 lg:w-16"
          }`}
        >
          <nav className="p-2 space-y-0.5">
            {sidebarItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "hover:bg-gray-800 hover:text-white"
                  }`}
                >
                  <span className="text-base flex-shrink-0">{item.icon}</span>
                  <span className={`${sidebarOpen ? "" : "lg:hidden"} whitespace-nowrap`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? "ml-64" : "ml-0 lg:ml-16"
          }`}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
