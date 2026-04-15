import Image from "next/image";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import prisma from "@/lib/prisma";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import PhoneCard from "@/components/public/PhoneCard";

interface BrandWithPhones {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  website: string | null;
  country: string | null;
  foundedYear: number | null;
  phoneCount: number;
  phones: Array<{
    id: string;
    name: string;
    slug: string;
    mainImage: string | null;
    priceUsd: number | null;
    priceDisplay: string | null;
    marketStatus: string;
    releaseDate: string | null;
    reviewScore: number | null;
    updatedAt: Date;
    specs: Array<{
      id: string;
      value: string;
      numericValue: number | null;
      spec: {
        id: string;
        key: string;
        name: string;
        icon: string | null;
        unit: string | null;
        showInCard: boolean;
        isHighlighted: boolean;
        sortOrder: number;
        group: {
          id: string;
          name: string;
          slug: string;
          icon: string | null;
        };
      };
    }>;
  }>;
}

async function getBrand(slug: string): Promise<BrandWithPhones | null> {
  const brand = await prisma.brand.findUnique({
    where: { slug },
    include: {
      phones: {
        where: { isPublished: true },
        include: {
          specs: {
            include: {
              spec: {
                include: { group: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return brand as unknown as BrandWithPhones | null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const brand = await getBrand(params.slug);
  if (!brand) return { title: "Brand Not Found" };

  const title = `${brand.name} Phones - Specifications & Prices | MobilePlatform`;
  const description = brand.description
    || `Browse all ${brand.name} smartphones. Compare specs, prices, and reviews for ${brand.phones.length} ${brand.name} phones.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      siteName: "MobilePlatform",
    },
  };
}

export default async function BrandDetailPage({ params }: { params: { slug: string } }) {
  const brand = await getBrand(params.slug);
  if (!brand) notFound();

  const availableCount = brand.phones.filter((p) => p.marketStatus === "available").length;
  const comingSoonCount = brand.phones.filter((p) => p.marketStatus === "coming_soon").length;

  // Get price range
  const prices = brand.phones
    .map((p) => p.priceUsd)
    .filter((p): p is number => p !== null);
  const minPrice = prices.length > 0 ? Math.min(...prices) : null;
  const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      {/* Brand Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 py-16 sm:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.15),transparent_60%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-blue-200/60 mb-8">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            <Link href="/brands" className="hover:text-white transition-colors">Brands</Link>
            <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            <span className="text-white">{brand.name}</span>
          </nav>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Brand Logo */}
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10">
              {brand.logo ? (
                <Image src={brand.logo} alt={brand.name} width={56} height={56} className="w-14 h-14 object-contain" />
              ) : (
                <span className="text-3xl font-bold text-white">{brand.name.charAt(0)}</span>
              )}
            </div>

            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{brand.name}</h1>
              {brand.description && (
                <p className="text-blue-200/70 max-w-2xl text-sm sm:text-base">{brand.description}</p>
              )}
              <div className="flex flex-wrap items-center gap-3 mt-4">
                {brand.country && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-sm text-blue-200">
                    <Icon icon="mdi:map-marker" className="w-4 h-4" />
                    {brand.country}
                  </span>
                )}
                {brand.foundedYear && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-sm text-blue-200">
                    <Icon icon="mdi:calendar" className="w-4 h-4" />
                    Founded {brand.foundedYear}
                  </span>
                )}
                {brand.website && (
                  <a
                    href={brand.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/10 rounded-full text-sm text-blue-200 hover:bg-white/20 transition-colors"
                  >
                    <Icon icon="mdi:web" className="w-4 h-4" />
                    Website
                    <Icon icon="mdi:open-in-new" className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-2xl font-bold text-white">{brand.phones.length}</p>
              <p className="text-sm text-blue-200/60">Total Phones</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-2xl font-bold text-green-400">{availableCount}</p>
              <p className="text-sm text-blue-200/60">Available</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-2xl font-bold text-amber-400">{comingSoonCount}</p>
              <p className="text-sm text-blue-200/60">Coming Soon</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-2xl font-bold text-white">
                {minPrice && maxPrice
                  ? minPrice === maxPrice
                    ? `$${minPrice.toLocaleString()}`
                    : `$${minPrice.toLocaleString()} - $${maxPrice.toLocaleString()}`
                  : "N/A"
                }
              </p>
              <p className="text-sm text-blue-200/60">Price Range</p>
            </div>
          </div>
        </div>
      </section>

      {/* Phones Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            All {brand.name} Phones
            <span className="text-gray-400 font-normal ml-2">({brand.phones.length})</span>
          </h2>
        </div>

        {brand.phones.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {brand.phones.map((phone) => (
              <PhoneCard key={phone.id} phone={{...phone, reviewScore: phone.reviewScore ?? 0, brand: { name: brand.name, slug: brand.slug }}} variant="default" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Icon icon="mdi:cellphone-off" className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No phones listed yet</h3>
            <p className="text-gray-500">Check back soon for {brand.name} phones.</p>
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
