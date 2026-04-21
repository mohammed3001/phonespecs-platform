import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/site-url";

export const metadata: Metadata = {
  title: "Compare Smartphones Side by Side",
  description: "Compare smartphone specifications side by side. Add up to 4 phones and compare display, camera, battery, performance, and more.",
  alternates: {
    canonical: `${getSiteUrl()}/compare`,
  },
  openGraph: {
    title: "Compare Smartphones | MobilePlatform",
    description: "Compare smartphone specifications side by side — display, camera, battery, performance, and more.",
    url: `${getSiteUrl()}/compare`,
    type: "website",
    siteName: "MobilePlatform",
  },
  twitter: {
    card: "summary",
    title: "Compare Smartphones | MobilePlatform",
    description: "Compare smartphone specifications side by side.",
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return children;
}
