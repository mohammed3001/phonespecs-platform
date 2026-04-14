'use client';

import { Icon } from '@iconify/react';
import type { PhoneReview } from '@/types/phone';

interface PhoneReviewsProps {
  reviews: PhoneReview[];
  locale?: string;
}

export function PhoneReviews({ reviews }: PhoneReviewsProps) {
  if (!reviews?.length) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reviews</h2>
      {reviews.map((review) => (
        <div key={review.id} className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{review.title}</h3>
              {review.authorName && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  By {review.authorName}
                  {review.publishedAt && ` · ${new Date(review.publishedAt).toLocaleDateString()}`}
                </p>
              )}
            </div>
            <div className="flex items-center gap-1 bg-brand-600 text-white px-3 py-1.5 rounded-xl">
              <Icon icon="mdi:star" width={16} />
              <span className="font-bold text-sm">{review.rating}/10</span>
            </div>
          </div>

          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed mb-4">{review.content}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {review.pros.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2 flex items-center gap-1">
                  <Icon icon="mdi:thumb-up" width={16} />
                  Pros
                </h4>
                <ul className="space-y-1">
                  {review.pros.map((pro, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <Icon icon="mdi:check-circle" width={14} className="text-green-500 mt-0.5 shrink-0" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {review.cons.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2 flex items-center gap-1">
                  <Icon icon="mdi:thumb-down" width={16} />
                  Cons
                </h4>
                <ul className="space-y-1">
                  {review.cons.map((con, i) => (
                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                      <Icon icon="mdi:close-circle" width={14} className="text-red-500 mt-0.5 shrink-0" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {review.verdict && (
            <div className="mt-4 p-3 bg-brand-50 dark:bg-brand-900/20 rounded-xl">
              <p className="text-sm font-medium text-brand-700 dark:text-brand-400">
                <strong>Verdict:</strong> {review.verdict}
              </p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
