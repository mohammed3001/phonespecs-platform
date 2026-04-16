"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";

interface ReviewEntry {
  id: string;
  title: string | null;
  content: string | null;
  overallScore: number | null;
  pros: string | null;
  cons: string | null;
  status: string;
  moderationNote: string | null;
  reportCount: number;
  createdAt: string;
  user: { name: string; email: string } | null;
  phone: { name: string; slug: string } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  approved: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  rejected: "bg-red-50 text-red-700 ring-red-600/20",
  spam: "bg-gray-100 text-gray-600 ring-gray-500/20",
};

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewEntry[]>([]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReviews = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/reviews?status=${status}`);
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
        setStats(data.stats || {});
      }
    } catch (err) {
      console.error("Failed to fetch reviews:", err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchReviews(filter); }, [filter]);

  const handleModerate = async (reviewId: string, action: "approve" | "reject" | "spam") => {
    setActionLoading(reviewId);
    try {
      const res = await fetch("/api/admin/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId, action }),
      });
      const data = await res.json();
      if (data.success) {
        fetchReviews(filter);
      }
    } catch (err) {
      console.error("Moderation failed:", err);
    }
    setActionLoading(null);
  };

  const tabs = [
    { key: "pending", label: "Pending", icon: "mdi:clock-outline" },
    { key: "approved", label: "Approved", icon: "mdi:check-circle" },
    { key: "rejected", label: "Rejected", icon: "mdi:close-circle" },
    { key: "spam", label: "Spam", icon: "mdi:shield-alert" },
    { key: "all", label: "All", icon: "mdi:format-list-bulleted" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Review Moderation</h1>
          <p className="text-sm text-gray-500 mt-1">Approve, reject, or flag user reviews</p>
        </div>
        <div className="flex items-center gap-3">
          {stats.pending ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-sm font-medium rounded-lg">
              <Icon icon="mdi:clock-outline" className="w-4 h-4" />
              {stats.pending} pending
            </span>
          ) : null}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === tab.key ? "bg-white shadow-sm text-gray-900" : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Icon icon={tab.icon} className="w-4 h-4" />
            {tab.label}
            {stats[tab.key] ? <span className="text-xs bg-gray-200 px-1.5 py-0.5 rounded-full ml-1">{stats[tab.key]}</span> : null}
          </button>
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          ))
        ) : reviews.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <Icon icon="mdi:message-text-outline" className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No {filter === "all" ? "" : filter} reviews</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-xl border p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <Icon icon="mdi:account" className="w-5 h-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{review.user?.name || "Anonymous"}</p>
                    <p className="text-xs text-gray-500">{review.user?.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {review.reportCount > 0 && (
                    <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full font-medium">
                      {review.reportCount} reports
                    </span>
                  )}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ring-1 ring-inset ${statusColors[review.status] || statusColors.pending}`}>
                    {review.status}
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-gray-900">{review.title || "Untitled Review"}</p>
                  {review.overallScore && (
                    <span className="text-sm text-amber-600 font-medium flex items-center gap-0.5">
                      <Icon icon="mdi:star" className="w-4 h-4" />
                      {review.overallScore}/10
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-2">
                  on <span className="font-medium">{review.phone?.name}</span> • {new Date(review.createdAt).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-700 line-clamp-3">{review.content}</p>
              </div>

              {(review.pros || review.cons) && (
                <div className="grid grid-cols-2 gap-3 mb-3">
                  {review.pros && (
                    <div className="bg-emerald-50/50 rounded-lg p-2">
                      <p className="text-xs font-medium text-emerald-700 mb-1">Pros</p>
                      <p className="text-xs text-gray-600">{review.pros}</p>
                    </div>
                  )}
                  {review.cons && (
                    <div className="bg-red-50/50 rounded-lg p-2">
                      <p className="text-xs font-medium text-red-700 mb-1">Cons</p>
                      <p className="text-xs text-gray-600">{review.cons}</p>
                    </div>
                  )}
                </div>
              )}

              {review.moderationNote && (
                <div className="bg-amber-50 rounded-lg p-2 mb-3">
                  <p className="text-xs text-amber-700"><strong>Moderation note:</strong> {review.moderationNote}</p>
                </div>
              )}

              {/* Action Buttons */}
              {review.status === "pending" && (
                <div className="flex items-center gap-2 pt-3 border-t">
                  <button
                    onClick={() => handleModerate(review.id, "approve")}
                    disabled={actionLoading === review.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50"
                  >
                    <Icon icon="mdi:check" className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleModerate(review.id, "reject")}
                    disabled={actionLoading === review.id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    <Icon icon="mdi:close" className="w-4 h-4" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleModerate(review.id, "spam")}
                    disabled={actionLoading === review.id}
                    className="flex items-center gap-1.5 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg text-sm transition-colors disabled:opacity-50"
                  >
                    <Icon icon="mdi:shield-alert" className="w-4 h-4" />
                    Spam
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
