'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { notFound } from 'next/navigation';
import { Icon } from '@iconify/react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { BreadcrumbNav } from '@/components/ui/BreadcrumbNav';
import { ArticleJsonLd } from '@/components/seo/JsonLd';
import { getArticleBySlug, getLatestArticles } from '@/data/mock-articles';

const CATEGORY_COLORS: Record<string, string> = {
  news: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  review: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  comparison: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  guide: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
};

export default function ArticleDetailPage() {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const slug = params?.slug as string;
  const article = getArticleBySlug(slug);

  if (!article) {
    notFound();
  }

  const latestArticles = getLatestArticles(4).filter((a) => a.slug !== slug);

  return (
    <>
      <ArticleJsonLd
        title={article.title}
        description={article.excerpt}
        image={article.coverImage}
        author={article.author.name}
        publishedAt={article.publishedAt}
        url={typeof window !== 'undefined' ? window.location.href : ''}
      />
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <BreadcrumbNav items={[
          { label: 'News & Articles', href: `/${locale}/articles` },
          { label: article.title },
        ]} />

        <div className="mt-6 flex gap-8">
          {/* Article content */}
          <article className="flex-1 min-w-0">
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium mb-4 ${CATEGORY_COLORS[article.category] || CATEGORY_COLORS.news}`}>
              {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
            </span>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {article.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-6">
              <span className="flex items-center gap-1">
                <Icon icon="mdi:account-outline" width={16} />
                {article.author.name}
              </span>
              <span className="flex items-center gap-1">
                <Icon icon="mdi:calendar-outline" width={16} />
                {article.publishedAt}
              </span>
              <span className="flex items-center gap-1">
                <Icon icon="mdi:clock-outline" width={16} />
                {article.readTime} min read
              </span>
            </div>

            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden mb-8 bg-gray-100 dark:bg-gray-800">
              <Image src={article.coverImage} alt={article.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 70vw" />
            </div>

            <div className="prose prose-lg dark:prose-invert max-w-none">
              {article.content.split('\n\n').map((paragraph, idx) => {
                if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                  return <h2 key={idx} className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">{paragraph.replace(/\*\*/g, '')}</h2>;
                }
                if (paragraph.startsWith('**')) {
                  const parts = paragraph.split('**');
                  return (
                    <div key={idx} className="mb-4">
                      {parts.map((part, i) => (
                        i % 2 === 1
                          ? <h3 key={i} className="text-lg font-bold text-gray-900 dark:text-white mt-6 mb-2">{part}</h3>
                          : <p key={i} className="text-gray-700 dark:text-gray-300 leading-relaxed">{part}</p>
                      ))}
                    </div>
                  );
                }
                if (paragraph.startsWith('- ')) {
                  return (
                    <ul key={idx} className="list-disc list-inside space-y-1 mb-4 text-gray-700 dark:text-gray-300">
                      {paragraph.split('\n').map((item, i) => (
                        <li key={i}>{item.replace(/^- /, '')}</li>
                      ))}
                    </ul>
                  );
                }
                return <p key={idx} className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{paragraph}</p>;
              })}
            </div>

            {/* Tags */}
            {article.tags.length > 0 && (
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <Icon icon="mdi:tag-outline" width={16} className="text-gray-400" />
                  {article.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 rounded-full bg-gray-100 dark:bg-gray-800 text-xs font-medium text-gray-600 dark:text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="mt-6 flex items-center gap-3">
              <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Share:</span>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                <Icon icon="mdi:facebook" width={20} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                <Icon icon="mdi:twitter" width={20} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                <Icon icon="mdi:linkedin" width={20} />
              </button>
              <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                <Icon icon="mdi:content-copy" width={20} />
              </button>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="hidden xl:block w-72 shrink-0">
            <div className="sticky top-24 space-y-6">
              <div className="card p-4">
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Icon icon="mdi:newspaper-variant-outline" width={16} className="text-brand-500" />
                  Latest Articles
                </h4>
                <div className="space-y-3">
                  {latestArticles.slice(0, 4).map((a) => (
                    <Link key={a.id} href={`/${locale}/articles/${a.slug}`} className="block p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">{a.title}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{a.publishedAt}</p>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
