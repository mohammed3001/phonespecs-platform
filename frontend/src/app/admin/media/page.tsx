'use client';
import { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Image, Film, Copy, Check } from 'lucide-react';
import { api } from '@/lib/api';
import toast from 'react-hot-toast';

export default function MediaPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<'all' | 'images' | 'videos'>('all');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [preview, setPreview] = useState<any>(null);
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { loadFiles(); }, [page, filter]);

  async function loadFiles() {
    const bucketMap: Record<string, string | undefined> = {
      images: 'phone-images',
      videos: 'phone-videos',
      all: undefined,
    };
    const data = await api.admin.media.getLibrary({ bucket: bucketMap[filter], page, limit: 20 });
    setFiles(data.files);
    setTotal(data.total);
  }

  async function uploadImages(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files || []);
    if (!selected.length) return;
    setUploading(true);
    try {
      const result = await api.admin.media.uploadImages(selected);
      toast.success(`${result.uploaded} image(s) uploaded`);
      await loadFiles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (imageInputRef.current) imageInputRef.current.value = '';
    }
  }

  async function uploadVideo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      await api.admin.media.uploadVideo(file);
      toast.success('Video uploaded');
      await loadFiles();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = '';
    }
  }

  async function deleteFile(id: string) {
    if (!confirm('Delete this file? This cannot be undone.')) return;
    try {
      await api.admin.media.delete(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      toast.success('File deleted');
    } catch { toast.error('Failed to delete'); }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  }

  const isVideo = (f: any) => f.mimeType?.startsWith('video/');
  const isImage = (f: any) => f.mimeType?.startsWith('image/');

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Media Library</h1>
        <div className="flex gap-2">
          {/* Image upload */}
          <label className={`btn-secondary cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <Image size={16} />
            Upload Images
            <input
              ref={imageInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.webp,.gif,image/jpeg,image/png,image/webp,image/gif"
              onChange={uploadImages}
              className="hidden"
            />
          </label>
          {/* Video upload */}
          <label className={`btn-secondary cursor-pointer ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
            <Film size={16} />
            Upload Video
            <input
              ref={videoInputRef}
              type="file"
              accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
              onChange={uploadVideo}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {uploading && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-blue-700 dark:text-blue-400 flex items-center gap-2">
          <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
          Uploading... (images auto-converted to WebP)
        </div>
      )}

      {/* Format info */}
      <div className="mb-4 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
        📸 <strong>Images:</strong> jpg, png, webp, gif — max 10MB each, auto-converted to WebP + thumbnail generated<br/>
        🎬 <strong>Videos:</strong> mp4, webm, mov — max 200MB, dimensions auto-detected
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'images', 'videos'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f
                ? 'bg-brand-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)} {f === 'all' && `(${total})`}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {files.map((file) => (
          <div
            key={file.id}
            className="group relative bg-gray-100 dark:bg-gray-800 rounded-xl overflow-hidden aspect-square cursor-pointer"
            onClick={() => setPreview(file)}
          >
            {isImage(file) ? (
              <img
                src={file.thumbUrl || file.url}
                alt={file.alt || file.filename}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            ) : isVideo(file) ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-gray-200 dark:bg-gray-700">
                <Film size={32} className="text-gray-400 mb-1" />
                <span className="text-xs text-gray-500">{file.format?.toUpperCase()}</span>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Upload size={24} className="text-gray-400" />
              </div>
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 gap-1">
              <button
                onClick={(e) => { e.stopPropagation(); copyUrl(file.url); }}
                className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs rounded px-2 py-1 flex items-center gap-1"
              >
                {copiedUrl === file.url ? <Check size={12} /> : <Copy size={12} />}
                {copiedUrl === file.url ? 'Copied!' : 'Copy'}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); deleteFile(file.id); }}
                className="bg-red-500/80 hover:bg-red-600 text-white p-1 rounded"
              >
                <Trash2 size={14} />
              </button>
            </div>

            {/* Dimensions badge */}
            {(file.width && file.height) && (
              <div className="absolute top-1 start-1 bg-black/50 text-white text-xs px-1.5 py-0.5 rounded">
                {file.width}×{file.height}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {total > 20 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(page - 1)} className="btn-secondary text-xs">Previous</button>
          <span className="text-sm text-gray-500 self-center">Page {page} of {Math.ceil(total / 20)}</span>
          <button disabled={page * 20 >= total} onClick={() => setPage(page + 1)} className="btn-secondary text-xs">Next</button>
        </div>
      )}

      {/* Preview modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreview(null)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden max-w-3xl w-full max-h-[90vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div>
                <div className="font-medium">{preview.filename}</div>
                <div className="text-xs text-gray-500">
                  {preview.mimeType} · {(preview.size / 1024 / 1024).toFixed(2)}MB
                  {preview.width && ` · ${preview.width}×${preview.height}px`}
                </div>
              </div>
              <button onClick={() => setPreview(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>
            <div className="p-4 flex items-center justify-center bg-gray-50 dark:bg-gray-800" style={{ minHeight: 300 }}>
              {isVideo(preview) ? (
                <video
                  src={preview.url}
                  controls
                  className="max-w-full max-h-[60vh] rounded"
                />
              ) : (
                <img src={preview.url} alt={preview.filename} className="max-w-full max-h-[60vh] rounded object-contain" />
              )}
            </div>
            <div className="p-4 flex gap-2">
              <input value={preview.url} readOnly className="admin-input text-xs font-mono flex-1" />
              <button onClick={() => copyUrl(preview.url)} className="btn-secondary text-xs">
                {copiedUrl === preview.url ? <Check size={14} /> : <Copy size={14} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
