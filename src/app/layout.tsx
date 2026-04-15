import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1e3a8a",
};

export const metadata: Metadata = {
  title: {
    default: "MobilePlatform - Your Ultimate Smartphone Resource",
    template: "%s | MobilePlatform",
  },
  description: "Discover smartphone specifications, reviews, comparisons, and news. Find the perfect phone with detailed specs, expert reviews, and price comparisons.",
  keywords: "smartphones, mobile phones, specifications, reviews, comparisons, prices",
  metadataBase: new URL(process.env.NEXTAUTH_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    siteName: "MobilePlatform",
    title: "MobilePlatform - Your Ultimate Smartphone Resource",
    description: "Discover smartphone specifications, reviews, comparisons, and news.",
  },
  twitter: {
    card: "summary_large_image",
    title: "MobilePlatform",
    description: "Your Ultimate Smartphone Resource",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
