"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface PhoneImage {
  id: string;
  url: string;
  altText: string | null;
  sortOrder: number;
}

export default function PhoneImagesPage() {
  const params = useParams();
  const phoneId = params.id as string;

  const [phoneName, setPhoneName] = useState("");
  const [mainImage, setMainImage] = useState<string | null>(null);
  const [images, setImages] = useState<PhoneImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ACCEPTED_FORMATS = ".jpg,.jpeg,.png,.webp,.avif,.gif,.svg,.heic,.heif";

  const loadImages = async () => {
    try {
      const res = await fetch(`/api/admin/phones/${phoneId}/images`);
      const data = await res.json();
      if (data.success) {
        setPhoneName(data.data.name);
        setMainImage(data.data.mainImage);
        setImages(data.data.images || []);
      }
    } catch {
      setMessage({ type: "error", text: "Failed to load images" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadImages();
  }, [phoneId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("image", file);
    formData.append("altText", phoneName);
    formData.append("isMain", images.length === 0 ? "true" : "false");

    try {
      const res = await fetch(`/api/admin/phones/${phoneId}/images`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Image uploaded successfully!" });
        await loadImages();
      } else {
        setMessage({ type: "error", text: data.error || "Upload failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSetMain = async (imageUrl: string) => {
    try {
      const res = await fetch(`/api/admin/phones/${phoneId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mainImage: imageUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setMainImage(imageUrl);
        setMessage({ type: "success", text: "Main image updated!" });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to set main image" });
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm("Delete this image?")) return;

    try {
      const res = await fetch(`/api/admin/phones/${phoneId}/images?imageId=${imageId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Image deleted" });
        await loadImages();
      } else {
        setMessage({ type: "error", text: data.error || "Delete failed" });
      }
    } catch {
      setMessage({ type: "error", text: "Network error" });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/phones" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Phone Images</h1>
        </div>
        <div className="bg-white rounded-xl shadow-sm border p-8">
          <div className="animate-pulse grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/phones" className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{phoneName} — Images</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              Upload and manage phone images
            </p>
          </div>
        </div>
        <Link
          href={`/admin/phones/${phoneId}/specifications`}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          📋 Specifications
        </Link>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`px-4 py-3 rounded-lg text-sm ${
          message.type === "success"
            ? "bg-green-50 border border-green-200 text-green-700"
            : "bg-red-50 border border-red-200 text-red-700"
        }`}>
          {message.text}
        </div>
      )}

      {/* Upload Area */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">Upload Image</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Supported formats: JPG, JPEG, PNG, WebP, AVIF, GIF, SVG, HEIC/HEIF — Max 10MB
          </p>
        </div>
        <div className="p-6">
          <div
            className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FORMATS}
              onChange={handleUpload}
              className="hidden"
            />
            {uploading ? (
              <div className="flex flex-col items-center gap-2">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm text-gray-600">Uploading...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium text-gray-700">Click to upload or drag and drop</p>
                <p className="text-xs text-gray-500">JPG, PNG, WebP, AVIF, GIF, SVG, HEIC</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="px-6 py-4 border-b bg-gray-50">
          <h2 className="text-lg font-semibold text-gray-900">
            Images ({images.length})
          </h2>
        </div>
        <div className="p-6">
          {images.length === 0 ? (
            <p className="text-center text-gray-400 py-8">No images uploaded yet</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((img) => (
                <div
                  key={img.id}
                  className={`relative group rounded-xl overflow-hidden border-2 ${
                    mainImage === img.url ? "border-blue-500 ring-2 ring-blue-200" : "border-gray-200"
                  }`}
                >
                  <div className="aspect-square bg-gray-100 flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={img.url}
                      alt={img.altText || phoneName}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  {mainImage === img.url && (
                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">
                      Main
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    {mainImage !== img.url && (
                      <button
                        onClick={() => handleSetMain(img.url)}
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700"
                      >
                        Set Main
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(img.id)}
                      className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
