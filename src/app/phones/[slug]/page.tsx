import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const specIconMap: Record<string, string> = {
  storage: "💾", ram: "🧠", main_camera: "📷", front_camera: "🤳",
  display_size: "📺", battery: "🔋", fingerprint_sensor: "👆", charger: "⚡",
  resistance_rating: "💧", wifi: "📶", glass_protection: "🛡️", bluetooth: "📡",
  display_type: "📺", resolution: "🔲", refresh_rate: "🔄", camera_features: "🎯",
  processor: "⚙️", os: "📱", wireless_charging: "🔌", five_g: "📡",
  nfc: "📲", dimensions: "📐", weight: "⚖️", colors: "🎨",
  face_unlock: "👤",
};

async function getPhone(slug: string) {
  const phone = await prisma.phone.findUnique({
    where: { slug },
    include: {
      brand: true,
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { sortOrder: "asc" } },
      specs: {
        include: {
          spec: {
            include: { group: true },
          },
        },
      },
      faqs: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { isApproved: true },
        include: {
          user: { select: { name: true, avatar: true } },
          ratings: { include: { category: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      discussions: {
        include: {
          user: { select: { name: true } },
          _count: { select: { replies: true } },
        },
        orderBy: { createdAt: "desc" },
        take: 5,
      },
    },
  });

  if (phone) {
    await prisma.phone.update({
      where: { id: phone.id },
      data: { viewCount: { increment: 1 } },
    });
  }

  return phone;
}

async function getRelatedPhones(brandId: string, phoneId: string) {
  return prisma.phone.findMany({
    where: { brandId, isPublished: true, id: { not: phoneId } },
    include: { brand: { select: { name: true, slug: true } } },
    take: 4,
  });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const phone = await prisma.phone.findUnique({
    where: { slug: params.slug },
    include: { brand: true },
  });

  if (!phone) return { title: "Phone Not Found" };

  return {
    title: `${phone.name} Specifications, Price & Review - MobilePlatform`,
    description: phone.overview || `Full specifications and review of ${phone.name} by ${phone.brand.name}`,
    openGraph: {
      title: `${phone.name} - MobilePlatform`,
      description: phone.overview || `${phone.name} specifications and review`,
      type: "website",
    },
  };
}

export default async function PhoneDetailPage({ params }: { params: { slug: string } }) {
  const phone = await getPhone(params.slug);
  if (!phone) notFound();

  const relatedPhones = await getRelatedPhones(phone.brandId, phone.id);

  // Group specs by their group
  const groupedSpecs: Record<string, { group: { name: string; slug: string; icon: string | null; sortOrder: number }; specs: typeof phone.specs }> = {};
  for (const ps of phone.specs) {
    const groupSlug = ps.spec.group.slug;
    if (!groupedSpecs[groupSlug]) {
      groupedSpecs[groupSlug] = { group: ps.spec.group, specs: [] };
    }
    groupedSpecs[groupSlug].specs.push(ps);
  }
  const sortedGroups = Object.values(groupedSpecs).sort((a, b) => a.group.sortOrder - b.group.sortOrder);

  // Key specs (highlighted)
  const keySpecs = phone.specs
    .filter((s) => s.spec.isHighlighted)
    .sort((a, b) => a.spec.sortOrder - b.spec.sortOrder);

  const statusColors: Record<string, string> = {
    available: "text-green-600 bg-green-50 border-green-200",
    coming_soon: "text-amber-600 bg-amber-50 border-amber-200",
    discontinued: "text-gray-500 bg-gray-100 border-gray-200",
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold">
              <span className="text-blue-600">Mobile</span>Platform
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/phones" className="text-sm font-medium text-gray-700 hover:text-blue-600">Phones</Link>
              <Link href="/compare" className="text-sm font-medium text-gray-700 hover:text-blue-600">Compare</Link>
              <Link href="/news" className="text-sm font-medium text-gray-700 hover:text-blue-600">News</Link>
              <Link href="/brands" className="text-sm font-medium text-gray-700 hover:text-blue-600">Brands</Link>
            </nav>
            <Link href="/admin" className="text-sm text-gray-500 hover:text-blue-600 hidden md:inline">Admin</Link>
          </div>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 py-3">
        <nav className="flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href={`/phones?brand=${phone.brand.slug}`} className="hover:text-blue-600">{phone.brand.name}</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{phone.name}</span>
        </nav>
      </div>

      {/* Phone Header */}
      <section className="max-w-7xl mx-auto px-4 pb-8">
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Image */}
              <div className="md:w-1/3">
                <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl flex items-center justify-center text-8xl">
                  📱
                </div>
                {phone.images.length > 0 && (
                  <div className="flex gap-2 mt-4 overflow-x-auto">
                    {phone.images.map((img) => (
                      <div key={img.id} className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 flex items-center justify-center text-2xl">
                        📱
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="md:w-2/3">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{phone.name}</h1>

                <div className="flex flex-wrap items-center gap-3 mb-6">
                  <span className={`px-3 py-1 rounded-full border text-sm font-medium ${statusColors[phone.marketStatus] || ""}`}>
                    {phone.marketStatus.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                  </span>
                  {phone.releaseDate && (
                    <span className="text-sm text-gray-500">Released: {phone.releaseDate}</span>
                  )}
                  <Link href={`/phones?brand=${phone.brand.slug}`} className="text-sm text-blue-600 hover:underline font-medium">
                    {phone.brand.name}
                  </Link>
                </div>

                <div className="text-3xl font-bold text-blue-600 mb-6">
                  {phone.priceDisplay || (phone.priceUsd ? `$${phone.priceUsd.toLocaleString()}` : "Price TBA")}
                </div>

                {phone.variants.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm font-medium text-gray-700 mb-2">Variants:</p>
                    <div className="flex flex-wrap gap-2">
                      {phone.variants.map((v) => (
                        <span
                          key={v.id}
                          className={`px-3 py-1.5 rounded-lg border text-sm ${v.isDefault ? "border-blue-500 bg-blue-50 text-blue-700" : "border-gray-200 text-gray-700"}`}
                        >
                          {v.name}
                          {v.priceUsd && <span className="ml-1 text-gray-500">${v.priceUsd}</span>}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Specs Card */}
                {keySpecs.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-5 mb-4">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Key Specifications</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {keySpecs.map((s) => (
                        <div key={s.spec.key} className="flex items-center gap-2">
                          <span className="text-xl">{specIconMap[s.spec.key] || "📌"}</span>
                          <div>
                            <p className="text-xs text-gray-500">{s.spec.name}</p>
                            <p className="text-sm font-semibold text-gray-900">
                              {s.value}{s.spec.unit ? ` ${s.spec.unit}` : ""}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <a href="#full-specs" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium text-sm">
                  See Full Specifications
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </a>

                <p className="text-xs text-gray-400 mt-4">
                  Updated: {new Date(phone.updatedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Nav Tabs */}
          <div className="border-t bg-gray-50 px-6 overflow-x-auto">
            <div className="flex gap-0">
              {["Overview", "Specifications", "Reviews", "Discussions", "FAQs"].map((tab) => (
                <a
                  key={tab}
                  href={`#${tab.toLowerCase()}`}
                  className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-white border-b-2 border-transparent hover:border-blue-600 transition-colors whitespace-nowrap"
                >
                  {tab}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Content Sections */}
      <div className="max-w-7xl mx-auto px-4 pb-12 space-y-8">
        {/* Overview */}
        {phone.overview && (
          <section id="overview" className="bg-white rounded-2xl border p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Overview</h2>
            <p className="text-gray-700 leading-relaxed">{phone.overview}</p>
          </section>
        )}

        {/* Full Specifications */}
        <section id="full-specs" className="bg-white rounded-2xl border p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Full Specifications</h2>
          <div className="space-y-6">
            {sortedGroups.map(({ group, specs }) => (
              <div key={group.slug}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  {group.icon && <span>{specIconMap[group.slug] || "📋"}</span>}
                  {group.name}
                </h3>
                <div className="border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <tbody className="divide-y">
                      {specs
                        .filter((s) => s.spec.showInDetail)
                        .sort((a, b) => a.spec.sortOrder - b.spec.sortOrder)
                        .map((s) => (
                          <tr key={s.spec.key} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-500 font-medium w-1/3 bg-gray-50/50">
                              <div className="flex items-center gap-2">
                                <span>{specIconMap[s.spec.key] || "📌"}</span>
                                {s.spec.name}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-900">
                              {s.value}{s.spec.unit ? ` ${s.spec.unit}` : ""}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Reviews */}
        <section id="reviews" className="bg-white rounded-2xl border p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Reviews</h2>
          {phone.reviews.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">No reviews yet</p>
              <p className="text-sm">Be the first to review this phone</p>
            </div>
          ) : (
            <div className="space-y-4">
              {phone.reviews.map((review) => (
                <div key={review.id} className="border rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-700">
                      {review.user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">{review.user.name}</p>
                      <p className="text-xs text-gray-500">{new Date(review.createdAt).toLocaleDateString()}</p>
                    </div>
                    {review.overallScore && (
                      <span className="ml-auto text-sm font-bold text-yellow-600">
                        ⭐ {review.overallScore.toFixed(1)}
                      </span>
                    )}
                  </div>
                  {review.title && <h4 className="font-medium text-gray-900 mb-1">{review.title}</h4>}
                  {review.content && <p className="text-sm text-gray-700">{review.content}</p>}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Discussions */}
        <section id="discussions" className="bg-white rounded-2xl border p-6 md:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Discussions</h2>
          {phone.discussions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg mb-2">No discussions yet</p>
              <p className="text-sm">Start a discussion about this phone</p>
            </div>
          ) : (
            <div className="space-y-3">
              {phone.discussions.map((disc) => (
                <div key={disc.id} className="border rounded-xl p-4 hover:bg-gray-50">
                  <h4 className="font-medium text-gray-900">{disc.title}</h4>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span>{disc.user.name}</span>
                    <span>{disc._count.replies} replies</span>
                    <span>{new Date(disc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* FAQs */}
        {phone.faqs.length > 0 && (
          <section id="faqs" className="bg-white rounded-2xl border p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {phone.faqs.map((faq) => (
                <details key={faq.id} className="border rounded-xl overflow-hidden group">
                  <summary className="px-4 py-3 cursor-pointer font-medium text-gray-900 hover:bg-gray-50 flex items-center justify-between">
                    {faq.question}
                    <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>
                  <div className="px-4 pb-4 text-sm text-gray-700">{faq.answer}</div>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* Related Phones */}
        {relatedPhones.length > 0 && (
          <section className="bg-white rounded-2xl border p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">More from {phone.brand.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {relatedPhones.map((rp) => (
                <Link key={rp.id} href={`/phones/${rp.slug}`} className="border rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="w-full aspect-square bg-gray-100 rounded-lg flex items-center justify-center text-4xl mb-3">📱</div>
                  <h3 className="font-medium text-gray-900 text-sm">{rp.name}</h3>
                  <p className="text-xs text-gray-500 mt-1">{rp.brand.name}</p>
                  {rp.priceDisplay && <p className="text-sm font-bold text-blue-600 mt-1">{rp.priceDisplay}</p>}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} MobilePlatform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
