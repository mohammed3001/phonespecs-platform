"use client";

import { useEffect, useState } from "react";

interface CategoryVerdict {
  winner: string | "tie";
  phone1Score: number;
  phone2Score: number;
  explanation: string;
}

interface VerdictData {
  overallWinner: string | "tie";
  overallExplanation: string;
  categories: Record<string, CategoryVerdict>;
  phone1Strengths: string[];
  phone2Strengths: string[];
}

interface ComparisonVerdictProps {
  phone1Id: string;
  phone2Id: string;
  phone1Name: string;
  phone2Name: string;
}

const categoryLabels: Record<string, { label: string; icon: string }> = {
  camera: { label: "Camera", icon: "📷" },
  battery: { label: "Battery", icon: "🔋" },
  performance: { label: "Performance", icon: "⚡" },
  display: { label: "Display", icon: "📱" },
  design: { label: "Design", icon: "✨" },
};

export default function ComparisonVerdict({
  phone1Id,
  phone2Id,
  phone1Name,
  phone2Name,
}: ComparisonVerdictProps) {
  const [verdict, setVerdict] = useState<VerdictData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/compare/verdict?phone1=${phone1Id}&phone2=${phone2Id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setVerdict(json.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [phone1Id, phone2Id]);

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-4" />
        <div className="space-y-4">
          <div className="h-16 bg-gray-100 rounded-xl" />
          <div className="h-12 bg-gray-100 rounded-xl" />
          <div className="h-12 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!verdict) return null;

  const winnerName =
    verdict.overallWinner === phone1Id
      ? phone1Name
      : verdict.overallWinner === phone2Id
        ? phone2Name
        : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Overall Verdict */}
      <div className={`px-6 py-5 ${
        verdict.overallWinner === "tie"
          ? "bg-gradient-to-r from-amber-50 to-orange-50"
          : "bg-gradient-to-r from-emerald-50 to-teal-50"
      }`}>
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
          </svg>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg">Verdict</h3>
        </div>
        {verdict.overallWinner === "tie" ? (
          <p className="text-amber-800 font-semibold">
            It&apos;s a tie! Both phones have different strengths.
          </p>
        ) : (
          <p className="text-emerald-800 font-semibold">
            {winnerName} wins overall
          </p>
        )}
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{verdict.overallExplanation}</p>
      </div>

      {/* Category Breakdown */}
      <div className="px-6 py-5 space-y-4">
        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category Breakdown</h4>
        {Object.entries(verdict.categories).map(([key, cat]) => {
          const meta = categoryLabels[key] || { label: key, icon: "📊" };
          const phone1Wins = cat.winner === phone1Id;
          const phone2Wins = cat.winner === phone2Id;
          const isTie = cat.winner === "tie";

          return (
            <div key={key} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{meta.icon}</span>
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{meta.label}</span>
                </div>
                {isTie ? (
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Tie</span>
                ) : (
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    phone1Wins ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20" : "text-violet-600 bg-violet-50"
                  }`}>
                    {phone1Wins ? phone1Name : phone2Name} wins
                  </span>
                )}
              </div>

              {/* Score Bars */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-12 text-gray-400 text-right truncate">{phone1Name.split(" ").pop()}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${phone1Wins ? "bg-blue-500" : "bg-gray-300"}`}
                      style={{ width: `${cat.phone1Score}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 w-8">{cat.phone1Score}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] w-12 text-gray-400 text-right truncate">{phone2Name.split(" ").pop()}</span>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${phone2Wins ? "bg-violet-500" : "bg-gray-300"}`}
                      style={{ width: `${cat.phone2Score}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 w-8">{cat.phone2Score}%</span>
                </div>
              </div>

              <p className="text-[11px] text-gray-400">{cat.explanation}</p>
            </div>
          );
        })}
      </div>

      {/* Strengths Summary */}
      <div className="grid grid-cols-2 border-t">
        <div className="px-5 py-4 border-r">
          <h5 className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-2">
            {phone1Name.split(" ").slice(-2).join(" ")} Wins
          </h5>
          {verdict.phone1Strengths.length > 0 ? (
            <ul className="space-y-1">
              {verdict.phone1Strengths.map((s, i) => (
                <li key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-blue-400 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400">No clear advantages</p>
          )}
        </div>
        <div className="px-5 py-4">
          <h5 className="text-[10px] font-bold text-violet-600 uppercase tracking-widest mb-2">
            {phone2Name.split(" ").slice(-2).join(" ")} Wins
          </h5>
          {verdict.phone2Strengths.length > 0 ? (
            <ul className="space-y-1">
              {verdict.phone2Strengths.map((s, i) => (
                <li key={i} className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-violet-400 flex-shrink-0" />
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-gray-400">No clear advantages</p>
          )}
        </div>
      </div>
    </div>
  );
}
