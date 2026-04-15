"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Icon } from "@iconify/react";

interface ReviewFormProps {
  phoneId: string;
  phoneName: string;
}

interface SessionUser {
  name?: string;
  email?: string;
  id?: string;
}

export default function ReviewForm({ phoneId, phoneName }: ReviewFormProps) {
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    content: "",
    overallScore: 7,
    pros: "",
    cons: "",
  });

  useEffect(() => {
    fetch("/api/auth/session")
      .then((r) => r.json())
      .then((data) => {
        if (data?.user) {
          setSessionUser(data.user);
        }
        setSessionLoading(false);
      })
      .catch(() => setSessionLoading(false));
  }, []);

  if (sessionLoading) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-2" />
          <div className="h-3 bg-gray-200 rounded w-1/2 mx-auto" />
        </div>
      </div>
    );
  }

  if (!sessionUser) {
    return (
      <div className="bg-gray-50 rounded-xl border border-gray-200 p-6 text-center">
        <Icon icon="mdi:account-circle" className="w-10 h-10 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-600 mb-3">
          Sign in to write a review for {phoneName}
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white text-gray-700 text-sm font-medium rounded-lg border hover:bg-gray-50 transition-colors"
          >
            Create Account
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-6 text-center">
        <Icon icon="mdi:check-circle" className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
        <p className="text-sm font-medium text-emerald-800 mb-1">Review Submitted!</p>
        <p className="text-xs text-emerald-600">
          Your review is pending approval and will appear once our team verifies it.
        </p>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, phoneId }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit review");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors"
      >
        <Icon icon="mdi:pencil" className="w-5 h-5" />
        Write a Review
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-bold text-gray-900">Write Your Review</h3>
        <button type="button" onClick={() => setIsOpen(false)} className="text-gray-400 hover:text-gray-600">
          <Icon icon="mdi:close" className="w-5 h-5" />
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">{error}</div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
        <input
          type="text"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
          maxLength={200}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          placeholder="Sum up your experience..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Overall Score: <span className="text-blue-600 font-bold">{form.overallScore}/10</span>
        </label>
        <input
          type="range"
          min="1"
          max="10"
          step="1"
          value={form.overallScore}
          onChange={(e) => setForm({ ...form, overallScore: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-200 rounded-lg cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>Poor</span>
          <span>Average</span>
          <span>Excellent</span>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
        <textarea
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
          required
          minLength={20}
          maxLength={5000}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          placeholder="Share your detailed experience with this phone..."
        />
        <p className="text-xs text-gray-400 mt-1">{form.content.length}/5000 characters (min 20)</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Pros</label>
          <textarea
            value={form.pros}
            onChange={(e) => setForm({ ...form, pros: e.target.value })}
            rows={2}
            maxLength={1000}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="What's great about it?"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Cons</label>
          <textarea
            value={form.cons}
            onChange={(e) => setForm({ ...form, cons: e.target.value })}
            rows={2}
            maxLength={1000}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
            placeholder="Any drawbacks?"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={loading || form.content.length < 20}
          className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <>
              <Icon icon="mdi:loading" className="w-4 h-4 animate-spin" />
              Submitting...
            </>
          ) : (
            <>
              <Icon icon="mdi:send" className="w-4 h-4" />
              Submit Review
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="px-4 py-2.5 text-sm text-gray-600 hover:text-gray-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
