'use client';
import { useState, useEffect } from 'react';
import { Cloud, RefreshCw, Shield, Globe, Trash2, Plus, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface DnsRecord {
  id: string;
  type: string;
  name: string;
  content: string;
  ttl: number;
  proxied: boolean;
}

export default function CloudflarePage() {
  const [config, setConfig] = useState<any>(null);
  const [dnsRecords, setDnsRecords] = useState<DnsRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'config' | 'cache' | 'dns' | 'waf'>('config');
  const [credentials, setCredentials] = useState({ apiKey: '', accountId: '', zoneId: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadConfig(); }, []);

  async function loadConfig() {
    setLoading(true);
    try {
      const data = await api.admin.cloudflare.getConfig();
      setConfig(data);
      if (data.configured) {
        setCredentials({ apiKey: '', accountId: data.accountId, zoneId: data.zoneId });
      }
    } catch { toast.error('Failed to load Cloudflare config'); }
    finally { setLoading(false); }
  }

  async function loadDns() {
    try {
      const records = await api.admin.cloudflare.getDns();
      setDnsRecords(records || []);
    } catch { toast.error('Failed to load DNS records'); }
  }

  async function saveConfig(e: React.FormEvent) {
    e.preventDefault();
    if (!credentials.apiKey && !config?.hasApiKey) {
      toast.error('API Key is required');
      return;
    }
    setSaving(true);
    try {
      await api.admin.cloudflare.saveConfig(credentials);
      await loadConfig();
      toast.success('Cloudflare configured successfully');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  }

  async function purgeAll() {
    if (!confirm('Purge ALL Cloudflare cache? This will slow the site temporarily.')) return;
    try {
      await api.admin.cloudflare.purgeAll();
      toast.success('Cache purged successfully');
    } catch { toast.error('Failed to purge cache'); }
  }

  async function toggleCdn(enabled: boolean) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/cloudflare/cdn/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ enabled }),
      });
      setConfig((prev: any) => ({ ...prev, cdnEnabled: enabled }));
      toast.success(`CDN ${enabled ? 'enabled' : 'disabled'}`);
    } catch { toast.error('Failed to toggle CDN'); }
  }

  async function toggleWaf(enabled: boolean) {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/cloudflare/waf/toggle`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: JSON.stringify({ enabled }),
      });
      setConfig((prev: any) => ({ ...prev, wafEnabled: enabled }));
      toast.success(`WAF ${enabled ? 'enabled' : 'disabled'}`);
    } catch { toast.error('Failed to toggle WAF'); }
  }

  function getToken() {
    return document.cookie.split(';').find((c) => c.trim().startsWith('admin_token='))?.split('=')[1] || '';
  }

  const tabs = [
    { id: 'config', label: 'Configuration', icon: Cloud },
    { id: 'cache', label: 'Cache', icon: RefreshCw },
    { id: 'dns', label: 'DNS Records', icon: Globe },
    { id: 'waf', label: 'WAF & Security', icon: Shield },
  ] as const;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/20 rounded-xl flex items-center justify-center">
          <Cloud className="text-orange-600 dark:text-orange-400" size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cloudflare</h1>
          <p className="text-sm text-gray-500">
            {config?.configured
              ? `Zone: ${config.zoneId} · ${config.cdnEnabled ? '🟢 CDN On' : '🔴 CDN Off'}`
              : 'Not configured'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); if (t.id === 'dns') loadDns(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <t.icon size={16} />
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Config Tab ── */}
      {tab === 'config' && (
        <div className="admin-card max-w-lg">
          <h2 className="font-semibold mb-4">API Credentials</h2>
          {config?.configured && (
            <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg mb-4 text-sm text-green-700 dark:text-green-400">
              <Check size={16} />
              Connected · Account {config.accountId?.slice(0, 8)}...
            </div>
          )}
          <form onSubmit={saveConfig} className="space-y-4">
            <div>
              <label className="form-label">
                API Key {config?.hasApiKey && <span className="text-green-600">(saved)</span>}
              </label>
              <input
                type="password"
                value={credentials.apiKey}
                onChange={(e) => setCredentials({ ...credentials, apiKey: e.target.value })}
                className="admin-input"
                placeholder={config?.hasApiKey ? '••••••••••• (enter to update)' : 'Your Cloudflare API Token'}
              />
            </div>
            <div>
              <label className="form-label">Account ID</label>
              <input
                value={credentials.accountId}
                onChange={(e) => setCredentials({ ...credentials, accountId: e.target.value })}
                className="admin-input"
                placeholder="32-character Account ID"
              />
            </div>
            <div>
              <label className="form-label">Zone ID</label>
              <input
                value={credentials.zoneId}
                onChange={(e) => setCredentials({ ...credentials, zoneId: e.target.value })}
                className="admin-input"
                placeholder="32-character Zone ID"
              />
            </div>
            <button type="submit" disabled={saving} className="btn-primary w-full">
              {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </form>
        </div>
      )}

      {/* ── Cache Tab ── */}
      {tab === 'cache' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="admin-card">
            <h2 className="font-semibold mb-2">CDN Toggle</h2>
            <p className="text-sm text-gray-500 mb-4">Enable or disable Cloudflare CDN for the entire site.</p>
            <button
              onClick={() => toggleCdn(!config?.cdnEnabled)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full border transition-colors ${
                config?.cdnEnabled
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              {config?.cdnEnabled ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
              CDN is {config?.cdnEnabled ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          <div className="admin-card">
            <h2 className="font-semibold mb-2">Purge Cache</h2>
            <p className="text-sm text-gray-500 mb-4">Force Cloudflare to clear all cached content globally.</p>
            <button onClick={purgeAll} className="btn-danger w-full">
              <Trash2 size={16} />
              Purge All Cache
            </button>
          </div>

          <div className="admin-card md:col-span-2">
            <h2 className="font-semibold mb-2">Purge Specific URLs</h2>
            <PurgeUrlsForm />
          </div>
        </div>
      )}

      {/* ── DNS Tab ── */}
      {tab === 'dns' && (
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">DNS Records</h2>
            <button onClick={loadDns} className="btn-secondary text-xs">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {dnsRecords.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Type</th>
                    <th>Name</th>
                    <th>Content</th>
                    <th>TTL</th>
                    <th>Proxied</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {dnsRecords.map((r) => (
                    <tr key={r.id}>
                      <td><span className="badge-info">{r.type}</span></td>
                      <td className="font-mono text-xs">{r.name}</td>
                      <td className="font-mono text-xs max-w-xs truncate">{r.content}</td>
                      <td className="text-xs">{r.ttl === 1 ? 'Auto' : r.ttl}</td>
                      <td>{r.proxied ? '🟠' : '⚫'}</td>
                      <td>
                        <button
                          onClick={async () => {
                            if (!confirm('Delete this DNS record?')) return;
                            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/cloudflare/dns/${r.id}`, {
                              method: 'DELETE',
                              headers: { Authorization: `Bearer ${getToken()}` },
                            });
                            await loadDns();
                            toast.success('Record deleted');
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              Click Refresh to load DNS records
            </div>
          )}
        </div>
      )}

      {/* ── WAF Tab ── */}
      {tab === 'waf' && (
        <div className="admin-card max-w-lg">
          <h2 className="font-semibold mb-4">Web Application Firewall</h2>
          <div className="space-y-4">
            <button
              onClick={() => toggleWaf(!config?.wafEnabled)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg w-full border transition-colors ${
                config?.wafEnabled
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'border-gray-300 dark:border-gray-700'
              }`}
            >
              <Shield size={20} />
              <div className="text-start">
                <div className="font-medium">WAF is {config?.wafEnabled ? 'ENABLED' : 'DISABLED'}</div>
                <div className="text-xs opacity-75">
                  {config?.wafEnabled ? 'Blocking malicious requests' : 'No WAF protection active'}
                </div>
              </div>
              {config?.wafEnabled ? <ToggleRight size={24} className="ms-auto" /> : <ToggleLeft size={24} className="ms-auto" />}
            </button>

            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-400">
              <AlertCircle size={16} className="inline me-2" />
              WAF protects against SQL injection, XSS, and common web attacks. Keep enabled in production.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PurgeUrlsForm() {
  const [urls, setUrls] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const urlList = urls.split('\n').map((u) => u.trim()).filter(Boolean);
    if (!urlList.length) return;
    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/admin/cloudflare/cache/purge-urls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${document.cookie.match(/admin_token=([^;]+)/)?.[1] || ''}` },
        body: JSON.stringify({ urls: urlList }),
      });
      setUrls('');
      toast.success(`Purged ${urlList.length} URLs`);
    } catch { toast.error('Failed to purge URLs'); }
    finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <textarea
        value={urls}
        onChange={(e) => setUrls(e.target.value)}
        className="admin-input font-mono text-xs"
        rows={4}
        placeholder="Enter one URL per line:&#10;https://example.com/en/phones/samsung/galaxy-s24&#10;https://example.com/ar/phones/apple/iphone-15"
      />
      <button type="submit" disabled={loading || !urls.trim()} className="btn-secondary">
        <RefreshCw size={14} />
        {loading ? 'Purging...' : 'Purge Selected URLs'}
      </button>
    </form>
  );
}

function Check({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="20 6 9 17 4 12" /></svg>;
}
