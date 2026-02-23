'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  Plus, Trash2, Save, Globe, ChevronDown, ChevronRight,
  Upload, Download, Search, Check, X
} from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

interface Language {
  id: string;
  code: string;
  name: string;
  nativeName: string;
  direction: 'ltr' | 'rtl';
  isDefault: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface Translation {
  namespace: string;
  key: string;
  value: string;
}

export default function LanguagesPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLang, setSelectedLang] = useState<string | null>(null);
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({});
  const [editingCell, setEditingCell] = useState<{ ns: string; key: string } | null>(null);
  const [editValue, setEditValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNamespace, setActiveNamespace] = useState<string>('common');
  const [showAddLang, setShowAddLang] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadLanguages();
  }, []);

  useEffect(() => {
    if (selectedLang) loadTranslations(selectedLang);
  }, [selectedLang]);

  async function loadLanguages() {
    try {
      const data = await api.admin.languages.getAll();
      setLanguages(data);
      if (data.length > 0 && !selectedLang) setSelectedLang(data[0].code);
    } catch {
      toast.error('Failed to load languages');
    }
  }

  async function loadTranslations(code: string) {
    try {
      const data = await api.admin.languages.getTranslations(code);
      setTranslations(data);
    } catch {
      toast.error('Failed to load translations');
    }
  }

  function startEdit(ns: string, key: string, currentValue: string) {
    setEditingCell({ ns, key });
    setEditValue(currentValue);
  }

  async function saveEdit(ns: string, key: string) {
    if (!selectedLang) return;
    setSaving(true);
    try {
      await api.admin.languages.upsertTranslation(selectedLang, ns, key, editValue);
      setTranslations((prev) => ({
        ...prev,
        [ns]: { ...prev[ns], [key]: editValue },
      }));
      setEditingCell(null);
      toast.success('Translation saved');
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function toggleLanguage(code: string, isActive: boolean) {
    try {
      await api.admin.languages.update(code, { isActive });
      await loadLanguages();
      toast.success(`Language ${isActive ? 'enabled' : 'disabled'}`);
    } catch {
      toast.error('Failed to update language');
    }
  }

  async function setDefault(code: string) {
    try {
      await api.admin.languages.update(code, { isDefault: true });
      await loadLanguages();
      toast.success('Default language updated');
    } catch {
      toast.error('Failed to set default');
    }
  }

  async function deleteLanguage(code: string) {
    if (!confirm(`Delete language "${code}"? All its translations will be removed.`)) return;
    try {
      await api.admin.languages.delete(code);
      await loadLanguages();
      toast.success('Language deleted');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to delete');
    }
  }

  // Export translations as JSON
  function exportTranslations() {
    if (!selectedLang) return;
    const blob = new Blob([JSON.stringify(translations, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translations-${selectedLang}.json`;
    a.click();
  }

  // Import translations from JSON
  async function importTranslations(e: React.ChangeEvent<HTMLInputElement>) {
    if (!selectedLang || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      // Convert { namespace: { key: value } } to flat array
      const flat: Array<{ namespace: string; key: string; value: string }> = [];
      for (const [ns, keys] of Object.entries(json)) {
        if (typeof keys === 'object' && keys) {
          for (const [key, value] of Object.entries(keys as Record<string, string>)) {
            flat.push({ namespace: ns, key, value });
          }
        }
      }
      await api.admin.languages.importTranslations(selectedLang, flat);
      await loadTranslations(selectedLang);
      toast.success(`Imported ${flat.length} translations`);
    } catch {
      toast.error('Invalid JSON file');
    }
    e.target.value = '';
  }

  const namespaces = Object.keys(translations);
  const currentKeys = translations[activeNamespace] || {};
  const filteredKeys = Object.entries(currentKeys).filter(
    ([key, value]) =>
      !searchQuery ||
      key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      value.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Languages & Translations
        </h1>
        <button
          onClick={() => setShowAddLang(true)}
          className="btn-primary"
        >
          <Plus size={16} />
          Add Language
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Languages list */}
        <div className="lg:col-span-1">
          <div className="admin-card">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-4">Languages</h2>
            <div className="space-y-2">
              {languages.map((lang) => (
                <div
                  key={lang.code}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer border transition-colors ${
                    selectedLang === lang.code
                      ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50'
                  }`}
                  onClick={() => setSelectedLang(lang.code)}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{lang.nativeName}</span>
                      <span className="text-xs text-gray-500">({lang.code})</span>
                      {lang.isDefault && (
                        <span className="badge-success text-xs">Default</span>
                      )}
                      {lang.direction === 'rtl' && (
                        <span className="badge-info text-xs">RTL</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {lang.isActive ? '✅ Active' : '❌ Inactive'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {!lang.isDefault && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setDefault(lang.code); }}
                        className="p-1 text-xs text-gray-400 hover:text-brand-500"
                        title="Set as default"
                      >
                        <Globe size={14} />
                      </button>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleLanguage(lang.code, !lang.isActive); }}
                      className="p-1 text-gray-400 hover:text-yellow-500"
                      title={lang.isActive ? 'Disable' : 'Enable'}
                    >
                      {lang.isActive ? <Check size={14} /> : <X size={14} />}
                    </button>
                    {!lang.isDefault && (
                      <button
                        onClick={(e) => { e.stopPropagation(); deleteLanguage(lang.code); }}
                        className="p-1 text-gray-400 hover:text-red-500"
                        title="Delete language"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Translation editor */}
        <div className="lg:col-span-2">
          {selectedLang ? (
            <div className="admin-card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-900 dark:text-white">
                  Translations: <span className="text-brand-600">{selectedLang}</span>
                </h2>
                <div className="flex items-center gap-2">
                  <button onClick={exportTranslations} className="btn-secondary text-xs">
                    <Download size={14} /> Export
                  </button>
                  <label className="btn-secondary text-xs cursor-pointer">
                    <Upload size={14} /> Import
                    <input type="file" accept=".json" onChange={importTranslations} className="hidden" />
                  </label>
                </div>
              </div>

              {/* Namespace tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {namespaces.map((ns) => (
                  <button
                    key={ns}
                    onClick={() => setActiveNamespace(ns)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                      activeNamespace === ns
                        ? 'bg-brand-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {ns}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className="relative mb-4">
                <Search size={16} className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search keys or values..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="admin-input ps-9"
                />
              </div>

              {/* Translation table */}
              <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th className="w-1/3">Key</th>
                      <th>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKeys.map(([key, value]) => (
                      <tr key={key}>
                        <td className="font-mono text-xs text-gray-500 dark:text-gray-400">
                          {key}
                        </td>
                        <td>
                          {editingCell?.ns === activeNamespace && editingCell?.key === key ? (
                            <div className="flex items-center gap-2">
                              <input
                                autoFocus
                                value={editValue}
                                onChange={(e) => setEditValue(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') saveEdit(activeNamespace, key);
                                  if (e.key === 'Escape') setEditingCell(null);
                                }}
                                className="admin-input text-sm flex-1"
                                dir={languages.find((l) => l.code === selectedLang)?.direction || 'ltr'}
                              />
                              <button
                                onClick={() => saveEdit(activeNamespace, key)}
                                disabled={saving}
                                className="text-green-600 hover:text-green-700"
                              >
                                <Check size={16} />
                              </button>
                              <button
                                onClick={() => setEditingCell(null)}
                                className="text-gray-400 hover:text-gray-600"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ) : (
                            <div
                              className="text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded px-2 py-1 -mx-2 min-h-[28px]"
                              onClick={() => startEdit(activeNamespace, key, value)}
                              dir={languages.find((l) => l.code === selectedLang)?.direction || 'ltr'}
                            >
                              {value || <span className="text-gray-400 italic">Click to translate</span>}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredKeys.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No translations found{searchQuery ? ' for your search' : ''}.
                </div>
              )}
            </div>
          ) : (
            <div className="admin-card flex items-center justify-center h-64 text-gray-400">
              Select a language to manage translations
            </div>
          )}
        </div>
      </div>

      {/* Add Language Modal */}
      {showAddLang && (
        <AddLanguageModal
          onClose={() => setShowAddLang(false)}
          onAdd={async (data) => {
            await api.admin.languages.create(data);
            await loadLanguages();
            setShowAddLang(false);
            toast.success('Language added');
          }}
        />
      )}
    </div>
  );
}

function AddLanguageModal({ onClose, onAdd }: { onClose: () => void; onAdd: (d: any) => Promise<void> }) {
  const [form, setForm] = useState({
    code: '', name: '', nativeName: '', direction: 'ltr', isDefault: false,
  });
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try { await onAdd(form); } catch (e: any) { toast.error(e.response?.data?.message || 'Error'); }
    finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md mx-4">
        <h3 className="text-lg font-bold mb-4">Add Language</h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="form-label">Language Code (ISO 639-1)</label>
            <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })}
              className="admin-input" placeholder="ar, ku, tr..." required />
          </div>
          <div>
            <label className="form-label">English Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="admin-input" placeholder="Arabic" required />
          </div>
          <div>
            <label className="form-label">Native Name</label>
            <input value={form.nativeName} onChange={(e) => setForm({ ...form, nativeName: e.target.value })}
              className="admin-input" placeholder="العربية" required />
          </div>
          <div>
            <label className="form-label">Text Direction</label>
            <select value={form.direction} onChange={(e) => setForm({ ...form, direction: e.target.value })}
              className="admin-input">
              <option value="ltr">LTR (Left to Right)</option>
              <option value="rtl">RTL (Right to Left)</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="isDefault" checked={form.isDefault}
              onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            <label htmlFor="isDefault" className="text-sm">Set as default language</label>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Adding...' : 'Add Language'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
