import type { Metadata } from "next";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";
import { JsonLd, generateCollectionPageJsonLd, generateBreadcrumbJsonLd, generateArticleJsonLd } from "@/lib/json-ld";
import { getSiteUrl } from "@/lib/site-url";
import prisma from "@/lib/prisma";

export const metadata: Metadata = {
  title: "News & Reviews - Latest Smartphone Updates",
  description: "Latest smartphone news, expert reviews, and industry insights. Stay updated with the newest phone releases, leaks, and technology trends.",
  alternates: {
    canonical: `${getSiteUrl()}/news`,
  },
  openGraph: {
    title: "Smartphone News & Reviews | MobilePlatform",
    description: "Latest smartphone news, expert reviews, and industry insights.",
    url: `${getSiteUrl()}/news`,
    type: "website",
    siteName: "MobilePlatform",
  },
  twitter: {
    card: "summary",
    title: "Smartphone News & Reviews | MobilePlatform",
    description: "Latest smartphone news, expert reviews, and industry insights.",
  },
};

async function getArticles() {
  return prisma.article.findMany({
    where: { status: "published" },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });
}

export default async function NewsPage() {
  const dbArticles = await getArticles();

  const articles = dbArticles.map((a) => ({
    id: a.id,
    slug: a.slug,
    title: a.title,
    excerpt: a.excerpt || a.content.slice(0, 200) + "...",
    category: a.category?.name || a.type || "News",
    date: a.publishedAt
      ? new Date(a.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
      : new Date(a.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    readTime: `${Math.max(1, Math.ceil(a.content.split(/\s+/).length / 200))} min read`,
    coverImage: a.featuredImage,
  }));

  const categoryColors: Record<string, string> = {
    Rumor: "bg-purple-50 text-purple-700",
    Review: "bg-blue-50 text-blue-700",
    Leak: "bg-amber-50 text-amber-700",
    News: "bg-emerald-50 text-emerald-700",
    Comparison: "bg-rose-50 text-rose-700",
    Guide: "bg-cyan-50 text-cyan-700",
    Analysis: "bg-indigo-50 text-indigo-700",
    Technology: "bg-teal-50 text-teal-700",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <JsonLd data={[
        generateCollectionPageJsonLd("Smartphone News & Reviews", "Latest smartphone news, expert reviews, and industry insights.", "/news"),
        generateBreadcrumbJsonLd([
          { name: "Home", href: "/" },
          { name: "News", href: "/news" },
        ]),
        ...articles.map((a) => generateArticleJsonLd({ ...a, slug: a.slug })),
      ]} />
      <Header />

      {/* Page Header */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 relative overflow-hidden">
        <div className="absolute inset-0 mesh-gradient opacity-40" />
        <div className="absolute inset-0 grid-pattern" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-16 text-center">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
            News & Reviews
          </h1>
          <p className="text-blue-200/80 mt-3 text-lg max-w-xl mx-auto">
            Stay updated with the latest smartphone news, expert reviews, and industry insights
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex-1">
        {articles.length === 0 ? (
          <div className="text-center py-20">
            <span className="text-6xl mb-6 block">📰</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">No Articles Yet</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              Articles are managed from the admin panel. Published articles will appear here automatically.
            </p>
          </div>
        ) : (
          <>
            {/* Featured Article */}
            <div className="mb-10">
              <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-300 group">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-2/5 h-64 md:h-auto bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                    {articles[0].coverImage ? (
                      <img src={articles[0].coverImage} alt={articles[0].title} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-7xl opacity-40">📰</span>
                    )}
                  </div>
                  <div className="flex-1 p-6 md:p-8 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-3">
                      <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${categoryColors[articles[0].category] || "bg-gray-50 text-gray-700"}`}>
                        {articles[0].category}
                      </span>
                      <span className="text-xs text-gray-400">{articles[0].date}</span>
                      <span className="text-xs text-gray-400">{articles[0].readTime}</span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {articles[0].title}
                    </h2>
                    <p className="mt-3 text-gray-500 leading-relaxed">{articles[0].excerpt}</p>
                    <div className="mt-5">
                      <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 group-hover:gap-2.5 transition-all">
                        Read Article
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Articles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {articles.slice(1).map((article) => (
                <div key={article.id} className="group">
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-blue-600/5 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                    <div className="h-44 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                      {article.coverImage ? (
                        <img src={article.coverImage} alt={article.title} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-5xl opacity-30">📰</span>
                      )}
                    </div>
                    <div className="p-5 flex-1 flex flex-col">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`px-2.5 py-0.5 rounded-md text-xs font-semibold ${categoryColors[article.category] || "bg-gray-50 text-gray-700"}`}>
                          {article.category}
                        </span>
                        <span className="text-xs text-gray-400">{article.readTime}</span>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors leading-tight">
                        {article.title}
                      </h3>
                      <p className="mt-2 text-sm text-gray-500 line-clamp-2 flex-1">
                        {article.excerpt}
                      </p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs text-gray-400">{article.date}</span>
                        <span className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600">
                          Read
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
