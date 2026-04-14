import Link from "next/link";
import prisma from "@/lib/prisma";

async function getArticles() {
  const articles = await prisma.article.findMany({
    where: { status: "published" },
    include: {
      author: { select: { name: true } },
      category: { select: { name: true, slug: true } },
    },
    orderBy: { publishedAt: "desc" },
    take: 20,
  });
  return articles;
}

export const metadata = {
  title: "News & Articles - MobilePlatform",
  description: "Latest smartphone news, reviews, and articles from MobilePlatform.",
};

export default async function NewsPage() {
  const articles = await getArticles();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="text-xl font-bold">
              <span className="text-blue-600">Mobile</span>Platform
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link href="/phones" className="text-gray-600 hover:text-blue-600">Phones</Link>
              <Link href="/brands" className="text-gray-600 hover:text-blue-600">Brands</Link>
              <Link href="/compare" className="text-gray-600 hover:text-blue-600">Compare</Link>
              <Link href="/news" className="text-blue-600 font-medium">News</Link>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">News & Articles</h1>
          <p className="text-gray-500 mt-2">Latest smartphone news, reviews, and insights</p>
        </div>

        {articles.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <div className="text-4xl mb-4">📰</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No articles yet</h3>
            <p className="text-sm text-gray-500">Check back soon for the latest smartphone news and reviews.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <article
                key={article.id}
                className="bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all hover:-translate-y-0.5 group"
              >
                <div className="aspect-video bg-gray-100 flex items-center justify-center text-4xl">
                  📱
                </div>
                <div className="p-5">
                  {article.category && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-600 font-medium">
                      {article.category.name}
                    </span>
                  )}
                  <h2 className="text-lg font-bold text-gray-900 mt-2 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-sm text-gray-500 mt-2 line-clamp-3">{article.excerpt}</p>
                  )}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t">
                    <span className="text-xs text-gray-400">
                      {article.author?.name || "Editorial"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleDateString()
                        : "Draft"}
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="bg-gray-900 text-gray-400 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} MobilePlatform. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
