import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MobilePlatform - Your Ultimate Smartphone Resource",
  description: "Discover smartphone specifications, reviews, comparisons, and news. Find the perfect phone with detailed specs, expert reviews, and price comparisons.",
  keywords: "smartphones, mobile phones, specifications, reviews, comparisons, prices",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
