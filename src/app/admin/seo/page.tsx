"use client";

import { useEffect, useState } from "react";

interface SeoTemplate {
  id: string;
  contentType: string;
  titleTemplate: string | null;
  descriptionTemplate: string | null;
  robots: string;
}

export default function AdminSeoPage() {
  const [templates, setTemplates] = useState<SeoTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/seo")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setTemplates(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">SEO Settings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage SEO meta templates for each content type. Use {"{{variables}}"} for dynamic values.</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Template
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border p-5 animate-pulse space-y-3">
              <div className="h-5 bg-gray-200 rounded w-32"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))
        ) : (
          templates.map((template) => (
            <div key={template.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm dark:shadow-gray-900/30 border p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-xs px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 font-semibold uppercase">
                    {template.contentType}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">robots: {template.robots}</span>
                </div>
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">Edit</button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Title Template</label>
                  <p className="text-sm text-gray-900 dark:text-white mt-1 font-mono bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-lg">
                    {template.titleTemplate || "—"}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Description Template</label>
                  <p className="text-sm text-gray-900 dark:text-white mt-1 font-mono bg-gray-50 dark:bg-gray-900 px-3 py-2 rounded-lg">
                    {template.descriptionTemplate || "—"}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
