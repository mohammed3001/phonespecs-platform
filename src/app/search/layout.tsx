import type { Metadata } from "next";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";

export const metadata: Metadata = {
  title: "Search Phones",
  description: "Search through our comprehensive database of smartphones. Filter by brand, price, specs, and more to find your perfect phone.",
  openGraph: {
    title: "Search Phones | MobilePlatform",
    description: "Search through our comprehensive database of smartphones.",
  },
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
