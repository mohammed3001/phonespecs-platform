"use client";

import { useEffect, useState } from "react";

interface SpecIQBadge {
  specKey: string;
  specName: string;
  category: string;
  value: number;
  unit: string;
  percentile: number;
  rank: number;
  totalPhones: number;
  badge: string;
  tier: "exceptional" | "great" | "good" | "average" | "below_average";
  icon: string;
}

interface SpecIQData {
  overallScore: number;
  tier: string;
  tierLabel: string;
  badges: SpecIQBadge[];
  topStrengths: SpecIQBadge[];
  priceTier: string;
  valueScore: number;
}

const tierColors: Record<string, { bg: string; text: string; ring: string; bar: string }> = {
  exceptional: { bg: "bg-emerald-50", text: "text-emerald-700", ring: "ring-emerald-200", bar: "bg-emerald-500" },
  great: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700", ring: "ring-blue-200", bar: "bg-blue-500" },
  good: { bg: "bg-amber-50", text: "text-amber-700", ring: "ring-amber-200", bar: "bg-amber-500" },
  average: { bg: "bg-gray-50 dark:bg-gray-900", text: "text-gray-600 dark:text-gray-300", ring: "ring-gray-200", bar: "bg-gray-400" },
  below_average: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-600", ring: "ring-red-200", bar: "bg-red-400" },
};

const categoryIcons: Record<string, string> = {
  camera: "📷",
  battery: "🔋",
  performance: "⚡",
  display: "📱",
  design: "✨",
};

export default function SpecIQPanel({ phoneId }: { phoneId: string }) {
  const [data, setData] = useState<SpecIQData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    fetch(`/api/spec-iq?phoneId=${phoneId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [phoneId]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-5 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-24 mb-4" />
        <div className="space-y-3">
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="h-8 bg-gray-100 rounded-xl" />
          <div className="h-8 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  const overallColors = tierColors[data.tier] || tierColors.average;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className={`px-5 py-4 ${overallColors.bg} border-b ${overallColors.ring}`}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm flex items-center gap-1.5">
              <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Spec IQ
            </h3>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">How this phone compares</p>
          </div>
          <div className="text-right">
            <div className={`text-2xl font-extrabold ${overallColors.text}`}>
              {data.overallScore}
            </div>
            <div className={`text-[10px] font-semibold uppercase tracking-wider ${overallColors.text}`}>
              {data.tierLabel}
            </div>
          </div>
        </div>

        {/* Overall Score Bar */}
        <div className="mt-3 h-2 bg-gray-200/60 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-700 ${overallColors.bar}`}
            style={{ width: `${data.overallScore}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[9px] text-gray-400">
          <span>0</span>
          <span>{data.priceTier} tier</span>
          <span>100</span>
        </div>
      </div>

      {/* Top Strengths */}
      <div className="px-5 py-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Top Strengths</h4>
        <div className="space-y-2.5">
          {data.topStrengths.map((badge) => {
            const colors = tierColors[badge.tier] || tierColors.average;
            return (
              <div key={badge.specKey} className="flex items-center gap-3">
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-sm">
                  {categoryIcons[badge.category] || "📊"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-200 truncate">{badge.specName}</span>
                    <span className={`text-[10px] font-bold ${colors.text}`}>
                      {badge.percentile >= 75 ? `Top ${100 - badge.percentile}%` : `${badge.percentile}%`}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colors.bar}`}
                      style={{ width: `${badge.percentile}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {badge.value}{badge.unit ? ` ${badge.unit}` : ""} · #{badge.rank} of {badge.totalPhones}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expandable Full Breakdown */}
      {data.badges.length > 3 && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full px-5 py-2.5 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20/50 transition-all flex items-center justify-center gap-1 border-t border-gray-100"
          >
            {expanded ? "Show Less" : `View All ${data.badges.length} Specs`}
            <svg
              className={`w-3.5 h-3.5 transition-transform ${expanded ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {expanded && (
            <div className="px-5 pb-4 space-y-2 border-t border-gray-100 pt-3">
              {data.badges.slice(3).map((badge) => {
                const colors = tierColors[badge.tier] || tierColors.average;
                return (
                  <div key={badge.specKey} className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-md bg-gray-50 dark:bg-gray-900 flex items-center justify-center text-[10px]">
                      {categoryIcons[badge.category] || "📊"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-gray-600 dark:text-gray-300">{badge.specName}</span>
                        <span className={`text-[10px] font-bold ${colors.text}`}>{badge.percentile}%</span>
                      </div>
                      <div className="h-1 bg-gray-100 rounded-full overflow-hidden mt-0.5">
                        <div
                          className={`h-full rounded-full ${colors.bar}`}
                          style={{ width: `${badge.percentile}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Value Score */}
      <div className="px-5 py-3 bg-gradient-to-r from-blue-50 to-violet-50 border-t">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-gray-600 dark:text-gray-300">Value Score</span>
          <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">
            {data.valueScore}/100
          </span>
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5">
          Specs relative to {data.priceTier} price tier
        </p>
      </div>
    </div>
  );
}
