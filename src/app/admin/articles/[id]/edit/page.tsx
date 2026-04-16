"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Icon } from "@/components/shared/Icon";

interface Category { id: string; name: string; }
interface Tag { id: string; name: string; slug: string; }

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const articleId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    status: "draft",
    categoryId: "",
    tagIds: [] as string[],
    featuredImage: "",
    metaTitle: "",
    metaDescription: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/articles").then((r) => r.json()),
      fetch("/api/admin/categories").then((r) => r.json()),
      fetch("/api/admin/tags").then((r) => r.json()),
    ]).then(([articlesRes, catsRes, tagsRes]) => {
      if (catsRes.success) setCategories(catsRes.data);
      if (tagsRes.success) setAllTags(tagsRes.data);
      if (articlesRes.success) {
        const article = articlesRes.data.find((a: { id: string }) => a.id === articleId);
        if (article) {
          setForm({
            title: article.title || "",
            slug: article.slug || "",
            content: article.content || "",
            excerpt: article.excerpt || "",
            status: article.status || "draft",
            categoryId: article.category?.id || "",
            tagIds: article.tagList?.map((t: Tag) => t.id) || [],
            featuredImage: article.featuredImage || "",
            metaTitle: article.metaTitle || "",
            metaDescription: article.metaDescription || "",
          });
        } else {
          setError("Article not found");
        }
      }
      setLoading(false);
    }).catch(() => {
      setError("Failed to load article");
      setLoading(false);
    });
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/articles", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: articleId, ...form, categoryId: form.categoryId || null }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error || "Failed to update article");
        setSaving(false);
        return;
      }
      router.push("/admin/articles");
    } catch {
      setError("Network error");
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this article?")) return;
    try {
      const res = await fetch(`/api/admin/articles?id=${articleId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) router.push("/admin/articles");
      else alert(data.error);
    } catch { alert("Network error"); }
  };

  const toggleTag = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(tagId)
        ? prev.tagIds.filter((id) => id !== tagId)
        : [...prev.tagIds, tagId],
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-48" />
        <div className="bg-white rounded-xl border p-6 space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-200 rounded" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/articles" className="p-2 hover:bg-gray-100 rounded-lg text-gray-500">
            <Icon icon="mdi:arrow-left" width={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Edit Article</h1>
            <p className="text-sm text-gray-500 mt-0.5">{form.title}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleDelete} className="text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5">
            <Icon icon="mdi:delete-outline" width={18} />
            Delete
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
          <Icon icon="mdi:alert-circle" width={18} />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-xl border p-5">
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                placeholder="Article title..."
                className="w-full text-2xl font-bold text-gray-900 focus:outline-none placeholder-gray-300"
              />
            </div>

            <div className="bg-white rounded-xl border p-5">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="bg-white rounded-xl border p-5">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
                rows={16}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            <div className="bg-white rounded-xl border p-5">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Publish</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="scheduled">Scheduled</option>
                  </select>
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving && <Icon icon="mdi:loading" className="animate-spin" width={16} />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl border p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Category</h3>
              <select
                value={form.categoryId}
                onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">No Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="bg-white rounded-xl border p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.length === 0 ? (
                  <p className="text-sm text-gray-400">No tags available</p>
                ) : (
                  allTags.map((tag) => (
                    <button
                      key={tag.id}
                      type="button"
                      onClick={() => toggleTag(tag.id)}
                      className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                        form.tagIds.includes(tag.id)
                          ? "bg-blue-100 text-blue-700 border-blue-300"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-xl border p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Featured Image</h3>
              <input
                type="text"
                value={form.featuredImage}
                onChange={(e) => setForm((p) => ({ ...p, featuredImage: e.target.value }))}
                placeholder="Image URL..."
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              {form.featuredImage && (
                <img src={form.featuredImage} alt="Preview" className="mt-2 rounded-lg w-full h-32 object-cover" />
              )}
            </div>

            <div className="bg-white rounded-xl border p-5">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">SEO</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Meta Title</label>
                  <input
                    type="text"
                    value={form.metaTitle}
                    onChange={(e) => setForm((p) => ({ ...p, metaTitle: e.target.value }))}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Meta Description</label>
                  <textarea
                    value={form.metaDescription}
                    onChange={(e) => setForm((p) => ({ ...p, metaDescription: e.target.value }))}
                    rows={2}
                    className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
