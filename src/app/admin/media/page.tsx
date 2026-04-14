"use client";

import { useEffect, useState } from "react";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  alt: string | null;
  createdAt: string;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setMedia(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setView("grid")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === "grid" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
            >
              Grid
            </button>
            <button
              onClick={() => setView("list")}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}
            >
              List
            </button>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Upload
          </button>
        </div>
      </div>

      {loading ? (
        <div className={view === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4" : "space-y-2"}>
          {[...Array(12)].map((_, i) => (
            <div key={i} className={`animate-pulse ${view === "grid" ? "bg-white rounded-xl border p-3" : "bg-white rounded-lg border p-3 flex items-center gap-4"}`}>
              <div className={view === "grid" ? "aspect-square bg-gray-200 rounded-lg mb-2" : "w-12 h-12 bg-gray-200 rounded flex-shrink-0"} />
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      ) : media.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <div className="text-4xl mb-4">🖼️</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No media files yet</h3>
          <p className="text-sm text-gray-500 mb-4">Upload images and files to use across the platform</p>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
            Upload Your First File
          </button>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {media.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border p-3 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
                {item.mimeType.startsWith("image/") ? (
                  <img src={item.url} alt={item.alt || item.originalName} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl">📄</span>
                )}
              </div>
              <p className="text-xs font-medium text-gray-900 truncate">{item.originalName}</p>
              <p className="text-xs text-gray-400">{formatSize(item.size)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">File</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Size</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase">Uploaded</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {media.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                      {item.mimeType.startsWith("image/") ? "🖼️" : "📄"}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item.originalName}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.mimeType}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatSize(item.size)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <button className="text-blue-600 hover:text-blue-800 text-sm font-medium mr-3">View</button>
                    <button className="text-red-600 hover:text-red-800 text-sm font-medium">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
