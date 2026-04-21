"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/shared/Icon";
import ReviewForm from "./ReviewForm";

interface Review {
  id: string;
  title: string | null;
  content: string | null;
  overallScore: number | null;
  pros: string | null;
  cons: string | null;
  createdAt: string;
  user: { name: string; avatar: string | null } | null;
}

interface ReviewsSectionProps {
  phoneId: string;
  phoneName: string;
  phoneSlug: string;
}

export default function ReviewsSection({ phoneId, phoneName, phoneSlug }: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState({ total: 0, averageScore: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/reviews?slug=${phoneSlug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setReviews(data.data);
          setStats(data.stats);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [phoneSlug]);

  return (
    <section id="reviews" className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Reviews</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {stats.total > 0
              ? `${stats.total} review${stats.total > 1 ? "s" : ""} • Average ${stats.averageScore.toFixed(1)}/10`
              : "Be the first to review this phone"}
          </p>
        </div>
        {stats.total > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-lg">
            <Icon icon="mdi:star" className="w-5 h-5 text-amber-400" />
            <span className="text-lg font-bold text-amber-700">{stats.averageScore.toFixed(1)}</span>
            <span className="text-xs text-amber-600">/10</span>
          </div>
        )}
      </div>

      {/* Review Form */}
      <div className="mb-6">
        <ReviewForm phoneId={phoneId} phoneName={phoneName} />
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse border rounded-xl p-5">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-8">
          <Icon icon="mdi:message-text-outline" className="w-10 h-10 text-gray-200 mx-auto mb-2" />
          <p className="text-sm text-gray-400">No reviews yet. Share your experience!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 dark:border-gray-700 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                    {(review.user?.name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white text-sm">{review.user?.name || "Anonymous"}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(review.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                    </p>
                  </div>
                </div>
                {review.overallScore && (
                  <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 rounded-lg">
                    <Icon icon="mdi:star" className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-bold text-amber-700">{review.overallScore}</span>
                    <span className="text-xs text-amber-500">/10</span>
                  </div>
                )}
              </div>

              {review.title && (
                <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{review.title}</h4>
              )}
              {review.content && (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">{review.content}</p>
              )}

              {(review.pros || review.cons) && (
                <div className="grid grid-cols-2 gap-3">
                  {review.pros && (
                    <div className="bg-emerald-50/60 rounded-lg p-3">
                      <p className="text-xs font-semibold text-emerald-700 mb-1 flex items-center gap-1">
                        <Icon icon="mdi:thumb-up" className="w-3.5 h-3.5" /> Pros
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{review.pros}</p>
                    </div>
                  )}
                  {review.cons && (
                    <div className="bg-red-50 dark:bg-red-900/20/60 rounded-lg p-3">
                      <p className="text-xs font-semibold text-red-700 mb-1 flex items-center gap-1">
                        <Icon icon="mdi:thumb-down" className="w-3.5 h-3.5" /> Cons
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{review.cons}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
