// =============================================================================
// Builder.io Catch-all Route — Renders pages built in Builder.io Visual Editor
// =============================================================================

import { fetchOneEntry } from '@builder.io/sdk-react';
import { BUILDER_API_KEY, BUILDER_PAGE_MODEL, isBuilderConfigured } from '@/lib/builder/client';
import { RenderBuilderContent } from '@/components/builder/core/RenderBuilderContent';
import Header from '@/components/public/Header';
import Footer from '@/components/public/Footer';
import { initializeWidgets } from '@/components/builder/widgets';

// Initialize all widgets on module load
initializeWidgets();

interface BuilderPageProps {
  params: Promise<{ page: string[] }>;
}

export default async function BuilderPage({ params }: BuilderPageProps) {
  const { page } = await params;
  const urlPath = '/builder/' + (page?.join('/') || '');

  // If Builder.io is not configured, show setup instructions
  if (!isBuilderConfigured()) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
          <div className="max-w-screen-lg mx-auto px-6 py-16">
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-200 dark:border-slate-700 p-8 shadow-sm">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                Page Builder Setup Required
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                To use the Page Builder, you need to configure Builder.io:
              </p>
              <ol className="list-decimal list-inside space-y-3 text-gray-700 dark:text-gray-300">
                <li>
                  Create a free account at{' '}
                  <a href="https://builder.io" target="_blank" rel="noopener noreferrer" className="text-teal-600 dark:text-teal-400 hover:underline">
                    builder.io
                  </a>
                </li>
                <li>Get your Public API Key from Builder.io Settings</li>
                <li>
                  Add <code className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-sm font-mono">NEXT_PUBLIC_BUILDER_API_KEY=your-key</code> to your <code className="px-2 py-0.5 bg-gray-100 dark:bg-slate-700 rounded text-sm font-mono">.env</code> file
                </li>
                <li>Restart the dev server</li>
              </ol>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Fetch content from Builder.io
  const content = await fetchOneEntry({
    model: BUILDER_PAGE_MODEL,
    apiKey: BUILDER_API_KEY,
    userAttributes: { urlPath },
  });

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50 dark:bg-slate-900">
        {content ? (
          <RenderBuilderContent content={content} model={BUILDER_PAGE_MODEL} />
        ) : (
          <div className="max-w-screen-lg mx-auto px-6 py-16 text-center">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Page Not Found
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">
              No Builder.io content found for this URL.
            </p>
            <a
              href="/"
              className="inline-flex items-center px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors"
            >
              Go Home
            </a>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
