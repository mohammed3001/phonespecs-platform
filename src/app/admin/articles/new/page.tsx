"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewArticlePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [article, setArticle] = useState({
    title: "",
    content: "",
    excerpt: "",
    status: "draft",
    metaTitle: "",
    metaDescription: "",
  });

  const handleSave = async () => {
    if (!article.title.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/articles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(article),
      });
      const data = await res.json();
      if (data.success) {
        router.push("/admin/articles");
      }
    } catch {
      alert("Failed to save article");
    }
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/articles" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">New Article</h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={article.status}
            onChange={(e) => setArticle({ ...article, status: e.target.value })}
            className="px-3 py-2 border rounded-lg text-sm"
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
          </select>
          <button
            onClick={handleSave}
            disabled={saving || !article.title.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Article"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <input
              type="text"
              value={article.title}
              onChange={(e) => setArticle({ ...article, title: e.target.value })}
              placeholder="Article title..."
              className="w-full text-2xl font-bold text-gray-900 focus:outline-none placeholder-gray-300"
            />
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Content</label>
            <div className="border rounded-lg">
              {/* Toolbar */}
              <div className="flex items-center gap-1 p-2 border-b bg-gray-50 flex-wrap">
                {["H1", "H2", "H3", "B", "I", "U", "Link", "Image", "List", "Table", "Quote", "Code"].map((btn) => (
                  <button
                    key={btn}
                    className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded transition-colors"
                  >
                    {btn}
                  </button>
                ))}
              </div>
              <textarea
                value={article.content}
                onChange={(e) => setArticle({ ...article, content: e.target.value })}
                placeholder="Write your article content here... (Rich block editor integration with TipTap planned)"
                rows={16}
                className="w-full p-4 text-sm text-gray-900 focus:outline-none resize-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5">
            <label className="text-sm font-medium text-gray-700 mb-2 block">Excerpt</label>
            <textarea
              value={article.excerpt}
              onChange={(e) => setArticle({ ...article, excerpt: e.target.value })}
              placeholder="Brief summary of the article..."
              rows={3}
              className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">SEO Preview</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-blue-600 text-sm font-medium truncate">
                {article.metaTitle || article.title || "Article Title"}
              </p>
              <p className="text-green-700 text-xs mt-1">mobileplatform.com/news/article-slug</p>
              <p className="text-gray-500 text-xs mt-1 line-clamp-2">
                {article.metaDescription || article.excerpt || "Article description will appear here..."}
              </p>
            </div>
            <div className="space-y-3 mt-4">
              <div>
                <label className="text-xs font-medium text-gray-600">Meta Title</label>
                <input
                  type="text"
                  value={article.metaTitle}
                  onChange={(e) => setArticle({ ...article, metaTitle: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Custom meta title"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600">Meta Description</label>
                <textarea
                  value={article.metaDescription}
                  onChange={(e) => setArticle({ ...article, metaDescription: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  rows={3}
                  placeholder="Custom meta description"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Publishing</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium text-gray-900 capitalize">{article.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Visibility</span>
                <span className="font-medium text-gray-900">Public</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
