import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Search Smartphones - Find Your Perfect Phone",
  description: "Search smartphones by name, brand, specs, and price. Powerful search with filters, sorting, and typo tolerance powered by MobilePlatform.",
  alternates: {
    canonical: `${getSiteUrl()}/search`,
  },
  openGraph: {
    title: "Search Smartphones | MobilePlatform",
    description: "Search smartphones by name, brand, specs, and price with powerful filters and sorting.",
    url: `${getSiteUrl()}/search`,
    type: "website",
    siteName: "MobilePlatform",
  },
  twitter: {
    card: "summary",
    title: "Search Smartphones | MobilePlatform",
    description: "Search smartphones by name, brand, specs, and price with powerful filters and sorting.",
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
