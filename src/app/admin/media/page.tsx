"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import { Icon } from "@/components/shared/Icon";

interface MediaItem {
  id: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  altText: string | null;
  folder: string;
  createdAt: string;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchMedia = () => {
    setLoading(true);
    fetch("/api/admin/media")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setMedia(data.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchMedia(); }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);

    for (let i = 0; i < files.length; i++) {
      const formData = new FormData();
      formData.append("file", files[i]);

      try {
        const res = await fetch("/api/admin/media", { method: "POST", body: formData });
        const data = await res.json();
        if (!data.success) {
          alert(`Failed to upload ${files[i].name}: ${data.error}`);
        }
      } catch {
        alert(`Failed to upload ${files[i].name}`);
      }
    }

    setUploading(false);
    fetchMedia();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/admin/media?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) fetchMedia();
      else alert(data.error);
    } catch { alert("Network error"); }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  };

  const copyUrl = (filePath: string) => {
    navigator.clipboard.writeText(filePath);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Media Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">{media.length} files</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button onClick={() => setView("grid")} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === "grid" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>Grid</button>
            <button onClick={() => setView("list")} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${view === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-500"}`}>List</button>
          </div>
          <input ref={fileInputRef} type="file" multiple accept="image/*,.pdf" onChange={(e) => handleUpload(e.target.files)} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2">
            <Icon icon={uploading ? "mdi:loading" : "mdi:cloud-upload-outline"} width={18} className={uploading ? "animate-spin" : ""} />
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add("border-blue-400", "bg-blue-50"); }}
        onDragLeave={(e) => { e.currentTarget.classList.remove("border-blue-400", "bg-blue-50"); }}
        onDrop={(e) => { e.preventDefault(); e.currentTarget.classList.remove("border-blue-400", "bg-blue-50"); handleUpload(e.dataTransfer.files); }}>
        <Icon icon="mdi:cloud-upload-outline" className="w-10 h-10 text-gray-400 mx-auto mb-2" />
        <p className="text-sm text-gray-600">Drop files here or click to upload</p>
        <p className="text-xs text-gray-400 mt-1">Images and PDFs up to 10MB</p>
      </div>

      {loading ? (
        <div className={view === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4" : "space-y-2"}>
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border p-3">
              <div className="aspect-square bg-gray-200 rounded-lg mb-2" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      ) : media.length === 0 ? (
        <div className="bg-white rounded-xl border p-12 text-center">
          <Icon icon="mdi:image-outline" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No media files yet</h3>
          <p className="text-sm text-gray-500 mb-4">Upload images and files to use across the platform</p>
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {media.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border p-3 hover:shadow-md transition-shadow group relative">
              <div className="aspect-square bg-gray-100 rounded-lg mb-2 flex items-center justify-center overflow-hidden relative">
                {item.mimeType.startsWith("image/") ? (
                  <Image src={item.path} alt={item.altText || item.originalName} fill className="object-cover" sizes="(max-width: 768px) 50vw, 200px" />
                ) : (
                  <Icon icon="mdi:file-document-outline" className="w-10 h-10 text-gray-400" />
                )}
              </div>
              <p className="text-xs font-medium text-gray-900 truncate">{item.originalName}</p>
              <p className="text-xs text-gray-400">{formatSize(item.size)}</p>
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                <button onClick={() => copyUrl(item.path)} className="p-1.5 bg-white rounded-lg shadow-sm border hover:bg-gray-50" title="Copy URL">
                  <Icon icon="mdi:content-copy" width={14} className="text-gray-600" />
                </button>
                <button onClick={() => handleDelete(item.id, item.originalName)} className="p-1.5 bg-white rounded-lg shadow-sm border hover:bg-red-50" title="Delete">
                  <Icon icon="mdi:delete-outline" width={14} className="text-red-500" />
                </button>
              </div>
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
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center overflow-hidden relative flex-shrink-0">
                        {item.mimeType.startsWith("image/") ? (
                          <Image src={item.path} alt={item.originalName} fill className="object-cover" sizes="40px" />
                        ) : (
                          <Icon icon="mdi:file-document-outline" width={20} className="text-gray-400" />
                        )}
                      </div>
                      <span className="text-sm font-medium text-gray-900 truncate max-w-xs">{item.originalName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">{item.mimeType.split("/")[1]}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{formatSize(item.size)}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{new Date(item.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => copyUrl(item.path)} className="text-blue-600 hover:text-blue-800 text-sm font-medium">Copy URL</button>
                      <button onClick={() => handleDelete(item.id, item.originalName)} className="text-red-500 hover:text-red-700 text-sm font-medium">Delete</button>
                    </div>
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
