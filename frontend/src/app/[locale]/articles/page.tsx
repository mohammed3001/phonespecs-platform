'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { articles } from '@/data/mock-articles';

const CATEGORY_COLORS: Record<string, string> = {
  news: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  comparison: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  guide: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export default function ArticlesPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const sorted = [...articles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
  const featured = sorted[0];
  const rest = sorted.slice(1);

  return (
    <>
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <BreadcrumbNav items={[{ label: 'News & Articles' }]} />

        <div className="mt-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">News & Articles</h1>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Latest mobile phone news, reviews, comparisons, and buying guides.</p>
        </div>

        {/* Featured article */}
        {featured && (
          <Link href={`/${locale}/articles/${featured.slug}`} className="block mb-10 group">
            <div className="card overflow-hidden">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                <div className="relative h-64 md:h-auto bg-gray-100 dark:bg-gray-800">
                  <Image src={featured.coverImage} alt={featured.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 50vw" />
                </div>
                <div className="p-6 md:p-8 flex flex-col justify-center">
                  <span className={`inline-flex self-start px-2.5 py-0.5 rounded-full text-xs font-medium mb-3 ${CATEGORY_COLORS[featured.category] || CATEGORY_COLORS.news}`}>
                    {featured.category.charAt(0).toUpperCase() + featured.category.slice(1)}
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {featured.title}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-3">{featured.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1"><Icon icon="mdi:account-outline" width={16} />{featured.author.name}</span>
                    <span className="flex items-center gap-1"><Icon icon="mdi:calendar-outline" width={16} />{featured.publishedAt}</span>
                    <span className="flex items-center gap-1"><Icon icon="mdi:clock-outline" width={16} />{featured.readTime} min read</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Article grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((article) => (
            <Link key={article.id} href={`/${locale}/articles/${article.slug}`} className="group">
              <div className="card overflow-hidden h-full flex flex-col">
                <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
                  <Image src={article.coverImage} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 100vw, 33vw" />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <span className={`inline-flex self-start px-2.5 py-0.5 rounded-full text-xs font-medium mb-2 ${CATEGORY_COLORS[article.category] || CATEGORY_COLORS.news}`}>
                    {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 flex-1">{article.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>{article.author.name}</span>
                    <span>&middot;</span>
                    <span>{article.publishedAt}</span>
                    <span>&middot;</span>
                    <span>{article.readTime} min</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
