"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/shared/Icon";

const sidebarGroups = [
  {
    label: "Content",
    items: [
      { name: "Dashboard", href: "/admin", icon: "mdi:view-dashboard" },
      { name: "Phones", href: "/admin/phones", icon: "mdi:cellphone" },
      { name: "Brands", href: "/admin/brands", icon: "mdi:domain" },
      { name: "Articles", href: "/admin/articles", icon: "mdi:newspaper-variant-outline" },
      { name: "Categories", href: "/admin/categories", icon: "mdi:folder-outline" },
      { name: "Tags", href: "/admin/tags", icon: "mdi:tag-outline" },
      { name: "Media Library", href: "/admin/media", icon: "mdi:image-multiple-outline" },
    ],
  },
  {
    label: "People",
    items: [
      { name: "Users", href: "/admin/users", icon: "mdi:account-group-outline" },
      { name: "Companies", href: "/admin/companies", icon: "mdi:office-building-outline" },
      { name: "Reviews", href: "/admin/reviews", icon: "mdi:star-outline" },
      { name: "Moderation", href: "/admin/moderation", icon: "mdi:shield-check-outline" },
    ],
  },
  {
    label: "Advertising",
    items: [
      { name: "Advertisers", href: "/admin/advertisers", icon: "mdi:bullhorn-outline" },
      { name: "Campaigns", href: "/admin/campaigns", icon: "mdi:target" },
      { name: "Ad Slots", href: "/admin/ad-slots", icon: "mdi:puzzle-outline" },
    ],
  },
  {
    label: "Configuration",
    items: [
      { name: "Specifications", href: "/admin/specs", icon: "mdi:tune-vertical" },
      { name: "Homepage", href: "/admin/homepage", icon: "mdi:home-outline" },
      { name: "Menus", href: "/admin/menus", icon: "mdi:menu" },
      { name: "Pages", href: "/admin/pages", icon: "mdi:file-document-outline" },
    ],
  },
  {
    label: "System",
    items: [
      { name: "Search Analytics", href: "/admin/search-analytics", icon: "mdi:chart-line" },
      { name: "Spec History", href: "/admin/spec-history", icon: "mdi:clipboard-text-clock" },
      { name: "SEO Settings", href: "/admin/seo", icon: "mdi:magnify" },
      { name: "Redirects", href: "/admin/redirects", icon: "mdi:call-missed" },
      { name: "Settings", href: "/admin/settings", icon: "mdi:cog-outline" },
      { name: "Roles & Permissions", href: "/admin/roles", icon: "mdi:shield-lock-outline" },
      { name: "Audit Log", href: "/admin/audit-log", icon: "mdi:history" },
    ],
  },
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
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 h-14 flex items-center px-4">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg mr-3 text-gray-600"
        >
          <Icon icon={sidebarOpen ? "mdi:menu-open" : "mdi:menu"} width={20} />
        </button>
        <Link href="/admin" className="text-lg font-bold flex items-center gap-2">
          <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
            <Icon icon="mdi:cellphone-cog" className="text-white" width={16} />
          </div>
          <span className="text-gray-900">Mobile<span className="text-blue-600">Platform</span></span>
          <span className="text-[10px] font-semibold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">ADMIN</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            className="text-sm text-gray-500 hover:text-gray-900 flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <Icon icon="mdi:open-in-new" width={16} />
            View Site
          </Link>
          <button className="relative p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Icon icon="mdi:bell-outline" width={20} />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            A
          </div>
        </div>
      </header>

      <div className="flex pt-14">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-14 bottom-0 bg-white border-r border-gray-200 transition-all duration-300 overflow-y-auto z-40 ${
            sidebarOpen ? "w-60" : "w-0 lg:w-[52px]"
          }`}
          style={{ scrollbarWidth: "thin" }}
        >
          <nav className="p-2 space-y-4 pb-8">
            {sidebarGroups.map((group) => (
              <div key={group.label}>
                {sidebarOpen && (
                  <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    {group.label}
                  </p>
                )}
                <div className="space-y-0.5">
                  {group.items.map((item) => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/admin" && pathname.startsWith(item.href));
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        title={item.name}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                          isActive
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                      >
                        <Icon
                          icon={item.icon}
                          width={18}
                          className={`flex-shrink-0 ${isActive ? "text-blue-600" : "text-gray-400"}`}
                        />
                        <span className={`${sidebarOpen ? "" : "lg:hidden"} whitespace-nowrap`}>
                          {item.name}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 min-h-[calc(100vh-3.5rem)] ${
            sidebarOpen ? "ml-60" : "ml-0 lg:ml-[52px]"
          }`}
        >
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
