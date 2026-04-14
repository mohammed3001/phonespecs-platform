import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/public/Header";
import Footer from "@/components/public/Footer";

export const metadata: Metadata = {
  title: "News & Reviews - MobilePlatform",
  description: "Latest smartphone news, expert reviews, and industry insights.",
};

export default function NewsPage() {
  // Placeholder articles until real content is added via admin
  const articles = [
    {
      id: "1",
      title: "Samsung Galaxy S25 Ultra: Everything We Know So Far",
      excerpt: "Rumors point to a titanium design, upgraded AI features, and a new Snapdragon processor. Here's everything we know about Samsung's next flagship.",
      category: "Rumor",
      date: "2024-12-15",
      readTime: "5 min read",
    },
    {
      id: "2",
      title: "Best Camera Phones of 2024: Our Top Picks",
      excerpt: "From the Pixel 8 Pro to the iPhone 15 Pro Max, we rank the best camera phones available right now based on real-world testing.",
      category: "Review",
      date: "2024-12-10",
      readTime: "8 min read",
    },
    {
      id: "3",
      title: "Xiaomi 15 Pro Leaked Specs Reveal Major Upgrades",
      excerpt: "The upcoming Xiaomi 15 Pro is expected to feature a larger battery, improved cameras, and the latest Snapdragon processor.",
      category: "Leak",
      date: "2024-12-08",
      readTime: "4 min read",
    },
    {
      id: "4",
      title: "OnePlus 13: Release Date, Price, and Specs Confirmed",
      excerpt: "OnePlus has officially confirmed the launch date and key specifications of the OnePlus 13.",
      category: "News",
      date: "2024-12-05",
      readTime: "3 min read",
    },
    {
      id: "5",
      title: "iPhone 16 Pro Max vs Samsung Galaxy S24 Ultra: Which Is Better?",
      excerpt: "We compare the two flagship titans across camera quality, performance, battery life, and value for money.",
      category: "Comparison",
      date: "2024-12-01",
      readTime: "10 min read",
    },
    {
      id: "6",
      title: "Best Budget Phones Under $300 in 2024",
      excerpt: "You don't need to spend a fortune to get a great phone. Here are the best budget options that deliver excellent value.",
      category: "Guide",
      date: "2024-11-28",
      readTime: "6 min read",
    },
  ];

  const categoryColors: Record<string, string> = {
    Rumor: "bg-purple-50 text-purple-700",
    Review: "bg-blue-50 text-blue-700",
    Leak: "bg-amber-50 text-amber-700",
    News: "bg-emerald-50 text-emerald-700",
    Comparison: "bg-rose-50 text-rose-700",
    Guide: "bg-cyan-50 text-cyan-700",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
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
        {/* Featured Article */}
        <div className="mb-10">
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:shadow-blue-600/5 transition-all duration-300 group">
            <div className="flex flex-col md:flex-row">
              <div className="md:w-2/5 h-64 md:h-auto bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
                <span className="text-7xl opacity-40">📰</span>
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
                  <span className="text-5xl opacity-30">📰</span>
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

        {/* CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-500 mb-4">
            Articles are managed from the admin panel. Add your first article to see it here.
          </p>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
          >
            Create Article (Admin)
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}
