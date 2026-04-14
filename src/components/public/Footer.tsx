import Link from "next/link";
import { Icon } from "@iconify/react";

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 mt-auto">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                <Icon icon="mdi:cellphone" className="text-white" width={20} />
              </div>
              <span className="text-xl font-bold">
                <span className="text-blue-400">Mobile</span>
                <span className="text-white">Platform</span>
              </span>
            </Link>
            <p className="mt-4 text-sm leading-relaxed max-w-sm">
              Your ultimate destination for smartphone specifications, expert reviews, 
              side-by-side comparisons, and the latest mobile technology news.
            </p>
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: "mdi:twitter", href: "#" },
                { icon: "mdi:facebook", href: "#" },
                { icon: "mdi:instagram", href: "#" },
                { icon: "mdi:youtube", href: "#" },
              ].map((social) => (
                <a
                  key={social.icon}
                  href={social.href}
                  className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors"
                >
                  <Icon icon={social.icon} width={18} className="text-gray-400 group-hover:text-white" />
                </a>
              ))}
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Explore</h4>
            <ul className="space-y-3">
              {[
                { name: "All Phones", href: "/phones" },
                { name: "Compare Phones", href: "/compare" },
                { name: "All Brands", href: "/brands" },
                { name: "News & Reviews", href: "/news" },
                { name: "Top Rated", href: "/phones?sort=rating" },
                { name: "Latest Phones", href: "/phones?sort=newest" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm hover:text-white transition-colors inline-flex items-center gap-1.5 group">
                    <Icon icon="mdi:chevron-right" width={14} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Popular Brands */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Popular Brands</h4>
            <ul className="space-y-3">
              {[
                { name: "Samsung", href: "/phones?brand=samsung" },
                { name: "Apple", href: "/phones?brand=apple" },
                { name: "Xiaomi", href: "/phones?brand=xiaomi" },
                { name: "OnePlus", href: "/phones?brand=oneplus" },
                { name: "Google", href: "/phones?brand=google" },
                { name: "Huawei", href: "/phones?brand=huawei" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm hover:text-white transition-colors inline-flex items-center gap-1.5 group">
                    <Icon icon="mdi:chevron-right" width={14} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h4>
            <ul className="space-y-3">
              {[
                { name: "About Us", href: "/about" },
                { name: "Contact", href: "/contact" },
                { name: "Advertise", href: "/advertise" },
                { name: "Company Portal", href: "/company" },
                { name: "Privacy Policy", href: "/privacy" },
                { name: "Terms of Service", href: "/terms" },
              ].map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-sm hover:text-white transition-colors inline-flex items-center gap-1.5 group">
                    <Icon icon="mdi:chevron-right" width={14} className="text-gray-600 group-hover:text-blue-400 transition-colors" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} MobilePlatform. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacy" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                Terms
              </Link>
              <Link href="/sitemap" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
