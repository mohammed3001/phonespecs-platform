'use client';
import { useState } from 'react';
import { Globe, Search, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function SeoPage() {
  const [entityType, setEntityType] = useState('phone');
  const [entityId, setEntityId] = useState('');
  const [languageCode, setLanguageCode] = useState('en');
  const [seoData, setSeoData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function loadSeo() {
    if (!entityId) return;
    setLoading(true);
    try {
      const data = await api.admin.seo.getForEntity(entityType, entityId, languageCode);
      setSeoData(data || {});
    } catch {
      setSeoData({});
    } finally { setLoading(false); }
  }

  async function saveSeo() {
    setSaving(true);
    try {
      await api.admin.seo.upsert({ entityType, entityId, languageCode, ...seoData });
      toast.success('SEO metadata saved');
    } catch { toast.error('Failed to save SEO'); }
    finally { setSaving(false); }
  }

  async function invalidateSitemap() {
    try {
      await api.admin.seo.invalidateSitemap();
      toast.success('Sitemap cache cleared — will regenerate on next request');
    } catch { toast.error('Failed to invalidate sitemap'); }
  }

  function update(key: string, value: any) {
    setSeoData((prev: any) => ({ ...prev, [key]: value }));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SEO Management</h1>
        <button onClick={invalidateSitemap} className="btn-secondary">
          <RefreshCw size={16} /> Regenerate Sitemap
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entity selector */}
        <div className="admin-card">
          <h2 className="font-semibold mb-4">Select Entity</h2>
          <div className="space-y-3">
            <div>
              <label className="form-label">Entity Type</label>
              <select value={entityType} onChange={(e) => setEntityType(e.target.value)} className="admin-input">
                <option value="phone">Phone</option>
                <option value="brand">Brand</option>
                <option value="page">Static Page</option>
              </select>
            </div>
            <div>
              <label className="form-label">Entity ID or Slug</label>
              <input value={entityId} onChange={(e) => setEntityId(e.target.value)}
                className="admin-input" placeholder="e.g. samsung-galaxy-s24" />
            </div>
            <div>
              <label className="form-label">Language</label>
              <select value={languageCode} onChange={(e) => setLanguageCode(e.target.value)} className="admin-input">
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            <button onClick={loadSeo} disabled={!entityId || loading} className="btn-primary w-full">
              <Search size={16} /> {loading ? 'Loading...' : 'Load SEO Data'}
            </button>
          </div>
        </div>

        {/* SEO form */}
        {seoData !== null && (
          <div className="lg:col-span-2 space-y-4">
            <div className="admin-card">
              <h2 className="font-semibold mb-4">Basic Meta</h2>
              <div className="space-y-3">
                <div>
                  <label className="form-label">Meta Title</label>
                  <input value={seoData.title || ''} onChange={(e) => update('title', e.target.value)}
                    className="admin-input" placeholder="Page title for search engines" maxLength={60} />
                  <p className="form-hint">{(seoData.title || '').length}/60 chars</p>
                </div>
                <div>
                  <label className="form-label">Meta Description</label>
                  <textarea value={seoData.description || ''} onChange={(e) => update('description', e.target.value)}
                    className="admin-input" rows={3} placeholder="160 chars recommended" maxLength={160} />
                  <p className="form-hint">{(seoData.description || '').length}/160 chars</p>
                </div>
                <div>
                  <label className="form-label">Keywords (comma separated)</label>
                  <input value={seoData.keywords || ''} onChange={(e) => update('keywords', e.target.value)}
                    className="admin-input" placeholder="samsung, galaxy, android, phone" />
                </div>
                <div>
                  <label className="form-label">Canonical URL</label>
                  <input value={seoData.canonicalUrl || ''} onChange={(e) => update('canonicalUrl', e.target.value)}
                    className="admin-input" placeholder="https://yoursite.com/..." />
                </div>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={seoData.robotsIndex ?? true}
                      onChange={(e) => update('robotsIndex', e.target.checked)} />
                    Allow Indexing
                  </label>
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input type="checkbox" checked={seoData.robotsFollow ?? true}
                      onChange={(e) => update('robotsFollow', e.target.checked)} />
                    Allow Following Links
                  </label>
                </div>
              </div>
            </div>

            <div className="admin-card">
              <h2 className="font-semibold mb-4">Open Graph (Facebook, WhatsApp)</h2>
              <div className="space-y-3">
                <div>
                  <label className="form-label">OG Title</label>
                  <input value={seoData.ogTitle || ''} onChange={(e) => update('ogTitle', e.target.value)}
                    className="admin-input" placeholder="Leave blank to use Meta Title" />
                </div>
                <div>
                  <label className="form-label">OG Description</label>
                  <textarea value={seoData.ogDescription || ''} onChange={(e) => update('ogDescription', e.target.value)}
                    className="admin-input" rows={2} />
                </div>
                <div>
                  <label className="form-label">OG Image URL</label>
                  <input value={seoData.ogImage || ''} onChange={(e) => update('ogImage', e.target.value)}
                    className="admin-input" placeholder="https://... (1200x630px recommended)" />
                </div>
              </div>
            </div>

            <div className="admin-card">
              <h2 className="font-semibold mb-4">Twitter Card</h2>
              <div className="space-y-3">
                <div>
                  <label className="form-label">Twitter Title</label>
                  <input value={seoData.twitterTitle || ''} onChange={(e) => update('twitterTitle', e.target.value)}
                    className="admin-input" />
                </div>
                <div>
                  <label className="form-label">Twitter Description</label>
                  <textarea value={seoData.twitterDesc || ''} onChange={(e) => update('twitterDesc', e.target.value)}
                    className="admin-input" rows={2} />
                </div>
                <div>
                  <label className="form-label">Twitter Image URL</label>
                  <input value={seoData.twitterImage || ''} onChange={(e) => update('twitterImage', e.target.value)}
                    className="admin-input" />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button onClick={saveSeo} disabled={saving} className="btn-primary">
                <Globe size={16} />
                {saving ? 'Saving...' : 'Save SEO Metadata'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
